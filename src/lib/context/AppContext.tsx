"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  SyllabusTopic,
  UploadedDocument,
  DocumentChunk,
  QuizAttempt,
  TopicDiagnosis,
  RevisionPlan,
  RevisionTask,
} from '../types';
import {
  DEMO_USER,
  INITIAL_TOPICS,
  SAMPLE_DOCUMENTS,
  SAMPLE_CHUNKS,
  INITIAL_DIAGNOSES,
  INITIAL_REVISION_PLAN,
  SAMPLE_RECENT_QUIZZES,
} from '../demo/sample-data';
import { processQuizAttemptForTopics } from '../gap-diagnosis/engine';

interface AppContextType {
  user: UserProfile;
  topics: SyllabusTopic[];
  documents: UploadedDocument[];
  chunks: DocumentChunk[];
  quizzes: QuizAttempt[];
  diagnoses: TopicDiagnosis[];
  revisionPlan: RevisionPlan;
  isDemoMode: boolean;
  addDocument: (doc: UploadedDocument, newChunks: DocumentChunk[]) => void;
  deleteDocument: (docId: string) => void;
  submitQuizAttempt: (attempt: QuizAttempt) => void;
  toggleTaskCompletion: (taskId: string) => void;
  updateUserSettings: (examDate: string, dailyStudyMinutes: number) => void;
  recalculateRevisionPlan: () => void;
  resetToDemoData: () => void;
  updateTopicThresholds: (topicId: string, weakMax: number, mediumMax: number, minConfidence: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'gapfinder_v1_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<UserProfile>(DEMO_USER);
  const [topics, setTopics] = useState<SyllabusTopic[]>(INITIAL_TOPICS);
  const [documents, setDocuments] = useState<UploadedDocument[]>(SAMPLE_DOCUMENTS);
  const [chunks, setChunks] = useState<DocumentChunk[]>(SAMPLE_CHUNKS);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>(SAMPLE_RECENT_QUIZZES);
  const [diagnoses, setDiagnoses] = useState<TopicDiagnosis[]>(INITIAL_DIAGNOSES);
  const [revisionPlan, setRevisionPlan] = useState<RevisionPlan>(INITIAL_REVISION_PLAN);
  const [isDemoMode] = useState<boolean>(true);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(`${STORAGE_KEY_PREFIX}user`);
      const storedTopics = localStorage.getItem(`${STORAGE_KEY_PREFIX}topics`);
      const storedDocs = localStorage.getItem(`${STORAGE_KEY_PREFIX}docs`);
      const storedChunks = localStorage.getItem(`${STORAGE_KEY_PREFIX}chunks`);
      const storedQuizzes = localStorage.getItem(`${STORAGE_KEY_PREFIX}quizzes`);
      const storedDiagnoses = localStorage.getItem(`${STORAGE_KEY_PREFIX}diagnoses`);
      const storedPlan = localStorage.getItem(`${STORAGE_KEY_PREFIX}plan`);

      let loadedTopics: SyllabusTopic[] | null = null;
      let loadedDiagnoses: TopicDiagnosis[] | null = null;

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedTopics) {
        loadedTopics = JSON.parse(storedTopics);
        setTopics(loadedTopics!);
      }
      if (storedDocs) setDocuments(JSON.parse(storedDocs));
      if (storedChunks) setChunks(JSON.parse(storedChunks));
      if (storedQuizzes) setQuizzes(JSON.parse(storedQuizzes));
      if (storedDiagnoses) {
        loadedDiagnoses = JSON.parse(storedDiagnoses);
      }
      if (storedPlan) setRevisionPlan(JSON.parse(storedPlan));

      // Reconcile diagnoses with topics to ensure complete score & status consistency
      if (loadedTopics && loadedDiagnoses) {
        const alignedDiagnoses = loadedDiagnoses.map((d) => {
          const matchingTopic = loadedTopics!.find((t) => t.id === d.topicId);
          if (matchingTopic) {
            return {
              ...d,
              score: matchingTopic.latestScore,
              status: matchingTopic.status,
              questionsAttempted: matchingTopic.questionsAttempted,
            };
          }
          return d;
        });
        setDiagnoses(alignedDiagnoses);
      } else if (loadedDiagnoses) {
        setDiagnoses(loadedDiagnoses);
      }
    } catch (e) {
      console.warn('Failed to parse localStorage data:', e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}user`, JSON.stringify(user));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}topics`, JSON.stringify(topics));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}docs`, JSON.stringify(documents));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}chunks`, JSON.stringify(chunks));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}quizzes`, JSON.stringify(quizzes));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}diagnoses`, JSON.stringify(diagnoses));
      localStorage.setItem(`${STORAGE_KEY_PREFIX}plan`, JSON.stringify(revisionPlan));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [user, topics, documents, chunks, quizzes, diagnoses, revisionPlan, isInitialized]);

  const addDocument = (doc: UploadedDocument, newChunks: DocumentChunk[]) => {
    setDocuments((prev) => [doc, ...prev]);
    setChunks((prev) => [...prev, ...newChunks]);
  };

  const deleteDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    setChunks((prev) => prev.filter((c) => c.documentId !== docId));
  };

  const toggleTaskCompletion = (taskId: string) => {
    setRevisionPlan((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      ),
    }));
  };

  const updateUserSettings = (examDate: string, dailyStudyMinutes: number) => {
    setUser((prev) => ({ ...prev, examDate, dailyStudyMinutes }));
    setRevisionPlan((prev) => ({
      ...prev,
      examDate,
      dailyStudyMinutes,
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateTopicThresholds = (
    topicId: string,
    weakMax: number,
    mediumMax: number,
    minConfidence: number
  ) => {
    const newThresholds = { weakMax, mediumMax, minQuestionsForConfidence: minConfidence };

    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        let newStatus = t.status;
        if (t.questionsAttempted < minConfidence) {
          newStatus = 'insufficient_data';
        } else if (t.latestScore < weakMax) {
          newStatus = 'weak';
        } else if (t.latestScore < mediumMax) {
          newStatus = 'medium';
        } else {
          newStatus = 'strong';
        }
        return { ...t, recommendedThresholds: newThresholds, status: newStatus };
      })
    );

    // Keep diagnoses status and scores perfectly synchronized
    setDiagnoses((prev) =>
      prev.map((d) => {
        if (d.topicId !== topicId) return d;
        let newStatus = d.status;
        if (d.questionsAttempted < minConfidence) {
          newStatus = 'insufficient_data';
        } else if (d.score < weakMax) {
          newStatus = 'weak';
        } else if (d.score < mediumMax) {
          newStatus = 'medium';
        } else {
          newStatus = 'strong';
        }
        return { ...d, status: newStatus };
      })
    );
  };

  const submitQuizAttempt = (attempt: QuizAttempt) => {
    setQuizzes((prev) => [attempt, ...prev]);

    // Recalculate topic scores, diagnoses, misconceptions, and citations synchronously
    if (attempt.answers && attempt.questions.length > 0) {
      const { updatedTopics, updatedDiagnoses } = processQuizAttemptForTopics(
        topics,
        diagnoses,
        attempt
      );

      setTopics(updatedTopics);
      setDiagnoses(updatedDiagnoses);

      // Trigger automatic revision plan re-optimization with updated topics
      setTimeout(() => recalculateRevisionPlan(), 50);
    }
  };

  const recalculateRevisionPlan = () => {
    // Generate adaptive revision tasks prioritizing Weak, then Medium, then Strong review
    const now = new Date();
    const exam = new Date(user.examDate);
    const diffTime = Math.max(1, exam.getTime() - now.getTime());
    const daysAvailable = Math.min(30, Math.max(3, Math.ceil(diffTime / (1000 * 60 * 60 * 24))));

    const sortedTopics = [...topics].sort((a, b) => {
      const order = { weak: 0, insufficient_data: 1, medium: 2, strong: 3 };
      return order[a.status] - order[b.status];
    });

    const newTasks: RevisionTask[] = [];
    let currentDay = 1;

    sortedTopics.forEach((top) => {
      const relatedDoc = SAMPLE_DOCUMENTS[0]?.fileName || 'Course_Reader.pdf';
      const secRef = top.relatedSections[0] || 'Core Notes';

      if (top.status === 'weak') {
        newTasks.push({
          id: `task-remed-${top.id}-1`,
          planId: revisionPlan.id,
          topicId: top.id,
          topicName: top.name,
          dayNumber: currentDay,
          scheduledDate: new Date(Date.now() + currentDay * 86400000).toISOString().split('T')[0],
          title: `Remediate Fundamentals: ${top.name}`,
          description: `Deep-dive into misconceptions identified in diagnostic assessment. Review ${secRef}.`,
          priority: 'high',
          estimatedMinutes: 30,
          isCompleted: false,
          sourceReference: {
            documentTitle: relatedDoc,
            pageNumber: 14,
            sectionTitle: secRef,
          },
        });

        newTasks.push({
          id: `task-remed-${top.id}-2`,
          planId: revisionPlan.id,
          topicId: top.id,
          topicName: top.name,
          dayNumber: Math.min(daysAvailable, currentDay + 1),
          scheduledDate: new Date(Date.now() + (currentDay + 1) * 86400000).toISOString().split('T')[0],
          title: `Diagnostic Re-Quiz: ${top.shortCode}`,
          description: `Attempt 5 targeted questions to confirm mastery has risen past the 50% threshold.`,
          priority: 'high',
          estimatedMinutes: 20,
          isCompleted: false,
          sourceReference: {
            documentTitle: relatedDoc,
            pageNumber: 15,
            sectionTitle: secRef,
          },
        });
        currentDay = (currentDay % daysAvailable) + 1;
      } else if (top.status === 'insufficient_data') {
        newTasks.push({
          id: `task-diag-${top.id}`,
          planId: revisionPlan.id,
          topicId: top.id,
          topicName: top.name,
          dayNumber: currentDay,
          scheduledDate: new Date(Date.now() + currentDay * 86400000).toISOString().split('T')[0],
          title: `Initial Assessment: ${top.name}`,
          description: `Answer at least 3 diagnostic questions to establish statistical proficiency baseline.`,
          priority: 'high',
          estimatedMinutes: 20,
          isCompleted: false,
          sourceReference: {
            documentTitle: relatedDoc,
            pageNumber: 61,
            sectionTitle: secRef,
          },
        });
        currentDay = (currentDay % daysAvailable) + 1;
      } else if (top.status === 'medium') {
        newTasks.push({
          id: `task-med-${top.id}`,
          planId: revisionPlan.id,
          topicId: top.id,
          topicName: top.name,
          dayNumber: Math.min(daysAvailable, currentDay + 1),
          scheduledDate: new Date(Date.now() + (currentDay + 1) * 86400000).toISOString().split('T')[0],
          title: `Targeted Practice: ${top.name}`,
          description: `Address secondary edge cases and mathematical definitions in ${secRef}.`,
          priority: 'medium',
          estimatedMinutes: 25,
          isCompleted: false,
          sourceReference: {
            documentTitle: relatedDoc,
            pageNumber: 32,
            sectionTitle: secRef,
          },
        });
        currentDay = (currentDay % daysAvailable) + 1;
      } else {
        // Strong topic
        newTasks.push({
          id: `task-strong-${top.id}`,
          planId: revisionPlan.id,
          topicId: top.id,
          topicName: top.name,
          dayNumber: Math.min(daysAvailable, currentDay + 2),
          scheduledDate: new Date(Date.now() + (currentDay + 2) * 86400000).toISOString().split('T')[0],
          title: `Spaced Retention Check: ${top.shortCode}`,
          description: `Quick 10-minute flash review to solidify long-term recall prior to exam.`,
          priority: 'low',
          estimatedMinutes: 15,
          isCompleted: false,
          sourceReference: {
            documentTitle: relatedDoc,
            pageNumber: 8,
            sectionTitle: secRef,
          },
        });
      }
    });

    setRevisionPlan((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      tasks: newTasks,
    }));
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUser(DEMO_USER);
    setTopics(INITIAL_TOPICS);
    setDocuments(SAMPLE_DOCUMENTS);
    setChunks(SAMPLE_CHUNKS);
    setQuizzes(SAMPLE_RECENT_QUIZZES);
    setDiagnoses(INITIAL_DIAGNOSES);
    setRevisionPlan(INITIAL_REVISION_PLAN);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        topics,
        documents,
        chunks,
        quizzes,
        diagnoses,
        revisionPlan,
        isDemoMode,
        addDocument,
        deleteDocument,
        submitQuizAttempt,
        toggleTaskCompletion,
        updateUserSettings,
        recalculateRevisionPlan,
        resetToDemoData,
        updateTopicThresholds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
