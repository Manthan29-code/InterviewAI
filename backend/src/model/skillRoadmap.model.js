const mongoose = require("mongoose")


const roadmapTaskSubSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Task title is required"],
    },
    resourceType: {
        type: String,
        enum: ["article", "video", "practice", "project", "other"],
    },
    resourceUrl: { type: String, default: "" },
    estimatedMinutes: { type: Number, min: 0 },
    status: {
        type: String,
        enum: ["todo", "in_progress", "done"],
        default: "todo",
    },
})


const skillRoadmapSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true,
    },
    sourceReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true,
        index: true,
    },
    skill: {
        type: String,
        required: [true, "Skill name is required"],
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
    },
    tasks: [roadmapTaskSubSchema],
    progressPercent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    targetDate: { type: Date },
}, {
    timestamps: true,
})


skillRoadmapSchema.index({ user: 1, sourceReport: 1, skill: 1 }, { unique: true })


const SkillRoadmap = mongoose.model("SkillRoadmap", skillRoadmapSchema)

module.exports = SkillRoadmap
