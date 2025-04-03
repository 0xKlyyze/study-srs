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
        // --- DOM Element References (Updated for V3 Layout) ---
        this.bodyEl = document.body; // Target body for loading state
        this.studyAreaEl = document.getElementById('studyArea'); // Main content area
        this.sessionPillEl = document.querySelector('.session-pill'); // For potential hiding on complete
        this.cardViewerEl = document.getElementById('cardViewer'); // This is the .card-scene element
        this.qualityButtonsContainer = document.querySelector('.quality-buttons');
                // *** ADD DEBUG LOG ***
                if(this.qualityButtonsContainer) {
                    console.log("DEBUG: QualityButtons container selected:", this.qualityButtonsContainer);
                    // Check its parent to confirm it's inside cardViewerEl
                    console.log("DEBUG: QualityButtons container parent:", this.qualityButtonsContainer.parentElement);
                } else {
                    console.error("ERROR: QualityButtons container NOT FOUND!");
                }
                // *** END DEBUG LOG ***
        this.progressTrackerEl = document.getElementById('progressTracker'); // The .session-stats div
        this.skipButton = document.getElementById('skipBtn'); // Icon button in left actions
        this.endSessionButton = document.getElementById('endSessionBtn'); // Button in pill
        this.flipButton = document.getElementById('flipBtn'); // Button on card front
        this.cardFlipperEl = this.cardViewerEl?.querySelector('.card-flipper'); // Selector for flipper

        // Card Action Buttons (Updated IDs)
        this.starBtn = document.getElementById('starBtn');
        this.buryBtn = document.getElementById('buryBtn');
        this.editBtn = document.getElementById('editBtn');
        this.deleteBtn = document.getElementById('deleteBtn');
        this.aiBtn = document.getElementById('aiBtn'); // Added AI button reference (though inactive)

        // Completion Screen Elements
        this.completionContainer = document.getElementById('sessionCompleteContainer');
        this.completionMessageEl = document.getElementById('completionMessage');
        // Return/Study buttons are inside overlay
        this.returnBtn = document.getElementById('returnBtn');
        this.studyGlobalMaterialBtn = document.getElementById('studyGlobalMaterialBtn');
        this.studyOtherBtn = document.getElementById('studyOtherBtn');
        // Popup is inside overlay
        this.otherMaterialsList = document.getElementById('otherMaterialsList'); // Uses new class now
        this.aiPanelEl = document.getElementById('aiPanel');
        this.closeAiBtn = document.getElementById('closeAiBtn');
        this.aiBtn = document.getElementById('aiBtn'); // Already exists
        // --- NEW: Edit Panel Refs ---
        this.editPanelEl = document.getElementById('editPanel');
        this.closeEditBtn = document.getElementById('closeEditBtn'); // If added
        this.editNameInput = document.getElementById('sessionEditNameInput');
        this.editChapterInput = document.getElementById('sessionEditChapterInput');
        this.editBriefTextarea = document.getElementById('sessionEditBriefTextarea');
        this.editDetailedTextarea = document.getElementById('sessionEditDetailedTextarea');
        this.editSaveBtn = document.getElementById('sessionEditSaveBtn');
        this.editCancelBtn = document.getElementById('sessionEditCancelBtn');

        this.leftActionsColumnEl = document.getElementById('leftActionsColumn');
        this.rightActionsColumnEl = document.getElementById('rightActionsColumn');
               // Completion Screen V2 Elements
               this.completionOverlay = document.getElementById('sessionCompleteContainer'); // Now the overlay div
               // Completion message is inside overlay now
               this.completionMessageEl = document.getElementById('completionMessage');
               this.completionStatsEl = document.getElementById('completionStats'); // Container for stats
               // Individual stat elements
               this.compStatTotalEl = document.getElementById('compStatTotal');
               this.compStatAccuracyEl = document.getElementById('compStatAccuracy');
               this.compStatTimeEl = document.getElementById('compStatTime');
               this.compStatAccuracyCirclePath = document.querySelector('.accuracy-circle .accuracy-value-path'); // Path for circle animation

        // --- State ---
        this.isTiltActive = false; // Track if tilt effect is currently modifying style
        this.originalRightColumnButtons = [];
        this.sessionCards = [];
        this.currentCardIndex = -1;
        this.currentCard = null;
        this.currentCardOriginalData = null; // For edit cancel
        this.isLoading = false;
        this.isFlipped = false; // Card flip state
        this.sessionStats = { total: 0, remaining: 0, correct: 0, incorrect: 0, startTime: null, time: '00:00', timerInterval: null };
        this.initialParams = { material: null, chapters: null, mode: null };
        this.isLoadingAction = false; // Loading state for card actions (star, bury etc.)
        this.isAiPanelVisible = false;
        this.isEditPanelVisible = false; // NEW state
        // *** NEW State for Queue Refresh ***
        this.reviewsSinceLastCheck = 0;
        this.checkFrequency = 5; // Check every 5 reviews
        this.isCheckingForCards = false; // Prevent concurrent checks

        // --- Component Instances ---
        this.cardRenderer = null;
        this.qualityButtons = null;
        this.progressTracker = null;
        this.keyboardShortcuts = null;
        // Add a flag to easily check if in preview mode
        this.isPreviewMode = false;

        // Bind methods
        this._handleMouseMove = this._handleMouseMove.bind(this);
        this._handleMouseLeave = this._handleMouseLeave.bind(this);
        this._handleReview = this._handleReview.bind(this);
        this._skipCard = this._skipCard.bind(this);
        this._endSession = this._endSession.bind(this);
        this._flipCard = this._flipCard.bind(this);
        this._bindActionHandlers();
        this._toggleStar = this._toggleStar.bind(this); // Ensure these are bound if called directly
        this._toggleBury = this._toggleBury.bind(this);
        this._editCard = this._editCard.bind(this);
        this._deleteCard = this._deleteCard.bind(this);
        this._toggleAiPanel = this._toggleAiPanel.bind(this); // Bind new method
        this._toggleEditPanel = this._toggleEditPanel.bind(this); // NEW bind
        this._handleEditSave = this._handleEditSave.bind(this); // NEW bind
        this._handleEditCancel = this._handleEditCancel.bind(this); // NEW bind
        this._updateEditPreview = this._updateEditPreview.bind(this); // NEW bind
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

        // Get URL Params (same as before)
        const urlParams = new URLSearchParams(window.location.search);
        this.isPreviewMode = urlParams.get('preview') === 'true'; // Check URL parameter

        if (this.isPreviewMode) {
            console.warn("--- RUNNING IN PREVIEW MODE --- API calls will be skipped.");
        }

        this.initialParams.material = urlParams.get('material');
        this.initialParams.chapters = urlParams.get('chapters');
        this.initialParams.mode = urlParams.get('mode');

        if (this.rightActionsColumnEl) {
            this.originalRightColumnButtons = Array.from(this.rightActionsColumnEl.querySelectorAll('.icon-btn[data-original-column="right"]'));
            console.log("DEBUG: Stored original right column buttons:", this.originalRightColumnButtons);
        } else {
            console.warn("Right actions column not found, cannot manage button movement.");
        }

        this.isLoading = true;
        // *** Initialize refresh counter ***
        this.reviewsSinceLastCheck = 0;
        this.isCheckingForCards = false; // Reset flag on init
        this._updateLoadingState();
        this._updateFlipStateVisuals(); // Ensure initial state is front

        // Instantiate components (pass updated elements)
        this.cardRenderer = new CardRenderer(this.cardViewerEl); // Pass .card-scene
        this.progressTracker = new ProgressTracker(this.progressTrackerEl); // Pass .session-stats
        this.qualityButtons = new QualityButtons(this.qualityButtonsContainer, this._handleReview);
        this.keyboardShortcuts = new KeyboardShortcuts();

        // Register keyboard shortcuts (includes flip keys)
        this._setupKeyboardShortcuts();
        this.keyboardShortcuts.startListening();

        // Setup button listeners
        this.skipButton?.addEventListener('click', this._skipCard);
        this.endSessionButton?.addEventListener('click', this._endSession);
        this.flipButton?.addEventListener('click', this._flipCard); // Listener for new flip button
        this._setupEventListeners(); // Ensure called after checks
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
            } else {
                // --- Load Data from API (Existing Logic) ---
                let cardSourcePromise;
                let sessionTypeLog = "";
                const isFocusedDueSession = this.initialParams.material && this.initialParams.chapters && this.initialParams.mode !== 'all';
                const isFocusedAllSession = this.initialParams.material && this.initialParams.chapters && this.initialParams.mode === 'all';
                const isGlobalMaterialDueSession = this.initialParams.material && !this.initialParams.chapters;
                const isGlobalAllDueSession = !this.initialParams.material;

                // Determine API call based on parameters (existing logic)
                if (isFocusedDueSession) { /* ... set promise ... */ sessionTypeLog = `INITIAL FETCH: Focused Due...`; cardSourcePromise = apiClient.getStudySessionCards(this.initialParams.material, this.initialParams.chapters); }
                else if (isFocusedAllSession) { /* ... set promise ... */ sessionTypeLog = `INITIAL FETCH: Focused All...`; cardSourcePromise = apiClient.getCards({ material: this.initialParams.material, chapter: this.initialParams.chapters, buried: false }); }
                else if (isGlobalMaterialDueSession) { /* ... set promise ... */ sessionTypeLog = `INITIAL FETCH: Global Material Due...`; cardSourcePromise = apiClient.getCards({ material: this.initialParams.material, due: true, buried: false }); }
                else { /* ... set promise ... */ sessionTypeLog = `INITIAL FETCH: Global All Due...`; cardSourcePromise = apiClient.getCards({ due: true, buried: false }); }

                console.log(`Initializing study session: ${sessionTypeLog}`);
                this.sessionCards = await cardSourcePromise;
                console.log(`Fetched ${this.sessionCards.length} cards from API.`);

                if (this.sessionCards.length === 0) {
                    // Show appropriate completion/empty message (existing logic)
                    const message = (isFocusedDueSession || isFocusedAllSession) ? `No cards found for this selection!` : "No cards due for review right now!";
                    this._showCompletionMessage(message);
                } else {
                    // Initialize stats and start session (existing logic)
                    this.sessionStats.total = this.sessionCards.length;
                    this.sessionStats.remaining = this.sessionCards.length;
                    this._updateRemainingCount();
                    this.progressTracker.update(this.sessionStats);
                    this._startTimer(); // Start timer only for real sessions
                    this._loadNextCard();
                }
                 // --- End API Data Loading ---
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
            // Existing Listeners (Skip, End, Flip, Quality, Tilt)
            // ...
            // Action Button Listeners
            if (this.cardViewerEl && this.cardFlipperEl) {
                this.cardViewerEl.addEventListener('mousemove', this._handleMouseMove);
                this.cardViewerEl.addEventListener('mouseleave', this._handleMouseLeave);
                // Listen for the end of the flip transition
                this.cardFlipperEl.addEventListener('transitionend', this._onFlipTransitionEnd.bind(this));
                console.log("Tilt and TransitionEnd listeners added.");
            }

            if (this.aiBtn && this.aiPanelEl) { // Only add listener if elements exist
                this.aiBtn.addEventListener('click', this._toggleAiPanel);
            }
             if (this.closeAiBtn && this.aiPanelEl) {
                 this.closeAiBtn.addEventListener('click', this._toggleAiPanel);
             }

            this.starBtn?.addEventListener('click', this._toggleStar);
            this.buryBtn?.addEventListener('click', this._toggleBury);
            this.editBtn?.addEventListener('click', this._editCard); // Connects to edit handler
            this.deleteBtn?.addEventListener('click', this._deleteCard);
    
            // --- NEW: Edit Panel Listeners ---
            this.closeEditBtn?.addEventListener('click', () => this._toggleEditPanel(false)); // Close button if added
            this.editSaveBtn?.addEventListener('click', this._handleEditSave);
            this.editCancelBtn?.addEventListener('click', this._handleEditCancel);
            // Live Preview Listeners
            this.editNameInput?.addEventListener('input', () => this._updateEditPreview('name'));
            this.editChapterInput?.addEventListener('input', () => this._updateEditPreview('chapter')); // Add chapter preview if needed
            this.editBriefTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('brief'));
            this.editDetailedTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('detailed'));
            // --- End Edit Panel Listeners ---
    
            // Keyboard listener
            document.addEventListener('keydown', this._handleKeyDown);
        }    

    destroy() {
        this.keyboardShortcuts?.stopListening();
        this.skipButton?.removeEventListener('click', this._skipCard);
        this.endSessionButton?.removeEventListener('click', this._endSession);
        this.flipButton?.removeEventListener('click', this._flipCard);
        this.starBtn?.removeEventListener('click', this._toggleStar);
        this.buryBtn?.removeEventListener('click', this._toggleBury);
        this.editBtn?.removeEventListener('click', this._editCard);
        this.deleteBtn?.removeEventListener('click', this._deleteCard);
        this.editSaveBtn?.removeEventListener('click', this._handleEditSave);
        this.editCancelBtn?.removeEventListener('click', this._handleEditCancel);
        // Remove input listeners
        this.editNameInput?.removeEventListener('input', this._updateEditPreview);
                // Remove tilt listeners
        if (this.cardViewerEl) {
            this.cardViewerEl.removeEventListener('mousemove', this._handleMouseMove);
            this.cardViewerEl.removeEventListener('mouseleave', this._handleMouseLeave);
            console.log("Tilt listeners removed.");
        }

        if (this.cardFlipperEl) {
            this.cardFlipperEl.removeEventListener('transitionend', this._onFlipTransitionEnd);
        }
       console.log("Tilt and TransitionEnd listeners removed.");

        // Remove AI listeners
        if (this.aiBtn) {
            this.aiBtn.removeEventListener('click', this._toggleAiPanel);
        }
            if (this.closeAiBtn) {
                this.closeAiBtn.removeEventListener('click', this._toggleAiPanel);
            }
            console.log("AI listeners removed.");

        
        // Remove AI button listener if added
        this._stopTimer();
        this.isCheckingForCards = false; 
        console.log("StudyView destroyed and listeners removed.");
        if (this.isAiPanelVisible) {
            this._toggleAiPanel(); // Attempt to close it cleanly
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
             if (!this.keyboardShortcuts) return;
    
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

         _handleKeyDown(event) {
            // Escape logic to close panels first
            if (event.key === 'Escape') {
                if (this.isEditPanelVisible) { this._handleEditCancel(); }
                else if (this.isAiPanelVisible) { this._toggleAiPanel(false); }
                else { /* Potentially end session or do nothing? */ }
                return; // Stop further processing for Escape
            }
    
            // If any panel is visible, block other shortcuts
            if (this.isAiPanelVisible || this.isEditPanelVisible) {
                 return;
            }
    
            // Let KeyboardShortcuts class handle the rest
            this.keyboardShortcuts.handleKeyEvent(event);
        }
    

    // --- Private Helper Methods ---

    _loadNextCard() {
        console.log(`DEBUG: _loadNextCard START. Current Index (Before Inc): ${this.currentCardIndex}, Queue Length: ${this.sessionCards.length}`);
        this.currentCardIndex++;
        console.log(`DEBUG: _loadNextCard AFTER Inc. New Index: ${this.currentCardIndex}`); // Log right after incremen
        this._updateRemainingCount(); // Update remaining count based on new index and potentially new length
                // *** Update the progress tracker display HERE ***
    
        this.progressTracker.update(this.sessionStats);
        console.log(`DEBUG: _loadNextCard - Index: ${this.currentCardIndex}, Remaining (Stat): ${this.sessionStats.remaining}, Queue Length: ${this.sessionCards.length}`);
        if (this.currentCardIndex < this.sessionCards.length) {
            this.currentCard = this.sessionCards[this.currentCardIndex];
            if (typeof this.currentCard.id === 'undefined') {
                console.error(`CRITICAL: Card at index ${this.currentCardIndex} is missing an ID!`, this.currentCard);
                this._showError(`Error loading card ${this.currentCardIndex + 1}. It is missing an ID.`, true);
                this._skipCard(); // Attempt to skip problematic card
                return;
            }

            console.log(`Loading card ${this.currentCardIndex + 1}/${this.sessionCards.length}: ${this.currentCard.name} (ID: ${this.currentCard.id})`);

            this.isFlipped = false;
            this._updateFlipStateVisuals();

            // Render card content using CardRenderer
            this.cardRenderer.render(this.currentCard); // Renderer now handles front meta too

            // Starred visual state (handled by CardRenderer now)
            // const isStarred = !!this.currentCard.is_starred;
            // this.cardViewerEl?.classList.toggle('card-viewer--starred', isStarred); // Removed - handled by Renderer

            // Update progress tracker
            this.sessionStats.remaining = this.sessionCards.length - this.currentCardIndex;
            this.progressTracker.update(this.sessionStats);

            // Re-enable buttons
            this.qualityButtons.setDisabled(true); // Quality buttons are disabled until flipped
            if(this.skipButton) this.skipButton.disabled = false;
            if(this.flipButton) this.flipButton.disabled = false; // Enable flip button
            // Update Action Button UI states (star, bury)
            this._updateActionButtonsUI();

            this.isLoading = false;
            this._updateLoadingState();

        } else {
            // Session finished
            this.currentCard = null;
            this.isLoading = false;
            this._updateLoadingState();
            this._finalDueCardCheck();
            // No need to call destroy() here, completion message handles UI transition
        }
    }

// --- studyView.js ---

    /**
     * Performs a final check for any newly due cards before ending the session.
     * Fetches cards based on the original session scope and adds any new ones to the queue.
     * If new cards are found, continues the session; otherwise, shows the completion screen.
     * @private
     */
    async _finalDueCardCheck() {
        if (this.isPreviewMode) { // Skip final check in preview
            console.log("DEBUG: Final Check - Preview Mode. Ending session.");
            this.isLoading = false; this._updateLoadingState();
            this._showCompletionMessage("Preview Session Complete!");
            return;
       }
        // 1. --- Initial Guards & State Setup ---
        // Skip check entirely if it's a "Study All Chapter" session - session is truly over.
        if (this.initialParams.mode === 'all' && this.initialParams.chapters) {
            console.log("DEBUG: Final Check - 'Study All Chapter' mode detected. Session is complete.");
            this.isLoading = false; // Ensure loading is off before showing completion
            this._updateLoadingState();
            this._showCompletionMessage("Study session complete!");
            return;
        }

        // Prevent concurrent checks or running offline
        if (this.isCheckingForCards || !navigator.onLine) {
            if (!navigator.onLine) console.log("DEBUG: Final Check - Offline. Assuming session complete.");
            else console.log("DEBUG: Final Check - Already checking. Skipping.");
            this.isLoading = false; // Ensure loading is off
            this.isCheckingForCards = false; // Reset flag if needed
            this._updateLoadingState();
            this._showCompletionMessage(navigator.onLine ? "Study session complete!" : "Session complete (offline).");
            return;
        }

        console.log("DEBUG: Final Check - Starting final fetch for due cards...");
        this.isCheckingForCards = true; // Set flag: check is now in progress
        this.isLoading = true; // Set loading state for the check duration
        this._updateLoadingState(); // Update UI visuals

        // 2. --- Determine Fetch Operation ---
        // Declare variable *outside* try block
        let cardCheckPromise = null;
        try {
             // Get the appropriate promise based on session type
             cardCheckPromise = this._getDynamicDueCardsPromise();

             // If no dynamic check is applicable for this session type (e.g., edge case)
             if (!cardCheckPromise) {
                 console.log("DEBUG: Final Check - No dynamic check required for this session type. Ending session.");
                 this.isLoading = false;
                 this.isCheckingForCards = false;
                 this._updateLoadingState();
                 this._showCompletionMessage("Study session complete!");
                 return; // Exit function early
             }

            // 3. --- Execute Fetch and Process Results ---
            const dueCards = await cardCheckPromise;
            console.log(`DEBUG: Final Check - API returned ${dueCards?.length ?? 0} potentially due cards.`);

            let newCardsAdded = false; // Flag to track if session should continue

            if (dueCards && dueCards.length > 0) {
                // Create a Set of IDs for ALL cards processed so far in this session
                // This includes cards already reviewed AND those remaining in the queue initially
                const processedCardIds = new Set(this.sessionCards.map(card => card.id));
                console.log(`DEBUG: Final Check - Comparing against ${processedCardIds.size} processed card IDs.`);

                // Filter the fetched due cards to find ones not already processed
                const newUniqueCards = dueCards.filter(card => {
                    const isNew = typeof card.id !== 'undefined' && !processedCardIds.has(card.id);
                    // if (isNew) console.log(`DEBUG: Final Check - Found new card: ${card.id} (${card.name})`); // Optional detailed log
                    return isNew;
                });

                // If new unique cards were found
                if (newUniqueCards.length > 0) {
                    console.log(`DEBUG: Final Check - Found ${newUniqueCards.length} new card(s) to add.`);
                    // Add the new cards to the end of the main session queue
                    this.sessionCards.push(...newUniqueCards);
                    console.log(`DEBUG: Final Check - Queue length is now ${this.sessionCards.length}.`);
                    newCardsAdded = true; // Set flag to continue session
                } else {
                    console.log("DEBUG: Final Check - No *new* unique due cards found among API results.");
                }
            } else {
                 console.log("DEBUG: Final Check - API returned no due cards.");
            }

            // 4. --- Decide Next Action based on newCardsAdded flag ---
            if (newCardsAdded) {
                 // Continue the session
                 console.log("DEBUG: Final Check - Continuing session with newly added cards.");
                 this.isCheckingForCards = false; // Reset check flag
                 this.isLoading = false; // Reset loading flag (let _loadNextCard handle its loading)
                 // Note: No need to call _updateLoadingState here immediately
                 this._loadNextCard(); // Call load next, it will handle index and loading state
            } else {
                 // End the session
                 console.log("DEBUG: Final Check - Confirmed no more cards due. Ending session.");
                 this.isCheckingForCards = false; // Reset check flag
                 this.isLoading = false; // Reset loading flag before showing completion
                 this._updateLoadingState(); // Update UI to remove loading state
                 this._showCompletionMessage("Study session complete!");
            }

        } catch (error) {
            // 5. --- Handle Errors during Fetch/Processing ---
            console.error("Error during final due card check:", error);
            this.isCheckingForCards = false; // Reset flag on error
            this.isLoading = false; // Reset loading flag on error
            this._updateLoadingState(); // Update UI
            // Proceed to completion screen on error to avoid getting stuck
            this._showCompletionMessage("Session complete (error during final check).");
        }
        // No 'finally' block is needed as all success/error paths handle resetting flags.
    } // --- End of _finalDueCardCheck ---

        // *** NEW Method to Check for Due Cards ***
        async _checkForNewDueCards() { // Background check
            if (this.isPreviewMode) return; // Don't check in preview
            // Skip check if it's a "Study All Chapter" session
            if (this.initialParams.mode === 'all' && this.initialParams.chapters) {
                console.log("DEBUG: Background Check - 'Study All Chapter' mode, skipping dynamic due check.");
                return; // No dynamic checks needed
            }
    
            if (this.isCheckingForCards || !navigator.onLine) return; // Basic guards
    
            console.log(`DEBUG: Background Check - Checking for new due cards...`);
            this.reviewsSinceLastCheck = 0;
            this.isCheckingForCards = true;
    
            const cardCheckPromise = this._getDynamicDueCardsPromise(); // Get the correct fetch promise
    
            if (!cardCheckPromise) { // Handle case where no check is needed
                 console.log("DEBUG: Background Check - No dynamic check required for this session type.");
                 this.isCheckingForCards = false;
                 return;
            }
    
            try {
                const dueCards = await cardCheckPromise;
                console.log(`DEBUG: Background Check - Found ${dueCards?.length ?? 0} potentially new due cards.`);
    
                if (dueCards && dueCards.length > 0) {
                    // Filter against remaining + current (existing logic)
                     const remainingCardIds = new Set(this.sessionCards.slice(this.currentCardIndex + 1).map(card => card.id));
                     if (this.currentCard) remainingCardIds.add(this.currentCard.id);
                     const newUniqueCards = dueCards.filterr(card =>
                        typeof card.id !== 'undefined' && !remainingCardIds.has(card.id)
                    ); // Same filtering
    
                     if (newUniqueCards.length > 0) {
                         console.log(`DEBUG: Background Check - Adding ${newUniqueCards.length} new unique cards.`);
                         const insertionIndex = this.currentCardIndex + 1;
                         this.sessionCards.splice(insertionIndex, 0, ...newUniqueCards);
                         console.log(`DEBUG: Background Check - Queue length is now ${this.sessionCards.length}`);
                         this._updateRemainingCount();
                         this.progressTracker.update(this.sessionStats);
                     } else {console.log("DEBUG: No *new* unique due cards found to add."); }
                }
            } catch (error) {
                console.error("Error during background due card check:", error);
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

        console.log(`Handling review for card ${this.currentCard.id} with quality ${quality}`);

        this.isLoading = true; // Use main loading flag
        this.qualityButtons.setDisabled(true);
        if(this.skipButton) this.skipButton.disabled = true;
        this._disableActionButtons(); // Disable side actions during review submission
        this._updateLoadingState();

        // Optimistic stat update
        if (quality >= 2) { this.sessionStats.correct++; } else { this.sessionStats.incorrect++; }

        try {
            await apiClient.submitReview(this.currentCard.id, quality);
            console.log(`DEBUG: _handleReview complete for index ${this.currentCardIndex}. Current queue length: ${this.sessionCards.length}. Calling _loadNextCard...`);
            this._loadNextCard(); // Success: load next
            // *** Increment review counter and trigger check if needed ***
            this.reviewsSinceLastCheck++;
            if (this.reviewsSinceLastCheck >= this.checkFrequency) {
                // Don't await - let it run in background
                this._checkForNewDueCards();
           }
           // *** End check trigger ***

        } catch (error) {
             console.error(`Failed to submit review for card ${this.currentCard.id}:`, error);
             this._showError("Failed to save review. Please check connection.", true);
             // Revert optimistic stat update
             if (quality >= 2) { this.sessionStats.correct--; } else { this.sessionStats.incorrect--; }
             // Re-enable buttons on error
             this.qualityButtons.setDisabled(false); // Re-enable quality for retry
             if(this.skipButton) this.skipButton.disabled = false;
             this._enableActionButtons(); // Re-enable side actions
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

        if (action === 'bury' && !confirm(`Bury this card until tomorrow?`)) {
             this.isLoadingAction = false;
             this._setActionButtonStateBasedOnLoading();
             return;
        }

        console.log(`${action === 'bury' ? 'Burying' : 'Unburying'} card ${cardId}`);
        // Optimistic UI update handled by _updateActionButtonsUI after success/failure

        try {
            const updatedCard = await apiClient[action === 'bury' ? 'buryCard' : 'unburyCard'](cardId);
            this.currentCard.is_buried = updatedCard.is_buried; // Update state from response
            this._updateActionButtonsUI(); // Update UI based on final state

            if (!isCurrentlyBuried) { // If action was 'bury'
                 console.log("Card buried, loading next card.");
                 // Don't need skipCard, just load next directly after state is set
                 this.isLoading = true; // Set main loading flag for next card load
                 this._updateLoadingState(); // Show loading visuals
                 this._loadNextCard(); // Load the next one
            }

        } catch (error) {
             console.error(`Failed to ${action} card:`, error);
             this._showError(`Failed to ${action} card.`, true);
             // State didn't change, so just re-enable buttons
        } finally {
             // Only reset loading flag if NOT loading next card (i.e., unbury or failed bury)
             if (isCurrentlyBuried || !this.currentCard.is_buried) {
                  this.isLoadingAction = false;
                  this._setActionButtonStateBasedOnLoading(); // Re-enable relevant buttons
             }
             // If burying succeeded, isLoadingAction remains true until next card loaded sets it false implicitly.
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

    async _deleteCard() { // Logic largely unchanged, added isLoadingAction
        if (!this.currentCard || this.isLoading || this.isLoadingAction) return;
        if (!confirm("PERMANENTLY delete this flashcard? This cannot be undone.")) return;

                // *** PREVIEW MODE Check ***
                if (this.isPreviewMode) {
                    console.log(`PREVIEW: Simulating delete for card ${this.currentCard.id}`);
                    const cardIndex = this.currentCardIndex;
                    this.sessionCards.splice(cardIndex, 1); // Remove from sample array
                    this.sessionStats.total--;
                    if (this.currentCardIndex >= this.sessionCards.length) { this.currentCardIndex = this.sessionCards.length - 1; }
                    else { this.currentCardIndex--; }
                    this.isLoading = true; this._updateLoadingState(); // Simulate load
                    await new Promise(resolve => setTimeout(resolve, 100));
                    this._loadNextCard(); // Load next sample
                    return; // Skip API call
                }
                // *** END PREVIEW MODE Check ***

        this.isLoadingAction = true;
        this._setActionButtonStateBasedOnLoading(); // Disable buttons

        const cardId = this.currentCard.id;
        const cardIndex = this.currentCardIndex;
        console.log(`Deleting card ${cardId}`);

        try {
            await apiClient.deleteCard(cardId);
            this._showError("Card deleted.", true); // Use temporary error as notification

            this.sessionCards.splice(cardIndex, 1);
            this.sessionStats.total--;

            // Adjust index before loading next
            if (this.currentCardIndex >= this.sessionCards.length) {
                this.currentCardIndex = this.sessionCards.length - 1;
            } else {
                this.currentCardIndex--; // Decrement before _loadNextCard increments
            }

            this.isLoading = true; // Set main loading flag for next card load
            this._updateLoadingState(); // Show loading visuals
            this._loadNextCard(); // Load next card

        } catch (error) {
             console.error(`Failed to delete card:`, error);
             this._showError("Failed to delete card.", true);
             this.isLoadingAction = false; // Reset on error
             this._setActionButtonStateBasedOnLoading(); // Re-enable buttons
        }
        // Success path handles loading state via _loadNextCard
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

    _showCompletionMessage(message) {
        console.log("Session complete:", message);
        this._stopTimer();

        // Hide study elements
        if(this.studyAreaEl) this.studyAreaEl.style.display = 'none';
        if (this.isEditPanelVisible) this._toggleEditPanel(false); // Close edit panel too
        if(this.sessionPillEl) this.sessionPillEl.style.display = 'none';

        // Prepare and show completion UI
        if (!this.completionOverlay) { // Check overlay
             console.error("Cannot show completion message: overlay container not found.");
             window.history.back(); // Fallback
             return;
         }

        if(this.completionMessageEl) this.completionMessageEl.textContent = message;

        // --- Populate Stats ---
        this._updateCompletionStats();


        // --- Button 1: Return ---
        this.returnBtn.onclick = () => {
             console.log("Return button clicked.");
             window.history.back();
        };

         // --- Button 2: Study Global Material ---
         // Logic remains the same
         const wasSpecificSession = this.initialParams.chapters || this.initialParams.mode === 'all';
         if (wasSpecificSession && this.initialParams.material) {
             // Update button text using child span if needed
             const btnTextSpan = this.studyGlobalMaterialBtn.querySelector('span');
             if (btnTextSpan) btnTextSpan.textContent = `Study All Due ${this.initialParams.material}`;
             else this.studyGlobalMaterialBtn.textContent = `Study All Due ${this.initialParams.material}`; // Fallback
             this.studyGlobalMaterialBtn.style.display = '';
             this.studyGlobalMaterialBtn.onclick = () => {
                 window.location.href = `study-session.html?material=${encodeURIComponent(this.initialParams.material)}`;
             };
         } else {
             this.studyGlobalMaterialBtn.style.display = 'none';
         }

         // --- Button 3: Study Other Material ---
         this.studyOtherBtn.onclick = this._handleStudyOtherClick.bind(this);
         // Reset popup state
         if (this.otherMaterialsList) {
             this.otherMaterialsList.classList.remove('visible');
             this.otherMaterialsList.innerHTML = '';
         }

         // Show the overlay using visibility class
         this.completionOverlay.style.display = 'flex'; // Set display before adding class
         // Use setTimeout to allow display change to render before transition starts
         setTimeout(() => {
            this.completionOverlay.classList.add('is-visible');
         }, 10); // Small delay

         this.destroy(); // Clean up session listeners
    }

        // NEW Method to update completion stats
        _updateCompletionStats() {
            if (!this.completionStatsEl) return;
    
            const totalStudied = this.sessionStats.correct + this.sessionStats.incorrect;
            const accuracy = totalStudied > 0 ? Math.round((this.sessionStats.correct / totalStudied) * 100) : 0;
    
            if (this.compStatTotalEl) this.compStatTotalEl.textContent = totalStudied;
            if (this.compStatAccuracyEl) this.compStatAccuracyEl.textContent = `${accuracy}%`;
            if (this.compStatTimeEl) this.compStatTimeEl.textContent = this.sessionStats.time; // Use final time
    
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
    async _handleStudyOtherClick() { // Logic seems okay, needs testing
        if (!this.otherMaterialsList) return; // Check if list element exists

        const isVisible = this.otherMaterialsList.classList.contains('visible');

        if (isVisible) {
            this.otherMaterialsList.classList.remove('visible');
            return;
        }

        console.log("Fetching other materials with due counts...");
        this.otherMaterialsList.innerHTML = '<p>Loading...</p>';
        this.otherMaterialsList.classList.add('visible');

        try {
            const allMaterials = await apiClient.getMaterials();
            const otherMaterials = allMaterials.filter(mat =>
                mat.material !== this.initialParams.material &&
                (mat.dueCount !== undefined && mat.dueCount > 0)
            );

            this.otherMaterialsList.innerHTML = '';

            if (otherMaterials.length === 0) {
                 this.otherMaterialsList.innerHTML = '<p>No other materials have cards due.</p>';
            } else {
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
            this.otherMaterialsList.classList.add('visible');

        } catch (error) {
             console.error("Failed to fetch other materials:", error);
             this.otherMaterialsList.innerHTML = '<p style="color: red;">Error loading materials.</p>';
             this.otherMaterialsList.classList.add('visible');
        }
    }
}

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Add a check for KaTeX dependencies before initializing
    if (typeof katex === 'undefined' || typeof renderMathInElement === 'undefined') {
        console.error("KaTeX or auto-render not loaded. Study session cannot initialize properly.");
        // Display a user-facing error message on the page
        document.body.innerHTML = `<div style="color: red; padding: 20px; text-align: center;">
            <h2>Error Loading Dependencies</h2>
            <p>Could not load essential rendering libraries (KaTeX). Please check your internet connection and refresh the page.</p>
            </div>`;
        return;
    }

    const studyView = new StudyView();
    studyView.initialize();

    // Optional: Add beforeunload cleanup (can be problematic)
    // window.addEventListener('beforeunload', () => {
    //     studyView.destroy();
    // });
});