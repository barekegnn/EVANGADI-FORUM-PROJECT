// Import necessary models
const answerModel = require("../models/answerModel"); // For answer-specific database operations
const questionModel = require("../models/questionModel"); // To verify question existence/asker
const voteModel = require("../models/voteModel"); // To get user's vote status for an answer

// ======================================================================
// 1. Controller function to create a new answer (POST /api/questions/:questionId/answers)
//    Requires authentication.
// ======================================================================
async function createAnswer(req, res) {
  // 1.1 Extract question ID from URL parameters and content from request body.
  const questionId = req.params.questionId;
  const { content } = req.body;
  // 1.2 Get the authenticated user's ID from the 'protect' middleware.
  const userId = req.user.id;

  // 1.3 Validate input: Ensure content is provided.
  if (!content) {
    return res.status(400).json({ error: "Answer content cannot be empty." });
  }

  try {
    // 1.4 Optional: Verify the question exists before allowing an answer.
    const questionExists = await questionModel.getQuestionById(questionId);
    if (!questionExists) {
      return res.status(404).json({ error: "Question not found." });
    }

    // 1.5 Call the model to create the answer in the database.
    const answerId = await answerModel.createAnswer(
      questionId,
      userId,
      content
    );

    // 1.6 Send a success response.
    res.status(201).json({
      message: "Answer posted successfully",
      answerId,
      questionId,
      userId,
    });
  } catch (error) {
    // 1.7 Log and send an error response.
    console.error(`Error creating answer for question ${questionId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while posting answer." });
  }
}

// ======================================================================
// 2. Controller function to update an existing answer (PUT /api/answers/:id)
//    Requires authentication, and user must be the answer's author.
// ======================================================================
async function updateAnswer(req, res) {
  // 2.1 Extract answer ID from URL parameters and new content from request body.
  const answerId = req.params.id;
  const { content } = req.body;
  // 2.2 Get the authenticated user's ID.
  const userId = req.user.id;

  // 2.3 Validate input: Ensure content is provided.
  if (!content) {
    return res
      .status(400)
      .json({ error: "Answer content cannot be empty for update." });
  }

  try {
    // 2.4 Call the model to update the answer. The model handles author authorization.
    const wasUpdated = await answerModel.updateAnswer(
      answerId,
      userId,
      content
    );

    if (!wasUpdated) {
      // 2.5 If no row was affected, check if the answer exists or if the user is unauthorized.
      //     We need to fetch the answer to differentiate between 404 and 403.
      const answer = await answerModel.getAnswerById(answerId); // (Assuming getAnswerById exists, or we get a generic 403)
      if (!answer) {
        // If answer doesn't exist
        return res.status(404).json({ error: "Answer not found." });
      } else {
        // Answer exists, but user_id didn't match
        return res.status(403).json({
          error: "Unauthorized: You can only update your own answers.",
        });
      }
    }

    // 2.6 Send a success response.
    res.status(200).json({ message: "Answer updated successfully." });
  } catch (error) {
    // 2.7 Log and send an error response.
    console.error(`Error updating answer with ID ${answerId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while updating answer." });
  }
}

// ======================================================================
// 3. Controller function to delete an existing answer (DELETE /api/answers/:id)
//    Requires authentication, and user must be the answer's author.
// ======================================================================
async function deleteAnswer(req, res) {
  // 3.1 Extract answer ID from URL parameters.
  const answerId = req.params.id;
  // 3.2 Get the authenticated user's ID.
  const userId = req.user.id;

  try {
    // 3.3 Call the model to delete the answer. The model handles author authorization.
    const wasDeleted = await answerModel.deleteAnswer(answerId, userId);

    if (!wasDeleted) {
      // 3.4 If no row was affected, check if the answer exists or if the user is unauthorized.
      const answer = await answerModel.getAnswerById(answerId); // (Assuming getAnswerById exists, or we get a generic 403)
      if (!answer) {
        // If answer doesn't exist
        return res.status(404).json({ error: "Answer not found." });
      } else {
        // Answer exists, but user_id didn't match
        return res.status(403).json({
          error: "Unauthorized: You can only delete your own answers.",
        });
      }
    }

    // 3.5 Send a success response.
    res.status(200).json({ message: "Answer deleted successfully." });
  } catch (error) {
    // 3.6 Log and send an error response.
    console.error(`Error deleting answer with ID ${answerId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while deleting answer." });
  }
}

// ======================================================================
// 4. Controller function to accept an answer (PUT /api/answers/:id/accept)
//    Requires authentication, and user must be the question's original asker.
// ======================================================================
async function acceptAnswer(req, res) {
  // 4.1 Extract answer ID from URL parameters.
  const answerId = req.params.id;
  // 4.2 Get the authenticated user's ID.
  const userId = req.user.id; // This is the user attempting to accept the answer.

  try {
    // 4.3 Get the question ID associated with this answer.
    //     We need this because 'setAcceptedAnswer' requires the questionId
    //     and only the question asker can accept.
    const answer = await answerModel.getAnswerById(answerId);
    if (!answer) {
      return res.status(404).json({ error: "Answer not found." });
    }
    const questionId = answer.question_id;

    // 4.4 Call the model to set this answer as accepted.
    //     The model will handle the authorization check (userIdOfQuestionAsker).
    const wasAccepted = await answerModel.setAcceptedAnswer(
      answerId,
      questionId,
      userId
    );

    if (!wasAccepted) {
      // 4.5 If not accepted, it implies the user wasn't the question asker (as other errors would be caught by model's throw).
      //     The model itself throws an 'Unauthorized' error, but we'll add a check here for clarity.
      const question = await questionModel.getQuestionById(questionId);
      if (question && question.author_id !== userId) {
        return res.status(403).json({
          error: "Unauthorized: Only the question asker can accept an answer.",
        });
      }
      return res
        .status(500)
        .json({ error: "Failed to accept answer for an unknown reason." });
    }

    // 4.6 Send a success response.
    res.status(200).json({ message: "Answer accepted successfully." });
  } catch (error) {
    // 4.7 The model might throw a specific error like 'Unauthorized: Only the question asker can accept an answer.'
    //     We can catch and differentiate it here.
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ error: error.message });
    }
    console.error(`Error accepting answer with ID ${answerId}:`, error);
    res
      .status(500)
      .json({ error: "Internal server error while accepting answer." });
  }
}

// Export all the controller functions to be used by the routes
module.exports = {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
};
