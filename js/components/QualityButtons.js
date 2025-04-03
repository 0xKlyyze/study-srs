// --- File: js/components/QualityButtons.js ---

/**
 * Manages the quality rating buttons in the study interface.
 * Listens for clicks and notifies a handler function with the selected quality.
 */
export class QualityButtons {
    /**
     * Creates an instance of QualityButtons.
     * @param {HTMLElement} buttonContainerElement - The container element holding the quality buttons (e.g., div.quality-buttons).
     * @param {function(number): void} onQualitySelected - Callback function to execute when a quality button is clicked. It receives the quality value (0-3) as an argument.
     */
    constructor(buttonContainerElement, onQualitySelected) {
        if (!buttonContainerElement) {
            throw new Error("QualityButtons requires a valid button container element.");
        }
        if (typeof onQualitySelected !== 'function') {
            throw new Error("QualityButtons requires an 'onQualitySelected' callback function.");
        }

        this.containerEl = buttonContainerElement;
        this.onQualitySelected = onQualitySelected;
        // Find all buttons with the 'quality-btn' class within the container
        this.buttons = this.containerEl.querySelectorAll('.quality-btn');

        this._setupEventListeners();
    }

    /**
     * Sets up click event listeners for each quality button.
     * @private
     */
    _setupEventListeners() {
        // Use event delegation on the container for slightly better performance
        // if buttons were added/removed dynamically, but direct listeners are fine here.
        this.buttons.forEach(button => {
            // Ensure 'this' context is correct in the handler
            const handleClick = (event) => {
                console.log(`DEBUG: QualityButton CLICKED. Button:`, event.target.closest('.quality-btn'), 'Timestamp:', Date.now());
                // Find the clicked button element, even if the click was on a child (like the span)
                const clickedButton = event.target.closest('.quality-btn');
                if (!clickedButton) return; // Click was not on a button or its descendant

                // Retrieve the quality value from the 'data-quality' attribute
                const qualityString = clickedButton.getAttribute('data-quality');

                if (qualityString !== null) {
                    const quality = parseInt(qualityString, 10);
                    if (!isNaN(quality)) {
                        // Call the provided callback function with the integer quality value
                        this.onQualitySelected(quality);
                    } else {
                        console.error("Invalid data-quality attribute found:", qualityString);
                    }
                } else {
                     console.error("Button is missing data-quality attribute:", clickedButton);
                }
            };
            // Add listener
            button.addEventListener('click', handleClick);
        });
    }

    /**
     * Optional: Method to enable/disable all quality buttons (e.g., during API calls).
     * @param {boolean} disabled - True to disable, false to enable.
     */
    setDisabled(disabled) {
        this.buttons.forEach(button => {
            button.disabled = disabled;
        });
    }
}

// Example Usage (would typically be in studyView.js or similar):
/*
import { QualityButtons } from './components/QualityButtons.js';
// Assuming apiClient is imported for the actual review submission

document.addEventListener('DOMContentLoaded', () => {
    const qualityButtonsContainer = document.querySelector('.quality-buttons');
    const currentCardId = 'mock-card-id-123'; // Should be dynamically set

    if (qualityButtonsContainer) {
        const qualityButtons = new QualityButtons(qualityButtonsContainer, (selectedQuality) => {
            console.log(`Quality selected: ${selectedQuality} for card ${currentCardId}`);

            // Disable buttons while submitting
            qualityButtons.setDisabled(true);

            // --- Placeholder for API call using apiClient ---
            // apiClient.submitReview(currentCardId, selectedQuality)
            //     .then(reviewResult => {
            //         console.log('Review submitted successfully:', reviewResult);
            //         // Load the next card here...
            //     })
            //     .catch(error => {
            //         console.error('Failed to submit review:', error);
            //         // Handle error, maybe show a message to the user
            //     })
            //     .finally(() => {
            //         // Re-enable buttons regardless of success/failure
            //         qualityButtons.setDisabled(false);
            //     });
            // --- End Placeholder ---

             // Simulate enabling buttons after a delay
             setTimeout(() => qualityButtons.setDisabled(false), 500);
        });
    }
});
*/