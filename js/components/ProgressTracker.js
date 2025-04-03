// --- File: js/components/ProgressTracker.js ---
// UPDATE: Adapt to V3 HTML structure using specific IDs within .session-stats

export class ProgressTracker {
    /**
     * Creates an instance of ProgressTracker.
     * @param {HTMLElement} trackerElement - The container element for progress info (.session-stats).
     */
    constructor(trackerElement) {
        if (!trackerElement) {
            throw new Error("ProgressTracker requires a valid tracker element (.session-stats).");
        }
        this.trackerEl = trackerElement; // This is the .session-stats div

        // Find elements by their new IDs
        this.remainingEl = this.trackerEl.querySelector('#stat-remaining');
        this.accuracyEl = this.trackerEl.querySelector('#stat-accuracy');
        this.timeEl = this.trackerEl.querySelector('#stat-time');

        // Verify elements were found
        if (!this.remainingEl || !this.accuracyEl || !this.timeEl) {
            console.error("Progress tracker is missing expected child elements (#stat-remaining, #stat-accuracy, #stat-time). Update display might fail.");
        }

        // Initialize display
        this.update({ remaining: 0, total: 0, correct: 0, incorrect: 0, time: '00:00' });
    }

    /**
     * Updates the progress display.
     * @param {object} stats - Statistics object.
     * @param {number} stats.remaining - Cards left.
     * @param {number} stats.total - Total cards started.
     * @param {number} stats.correct - Correct reviews.
     * @param {number} stats.incorrect - Incorrect reviews.
     * @param {string} stats.time - Formatted time string.
     */
    update({ remaining, total, correct, incorrect, time }) {
        // Update text content, keeping the icon SVG
        const updateStat = (element, text) => {
            if (element) {
                const icon = element.querySelector('svg');
                // Set text content directly, assumes icon is first child
                 element.textContent = ` ${text}`; // Add space after icon
                 if (icon) {
                     element.prepend(icon); // Prepend icon back
                 }
            }
        };

        updateStat(this.remainingEl, `${remaining} Left`);

        const studied = correct + incorrect;
        const accuracy = studied > 0 ? Math.round((correct / studied) * 100) : 0;
        updateStat(this.accuracyEl, `${accuracy}% Accuracy`);

        updateStat(this.timeEl, time);
    }
}