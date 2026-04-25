const mongoose = require("mongoose")


const questionBankItemSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    sourceReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
    },
    question: {
        type: String,
        required: [true, "Question text is required"],
    },
    questionType: {
        type: String,
        enum: ["technical", "behavioral"],
    },
    topicTags: [{ type: String }],
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
    },
    timesSeen: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    lastScore: { type: Number },
    nextReviewAt: { type: Date, index: true },
    stabilityBucket: { type: Number, default: 1 },
}, {
    timestamps: true,
})


questionBankItemSchema.index({ user: 1, nextReviewAt: 1 })
questionBankItemSchema.index({ user: 1, question: 1 }, { unique: true })


const QuestionBankItem = mongoose.model("QuestionBankItem", questionBankItemSchema)

module.exports = QuestionBankItem
