const mongoose = require("mongoose")


const scoreSubSchema = new mongoose.Schema({
    communication: { type: Number, min: 0, max: 100, default: 0 },
    technicalDepth: { type: Number, min: 0, max: 100, default: 0 },
    confidence: { type: Number, min: 0, max: 100, default: 0 },
    structure: { type: Number, min: 0, max: 100, default: 0 },
    overall: { type: Number, min: 0, max: 100, default: 0 },
}, { _id: false })


const summarySubSchema = new mongoose.Schema({
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    nextFocus: [{ type: String }],
    weeklyPlan: [{ type: String }],
}, { _id: false })


const contextSnapshotSubSchema = new mongoose.Schema({
    resumeSummary: { type: String, default: "" },
    selectedWeaknesses: [{ type: String }],
    constraints: { type: String, default: "" },
}, { _id: false })


const mockInterviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    sourceReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        index: true,
    },
    mode: {
        type: String,
        enum: ["written"],
        default: "written",
    },
    status: {
        type: String,
        enum: ["active", "completed", "abandoned"],
        required: true,
        index: true,
        default: "active",
    },
    targetRole: {
        type: String,
        required: [true, "Target role is required"],
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
    },
    focusAreas: [{ type: String }],
    maxTurns: {
        type: Number,
        required: [true, "Max turns is required"],
        min: 1,
        max: 30,
    },
    currentTurn: {
        type: Number,
        default: 0,
    },
    adaptiveEnabled: {
        type: Boolean,
        default: true,
    },
    contextSnapshot: contextSnapshotSubSchema,
    overallScores: scoreSubSchema,
    summary: summarySubSchema,
    startedAt: { type: Date },
    endedAt: { type: Date },
}, {
    timestamps: true,
})


mockInterviewSessionSchema.index({ user: 1, createdAt: -1 })
mockInterviewSessionSchema.index({ user: 1, status: 1, updatedAt: -1 })


const MockInterviewSession = mongoose.model("MockInterviewSession", mockInterviewSessionSchema)

module.exports = MockInterviewSession
