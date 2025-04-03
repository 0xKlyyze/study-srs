// --- File: js/services/KeyboardShortcuts.js ---
// UPDATE: Pass the event object to the callback function in _handleKeyDown.

/**
 * Manages global keyboard shortcuts for the application.
 * Allows registering callbacks for specific key presses.
 */
export class KeyboardShortcuts {
    /**
     * Creates an instance of KeyboardShortcuts.
     */
    constructor() {
        // Use a Map to store key bindings: key -> callback function
        this.keyBindings = new Map();
        this._handleKeyDown = this._handleKeyDown.bind(this); // Bind 'this' for the event listener
    }

    /**
     * Registers a callback function for a specific key.
     * Note: Uses event.key, which is case-sensitive for letters ('d' vs 'D').
     * Use lowercase keys for registration unless case matters specifically.
     * For keys like '1', '2', etc., the value is the character itself.
     *
     * @param {string} key - The key value (e.g., '1', 'd', 'ArrowUp', ' '). See https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
     * @param {function(event: KeyboardEvent): void} callback - The function to call when the key is pressed. It receives the event object.
     */
    register(key, callback) {
        if (typeof callback !== 'function') {
            console.error(`Invalid callback provided for key: ${key}`);
            return;
        }
        // Store keys in lowercase for registration to make matching case-insensitive
        // UNLESS the key is likely case-sensitive itself (like ' ')
        const registrationKey = (key.length === 1 && key !== ' ') ? key.toLowerCase() : key;
        this.keyBindings.set(registrationKey, callback);
        console.log(`Registered shortcut for key: ${key} (as ${registrationKey})`);
    }

    /**
     * Unregisters a shortcut for a specific key.
     * @param {string} key - The key to unregister.
     */
    unregister(key) {
        const registrationKey = (key.length === 1 && key !== ' ') ? key.toLowerCase() : key;
        this.keyBindings.delete(registrationKey);
        console.log(`Unregistered shortcut for key: ${key}`);
    }

    /**
     * Starts listening for keyboard events on the document.
     */
    startListening() {
        document.removeEventListener('keydown', this._handleKeyDown); // Ensure no duplicate listeners
        document.addEventListener('keydown', this._handleKeyDown);
        console.log("Keyboard shortcut listener started.");
    }

    /**
     * Stops listening for keyboard events. Useful when the component/view is destroyed
     * or shortcuts should be temporarily disabled.
     */
    stopListening() {
        document.removeEventListener('keydown', this._handleKeyDown);
        console.log("Keyboard shortcut listener stopped.");
    }

    /**
     * Handles the keydown event. Checks if the pressed key has a registered callback
     * and passes the event object to it.
     * @param {KeyboardEvent} event - The keyboard event object.
     * @private
     */
    _handleKeyDown(event) {
        // Ignore shortcuts if the user is typing in an input field, textarea, etc.
        const targetTagName = event.target.tagName.toLowerCase();
        const isContentEditable = event.target.isContentEditable; // Check contenteditable elements too

        if (targetTagName === 'input' || targetTagName === 'textarea' || targetTagName === 'select' || isContentEditable) {
            // Allow specific keys like Escape even in inputs, if needed later
            // if (event.key !== 'Escape') {
                return;
            // }
        }

        // Match the registration logic: lowercase for single chars (except space), otherwise use event.key
        const pressedKey = (event.key.length === 1 && event.key !== ' ') ? event.key.toLowerCase() : event.key;

        // Check if a callback exists for the pressed key
        const callback = this.keyBindings.get(pressedKey);

        if (callback) {
            // --- FIX: Pass the event object to the callback ---
            callback(event);
            // --------------------------------------------------

            // Note: event.preventDefault() should generally be called *inside* the specific callback
            // (like in studyView.js for Space) where it's known to be needed,
            // rather than globally here.
        }
    }
}

// --- Example Usage remains the same ---

// Example Usage (would typically be in studyView.js or similar):
/*
import { KeyboardShortcuts } from './services/KeyboardShortcuts.js';
// Assuming cardRenderer and qualityButtons instances exist

document.addEventListener('DOMContentLoaded', () => {
    const keyboardShortcuts = new KeyboardShortcuts();

    // Register shortcuts
    keyboardShortcuts.register('1', () => {
        console.log("Key 1 pressed - triggering Quality 0 action");
        // Simulate clicking the button or directly call the handler
        // qualityButtons.onQualitySelected(0); // Assuming direct call is possible/desired
         document.querySelector('.quality-btn[data-quality="0"]')?.click(); // Alternative: simulate click
    });
    keyboardShortcuts.register('2', () => {
         console.log("Key 2 pressed - triggering Quality 1 action");
        // qualityButtons.onQualitySelected(1);
         document.querySelector('.quality-btn[data-quality="1"]')?.click();
    });
    keyboardShortcuts.register('3', () => {
         console.log("Key 3 pressed - triggering Quality 2 action");
        // qualityButtons.onQualitySelected(2);
         document.querySelector('.quality-btn[data-quality="2"]')?.click();
    });
     keyboardShortcuts.register('4', () => {
         console.log("Key 4 pressed - triggering Quality 3 action");
        // qualityButtons.onQualitySelected(3);
         document.querySelector('.quality-btn[data-quality="3"]')?.click();
    });
    keyboardShortcuts.register('d', () => {
        console.log("Key D pressed - triggering toggle details");
        // Assuming cardRenderer instance exists
        // cardRenderer.toggleDetails();
         document.querySelector('.toggle-detail-btn')?.click(); // Alternative
    });
     // Add more shortcuts as needed (e.g., for Skip, End Session)

    // Start listening for key presses
    keyboardShortcuts.startListening();

    // Remember to call keyboardShortcuts.stopListening() if the view is ever removed/hidden
    // to prevent memory leaks or unwanted behavior.
});
*/