const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
})

const MODEL = process.env.GEMINI_MODEL || "gemini-3-flash-preview"


// ─── Shared Score Schema ─────────────────────────────────────────────────────

const scoreSchema = z.object({
    communication: z.number().min(0).max(100)
        .describe("Score for clarity, grammar, and conciseness"),
    technicalDepth: z.number().min(0).max(100)
        .describe("Score for correctness, depth, and trade-off awareness"),
    confidence: z.number().min(0).max(100)
        .describe("Score for directness, ownership, and decisiveness"),
    structure: z.number().min(0).max(100)
        .describe("Score for logical flow and completeness"),
    overall: z.number().min(0).max(100)
        .describe("Weighted summary score of all dimensions"),
})


// ─── 1) First Question Schema ───────────────────────────────────────────────

const firstQuestionSchema = z.object({
    questionType: z.enum(["technical", "behavioral"])
        .describe("Whether this is a technical or behavioral question"),
    question: z.string()
        .describe("The interview question to ask the candidate"),
    expectedSignals: z.array(z.string())
        .describe("Key points or signals expected in a good answer"),
    timeLimitSec: z.number().min(30).max(600)
        .describe("Realistic time limit in seconds for a written response"),
    rationale: z.string()
        .describe("Why this question was chosen based on candidate context"),
})


// ─── 2) Turn Evaluation Schema ──────────────────────────────────────────────

const turnEvaluationSchema = z.object({
    scores: scoreSchema,
    feedback: z.object({
        whatWentWell: z.array(z.string())
            .describe("List of things the candidate did well in this answer"),
        improveNext: z.array(z.string())
            .describe("List of specific areas the candidate should improve"),
    }),
    followupDecision: z.enum(["needed", "not_needed"])
        .describe("Whether a follow-up question is needed to probe deeper"),
    followupReason: z.string()
        .describe("Brief reason explaining the follow-up decision"),
})


// ─── 3) Follow-up Question Schema ───────────────────────────────────────────

const followupQuestionSchema = z.object({
    questionType: z.literal("followup")
        .describe("Always 'followup' for adaptive follow-up questions"),
    question: z.string()
        .describe("The follow-up question probing the candidate's weakest area"),
    expectedSignals: z.array(z.string())
        .describe("Key points expected in a good follow-up answer"),
    timeLimitSec: z.number().min(30).max(300)
        .describe("Time limit in seconds for the follow-up response"),
})


// ─── 4) Session Summary Schema ──────────────────────────────────────────────

const sessionSummarySchema = z.object({
    strengths: z.array(z.string())
        .describe("Top strengths demonstrated across all turns"),
    weaknesses: z.array(z.string())
        .describe("Key weakness areas that need improvement"),
    nextFocus: z.array(z.string())
        .describe("Specific topics or skills to focus on in the next session"),
    weeklyPlan: z.array(z.string())
        .describe("Day-by-day action items for the coming week to improve"),
})


// ─── 5) Next Base Question Schema ───────────────────────────────────────────

const nextBaseQuestionSchema = z.object({
    questionType: z.enum(["technical", "behavioral"])
        .describe("Whether this is a technical or behavioral question"),
    question: z.string()
        .describe("The next interview question to ask the candidate"),
    expectedSignals: z.array(z.string())
        .describe("Key points or signals expected in a good answer"),
    timeLimitSec: z.number().min(30).max(600)
        .describe("Realistic time limit in seconds for a written response"),
})


// ─── Helper: safe LLM call ──────────────────────────────────────────────────

async function callLLM(prompt, schema) {
    const response = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(schema),
        },
    })
    return JSON.parse(response.text)
}


// ─── Service Functions ──────────────────────────────────────────────────────


/**
 * Build context snapshot from optional report data.
 */
function buildSessionContext(report) {
    if (!report) {
        return { resumeSummary: "", selectedWeaknesses: [], constraints: "" }
    }
    const weaknesses = (report.skillGaps || []).map(g => `${g.skill} (${g.severity})`)
    return {
        resumeSummary: (report.resume || "").slice(0, 1500),
        selectedWeaknesses: weaknesses,
        constraints: report.jobDescription ? report.jobDescription.slice(0, 500) : "",
    }
}


/**
 * Generate the first interview question for a new session.
 */
async function generateFirstQuestion({ targetRole, difficulty, focusAreas, contextSnapshot, maxTurns }) {
    const prompt = `You are an expert interviewer. Generate the first interview question.

Context:
- Target role: ${targetRole}
- Difficulty: ${difficulty}
- Focus areas: ${(focusAreas || []).join(", ") || "general"}
- Candidate summary: ${contextSnapshot.resumeSummary || "Not provided"}
- Weakness hints: ${(contextSnapshot.selectedWeaknesses || []).join(", ") || "None"}
- Max turns in session: ${maxTurns}

Requirements:
- Ask exactly one question.
- Keep it specific to role and focus areas.
- Do not provide the answer.
- Time limit should be realistic for written response.

Return valid JSON only.`

    return callLLM(prompt, firstQuestionSchema)
}


/**
 * Evaluate a candidate's answer for the current turn.
 */
async function evaluateTurn({ question, expectedSignals, answer, latencyMs, priorWeakDimensions }) {
    const prompt = `You are evaluating a candidate's written interview answer.

Question:
${question}

Expected signals:
${JSON.stringify(expectedSignals || [])}

Candidate answer:
${answer}

Latency (ms): ${latencyMs || "N/A"}
Prior weak dimensions: ${(priorWeakDimensions || []).join(", ") || "None"}

Scoring rules:
- communication (0-100): clarity, grammar, conciseness
- technicalDepth (0-100): correctness, depth, trade-offs
- confidence (0-100): directness, ownership, decisiveness
- structure (0-100): logical flow and completeness
- overall (0-100): weighted summary of above

Return valid JSON only.`

    return callLLM(prompt, turnEvaluationSchema)
}


/**
 * Generate an adaptive follow-up question targeting the weakest dimension.
 */
async function generateAdaptiveFollowup({ question, answer, weakestDimension, targetRole }) {
    const prompt = `Create one adaptive follow-up interview question.

Previous question:
${question}

Candidate answer:
${answer}

Weakest dimension:
${weakestDimension}

Role context:
${targetRole}

Requirements:
- One follow-up question only.
- Must probe the missing depth in the candidate answer.
- Avoid repeating the same wording.

Return valid JSON only.`

    return callLLM(prompt, followupQuestionSchema)
}


/**
 * Generate the next base question (not a follow-up).
 */
async function generateNextBaseQuestion({ targetRole, difficulty, focusAreas, contextSnapshot, turnNumber, maxTurns, previousQuestions }) {
    const prompt = `You are an expert interviewer. Generate the next interview question.

Context:
- Target role: ${targetRole}
- Difficulty: ${difficulty}
- Focus areas: ${(focusAreas || []).join(", ") || "general"}
- Candidate summary: ${contextSnapshot.resumeSummary || "Not provided"}
- Current turn: ${turnNumber} of ${maxTurns}
- Previous questions asked (do not repeat): ${(previousQuestions || []).join(" | ") || "None"}

Requirements:
- Ask exactly one question.
- Vary between technical and behavioral.
- Do not repeat previous questions.
- Keep it specific to role and focus areas.
- Do not provide the answer.

Return valid JSON only.`

    return callLLM(prompt, nextBaseQuestionSchema)
}


/**
 * Generate a coaching summary at end of session.
 */
async function buildSessionSummary(turns) {
    const turnsData = turns.map(t => ({
        turnNumber: t.turnNumber,
        questionType: t.questionType,
        question: t.question,
        scores: t.scores,
        feedback: t.feedback,
        isAdaptiveFollowup: t.isAdaptiveFollowup,
    }))

    const scoreTrend = turns.map(t => ({
        turn: t.turnNumber,
        ...( t.scores ? t.scores.toObject ? t.scores.toObject() : t.scores : {} ),
    }))

    const prompt = `Summarize this interview session into actionable coaching.

Turns data:
${JSON.stringify(turnsData, null, 2)}

Overall score trends:
${JSON.stringify(scoreTrend, null, 2)}

Return valid JSON only.`

    return callLLM(prompt, sessionSummarySchema)
}


module.exports = {
    buildSessionContext,
    generateFirstQuestion,
    evaluateTurn,
    generateAdaptiveFollowup,
    generateNextBaseQuestion,
    buildSessionSummary,
}
