const SkillRoadmap = require("../model/skillRoadmap.model")
const InterviewReport = require("../model/interviewReport.model")
const { generateSkillResources } = require("../service/roadmap.service")


/**
 * @name generateRoadmapController
 * @description Generate a skill roadmap from an interview report's skill gaps.
 * @route POST /api/mock-interview/roadmap/generate
 */
async function generateRoadmapController(req, res) {
    const { reportId } = req.body

    if (!reportId) {
        return res.status(400).json({ message: "reportId is required." })
    }

    const report = await InterviewReport.findOne({ _id: reportId, user: req.user.id })
    if (!report) {
        return res.status(404).json({ message: "Interview report not found." })
    }

    if (!report.skillGaps || report.skillGaps.length === 0) {
        return res.status(400).json({ message: "No skill gaps found in this report." })
    }

    const roadmaps = []
    for (const gap of report.skillGaps) {
        // Skip if roadmap already exists for this skill+report
        const existing = await SkillRoadmap.findOne({
            user: req.user.id,
            sourceReport: reportId,
            skill: gap.skill,
        })
        if (existing) {
            roadmaps.push(existing)
            continue
        }

        // Generate tasks via LLM
        const { tasks } = await generateSkillResources({
            skill: gap.skill,
            severity: gap.severity,
            targetRole: report.title || "Software Engineer",
            candidateSummary: (report.resume || "").slice(0, 500),
        })

        const roadmap = await SkillRoadmap.create({
            user: req.user.id,
            sourceReport: reportId,
            skill: gap.skill,
            severity: gap.severity,
            tasks: tasks.map(t => ({
                title: t.title,
                resourceType: t.resourceType,
                resourceUrl: t.resourceUrl,
                estimatedMinutes: t.estimatedMinutes,
                status: "todo",
            })),
            progressPercent: 0,
        })

        roadmaps.push(roadmap)
    }

    res.status(201).json({
        message: "Roadmap generated.",
        roadmaps: roadmaps.map(r => ({
            id: r._id,
            skill: r.skill,
            severity: r.severity,
            tasks: r.tasks,
            progressPercent: r.progressPercent,
        })),
    })
}


/**
 * @name getRoadmapController
 * @description Get roadmaps for a specific report.
 * @route GET /api/mock-interview/roadmap
 */
async function getRoadmapController(req, res) {
    const { reportId } = req.query

    const filter = { user: req.user.id }
    if (reportId) filter.sourceReport = reportId

    const roadmaps = await SkillRoadmap.find(filter)
        .sort({ createdAt: -1 })
        .select("-__v")

    res.status(200).json({
        message: "Roadmaps fetched.",
        roadmaps,
    })
}


/**
 * @name updateRoadmapTaskController
 * @description Update a specific task's status in a roadmap and recompute progress.
 * @route PATCH /api/mock-interview/roadmap/:id/task/:taskId
 */
async function updateRoadmapTaskController(req, res) {
    const { id, taskId } = req.params
    const { status } = req.body

    if (!status || !["todo", "in_progress", "done"].includes(status)) {
        return res.status(400).json({ message: "status must be one of: todo, in_progress, done" })
    }

    const roadmap = await SkillRoadmap.findOne({ _id: id, user: req.user.id })
    if (!roadmap) {
        return res.status(404).json({ message: "Roadmap not found." })
    }

    const task = roadmap.tasks.id(taskId)
    if (!task) {
        return res.status(404).json({ message: "Task not found." })
    }

    task.status = status

    // Recompute progress
    const totalTasks = roadmap.tasks.length
    const doneTasks = roadmap.tasks.filter(t => t.status === "done").length
    roadmap.progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

    await roadmap.save()

    res.status(200).json({
        message: "Task updated.",
        roadmap: {
            id: roadmap._id,
            skill: roadmap.skill,
            progressPercent: roadmap.progressPercent,
            tasks: roadmap.tasks,
        },
    })
}


module.exports = {
    generateRoadmapController,
    getRoadmapController,
    updateRoadmapTaskController,
}
