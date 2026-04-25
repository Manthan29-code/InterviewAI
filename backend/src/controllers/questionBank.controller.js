const QuestionBankItem = require("../model/questionBankItem.model")
const { computeNextReviewAt } = require("../service/revision.service")


/**
 * @name getQuestionBankController
 * @description Get filtered question bank list, optionally showing only due items.
 * @route GET /api/mock-interview/question-bank
 */
async function getQuestionBankController(req, res) {
    const { topic, type, dueOnly, page = 1, limit = 20 } = req.query

    const filter = { user: req.user.id }
    if (topic) filter.topicTags = { $in: [topic] }
    if (type) filter.questionType = type
    if (dueOnly === "true") {
        filter.nextReviewAt = { $lte: new Date() }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [items, total] = await Promise.all([
        QuestionBankItem.find(filter)
            .sort({ nextReviewAt: 1 })
            .skip(skip)
            .limit(parseInt(limit))
            .select("-__v"),
        QuestionBankItem.countDocuments(filter),
    ])

    res.status(200).json({
        message: "Question bank fetched.",
        items,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
        },
    })
}


/**
 * @name recordReviewController
 * @description Record a user's review outcome and update the revision schedule.
 * @route POST /api/mock-interview/question-bank/:id/review
 */
async function recordReviewController(req, res) {
    const { id } = req.params
    const { score } = req.body

    if (score === undefined || score === null) {
        return res.status(400).json({ message: "score is required (0-100)." })
    }

    const item = await QuestionBankItem.findOne({ _id: id, user: req.user.id })
    if (!item) {
        return res.status(404).json({ message: "Question bank item not found." })
    }

    const wasCorrect = score >= 60
    const { nextReviewAt, newBucket } = computeNextReviewAt(item.stabilityBucket, wasCorrect)

    item.timesSeen += 1
    if (wasCorrect) item.timesCorrect += 1
    item.lastScore = score
    item.stabilityBucket = newBucket
    item.nextReviewAt = nextReviewAt
    await item.save()

    res.status(200).json({
        message: "Review recorded.",
        item: {
            id: item._id,
            question: item.question,
            timesSeen: item.timesSeen,
            timesCorrect: item.timesCorrect,
            lastScore: item.lastScore,
            stabilityBucket: item.stabilityBucket,
            nextReviewAt: item.nextReviewAt,
        },
    })
}


module.exports = {
    getQuestionBankController,
    recordReviewController,
}
