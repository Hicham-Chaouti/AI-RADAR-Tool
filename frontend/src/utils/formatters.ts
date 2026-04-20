/** Utility formatters for display values. */

/** Format a radar score (0–10) to one decimal place. */
export function formatScore(score: number): string {
    return score.toFixed(1)
}

/** Format a date string to a locale-formatted date. */
export function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

/** Format milliseconds to a human-readable duration. */
export function formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
}
