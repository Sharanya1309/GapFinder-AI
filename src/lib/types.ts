export type ProficiencyStatus = 'weak' | 'medium' | 'strong' | 'insufficient_data';

export type QuestionType = 'mcq' | 'short_answer';

export interface SourceCitation {
  documentTitle: string;
  pageNumber: number;
  sectionTitle: string;
  snippet?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  examDate: string;
  dailyStudyMinutes: number;
  subject: string;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  status: 'processing' | 'ready' | 'error';
  chunkCount: number;
  extractedTextPreview?: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  metadata: {
    pageNumber: number;
    sectionTitle: string;
    sourceDocument: string;
    topicTag?: string;
  };
  embedding?: number[];
}

export interface SyllabusTopic {
  id: string;
  name: string;
  shortCode: string;
  description: string;
  relatedSections: string[];
  status: ProficiencyStatus;
  latestScore: number;
  questionsAttempted: number;
  recommendedThresholds: {
    weakMax: number;   // default < 50
    mediumMax: number; // default < 75
    minQuestionsForConfidence: number; // default 3
  };
}

export interface QuestionRubric {
  keyPoints: string[];
  partialCreditCriteria?: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  topicId: string;
  topicName: string;
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // for MCQ
  correctAnswer: string; // secure, only evaluated on server/revealed after submit
  explanation: string;
  sourceCitation: SourceCitation;
  rubric?: QuestionRubric;
}

export interface StudentAnswerSubmission {
  questionId: string;
  studentAnswer: string;
}

export interface EvaluatedAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  score: number; // 0 to 100
  aiFeedback: string;
  keyConceptsMissed: string[];
  correctConceptSummary: string;
  sourceCitation: SourceCitation;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  title: string;
  topicIds: string[];
  topicNames: string[];
  totalQuestions: number;
  questions: QuizQuestion[];
  answers?: Record<string, EvaluatedAnswer>;
  score?: number; // average percentage
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface TopicDiagnosis {
  topicId: string;
  topicName: string;
  status: ProficiencyStatus;
  score: number;
  questionsAttempted: number;
  reason: string;
  commonMistakes: string[];
  recommendedAction: string;
  sourceReferences: SourceCitation[];
}

export interface RevisionTask {
  id: string;
  planId: string;
  topicId: string;
  topicName: string;
  dayNumber: number;
  scheduledDate: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedMinutes: number;
  isCompleted: boolean;
  sourceReference: SourceCitation;
}

export interface RevisionPlan {
  id: string;
  userId: string;
  examDate: string;
  dailyStudyMinutes: number;
  createdAt: string;
  updatedAt: string;
  tasks: RevisionTask[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: SourceCitation[];
  grounded: boolean;
}
