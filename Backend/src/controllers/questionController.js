const questionModel = require("../models/questionModel");
const answerModel = require("../models/answerModel");
const tagModel = require("../models/tagModel");
const voteModel = require("../models/voteModel"); // Correct import for the vote model
const notificationModel = require("../models/notificationModel");

// ======================================================================
// Controller to handle creating a new question
// ======================================================================
async function createQuestion(req, res) {
  const { title, content, tags } = req.body;
  const { id: userId } = req.user; // Get userId from the authenticated user

  // Validate input
  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required." });
  }

  try {
    // Create the question in the database
    const questionId = await questionModel.createQuestion(
      userId,
      title,
      content
    );

    // Process tags and link them to the question
    if (tags && tags.length > 0) {
      const tagIds = await tagModel.createOrFindTags(tags);
      await tagModel.addTagsToQuestion(questionId, tagIds);
    }

    // Determine recipients for notifications (MVP: all users except author)
    // For production, scope by course/section or matching tags.
    const recipients = await getAllOtherUserIds(userId);
    if (recipients.length > 0) {
      const message = `New question: ${title}`;
      const rows = recipients.map((rid) => ({
        recipientUserId: rid,
        type: "QUESTION_CREATED",
        entityId: questionId,
        message,
        context: JSON.stringify({
          questionId,
          authorId: userId,
          tags: tags || [],
        }),
      }));
      try {
        await notificationModel.createNotificationsBulk(rows);
      } catch (e) {
        console.error("Failed to store notifications:", e);
      }

      // Real-time emit to each recipient via Socket.IO
      try {
        const io = req.app.get("io");
        if (io) {
          for (const rid of recipients) {
            io.to(`user:${rid}`).emit("notification", {
              type: "QUESTION_CREATED",
              entityId: questionId,
              message,
              createdAt: new Date().toISOString(),
            });
          }
        }
      } catch (e) {
        console.error("Failed to emit notifications:", e);
      }
    }

    res
      .status(201)
      .json({ message: "Question created successfully.", questionId, userId });
  } catch (error) {
    console.error("Error creating question:", error);
    res
      .status(500)
      .json({ error: "Internal server error while creating question." });
  }
}

// ======================================================================
// Controller to get a question and its associated data by ID
// ======================================================================
async function getQuestionById(req, res) {
  const { id } = req.params;
  const userId = req.user ? req.user.id : null; // Get user ID if authenticated

  try {
    // Fetch the question details from the database
    const question = await questionModel.getQuestionById(id, userId);

    // If no question is found, return a 404 error
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    // Fetch answers and tags concurrently for efficiency
    const [answers, tags] = await Promise.all([
      answerModel.getAnswersByQuestionId(id),
      tagModel.getTagsByQuestionId(id),
    ]);

    // Get the logged-in user's vote on this question if authenticated
    let userVote = 0;
    if (userId) {
      userVote = await voteModel.getUserVoteForQuestion(userId, id);
    }

    // Combine all data into a single response object
    const responseData = {
      ...question,
      answers,
      tags,
      user_vote: userVote,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching question details:", error);
    res.status(500).json({
      error: "Internal server error while fetching question details.",
    });
  }
}

// ======================================================================
// Controller to get all questions
// ======================================================================
async function getAllQuestions(req, res) {
  try {
    const questions = await questionModel.getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching all questions:", error);
    res
      .status(500)
      .json({ error: "Internal server error while fetching all questions." });
  }
}

// ======================================================================
// Controller to update a question
// ======================================================================
async function updateQuestion(req, res) {
  const { id } = req.params;
  const { id: userId } = req.user;
  const { title, content, tags } = req.body;

  try {
    const isUpdated = await questionModel.updateQuestion(
      id,
      userId,
      title,
      content,
      tags
    );

    if (!isUpdated) {
      return res
        .status(404)
        .json({ error: "Question not found or unauthorized to update." });
    }

    // Handle tags
    if (tags && tags.length > 0) {
      await tagModel.removeAllTagsFromQuestion(id);
      const tagIds = await tagModel.createOrFindTags(tags);
      await tagModel.addTagsToQuestion(id, tagIds);
    }

    res.status(200).json({ message: "Question updated successfully." });
  } catch (error) {
    console.error("Error updating question:", error);
    res
      .status(500)
      .json({ error: "Internal server error while updating question." });
  }
}

// ======================================================================
// Controller to delete a question
// ======================================================================
async function deleteQuestion(req, res) {
  const { id } = req.params;
  const { id: userId } = req.user;

  try {
    const isDeleted = await questionModel.deleteQuestion(id, userId);
    if (!isDeleted) {
      return res
        .status(404)
        .json({ error: "Question not found or unauthorized to delete." });
    }
    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    console.error("Error deleting question:", error);
    res
      .status(500)
      .json({ error: "Internal server error while deleting question." });
  }
}

// Export the functions for use by the router
module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};

// Helper: fetch all user IDs except the author (simple MVP broadcast)
async function getAllOtherUserIds(excludeUserId) {
  const pool = require("../config/database");
  const [rows] = await pool.execute("SELECT id FROM users WHERE id <> ?", [
    excludeUserId,
  ]);
  return rows.map((r) => r.id);
}
