import api from "./axios";

export interface Answer {
  id: string;
  author: string;
  avatarUrl: string;
  date: string;
  content: string;
  votes: number;
  isAccepted: boolean;
}

export interface Question {
  id: string;
  author: string;
  avatarUrl: string;
  date: string;
  title: string;
  content: string;
  votes: number;
  views: number;
  tags: string[];
  answers: Answer[];
}

export async function getQuestions(): Promise<Question[]> {
  const response = await api.get("/questions");
  // Transform the backend data to match the frontend Question interface
  return response.data.map((question: any) => ({
    id: question.id,
    author: question.author_username,
    avatarUrl: "/placeholder-user.jpg", // Default avatar, should be updated with actual user avatars
    date: question.created_at,
    title: question.title,
    content: question.content,
    votes: question.vote_count || 0,
    views: question.view_count || 0,
    tags: question.tags || [],
    answers: Array(question.answer_count || 0).fill(null), // Create empty array with the correct length
  }));
}

export async function getQuestionById(
  id: string
): Promise<{ question: Question; answers: Answer[] }> {
  const response = await api.get(`/questions/${id}`);

  // The backend returns a flat structure
  const questionData = response.data;
  const answers = questionData.answers || [];
  const tags = questionData.tags || [];

  // Check if questionData exists
  if (!questionData) {
    throw new Error("Question not found");
  }

  // Transform the question data
  const transformedQuestion: Question = {
    id: questionData.id,
    author: questionData.author_username,
    avatarUrl: "/placeholder-user.jpg", // Default avatar
    date: questionData.created_at,
    title: questionData.title,
    content: questionData.content,
    votes: questionData.vote_count || 0,
    views: questionData.view_count || 0,
    tags: tags.map((tag: any) => tag.name || tag) || [],
    answers: [], // Will be populated with transformed answers
  };

  // Transform the answers data
  const transformedAnswers: Answer[] = answers.map((answer: any) => ({
    id: answer.answer_id || answer.id,
    author: answer.username || answer.author || "Unknown",
    avatarUrl: "/placeholder-user.jpg", // Default avatar
    date: answer.created_at,
    content: answer.content,
    votes: answer.votes || answer.vote_count || 0,
    isAccepted: answer.is_accepted_answer || false,
  }));

  const sortedAnswers = [...transformedAnswers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return (b.votes || 0) - (a.votes || 0);
  });

  return { question: transformedQuestion, answers: sortedAnswers };
}

export async function addQuestion(data: {
  title: string;
  details: string;
  tags: string;
}) {
  const newQuestion = {
    title: data.title,
    content: data.details,
    tags: data.tags.split(",").map((tag) => tag.trim()),
  };
  const response = await api.post("/questions", newQuestion);
  return response.data;
}

export async function addAnswer(questionId: string, content: string) {
  const response = await api.post(`/questions/${questionId}/answers`, {
    content,
  });
  return response.data;
}

export async function voteOnQuestion(
  questionId: string,
  voteType: "up" | "down"
) {
  try {
    const numericVoteType = voteType === "up" ? 1 : -1;
    const response = await api.post(`/votes/questions/${questionId}`, {
      voteType: numericVoteType,
    });
    return response.data;
  } catch (error: any) {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      throw new Error("You must be logged in to vote on questions.");
    }
    throw error;
  }
}

export async function voteOnAnswer(
  questionId: string,
  answerId: string,
  voteType: "up" | "down"
) {
  try {
    const numericVoteType = voteType === "up" ? 1 : -1;
    const response = await api.post(`/votes/answers/${answerId}`, {
      voteType: numericVoteType,
    });
    return response.data;
  } catch (error: any) {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      throw new Error("You must be logged in to vote on answers.");
    }
    throw error;
  }
}

export async function acceptAnswer(questionId: string, answerId: string) {
  const response = await api.put(`/answers/${answerId}/accept`);
  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await api.post("/auth/request-password-reset", { email });
  return response.data;
}

export async function resetPassword(token: string, newPassword: string) {
  const response = await api.post("/auth/reset-password", {
    token,
    newPassword,
  });
  return response.data;
}
