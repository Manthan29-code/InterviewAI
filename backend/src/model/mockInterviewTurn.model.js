const mongoose = require("mongoose")


const turnScoreSubSchema = new mongoose.Schema({
    communication: { type: Number, min: 0, max: 100 },
    technicalDepth: { type: Number, min: 0, max: 100 },
    confidence: { type: Number, min: 0, max: 100 },
    structure: { type: Number, min: 0, max: 100 },
    overall: { type: Number, min: 0, max: 100 },
}, { _id: false })


const turnFeedbackSubSchema = new mongoose.Schema({
    whatWentWell: [{ type: String }],
    improveNext: [{ type: String }],
    followupReason: { type: String, default: "" },
}, { _id: false })


const mockInterviewTurnSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MockInterviewSession",
        required: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    turnNumber: {
        type: Number,
        required: [true, "Turn number is required"],
    },
    questionType: {
        type: String,
        enum: ["technical", "behavioral", "followup"],
    },
    question: {
        type: String,
        required: [true, "Question is required"],
    },
    expectedSignals: [{ type: String }],
    answer: { type: String, default: "" },
    latencyMs: { type: Number },
    scores: turnScoreSubSchema,
    feedback: turnFeedbackSubSchema,
    isAdaptiveFollowup: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
})


mockInterviewTurnSchema.index({ session: 1, turnNumber: 1 }, { unique: true })
mockInterviewTurnSchema.index({ user: 1, createdAt: -1 })


const MockInterviewTurn = mongoose.model("MockInterviewTurn", mockInterviewTurnSchema)

module.exports = MockInterviewTurn
