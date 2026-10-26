-- ====================================================================
-- GapFinder AI - Supabase PostgreSQL Database Schema
-- Includes pgvector extension for Document Retrieval-Augmented Generation
-- ====================================================================

-- 1. Enable the pgvector extension to store and search vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    exam_date DATE,
    daily_study_minutes INTEGER DEFAULT 45,
    subject TEXT DEFAULT 'Deep Learning',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Uploaded Study Documents
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_type TEXT NOT NULL,
    status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
    chunk_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Document Chunks with Vector Embeddings (Gemini 768 dimensions)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb, -- contains { pageNumber, sectionTitle, sourceDocument, topicTag }
    embedding VECTOR(768),                       -- Google text-embedding-004 output dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create an HNSW or IVFFlat index for fast vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- 6. Syllabus Topics
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY, -- e.g., 'topic-cnn'
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    short_code TEXT NOT NULL,
    description TEXT NOT NULL,
    related_sections TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'insufficient_data' CHECK (status IN ('weak', 'medium', 'strong', 'insufficient_data')),
    latest_score NUMERIC DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    weak_threshold INTEGER DEFAULT 50,
    medium_threshold INTEGER DEFAULT 75,
    min_confidence_questions INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Diagnostic Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    topic_ids TEXT[] NOT NULL,
    total_questions INTEGER NOT NULL,
    score NUMERIC,
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('draft', 'in_progress', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Quiz Questions Grounded in Chunks
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'short_answer')),
    options JSONB, -- list of strings for MCQ
    correct_answer TEXT NOT NULL, -- kept securely on server until evaluated
    explanation TEXT NOT NULL,
    source_citation JSONB NOT NULL, -- { documentTitle, pageNumber, sectionTitle, snippet }
    rubric JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Student Answers & AI Evaluation
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    student_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score NUMERIC NOT NULL, -- 0 to 100
    ai_feedback TEXT NOT NULL,
    key_concepts_missed TEXT[] DEFAULT '{}',
    correct_concept_summary TEXT NOT NULL,
    source_citation JSONB NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Topic Performance & Gap Diagnoses
CREATE TABLE IF NOT EXISTS public.topic_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('weak', 'medium', 'strong', 'insufficient_data')),
    score NUMERIC NOT NULL,
    questions_attempted INTEGER NOT NULL,
    reason TEXT NOT NULL,
    common_mistakes TEXT[] DEFAULT '{}',
    recommended_action TEXT NOT NULL,
    source_references JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Revision Plans & Tasks
CREATE TABLE IF NOT EXISTS public.revision_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    exam_date DATE NOT NULL,
    daily_study_minutes INTEGER NOT NULL DEFAULT 45,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.revision_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID REFERENCES public.revision_plans(id) ON DELETE CASCADE NOT NULL,
    topic_id TEXT NOT NULL,
    topic_name TEXT NOT NULL,
    day_number INTEGER NOT NULL,
    scheduled_date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    estimated_minutes INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    source_reference JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- RAG Vector Search Function
-- Finds the most relevant document chunks for a given query embedding
-- ====================================================================
CREATE OR REPLACE FUNCTION match_document_chunks (
    query_embedding VECTOR(768),
    match_threshold FLOAT,
    match_count INT,
    filter_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    chunk_index INT,
    content TEXT,
    metadata JSONB,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.chunk_index,
        dc.content,
        dc.metadata,
        1 - (dc.embedding <=> query_embedding) AS similarity
    FROM public.document_chunks dc
    WHERE (filter_user_id IS NULL OR dc.user_id = filter_user_id)
      AND 1 - (dc.embedding <=> query_embedding) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ====================================================================
-- Row Level Security (RLS)
-- Protect user documents, questions, and revision plans
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_tasks ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Documents: users can only manage their own documents
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Document chunks: users can access chunks belonging to their documents
CREATE POLICY "Users can view own chunks" ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chunks" ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Quizzes: users can only view their own quizzes
CREATE POLICY "Users can view own quizzes" ON public.quizzes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quizzes" ON public.quizzes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quizzes" ON public.quizzes FOR UPDATE USING (auth.uid() = user_id);
