import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { Question, Quiz, Participant } from "./src/types";

dotenv.config();

const PORT = 3000;

// Lazy initialization of GoogleGenAI
let aiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
      throw new Error("GEMINI_API_KEY is not configured in the Secrets panel");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// In-Memory Storage for Live Active Quiz Application
const defaultQuestions: Question[] = [
  {
    id: "ml-q1",
    text: "What is the primary difference between supervised and unsupervised learning?",
    options: [
      "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.",
      "Unsupervised learning requires more computational power than supervised learning.",
      "Supervised learning is only used for image recognition; unsupervised is used for text.",
      "There is no difference; they are alternative names for the same algorithm."
    ],
    correctAnswer: "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.",
    explanation: "Supervised learning algorithms are trained using labeled data, where each input comes with a corresponding target output. Unsupervised learning finds hidden patterns or intrinsic structures in unlabeled data."
  },
  {
    id: "ml-q2",
    text: "Which of the following is a classic example of an unsupervised learning task?",
    options: [
      "Predicting house prices based on size and location.",
      "Classifying emails as spam or not spam.",
      "Clustering customer purchase behaviors into segmentation groups.",
      "Recognizing handwritten digits on an envelope."
    ],
    correctAnswer: "Clustering customer purchase behaviors into segmentation groups.",
    explanation: "Clustering (like K-Means) is a typical unsupervised learning method because it groups data points based on feature similarity without pre-existing labels or supervised targets."
  },
  {
    id: "ml-q3",
    text: "What does 'Overfitting' mean in Machine Learning?",
    options: [
      "The model performs exceptionally well on unseen test data but poorly on training data.",
      "The model learns the training data too well, including its noise, leading to poor generalization on new data.",
      "The training process takes too long to converge or complete.",
      "The dataset is too small to fit the neural network architecture parameters."
    ],
    correctAnswer: "The model learns the training data too well, including its noise, leading to poor generalization on new data.",
    explanation: "Overfitting occurs when a model is too complex and fits the training data perfectly (capturing noise and random fluctuations), which results in high accuracy on training data but poor performance on new, unseen data."
  },
  {
    id: "ml-q4",
    text: "What is the role of an 'activation function' in a neural network?",
    options: [
      "To initialize the random weight values of connections between layers.",
      "To accelerate the gradient descent convergence rate during backpropagation.",
      "To introduce non-linearity into the network, allowing it to learn complex patterns.",
      "To save the trained model weights to disk storage."
    ],
    correctAnswer: "To introduce non-linearity into the network, allowing it to learn complex patterns.",
    explanation: "Without activation functions, any neural network would just behave like a single linear regression model, regardless of depth. Activation functions introduce non-linearity, which is essential for learning complex, non-linear mappings."
  },
  {
    id: "ml-q5",
    text: "Which optimizer is widely used for training deep neural networks due to its adaptive learning rate behavior?",
    options: [
      "Stochastic Gradient Descent (SGD) with no momentum",
      "Adam (Adaptive Moment Estimation)",
      "Newton-Raphson Method",
      "Random Local Search"
    ],
    correctAnswer: "Adam (Adaptive Moment Estimation)",
    explanation: "Adam is highly popular because it computes adaptive learning rates for each parameter, combining the advantages of AdaGrad and RMSProp, making it efficient for noisy datasets and large models."
  }
];

let activeQuiz: Quiz = {
  id: "default-ml-quiz",
  topic: "Machine Learning & AI Concepts",
  difficulty: "medium",
  questions: defaultQuestions,
  status: "live", // Start as live by default so users can immediately test it
};

let participants: Participant[] = [
  {
    username: "Alex_ML_Guru",
    role: "player",
    score: 4,
    timeSpentSec: 85,
    answers: { "ml-q1": "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.", "ml-q2": "Clustering customer purchase behaviors into segmentation groups.", "ml-q3": "The model learns the training data too well, including its noise, leading to poor generalization on new data.", "ml-q4": "To initialize the random weight values of connections between layers.", "ml-q5": "Adam (Adaptive Moment Estimation)" },
    completed: true,
    accuracy: 80,
    joinedAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    username: "Elena_DataSci",
    role: "player",
    score: 5,
    timeSpentSec: 72,
    answers: { "ml-q1": "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.", "ml-q2": "Clustering customer purchase behaviors into segmentation groups.", "ml-q3": "The model learns the training data too well, including its noise, leading to poor generalization on new data.", "ml-q4": "To introduce non-linearity into the network, allowing it to learn complex patterns.", "ml-q5": "Adam (Adaptive Moment Estimation)" },
    completed: true,
    accuracy: 100,
    joinedAt: new Date(Date.now() - 500000).toISOString(),
  },
  {
    username: "Rohan_Dev",
    role: "player",
    score: 3,
    timeSpentSec: 110,
    answers: { "ml-q1": "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.", "ml-q2": "Predicting house prices based on size and location.", "ml-q3": "The model learns the training data too well, including its noise, leading to poor generalization on new data.", "ml-q4": "To initialize the random weight values of connections between layers.", "ml-q5": "Adam (Adaptive Moment Estimation)" },
    completed: true,
    accuracy: 60,
    joinedAt: new Date(Date.now() - 400000).toISOString(),
  }
];

let leaderboard = [
  { username: "Elena_DataSci", score: 5, accuracy: 100, timeSpentSec: 72 },
  { username: "Alex_ML_Guru", score: 4, accuracy: 80, timeSpentSec: 85 },
  { username: "Rohan_Dev", score: 3, accuracy: 60, timeSpentSec: 110 },
];

let usersList = [
  { email: "elena@quizai.live", username: "Elena_DataSci", password: "password123", role: "player" },
  { email: "alex@quizai.live", username: "Alex_ML_Guru", password: "password123", role: "player" },
  { email: "rohan@quizai.live", username: "Rohan_Dev", password: "password123", role: "player" },
  { email: "host@quizai.live", username: "Host_Pro", password: "password123", role: "host" }
];

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Endpoints ---

  // Register endpoint
  app.post("/api/auth/register", (req, res) => {
    const { email, username, password, role } = req.body;
    if (!email || !username || !password || !role) {
      return res.status(400).json({ error: "Email, Username, Password and Role are all required fields." });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim();

    if (!trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long." });
    }
    if (password.length < 4) {
      return res.status(400).json({ error: "Password must be at least 4 characters long." });
    }

    const emailExists = usersList.find(u => u.email.toLowerCase() === trimmedEmail);
    if (emailExists) {
      return res.status(400).json({ error: "This email address is already registered. Please login instead." });
    }

    const usernameExists = usersList.find(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (usernameExists) {
      return res.status(400).json({ error: "This username is already taken. Please choose another username." });
    }

    const newUser = {
      email: trimmedEmail,
      username: trimmedUsername,
      password: password,
      role: role === "host" ? "host" : "player"
    };
    usersList.push(newUser);

    // Automatically join as participant/host in live session state as well
    let participant = participants.find(p => p.username === trimmedUsername);
    if (!participant) {
      participant = {
        username: trimmedUsername,
        role: newUser.role as any,
        score: 0,
        timeSpentSec: 0,
        answers: {},
        completed: false,
        accuracy: 0,
        joinedAt: new Date().toISOString()
      };
      participants.push(participant);
    }

    res.json({ success: true, user: { email: newUser.email, username: newUser.username, role: newUser.role } });
  });

  // Login endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Both email/username and password are required." });
    }

    const input = email.trim().toLowerCase();
    // Allow matching either by email or by username (as username is pre-allocated or custom)
    const user = usersList.find(u => 
      u.email.toLowerCase() === input || u.username.toLowerCase() === input
    );

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Incorrect credentials. Please verify your email/password." });
    }

    // Ensure they have active state presence in lobby
    let participant = participants.find(p => p.username === user.username);
    if (!participant) {
      participant = {
        username: user.username,
        role: user.role as any,
        score: 0,
        timeSpentSec: 0,
        answers: {},
        completed: false,
        accuracy: 0,
        joinedAt: new Date().toISOString()
      };
      participants.push(participant);
    }

    res.json({ 
      success: true, 
      user: { 
        email: user.email,
        username: user.username, 
        role: user.role, 
        answers: participant.answers, 
        score: participant.score, 
        accuracy: participant.accuracy, 
        timeSpentSec: participant.timeSpentSec 
      } 
    });
  });

  // --- API Endpoints ---

  // Health and API check
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", hasAPIKey: !!process.env.GEMINI_API_KEY });
  });

  // Get active quiz including status and live statistics
  app.get("/api/quiz/active", (req, res) => {
    res.json({
      activeQuiz,
      participants,
      leaderboard
    });
  });

  // Join quiz
  app.post("/api/quiz/join", (req, res) => {
    const { username, role } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    const formattedUsername = username.trim().substring(0, 20);
    let existing = participants.find(p => p.username.toLowerCase() === formattedUsername.toLowerCase());
    
    if (!existing) {
      existing = {
        username: formattedUsername,
        role: role === "host" ? "host" : "player",
        score: 0,
        timeSpentSec: 0,
        answers: {},
        completed: false,
        accuracy: 0,
        joinedAt: new Date().toISOString()
      };
      participants.push(existing);
    }
    res.json({ participant: existing });
  });

  // Submit Answer
  app.post("/api/quiz/submit-answer", (req, res) => {
    const { username, questionId, answer, timeSpentSec } = req.body;
    
    if (!username || !questionId) {
      return res.status(400).json({ error: "Username and Question ID are required" });
    }

    const participant = participants.find(p => p.username === username);
    if (!participant) {
      return res.status(404).json({ error: "Participant not found" });
    }

    const question = activeQuiz.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Save choice
    participant.answers[questionId] = answer;
    
    // Evaluate correctness
    const isCorrect = question.correctAnswer === answer;
    
    // Recalculate score and accuracy
    let correctCount = 0;
    activeQuiz.questions.forEach(q => {
      if (participant.answers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    participant.score = correctCount;
    const answeredCount = Object.keys(participant.answers).length;
    participant.accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;
    participant.timeSpentSec += (timeSpentSec || 0);

    // If all questions are answered, mark as completed
    if (answeredCount === activeQuiz.questions.length) {
      participant.completed = true;

      // Update leaderboard
      const idx = leaderboard.findIndex(l => l.username === username);
      const entry = {
        username: participant.username,
        score: participant.score,
        accuracy: participant.accuracy,
        timeSpentSec: participant.timeSpentSec
      };

      if (idx >= 0) {
        leaderboard[idx] = entry;
      } else {
        leaderboard.push(entry);
      }

      // Sort leaderboard: Score Desc, Time Asc
      leaderboard.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpentSec - b.timeSpentSec;
      });
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      currentScore: participant.score,
      accuracy: participant.accuracy,
      completed: participant.completed
    });
  });

  // Host Control: Start quiz
  app.post("/api/quiz/start", (req, res) => {
    activeQuiz.status = "live";
    res.json({ success: true, activeQuiz });
  });

  // Host Control: End quiz
  app.post("/api/quiz/end", (req, res) => {
    activeQuiz.status = "ended";
    res.json({ success: true, activeQuiz });
  });

  // Host Control: Reset quiz data
  app.post("/api/quiz/reset", (req, res) => {
    activeQuiz = {
      id: "default-ml-quiz",
      topic: "Machine Learning & AI Concepts",
      difficulty: "medium",
      questions: defaultQuestions,
      status: "live",
    };
    participants = [
      {
        username: "Alex_ML_Guru",
        role: "player",
        score: 4,
        timeSpentSec: 85,
        answers: { "ml-q1": "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.", "ml-q2": "Clustering customer purchase behaviors into segmentation groups.", "ml-q3": "The model learns the training data too well, including its noise, leading to poor generalization on new data.", "ml-q4": "To initialize the random weight values of connections between layers.", "ml-q5": "Adam (Adaptive Moment Estimation)" },
        completed: true,
        accuracy: 80,
        joinedAt: new Date(Date.now() - 600000).toISOString(),
      },
      {
        username: "Elena_DataSci",
        role: "player",
        score: 5,
        timeSpentSec: 72,
        answers: { "ml-q1": "Supervised learning uses labeled training data; unsupervised learning uses unlabeled data.", "ml-q2": "Clustering customer purchase behaviors into segmentation groups.", "ml-q3": "The model learns the training data too well, including its noise, leading to poor generalization on new data.", "ml-q4": "To introduce non-linearity into the network, allowing it to learn complex patterns.", "ml-q5": "Adam (Adaptive Moment Estimation)" },
        completed: true,
        accuracy: 100,
        joinedAt: new Date(Date.now() - 500000).toISOString(),
      }
    ];
    leaderboard = [
      { username: "Elena_DataSci", score: 5, accuracy: 100, timeSpentSec: 72 },
      { username: "Alex_ML_Guru", score: 4, accuracy: 80, timeSpentSec: 85 }
    ];
    res.json({ success: true, activeQuiz, participants, leaderboard });
  });

  // Gemini Quiz Generator API
  app.post("/api/generate-quiz", async (req, res) => {
    const { topic, difficulty, count } = req.body;
    
    if (!topic || !difficulty) {
      return res.status(400).json({ error: "Topic and difficulty are required" });
    }

    const questionCount = Math.min(Math.max(parseInt(count) || 5, 2), 15);

    try {
      const ai = getGemini();
      
      const prompt = `Generate a high-quality educational multiple choice quiz about target topic: "${topic}" with difficulty level "${difficulty}". Output exactly ${questionCount} engaging and factually correct questions. Each question must have exactly 4 diverse options. Return the result strictly conforming to the requested JSON layout schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite academic quiz author. Generate high-quality pedagogical multiple-choice questions with distinct, challenging options, and robust explanations for the correct answer.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of quiz questions",
            items: {
              type: Type.OBJECT,
              required: ["text", "options", "correctAnswer", "explanation"],
              properties: {
                text: { type: Type.STRING, description: "Clear and educational question description." },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Exactly 4 unique options."
                },
                correctAnswer: { type: Type.STRING, description: "The correct option string, identical to one of the choices in the options list." },
                explanation: { type: Type.STRING, description: "Informative explanation explaining why the correctAnswer is valid and educational." }
              }
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No responses generated from Gemini AI.");
      }

      const generatedQuestionsRaw = JSON.parse(responseText);

      // Clean and inject IDs
      const cleanedQuestions: Question[] = generatedQuestionsRaw.map((q: any, index: number) => {
        // Ensure options has exactly 4 items
        let options = Array.isArray(q.options) ? q.options : [];
        while (options.length < 4) {
          options.push(`Alternative Option ${options.length + 1}`);
        }
        options = options.slice(0, 4);

        // Ensure correct answer is in the options list
        let correctAnswer = q.correctAnswer;
        if (!options.includes(correctAnswer)) {
          correctAnswer = options[0];
        }

        return {
          id: `ai-q-${Date.now()}-${index}`,
          text: q.text || "Sample AI generated question?",
          options,
          correctAnswer,
          explanation: q.explanation || "No explanation provided."
        };
      });

      // Update Active Quiz State
      activeQuiz = {
        id: `quiz-ai-${Date.now()}`,
        topic,
        difficulty: difficulty as any,
        questions: cleanedQuestions,
        status: "draft", // Starts as draft, host can click Start to make it Live!
      };

      // Reset user quiz state for players (except hosts)
      participants = participants.map(p => {
        if (p.role === "host") return p;
        return {
          ...p,
          score: 0,
          timeSpentSec: 0,
          answers: {},
          completed: false,
          accuracy: 0
        };
      });
      // Clear leaderboard of old scores
      leaderboard = [];

      res.json({
        success: true,
        quiz: activeQuiz
      });

    } catch (err: any) {
      console.error("Gemini Generation Error:", err);
      res.status(500).json({
        error: "Failed to generate quiz using AI.",
        details: err.message || "An unexpected error occurred."
      });
    }
  });

  // Generative AI Personalized Feedback API
  app.post("/api/personalized-feedback", async (req, res) => {
    const { username, score, totalQuestions, accuracy, timeSpentSec, performanceCategory } = req.body;

    try {
      const ai = getGemini();

      const prompt = `Give highly personalized constructive feedback to participant "${username}" who finished our live quiz on "${activeQuiz.topic}".
      Performance stats:
      - Score: ${score} out of ${totalQuestions}
      - Accuracy: ${accuracy}%
      - Average time per question: ${Math.round(timeSpentSec / totalQuestions)} seconds (total time spent is ${timeSpentSec} seconds).
      - Category: ${performanceCategory}
      
      Generate exactly 1 short, highly inspiring and friendly paragraph under 100 words. Call out their performance metrics directly, mention their speed/accuracy relationship, and give one distinct piece of actionable advice to bolster their skills.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an encouraging, expert educational coach. Write supportive, highly tailored feedback using simple, motivating, and professional language."
        }
      });

      res.json({
        success: true,
        feedback: response.text || `Excellent job completing the quiz, ${username}! You achieved an accuracy of ${accuracy}% in ${timeSpentSec} seconds. Keep studying ${activeQuiz.topic} to lock in your expert understanding.`
      });

    } catch (err: any) {
      console.error("Gemini Feedback Error:", err);
      // Friendly fallback feedback
      res.json({
        success: true,
        feedback: `Superb effort completing the "${activeQuiz.topic}" quiz, ${username || "Learner"}! You scored ${score}/${totalQuestions} with an accuracy of ${accuracy}%, taking approximately ${Math.round(timeSpentSec / 60)} minutes. To sharpen your expertise, continue revising the foundational concepts!`
      });
    }
  });

  // --- Vite Middleware to support dynamic routing & hydration ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
