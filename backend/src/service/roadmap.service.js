const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
})

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview"


const roadmapTasksSchema = z.object({
    tasks: z.array(z.object({
        title: z.string()
            .describe("Short title describing the learning task"),
        resourceType: z.enum(["article", "video", "practice", "project", "other"])
            .describe("Type of learning resource"),
        resourceUrl: z.string()
            .describe("URL to the recommended resource"),
        estimatedMinutes: z.number().min(5).max(480)
            .describe("Estimated time to complete in minutes"),
    })).describe("List of 3-6 actionable learning tasks for this skill gap"),
})


/**
 * Generate learning tasks for a given skill gap.
 */
async function generateSkillResources({ skill, severity, targetRole, candidateSummary }) {
    const prompt = `Generate a learning roadmap for the following skill gap.

Skill: ${skill}
Severity: ${severity}
Target role: ${targetRole}
Current level hint: ${candidateSummary || "Not provided"}

Requirements:
- Provide 3-6 actionable tasks.
- Include real, well-known resources (documentation, courses, videos).
- Order from fundamentals to advanced.
- Estimate realistic completion times.

Return valid JSON only.`

    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(roadmapTasksSchema),
        },
    })

    return JSON.parse(response.text)
}


module.exports = { generateSkillResources }
