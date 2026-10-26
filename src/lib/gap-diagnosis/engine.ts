import {
  SyllabusTopic,
  TopicDiagnosis,
  QuizAttempt,
  SourceCitation,
  ProficiencyStatus,
} from '../types';

export interface TopicUpdateResult {
  updatedTopics: SyllabusTopic[];
  updatedDiagnoses: TopicDiagnosis[];
}

/**
 * Calculates updated topic scores, proficiency statuses, diagnostic rationales,
 * student-grounded misconceptions, and genuine PDF citations following a quiz attempt.
 */
export function processQuizAttemptForTopics(
  topics: SyllabusTopic[],
  diagnoses: TopicDiagnosis[],
  attempt: QuizAttempt
): TopicUpdateResult {
  if (!attempt.answers || attempt.questions.length === 0) {
    return { updatedTopics: topics, updatedDiagnoses: diagnoses };
  }

  // Group questions and answers by topic
  const topicStats: Record<
    string,
    {
      topicName: string;
      totalScore: number;
      questionCount: number;
      correctCount: number;
      mistakes: string[];
      missedConcepts: string[];
      masteredConcepts: string[];
      citations: SourceCitation[];
      attemptQuestions: typeof attempt.questions;
    }
  > = {};

  attempt.questions.forEach((q) => {
    const ans = attempt.answers?.[q.id];
    if (!topicStats[q.topicId]) {
      topicStats[q.topicId] = {
        topicName: q.topicName,
        totalScore: 0,
        questionCount: 0,
        correctCount: 0,
        mistakes: [],
        missedConcepts: [],
        masteredConcepts: [],
        citations: [],
        attemptQuestions: [],
      };
    }

    const stat = topicStats[q.topicId];
    stat.questionCount += 1;
    stat.attemptQuestions.push(q);

    if (ans) {
      stat.totalScore += ans.score;
      if (ans.isCorrect || ans.score >= 70) {
        stat.correctCount += 1;
        stat.masteredConcepts.push(q.questionText.slice(0, 80) + '...');
      } else {
        if (ans.aiFeedback) {
          stat.mistakes.push(ans.aiFeedback);
        }
        if (ans.keyConceptsMissed && ans.keyConceptsMissed.length > 0) {
          stat.missedConcepts.push(...ans.keyConceptsMissed);
        }
      }
    }

    // Capture verified source citations from the quiz questions
    if (q.sourceCitation) {
      const alreadyHas = stat.citations.some(
        (c) =>
          c.documentTitle === q.sourceCitation.documentTitle &&
          c.pageNumber === q.sourceCitation.pageNumber
      );
      if (!alreadyHas) {
        stat.citations.push(q.sourceCitation);
      }
    }
  });

  // Calculate updated topics
  const updatedTopics: SyllabusTopic[] = topics.map((top) => {
    const stats = topicStats[top.id];
    if (!stats) return top;

    const previousAttempts = top.questionsAttempted || 0;
    const newAttempts = stats.questionCount;
    const updatedAttempted = previousAttempts + newAttempts;

    // Cumulative weighted scoring formula
    const updatedScore = Math.round(
      (top.latestScore * previousAttempts + stats.totalScore) / updatedAttempted
    );

    // Determine status using configurable thresholds
    let newStatus: ProficiencyStatus = top.status;
    if (updatedAttempted < top.recommendedThresholds.minQuestionsForConfidence) {
      newStatus = 'insufficient_data';
    } else if (updatedScore < top.recommendedThresholds.weakMax) {
      newStatus = 'weak';
    } else if (updatedScore < top.recommendedThresholds.mediumMax) {
      newStatus = 'medium';
    } else {
      newStatus = 'strong';
    }

    return {
      ...top,
      questionsAttempted: updatedAttempted,
      latestScore: updatedScore,
      status: newStatus,
    };
  });

  // Calculate updated diagnoses in complete synchronization with topics
  const updatedDiagnoses: TopicDiagnosis[] = updatedTopics.map((top) => {
    const existingDiag = diagnoses.find((d) => d.topicId === top.id);
    const stats = topicStats[top.id];

    // If this topic was not in the recent quiz attempt, preserve existing diagnosis
    // but ensure score and status are strictly aligned with topic!
    if (!stats) {
      if (existingDiag) {
        return {
          ...existingDiag,
          score: top.latestScore,
          status: top.status,
          questionsAttempted: top.questionsAttempted,
        };
      }
      return createDefaultDiagnosis(top);
    }

    // If this topic was assessed, dynamically synthesize rationale and misconceptions
    const recentAvg = Math.round(stats.totalScore / stats.questionCount);
    const isRecentPerfect = stats.correctCount === stats.questionCount;
    const isRecentFail = stats.correctCount === 0;

    let dynamicReason = '';
    let commonMistakes: string[] = [];
    let recommendedAction = '';

    if (top.status === 'insufficient_data') {
      dynamicReason = `Assessed ${top.questionsAttempted} question(s) so far. Minimum ${top.recommendedThresholds.minQuestionsForConfidence} questions required to establish statistically reliable proficiency.`;
      recommendedAction = `Take ${top.recommendedThresholds.minQuestionsForConfidence - top.questionsAttempted} more question(s) to verify baseline understanding.`;
      commonMistakes = stats.mistakes.length > 0 ? stats.mistakes : (existingDiag?.commonMistakes || []);
    } else if (top.status === 'weak') {
      dynamicReason = `Critical knowledge gap diagnosed (${top.latestScore}% overall across ${top.questionsAttempted} questions). Recent attempt scored ${recentAvg}%. Student showed persistent difficulties on core formulas and layer behavior.`;
      recommendedAction = `Immediate remediation: review cited sections in ${stats.citations[0]?.documentTitle || 'course reader'} and retake targeted diagnostic quiz.`;
      commonMistakes = stats.mistakes.length > 0
        ? Array.from(new Set([...stats.mistakes, ...stats.missedConcepts]))
        : (existingDiag?.commonMistakes || []);
    } else if (top.status === 'medium') {
      if (recentAvg >= 75) {
        dynamicReason = `Proficiency elevated to Developing (${top.latestScore}% cumulative). Strong performance on latest quiz (${recentAvg}%), successfully resolving prior misconceptions.`;
        commonMistakes = stats.mistakes.length > 0
          ? stats.mistakes
          : ['Prior misconceptions resolved in latest assessment. Consolidating advanced edge cases.'];
      } else {
        dynamicReason = `Developing conceptual understanding (${top.latestScore}% across ${top.questionsAttempted} questions). Core principles are understood, but partial misconceptions remain on specific mathematical definitions.`;
        commonMistakes = stats.mistakes.length > 0
          ? Array.from(new Set([...stats.mistakes, ...stats.missedConcepts]))
          : (existingDiag?.commonMistakes || ['Minor inaccuracies on edge case derivations.']);
      }
      recommendedAction = `Targeted practice: solve 3-5 practice problems to advance mastery from Medium (${top.latestScore}%) into Strong tier (>${top.recommendedThresholds.mediumMax}%).`;
    } else {
      // Strong topic
      dynamicReason = `Mastery confirmed with ${top.latestScore}% proficiency across ${top.questionsAttempted} assessed questions. Demonstrated robust accuracy on both multiple-choice derivations and conceptual explanations.`;
      recommendedAction = `Mastery achieved. Maintain long-term retention with scheduled spaced-repetition checks prior to exam.`;
      commonMistakes = stats.mistakes.length > 0
        ? stats.mistakes
        : ['No active misconceptions detected in recent assessments.'];
    }

    // Merge verifiable source citations
    const combinedCitations: SourceCitation[] = [...stats.citations];
    if (existingDiag?.sourceReferences) {
      existingDiag.sourceReferences.forEach((ref) => {
        if (!combinedCitations.some((c) => c.documentTitle === ref.documentTitle && c.pageNumber === ref.pageNumber)) {
          combinedCitations.push(ref);
        }
      });
    }

    return {
      topicId: top.id,
      topicName: top.name,
      status: top.status,
      score: top.latestScore,
      questionsAttempted: top.questionsAttempted,
      reason: dynamicReason,
      commonMistakes: commonMistakes.slice(0, 4),
      recommendedAction,
      sourceReferences: combinedCitations.slice(0, 3),
    };
  });

  return {
    updatedTopics,
    updatedDiagnoses,
  };
}

function createDefaultDiagnosis(topic: SyllabusTopic): TopicDiagnosis {
  return {
    topicId: topic.id,
    topicName: topic.name,
    status: topic.status,
    score: topic.latestScore,
    questionsAttempted: topic.questionsAttempted,
    reason: `Grounded quiz accuracy averages ${topic.latestScore}% across ${topic.questionsAttempted} questions.`,
    commonMistakes: [],
    recommendedAction: topic.status === 'weak' ? 'Remediate fundamental concepts.' : 'Continue regular revision.',
    sourceReferences: [],
  };
}
