import { 
  SyllabusTopic, 
  UploadedDocument, 
  DocumentChunk, 
  QuizAttempt, 
  TopicDiagnosis, 
  RevisionPlan, 
  UserProfile 
} from '../types';

export const DEMO_USER: UserProfile = {
  id: 'judge-demo-user-01',
  email: 'judge@gapfinder.ai',
  fullName: 'Dr. Alex Rivera (Hackathon Judge)',
  examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
  dailyStudyMinutes: 45,
  subject: 'Deep Learning (CS-682)',
};

export const INITIAL_TOPICS: SyllabusTopic[] = [
  {
    id: 'topic-ann',
    name: 'Artificial Neural Networks (ANN)',
    shortCode: 'ANN',
    description: 'Foundations of Perceptrons, Multi-Layer Perceptrons (MLP), Activation Functions (Sigmoid, ReLU), Backpropagation, Gradient Descent, and Loss Functions.',
    relatedSections: ['Module 1.1: Perceptron Calculus', 'Module 1.2: Chain Rule & Backpropagation', 'Module 1.3: Vanishing Gradients'],
    status: 'strong',
    latestScore: 90,
    questionsAttempted: 10,
    recommendedThresholds: { weakMax: 50, mediumMax: 75, minQuestionsForConfidence: 3 },
  },
  {
    id: 'topic-cnn',
    name: 'Convolutional Neural Networks (CNN)',
    shortCode: 'CNN',
    description: '2D Convolution operations, Kernel weights, Strides, Padding (Valid vs Same), Max Pooling, Feature Maps, Receptive Fields, and architectures (ResNet skip connections).',
    relatedSections: ['Module 2.1: Spatial Convolutions', 'Module 2.2: Receptive Field Calculation', 'Module 2.3: Pooling & Downsampling'],
    status: 'weak',
    latestScore: 40,
    questionsAttempted: 8,
    recommendedThresholds: { weakMax: 50, mediumMax: 75, minQuestionsForConfidence: 3 },
  },
  {
    id: 'topic-rnn',
    name: 'Recurrent Neural Networks (RNN)',
    shortCode: 'RNN',
    description: 'Sequential data processing, Hidden state recurrence, Backpropagation Through Time (BPTT), Exploding/Vanishing Gradients, LSTM cell gating (Forget, Input, Output), and GRUs.',
    relatedSections: ['Module 3.1: Sequence Modeling & BPTT', 'Module 3.2: Long Short-Term Memory Gates', 'Module 3.3: Gradient Clipping'],
    status: 'medium',
    latestScore: 65,
    questionsAttempted: 6,
    recommendedThresholds: { weakMax: 50, mediumMax: 75, minQuestionsForConfidence: 3 },
  },
  {
    id: 'topic-transformers',
    name: 'Transformers & Self-Attention',
    shortCode: 'Transformers',
    description: 'Self-Attention mechanism, Scaled Dot-Product Attention, Query-Key-Value projections, Multi-Head Attention, Positional Encodings, and Layer Normalization.',
    relatedSections: ['Module 4.1: Attention Is All You Need', 'Module 4.2: QKV Matrix Math', 'Module 4.3: Positional Embedding Vectors'],
    status: 'strong',
    latestScore: 80,
    questionsAttempted: 8,
    recommendedThresholds: { weakMax: 50, mediumMax: 75, minQuestionsForConfidence: 3 },
  },
  {
    id: 'topic-autoencoders',
    name: 'Autoencoders & Latent Space',
    shortCode: 'Autoencoders',
    description: 'Unsupervised dimensionality reduction, Encoder-Decoder architectures, Bottleneck latent representations, Reconstruction loss (MSE), and Variational Autoencoders (VAE) with KL Divergence.',
    relatedSections: ['Module 5.1: Bottleneck Representations', 'Module 5.2: Variational Inference & Reparameterization', 'Module 5.3: Denoising Autoencoders'],
    status: 'insufficient_data',
    latestScore: 0,
    questionsAttempted: 1, // Only 1 question attempted -> below confidence threshold of 3!
    recommendedThresholds: { weakMax: 50, mediumMax: 75, minQuestionsForConfidence: 3 },
  },
];

export const SAMPLE_DOCUMENTS: UploadedDocument[] = [
  {
    id: 'doc-dl-core',
    userId: 'judge-demo-user-01',
    title: 'Deep Learning: Foundations & Architectures (CS-682 Course Reader)',
    fileName: 'CS682_Deep_Learning_Course_Reader.pdf',
    fileSize: 4280000,
    fileType: 'application/pdf',
    uploadedAt: '2026-10-24T09:30:00Z',
    status: 'ready',
    chunkCount: 24,
    extractedTextPreview: 'CS-682 Graduate Deep Learning. Chapter 1: Optimization and Multilayer Perceptrons. Chapter 2: Convolutional Spatial Filters. Chapter 3: Recurrent Sequence Memory. Chapter 4: Self-Attention & Transformer Mechanisms. Chapter 5: Unsupervised Generative Latent Models.',
  },
  {
    id: 'doc-cnn-deepdive',
    userId: 'judge-demo-user-01',
    title: 'Specialized Notes: Convolution Operations, Feature Map Dimensions & Pooling',
    fileName: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
    fileSize: 1850000,
    fileType: 'application/pdf',
    uploadedAt: '2026-10-24T10:15:00Z',
    status: 'ready',
    chunkCount: 16,
    extractedTextPreview: 'Detailed mathematical treatment of spatial 2D convolution output size formula: O = floor((W - K + 2P)/S) + 1. Understanding stride, dilation, and pooling gradient propagation.',
  }
];

export const SAMPLE_CHUNKS: DocumentChunk[] = [
  {
    id: 'chunk-cnn-01',
    documentId: 'doc-cnn-deepdive',
    chunkIndex: 1,
    content: `Section 2.1: Mathematical Formulation of 2D Convolution Output Dimension
Given an input spatial dimension of width W, kernel size K, zero-padding P, and stride S, the output spatial dimension O is strictly given by:
O = floor((W - K + 2P) / S) + 1.
When padding is 'Valid' (P = 0), the feature map shrinks monotonically with each convolution layer: O = floor((W - K)/S) + 1.
When padding is 'Same' with stride S = 1, padding is selected as P = (K - 1) / 2 (for odd kernel size K) such that the output dimension matches the input dimension exactly (O = W).
Common Student Misconception: Confusing Valid padding with Same padding leads to incorrect layer dimension mismatches in deep convolutional stacks.`,
    metadata: {
      pageNumber: 14,
      sectionTitle: 'Section 2.1: Spatial Dimension Formula',
      sourceDocument: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
      topicTag: 'topic-cnn',
    }
  },
  {
    id: 'chunk-cnn-02',
    documentId: 'doc-cnn-deepdive',
    chunkIndex: 2,
    content: `Section 2.3: Receptive Field Calculation and Max Pooling
Max pooling selects the maximum value in each spatial window of size M x M. While max pooling introduces translation invariance and reduces spatial parameter footprint, it discards exact coordinate information.
In backpropagation, gradients during max pooling only flow back to the single neuron that achieved the maximum activation during the forward pass (the 'argmax' index); all other neurons in the pooling window receive zero gradient.
The receptive field of a neuron in layer L defines the spatial patch in the raw input image that influences that neuron's activation. Stacking small 3x3 kernels provides the same effective receptive field as a single 7x7 kernel while introducing more non-linearities and reducing the total number of parameters by 2.78x.`,
    metadata: {
      pageNumber: 19,
      sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field',
      sourceDocument: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
      topicTag: 'topic-cnn',
    }
  },
  {
    id: 'chunk-ann-01',
    documentId: 'doc-dl-core',
    chunkIndex: 4,
    content: `Chapter 1.2: Backpropagation and Vanishing Gradients in Deep Multilayer Perceptrons
Backpropagation computes the gradient of the scalar objective function L with respect to network weights W using the chain rule of multivariable calculus: dL/dW_l = dL/da_L * da_L/dz_L * dz_L/da_{L-1} ... da_l/dz_l * dz_l/dW_l.
When saturating activation functions like Sigmoid (sigma'(z) max = 0.25) or Tanh (tanh'(z) max = 1.0) are stacked across many layers, repeated multiplication of derivatives strictly less than 1 causes the gradient magnitude to decay exponentially toward zero as it propagates back to earlier layers.
This vanishing gradient problem prevents early hidden layers from learning effective representations. Solutions include ReLU activations, residual skip connections, and He/Xavier weight initialization.`,
    metadata: {
      pageNumber: 8,
      sectionTitle: 'Chapter 1.2: Chain Rule & Vanishing Gradients',
      sourceDocument: 'CS682_Deep_Learning_Course_Reader.pdf',
      topicTag: 'topic-ann',
    }
  },
  {
    id: 'chunk-rnn-01',
    documentId: 'doc-dl-core',
    chunkIndex: 9,
    content: `Chapter 3.2: Long Short-Term Memory (LSTM) Architecture
Standard vanilla RNNs suffer from vanishing gradients across long time horizons due to repeated multiplication by the recurrent weight matrix W_hh.
Hochreiter and Schmidhuber introduced LSTMs to create an uninterrupted constant error carousel via an explicit Cell State C_t.
The three canonical gates are:
1. Forget Gate f_t = sigma(W_f * [h_{t-1}, x_t] + b_f): controls what fraction of past cell state to purge.
2. Input Gate i_t = sigma(W_i * [h_{t-1}, x_t] + b_i) and candidate ~C_t = tanh(W_c * [h_{t-1}, x_t] + b_c): controls new information added.
3. Output Gate o_t = sigma(W_o * [h_{t-1}, x_t] + b_o): filters the updated cell state to produce hidden state h_t = o_t * tanh(C_t).
Gradient flow across time primarily follows the linear cell state update C_t = f_t * C_{t-1} + i_t * ~C_t, preventing premature exponential decay.`,
    metadata: {
      pageNumber: 32,
      sectionTitle: 'Chapter 3.2: LSTM Gating Mechanisms',
      sourceDocument: 'CS682_Deep_Learning_Course_Reader.pdf',
      topicTag: 'topic-rnn',
    }
  },
  {
    id: 'chunk-trans-01',
    documentId: 'doc-dl-core',
    chunkIndex: 14,
    content: `Chapter 4.1: Scaled Dot-Product Attention in Transformers
The core attention mechanism maps Query (Q), Key (K), and Value (V) matrices to an output:
Attention(Q, K, V) = softmax( (Q * K^T) / sqrt(d_k) ) * V.
The scaling factor 1 / sqrt(d_k) is critical: for large projection dimensions d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients.
Multi-Head Attention projects Q, K, and V into h different linear representation subspaces, allowing the model to jointly attend to information at different positions from distinct representation viewpoints.`,
    metadata: {
      pageNumber: 45,
      sectionTitle: 'Chapter 4.1: Scaled Dot-Product Attention',
      sourceDocument: 'CS682_Deep_Learning_Course_Reader.pdf',
      topicTag: 'topic-transformers',
    }
  },
  {
    id: 'chunk-ae-01',
    documentId: 'doc-dl-core',
    chunkIndex: 19,
    content: `Chapter 5.1: Autoencoders and Latent Manifolds
An autoencoder is a neural network trained to copy its input to its output: x' = g(f(x)), where f is an encoder mapping high-dimensional input x into a low-dimensional bottleneck code z, and g is a decoder mapping z back to input reconstruction space.
By constraining the dimension of z to be significantly smaller than x (undercomplete autoencoder), the network is forced to prioritize the most salient topological features of the data distribution.
The loss function is typically mean squared reconstruction error: L(x, g(f(x))) = ||x - g(f(x))||^2.
Variational Autoencoders (VAEs) augment this by modeling the latent space as a prior probability distribution p(z) ~ N(0, I) and optimizing the Evidence Lower Bound (ELBO) combining reconstruction loss with Kullback-Leibler (KL) divergence.`,
    metadata: {
      pageNumber: 61,
      sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO',
      sourceDocument: 'CS682_Deep_Learning_Course_Reader.pdf',
      topicTag: 'topic-autoencoders',
    }
  }
];

export const INITIAL_DIAGNOSES: TopicDiagnosis[] = [
  {
    topicId: 'topic-cnn',
    topicName: 'Convolutional Neural Networks (CNN)',
    status: 'weak',
    score: 40,
    questionsAttempted: 8,
    reason: 'Significant confusion regarding spatial dimension calculation formulas (O = (W-K+2P)/S + 1) and backward gradient routing in max-pooling layers. Frequently conflated Valid vs Same padding boundary conditions.',
    commonMistakes: [
      'Forgot to subtract kernel size before dividing by stride when calculating output feature map width.',
      'Assumed gradients distribute equally to all inputs of a max-pooling window rather than only to the maximum element.',
      'Failed to calculate how zero-padding modifies the receptive field of consecutive 3x3 convolution stacks.'
    ],
    recommendedAction: 'Focus on manual step-by-step spatial dimension derivations and review Section 2.1 & 2.3 of the CNN Notes.',
    sourceReferences: [
      {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 14,
        sectionTitle: 'Section 2.1: Spatial Dimension Formula'
      },
      {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 19,
        sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field'
      }
    ]
  },
  {
    topicId: 'topic-rnn',
    topicName: 'Recurrent Neural Networks (RNN)',
    status: 'medium',
    score: 65,
    questionsAttempted: 6,
    reason: 'Understands basic sequential recurrence and vanishing gradient intuition, but struggles to differentiate between the LSTM Forget Gate and Input Gate equations, and mistook hidden state h_t for cell state C_t.',
    commonMistakes: [
      'Confused the role of the Forget Gate (f_t) with the Input candidate modulation (~C_t).',
      'Overlooked that gradient propagation across the LSTM cell state involves additive updates rather than multiplicative matrix chains.'
    ],
    recommendedAction: 'Diagram the internal state flow of an LSTM cell and trace the error gradient through C_t vs h_t.',
    sourceReferences: [
      {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 32,
        sectionTitle: 'Chapter 3.2: LSTM Gating Mechanisms'
      }
    ]
  },
  {
    topicId: 'topic-ann',
    topicName: 'Artificial Neural Networks (ANN)',
    status: 'strong',
    score: 90,
    questionsAttempted: 10,
    reason: 'Mastery demonstrated across backpropagation calculus, chain rule decomposition, and gradient descent optimization methods.',
    commonMistakes: [
      'Minor arithmetic miscalculation on batch gradient averaging.'
    ],
    recommendedAction: 'Maintain mastery with brief spaced-repetition checks prior to final examination.',
    sourceReferences: [
      {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 8,
        sectionTitle: 'Chapter 1.2: Chain Rule & Vanishing Gradients'
      }
    ]
  },
  {
    topicId: 'topic-transformers',
    topicName: 'Transformers & Self-Attention',
    status: 'strong',
    score: 80,
    questionsAttempted: 8,
    reason: 'Clear understanding of Query-Key-Value attention formulation and why square root scaling prevents gradient vanishing in softmax.',
    commonMistakes: [
      'Small hesitation on positional encoding frequency formulas.'
    ],
    recommendedAction: 'Ready for advanced multi-modal or decoder-only causal mask architectures.',
    sourceReferences: [
      {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 45,
        sectionTitle: 'Chapter 4.1: Scaled Dot-Product Attention'
      }
    ]
  },
  {
    topicId: 'topic-autoencoders',
    topicName: 'Autoencoders & Latent Space',
    status: 'insufficient_data',
    score: 0,
    questionsAttempted: 1,
    reason: 'Only 1 question attempted (below the statistical confidence threshold of 3 questions). Classification pending diagnostic assessment.',
    commonMistakes: [],
    recommendedAction: 'Take the diagnostic quiz for Autoencoders (at least 3 questions) to evaluate comprehension.',
    sourceReferences: [
      {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 61,
        sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO'
      }
    ]
  }
];

export const INITIAL_REVISION_PLAN: RevisionPlan = {
  id: 'plan-judge-01',
  userId: 'judge-demo-user-01',
  examDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  dailyStudyMinutes: 45,
  createdAt: '2026-10-25T14:00:00Z',
  updatedAt: '2026-10-25T14:00:00Z',
  tasks: [
    {
      id: 'task-1',
      planId: 'plan-judge-01',
      topicId: 'topic-cnn',
      topicName: 'Convolutional Neural Networks (CNN)',
      dayNumber: 1,
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Remediate CNN Output Dimension Formula',
      description: 'Derive output spatial sizes for W=32, K=5, P=2, S=2. Contrast "Valid" vs "Same" padding behavior.',
      priority: 'high',
      estimatedMinutes: 25,
      isCompleted: false,
      sourceReference: {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 14,
        sectionTitle: 'Section 2.1: Spatial Dimension Formula',
      }
    },
    {
      id: 'task-2',
      planId: 'plan-judge-01',
      topicId: 'topic-cnn',
      topicName: 'Convolutional Neural Networks (CNN)',
      dayNumber: 1,
      scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Analyze Max-Pooling Gradient Routing',
      description: 'Trace how backprop gradients flow exclusively through the argmax index in a 2x2 pooling window.',
      priority: 'high',
      estimatedMinutes: 20,
      isCompleted: false,
      sourceReference: {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 19,
        sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field',
      }
    },
    {
      id: 'task-3',
      planId: 'plan-judge-01',
      topicId: 'topic-autoencoders',
      topicName: 'Autoencoders & Latent Space',
      dayNumber: 2,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Take Diagnostic Quiz on Autoencoders',
      description: 'Complete 3-5 questions on latent bottleneck representations to remove "Insufficient Data" status.',
      priority: 'high',
      estimatedMinutes: 20,
      isCompleted: false,
      sourceReference: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 61,
        sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO',
      }
    },
    {
      id: 'task-4',
      planId: 'plan-judge-01',
      topicId: 'topic-rnn',
      topicName: 'Recurrent Neural Networks (RNN)',
      dayNumber: 2,
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Dissect LSTM Forget & Input Gating Equations',
      description: 'Review the sigmoid gating of past memory vs tanh candidate addition. Solve 3 targeted practice questions.',
      priority: 'medium',
      estimatedMinutes: 25,
      isCompleted: false,
      sourceReference: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 32,
        sectionTitle: 'Chapter 3.2: LSTM Gating Mechanisms',
      }
    },
    {
      id: 'task-5',
      planId: 'plan-judge-01',
      topicId: 'topic-cnn',
      topicName: 'Convolutional Neural Networks (CNN)',
      dayNumber: 3,
      scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'CNN Re-Assessment Quiz',
      description: 'Take a 5-question targeted CNN diagnostic quiz to verify if score rises above 50% threshold.',
      priority: 'high',
      estimatedMinutes: 25,
      isCompleted: false,
      sourceReference: {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 14,
        sectionTitle: 'Section 2.1: Spatial Dimension Formula',
      }
    },
    {
      id: 'task-6',
      planId: 'plan-judge-01',
      topicId: 'topic-transformers',
      topicName: 'Transformers & Self-Attention',
      dayNumber: 4,
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      title: 'Review Scaled Dot-Product Softmax Saturation',
      description: 'Quick 15-minute concept refresh on d_k scaling and multi-head projection matrices.',
      priority: 'low',
      estimatedMinutes: 15,
      isCompleted: true, // Marked as done to demonstrate progress tracking
      sourceReference: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 45,
        sectionTitle: 'Chapter 4.1: Scaled Dot-Product Attention',
      }
    }
  ]
};

export const SAMPLE_RECENT_QUIZZES: QuizAttempt[] = [
  {
    id: 'quiz-attempt-cnn-01',
    userId: 'judge-demo-user-01',
    title: 'Diagnostic Quiz #1: Convolutional Neural Networks',
    topicIds: ['topic-cnn'],
    topicNames: ['Convolutional Neural Networks (CNN)'],
    totalQuestions: 5,
    score: 40,
    status: 'completed',
    createdAt: '2026-10-25T11:20:00Z',
    completedAt: '2026-10-25T11:34:00Z',
    questions: [
      {
        id: 'q-cnn-1',
        quizId: 'quiz-attempt-cnn-01',
        topicId: 'topic-cnn',
        topicName: 'Convolutional Neural Networks (CNN)',
        questionText: 'Given an input feature map of dimensions 32x32, a convolutional kernel of size 5x5, padding P = 0 ("Valid"), and stride S = 1, what is the spatial dimension of the resulting output feature map?',
        questionType: 'mcq',
        options: ['28x28', '32x32', '27x27', '30x30'],
        correctAnswer: '28x28',
        explanation: 'Using the spatial formula O = floor((W - K + 2P)/S) + 1: O = floor((32 - 5 + 0)/1) + 1 = 27 + 1 = 28.',
        sourceCitation: {
          documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
          pageNumber: 14,
          sectionTitle: 'Section 2.1: Spatial Dimension Formula',
          snippet: 'O = floor((W - K + 2P) / S) + 1. When padding is Valid (P = 0), O = floor((W - K)/S) + 1.'
        }
      },
      {
        id: 'q-cnn-2',
        quizId: 'quiz-attempt-cnn-01',
        topicId: 'topic-cnn',
        topicName: 'Convolutional Neural Networks (CNN)',
        questionText: 'During backpropagation through a Max-Pooling layer with a 2x2 window and stride 2, how are the incoming gradients distributed to the 4 input neurons in each window?',
        questionType: 'short_answer',
        correctAnswer: 'Gradients flow exclusively to the single neuron that had the maximum activation during the forward pass (the argmax index). All other 3 neurons receive a gradient of zero.',
        explanation: 'Max pooling is a non-linear routing operation; since only the maximum value influenced the forward pass activation, the partial derivative with respect to all non-maximal inputs is strictly 0.',
        sourceCitation: {
          documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
          pageNumber: 19,
          sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field',
          snippet: 'In backpropagation, gradients during max pooling only flow back to the single neuron that achieved the maximum activation during the forward pass; all other neurons receive zero gradient.'
        },
        rubric: {
          keyPoints: [
            'Mentions that only the maximum/argmax neuron receives gradient',
            'States that all non-maximal neurons receive zero gradient'
          ]
        }
      }
    ],
    answers: {
      'q-cnn-1': {
        questionId: 'q-cnn-1',
        studentAnswer: '27x27',
        isCorrect: false,
        score: 0,
        aiFeedback: 'Incorrect. You calculated (W - K)/S = 27 but forgot to add +1 at the end of the standard convolution dimension formula.',
        keyConceptsMissed: ['Forgot +1 term in spatial dimension formula: O = ((W - K + 2P)/S) + 1'],
        correctConceptSummary: 'The output dimension for 32 with kernel 5 and valid padding is (32 - 5)/1 + 1 = 28x28.',
        sourceCitation: {
          documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
          pageNumber: 14,
          sectionTitle: 'Section 2.1: Spatial Dimension Formula'
        }
      },
      'q-cnn-2': {
        questionId: 'q-cnn-2',
        studentAnswer: 'The gradient is divided equally by 4 among all 4 cells in the pooling filter.',
        isCorrect: false,
        score: 0,
        aiFeedback: 'Incorrect misconception. You described Average Pooling gradient behavior instead of Max Pooling. In Max Pooling, only the winning maximum neuron receives 100% of the gradient, while others receive 0.',
        keyConceptsMissed: ['Argmax gradient routing in max pooling', 'Differentiating average vs max pooling backpropagation'],
        correctConceptSummary: 'Gradients flow exclusively to the single maximum neuron; non-maximal elements receive zero gradient.',
        sourceCitation: {
          documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
          pageNumber: 19,
          sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field'
        }
      }
    }
  },
  {
    id: 'quiz-attempt-ann-01',
    userId: 'judge-demo-user-01',
    title: 'Diagnostic Quiz #2: Multilayer Perceptrons & Backpropagation',
    topicIds: ['topic-ann'],
    topicNames: ['Artificial Neural Networks (ANN)'],
    totalQuestions: 5,
    score: 90,
    status: 'completed',
    createdAt: '2026-10-24T16:10:00Z',
    completedAt: '2026-10-24T16:24:00Z',
    questions: []
  },
  {
    id: 'quiz-attempt-rnn-01',
    userId: 'judge-demo-user-01',
    title: 'Diagnostic Quiz #3: Sequential Models & LSTMs',
    topicIds: ['topic-rnn'],
    topicNames: ['Recurrent Neural Networks (RNN)'],
    totalQuestions: 4,
    score: 65,
    status: 'completed',
    createdAt: '2026-10-25T14:45:00Z',
    completedAt: '2026-10-25T15:02:00Z',
    questions: []
  }
];
