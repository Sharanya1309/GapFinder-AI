import { QuizQuestion, DocumentChunk, QuestionType } from '../types';

export interface GenerateQuizParams {
  topicIds: string[];
  totalQuestions: number;
  questionTypePreference?: 'all' | 'mcq' | 'short_answer';
}

// Pool of grounded, high-quality questions for each Deep Learning topic with exact citations
const QUESTION_BANK: Record<string, QuizQuestion[]> = {
  'topic-cnn': [
    {
      id: 'qb-cnn-1',
      quizId: '',
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
      id: 'qb-cnn-2',
      quizId: '',
      topicId: 'topic-cnn',
      topicName: 'Convolutional Neural Networks (CNN)',
      questionText: 'During backpropagation through a Max-Pooling layer with a 2x2 window and stride 2, how are the incoming gradients distributed among the input neurons in that window?',
      questionType: 'short_answer',
      correctAnswer: 'Gradients flow exclusively to the single neuron that achieved the maximum activation during the forward pass (the argmax index). All other non-maximal neurons receive a gradient of zero.',
      explanation: 'Max pooling is a non-linear argmax routing operation; non-maximal inputs do not influence the forward activation, so their partial derivative is strictly 0.',
      sourceCitation: {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 19,
        sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field',
        snippet: 'In backpropagation, gradients during max pooling only flow back to the single neuron that achieved the maximum activation during the forward pass; all other neurons receive zero gradient.'
      },
      rubric: {
        keyPoints: [
          'Gradients route exclusively to the argmax/maximum neuron',
          'All other non-maximal neurons receive zero gradient'
        ]
      }
    },
    {
      id: 'qb-cnn-3',
      quizId: '',
      topicId: 'topic-cnn',
      topicName: 'Convolutional Neural Networks (CNN)',
      questionText: 'What is the primary computational benefit of stacking two consecutive 3x3 convolutional layers instead of using a single 5x5 convolutional layer?',
      questionType: 'mcq',
      options: [
        'Equal receptive field (5x5) with fewer parameters (18 vs 25) and an additional non-linear activation',
        'Guaranteed zero padding without border effects',
        'Direct removal of the need for pooling layers',
        'Invariance to 360-degree arbitrary rotations'
      ],
      correctAnswer: 'Equal receptive field (5x5) with fewer parameters (18 vs 25) and an additional non-linear activation',
      explanation: 'Two 3x3 convolutions cover a 5x5 receptive field while requiring 2 * (3*3) = 18 weights per channel, compared to 1 * (5*5) = 25 weights, and introduces a second activation function.',
      sourceCitation: {
        documentTitle: 'Module_2_CNN_Math_And_Receptive_Fields.pdf',
        pageNumber: 19,
        sectionTitle: 'Section 2.3: Pooling Backprop & Receptive Field',
        snippet: 'Stacking small 3x3 kernels provides the same effective receptive field as larger kernels while introducing more non-linearities and reducing parameter footprint.'
      }
    }
  ],
  'topic-autoencoders': [
    {
      id: 'qb-ae-1',
      quizId: '',
      topicId: 'topic-autoencoders',
      topicName: 'Autoencoders & Latent Space',
      questionText: 'What architectural feature forces an undercomplete autoencoder to learn a compressed, meaningful representation of the data distribution rather than a trivial identity mapping?',
      questionType: 'mcq',
      options: [
        'A bottleneck hidden layer with lower dimensionality than the input space',
        'A softmax classification layer at the output',
        'Zero-padding along temporal dimensions',
        'Negative learning rate scheduling'
      ],
      correctAnswer: 'A bottleneck hidden layer with lower dimensionality than the input space',
      explanation: 'By constraining the latent representation z to have dimension strictly smaller than x, the autoencoder cannot simply copy the input; it is forced to prioritize the principal factors of variation.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 61,
        sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO',
        snippet: 'By constraining the dimension of z to be significantly smaller than x (undercomplete autoencoder), the network is forced to prioritize the most salient topological features.'
      }
    },
    {
      id: 'qb-ae-2',
      quizId: '',
      topicId: 'topic-autoencoders',
      topicName: 'Autoencoders & Latent Space',
      questionText: 'In a Variational Autoencoder (VAE), what two distinct terms compose the Evidence Lower Bound (ELBO) objective function, and what role does each play?',
      questionType: 'short_answer',
      correctAnswer: 'The reconstruction loss (such as MSE or binary cross-entropy) measures how faithfully the decoded latent vector reproduces the input, while the Kullback-Leibler (KL) divergence regularizes the latent distribution toward a standard normal prior N(0, I).',
      explanation: 'ELBO combines reconstruction fidelity with a statistical penalty that enforces a continuous, smooth latent manifold suitable for generative sampling.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 61,
        sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO',
        snippet: 'Variational Autoencoders optimize the Evidence Lower Bound (ELBO) combining reconstruction loss with Kullback-Leibler (KL) divergence.'
      },
      rubric: {
        keyPoints: [
          'Reconstruction loss measures reproduction fidelity/accuracy of input',
          'Kullback-Leibler (KL) divergence regularizes latent space toward prior distribution'
        ]
      }
    },
    {
      id: 'qb-ae-3',
      quizId: '',
      topicId: 'topic-autoencoders',
      topicName: 'Autoencoders & Latent Space',
      questionText: 'Why is the "reparameterization trick" necessary when training Variational Autoencoders via gradient backpropagation?',
      questionType: 'mcq',
      options: [
        'Because sampling directly from a stochastic node prevents gradient backpropagation; expressing z = mu + sigma * epsilon moves stochasticity to an external parameter-free variable',
        'To invert the covariance matrix without computing matrix determinants',
        'To convert continuous embeddings into discrete tokens',
        'To skip encoder weight updates during fine-tuning'
      ],
      correctAnswer: 'Because sampling directly from a stochastic node prevents gradient backpropagation; expressing z = mu + sigma * epsilon moves stochasticity to an external parameter-free variable',
      explanation: 'Direct stochastic sampling has no analytical derivative. The reparameterization trick decouples the random noise epsilon from the differentiable distribution parameters mu and sigma.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 61,
        sectionTitle: 'Chapter 5.1: Latent Bottlenecks & ELBO',
        snippet: 'Reparameterization trick enables backpropagation through stochastic latent nodes.'
      }
    }
  ],
  'topic-rnn': [
    {
      id: 'qb-rnn-1',
      quizId: '',
      topicId: 'topic-rnn',
      topicName: 'Recurrent Neural Networks (RNN)',
      questionText: 'Which gate in a canonical LSTM cell is primarily responsible for deciding what fraction of the past cell state C_{t-1} should be discarded?',
      questionType: 'mcq',
      options: ['Forget Gate (f_t)', 'Input Gate (i_t)', 'Output Gate (o_t)', 'Modulation Gate (~C_t)'],
      correctAnswer: 'Forget Gate (f_t)',
      explanation: 'The Forget Gate outputs values between 0 and 1 via a sigmoid activation: f_t = sigma(W_f * [h_{t-1}, x_t] + b_f). A value of 0 means completely purge the past state.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 32,
        sectionTitle: 'Chapter 3.2: LSTM Gating Mechanisms',
        snippet: 'Forget Gate f_t = sigma(W_f * [h_{t-1}, x_t] + b_f): controls what fraction of past cell state to purge.'
      }
    },
    {
      id: 'qb-rnn-2',
      quizId: '',
      topicId: 'topic-rnn',
      topicName: 'Recurrent Neural Networks (RNN)',
      questionText: 'Explain why LSTMs suffer significantly less from the vanishing gradient problem during Backpropagation Through Time (BPTT) compared to standard vanilla RNNs.',
      questionType: 'short_answer',
      correctAnswer: 'In LSTMs, the cell state C_t updates additively (C_t = f_t * C_{t-1} + i_t * ~C_t), creating an uninterrupted constant error carousel where gradients can flow linearly across time without being exponentially diminished by repeated matrix multiplications.',
      explanation: 'Vanilla RNNs repeatedly multiply gradients by the recurrent weight matrix W_hh at every time step, causing exponential decay. The linear cell state highway in LSTMs bypasses this.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 32,
        sectionTitle: 'Chapter 3.2: LSTM Gating Mechanisms',
        snippet: 'Gradient flow across time primarily follows the linear cell state update, preventing premature exponential decay.'
      },
      rubric: {
        keyPoints: [
          'Linear/additive cell state update highway',
          'Avoids repeated multiplicative chain of weight matrices over time steps'
        ]
      }
    }
  ],
  'topic-transformers': [
    {
      id: 'qb-trans-1',
      quizId: '',
      topicId: 'topic-transformers',
      topicName: 'Transformers & Self-Attention',
      questionText: 'In the Scaled Dot-Product Attention formula Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V, why is the division by sqrt(d_k) essential?',
      questionType: 'mcq',
      options: [
        'To prevent large dot products from pushing the softmax function into regions with extremely small gradients',
        'To ensure the attention weights sum to zero',
        'To cancel the effect of positional encodings',
        'To enforce unitary orthogonal projections'
      ],
      correctAnswer: 'To prevent large dot products from pushing the softmax function into regions with extremely small gradients',
      explanation: 'For large values of d_k, the variance of the dot products grows, driving softmax into saturated regions with near-zero gradients.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 45,
        sectionTitle: 'Chapter 4.1: Scaled Dot-Product Attention',
        snippet: 'The scaling factor 1 / sqrt(d_k) is critical: for large projection dimensions, dot products grow large, pushing softmax into regions with extremely small gradients.'
      }
    }
  ],
  'topic-ann': [
    {
      id: 'qb-ann-1',
      quizId: '',
      topicId: 'topic-ann',
      topicName: 'Artificial Neural Networks (ANN)',
      questionText: 'What mathematical property of the Sigmoid activation function sigma(z) = 1 / (1 + e^-z) accelerates the vanishing gradient problem in deep multilayer perceptrons?',
      questionType: 'mcq',
      options: [
        'Its derivative has a maximum value of only 0.25 at z = 0 and rapidly approaches 0 for large |z|',
        'It is non-differentiable at the origin',
        'It only produces negative gradients',
        'It produces discontinuous second derivatives'
      ],
      correctAnswer: 'Its derivative has a maximum value of only 0.25 at z = 0 and rapidly approaches 0 for large |z|',
      explanation: 'Since sigma\'(z) <= 0.25 everywhere, multiplying derivatives across N layers causes the gradient to scale by at most (0.25)^N, disappearing in early layers.',
      sourceCitation: {
        documentTitle: 'CS682_Deep_Learning_Course_Reader.pdf',
        pageNumber: 8,
        sectionTitle: 'Chapter 1.2: Chain Rule & Vanishing Gradients',
        snippet: 'When saturating activation functions like Sigmoid (sigma\'(z) max = 0.25) are stacked across many layers, repeated multiplication causes exponential decay.'
      }
    }
  ]
};

export function generateDiagnosticQuestions(
  topicIds: string[],
  totalQuestions: number = 5,
  quizId: string = ''
): QuizQuestion[] {
  let pool: QuizQuestion[] = [];

  topicIds.forEach((tId) => {
    if (QUESTION_BANK[tId]) {
      pool.push(...QUESTION_BANK[tId]);
    }
  });

  // If pool is smaller than requested, gather across all topics
  if (pool.length < totalQuestions) {
    Object.keys(QUESTION_BANK).forEach((tId) => {
      if (!topicIds.includes(tId)) {
        pool.push(...QUESTION_BANK[tId]);
      }
    });
  }

  // Shuffle and pick requested count
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, totalQuestions).map((q, idx) => ({
    ...q,
    id: `quiz-q-${Date.now()}-${idx + 1}`,
    quizId,
  }));
}
