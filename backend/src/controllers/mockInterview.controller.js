const MockInterviewSession = require("../model/mockInterviewSession.model")
const MockInterviewTurn = require("../model/mockInterviewTurn.model")
const InterviewReport = require("../model/interviewReport.model")
const QuestionBankItem = require("../model/questionBankItem.model")
const {
    buildSessionContext,
    generateFirstQuestion,
    evaluateTurn,
    generateAdaptiveFollowup,
    generateNextBaseQuestion,
    buildSessionSummary,
} = require("../service/mockInterview.service")


/**
 * @name startSessionController
 * @description Start a new mock interview session and return the first question.
 * @route POST /api/mock-interview/session/start
 *
 * Pattern: LLM-first, save-later + idempotent retry.
 * - If an active session exists WITH a valid turn → return cached result (client dropped).
 * - If an active session exists WITHOUT a turn → delete orphan, start fresh.
 * - LLM is called BEFORE any DB write, so a failure leaves no zombie records.
 */
async function startSessionController(req, res) {
    const { targetRole, difficulty, focusAreas, maxTurns, adaptiveEnabled, sourceReportId } = req.body

    if (!targetRole || !maxTurns) {
        return res.status(400).json({
            message: "targetRole and maxTurns are required.",
        })
    }

    // ── IDEMPOTENT RETRY CHECK ──
    const existingActive = await MockInterviewSession.findOne({
        user: req.user.id,
        status: "active",
    })

    if (existingActive) {
        // Check if a valid first turn exists for this session
        const existingTurn = await MockInterviewTurn.findOne({
            session: existingActive._id,
            turnNumber: 1,
        })

        if (existingTurn) {
            // Session + turn exist → client just didn't get the response last time
            return res.status(200).json({
                message: "Active session resumed.",
                session: {
                    id: existingActive._id,
                    status: existingActive.status,
                    targetRole: existingActive.targetRole,
                    difficulty: existingActive.difficulty,
                    maxTurns: existingActive.maxTurns,
                    currentTurn: existingActive.currentTurn,
                },
                turn: {
                    id: existingTurn._id,
                    turnNumber: existingTurn.turnNumber,
                    questionType: existingTurn.questionType,
                    question: existingTurn.question,
                },
            })
        } else {
            // Orphan session (no turn) → LLM failed last time → clean up
            await MockInterviewSession.deleteOne({ _id: existingActive._id })
            // Fall through to create a fresh session below
        }
    }

    // Optionally load report for context
    let report = null
    if (sourceReportId) {
        report = await InterviewReport.findOne({ _id: sourceReportId, user: req.user.id })
    }

    const contextSnapshot = buildSessionContext(report)

    // ── LLM FIRST: generate question before saving anything ──
    const firstQ = await generateFirstQuestion({
        targetRole,
        difficulty: difficulty || "medium",
        focusAreas: focusAreas || [],
        contextSnapshot,
        maxTurns,
    })
    // If LLM fails → throws → nothing saved → user can retry freely

    // ── SAVE AFTER LLM SUCCESS ──
    const session = await MockInterviewSession.create({
        user: req.user.id,
        sourceReport: sourceReportId || undefined,
        targetRole,
        difficulty: difficulty || "medium",
        focusAreas: focusAreas || [],
        maxTurns,
        adaptiveEnabled: adaptiveEnabled !== undefined ? adaptiveEnabled : true,
        contextSnapshot,
        status: "active",
        startedAt: new Date(),
        currentTurn: 1,
    })

    const turn = await MockInterviewTurn.create({
        session: session._id,
        user: req.user.id,
        turnNumber: 1,
        questionType: firstQ.questionType,
        question: firstQ.question,
        expectedSignals: firstQ.expectedSignals,
        isAdaptiveFollowup: false,
    })

    res.status(201).json({
        message: "Session started.",
        session: {
            id: session._id,
            status: session.status,
            targetRole: session.targetRole,
            difficulty: session.difficulty,
            maxTurns: session.maxTurns,
            currentTurn: session.currentTurn,
        },
        turn: {
            id: turn._id,
            turnNumber: turn.turnNumber,
            questionType: turn.questionType,
            question: turn.question,
            timeLimitSec: firstQ.timeLimitSec,
        },
    })
}


/**
 * @name submitAnswerController
 * @description Submit an answer for the current turn, get scored, receive next question or follow-up.
 * @route POST /api/mock-interview/session/:sessionId/answer
 *
 * Pattern: LLM-first, save-later + 3-scenario idempotent retry.
 * Scenario A: Turn has NO answer          → fresh evaluation (normal path).
 * Scenario B: Turn has answer + scores + next turn exists → full success, client dropped → return cached.
 * Scenario C: Turn has answer + scores + next turn MISSING → LLM#2 failed → retry next-question only.
 */
async function submitAnswerController(req, res) {
    const { sessionId } = req.params
    const { answer, latencyMs } = req.body

    if (!answer) {
        return res.status(400).json({ message: "answer is required." })
    }

    const session = await MockInterviewSession.findOne({
        _id: sessionId,
        user: req.user.id,
        status: "active",
    })
    if (!session) {
        return res.status(404).json({ message: "Active session not found." })
    }

    const currentTurn = await MockInterviewTurn.findOne({
        session: session._id,
        turnNumber: session.currentTurn,
    })
    if (!currentTurn) {
        return res.status(404).json({ message: "Current turn not found." })
    }

    const isLastTurn = session.currentTurn >= session.maxTurns

    // ── IDEMPOTENT RETRY CHECK (3 scenarios) ──
    if (currentTurn.answer && currentTurn.scores) {
        // Turn already evaluated — this is a retry

        if (!isLastTurn) {
            const existingNextTurn = await MockInterviewTurn.findOne({
                session: session._id,
                turnNumber: session.currentTurn + 1,
            })

            if (existingNextTurn) {
                // SCENARIO B: Everything succeeded, client just didn't get the response
                return res.status(200).json({
                    message: "Answer already evaluated (cached).",
                    evaluation: {
                        scores: currentTurn.scores,
                        feedback: currentTurn.feedback,
                    },
                    isLastTurn: false,
                    nextTurn: {
                        id: existingNextTurn._id,
                        turnNumber: existingNextTurn.turnNumber,
                        questionType: existingNextTurn.questionType,
                        question: existingNextTurn.question,
                        isAdaptiveFollowup: existingNextTurn.isAdaptiveFollowup,
                    },
                })
            }
            // SCENARIO C: Answer evaluated but next-question LLM failed
            // Fall through to the next-question generation below

        } else {
            // Last turn — no next question needed → return cached scores
            return res.status(200).json({
                message: "Final answer already evaluated (cached).",
                evaluation: {
                    scores: currentTurn.scores,
                    feedback: currentTurn.feedback,
                },
                isLastTurn: true,
                nextTurn: null,
            })
        }
    }

    // ── Check for different answer on already-evaluated turn ──
    if (currentTurn.answer && currentTurn.scores && currentTurn.answer !== answer) {
        return res.status(409).json({
            message: "This turn has already been evaluated with a different answer.",
        })
    }

    // ── FRESH EVALUATION (Scenario A — only if not already evaluated) ──
    let evaluationScores = currentTurn.scores
    let evaluationFeedback = currentTurn.feedback
    let followupDecision = currentTurn.feedback?.followupReason ? "needed" : "not_needed"

    if (!currentTurn.scores) {
        // Determine prior weak dimensions from previous turns
        const previousTurns = await MockInterviewTurn.find({
            session: session._id,
            turnNumber: { $lt: session.currentTurn },
            scores: { $exists: true },
        }).sort({ turnNumber: -1 }).limit(3)

        const priorWeakDimensions = []
        for (const pt of previousTurns) {
            if (pt.scores) {
                const dims = ["communication", "technicalDepth", "confidence", "structure"]
                for (const d of dims) {
                    if (pt.scores[d] < 50 && !priorWeakDimensions.includes(d)) {
                        priorWeakDimensions.push(d)
                    }
                }
            }
        }

        // ── LLM #1: Evaluate answer ──
        const evaluation = await evaluateTurn({
            question: currentTurn.question,
            expectedSignals: currentTurn.expectedSignals,
            answer,
            latencyMs,
            priorWeakDimensions,
        })
        // If LLM fails → throws → nothing saved → user can retry freely

        // Save answer + scores together (atomic commit after LLM success)
        currentTurn.answer = answer
        currentTurn.latencyMs = latencyMs || null
        currentTurn.scores = evaluation.scores
        currentTurn.feedback = {
            whatWentWell: evaluation.feedback.whatWentWell,
            improveNext: evaluation.feedback.improveNext,
            followupReason: evaluation.followupReason || "",
        }
        await currentTurn.save()

        evaluationScores = evaluation.scores
        evaluationFeedback = evaluation.feedback
        followupDecision = evaluation.followupDecision

        // Save question to question bank (non-critical upsert)
        try {
            await QuestionBankItem.findOneAndUpdate(
                { user: req.user.id, question: currentTurn.question },
                {
                    $set: {
                        questionType: currentTurn.questionType === "followup" ? "technical" : currentTurn.questionType,
                        difficulty: session.difficulty,
                        lastScore: evaluation.scores.overall,
                        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    },
                    $inc: {
                        timesSeen: 1,
                        timesCorrect: evaluation.scores.overall >= 60 ? 1 : 0,
                    },
                    $setOnInsert: {
                        sourceReport: session.sourceReport,
                        topicTags: session.focusAreas || [],
                        stabilityBucket: 1,
                    },
                },
                { upsert: true, new: true }
            )
        } catch (err) {
            // Non-critical — don't fail the answer flow
            console.error("Question bank upsert error:", err.message)
        }
    }

    // ── NEXT QUESTION GENERATION (LLM #2) ──
    let nextTurnData = null

    if (!isLastTurn) {
        let nextQ = null
        let isFollowup = false

        // Check if adaptive follow-up is needed
        if (session.adaptiveEnabled && followupDecision === "needed") {
            const dims = { communication: evaluationScores.communication, technicalDepth: evaluationScores.technicalDepth, confidence: evaluationScores.confidence, structure: evaluationScores.structure }
            const weakest = Object.entries(dims).sort((a, b) => a[1] - b[1])[0][0]

            nextQ = await generateAdaptiveFollowup({
                question: currentTurn.question,
                answer: currentTurn.answer,
                weakestDimension: weakest,
                targetRole: session.targetRole,
            })
            isFollowup = true
        } else {
            const allTurns = await MockInterviewTurn.find({ session: session._id }).select("question")
            const previousQuestions = allTurns.map(t => t.question)

            nextQ = await generateNextBaseQuestion({
                targetRole: session.targetRole,
                difficulty: session.difficulty,
                focusAreas: session.focusAreas,
                contextSnapshot: session.contextSnapshot,
                turnNumber: session.currentTurn + 1,
                maxTurns: session.maxTurns,
                previousQuestions,
            })
            isFollowup = false
        }
        // If LLM #2 fails → throws → answer+scores ARE saved (good!)
        // → on retry, Scenario C kicks in and retries only this part

        // Advance turn
        session.currentTurn += 1
        await session.save()

        const nextTurn = await MockInterviewTurn.create({
            session: session._id,
            user: req.user.id,
            turnNumber: session.currentTurn,
            questionType: nextQ.questionType,
            question: nextQ.question,
            expectedSignals: nextQ.expectedSignals,
            isAdaptiveFollowup: isFollowup,
        })

        nextTurnData = {
            id: nextTurn._id,
            turnNumber: nextTurn.turnNumber,
            questionType: nextTurn.questionType,
            question: nextTurn.question,
            timeLimitSec: nextQ.timeLimitSec,
            isAdaptiveFollowup: isFollowup,
        }
    }

    res.status(200).json({
        message: isLastTurn ? "Final answer submitted. Complete the session to get your summary." : "Answer evaluated.",
        evaluation: {
            scores: evaluationScores,
            feedback: evaluationFeedback,
        },
        isLastTurn,
        nextTurn: nextTurnData,
    })
}


/**
 * @name completeSessionController
 * @description Finalize session — aggregate scores and generate coaching summary.
 * @route POST /api/mock-interview/session/:sessionId/complete
 */
async function completeSessionController(req, res) {
    const { sessionId } = req.params

    const session = await MockInterviewSession.findOne({
        _id: sessionId,
        user: req.user.id,
        status: "active",
    })
    if (!session) {
        return res.status(404).json({ message: "Active session not found." })
    }

    const turns = await MockInterviewTurn.find({ session: session._id }).sort({ turnNumber: 1 })

    // Check that all turns have been answered
    const answeredTurns = turns.filter(t => t.answer && t.scores)
    if (answeredTurns.length === 0) {
        return res.status(400).json({ message: "No turns have been answered yet." })
    }

    // Aggregate scores (average across answered turns)
    const dims = ["communication", "technicalDepth", "confidence", "structure", "overall"]
    const avgScores = {}
    for (const dim of dims) {
        const sum = answeredTurns.reduce((acc, t) => acc + (t.scores[dim] || 0), 0)
        avgScores[dim] = Math.round(sum / answeredTurns.length)
    }

    // Generate coaching summary via LLM
    const summary = await buildSessionSummary(answeredTurns)

    // Update session
    session.status = "completed"
    session.endedAt = new Date()
    session.overallScores = avgScores
    session.summary = summary
    await session.save()

    res.status(200).json({
        message: "Session completed.",
        session: {
            id: session._id,
            status: session.status,
            targetRole: session.targetRole,
            difficulty: session.difficulty,
            turnsCompleted: answeredTurns.length,
            maxTurns: session.maxTurns,
            overallScores: avgScores,
            summary,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
        },
    })
}


/**
 * @name abandonSessionController
 * @description Mark an active session as abandoned.
 * @route POST /api/mock-interview/session/:sessionId/abandon
 */
async function abandonSessionController(req, res) {
    const { sessionId } = req.params

    const session = await MockInterviewSession.findOneAndUpdate(
        { _id: sessionId, user: req.user.id, status: "active" },
        { status: "abandoned", endedAt: new Date() },
        { new: true }
    )
    if (!session) {
        return res.status(404).json({ message: "Active session not found." })
    }

    res.status(200).json({
        message: "Session abandoned.",
        session: { id: session._id, status: session.status },
    })
}


/**
 * @name getActiveSessionController
 * @description Get the latest active session for quick resume.
 * @route GET /api/mock-interview/session/active
 */
async function getActiveSessionController(req, res) {
    const session = await MockInterviewSession.findOne({
        user: req.user.id,
        status: "active",
    }).sort({ updatedAt: -1 })

    if (!session) {
        return res.status(404).json({ message: "No active session found." })
    }

    // Get the current unanswered turn
    const currentTurn = await MockInterviewTurn.findOne({
        session: session._id,
        turnNumber: session.currentTurn,
    })

    res.status(200).json({
        message: "Active session found.",
        session: {
            id: session._id,
            status: session.status,
            targetRole: session.targetRole,
            difficulty: session.difficulty,
            currentTurn: session.currentTurn,
            maxTurns: session.maxTurns,
            startedAt: session.startedAt,
        },
        currentTurn: currentTurn ? {
            id: currentTurn._id,
            turnNumber: currentTurn.turnNumber,
            questionType: currentTurn.questionType,
            question: currentTurn.question,
            hasAnswer: !!currentTurn.answer,
        } : null,
    })
}


/**
 * @name getSessionByIdController
 * @description Get a full session with all turns (replay-ready).
 * @route GET /api/mock-interview/session/:sessionId
 */
async function getSessionByIdController(req, res) {
    const { sessionId } = req.params

    const session = await MockInterviewSession.findOne({
        _id: sessionId,
        user: req.user.id,
    })
    if (!session) {
        return res.status(404).json({ message: "Session not found." })
    }

    const turns = await MockInterviewTurn.find({ session: session._id })
        .sort({ turnNumber: 1 })
        .select("-__v")

    res.status(200).json({
        message: "Session fetched.",
        session: {
            id: session._id,
            status: session.status,
            targetRole: session.targetRole,
            difficulty: session.difficulty,
            currentTurn: session.currentTurn,
            maxTurns: session.maxTurns,
            overallScores: session.overallScores,
            summary: session.summary,
            startedAt: session.startedAt,
            endedAt: session.endedAt,
        },
        turns: turns.map(t => ({
            id: t._id,
            turnNumber: t.turnNumber,
            questionType: t.questionType,
            question: t.question,
            answer: t.answer,
            latencyMs: t.latencyMs,
            scores: t.scores,
            feedback: t.feedback,
            isAdaptiveFollowup: t.isAdaptiveFollowup,
        })),
    })
}


/**
 * @name getHistoryController
 * @description Get paginated interview session history.
 * @route GET /api/mock-interview/history
 */
async function getHistoryController(req, res) {
    const { page = 1, limit = 10, status, from, to } = req.query

    const filter = { user: req.user.id }
    if (status) filter.status = status
    if (from || to) {
        filter.createdAt = {}
        if (from) filter.createdAt.$gte = new Date(from)
        if (to) filter.createdAt.$lte = new Date(to)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [sessions, total] = await Promise.all([
        MockInterviewSession.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("status targetRole difficulty maxTurns currentTurn overallScores startedAt endedAt createdAt"),
        MockInterviewSession.countDocuments(filter),
    ])

    res.status(200).json({
        message: "History fetched.",
        sessions,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    })
}


/**
 * @name getTrendsController
 * @description Get score trends over a time window.
 * @route GET /api/mock-interview/trends
 */
async function getTrendsController(req, res) {
    const { window: timeWindow = "30d" } = req.query

    const windowMap = { "7d": 7, "30d": 30, "90d": 90 }
    const days = windowMap[timeWindow] || 30

    const since = new Date()
    since.setDate(since.getDate() - days)

    const sessions = await MockInterviewSession.find({
        user: req.user.id,
        status: "completed",
        endedAt: { $gte: since },
    })
        .sort({ endedAt: 1 })
        .select("overallScores targetRole endedAt difficulty")

    const trends = sessions.map(s => ({
        sessionId: s._id,
        date: s.endedAt,
        targetRole: s.targetRole,
        difficulty: s.difficulty,
        scores: s.overallScores,
    }))

    res.status(200).json({
        message: "Trends fetched.",
        window: timeWindow,
        totalSessions: trends.length,
        trends,
    })
}


module.exports = {
    startSessionController,
    submitAnswerController,
    completeSessionController,
    abandonSessionController,
    getActiveSessionController,
    getSessionByIdController,
    getHistoryController,
    getTrendsController,
}
