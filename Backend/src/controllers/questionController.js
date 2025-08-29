// Import necessary models
const questionModel = require("../models/questionModel"); // To interact with the 'questions' table
const answerModel = require("../models/answerModel"); // To get answers for a specific question
const tagModel = require("../models/tagModel"); // To manage/retrieve tags for questions
const voteModel = require("../models/voteModel"); // To get user's vote status for a question

// ======================================================================
// 1. Controller function to create a new question (POST /api/questions)
//    This now handles dynamic tag creation.
// ======================================================================
async function createQuestion(req, res) {
  // 1.1 Extract title and content from the request body.
  //     'tags' is now an array of tag NAMES (strings)
  const { title, content, tags } = req.body;
  // 1.2 The 'protect' middleware would have attached the authenticated user's ID to `req.user.id`.
  const userId = req.user.id;

  // 1.3 Validate input: Ensure title and content are provided.
  if (!title || !content) {
    return res.status(400).json({
      error: "Please provide both title and content for the question.",
    });
  }

  try {
    let tagIds = [];
    // 1.4 Handle tags: Find or create tags based on the names provided.
    if (tags && tags.length > 0) {
      // This is the new, crucial step! Call the new model function.
      tagIds = await tagModel.createOrFindTags(tags);
    }

    // 1.5 Call the model to create the question in the database.
    const questionId = await questionModel.createQuestion(
      userId,
      title,
      content
    );

    // 1.6 If tags were found or created, associate them with the new question.
    if (tagIds.length > 0) {
      await tagModel.addTagsToQuestion(questionId, tagIds);
    }

    // 1.7 Send a success response with the ID of the new question.
    res.status(201).json({
      message: "Question created successfully",
      questionId,
      userId, // Optionally include userId to confirm author
    });
  } catch (error) {
    // 1.8 Log and send an error response if something goes wrong.
    console.error("Error creating question:", error);
    res
      .status(500)
      .json({ error: "Internal server error while creating question." });
  }
}

// ======================================================================
// 2. Controller function to get all questions (GET /api/questions)
//    Logic is unchanged, as the model handles fetching tags.
// ======================================================================
async function getAllQuestions(req, res) {
  try {
    const questions = await questionModel.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching all questions:", error);
    res
      .status(500)
      .json({ error: "Internal server error while fetching questions." });
  }
}

// ======================================================================
// 3. Controller function to get a single question by ID (GET /api/questions/:id)
//    Logic is unchanged, as the models handle fetching tags and other data.
// ======================================================================
async function getQuestionById(req, res) {
  const questionId = req.params.id;
  const currentUserId = req.user ? req.user.id : null;

  try {
    const question = await questionModel.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    const answers = await answerModel.getAnswersByQuestionId(questionId);
    const tags = await tagModel.getTagsByQuestionId(questionId);

    let userVote = 0;
    if (currentUserId) {
      userVote = await voteModel.getUserVoteForQuestion(
        currentUserId,
        questionId
      );
    }

    res.status(200).json({
      ...question,
      answers,
      tags,
      user_vote: userVote,
    });
  } catch (error) {
    console.error(`Error fetching question with ID ${questionId}:`, error);
    res.status(500).json({
      error: "Internal server error while fetching question details.",
    });
  }
}

// ======================================================================
// 4. Controller function to update an existing question (PUT /api/questions/:id)
//    This now handles dynamic tag updates.
// ======================================================================
async function updateQuestion(req, res) {
  const questionId = req.params.id;
  // `tags` is now an array of tag NAMES (strings)
  const { title, content, tags } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res
      .status(400)
      .json({ error: "Title and content are required to update a question." });
  }

  try {
    const wasUpdated = await questionModel.updateQuestion(
      questionId,
      userId,
      title,
      content
    );
    if (!wasUpdated) {
      const questionExists = await questionModel.getQuestionById(questionId);
      if (!questionExists) {
        return res.status(404).json({ error: "Question not found." });
      } else {
        return res.status(403).json({
          error: "Unauthorized: You can only update your own questions.",
        });
      }
    }

    // Handle tag updates: Find or create tags based on the new names.
    let tagIds = [];
    if (tags && tags.length > 0) {
      tagIds = await tagModel.createOrFindTags(tags);
    }

    // First, remove all existing tags for a clean replacement using the model function
    // Now calling the dedicated model function for this! 🎉
    await tagModel.removeAllTagsFromQuestion(questionId);

    // Then, re-add the new (or existing) tags
    if (tagIds.length > 0) {
      await tagModel.addTagsToQuestion(questionId, tagIds);
    }

    res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    console.error(`Error updating question with ID ${questionId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while updating question." });
  }
}

// ======================================================================
// 5. Controller function to delete a question (DELETE /api/questions/:id)
//    Logic is unchanged.
// ======================================================================
async function deleteQuestion(req, res) {
  const questionId = req.params.id;
  const userId = req.user.id;

  try {
    const wasDeleted = await questionModel.deleteQuestion(questionId, userId);
    if (!wasDeleted) {
      const questionExists = await questionModel.getQuestionById(questionId);
      if (!questionExists) {
        return res.status(404).json({ error: "Question not found." });
      } else {
        return res.status(403).json({
          error: "Unauthorized: You can only delete your own questions.",
        });
      }
    }
    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    console.error(`Error deleting question with ID ${questionId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while deleting question." });
  }
}

// Export all the controller functions to be used by the routes
module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
