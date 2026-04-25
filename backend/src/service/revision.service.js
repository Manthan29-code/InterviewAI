/**
 * Spaced repetition service.
 * Uses a simple stability-bucket approach:
 *   nextReviewAt = now + (bucket * baseIntervalDays)
 * Each correct review bumps bucket up, each incorrect resets to 1.
 */


const BASE_INTERVAL_DAYS = 1


/**
 * Compute the next review date based on performance.
 * @param {number} currentBucket - current stability bucket (>= 1)
 * @param {boolean} wasCorrect   - did the user answer correctly (score >= 60)
 * @returns {{ nextReviewAt: Date, newBucket: number }}
 */
function computeNextReviewAt(currentBucket, wasCorrect) {
    const newBucket = wasCorrect
        ? Math.min(currentBucket + 1, 10)
        : 1

    const daysUntilReview = newBucket * BASE_INTERVAL_DAYS
    const nextReviewAt = new Date()
    nextReviewAt.setDate(nextReviewAt.getDate() + daysUntilReview)

    return { nextReviewAt, newBucket }
}


module.exports = { computeNextReviewAt }
