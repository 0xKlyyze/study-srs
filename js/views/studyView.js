// --- File: js/views/studyView.js ---
// UPDATE: Integrate V3 UI layout, selectors, flip button, loading state on body.

// Import necessary modules
import { apiClient } from '../api/apiClient.js';
import { CardRenderer } from '../components/CardRenderer.js';
import { QualityButtons } from '../components/QualityButtons.js';
import { ProgressTracker } from '../components/ProgressTracker.js';
import { KeyboardShortcuts } from '../services/KeyboardShortcuts.js';
import { debounce } from '../utils/helpers.js'; // Assuming debounce exists
// --- SAMPLE DATA FOR PREVIEW MODE ---
const sampleCardsData = [
    {
        id: 'sample-1',
        name: 'Sample Card One (Starred)',
        chapter: 'Preview Chapter',
        material: 'Sample',
        briefExplanation: 'This is the **brief** explanation for the first sample card.\n\nIt can include Markdown formatting and inline math like $E=mc^2$.',
        detailedExplanation: '### Detailed Explanation\n\nThis is the more detailed part, revealed on click.\n\n*   Supports lists.\n*   And more Markdown.\n\nDisplay math test:\n\n$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$\n\nEnd of details.',
        is_starred: true,
        is_buried: false,
        // --- Mock SRS/Status data for UI ---
        srs_data: { next_review: null, last_review: null, repetitions: 2, interval: 1, ease_factor: 2.5 }, // Example structure
        cardStatus: "Learning",
        relativeNextReview: "in 1d",
        relativeLastReview: "2h ago",
        masteryLevel: "Level 1"
    },
    {
        id: 'sample-2',
        name: 'Sample Card Two (Buried)',
        chapter: 'Preview Chapter',
        material: 'Sample',
        briefExplanation: 'This card is marked as **buried**. Some actions might be disabled.',
        detailedExplanation: '', // No detailed explanation
        is_starred: false,
        is_buried: true,
        srs_data: { next_review: null, last_review: null, repetitions: 0, interval: 0, ease_factor: 2.5 },
        cardStatus: "Buried",
        relativeNextReview: null,
        relativeLastReview: "5d ago",
        masteryLevel: "Level 0"
    },
    {
        id: 'sample-3',
        name: 'Sample Card Three (Text Only)',
        chapter: 'Preview Chapter',
        material: 'Sample',
        briefExplanation: 'A very simple card with just basic text content.',
        detailedExplanation: 'The detailed explanation is also quite brief here.',
        is_starred: false,
        is_buried: false,
        srs_data: { next_review: null, last_review: null, repetitions: 0, interval: 0, ease_factor: 2.5 },
        cardStatus: "New",
        relativeNextReview: "now",
        relativeLastReview: null,
        masteryLevel: null
    },
        {
        id: 'sample-4',
        name: 'Sample Card Four (Long Brief)',
        chapter: 'Preview Chapter',
        material: 'Sample',
        briefExplanation: 'This card has a longer brief explanation to test scrolling and layout within the card face before flipping. It includes some more inline math like $\\alpha + \\beta = \\gamma$ and continues with more text just to take up space and see how wrapping behaves. We want to ensure that even with more content, the layout remains stable and usable.',
        detailedExplanation: 'Detailed part is short.',
        is_starred: false,
        is_buried: false,
        srs_data: { next_review: null, last_review: null, repetitions: 1, interval: 0.5, ease_factor: 2.3 },
        cardStatus: "Learning",
        relativeNextReview: "in 12h",
        relativeLastReview: "1d ago",
        masteryLevel: "Level 1"
    }
];
// --- END SAMPLE DATA ---

/**
 * Manages the Study Session View (study-session.html - V3 Layout).
 */
class StudyView {
        constructor() {
            // --- DOM Element References ---
            this.bodyEl = document.body;
            this.studyAreaEl = document.getElementById('studyArea');
            this.sessionPillEl = document.querySelector('.session-pill');
            this.cardViewerEl = document.getElementById('cardViewer');
            this.qualityButtonsContainer = document.querySelector('.quality-buttons');
            this.progressTrackerEl = document.getElementById('progressTracker');
            this.skipButton = document.getElementById('skipBtn');
            this.endSessionButton = document.getElementById('endSessionBtn');
            this.flipButton = document.getElementById('flipBtn');
            this.cardFlipperEl = this.cardViewerEl?.querySelector('.card-flipper');
    
            // Card Action Buttons
            this.starBtn = document.getElementById('starBtn');
            this.buryBtn = document.getElementById('buryBtn');
            this.editBtn = document.getElementById('editBtn');
            this.deleteBtn = document.getElementById('deleteBtn');
            this.aiBtn = document.getElementById('aiBtn');
    
            // *** NEW: Focus Mode Button Reference ***
            // IMPORTANT: Add a button with this ID to your study-session.html
            // Example: <button id="focusModeToggleBtn" class="icon-btn" title="Toggle Focus Mode (F)">...</button>
            //          Place it in a column or the session pill.
            this.focusModeToggleBtn = document.getElementById('focusModeToggleBtn');
    
            // Completion Screen Elements
            // ... (keep existing completion refs) ...
            this.completionContainer = document.getElementById('sessionCompleteContainer');
            this.completionMessageEl = document.getElementById('completionMessage');
            this.returnBtn = document.getElementById('returnBtn');
            this.studyGlobalMaterialBtn = document.getElementById('studyGlobalMaterialBtn');
            this.studyOtherBtn = document.getElementById('studyOtherBtn');
            this.otherMaterialsList = document.getElementById('otherMaterialsList');
    
            // Panels
            this.aiPanelEl = document.getElementById('aiPanel');
            this.closeAiBtn = document.getElementById('closeAiBtn');
            this.editPanelEl = document.getElementById('editPanel');
            this.closeEditBtn = document.getElementById('closeEditBtn');
            this.editNameInput = document.getElementById('sessionEditNameInput');
            this.editChapterInput = document.getElementById('sessionEditChapterInput');
            this.editBriefTextarea = document.getElementById('sessionEditBriefTextarea');
            this.editDetailedTextarea = document.getElementById('sessionEditDetailedTextarea');
            this.editSaveBtn = document.getElementById('sessionEditSaveBtn');
            this.editCancelBtn = document.getElementById('sessionEditCancelBtn');
    
            // Action Columns
            this.leftActionsColumnEl = document.getElementById('leftActionsColumn');
            this.rightActionsColumnEl = document.getElementById('rightActionsColumn');
    
            // Completion Screen V2 Elements
            // ... (keep existing completion V2 refs) ...
            this.completionOverlay = document.getElementById('sessionCompleteContainer');
            this.completionMessageEl = document.getElementById('completionMessage');
            this.completionStatsEl = document.getElementById('completionStats');
            this.compStatTotalEl = document.getElementById('compStatTotal');
            this.compStatAccuracyEl = document.getElementById('compStatAccuracy');
            this.compStatTimeEl = document.getElementById('compStatTime');
            this.compStatAccuracyCirclePath = document.querySelector('.accuracy-circle .accuracy-value-path');
            this.completionRemainingDueContainer = document.getElementById('completionRemainingDue');
            this.compStatRemainingDueEl = document.getElementById('compStatRemainingDue');
            this.studyRemainingDueBtn = document.getElementById('studyRemainingDueBtn');
            this.studyRemainingBatchSizeInput = document.getElementById('studyRemainingBatchSizeInput');
    
            // --- State ---
            this.isTiltActive = false;
            this.originalRightColumnButtons = [];
            this.sessionCards = [];
            this.currentCardIndex = -1;
            this.currentCard = null;
            this.currentCardOriginalData = null;
            this.isLoading = false;
            this.isFlipped = false;
            this.sessionStats = { total: 0, remaining: 0, correct: 0, incorrect: 0, startTime: null, time: '00:00', timerInterval: null };
            this.initialParams = { material: null, chapters: null, mode: null };
            this.isLoadingAction = false;
            this.isAiPanelVisible = false;
            this.isEditPanelVisible = false;
            this.reviewsSinceLastCheck = 0;
            this.checkFrequency = 3; // Check every 3 reviews
            this.isCheckingForCards = false;
            this._finalCheckCount = 0;
            this._MAX_FINAL_CHECKS = 3;
            this._boundHandleEscKeyForPopup = null;
            this.isPreviewMode = false;
            this.sessionLimit = null;
            this.initialBatchCardIds = new Set();
            this.reviewedInThisBatchIds = new Set();
            this.isFocusedAllSession = false;
            this.isFocusMode = false; // *** NEW: Track focus mode state ***
    
            // --- Component Instances ---
            this.cardRenderer = null;
            this.qualityButtons = null;
            this.progressTracker = null;
            this.keyboardShortcuts = null; // Will be initialized later if needed
    
            // --- Debounced Preview ---
            this.debouncedPreviewUpdate = debounce(this._updateEditPreview.bind(this), 1000);
    
    
            // --- Bind methods ---
            this._handleMouseMove = this._handleMouseMove.bind(this);
            this._handleMouseLeave = this._handleMouseLeave.bind(this);
            this._handleReview = this._handleReview.bind(this);
            this._skipCard = this._skipCard.bind(this);
            this._endSession = this._endSession.bind(this);
            this._flipCard = this._flipCard.bind(this); // Bind flip method
            this._toggleStar = this._toggleStar.bind(this);
            this._toggleBury = this._toggleBury.bind(this);
            this._editCard = this._editCard.bind(this);
            this._deleteCard = this._deleteCard.bind(this);
            this._toggleAiPanel = this._toggleAiPanel.bind(this);
            this._toggleEditPanel = this._toggleEditPanel.bind(this);
            this._handleEditSave = this._handleEditSave.bind(this);
            this._handleEditCancel = this._handleEditCancel.bind(this);
            this._fetchAndDisplayRemainingDue = this._fetchAndDisplayRemainingDue.bind(this);
            this._handleStudyRemainingClick = this._handleStudyRemainingClick.bind(this);
            this._handleStudyOtherClick = this._handleStudyOtherClick.bind(this);
            this._handleEscKeyForPopup = this._handleEscKeyForPopup.bind(this);
            this._handleEscKey = this._handleEscKey.bind(this); // *** ADD BINDING FOR ESCAPE HANDLER ***
            this._toggleFocusMode = this._toggleFocusMode.bind(this); // *** Bind focus mode toggle ***
    
            // Initial checks
            if (!this.progressTrackerEl) console.warn("Progress tracker element not found.");
            if (!this.completionContainer) console.warn("Session complete container not found.");
            if (!this.focusModeToggleBtn) console.warn("Focus Mode toggle button not found. Add a button with id='focusModeToggleBtn'.");
    
        }

    _bindActionHandlers() {
        // Already bound in constructor now, this method might be redundant
        // unless used for rebinding, which isn't currently needed.
    }

    async initialize() {
         // Check required elements based on new structure
         if (!this.studyAreaEl || !this.cardViewerEl || !this.qualityButtonsContainer || !this.progressTrackerEl || !this.endSessionButton || !this.skipButton || !this.flipButton) {
            console.error("StudyView initialization failed: Required DOM elements not found (check IDs/structure).");
            this._showError("Failed to initialize study session interface.");
            return;
        }
         if (!this.starBtn || !this.buryBtn || !this.editBtn || !this.deleteBtn || !this.aiBtn) {
            console.warn("Study session action buttons not found.");
         }
         if (!this.completionContainer) {
             console.error("Completion container not found.");
             // Don't necessarily return, session might still work, just completion fails
         }

         if (!this.cardFlipperEl) {
            console.error("Card flipper element not found, tilt effect disabled.");
        }

        if (!this.aiPanelEl || !this.closeAiBtn) {
            console.warn("AI Panel elements not found.");
            this.aiBtn?.setAttribute('disabled', 'true'); // Disable AI btn if panel missing
        }

        // Add checks for edit panel elements
        if (!this.editPanelEl || !this.editNameInput /* ... other edit inputs ... */ || !this.editSaveBtn || !this.editCancelBtn) {
            console.warn("Edit panel elements not found. Edit functionality disabled.");
            if(this.editBtn) this.editBtn.style.display = 'none'; // Hide button if panel missing
        }

        if (!this.completionRemainingDueContainer || !this.compStatRemainingDueEl || !this.studyRemainingDueBtn || !this.studyRemainingBatchSizeInput) {
            console.warn("Completion screen 'remaining due' elements not found. This feature may not work.");
            // Don't necessarily fail init, just warn.
         }

        // Get URL Params (same as before)
        const urlParams = new URLSearchParams(window.location.search);
        this.isPreviewMode = urlParams.get('preview') === 'true'; // Check URL parameter

        if (this.isPreviewMode) {
            console.warn("--- RUNNING IN PREVIEW MODE --- API calls will be skipped.");
             // Skip batch size/limit logic in preview for simplicity
        } else {
             // *** Read limit or batchSize parameter ***
             const limitParam = urlParams.get('limit');
             const batchSizeParam = urlParams.get('batchSize'); // Get batchSize param
             let parsedLimit = null;

             // Prioritize 'limit'
             if (limitParam && !isNaN(parseInt(limitParam, 10)) && parseInt(limitParam, 10) > 0) {
             parsedLimit = parseInt(limitParam, 10);
             console.log(`Session limit found via 'limit' parameter: ${parsedLimit}`);
             }
             // Fallback to 'batchSize' if 'limit' was invalid or missing
             else if (batchSizeParam && !isNaN(parseInt(batchSizeParam, 10)) && parseInt(batchSizeParam, 10) > 0) {
             parsedLimit = parseInt(batchSizeParam, 10);
             console.log(`Session limit found via 'batchSize' parameter: ${parsedLimit}`);
             } else {
             console.log(`No valid 'limit' or 'batchSize' parameter found. No session limit applied.`);
             }

             this.sessionLimit = parsedLimit; // Store the result (null if neither was valid)
             console.log(`Session initialized with limit: ${this.sessionLimit ?? 'None'}`);
        }

        this.initialParams.material = urlParams.get('material');
        this.initialParams.chapters = urlParams.get('chapters');
        this.initialParams.mode = urlParams.get('mode');
        // *** Set flag for "Focused All" session type ***
        this.isFocusedAllSession = !!(this.initialParams.material && this.initialParams.chapters && this.initialParams.mode === 'all');
        if (this.isFocusedAllSession) {
            console.log("INFO: Initializing as 'Focused All' session type. Background/Final checks will be skipped.");
        }
        

        if (this.rightActionsColumnEl) {
            this.originalRightColumnButtons = Array.from(this.rightActionsColumnEl.querySelectorAll('.icon-btn[data-original-column="right"]'));
            console.log("DEBUG: Stored original right column buttons:", this.originalRightColumnButtons);
        } else {
            console.warn("Right actions column not found, cannot manage button movement.");
        }

        this.isLoading = true;
        this._updateLoadingState();
        this.initialBatchCardIds = new Set(); // Reset sets
        this.reviewedInThisBatchIds = new Set();
        this.reviewsSinceLastCheck = 0;
        this._finalCheckCount = 0; // Reset on init
        this.isCheckingForCards = false;
        this._updateFlipStateVisuals(); // Ensure initial state is front

        // Instantiate components (pass updated elements)
        this.cardRenderer = new CardRenderer(this.cardViewerEl); // Pass .card-scene
        this.progressTracker = new ProgressTracker(this.progressTrackerEl); // Pass .session-stats
        this.qualityButtons = new QualityButtons(this.qualityButtonsContainer, this._handleReview);
        this.keyboardShortcuts = new KeyboardShortcuts();

        // Register keyboard shortcuts (includes flip keys)
        this._setupEventListeners(); // Ensure called after checks
        this._setupKeyboardShortcuts();
        this.keyboardShortcuts.startListening();

        // Setup button listeners
        this.skipButton?.addEventListener('click', this._skipCard);
        this.endSessionButton?.addEventListener('click', this._endSession);
        this.flipButton?.addEventListener('click', this._flipCard); // Listener for new flip button

        /* this._setupTiltListeners();
        this._setupAiListeners(); 
        this._setupActionListeners(); // Setup star, bury, edit, delete listeners*/


        // --- Conditional Data Loading ---
        try {
            if (this.isPreviewMode) {
                // --- Load Sample Data ---
                console.log("Loading sample cards for preview.");
                this.sessionCards = [...sampleCardsData]; // Use a copy of the sample data

                if (this.sessionCards.length === 0) {
                    this._showError("No sample cards defined.");
                    this.isLoading = false;
                    this._updateLoadingState();
                } else {
                    // Initialize stats based on sample data
                    this.sessionStats.total = this.sessionCards.length;
                    this.sessionStats.remaining = this.sessionCards.length;
                    this._updateRemainingCount(); // Update remaining count based on samples
                    this.progressTracker.update(this.sessionStats); // Initial tracker display
                    // Don't start the timer in preview? Or maybe start a dummy timer? Let's skip for now.
                    // this._startTimer();
                    this._loadNextCard(); // Load the first sample card
                }
                // --- End Sample Data Loading ---
                this.initialBatchCardIds = new Set(sampleCardsData.map(c => c.id));
            } else {
                // --- Load Data from API (Applying Limit) ---
                let cardSourcePromise;
                let sessionTypeLog = "";
                const isFocusedDueSession = this.initialParams.material && this.initialParams.chapters && !this.isFocusedAllSession; // Exclude "Focused All"
                const isGlobalMaterialDueSession = this.initialParams.material && !this.initialParams.chapters; // Assumes due if no chapters/mode=all
                const isGlobalAllDueSession = !this.initialParams.material; // Assumes due

                // Determine API call based on parameters
                if (this.isFocusedAllSession) {
                    sessionTypeLog = `INITIAL FETCH: Focused All... (Material: ${this.initialParams.material}, Chapters: ${this.initialParams.chapters})`;
                    // Fetch ALL cards for the chapter(s), NO LIMIT applied
                    cardSourcePromise = apiClient.getCards({ material: this.initialParams.material, chapter: this.initialParams.chapters, buried: false });
                } else if (isFocusedDueSession) {
                    sessionTypeLog = `INITIAL FETCH: Focused Due... (Material: ${this.initialParams.material}, Chapters: ${this.initialParams.chapters}, Limit: ${this.sessionLimit ?? 'None'})`;
                    // Use specific study-session endpoint, PASSING THE LIMIT
                    cardSourcePromise = apiClient.getStudySessionCards(this.initialParams.material, this.initialParams.chapters, this.sessionLimit);
                } else if (isGlobalMaterialDueSession) {
                    sessionTypeLog = `INITIAL FETCH: Global Material Due... (Material: ${this.initialParams.material}, Limit: ${this.sessionLimit ?? 'None'})`;
                    // Fetch due cards for material, PASSING THE LIMIT in filters
                    cardSourcePromise = apiClient.getCards({ material: this.initialParams.material, due: true, buried: false, limit: this.sessionLimit });
                } else { // isGlobalAllDueSession
                    sessionTypeLog = `INITIAL FETCH: Global All Due... (Limit: ${this.sessionLimit ?? 'None'})`;
                    // Fetch global due cards, PASSING THE LIMIT in filters
                    cardSourcePromise = apiClient.getCards({ due: true, buried: false, limit: this.sessionLimit });
                }

                console.log(`Initializing study session: ${sessionTypeLog}`);
                this.sessionCards = await cardSourcePromise;
                console.log(`Fetched ${this.sessionCards.length} cards from API.`);

                // *** Store initial IDs ***
                this.initialBatchCardIds = new Set(this.sessionCards.map(c => c.id));
                console.log(`Stored ${this.initialBatchCardIds.size} initial card IDs.`);

                if (this.sessionCards.length === 0) {
                    // Show appropriate completion/empty message
                     const message = this.isFocusedAllSession ? `No cards found for this chapter selection!` : "No cards due for review right now!";
                     this._showCompletionMessage(message, false); // Explicitly false for showRemainingDue
                } else {
                    // Initialize stats and start session
                    this.sessionStats.total = this.sessionCards.length; // Total in this batch
                    this.sessionStats.remaining = this.sessionCards.length;
                    this._updateRemainingCount();
                    this.progressTracker.update(this.sessionStats);
                    this._startTimer();
                    this._loadNextCard();
                }
            }
        } catch (error) {
            // Catch errors from either sample loading (unlikely) or API loading
            console.error("Error during initialization or card fetch:", error);
            this._showError(`Could not load session: ${error.message}`);
            this.isLoading = false; // Ensure loading state is off on error
            this._updateLoadingState();
        } finally {
             // Ensure isLoading is false unless handled by _loadNextCard or completion
             if (this.isLoading && !this.currentCard && this.sessionCards.length === 0) {
                this.isLoading = false;
                this._updateLoadingState();
             }
        }


    }

/**
     * Toggles Focus Mode by adding/removing a class on the body.
     * Accepts an optional boolean to force a state.
     * @param {boolean} [forceState] - True to force ON, False to force OFF.
     * @private
     */
_toggleFocusMode(forceState) {
    // Use the version with logging from the previous step
    const newState = typeof forceState === 'boolean' ? forceState : !this.isFocusMode;
    console.log(`[DEBUG Focus] _toggleFocusMode called. Current state: ${this.isFocusMode}, Requested state: ${forceState}, Calculated new state: ${newState}`);
    if (newState === this.isFocusMode) {
        console.log(`[DEBUG Focus] Focus mode state already ${newState}. No change needed.`);
        return; // Avoid unnecessary changes if state is already correct
    }
    this.isFocusMode = newState;
    this.bodyEl.classList.toggle('focus-mode-active', this.isFocusMode);
    this.focusModeToggleBtn?.classList.toggle('active', this.isFocusMode);
    console.log(`[DEBUG Focus] Focus mode toggled ${this.isFocusMode ? 'ON' : 'OFF'}. Body class updated.`);
}

        // Helper to get dynamic fetch promise based on session type
        _getDynamicDueCardsPromise() {
            const isFocusedDueSession = this.initialParams.material && this.initialParams.chapters && this.initialParams.mode !== 'all';
            // isFocusedAllSession -> No dynamic check needed
            const isGlobalMaterialDueSession = this.initialParams.material && !this.initialParams.chapters;
            const isGlobalAllDueSession = !this.initialParams.material;
    
            let cardCheckPromise = null;
            let logMsg = "";
    
            if (isFocusedDueSession) {
                logMsg = "DYNAMIC CHECK: Focused Due Session - Using /study-session";
                // Re-fetch using the same specific endpoint as init
                cardCheckPromise = apiClient.getStudySessionCards(this.initialParams.material, this.initialParams.chapters);
            } else if (isGlobalMaterialDueSession) {
                logMsg = `DYNAMIC CHECK: Global Material Due Session (Material: ${this.initialParams.material}) - Using /cards (due=true)`;
                // Fetch generic due cards for this material
                cardCheckPromise = apiClient.getCards({
                    material: this.initialParams.material,
                    due: true,
                    buried: false
                });
            } else if (isGlobalAllDueSession) {
                 logMsg = "DYNAMIC CHECK: Global All Due Session - Using /cards (due=true)";
                 // Fetch generic due cards across all materials
                 cardCheckPromise = apiClient.getCards({
                     due: true,
                     buried: false
                 });
            }
            // No check needed for isFocusedAllSession
    
            if (logMsg) console.log(logMsg);
            return cardCheckPromise; // Returns null if no check needed
        }
    



/*        // Add this new method
        _setupAiListeners() {
            if (this.aiBtn && this.aiPanelEl) { // Only add listener if elements exist
                this.aiBtn.addEventListener('click', this._toggleAiPanel);
            }
             if (this.closeAiBtn && this.aiPanelEl) {
                 this.closeAiBtn.addEventListener('click', this._toggleAiPanel);
             }
        }

        // Add this new method
        _setupTiltListeners() {
            if (this.cardViewerEl && this.cardFlipperEl) {
                this.cardViewerEl.addEventListener('mousemove', this._handleMouseMove);
                this.cardViewerEl.addEventListener('mouseleave', this._handleMouseLeave);
                // Listen for the end of the flip transition
                this.cardFlipperEl.addEventListener('transitionend', this._onFlipTransitionEnd.bind(this));
                console.log("Tilt and TransitionEnd listeners added.");
            }
        }

    _setupActionListeners() {
        this.starBtn?.addEventListener('click', this._toggleStar);
        this.buryBtn?.addEventListener('click', this._toggleBury);
        this.editBtn?.addEventListener('click', this._editCard);
        this.deleteBtn?.addEventListener('click', this._deleteCard);
        // Add listener for AI button if/when implemented
    } */

        _setupEventListeners() {
            // Basic controls
            this.skipButton?.addEventListener('click', this._skipCard);
            this.endSessionButton?.addEventListener('click', this._endSession);
            this.flipButton?.addEventListener('click', this._flipCard);
    
            // Tilt effect
            if (this.cardViewerEl && this.cardFlipperEl) {
                this.cardViewerEl.addEventListener('mousemove', this._handleMouseMove);
                this.cardViewerEl.addEventListener('mouseleave', this._handleMouseLeave);
                this.cardFlipperEl.addEventListener('transitionend', this._onFlipTransitionEnd.bind(this));
            }
    
            // AI Panel
            this.aiBtn?.addEventListener('click', this._toggleAiPanel);
            this.closeAiBtn?.addEventListener('click', this._toggleAiPanel);
    
            // Action Buttons
            this.starBtn?.addEventListener('click', this._toggleStar);
            this.buryBtn?.addEventListener('click', this._toggleBury);
            this.editBtn?.addEventListener('click', this._editCard);
            this.deleteBtn?.addEventListener('click', this._deleteCard);
    
            // Edit Panel Controls
            this.closeEditBtn?.addEventListener('click', () => this._toggleEditPanel(false));
            this.editSaveBtn?.addEventListener('click', this._handleEditSave);
            this.editCancelBtn?.addEventListener('click', this._handleEditCancel);
            // Live Preview (Debounced)
            this.editNameInput?.addEventListener('input', () => this._updateEditPreview('name')); // No debounce needed for name/chapter
            this.editChapterInput?.addEventListener('input', () => this._updateEditPreview('chapter'));
            this.editBriefTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('brief'));
            this.editDetailedTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('detailed'));
    
            // Completion Screen Buttons
            this.studyRemainingDueBtn?.addEventListener('click', this._handleStudyRemainingClick);
            this.studyOtherBtn?.addEventListener('click', this._handleStudyOtherClick);
            this.returnBtn?.addEventListener('click', () => { // Add listener for return button
                 console.log("Return button clicked, navigating back...");
                 try { window.history.back(); } catch (e) { window.location.href = './index.html'; } // Fallback
            });
    
            // *** NEW: Focus Mode Toggle Button Listener ***
            this.focusModeToggleBtn?.addEventListener('click', this._toggleFocusMode);
    
            // Global Keydown Listener - Moved to initialize() after successful load
            // document.addEventListener('keydown', this._handleKeyDown);
        }

        destroy() {
            // Remove basic controls
            this.skipButton?.removeEventListener('click', this._skipCard);
            this.endSessionButton?.removeEventListener('click', this._endSession);
            this.flipButton?.removeEventListener('click', this._flipCard);
    
            // Remove tilt
            if (this.cardViewerEl) {
                this.cardViewerEl.removeEventListener('mousemove', this._handleMouseMove);
                this.cardViewerEl.removeEventListener('mouseleave', this._handleMouseLeave);
            }
            if (this.cardFlipperEl) {
                this.cardFlipperEl.removeEventListener('transitionend', this._onFlipTransitionEnd);
            }
    
            // Remove AI
            this.aiBtn?.removeEventListener('click', this._toggleAiPanel);
            this.closeAiBtn?.removeEventListener('click', this._toggleAiPanel);
    
            // Remove Actions
            this.starBtn?.removeEventListener('click', this._toggleStar);
            this.buryBtn?.removeEventListener('click', this._toggleBury);
            this.editBtn?.removeEventListener('click', this._editCard);
            this.deleteBtn?.removeEventListener('click', this._deleteCard);
    
            // Remove Edit Panel
            this.closeEditBtn?.removeEventListener('click', () => this._toggleEditPanel(false));
            this.editSaveBtn?.removeEventListener('click', this._handleEditSave);
            this.editCancelBtn?.removeEventListener('click', this._handleEditCancel);
            this.editNameInput?.removeEventListener('input', this._updateEditPreview);
            this.editChapterInput?.removeEventListener('input', this._updateEditPreview);
            this.editBriefTextarea?.removeEventListener('input', this.debouncedPreviewUpdate); // Might need adjustment if debounce wrapper saved differently
            this.editDetailedTextarea?.removeEventListener('input', this.debouncedPreviewUpdate);
    
            // Remove Completion
            this.studyRemainingDueBtn?.removeEventListener('click', this._handleStudyRemainingClick);
            this.studyOtherBtn?.removeEventListener('click', this._handleStudyOtherClick);
            this.returnBtn?.removeEventListener('click'); // Remove inline handler logic if complex
    
            // *** Remove Focus Mode Toggle Listener ***
            this.focusModeToggleBtn?.removeEventListener('click', this._toggleFocusMode);
    
            // --- STOP KeyboardShortcuts Listener ---
            this.keyboardShortcuts?.stopListening(); // Use the service's method
            console.log("Keyboard shortcut listener stopped via service.");
    
            // Remove dynamic Escape listener if active
            if (this._boundHandleEscKeyForPopup) {
                document.removeEventListener('keydown', this._boundHandleEscKeyForPopup);
                this._boundHandleEscKeyForPopup = null;
            }
    
            // Stop timer, destroy CardRenderer etc.
            this._stopTimer();
            this.cardRenderer?.destroy(); // Call destroy on CardRenderer
    
            // Reset state
            this.initialBatchCardIds.clear();
            this.reviewedInThisBatchIds.clear();
            this.isCheckingForCards = false;
            this._finalCheckCount = 0;
    
            console.log("StudyView destroyed and listeners removed.");
        }

        // --- Central Escape Key Handler (Called by KeyboardShortcuts) ---
    /**
     * Handles the Escape key press, prioritizing Focus Mode > Panels > Popup.
     * @param {KeyboardEvent} event - The keyboard event object.
     * @private
     */
    _handleEscKey(event) {
        console.log("[Shortcut 'Escape'] Triggered.");
        const isPopupOpen = this.otherMaterialsList?.classList.contains('visible');

        // Priority: Focus Mode > Edit Panel > AI Panel > Popup
        if (this.isFocusMode) {
            console.log("[Shortcut 'Escape'] Action: Exiting focus mode.");
            event.preventDefault(); event.stopPropagation();
            this._toggleFocusMode(false); // Force exit
            return;
        }
        if (this.isEditPanelVisible) {
            console.log("[Shortcut 'Escape'] Action: Cancelling Edit.");
            event.preventDefault(); event.stopPropagation();
            this._handleEditCancel(); // Use cancel handler
            return;
        }
        if (this.isAiPanelVisible) {
            console.log("[Shortcut 'Escape'] Action: Closing AI panel.");
            event.preventDefault(); event.stopPropagation();
            this._toggleAiPanel(false); // Force close
            return;
        }
        if (isPopupOpen) {
            console.log("[Shortcut 'Escape'] Action: Closing 'Study Other' popup.");
            event.preventDefault(); event.stopPropagation();
            this._handleEscKeyForPopup(event); // Reuse existing logic to close and remove listener
            return;
        }
        console.log("[Shortcut 'Escape'] No specific action taken.");
    }

        /**
     * Handles the Escape key press specifically to close the 'Study Another' popup.
     * @param {KeyboardEvent} event
     * @private
     */
        _handleEscKeyForPopup(event) {
            if (event.key === 'Escape') {
                if (this.otherMaterialsList && this.otherMaterialsList.classList.contains('visible')) {
                    console.log("Escape key pressed, closing 'Study Another' popup.");
                    this.otherMaterialsList.classList.remove('visible');
                    // *** Remove the listener itself ***
                    if (this._boundHandleEscKeyForPopup) {
                        document.removeEventListener('keydown', this._boundHandleEscKeyForPopup);
                        this._boundHandleEscKeyForPopup = null; // Clear the reference
                    }
                    event.stopPropagation(); // Prevent other Escape handlers if necessary
                }
            }
        }

        // Add this new method
    _toggleAiPanel(forceState) { // Modified to accept optional forceState
        if (!this.currentCard || this.isLoading || this.isLoadingAction || this.currentCard.is_buried) return;
        if (!this.aiPanelEl) { console.warn("AI panel not available."); return; }

        const showAi = typeof forceState === 'boolean' ? forceState : !this.isAiPanelVisible;
        console.log(`Toggling AI Panel. Current: ${this.isAiPanelVisible}, Target: ${showAi}, Edit: ${this.isEditPanelVisible}`);

        if (showAi === this.isAiPanelVisible) return; // No change needed

        // If trying to show AI while Edit is open, close Edit first
        if (showAi && this.isEditPanelVisible) {
            this._toggleEditPanel(false);
        }

        this.isAiPanelVisible = showAi;
        this.bodyEl.classList.toggle('ai-panel-active', showAi);
        this.bodyEl.classList.toggle('panel-active', showAi); // Use generic class
        this.aiBtn?.classList.toggle('active', showAi);

        // --- Manage Button Movement ---
        this._updateActionColumnButtons(showAi || this.isEditPanelVisible); // Pass true if *any* panel is active

        console.log(`AI Panel state: ${this.isAiPanelVisible}`);
    }

        /**
     * Toggles the Edit Panel view state and UI classes.
     * @param {boolean} show - True to show, False to hide.
     * @private
     */
        _toggleEditPanel(show) {
            if (!this.editPanelEl || !this.editBtn || show === this.isEditPanelVisible) return;
    
            // If trying to show Edit while AI is open, close AI first
            if (show && this.isAiPanelVisible) {
                this._toggleAiPanel(false);
            }
    
            this.isEditPanelVisible = show;
            this.bodyEl.classList.toggle('edit-panel-active', show);
            this.bodyEl.classList.toggle('panel-active', show); // Use generic class
            this.editBtn.classList.toggle('active', show);
    
            // --- Manage Button Movement ---
            this._updateActionColumnButtons(show || this.isAiPanelVisible); // Pass true if *any* panel is active
    
    
            if (show && this.currentCard) {
                this.currentCardOriginalData = { // Store copy BEFORE populating
                    name: this.currentCard.name,
                    chapter: this.currentCard.chapter,
                    briefExplanation: this.currentCard.briefExplanation,
                    detailedExplanation: this.currentCard.detailedExplanation,
                };
                this._populateEditPanel(this.currentCard);
            } else {
                 this.currentCardOriginalData = null; // Clear on hide
            }
    
            console.log(`Edit Panel state: ${this.isEditPanelVisible}`);
        }

        /**
     * Moves action buttons based on whether *any* panel is active.
     * @param {boolean} isAnyPanelActive
     * @private
     */
        _updateActionColumnButtons(isAnyPanelActive) {
            if (!this.leftActionsColumnEl || !this.rightActionsColumnEl) return;
    
            console.log(`DEBUG: Updating action columns. Panel Active: ${isAnyPanelActive}`);
    
            if (isAnyPanelActive) {
                // Move buttons from Right to Left, but only if they are currently in Right
                this.originalRightColumnButtons.forEach(btn => {
                    if (btn && btn.parentElement === this.rightActionsColumnEl) { // Check parent
                        console.log(`DEBUG: Moving button to left:`, btn.id);
                        this.leftActionsColumnEl.appendChild(btn);
                    } else if (btn && btn.parentElement !== this.leftActionsColumnEl) {
                         console.warn(`DEBUG: Button ${btn.id} not found in right column during move.`);
                    }
                });
            } else {
                // Move buttons back from Left to Right
                this.originalRightColumnButtons.forEach(btn => {
                     if (btn && btn.parentElement === this.leftActionsColumnEl) { // Check parent
                         console.log(`DEBUG: Moving button back to right:`, btn.id);
                         this.rightActionsColumnEl.appendChild(btn);
                     } else if (btn && btn.parentElement !== this.rightActionsColumnEl) {
                         // This case is fine, button might already be back or never moved
                         // console.warn(`DEBUG: Button ${btn.id} not found in left column during move back.`);
                     }
                });
            }
        }

        // --- Edit Panel Functionality ---

        _populateEditPanel(cardData) {
            if (!this.editPanelEl || !cardData) return;
            console.log("Populating edit panel for card:", cardData.id);
            this.editNameInput.value = cardData.name || '';
            this.editChapterInput.value = cardData.chapter || ''; // Populate chapter
            this.editBriefTextarea.value = cardData.briefExplanation || '';
            this.editDetailedTextarea.value = cardData.detailedExplanation || '';
        }
    
        /**
         * Updates the main card preview based on edit panel input.
         * @param {'name' | 'brief' | 'detailed' | 'chapter'} field - Which field changed.
         */
        _updateEditPreview(field) {
            if (!this.isEditPanelVisible || !this.currentCard || !this.cardRenderer) return;
    
            const previewData = { ...this.currentCard }; // Start with current card data
    
            // Update the preview data object based on form values
            previewData.name = this.editNameInput?.value || previewData.name;
            previewData.chapter = this.editChapterInput?.value || previewData.chapter;
            if (field === 'brief') {
                 previewData.briefExplanation = this.editBriefTextarea?.value;
            }
            if (field === 'detailed') {
                 previewData.detailedExplanation = this.editDetailedTextarea?.value;
            }
    
            // Re-render the card preview using the modified data
            // The CardRenderer should handle updating the DOM and re-running KaTeX
            console.log(`Updating preview for field: ${field}`);
            this.cardRenderer.render(previewData, this.isFlipped); // Pass flip state
        }
    
        async _handleEditSave() {
            if (!this.currentCard || !this.currentCardOriginalData || this.isLoadingAction) return;
    
            const cardId = this.currentCard.id;
    
            // Get updated values
            const newName = this.editNameInput.value.trim();
            const newChapter = this.editChapterInput.value.trim(); // Get chapter value
            const newBrief = this.editBriefTextarea.value; // Trim maybe not needed here
            const newDetailed = this.editDetailedTextarea.value;
    
            // Validation
            if (!newName) { this._showError("Card name cannot be empty."); return; }
            if (!newChapter) { this._showError("Chapter cannot be empty."); return; } // Validate chapter
    
            // Construct update payload (only changed fields)
            const updateData = {};
            if (newName !== this.currentCardOriginalData.name) updateData.name = newName;
            if (newChapter !== this.currentCardOriginalData.chapter) updateData.chapter = newChapter;
            if (newBrief !== this.currentCardOriginalData.briefExplanation) updateData.briefExplanation = newBrief;
            if (newDetailed !== this.currentCardOriginalData.detailedExplanation) updateData.detailedExplanation = newDetailed;
    
            if (Object.keys(updateData).length === 0) {
                 this._showError("No changes made.", true);
                 this._toggleEditPanel(false); // Close panel
                 return;
            }
    
            this.isLoadingAction = true;
            this._setActionButtonStateBasedOnLoading(); // Disable relevant buttons
            this.editSaveBtn.disabled = true; this.editCancelBtn.disabled = true; // Disable panel buttons
    
            try {
                console.log("Saving card updates:", updateData);
                const updatedCard = await apiClient.updateCard(cardId, updateData);
    
                // Update main card state in sessionCards array
                const cardIndex = this.sessionCards.findIndex(c => c.id === cardId);
                if (cardIndex > -1) {
                     this.sessionCards[cardIndex] = { ...this.sessionCards[cardIndex], ...updatedCard };
                     // Update this.currentCard directly as well
                     this.currentCard = this.sessionCards[cardIndex];
                } else {
                     // Should not happen if currentCard is set, but handle defensively
                     this.currentCard = updatedCard;
                }
    
                // Re-render the main card view with the final, updated data
                this.cardRenderer.render(this.currentCard, this.isFlipped);
                // Update action button states (e.g., if buried status changed via API somehow)
                 this._updateActionButtonsUI();
    
                this._showError("Card updated.", true);
                this._toggleEditPanel(false); // Close panel on success
    
            } catch (error) {
                 console.error("Failed to save card:", error);
                 this._showError(`Save failed: ${error.message}`);
                 // Keep panel open on error
            } finally {
                 this.isLoadingAction = false;
                 this._setActionButtonStateBasedOnLoading(); // Re-enable buttons
                 if(this.editSaveBtn) this.editSaveBtn.disabled = false;
                 if(this.editCancelBtn) this.editCancelBtn.disabled = false;
            }
        }
    
        _handleEditCancel() {
            if (!this.currentCardOriginalData || !this.currentCard) return;
            console.log("Cancelling edit.");
            // Restore card state to original before edit started
            this.currentCard = { ...this.currentCard, ...this.currentCardOriginalData }; // Restore potentially previewed changes
            // Re-render the main card view with original data
            this.cardRenderer.render(this.currentCard, this.isFlipped);
            // Close panel
            this._toggleEditPanel(false);
        }
    
        // --- Keyboard Shortcuts Update ---
        _setupKeyboardShortcuts() {
            if (!this.keyboardShortcuts) {
                console.error("KeyboardShortcuts service not initialized!");
                return;
             }
             console.log("Registering keyboard shortcuts via KeyboardShortcuts service...");

            // --- Escape Key ---
            this.keyboardShortcuts.register('Escape', this._handleEscKey); // Use the central handler

             // --- Focus Mode Toggle ('f') ---
            this.keyboardShortcuts.register('f', (event) => {
            // Check conditions *before* toggling (ignore if loading or popup open)
            const isPopupOpen = this.otherMaterialsList?.classList.contains('visible');
            if (this.isLoading || isPopupOpen) {
                console.log("[Shortcut 'f'] Ignoring: isLoading or Popup Open.");
                return;
            }
            // Allow toggling even if panels are open
            console.log("[Shortcut 'f'] Triggered.");
            event.preventDefault(); // Prevent browser find
            this._toggleFocusMode();
            });

            // --- Panel Specific ---
            // Example: Ctrl+S to save in Edit Panel
            this.keyboardShortcuts.register('s', (event) => { // Register 's' again, but check for Ctrl
            if (this.isEditPanelVisible && event.ctrlKey) {
                console.log("[Shortcut 'Ctrl+S'] Triggered in Edit Panel.");
                event.preventDefault(); // Prevent browser save
                this.editSaveBtn?.click(); // Simulate save click
            }
            // Note: The regular 's' handler above won't run if isEditPanelVisible is true due to canPerformAction() check
            });
    
             // Rating Keys (1-4) - Active only when flipped AND no panel visible
             ['1', '2', '3', '4'].forEach((key, index) => {
                 this.keyboardShortcuts.register(key, () => {
                     if (this.isFlipped && !this.isAiPanelVisible && !this.isEditPanelVisible) {
                          this._handleReview(index);
                     }
                 });
             });
    
             // Card Actions (S, B, E, Delete) - Active when no panel visible
             this.keyboardShortcuts.register('s', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._toggleStar(); });
             this.keyboardShortcuts.register('b', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._toggleBury(); });
             this.keyboardShortcuts.register('e', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._editCard(); });
             this.keyboardShortcuts.register('Delete', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._deleteCard(); });
    
             // Toggle Detail (D) - Active only when flipped AND no panel visible
             this.keyboardShortcuts.register('d', (event) => {
                  if (this.isFlipped && !this.isAiPanelVisible && !this.isEditPanelVisible && this.cardRenderer) {
                     event.preventDefault();
                     this.cardRenderer.toggleDetails();
                  }
             });
    
             // Flip Card (Space, Enter) - Active when no panel visible
             this.keyboardShortcuts.register(' ', (event) => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) { event.preventDefault(); this._flipCard(); } });
             this.keyboardShortcuts.register('Enter', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._flipCard(); });
    
             // Skip Card (N) - Active when no panel visible
             this.keyboardShortcuts.register('n', () => { if (!this.isAiPanelVisible && !this.isEditPanelVisible) this._skipCard(); });
    
             // Escape Key - Handled in _handleKeyDown directly for panel logic
         }

/*
_handleKeyDown(event) {
    console.log(`DEBUG: Keydown Event: Key='${event.key}', Target=${event.target.tagName}#${event.target.id}.${event.target.className}`); // Log key and target

    const activeElement = document.activeElement;
    const isTyping = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable);
    const isPopupOpen = this.otherMaterialsList?.classList.contains('visible');

    console.log(`[DEBUG KeyDown] State Check: isTyping=${isTyping}, isPopupOpen=${isPopupOpen}, isLoading=${this.isLoading}, isFocusMode=${this.isFocusMode}, isAiPanelVisible=${this.isAiPanelVisible}, isEditPanelVisible=${this.isEditPanelVisible}`);

    // --- Highest Priority: Escape Key ---
    if (event.key === 'Escape') {
         console.log("DEBUG: Escape key processing...");
         if (this.isFocusMode) {
            console.log("[DEBUG KeyDown] Focus mode is active. Attempting to exit focus mode via Escape.");
             event.preventDefault(); event.stopPropagation();
             this._toggleFocusMode(false); // Force exit
             console.log("[DEBUG KeyDown] Called _toggleFocusMode(false) for Escape.");
             return;
         }
        if (this.isEditPanelVisible) { // Close Edit Panel
            console.log("DEBUG: Closing edit panel via Escape.");
            event.preventDefault(); event.stopPropagation();
            this._handleEditCancel();
            return;
        }
        if (this.isAiPanelVisible) { // Close AI Panel
            console.log("DEBUG: Closing AI panel via Escape.");
            event.preventDefault(); event.stopPropagation();
            this._toggleAiPanel(false);
            return;
        }
        if (isPopupOpen && this._boundHandleEscKeyForPopup) { return; } // Let specific handler manage
        console.log("DEBUG: Escape pressed, no specific action taken.");
        return; // Allow default if nothing else handled
   }

    // --- Ignore other keys if typing, popup open, or loading ---
        // Add logging here to see if 'f' is ignored prematurely
        if (isTyping) { console.log("DEBUG: Ignoring keydown (typing)"); return; }
        if (isPopupOpen) { console.log("DEBUG: Ignoring keydown (popup open)"); return; }
        if (this.isLoading) { console.log("DEBUG: Ignoring keydown (isLoading)"); return; }


        // --- Focus Mode Toggle ('f') ---
         // Allow 'f' even if panels are open, as it's a global toggle
         if (event.key === 'f' || event.key === 'F') {
            console.log("[DEBUG KeyDown] 'f' key detected. Attempting to toggle focus mode.");
            event.preventDefault(); // Prevent default 'f' behavior (like find)
            this._toggleFocusMode(); // Toggle current state
            console.log("[DEBUG KeyDown] Called _toggleFocusMode() for 'f' key.");
            return; // Handled
        }

        // --- Defer to CardRenderer if focus is inside explanation block ---
        const isFocusOnExplanationElement = activeElement && activeElement.closest('.explanation-block-header'); // Broader check
        if (isFocusOnExplanationElement) {
             console.log("DEBUG: Focus is within explanation header/button, deferring to CardRenderer.");
             // CardRenderer's delegated listener should handle Arrows, Enter (on header), H.
             // It should stop propagation for those it handles.
             // Space on header will bubble up intentionally.
             return;
        }

       // --- Panel-Specific Overrides or General Shortcuts ---
       const noPanelVisible = !this.isAiPanelVisible && !this.isEditPanelVisible;
       console.log(`[DEBUG KeyDown] Panel Check for shortcuts: noPanelVisible=${noPanelVisible}`);

       if (noPanelVisible) {
           console.log("[DEBUG KeyDown] No panels visible. Processing general/card shortcuts.");
           // Flip Card (Space, Enter) - Only if not flipped
           if (!this.isFlipped && (event.key === ' ' || event.key === 'Enter')) {
               console.log("[DEBUG KeyDown] Space or Enter detected (card not flipped). Flipping card.");
               event.preventDefault(); // Prevent default space/enter actions
               this._flipCard();
               return; // Handled
           }

           // Card Actions (S, B, E, Delete, N) - Available regardless of flip state (except maybe Delete?)
           if (event.key === 's' || event.key === 'S') {
               console.log("[DEBUG KeyDown] 's' key detected. Toggling star.");
               event.preventDefault();
               this.starBtn?.click(); // Simulate click to ensure UI updates and async logic runs
               // this._toggleStar(); // Direct call might bypass some UI updates or checks
               return; // Handled
           }
           if (event.key === 'b' || event.key === 'B') {
               console.log("[DEBUG KeyDown] 'b' key detected. Toggling bury.");
               event.preventDefault();
               this.buryBtn?.click(); // Simulate click
               // this._toggleBury();
               return; // Handled
           }
           if (event.key === 'e' || event.key === 'E') {
               console.log("[DEBUG KeyDown] 'e' key detected. Opening edit panel.");
               event.preventDefault();
               this.editBtn?.click(); // Simulate click
               // this._editCard(); // This toggles the panel
               return; // Handled
           }
           if (event.key === 'Delete') {
               console.log("[DEBUG KeyDown] 'Delete' key detected. Attempting delete.");
               event.preventDefault();
               this.deleteBtn?.click(); // Simulate click
               // this._deleteCard();
               return; // Handled
           }
            if (event.key === 'n' || event.key === 'N') {
                console.log("[DEBUG KeyDown] 'n' key detected. Skipping card.");
                event.preventDefault();
                this.skipButton?.click(); // Simulate click
                // this._skipCard();
                return; // Handled
            }

           // Actions only available when flipped
           if (this.isFlipped) {
               console.log("[DEBUG KeyDown] Card is flipped. Checking for rating/detail keys.");
               // Rating Keys (1-4)
               if (['1', '2', '3', '4'].includes(event.key)) {
                   const quality = parseInt(event.key, 10) - 1; // Quality is 0-3
                   console.log(`[DEBUG KeyDown] Rating key '${event.key}' detected. Handling review with quality ${quality}.`);
                   event.preventDefault();
                   // Find the corresponding button and click it
                   const qualityButton = this.qualityButtonsContainer?.querySelector(`.quality-btn[data-quality="${quality}"]`);
                   if (qualityButton) {
                       console.log(`[DEBUG KeyDown] Simulating click on quality button ${quality + 1}.`);
                       qualityButton.click();
                   } else {
                       console.error(`[DEBUG KeyDown] Could not find quality button for quality ${quality}.`);
                       // Fallback to direct call if needed, though click simulation is often better
                       // this._handleReview(quality);
                   }
                   return; // Handled
               }
               // Toggle Detail (D)
               if (event.key === 'd' || event.key === 'D') {
                   console.log("[DEBUG KeyDown] 'd' key detected. Toggling detail view.");
                   event.preventDefault();
                   // Assuming CardRenderer instance handles its own detail toggle logic
                   this.cardRenderer?.toggleDetailedExplanation();
                   console.log("[DEBUG KeyDown] Called cardRenderer.toggleDetailedExplanation().");
                   return; // Handled
               }
           } else {
                console.log("[DEBUG KeyDown] Card not flipped. Ignoring rating/detail keys (1-4, d).");
           }
       } else {
           console.log("[DEBUG KeyDown] Panel is visible. Ignoring general card shortcuts.");
           // Add any panel-specific shortcuts here if needed (e.g., C3trl+S for save in edit panel)
           if (this.isEditPanelVisible && event.ctrlKey && (event.key === 's' || event.key === 'S')) {
                console.log("[DEBUG KeyDown] Ctrl+S detected in Edit Panel. Simulating Save click.");
                event.preventDefault();
                this.editSaveBtn?.click();
                return; // Handled
           }
       }
       console.log(`[DEBUG KeyDown] Key "${event.key}" was not handled by any specific shortcut logic in studyView.`);
   }
    */

    // --- Private Helper Methods ---

    _loadNextCard() {
        console.log(`DEBUG: _loadNextCard START. Current Index (Before Inc): ${this.currentCardIndex}, Queue Length: ${this.sessionCards.length}`);

        // --- Only increment if we are not at the theoretical end ---
        // This prevents index from going beyond the actual last item during the check phase
        if (this.currentCardIndex < this.sessionCards.length - 1) {
            this.currentCardIndex++;
        } else if (this.sessionCards.length > 0 && this.currentCardIndex === this.sessionCards.length - 1) {
             // We were on the last card, now check if we *really* finished
             console.log(`DEBUG: _loadNextCard - Was on last card (Index: ${this.currentCardIndex}, Length: ${this.sessionCards.length}). Triggering final check.`);
             this.currentCard = null; // Clear current card display while checking
             // Don't increment index here, let final check decide
             this._finalDueCardCheck();
             return; // Exit _loadNextCard, _finalDueCardCheck takes over
        } else { // Handles initial load (index -1, length > 0) or empty queue
            this.currentCardIndex++;
        }

        console.log(`DEBUG: _loadNextCard AFTER potential Inc. New Index: ${this.currentCardIndex}`);

        // Check if index is valid *within the current bounds*
        if (this.currentCardIndex < this.sessionCards.length) {
            // --- Load card at currentCardIndex ---
            this.currentCard = this.sessionCards[this.currentCardIndex];

            if (typeof this.currentCard?.id === 'undefined') {
                console.error(`CRITICAL: Card at index ${this.currentCardIndex} is missing an ID! Skipping.`, this.currentCard);
                // ... (error handling, skip logic - keep safety check) ...
                 this._showError(`Error loading card ${this.currentCardIndex + 1}: Missing required ID. Skipping.`, true);
                 this.isLoading = false; this._updateLoadingState();
                 this._skipCard();
                return;
            }

            console.log(`Loading card ${this.currentCardIndex + 1}/${this.sessionCards.length}: ${this.currentCard.name} (ID: ${this.currentCard.id})`);

            this._updateRemainingCount();
            this.progressTracker.update(this.sessionStats);

            // Reset display state
            this.isFlipped = false;
            this._updateFlipStateVisuals();
            this.cardRenderer.render(this.currentCard);
            this.qualityButtons.setDisabled(true);
            if(this.skipButton) this.skipButton.disabled = false;
            if(this.flipButton) this.flipButton.disabled = false;
            this._updateActionButtonsUI();

            this.isLoading = false;
            this._updateLoadingState();
            // *** Reset the final check counter since a card was successfully loaded ***
            this._finalCheckCount = 0;

        } else {
            // --- This case should now only be reachable if the queue was initially empty ---
            console.log(`DEBUG: _loadNextCard - Index (${this.currentCardIndex}) is not less than length (${this.sessionCards.length}). Queue likely empty or check failed?`);
            // If the queue started empty, initialize should have caught it.
            // If _finalDueCardCheck decided to end, it calls _showCompletionMessage directly.
            // So, reaching here might indicate an unexpected state. Let's defensively end.
            this.isLoading = false;
            this._updateLoadingState();
            this._showCompletionMessage("Study session complete.", true); // Or perhaps an error message?
        }
    }

    // Make sure _handleFlip exists and works correctly
    _handleFlip() {
        if (!this.cardFlipperEl || this.isLoading || this.isLoadingAction) return; // Add guards
        this.isCardFlipped = !this.isCardFlipped;
        this.cardViewerEl?.classList.toggle('is-flipped', this.isCardFlipped); // Use cardViewerEl for class
        console.log(`DEBUG: Card flipped state: ${this.isCardFlipped}`);

        if (this.isCardFlipped) {
            // If just flipped to back, ensure keyboard focus starts correctly
            this.cardRenderer?._initializeKeyboardSelection(); // Use optional chaining
            this.qualityButtons?.setDisabled(false); // Enable quality buttons
        } else {
            this.qualityButtons?.setDisabled(true); // Disable quality buttons
        }
    }

// --- studyView.js ---

    /**
     * Performs a final check using /cards/check-due on the initial batch IDs.
     * If any are still due, re-adds them to the queue and continues the session.
     * Otherwise, proceeds to the completion screen.
     * @private
     */
    async _finalDueCardCheck() { // New Logic
        // --- Guards (keep Focused All, Preview Mode, isChecking, offline, initialBatchId checks) ---
        if (this.isFocusedAllSession) {
            console.log("DEBUG: Final Check - Skipping ('Focused All' session). Ending session.");
            this.isLoading = false; // Ensure loading is off
            this.isCheckingForCards = false;
            this._updateLoadingState(); // Update UI
            this._showCompletionMessage("Study session complete!", false); // Focused All never has remaining due check
            return;
        }

         // *** Circuit Breaker Check ***
         this._finalCheckCount++;
         console.log(`DEBUG: Final Check - Attempt #${this._finalCheckCount}`);
         if (this._finalCheckCount > this._MAX_FINAL_CHECKS) {
             console.warn(`DEBUG: Final Check - Maximum check attempts (${this._MAX_FINAL_CHECKS}) reached. Forcing completion.`);
             this.isLoading = false; this.isCheckingForCards = false; this._updateLoadingState();
             this._showCompletionMessage("Study session complete (some cards may still need review).", true);
             return;
         }
        
        if (this.isPreviewMode) {
            console.log("DEBUG: Final Check - Preview Mode. Ending session.");
            this.isLoading = false; this._updateLoadingState();
            this._showCompletionMessage("Preview Session Complete!", false); // No remaining due in preview
            return;
        }
         if (this.isCheckingForCards || !navigator.onLine) { // Prevent overlap/offline
             console.log("DEBUG: Final Check - Skipping (already checking or offline). Proceeding to completion.");
             this.isLoading = false; this.isCheckingForCards = false; this._updateLoadingState();
             this._showCompletionMessage("Study session complete!", true); // Potentially show remaining due
             return;
         }
        if (!this.initialBatchCardIds || this.initialBatchCardIds.size === 0) {
             console.log("DEBUG: Final Check - Skipping (no initial batch IDs). Proceeding to completion.");
             this.isLoading = false; this._updateLoadingState();
             this._showCompletionMessage("Study session complete!", true); // Potentially show remaining due
             return;
        }
        // --- End Guards ---

        console.log("DEBUG: Final Check - Starting final due check using /cards/check-due...");
        this.isCheckingForCards = true;
        this.isLoading = true; // Show loading during check
        this._updateLoadingState();

        try {
            const checkPayload = { cardIds: Array.from(this.initialBatchCardIds) };
            const result = await apiClient.checkDueStatus(checkPayload);
            const stillDueIds = new Set(result?.dueCardIds || []);

            // Filter to find cards that are due AND not already waiting in the queue beyond the current index
            // Note: currentCardIndex hasn't been incremented yet in this path
            const upcomingQueueIds = new Set(this.sessionCards.slice(this.currentCardIndex + 1).map(c => c.id));
            const cardsToReAddIds = Array.from(this.initialBatchCardIds).filter(id =>
                stillDueIds.has(id) && !upcomingQueueIds.has(id)
            );

            if (cardsToReAddIds.length > 0) {
                // --- Re-add Cards ---
                console.log(`DEBUG: Final Check - Found ${cardsToReAddIds.length} card(s) to re-add.`);
                let cardsAdded = 0;
                const currentLength = this.sessionCards.length; // Length *before* adding

                for (const cardId of cardsToReAddIds) {
                    const cardData = this.sessionCards.find(c => c.id === cardId); // Find original data
                    if (cardData) {
                         const cardToInsert = { ...cardData };
                         this.sessionCards.push(cardToInsert); // Add to the END
                         cardsAdded++;
                         console.log(`DEBUG: Final Check - Added card ${cardId} to end. New length: ${this.sessionCards.length}`);
                    } else {
                         console.warn(`DEBUG: Final Check - Card data for ID ${cardId} not found. Cannot re-add.`);
                    }
                }

                if (cardsAdded > 0) {
                    // --- Cards were added, CONTINUE the session ---
                    this.isCheckingForCards = false;
                    // isLoading is still true, will be set by _loadNextCard
                    this._updateRemainingCount();
                    this.progressTracker.update(this.sessionStats);

                    // *** CRITICAL: currentCardIndex is still pointing at the *previous* last card ***
                    // The next call to _loadNextCard needs to load the card at currentLength.
                    // The increment logic inside _loadNextCard handles this naturally now.
                    console.log(`DEBUG: Final Check - Added ${cardsAdded} card(s). Calling _loadNextCard to load index ${this.currentCardIndex + 1}.`);
                    // The index will be incremented inside the next _loadNextCard call.
                    this._loadNextCard(); // This will now increment index and load the first re-added card.

                } else {
                     // No cards needed re-adding (or couldn't be found)
                     console.log("DEBUG: Final Check - No cards needed re-adding. Proceeding to completion.");
                     this.isCheckingForCards = false;
                     this.isLoading = false;
                     this._updateLoadingState();
                     this._showCompletionMessage("Study session complete!", true);
                }

            } else {
                // --- No cards reported as due, END the session ---
                console.log("DEBUG: Final Check - Confirmed no cards from the initial batch are still due. Ending session.");
                this.isCheckingForCards = false;
                this.isLoading = false;
                this._updateLoadingState();
                this._showCompletionMessage("Study session complete!", true);
            }

        } catch (error) {
            console.error("Error during final due card check:", error);
            this.isCheckingForCards = false; // Reset flag on error
            this.isLoading = false; // Reset loading flag on error
            this._updateLoadingState(); // Update UI
            // Proceed to completion screen on error to avoid getting stuck
            this._showCompletionMessage("Session complete (error during final check).", true); // Potentially show remaining due even on error?
        }
    }

        // *** NEW Method to Check for Due Cards ***
    /**
     * Performs a background check using /cards/check-due on the initial batch IDs.
     * Re-adds cards to the queue if they were reviewed but are still marked as due.
     * @private
     */
    async _checkForNewDueCards() { // New Logic
        // --- Guards ---
        if (this.isFocusedAllSession) {
            console.log("DEBUG: Background Check - Skipping ('Focused All' session).");
            return;
        }
        if (this.isPreviewMode) return;
        if (this.isCheckingForCards || !navigator.onLine) {
             console.log("DEBUG: Background Check - Skipping (already checking or offline).");
             return;
        }
         if (!this.initialBatchCardIds || this.initialBatchCardIds.size === 0) {
             console.log("DEBUG: Background Check - Skipping (no initial batch IDs).");
             return;
         }
        // --- End Guards ---

        console.log(`DEBUG: Background Check - Checking ${this.initialBatchCardIds.size} initial batch cards...`);
        this.isCheckingForCards = true;
        this.reviewsSinceLastCheck = 0; // Reset counter

        try {
            const checkPayload = { cardIds: Array.from(this.initialBatchCardIds) };
            const result = await apiClient.checkDueStatus(checkPayload); // Assuming apiClient has this method
            const stillDueIds = new Set(result?.dueCardIds || []);

            if (stillDueIds.size > 0) {
                console.log(`DEBUG: Background Check - API reported ${stillDueIds.size} cards still due from initial batch.`);

                // Find cards that are STILL DUE *and* have ALREADY been reviewed in this batch
                const cardsToReAddIds = Array.from(stillDueIds).filter(id => this.reviewedInThisBatchIds.has(id));

                if (cardsToReAddIds.length > 0) {
                    console.log(`DEBUG: Background Check - Found ${cardsToReAddIds.length} reviewed card(s) to potentially re-add:`, cardsToReAddIds);

                    const insertionIndex = this.currentCardIndex + 1;
                    const upcomingCardIds = new Set(this.sessionCards.slice(insertionIndex).map(c => c.id));
                    let cardsActuallyAddedCount = 0;

                    for (const cardId of cardsToReAddIds) {
                        // Avoid adding if it's already in the upcoming queue
                        if (!upcomingCardIds.has(cardId)) {
                             // Find the original card data from the full sessionCards list (more reliable than initialBatch)
                            const cardData = this.sessionCards.find(c => c.id === cardId); // Find by ID in current full list
                            if (cardData) {
                                // *** Create a fresh copy to avoid potential state issues? Or just reuse? Reuse for now. ***
                                const cardToInsert = { ...cardData }; // Use a shallow copy
                                console.log(`DEBUG: Background Check - Re-inserting card ${cardId} at index ${insertionIndex}.`);
                                this.sessionCards.splice(insertionIndex, 0, cardToInsert);
                                cardsActuallyAddedCount++;
                                // We technically don't need to add to upcomingCardIds as we iterate insertionIndex forward implicitly with splice
                            } else {
                                console.warn(`DEBUG: Background Check - Card data for ID ${cardId} not found in sessionCards.`);
                            }
                        } else {
                            console.log(`DEBUG: Background Check - Card ${cardId} is already in the upcoming queue, skipping re-add.`);
                        }
                    }

                    if (cardsActuallyAddedCount > 0) {
                        console.log(`DEBUG: Background Check - Added ${cardsActuallyAddedCount} cards back to queue. New length: ${this.sessionCards.length}`);
                        this._updateRemainingCount(); // Update stats
                        this.progressTracker.update(this.sessionStats);
                    }

                } else {
                    console.log("DEBUG: Background Check - None of the still-due cards have been reviewed yet in this batch.");
                }
            } else {
                console.log("DEBUG: Background Check - API reported no cards from initial batch are currently due.");
            }

        } catch (error) {
            console.error("Error during background due card check:", error);
            // Don't halt the session, just log the error.
        } finally {
            this.isCheckingForCards = false;
            console.log("DEBUG: Background Check - Finished.");
        }
    }

        // *** NEW Helper to update remaining count ***
        _updateRemainingCount() {
            // Remaining is total length minus (index + 1), or 0 if index is out of bounds
            const remaining = Math.max(0, this.sessionCards.length - (this.currentCardIndex + 1));
            this.sessionStats.remaining = remaining;
        }
    _updateActionButtonsUI() {
        if (!this.currentCard || !this.starBtn || !this.buryBtn) return; // Check elements exist

        const isStarred = !!this.currentCard.is_starred;
        const isBuried = !!this.currentCard.is_buried;

        this.starBtn.classList.toggle('active', isStarred);
        this.starBtn.setAttribute('title', isStarred ? 'Unstar (S)' : 'Star (S)');

        this.buryBtn.classList.toggle('is-buried', isBuried); // Assumes .is-buried CSS exists for visual state
        this.buryBtn.setAttribute('title', isBuried ? 'Unbury (B)' : 'Bury (B)');
        // Toggle bury/unbury icons visibility
        const buryIcon = this.buryBtn.querySelector('.icon-bury');
        const unburyIcon = this.buryBtn.querySelector('.icon-unbury');
        if(buryIcon) buryIcon.style.display = isBuried ? 'none' : 'block';
        if(unburyIcon) unburyIcon.style.display = isBuried ? 'block' : 'none';

        // Maybe disable other actions if buried?
        if(this.editBtn) this.editBtn.disabled = isBuried;
        // if(this.deleteBtn) this.deleteBtn.disabled = isBuried; // Keep delete enabled?
        if(this.starBtn) this.starBtn.disabled = isBuried; // Disable star if buried
        if(this.aiBtn) this.aiBtn.disabled = isBuried; // Disable AI if buried
    }

    _flipCard() {
        if (!this.currentCard || this.isLoading || this.isLoadingAction) return;

        console.log("Flipping card");
        this.isFlipped = !this.isFlipped;
        // When starting a flip, ensure tilt is inactive
        this.isTiltActive = false;
        this._updateFlipStateVisuals(); // Calls the updated visual state function

        // Enable/disable quality buttons based on flip state
        // Ensure qualityButtons instance exists
        if (this.qualityButtons) {
            this.qualityButtons.setDisabled(!this.isFlipped);
             // **NEW/Verification:** Log button state
             console.log("DEBUG: Quality buttons disabled:", !this.isFlipped);
        } else {
             console.warn("Cannot set quality button state: instance not found.");
        }
    }

        // Tilt handler methods
        _handleMouseMove(e) {
            // Don't apply tilt if the card is flipped
            if (!this.cardViewerEl || !this.cardFlipperEl || this.isFlipped || this.cardFlipperEl.style.transition.includes('transform')) {
                this.isTiltActive = false; // Ensure tilt flag is off
                return;
            }
    
            const rect = this.cardViewerEl.getBoundingClientRect();
            const deltaX = e.clientX - rect.left - rect.width / 2;
            const deltaY = e.clientY - rect.top - rect.height / 2;
            const maxTilt = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tilt-max') || '6');
            const tiltX = (deltaY / (rect.height / 2)) * -maxTilt;
            const tiltY = (deltaX / (rect.width / 2)) * maxTilt;
    
            this.isTiltActive = true; // Set flag indicating tilt is applying styles
    
            window.requestAnimationFrame(() => {
                if (this.isTiltActive && !this.isFlipped && this.cardFlipperEl) { // Check flags again inside rAF
                     // Remove transition *only* when actively tilting
                     this.cardFlipperEl.style.transition = 'none';
                     this.cardFlipperEl.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
                }
            });
        }
    
        _handleMouseLeave() {
            if (!this.cardFlipperEl) return;
    
            this.isTiltActive = false; // Tilt is no longer active
    
            // Only reset transform if the card is NOT flipped AND not currently mid-flip animation
            if (!this.isFlipped && !this.cardFlipperEl.style.transition.includes('transform')) {
                 // Reset tilt smoothly
                 this.cardFlipperEl.style.transition = 'transform 0.4s ease-out';
                 this.cardFlipperEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
            }
            // Do NOT interfere if the card is flipped or animating
        }
        
        _updateFlipStateVisuals() {
        if (!this.cardViewerEl || !this.cardFlipperEl) return;
        // Ensure the class is toggled on the correct element (.card-scene)
        const isCurrentlyFlipped = this.isFlipped;
        this.cardViewerEl.classList.toggle('is-flipped', isCurrentlyFlipped);

        if (isCurrentlyFlipped) {
            // Apply flip transform (CSS class will add transition)
            this.cardFlipperEl.style.transform = 'rotateY(180deg)';
        } else {
            // Apply reset transform (respecting potential mouse leave transition)
            this.cardFlipperEl.style.transform = 'rotateX(0deg) rotateY(0deg)';
        }
        // **NEW/Verification:** Log to console to ensure class is added/removed
        console.log("DEBUG: Card scene flipped state:", this.cardViewerEl.classList.contains('is-flipped'));
        // CSS handles showing/hiding front/back/quality buttons based on this class
    }

    async _handleReview(quality) {


        if (this.isLoading || !this.currentCard || !this.isFlipped || this.isLoadingAction || this.isCheckingForCards) {
            console.warn("_handleReview called inappropriately.", { isFlipped: this.isFlipped, isLoading: this.isLoading, currentCard: !!this.currentCard, isLoadingAction: this.isLoadingAction });
            return;
        }

               // *** PREVIEW MODE Check ***
               if (this.isPreviewMode) {
                console.log(`PREVIEW: Simulating review quality ${quality} for card ${this.currentCard.id}`);
                this.isLoading = true; // Simulate loading state
                if(this.currentCard?.id) this.reviewedInThisBatchIds.add(this.currentCard.id); // Add to reviewed set
                this._updateLoadingState();
                // Simulate delay
                await new Promise(resolve => setTimeout(resolve, 200));
                // Update stats optimistically (no revert needed)
                if (quality >= 2) { this.sessionStats.correct++; } else { this.sessionStats.incorrect++; }
                this._loadNextCard(); // Just load the next sample card
                return; // Skip API call
            }
            // *** END PREVIEW MODE Check ***

        if (typeof this.currentCard.id === 'undefined') {
             console.error('CRITICAL: Cannot submit review, card ID is missing!', this.currentCard);
             this._showError("Error: Cannot identify card for review.", true);
             return;
        }
        const cardId = this.currentCard.id; // Store ID before potential async ops
        console.log(`Handling review for card ${this.currentCard.id} with quality ${quality}`);

        this.isLoading = true; // Use main loading flag
        this.qualityButtons.setDisabled(true);
        if(this.skipButton) this.skipButton.disabled = true;
        this._disableActionButtons(); // Disable side actions during review submission
        this._updateLoadingState();

        // Optimistic stat update
        if (quality >= 2) { this.sessionStats.correct++; } else { this.sessionStats.incorrect++; }

        // *** Add card ID to reviewed set BEFORE API call ***
        this.reviewedInThisBatchIds.add(cardId);
        console.log(`DEBUG: Added ${cardId} to reviewedInThisBatchIds. Size: ${this.reviewedInThisBatchIds.size}`);

        try {
            await apiClient.submitReview(cardId, quality); // Use stored cardId

            // *** Trigger background check if needed (BEFORE loading next card) ***
            this.reviewsSinceLastCheck++;
             if (!this.isFocusedAllSession && this.reviewsSinceLastCheck >= this.checkFrequency) {
                 // Don't await - let it run in background
                 console.log(`DEBUG: Triggering background check after ${this.reviewsSinceLastCheck} reviews.`);
                 this._checkForNewDueCards(); // New logic using checkDueStatus
             } else if (this.isFocusedAllSession) {
                 console.log("DEBUG: Skipping background check ('Focused All' session).");
             }
             // *** End check trigger ***

            // Load next card on success
            console.log(`DEBUG: Review successful for ${cardId}. Loading next card...`);
            this._loadNextCard();


        } catch (error) {
            console.error(`Failed to submit review for card ${cardId}:`, error);
            this._showError("Failed to save review. Please check connection.", true);
            // Revert optimistic stat update (unchanged)
            if (quality >= 2) { this.sessionStats.correct--; } else { this.sessionStats.incorrect--; }
            // Revert reviewed ID tracking on error
            this.reviewedInThisBatchIds.delete(cardId);
            // Re-enable buttons on error (unchanged)
            this.qualityButtons.setDisabled(false);
            if(this.skipButton) this.skipButton.disabled = false;
            this._enableActionButtons();
            this.isLoading = false;
            this._updateLoadingState();
        }
        // No finally needed, isLoading handled in paths
    }

    _skipCard() {
        // Added guard against action loading
        if (this.isLoading || !this.currentCard || this.isLoadingAction) return;

        const cardId = this.currentCard.id ?? 'UNKNOWN_ID';
        console.log(`Skipping card ${cardId}`);

        this.isLoading = true;
        this.qualityButtons.setDisabled(true);
        if(this.skipButton) this.skipButton.disabled = true;
        this._disableActionButtons();
        this._updateLoadingState();

        this._loadNextCard(); // Handles resetting loading state
    }

    _endSession() {
        if (this.isLoading || this.isLoadingAction) return;
        console.log("Ending session.");
        this._showCompletionMessage("Session ended.");
        // destroy() is called after setting up completion listeners in _showCompletionMessage
        // No navigation here, handled by completion buttons
    }



     _startTimer() { // Logic unchanged
        this._stopTimer();
        if (!this.sessionStats.startTime) {
             this.sessionStats.startTime = Date.now();
        }
        this.sessionStats.timerInterval = setInterval(() => {
            const elapsedSeconds = Math.floor((Date.now() - this.sessionStats.startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
            const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
            this.sessionStats.time = `${minutes}:${seconds}`;
            if (this.progressTracker) {
                 this.progressTracker.update(this.sessionStats);
            }
        }, 1000);
     }

    _stopTimer() { // Logic unchanged
        if (this.sessionStats.timerInterval) {
            clearInterval(this.sessionStats.timerInterval);
            this.sessionStats.timerInterval = null;
        }
    }

    _updateLoadingState() {
        // Apply loading class to body for global overlay effect
        this.bodyEl.classList.toggle('is-loading', this.isLoading);

        // Disable buttons based on main loading state
        // Specific buttons might be re-enabled by other logic paths (_loadNextCard, error handlers)
        if(this.skipButton) this.skipButton.disabled = this.isLoading;
        if(this.endSessionButton) this.endSessionButton.disabled = this.isLoading;
        if(this.flipButton) this.flipButton.disabled = this.isLoading || !this.currentCard; // Disable if no card
        // Quality buttons are handled based on flip state primarily
        // Action buttons handled by isLoadingAction + main isLoading
        this._setActionButtonStateBasedOnLoading();
    }

    _disableActionButtons() {
        this.starBtn?.setAttribute('disabled', 'true');
        this.buryBtn?.setAttribute('disabled', 'true');
        this.editBtn?.setAttribute('disabled', 'true');
        this.deleteBtn?.setAttribute('disabled', 'true');
        this.aiBtn?.setAttribute('disabled', 'true'); // Disable AI btn too
        this.skipButton?.setAttribute('disabled', 'true'); // Also disable skip in left column
    }

    _enableActionButtons() {
        if (!this.currentCard) return;
        const isBuried = !!this.currentCard.is_buried;
        this.starBtn?.toggleAttribute('disabled', isBuried);
        this.buryBtn?.removeAttribute('disabled');
        this.editBtn?.toggleAttribute('disabled', isBuried);
        this.deleteBtn?.removeAttribute('disabled');
        this.aiBtn?.toggleAttribute('disabled', isBuried); // Enable AI btn unless buried
        this.skipButton?.removeAttribute('disabled'); // Enable skip btn
    }

    _setActionButtonStateBasedOnLoading() {
        // Disable if main load OR action load is happening
        const shouldBeDisabled = this.isLoading || this.isLoadingAction;
        if (shouldBeDisabled) {
            this._disableActionButtons();
        } else {
             this._enableActionButtons(); // Re-enable respecting card state
        }
    }

    // --- Action Handlers (Updated with isLoadingAction) ---
    async _toggleStar() {
        if (!this.currentCard || this.isLoading || this.isLoadingAction || this.currentCard.is_buried) return; // Don't star if buried
        // *** PREVIEW MODE Check ***
        if (this.isPreviewMode) {
            const newState = !this.currentCard.is_starred;
            console.log(`PREVIEW: Toggling star to ${newState} for card ${this.currentCard.id}`);
            this.currentCard.is_starred = newState; // Update local sample state
            this._updateActionButtonsUI(); // Update button visuals
            this.cardRenderer?.updateStarState(newState); // Update card visual
            return; // Skip API call
        }
        // *** END PREVIEW MODE Check ***
        
        this.isLoadingAction = true;
        this._setActionButtonStateBasedOnLoading(); // Disable buttons

        

        const cardId = this.currentCard.id;
        const newState = !this.currentCard.is_starred;
        console.log(`${newState ? 'Starring' : 'Unstarring'} card ${cardId}`);
        this.starBtn?.classList.toggle('active', newState); // Optimistic UI
        this.starBtn?.setAttribute('title', newState ? 'Unstar (S)' : 'Star (S)');

        try {
            await apiClient[newState ? 'starCard' : 'unstarCard'](cardId);
            this.currentCard.is_starred = newState; // Update local state
             this.cardRenderer?.updateStarState(newState); // Tell renderer
        } catch (error) {
             console.error(`Failed to toggle star:`, error);
             this._showError("Failed to update star status.", true);
             // Revert
             this.currentCard.is_starred = !newState;
             this.starBtn?.classList.toggle('active', !newState);
             this.starBtn?.setAttribute('title', !newState ? 'Unstar (S)' : 'Star (S)');
             this.cardRenderer?.updateStarState(!newState);
        } finally {
             this.isLoadingAction = false;
             this._setActionButtonStateBasedOnLoading(); // Re-enable buttons respecting card state
        }
    }

async _toggleBury() {
        if (!this.currentCard || this.isLoading || this.isLoadingAction) return;

                // *** PREVIEW MODE Check ***
                if (this.isPreviewMode) {
                    const isCurrentlyBuried = !!this.currentCard.is_buried;
                    const action = isCurrentlyBuried ? 'unbury' : 'bury';
                    if (action === 'bury' && !confirm(`PREVIEW: Bury this card?`)) return;

                    console.log(`PREVIEW: Toggling bury to ${!isCurrentlyBuried} for card ${this.currentCard.id}`);
                    this.currentCard.is_buried = !isCurrentlyBuried; // Update local sample state
                    this._updateActionButtonsUI(); // Update button visuals
                    if (this.currentCard.is_buried) { // If burying
                        this.isLoading = true; this._updateLoadingState(); // Simulate load
                        await new Promise(resolve => setTimeout(resolve, 100)); // Short delay
                        this._loadNextCard(); // Load next sample
                    }
                    return; // Skip API call
               }
               // *** END PREVIEW MODE Check ***
        this.isLoadingAction = true;
        this._setActionButtonStateBasedOnLoading(); // Disable buttons

        const cardId = this.currentCard.id;
        const isCurrentlyBuried = !!this.currentCard.is_buried;
        const action = isCurrentlyBuried ? 'unbury' : 'bury';

        if (action === 'bury' && !confirm(`Bury this card ?`)) {
             this.isLoadingAction = false;
             this._setActionButtonStateBasedOnLoading();
             return;
        }

        console.log(`${action === 'bury' ? 'Burying' : 'Unburying'} card ${cardId}`);
        // Optimistic UI update handled by _updateActionButtonsUI after success/failure

        let burySucceeded = false; // Flag to track success within try block

        try {
            const updatedCard = await apiClient[action === 'bury' ? 'buryCard' : 'unburyCard'](cardId);
            this.currentCard.is_buried = updatedCard.is_buried; // Update state from response
            this._updateActionButtonsUI(); // Update UI based on final state

            if (!isCurrentlyBuried && updatedCard.is_buried) { // If action was 'bury' AND it succeeded
                 burySucceeded = true; // Mark bury as successful
                 console.log("Card buried, loading next card.");
                 // Don't need skipCard, just load next directly after state is set
                 this.isLoading = true; // Set main loading flag for next card load
                 this._updateLoadingState(); // Show loading visuals
                 console.log("DEBUG: [_toggleBury] Before calling _loadNextCard. this.currentCard:", this.currentCard ? this.currentCard.id : 'null'); // Log before loadNextCard
                 this._loadNextCard(); // Load the next one
                 console.log("DEBUG: [_toggleBury] After calling _loadNextCard."); // Log after loadNextCard returns (or starts async)
            }

        } catch (error) {
             console.error(`Failed to ${action} card:`, error);
             this._showError(`Failed to ${action} card.`, true);
             // State didn't change, so just re-enable buttons
        } finally {
            console.log("DEBUG: [_toggleBury finally] Entering finally block."); // Log entry into finally
            console.log("DEBUG: [_toggleBury finally] Current value of this.currentCard:", this.currentCard ? this.currentCard.id : 'null'); // Log currentCard state in finally
            console.log("DEBUG: [_toggleBury finally] isCurrentlyBuried:", isCurrentlyBuried);
            console.log("DEBUG: [_toggleBury finally] burySucceeded flag:", burySucceeded);

            // --- Always reset isLoadingAction in finally ---
            // The main isLoading flag (controlled by _loadNextCard or error handlers)
            // will manage the overall loading state and button disabling during the actual load.
            console.log("DEBUG: [_toggleBury finally] Resetting isLoadingAction.");
            this.isLoadingAction = false;
            // Re-evaluate button states based on the *current* main isLoading flag and card state
            this._setActionButtonStateBasedOnLoading();
            console.log("DEBUG: [_toggleBury finally] Exiting finally block.");
       }
   }

       // --- Transition End Handler ---
       _onFlipTransitionEnd(event) {
        // Make sure the transition that ended was the 'transform'
        if (event.propertyName === 'transform' && this.cardFlipperEl) {
            console.log("DEBUG: Flip transition ended.");
            // Remove the explicit transition style potentially set by mouseleave
            // to allow the main CSS transition rule to take over again if needed.
            this.cardFlipperEl.style.transition = '';

            // Optional: If mouse is over card AFTER flip, re-enable tilt?
            // This might be jerky. Usually better to keep tilt off when flipped.
        }
    }

    /**
     * Handles click on Edit button: Toggles edit panel, manages other panels.
     */
    _editCard() {
        // Guard clauses
        if (!this.currentCard || this.isLoading || this.isLoadingAction || this.currentCard.is_buried) return;
        if (!this.editPanelEl) { console.warn("Edit panel not available."); return; } // Check if panel exists



        console.log(`Edit button clicked. Edit Visible: ${this.isEditPanelVisible}, AI Visible: ${this.isAiPanelVisible}`);

                // *** PREVIEW MODE Check ***
                if (this.isPreviewMode) {
                    console.log(`PREVIEW: Edit button clicked for card ${this.currentCard.id}`);
                    // Show the edit panel UI, but disable save? Or just show alert?
                    alert("PREVIEW MODE: Edit panel UI can be opened, but changes cannot be saved.");
                    // Optionally, still toggle the panel for UI testing:
                     this._toggleEditPanel(!this.isEditPanelVisible);
                    return; // Skip real edit logic/navigation
                }
                // *** END PREVIEW MODE Check ***

        if (this.isEditPanelVisible) {
            this._toggleEditPanel(false); // Close if already open
        } else {
            if (this.isAiPanelVisible) {
                this._toggleAiPanel(false); // Close AI first
            }
            this._toggleEditPanel(true); // Then open Edit
        }
    }

    async _deleteCard() {
        if (!this.currentCard || this.isLoading || this.isLoadingAction) {
            console.log("DEBUG: [_deleteCard] Aborted (loading or no card). isLoading:", this.isLoading, "isLoadingAction:", this.isLoadingAction);
            return;
        }

        // *** PREVIEW MODE Check ***
        if (this.isPreviewMode) {
            if (!confirm(`PREVIEW: Delete this card? (Cannot be undone in preview)`)) return;
            const cardId = this.currentCard.id;
            console.log(`PREVIEW: Deleting card ${cardId}`);
            const indexToRemove = this.sessionCards.findIndex(c => c.id === cardId);
            if (indexToRemove > -1) {
                this.sessionCards.splice(indexToRemove, 1);
                console.log(`PREVIEW: Removed card ${cardId} from local queue. New length: ${this.sessionCards.length}`);
                // Adjust index if needed (though _loadNextCard handles it)
                if (indexToRemove <= this.currentCardIndex) {
                    // Don't decrement currentCardIndex here, let _loadNextCard handle finding the next valid one.
                    console.log("PREVIEW: Index adjustment might be needed by _loadNextCard.");
                }
                this.sessionStats.totalCards = this.sessionCards.length; // Update total count
                this._updateRemainingCount();
                this.progressTracker.update(this.sessionStats);
                this.isLoading = true; this._updateLoadingState(); // Simulate load
                await new Promise(resolve => setTimeout(resolve, 100)); // Short delay
                this._loadNextCard(); // Load next sample
            } else {
                console.warn(`PREVIEW: Card ${cardId} not found in local queue.`);
                // Optionally proceed to load next anyway? Or show error?
                this.isLoading = true; this._updateLoadingState();
                this._loadNextCard();
            }
            return; // Skip API call
        }
        // *** END PREVIEW MODE Check ***

        const cardId = this.currentCard.id;
        const cardName = this.currentCard.name; // For confirmation

        if (!confirm(`Are you sure you want to permanently delete the card "${cardName}"? This cannot be undone.`)) {
            console.log("DEBUG: [_deleteCard] Deletion cancelled by user.");
            return;
        }

        console.log(`DEBUG: [_deleteCard] Starting deletion for card ${cardId}`);
        this.isLoadingAction = true;
        this._setActionButtonStateBasedOnLoading(); // Disable buttons during action

        let deleteHandled = false; // Flag to track if deletion logic (including loading next) was processed

        try {
            console.log(`Deleting card ${cardId}`);
            await apiClient.deleteCard(cardId);
            console.log(`DEBUG: [_deleteCard] API call for delete successful (or returned no content).`);

            // --- Deletion Success Logic ---
            this._handleSuccessfulDeletion(cardId);
            deleteHandled = true;
            // --- End Deletion Success Logic ---

        } catch (error) {
            console.error("Error during card deletion API call:", error);
            // Check if the error suggests deletion was likely successful despite fetch error
            // This is brittle; ideally, apiClient handles 204 correctly.
            // A TypeError often occurs if fetch tries to parse empty JSON response.
            const likelyDeleted = error instanceof TypeError || (error.message && (error.message.includes('Failed to fetch') || error.message.includes('JSON') ));

            if (likelyDeleted && !deleteHandled) {
                 console.warn("DEBUG: [_deleteCard] Treating fetch error as likely successful deletion.");
                 // --- Deletion Success Logic (Fallback in Catch) ---
                 this._handleSuccessfulDeletion(cardId);
                 deleteHandled = true;
                 // --- End Deletion Success Logic ---
            } else if (!deleteHandled) {
                 // Genuine error or already handled
                 console.error("DEBUG: [_deleteCard] Genuine delete error or already handled. Not loading next card.");
                 this._showError(`Failed to delete card: ${error.message || error}`, true);
                 // Don't load next card on genuine failure
            }
        } finally {
            console.log("DEBUG: [_deleteCard finally] Entering finally block.");
            console.log("DEBUG: [_deleteCard finally] deleteHandled flag:", deleteHandled);
            // Always reset isLoadingAction, as the action itself (delete attempt) is finished.
            console.log("DEBUG: [_deleteCard finally] Resetting isLoadingAction.");
            this.isLoadingAction = false;
            // Re-evaluate button states based on the *current* main isLoading flag and card state
            // If deletion was handled, isLoading should be true (set by _handleSuccessfulDeletion)
            // If not handled (error), isLoading should be false (or whatever it was before)
            this._setActionButtonStateBasedOnLoading();
            console.log("DEBUG: [_deleteCard finally] Exiting finally block. isLoading:", this.isLoading, "isLoadingAction:", this.isLoadingAction);
        }
    }

    /**
     * Helper function to handle the state updates and loading sequence
     * after a card has been successfully deleted (or assumed deleted).
     * @param {string} cardId The ID of the card that was deleted.
     * @private
     */
    _handleSuccessfulDeletion(cardId) {
        console.log(`DEBUG: [_handleSuccessfulDeletion] Processing successful deletion for ${cardId}`);
        // Remove card from the local queue
        const indexToRemove = this.sessionCards.findIndex(c => c.id === cardId);
        if (indexToRemove > -1) {
            this.sessionCards.splice(indexToRemove, 1);
            console.log(`DEBUG: [_handleSuccessfulDeletion] Removed card ${cardId} from local queue. New length: ${this.sessionCards.length}`);

            // Update stats
            this.sessionStats.totalCards = this.sessionCards.length;
            this._updateRemainingCount();
            this.progressTracker.update(this.sessionStats);

            console.log(`DEBUG: [_handleSuccessfulDeletion] Index before potential adjustment: ${this.currentCardIndex}. Card removed at index: ${indexToRemove}`);
            // No index adjustment needed here, _loadNextCard handles finding the next valid index.

        } else {
            console.warn(`DEBUG: [_handleSuccessfulDeletion] Card ${cardId} not found in local queue after successful API delete/assumption.`);
        }

        // Load the next card
        console.log("DEBUG: [_handleSuccessfulDeletion] Preparing to load next card.");
        this.isLoading = true; // Set main loading flag for next card load
        this._updateLoadingState(); // Show loading visuals
        console.log("DEBUG: [_handleSuccessfulDeletion] Before calling _loadNextCard.");
        this._loadNextCard();
        console.log("DEBUG: [_handleSuccessfulDeletion] After calling _loadNextCard.");
    }


    _showError(message, temporary = false) {
        console.error("StudyView Error:", message);
        let errorEl = this.studyAreaEl?.querySelector('.error-message');
        if (!errorEl && this.studyAreaEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'error-message';
            // Basic styling (should be defined in CSS ideally)
            errorEl.style.color = 'var(--accent-red)';
            errorEl.style.backgroundColor = 'rgba(217, 83, 79, 0.1)';
            errorEl.style.border = '1px solid var(--accent-red)';
            errorEl.style.padding = '1rem';
            errorEl.style.marginTop = '1rem';
            errorEl.style.marginBottom = '1rem';
            errorEl.style.borderRadius = '8px';
            errorEl.style.textAlign = 'center';
            errorEl.style.width = '100%';
            errorEl.style.order = '-1'; // Attempt to place it before card actions on mobile wrap
             errorEl.style.maxWidth = '600px'; // Limit width
             errorEl.style.marginLeft = 'auto';
             errorEl.style.marginRight = 'auto';

            // Prepend to study area so it appears above card/actions
            this.studyAreaEl.prepend(errorEl);
        }
        if (errorEl) {
             errorEl.textContent = message;
             errorEl.style.display = 'block';

             if (temporary) {
                 setTimeout(() => {
                    errorEl.style.display = 'none';
                    // Optionally remove the element after fade out
                    // errorEl.remove();
                 }, 5000);
             }
        }
    }

 // Ensure _showCompletionMessage calls destroy *after* setting up its listeners
 _showCompletionMessage(message, checkRemainingDue = true) { // Added default value
    if (!this.completionContainer || !this.completionMessageEl) return;
    console.log("Session complete:", message);
    this._stopTimer();

    // Hide study elements
    if(this.studyAreaEl) this.studyAreaEl.style.display = 'none';
    if (this.isEditPanelVisible) this._toggleEditPanel(false);
    if (this.isAiPanelVisible) this._toggleAiPanel(false); // Close AI panel too
    if(this.sessionPillEl) this.sessionPillEl.style.display = 'none';

    // Prepare and show completion UI
    if (!this.completionOverlay) {
        console.error("Cannot show completion message: overlay container not found.");
        window.history.back();
        return;
    }

    if(this.completionMessageEl) this.completionMessageEl.textContent = message;
    this._updateCompletionStats();


       // --- Button 1: Return ---
    // Use location instead of history for more reliable navigation
    this.returnBtn.onclick = () => {
        console.log("Return button clicked, navigating...");
        try {
            // Try multiple navigation options
            const referrer = document.referrer;
            if (referrer && referrer !== window.location.href) {
                window.location.href = referrer; // Go to the referring page
            } else {
                window.location.href = "./index.html"; // Fallback to home page
            }
        } catch (e) {
            console.error("Navigation error:", e);
        }
    };

        if (this.completionRemainingDueContainer) {
            this.completionRemainingDueContainer.style.visibility = 'hidden'; // Hide initially
            this.completionRemainingDueContainer.classList.remove('visible'); // Reset animation class
        }
        // --- Button for Study Remaining Due: Use inline handler like other buttons ---
    if (this.studyRemainingDueBtn) {
        this.studyRemainingDueBtn.onclick = (event) => {
            console.log("Study Remaining Due button clicked!");
            this._handleStudyRemainingClick(event);
        };
    }
         if(this.compStatRemainingDueEl) this.compStatRemainingDueEl.textContent = '-';

        // --- Conditional Fetch ---
        const shouldFetchRemaining = checkRemainingDue && !this.isFocusedAllSession && !this.isPreviewMode;
        if (shouldFetchRemaining) {
             this._fetchAndDisplayRemainingDue(); // This will make the container visible on success
        } else {
             // Container remains hidden
        }

        // --- Button 2: Study Global Material ---
        const wasSpecificSession = this.initialParams.chapters || this.initialParams.mode === 'all';
        if (wasSpecificSession && this.initialParams.material) {
            // Update button text using child span if needed
            const btnTextSpan = this.studyGlobalMaterialBtn.querySelector('span');
            if (btnTextSpan) {
                btnTextSpan.textContent = `Study All Due ${this.initialParams.material}`;
            } else { // Fallback
                this.studyGlobalMaterialBtn.textContent = `Study All Due ${this.initialParams.material}`;
            }
            this.studyGlobalMaterialBtn.style.display = ''; // Show the button
            this.studyGlobalMaterialBtn.onclick = () => {
                window.location.href = `./study-session.html?material=${this.initialParams.material}`;
            };
        } else {
            this.studyGlobalMaterialBtn.style.display = 'none';
        }

         // --- Button 3: Study Other Material ---
         this.studyOtherBtn.onclick = this._handleStudyOtherClick.bind(this);
         // Reset popup state
        // Reset popup state and remove listener just in case
        if (this.otherMaterialsList) {
            this.otherMaterialsList.classList.remove('visible');
            if (this._boundHandleEscKeyForPopup) {
                document.removeEventListener('keydown', this._boundHandleEscKeyForPopup);
                this._boundHandleEscKeyForPopup = null;
            }
        }

        this.completionOverlay.style.display = 'flex';
    setTimeout(() => {
        this.completionOverlay.classList.add('is-visible');
    }, 10);

    // Clean up study session listeners, but preserve completion screen functionality
    const tempStudyRemainingBtn = this.studyRemainingDueBtn; // Store reference
    const tempReturnBtn = this.returnBtn;
    const tempStudyOtherBtn = this.studyOtherBtn;
    
    this.destroy(); // Clean up session listeners
    
    // Restore button references that destroy() might have cleared
    this.studyRemainingDueBtn = tempStudyRemainingBtn;
    this.returnBtn = tempReturnBtn; 
    this.studyOtherBtn = tempStudyOtherBtn;
}

        /**
     * Fetches the count of remaining due cards for the original session scope
     * and updates the completion screen UI.
     * @private
     */
/**
     * Fetches the count of remaining due cards AND the material's default batch size,
     * then updates the completion screen UI.
     * @private
     */
    /**
     * Fetches the TOTAL count of remaining due cards for the original scope
     * AND the material's default batch size, then updates the completion screen UI.
     * @private
     */
    async _fetchAndDisplayRemainingDue() {
         // Ensure elements exist
         if (!this.completionRemainingDueContainer || !this.compStatRemainingDueEl || !this.studyRemainingDueBtn || !this.studyRemainingBatchSizeInput) {
            console.warn("Cannot display remaining due: Compact container elements missing.");
            if (this.completionRemainingDueContainer) this.completionRemainingDueContainer.style.display = 'none';
            return;
        }

        const material = this.initialParams.material;
        const chapters = this.initialParams.chapters;

        console.log(`Fetching TOTAL remaining due count & settings for Material: ${material}, Chapters: ${chapters ?? 'All'}`);
        // Indicate loading in compact way
        if (this.compStatRemainingDueEl) this.compStatRemainingDueEl.textContent = '...';
        if (this.completionRemainingDueContainer) this.completionRemainingDueContainer.style.visibility = 'hidden'; // Use visibility for smoother show/hide
        if (this.studyRemainingDueBtn) this.studyRemainingDueBtn.disabled = true;

        let defaultBatchSize = 20;


        try {
            // Fetch Material Settings Concurrently (or first, depends on preference)
            const settingsPromise = apiClient.getMaterialSettings(material).catch(err => {
                console.error(`Failed to fetch material settings: ${err}. Using fallback batch size ${defaultBatchSize}.`);
                return null; // Allow proceeding with fallback
            });

            const filters = { material, due: true, buried: false, batchSize: 9999 };
            if (chapters) filters.chapter = chapters;
            const remainingDuePromise = apiClient.getCards(filters);

            const [settings, remainingDueCards] = await Promise.all([settingsPromise, remainingDuePromise]);

            // Process Settings
            if (settings) {
                 const batchSizeSetting = settings?.srsParameters?.defaultBatchSize ?? settings?.defaultBatchSize ?? null;
                 if (typeof batchSizeSetting === 'number' && batchSizeSetting > 0) {
                     defaultBatchSize = batchSizeSetting;
                     console.log(`DEBUG: Found default batch size from settings: ${defaultBatchSize}`);
                 } else {
                     console.log(`DEBUG: No valid default batch size found in settings, using fallback: ${defaultBatchSize}`);
                 }
            }
             // Update input field with determined batch size *before* showing the container
             if (this.studyRemainingBatchSizeInput) this.studyRemainingBatchSizeInput.value = defaultBatchSize;


            // Process Remaining Due Cards
            const remainingCount = remainingDueCards.length;
            console.log(`Found ${remainingCount} TOTAL remaining due cards.`);
            if (this.compStatRemainingDueEl) this.compStatRemainingDueEl.textContent = remainingCount;

            // Enable button if needed
            if (remainingCount > 0) {
                if (this.studyRemainingDueBtn) this.studyRemainingDueBtn.disabled = false;
            }

            // *** Make the container visible ***
            if (this.completionRemainingDueContainer) {
                this.completionRemainingDueContainer.style.visibility = 'visible'; // Make it visible
                this.completionRemainingDueContainer.classList.add('visible'); // Add class for animation
            }

        } catch (error) {
            console.error("Failed to fetch remaining due or settings:", error);
            if (this.compStatRemainingDueEl) this.compStatRemainingDueEl.textContent = 'N/A';
            // Keep container visible but indicate error? Or hide? Let's hide on error.
             if (this.completionRemainingDueContainer) this.completionRemainingDueContainer.style.visibility = 'hidden';

        }
    }

            /**
     * Handles click on the "Study Remaining Due" button on the completion screen.
     * @private
     */
 /**
     * Handles click on the "Study Remaining Due" button on the completion screen.
     * Removes essential listeners BEFORE navigation.
     * @param {Event} event - The click event object.
     * @private
     */
 _handleStudyRemainingClick(event) { // Add event parameter
    console.log("DEBUG: _handleStudyRemainingClick START"); // Log start

    // Check if default was somehow prevented *before* our logic
    if (event && event.defaultPrevented) {
        console.warn("DEBUG: Event default action was already prevented before handler logic.");
    }

    const material = this.initialParams.material;
    const chapters = this.initialParams.chapters;

    if (!material) {
        console.error("Cannot start remaining session: Material unknown.");
        return; // Stop execution
    }

    let batchSize = 0;
    if (this.studyRemainingBatchSizeInput) {
        batchSize = parseInt(this.studyRemainingBatchSizeInput.value, 10);
        if (isNaN(batchSize) || batchSize <= 0) {
            batchSize = 0;
        }
    } else {
        console.warn("DEBUG: Batch size input not found.");
    }

    console.log(`DEBUG: Preparing session - Material: ${material}, Chapters: ${chapters ?? 'All'}, Batch Size: ${batchSize > 0 ? batchSize : 'API Default'}`);

    const encodedMaterial = encodeURIComponent(material);
    let url = `study-session.html?material=${encodedMaterial}&status=due`;

    if (chapters) {
        url += `&chapters=${encodeURIComponent(chapters)}`;
    }
    if (batchSize > 0) {
        url += `&batchSize=${batchSize}`;
    }

    console.log('DEBUG: Constructed URL:', url); // Log the URL

    try {
        // --- Listener Removal ---
        console.log("DEBUG: Attempting to remove keydown listener...");
        document.removeEventListener('keydown', this._handleKeyDown);
        console.log("DEBUG: keydown listener removal called.");

        if (this.keyboardShortcuts) {
             console.log("DEBUG: Attempting to stop keyboardShortcuts listener...");
             this.keyboardShortcuts.stopListening();
             console.log("DEBUG: keyboardShortcuts.stopListening() called.");
        } else {
            console.warn("DEBUG: keyboardShortcuts instance not found during cleanup.");
        }
        // --- End Listener Removal ---

        console.log("DEBUG: About to assign window.location.href..."); // Log before navigation

        // --- Navigation ---
        window.location.href = url;
        // --- End Navigation ---

        // Code here might not execute if navigation is successful and immediate
        console.log("DEBUG: window.location.href assignment executed.");

    } catch (error) {
        console.error("ERROR during listener removal or navigation assignment:", error);
        // If an error occurs here, navigation definitely won't happen
    }

     // Check if default was prevented *after* our logic (less relevant for location change)
     if (event && event.defaultPrevented) {
        console.warn("DEBUG: Event default action was prevented during or after handler logic.");
    }

    console.log("DEBUG: _handleStudyRemainingClick END"); // Log end
}
        // NEW Method to update completion stats
        _updateCompletionStats() {
            if (!this.completionStatsEl) return;
    
            const totalStudied = this.sessionStats.correct + this.sessionStats.incorrect;
            const accuracy = totalStudied > 0 ? Math.round((this.sessionStats.correct / totalStudied) * 100) : 0;
    
            if (this.compStatTotalEl) this.compStatTotalEl.textContent = totalStudied;
            if (this.compStatAccuracyEl) this.compStatAccuracyEl.textContent = `${accuracy}%`;
                // Handle time correctly
            if (this.compStatTimeEl) {
                // Split time into minutes and seconds (format: "MM:SS")
                const timeComponents = this.sessionStats.time.split(':');
                if (timeComponents.length === 2) {
                    const minutesEl = this.compStatTimeEl.querySelector('.time-value.minutes');
                    const secondsEl = this.compStatTimeEl.querySelector('.time-value.seconds');
                    
                    if (minutesEl) minutesEl.textContent = timeComponents[0];
                    if (secondsEl) secondsEl.textContent = timeComponents[1];
                }
            }
            // Update accuracy circle
            if (this.compStatAccuracyCirclePath) {
                const circumference = 100; // Matches stroke-dasharray
                const offset = circumference - accuracy;
                // Need to set style after element is visible for transition
                 setTimeout(() => {
                     if(this.compStatAccuracyCirclePath) this.compStatAccuracyCirclePath.style.strokeDashoffset = offset;
                 }, 100); // Delay slightly after overlay becomes visible
            }
        }
/**
     * Handles the click on the "Study Other Material" button.
     * Toggles the visibility of the material list popup and manages the Escape key listener.
     * @private
     */
async _handleStudyOtherClick() {
    if (!this.otherMaterialsList) return;

    const shouldBeVisible = !this.otherMaterialsList.classList.contains('visible');

    if (shouldBeVisible) {
        console.log("Opening 'Study Another' popup and fetching materials...");
        this.otherMaterialsList.innerHTML = '<p>Loading...</p>';
        this.otherMaterialsList.classList.add('visible');

        // *** Add Escape key listener ***
        if (!this._boundHandleEscKeyForPopup) { // Prevent adding multiple listeners
            this._boundHandleEscKeyForPopup = this._handleEscKeyForPopup.bind(this);
            document.addEventListener('keydown', this._boundHandleEscKeyForPopup);
            console.log("Added Escape key listener for popup.");
        }

        try {
            // ... (existing fetch logic remains the same) ...
            const allMaterials = await apiClient.getMaterials();
            const otherMaterials = allMaterials.filter(mat =>
                mat.material !== this.initialParams.material &&
                (mat.dueCount !== undefined && mat.dueCount > 0)
            );
            this.otherMaterialsList.innerHTML = '';
            if (otherMaterials.length === 0) {
                 this.otherMaterialsList.innerHTML = '<p>No other materials have cards due.</p>';
            } else {
                // ... (create links) ...
                otherMaterials.forEach(mat => {
                    const link = document.createElement('a');
                    link.href = `study-session.html?material=${encodeURIComponent(mat.material)}`;
                    link.classList.add('other-material-item');
                    link.textContent = mat.material;
                    const countSpan = document.createElement('span');
                    countSpan.textContent = `${mat.dueCount} due`;
                    link.appendChild(countSpan);
                    this.otherMaterialsList.appendChild(link);
                });
            }
            // Ensure it's still visible after async operation
             this.otherMaterialsList.classList.add('visible');

        } catch (error) {
             console.error("Failed to fetch other materials:", error);
             this.otherMaterialsList.innerHTML = '<p style="color: red;">Error loading materials.</p>';
             this.otherMaterialsList.classList.add('visible');
        }
    } else {
        // Closing the popup
        console.log("Closing 'Study Another' popup.");
        this.otherMaterialsList.classList.remove('visible');
        // *** Remove Escape key listener ***
        if (this._boundHandleEscKeyForPopup) {
            document.removeEventListener('keydown', this._boundHandleEscKeyForPopup);
            this._boundHandleEscKeyForPopup = null; // Clear reference
            console.log("Removed Escape key listener for popup.");
        }
    }
}
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    if (typeof katex === 'undefined' || typeof renderMathInElement === 'undefined') {
        // ... (keep KaTeX check) ...
         console.error("KaTeX or auto-render not loaded. Study session cannot initialize properly.");
         document.body.innerHTML = `<div style="color: red; padding: 20px; text-align: center;"><h2>Error Loading Dependencies</h2><p>Could not load essential rendering libraries (KaTeX). Please check your internet connection and refresh the page.</p></div>`;
        return;
    }

    const studyView = new StudyView();
    studyView.initialize();

    // Cleanup on unload (optional but good practice)
     window.addEventListener('unload', () => {
         console.log("Window unloading, attempting to destroy StudyView...");
         studyView.destroy();
     });
});