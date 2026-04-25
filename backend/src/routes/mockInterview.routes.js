const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const mockInterviewController = require("../controllers/mockInterview.controller")
const questionBankController = require("../controllers/questionBank.controller")
const roadmapController = require("../controllers/roadmap.controller")

const mockInterviewRouter = express.Router()

// All routes require authentication
mockInterviewRouter.use(authMiddleware.authUser)


// ─── Session Lifecycle ──────────────────────────────────────────────────────

/**
 * @route POST /api/mock-interview/session/start
 * @description Start a new mock interview session and get the first question.
 * @access private
 */
mockInterviewRouter.post("/session/start", mockInterviewController.startSessionController)

/**
 * @route POST /api/mock-interview/session/:sessionId/answer
 * @description Submit an answer for the current turn.
 * @access private
 */
mockInterviewRouter.post("/session/:sessionId/answer", mockInterviewController.submitAnswerController)

/**
 * @route POST /api/mock-interview/session/:sessionId/complete
 * @description Finalize session and get coaching summary.
 * @access private
 */
mockInterviewRouter.post("/session/:sessionId/complete", mockInterviewController.completeSessionController)

/**
 * @route POST /api/mock-interview/session/:sessionId/abandon
 * @description Mark an active session as abandoned.
 * @access private
 */
mockInterviewRouter.post("/session/:sessionId/abandon", mockInterviewController.abandonSessionController)


// ─── Session Retrieval / Trends ─────────────────────────────────────────────

/**
 * @route GET /api/mock-interview/session/active
 * @description Get the latest active session for quick resume.
 * @access private
 */
mockInterviewRouter.get("/session/active", mockInterviewController.getActiveSessionController)

/**
 * @route GET /api/mock-interview/session/:sessionId
 * @description Get a full session with all turns (replay-ready).
 * @access private
 */
mockInterviewRouter.get("/session/:sessionId", mockInterviewController.getSessionByIdController)

/**
 * @route GET /api/mock-interview/history
 * @description Get paginated interview session history.
 * @access private
 */
mockInterviewRouter.get("/history", mockInterviewController.getHistoryController)

/**
 * @route GET /api/mock-interview/trends
 * @description Get score trends over a time window (7d, 30d, 90d).
 * @access private
 */
mockInterviewRouter.get("/trends", mockInterviewController.getTrendsController)


// ─── Question Bank + Revision ───────────────────────────────────────────────

/**
 * @route GET /api/mock-interview/question-bank
 * @description Get filtered question bank with optional due-only filter.
 * @access private
 */
mockInterviewRouter.get("/question-bank", questionBankController.getQuestionBankController)

/**
 * @route POST /api/mock-interview/question-bank/:id/review
 * @description Record a review outcome and update revision schedule.
 * @access private
 */
mockInterviewRouter.post("/question-bank/:id/review", questionBankController.recordReviewController)


// ─── Skill Roadmap ──────────────────────────────────────────────────────────

/**
 * @route POST /api/mock-interview/roadmap/generate
 * @description Generate skill roadmap from an interview report.
 * @access private
 */
mockInterviewRouter.post("/roadmap/generate", roadmapController.generateRoadmapController)

/**
 * @route GET /api/mock-interview/roadmap
 * @description Get roadmaps by report.
 * @access private
 */
mockInterviewRouter.get("/roadmap", roadmapController.getRoadmapController)

/**
 * @route PATCH /api/mock-interview/roadmap/:id/task/:taskId
 * @description Update a task's status in a roadmap.
 * @access private
 */
mockInterviewRouter.patch("/roadmap/:id/task/:taskId", roadmapController.updateRoadmapTaskController)


module.exports = mockInterviewRouter
