// --- File: js/views/chapterDetailsView.js ---
console.log("--- chapterDetailsView.js LOADED - Version XYZ ---"); // Put a unique version number here, like XYZ

import { apiClient } from '../api/apiClient.js';
import { processAndRenderLatex } from '../utils/latexProcessorDetails.js';
import { debounce } from '../utils/helpers.js'; // Assuming debounce exists
// Note: We will call the global preprocessAndpreprocessAndRenderMathInElementTestTest provided by KaTeX script in HTML

// Make sure Chart.js is loaded via HTML

class ChapterDetailsView {
    constructor() {
        console.log("--- ChapterDetailsView Constructor Running ---"); // Add this line
        // --- Main Container ---
        this.mainContent = document.getElementById('mainContent');

        // --- Header Elements ---
        this.breadcrumbsEl = this.mainContent?.querySelector('.breadcrumbs');
        // ** References for specific parts of breadcrumbs **
        this.breadcrumbMaterialLink = this.breadcrumbsEl?.querySelector('a');
        this.breadcrumbChapterSpan = this.breadcrumbsEl?.querySelector('.breadcrumb-chapter-name');
        // Study Button is now outside header, get by ID

        // --- Analytics & Graph ---
        // Using more specific IDs would be better than nth-child selectors
        this.masteryProgressEl = this.mainContent?.querySelector('.chapter-analytics progress');
        this.masteryValueEl = this.mainContent?.querySelector('.chapter-analytics .value');
        this.totalCardsEl = document.getElementById('statTotalCards');
        this.criticalCardsEl = document.getElementById('statCriticalCards'); // NEW Ref for Critical Cards
        this.learningCardsEl = document.getElementById('statLearningCards');
        this.masteredCardsEl = document.getElementById('statMasteredCards'); // New
        // this.newCardsEl = document.getElementById('statNewCards'); // If you add a 'New' box
        // If other stat boxes exist (e.g., for New, Mastered), add references here
        this.timelineGraphContainer = this.mainContent?.querySelector('.timeline-graph-placeholder');

        // --- Filters & Bulk Actions ---
        this.controlsSection = this.mainContent?.querySelector('.controls-section'); // New wrapper
        this.filterButtonContainer = this.controlsSection?.querySelector('.filter-buttons-group'); // Updated selector
        this.filterButtons = this.filterButtonContainer?.querySelectorAll('.filter-btn'); // Update selector
        // ** New Bulk Action Elements **
        this.bulkActionsGroup = document.getElementById('bulkActionsGroup');
        this.selectCardsToggleBtn = document.getElementById('selectCardsToggleBtn');
        this.bulkStarBtn = document.getElementById('bulkStarBtn');
        this.bulkBuryBtn = document.getElementById('bulkBuryBtn');
        this.bulkDeleteBtn = document.getElementById('bulkDeleteBtn');


        // --- Card Grid ---
        this.cardGridEl = document.getElementById('cardGrid');

        // --- Modal Elements (mostly unchanged refs, but structure changed) ---
        this.modalOverlay = document.getElementById('flashcardPreviewModal');
        this.modalContent = this.modalOverlay?.querySelector('.modal-content');
        this.globalModalCloseBtn = document.getElementById('modalCloseBtn');
        this.modalTheoremName = document.getElementById('modalTheoremName');
        this.modalCardStatusPill = document.getElementById('modalCardStatusPill');
        this.modalNextReviewPill = document.getElementById('modalNextReviewPill');
        this.modalLastReviewPill = document.getElementById('modalLastReviewPill');
        this.modalMasteryLevelPill = document.getElementById('modalMasteryLevelPill');
        this.modalBody = this.modalOverlay?.querySelector('.modal-body');
        this.modalBriefExplanation = document.getElementById('modalBriefExplanation');
        this.modalDetailSeparator = document.getElementById('modalDetailSeparator'); // Ref needed
        this.modalDetailedExplanation = document.getElementById('modalDetailedExplanation');
        this.modalToggleBtn = document.getElementById('modalToggleBtn');
        this.modalBuryBtn = document.getElementById('modalBuryBtn');
        this.modalStarBtn = document.getElementById('modalStarBtn');
        this.modalAIBtn = document.getElementById('modalAIBtn');
        this.modalDeleteBtn = document.getElementById('modalDeleteBtn');
        this.modalEditBtn = document.getElementById('modalEditBtn');
        this.modalPrevBtn = document.getElementById('modalPrevBtn');
        this.modalNextBtn = document.getElementById('modalNextBtn');
        this.aiChatPanel = document.getElementById('aiChatPanel');
        // --- NEW: Edit Panel Elements ---
        this.editCardPanel = document.getElementById('editCardPanel');
        this.editNameInput = document.getElementById('editNameInput');
        this.editChapterInput = document.getElementById('editChapterInput'); // Added
        this.editBriefTextarea = document.getElementById('editBriefTextarea');
        this.editDetailedTextarea = document.getElementById('editDetailedTextarea');
        this.editSaveBtn = document.getElementById('editSaveBtn');
        this.editCancelBtn = document.getElementById('editCancelBtn');

        // --- NEW: Floating Pill Elements ---
        this.floatingStudyPill = document.getElementById('floatingStudyPill');
        this.pillChapterSwitcher = document.getElementById('pillChapterSwitcher');
        this.pillChapterSwitcherInner = document.getElementById('pillChapterSwitcherInner');
        this.pillNewCardsCount = document.getElementById('pillNewCardsCount');
        this.pillDueCardsCount = document.getElementById('pillDueCardsCount');
        this.pillStudyButtonWrapper = this.floatingStudyPill?.querySelector('.study-button-wrapper');
        this.pillStudyDueButton = document.getElementById('pillStudyDueButton');
        this.pillOptionsTrigger = document.getElementById('pillOptionsTrigger');
        this.studyOptionsPopup = document.getElementById('studyOptionsPopup');
        this.pillStudyAllButton = document.getElementById('pillStudyAllButton'); // New button ID from HTML
        this.pillReviewBatchSize = document.getElementById('pillReviewBatchSize');
        this.pillChapterTooltip = document.getElementById('pillChapterTooltip');

        // --- State ---
        this.currentMaterial = null; this.currentChapter = null;
        this.allCards = []; this.filteredCardIds = [];
        this.currentModalCardId = null; this.currentModalCardIndex = -1;
        this.currentModalOriginalData = null; // Store original data for edit cancel
        this.isModalVisible = false; this.isAIViewActive = false;
        this.isEditViewActive = false; // New state for edit panel
        this.isHeaderRenaming = false; // New state for header rename
        this.activeHeaderRenameInput = null; // Track active header input
        // ** New State **
        this.isCardSelectionMode = false; // For selecting cards in the grid
        this.selectedCardIds = new Set(); // Store IDs of selected cards
        this.isLoading = { cards: false, analytics: false, timeline: false, modalAction: false, srsThresholds: false, modalLoad: false, bulkAction: false, headerRename: false, allChapters: false, materialSettings: false }; // Add bulkAction state
        this.timelineChartInstance = null;
        // --- ADD SRS Thresholds State ---
        this.srsThresholds = { // Store defaults initially
            learningReps: 2,
            masteredEase: 2.8, // Note: Not used in chapter-stats definition, but keep for now
            masteredReps: 5,   // Note: Not used in chapter-stats definition, but keep for now
            criticalEase: 1.8
        };
        this.isAIViewActive = false;
        this.isEditViewActive = false;

        // --- NEW State ---
        this.allChaptersInMaterial = []; // Store { chapter: string, mastery: number }
        this.currentMaterialSettings = null; // Cache settings { defaultBatchSize: number, ... }
        this.isStudyOptionsPopupVisible = false;
        this.chapterScrollInterval = null;
        this.chapterScrollSpeed = 0;
        this.currentChapterScroll = 0;
        this.activeTooltipChapter = null;

        // --- Debounced Functions ---
        this.debouncedPreviewUpdate = debounce(this._updatePreviewContent, 300);
        this.saveBatchSizeDebounced = debounce(this._saveBatchSizeSetting, 1000); // Debounce for batch size save

        // --- Bind Methods ---
        this._handleFilterClick = this._handleFilterClick.bind(this);
        this._handleCardGridClick = this._handleCardGridClick.bind(this);
        this._toggleCardSelectionMode = this._toggleCardSelectionMode.bind(this);
        this._handleBulkStar = this._handleBulkStar.bind(this);
        this._handleBulkBury = this._handleBulkBury.bind(this);
        this._handleBulkDelete = this._handleBulkDelete.bind(this);
        this._showModal = this._showModal.bind(this);
        this._hideModal = this._hideModal.bind(this);
        this._populateModal = this._populateModal.bind(this);
        this._toggleModalDetail = this._toggleModalDetail.bind(this);
        this._handleModalStarClick = this._handleModalStarClick.bind(this);
        this._handleModalBuryClick = this._handleModalBuryClick.bind(this);
        this._handleModalEditClick = this._handleModalEditClick.bind(this);
        this._handleModalPrevClick = this._handleModalPrevClick.bind(this);
        this._handleModalNextClick = this._handleModalNextClick.bind(this);
        this._handleModalDeleteClick = this._handleModalDeleteClick.bind(this);
        this._handleModalAIClick = this._handleModalAIClick.bind(this);
        this._handleKeyDown = this._handleKeyDown.bind(this);
        this._applyFilter = this._applyFilter.bind(this);
        this._toggleEditView = this._toggleEditView.bind(this);
        this._toggleAIView = this._toggleAIView.bind(this); // Ensure bound
        this._handleEditSave = this._handleEditSave.bind(this);
        this._handleEditCancel = this._handleEditCancel.bind(this);
        this._updatePreviewContent = this._updatePreviewContent.bind(this); // Bind the preview updater
        this._handleHeaderRenameDblClick = this._handleHeaderRenameDblClick.bind(this); // Header rename
        this._handleHeaderRenameInputKeydown = this._handleHeaderRenameInputKeydown.bind(this);
        this._handleHeaderRenameInputBlur = this._handleHeaderRenameInputBlur.bind(this);
        this._confirmHeaderRename = this._confirmHeaderRename.bind(this);
        this._cancelHeaderRename = this._cancelHeaderRename.bind(this);
                // --- NEW/UPDATED Bindings ---
        this._handleStudyDueClick = this._handleStudyDueClick.bind(this); // Now pill button
        this._handleStudyAllClick = this._handleStudyAllClick.bind(this); // Now pill popup button
        this._loadAllChaptersForSwitcher = this._loadAllChaptersForSwitcher.bind(this);
        this._renderChapterSwitcher = this._renderChapterSwitcher.bind(this);
        this._updateActiveChapterTab = this._updateActiveChapterTab.bind(this);
        this._loadCurrentMaterialSettings = this._loadCurrentMaterialSettings.bind(this);
        this._handleBatchSizeChange = this._handleBatchSizeChange.bind(this);
        this._saveBatchSizeSetting = this._saveBatchSizeSetting.bind(this);
        this._toggleStudyOptionsPopup = this._toggleStudyOptionsPopup.bind(this);
        this._hideStudyOptionsPopup = this._hideStudyOptionsPopup.bind(this);
        this._handleChapterSwitch = this._handleChapterSwitch.bind(this);
        this._handleChapterScroll = this._handleChapterScroll.bind(this);
        this._updateChapterScrollState = this._updateChapterScrollState.bind(this);
        this._generateChapterIcon = this._generateChapterIcon.bind(this);
        this._debounce = this._debounce.bind(this); // Bind debounce utility
        this._handleChapterSwitcherMouseLeave = this._handleChapterSwitcherMouseLeave.bind(this);

    }

    /**
     * Initializes the view: parses URL, fetches data, sets up listeners.
     */
    async initialize() {
       // --- Check critical elements ---
       const criticalElements = [
        this.breadcrumbChapterSpan, this.mainContent, this.cardGridEl, this.modalOverlay,
        this.modalBody, this.globalModalCloseBtn, this.modalPrevBtn, this.modalNextBtn,
        this.modalAIBtn, this.modalDeleteBtn, this.aiChatPanel, this.editCardPanel,
        this.editNameInput, this.editSaveBtn, this.editCancelBtn,
        this.floatingStudyPill, this.pillChapterSwitcher, this.pillChapterSwitcherInner, // Check new pill elements
        this.pillNewCardsCount, this.pillDueCardsCount, this.pillStudyDueButton,
        this.pillOptionsTrigger, this.studyOptionsPopup, this.pillStudyAllButton,
        this.pillReviewBatchSize, this.criticalCardsEl // Check new critical card element
    ];
    if (criticalElements.some(el => !el)) {
        console.error("ChapterDetailsView: Missing critical elements (check new pill, switcher inner, critical stats).");
        this._showError("Failed to initialize chapter details interface.");
        return;
    }

        if (typeof Chart === 'undefined' && this.timelineGraphContainer) {
             console.warn("Chart.js not found. Timeline graph will not be rendered.");
             this.timelineGraphContainer.innerHTML = '<p>Graph library not loaded.</p>';
        }

        if (typeof window.renderMathInElement !== 'function') {
            console.warn("KaTeX renderMathInElement not found...");
        }


        try {
            this._parseUrlParams(); // Sets this.currentMaterial, this.currentChapter, this.currentChapterNameDecoded
            this._setupEventListeners();

            // --- Sequential and Parallel Loading ---

            // 1. Load things needed early and don't depend on each other
            this._updateLoadingState('allChapters', true);
            this._updateLoadingState('materialSettings', true);
            this._updateLoadingState('srsThresholds', true); // Set loading state early

            await Promise.all([
                this._loadAllChaptersForSwitcher(), // Fetch chapter list for switcher
                this._loadCurrentMaterialSettings(), // Fetch material settings (needed for thresholds & batch size)
            ]);

            // 2. Now that material settings are loaded, extract thresholds
            // This is now synchronous as it uses cached data
            this._loadSrsThresholds(); // This also turns off 'srsThresholds' loading state

            // 3. Load cards, analytics, and timeline (can run in parallel now)
            this._updateLoadingState('cards', true);
            this._updateLoadingState('analytics', true);
            this._updateLoadingState('timeline', true);

            await Promise.all([
                this._loadInitialCards(), // Needs SRS thresholds loaded
                this._loadAnalytics(),
                this._loadTimeline()
            ]);
            // Loading states for these are turned off within their respective functions

        } catch (error) {
            console.error("Error during initialization:", error);
            // Don't stop if parsing failed, show error instead
            if (!this.currentMaterial || !this.currentChapter) {
                 this._showError(`Failed to initialize: Missing URL parameters.`);
            } else {
                 this._showError(`Failed to initialize chapter view: ${error.message}`);
            }
        } finally {
            // Turn off all initial loading states
            Object.keys(this.isLoading).forEach(key => {
                if (this.isLoading[key]) this._updateLoadingState(key, false);
            });
        }
        this._checkDependencies(); 
        console.log(`Chapter Details View Initialized for: ${this.currentMaterial} / ${this.currentChapterNameDecoded}`);
    }

        // --- Debounce Utility ---
        _debounce(func, delay) {
            let timeoutId;
            return (...args) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                }, delay);
            };
        }

    /**
     * Parses URL params and updates the new breadcrumb structure.
     * @private
     */
_parseUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentMaterial = urlParams.get('material');
    this.currentChapter = urlParams.get('chapter'); // Keep encoded chapter name for internal use/API calls if needed
    if (!this.currentMaterial || !this.currentChapter) {
        console.error("Missing material or chapter in URL parameters!");
        // Optionally redirect or show an error message
        this.mainContent.innerHTML = "<p class='error-text'>Error: Missing material or chapter information.</p>";
        throw new Error("Missing material or chapter in URL parameters.");
    }

    const decodedChapter = decodeURIComponent(this.currentChapter);
    this.currentChapterNameDecoded = decodedChapter; // Store decoded name for display

    // Update Header Content using new structure
    if (this.breadcrumbMaterialLink) {
        this.breadcrumbMaterialLink.textContent = this.currentMaterial;
        // *** MODIFICATION START ***
        // Set the href to navigate back to the dashboard for this specific material
        this.breadcrumbMaterialLink.href = `index.html?material=${encodeURIComponent(this.currentMaterial)}`;
        // *** MODIFICATION END ***
    }
    if (this.breadcrumbChapterSpan) {
        this.breadcrumbChapterSpan.textContent = this.currentChapterNameDecoded; // Display decoded name
        // Add dataset for potential rename functionality
        this.breadcrumbChapterSpan.dataset.originalName = this.currentChapterNameDecoded;
    }
    // H1 title is removed from HTML
    console.log(`DEBUG: Parsed URL - Material: ${this.currentMaterial}, Chapter (Decoded): ${this.currentChapterNameDecoded}`);
}

    // Add this helper at the top of your class, before the constructor
_checkDependencies() {
    console.log("DEBUG: Checking critical dependencies");
    
    // Check apiClient
    if (typeof apiClient === 'undefined') {
        console.error("DEBUG: apiClient is not defined! Import may be missing or failed");
    } else {
        console.log("DEBUG: apiClient is available");
    }
    
    // Check processAndRenderLatex
    if (typeof processAndRenderLatex !== 'function') {
        console.error("DEBUG: processAndRenderLatex is not a function! Import may be missing or failed");
    } else {
        console.log("DEBUG: processAndRenderLatex is available");
    }
    
    // Check debounce
    if (typeof debounce !== 'function') {
        console.error("DEBUG: debounce is not a function! Import may be missing or failed");
    } else {
        console.log("DEBUG: debounce is available");
    }
}

    /**
     * Attaches event listeners, including new buttons.
     * @private
     */
    _setupEventListeners() {
        console.log("--- Entering _setupEventListeners (V6 Modal) ---");
        // Page elements
        // Page elements
        this.filterButtonContainer?.addEventListener('click', this._handleFilterClick);
        this.cardGridEl?.addEventListener('click', this._handleCardGridClick); // Now handles selection too
        // ** New/Updated Buttons **
        this.selectCardsToggleBtn?.addEventListener('click', this._toggleCardSelectionMode);
        this.bulkStarBtn?.addEventListener('click', this._handleBulkStar);
        this.bulkBuryBtn?.addEventListener('click', this._handleBulkBury);
        this.bulkDeleteBtn?.addEventListener('click', this._handleBulkDelete);

        // --- NEW: Header Rename Listener ---
        this.breadcrumbChapterSpan?.addEventListener('dblclick', this._handleHeaderRenameDblClick);

        // --- NEW Pill Listeners ---
        this.pillChapterSwitcher?.addEventListener('click', this._handleChapterSwitch);
        this.pillChapterSwitcher?.addEventListener('wheel', this._handleChapterScroll, { passive: false });
        this.pillStudyDueButton?.addEventListener('click', this._handleStudyDueClick);
        this.pillOptionsTrigger?.addEventListener('click', this._toggleStudyOptionsPopup);
        this.pillStudyAllButton?.addEventListener('click', this._handleStudyAllClick); // Listener for the new button
        this.pillReviewBatchSize?.addEventListener('input', this._handleBatchSizeChange);
        this.pillChapterSwitcher?.addEventListener('mouseover', this._handleChapterTabMouseover.bind(this));
        this.pillChapterSwitcher?.addEventListener('mouseout', this._handleChapterTabMouseout.bind(this));
        // Listen for scroll on the INNER container to detect which tabs are visible
        this.pillChapterSwitcherInner?.addEventListener('scroll', this._handleChapterSwitcherScroll.bind(this), { passive: true }); // Use passive if not preventing default
        // Add this line in _setupEventListeners
this.pillChapterSwitcher?.addEventListener('mouseleave', this._handleChapterSwitcherMouseLeave.bind(this));

        // --- Modal & Related Listeners ---
        this.globalModalCloseBtn?.addEventListener('click', this._hideModal);
        this.modalOverlay?.addEventListener('click', (event) => { if (event.target === this.modalOverlay && !this.isAIViewActive /* Only close if AI view inactive */) this._hideModal(); });
        this.modalToggleBtn?.addEventListener('click', this._toggleModalDetail);
        // Action Buttons (Footer)
        this.modalStarBtn?.addEventListener('click', this._handleModalStarClick);
        this.modalBuryBtn?.addEventListener('click', this._handleModalBuryClick);
        this.modalEditBtn?.addEventListener('click', this._handleModalEditClick);
        this.modalDeleteBtn?.addEventListener('click', this._handleModalDeleteClick); // New
        this.modalAIBtn?.addEventListener('click', this._handleModalAIClick);         // New
        // Side Nav Buttons
        this.modalPrevBtn?.addEventListener('click', this._handleModalPrevClick);
        this.modalNextBtn?.addEventListener('click', this._handleModalNextClick);

        // --- NEW: Edit Panel Listeners ---
        this.editSaveBtn?.addEventListener('click', this._handleEditSave);
        this.editCancelBtn?.addEventListener('click', this._handleEditCancel);
        // Live Preview Listeners (using debounced function for explanations)
        this.editNameInput?.addEventListener('input', () => this._updatePreviewContent('name'));
        this.editChapterInput?.addEventListener('input', () => this._updatePreviewContent('chapter')); // Add if needed for preview
        this.editBriefTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('brief'));
        this.editDetailedTextarea?.addEventListener('input', () => this.debouncedPreviewUpdate('detailed'));
        console.log("DEBUG: Attached modal V6 listeners.");

       // --- Global Listeners for Closing Popup ---
       document.addEventListener('click', (event) => {
        // Hide Study Options Popup
        if (this.isStudyOptionsPopupVisible &&
            !this.studyOptionsPopup.contains(event.target) &&
            !this.pillStudyButtonWrapper?.contains(event.target) /* Check wrapper too */ ) {
             this._hideStudyOptionsPopup();
        }
         // Hide Rename Input
         if (this.activeHeaderRenameInput && !this.activeHeaderRenameInput.contains(event.target)) {
            // Use timeout to allow Enter/Escape to process first
            setTimeout(() => {
                 if (this.isHeaderRenaming && this.activeHeaderRenameInput) {
                     this._cancelHeaderRename();
                 }
            }, 100);
        }
    }, true); // Use capture phase

    window.addEventListener('scroll', this._hideStudyOptionsPopup, true);
    window.addEventListener('resize', this._hideStudyOptionsPopup);
    document.addEventListener('keydown', (event) => {
         if (event.key === 'Escape') {
             if (this.isHeaderRenaming) { this._cancelHeaderRename(); return; }
             if (this.isStudyOptionsPopupVisible) { this._hideStudyOptionsPopup(); return; }
             // Existing modal escape logic
             if (!this.isModalVisible) return;
             if (this.isEditViewActive) { this._handleEditCancel(); }
             else if (this.isAIViewActive) { this._toggleAIView(false); }
             else { this._hideModal(); }
         }
    });

    // Keyboard listeners (Keep existing modal shortcuts)
    document.addEventListener('keydown', this._handleKeyDown); // Ensure this doesn't conflict with popup escape
    console.log("--- Exiting _setupEventListeners (Pill Version) ---");
}

    /**
     * Handles keydown events for modal interactions.
     * @private
     */
    _handleKeyDown(event) {
        if (this.isHeaderRenaming) { // Prioritize header rename escape
            if (event.key === 'Escape') {
                this._cancelHeaderRename();
                
            }
            return; // Don't process modal keys if header rename is active
       }
       
        if (!this.isModalVisible) return;

        if (event.key === 'Escape') {
            if (this.isEditViewActive) { this._handleEditCancel(); } // Cancel edits on Escape
            else if (this.isAIViewActive) { this._toggleAIView(false); } // Close AI panel
            else { this._hideModal(); } // Close modal
            if (this.isCardSelectionMode) {this._toggleCardSelectionMode();}
            return;
         }

        // Prevent modal nav/detail toggle if a panel is active
        if (this.isAIViewActive || this.isEditViewActive) return;

        // Existing shortcuts for non-AI view
        switch (event.key) {
            case 'ArrowLeft': if (!this.modalPrevBtn.disabled) this.modalPrevBtn.click(); break;
            case 'ArrowRight': if (!this.modalNextBtn.disabled) this.modalNextBtn.click(); break;
            case 'd': case 'D': event.preventDefault(); this.modalToggleBtn.click(); break;
        }
    }

    /**
     * Shows the chapter tooltip when hovering over a tab.
     * @param {MouseEvent} event
     * @private
     */
    _handleChapterTabMouseover(event) {
    const tab = event.target.closest('.chapter-tab');
    if (tab && this.pillChapterTooltip) {
        const chapterName = tab.dataset.chapterName;
        if (chapterName) {
            this._showChapterTooltip(chapterName);
        }
    }
    }

    /**
     * Hides the chapter tooltip when the mouse leaves the switcher area.
     * @private
     */
    _handleChapterTabMouseout(event) {
    // Check if the mouse is still within the switcher container or tooltip itself
    if (!this.pillChapterSwitcher?.contains(event.relatedTarget) &&
        !this.pillChapterTooltip?.contains(event.relatedTarget)) {
        this._hideChapterTooltip();
    }
    }

            /**
         * Updates the tooltip based on the currently centered tab during scroll.
         * (This is a simpler approach than precise intersection calculation)
         * @private
         */
        _handleChapterSwitcherScroll() {
            if (!this.pillChapterSwitcher || !this.pillChapterSwitcherInner || !this.pillChapterTooltip) return;

            // --- Find the visually centered tab ---
            const switcherRect = this.pillChapterSwitcher.getBoundingClientRect();
            const switcherCenter = switcherRect.left + switcherRect.width / 2;

            let centeredTab = null;
            let minDistance = Infinity;

            const tabs = this.pillChapterSwitcherInner.querySelectorAll('.chapter-tab');
            tabs.forEach(tab => {
                const tabRect = tab.getBoundingClientRect();
                // Check if tab is at least partially visible horizontally
                if (tabRect.right > switcherRect.left && tabRect.left < switcherRect.right) {
                    const tabCenter = tabRect.left + tabRect.width / 2;
                    const distance = Math.abs(tabCenter - switcherCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        centeredTab = tab;
                    }
                }
            });

            if (centeredTab) {
                const chapterName = centeredTab.dataset.chapterName;
                if (chapterName && chapterName !== this.activeTooltipChapter) {
                    this._showChapterTooltip(chapterName);
                }
            } else if (this.activeTooltipChapter) {
                // If no tab is centered (e.g., during fast scroll), hide tooltip
                // Or keep the last known one? Let's hide for now.
                // this._hideChapterTooltip(); // Decide if hiding is preferred
            }
        }

        // Add this method to your ChapterDetailsView class
_handleChapterSwitcherMouseLeave() {
    // Only reset if there was scroll
    if (this.currentChapterScroll !== 0) {
        // Reset scroll position with animation
        this.pillChapterSwitcherInner.style.transition = 'transform 0.3s ease-out';
        this.currentChapterScroll = 0;
        this.pillChapterSwitcherInner.style.transform = 'translateX(0px)';
        this._updateChapterScrollState();
        
        // Clear transition after animation completes
        setTimeout(() => {
            if (this.pillChapterSwitcherInner) {
                this.pillChapterSwitcherInner.style.transition = '';
            }
        }, 300);
    }
}


        /**
         * Helper to display the tooltip with the given text.
         * @param {string} chapterName
         * @private
         */
        _showChapterTooltip(chapterName) {
            if (!this.pillChapterTooltip || !chapterName) return;
            this.pillChapterTooltip.textContent = chapterName;
            this.pillChapterTooltip.classList.add('visible');
            this.activeTooltipChapter = chapterName; // Track active tooltip
        }

        /**
         * Helper to hide the tooltip.
         * @private
         */
        _hideChapterTooltip() {
            if (!this.pillChapterTooltip) return;
            this.pillChapterTooltip.classList.remove('visible');
            this.activeTooltipChapter = null; // Clear tracker
        }

    /**
     * Extracts SRS thresholds from the cached material settings.
     * Relies on _loadCurrentMaterialSettings having run successfully first.
     * @private
     */
    _loadSrsThresholds() {
        console.log("Attempting to load SRS thresholds from cached material settings...");
        // No API call here - use cached settings
        try {
           if (this.currentMaterialSettings && this.currentMaterialSettings.srsThresholds) {
                // Merge fetched thresholds with defaults (in case some are missing in API response)
                const apiThresholds = this.currentMaterialSettings.srsThresholds;
                this.srsThresholds = {
                    learningReps: apiThresholds.learningReps ?? this.srsThresholds.learningReps,
                    masteredEase: apiThresholds.masteredEase ?? this.srsThresholds.masteredEase,
                    masteredReps: apiThresholds.masteredReps ?? this.srsThresholds.masteredReps,
                    criticalEase: apiThresholds.criticalEase ?? this.srsThresholds.criticalEase,
                };
                console.log("SRS Thresholds loaded from material settings:", this.srsThresholds);
           } else {
               // Keep defaults if settings or thresholds within settings are missing
                console.warn("Material settings or SRS thresholds not found in cache. Using default thresholds:", this.srsThresholds);
                // Optionally show a non-blocking warning to the user
                // this._showError("Could not load SRS settings, using defaults.", true);
           }
        } catch (error) {
            console.error("Error processing cached SRS thresholds:", error);
            // Keep defaults on error
            console.warn("Using default SRS thresholds due to processing error.");
        } finally {
             // Ensure loading state is turned off regardless
             this._updateLoadingState('srsThresholds', false);
        }
   }
    /**
     * Fetches the initial list of cards (full details) for the current chapter.
     * @private
     */
    async _loadInitialCards() {
        console.log(`Fetching cards for ${this.currentMaterial} / ${this.currentChapter}`);
        this._updateLoadingState('cards', true);
        this.cardGridEl.innerHTML = '<p>Loading cards...</p>';

        try {
            const cards = await apiClient.getCards({
                 material: this.currentMaterial,
                 chapter: this.currentChapter,
                 buried: "false" // Still exclude buried by default
            });

            this.allCards = cards || [];
            this._applyFilter('all'); // Apply default filter which also renders

        } catch (error) {
            console.error("Failed to load cards:", error);
            this.cardGridEl.innerHTML = `<p style="color: red;">Error loading cards: ${error.message}</p>`;
            this._showError("Could not fetch card list.");
            this.allCards = [];
            this.filteredCardIds = [];
        } finally {
            this._updateLoadingState('cards', false);
        }
    }

    /**
     * Fetches analytics data for the *current chapter*.
     * UPDATED: Populates pill stats and new 'Critical' box.
     * @private
     */
    async _loadAnalytics() {
        this._updateLoadingState('analytics', true);
        let stats = null;
        try {
            // API uses encoded chapter name
            stats = await apiClient.getChapterStats(this.currentMaterial, this.currentChapter);
        } catch (error) {
             console.error("Failed to load chapter analytics:", error);
             this._showError(`Could not load chapter stats: ${error.message}`);
        } finally {
             this._renderAnalytics(stats); // Render even if stats is null (handles default/error state)
             this._updateLoadingState('analytics', false);
        }
    }

    /**
     * Fetches timeline data for the current chapter.
     * @private
     */
    async _loadTimeline() {
        if (!this.timelineGraphContainer || typeof Chart === 'undefined') return;
        this._updateLoadingState('timeline', true);
        // Clear previous graph / set loading state
        this.timelineGraphContainer.innerHTML = '<p>Loading timeline graph...</p>';
         if (this.timelineChartInstance) {
             this.timelineChartInstance.destroy();
             this.timelineChartInstance = null;
         }

        try {
            const timelineData = await apiClient.getDueTimeline(this.currentMaterial, this.currentChapter);
            this._renderTimelineGraph(timelineData); // Renders or shows empty message
        } catch (error) {
             console.error("Failed to load due timeline:", error);
             this.timelineGraphContainer.innerHTML = `<p style="color: red; text-align: center;">Error loading timeline: ${error.message}</p>`;
        } finally {
            this._updateLoadingState('timeline', false);
        }
    }

        // --- NEW: Chapter Switcher Data Loading ---
/**
 * Fetches the list of all chapters for the current material to populate the switcher.
 * UPDATED: Handles the new API response format where chapters have name & nested stats.
 * @private
 */
async _loadAllChaptersForSwitcher() {
    console.log("DEBUG: _loadAllChaptersForSwitcher - START");
    if (!this.currentMaterial) {
        console.warn("DEBUG: No current material set, cannot load chapters");
        return;
    }
    
    this._updateLoadingState('allChapters', true);
    console.log(`DEBUG: Fetching chapters for material: ${this.currentMaterial}`);
    
    try {
        console.log("DEBUG: About to call apiClient.getChapterMastery...");
        const chaptersData = await apiClient.getChapterMastery(this.currentMaterial);
        console.log("DEBUG: API response for chapters:", chaptersData);
        
        // Enhanced debugging - inspect new chapter structure
        console.log("DEBUG: First chapter example:", chaptersData[0]);
        
        // Map to expected structure - convert from new format to what our code expects
        const mappedChapters = (chaptersData || []).map(ch => {
            if (!ch || typeof ch !== 'object') {
                console.error("DEBUG: Invalid chapter object:", ch);
                return null;
            }
            
            // Extract from new format - use 'name' instead of 'chapter'
            return {
                chapter: ch.name, // Store in 'chapter' property for compatibility
                mastery: ch.stats?.mastery || 0,
                totalCards: ch.stats?.cardCount || 0,
                buriedCards: ch.stats?.buriedCards || 0,
                criticalCards: ch.stats?.criticalCards || 0,
                dueCards: ch.stats?.totalDueCards || 0,
                remainingNewCards: ch.stats?.remainingNewCards || 0,
                // Add any other properties needed for the chapter switcher
                id: ch.id,
                isPinned: ch.isPinned || false
            };
        }).filter(Boolean); // Remove any null entries
        
        console.log(`DEBUG: Mapped ${mappedChapters.length} valid chapters`);
        this.allChaptersInMaterial = mappedChapters;
        
        // Sort if we have valid chapters
        if (this.allChaptersInMaterial.length > 0) {
            this.allChaptersInMaterial.sort((a, b) => {
                // First sort by pinned status (pinned chapters first)
                if (a.isPinned && !b.isPinned) return -1;
                if (!a.isPinned && b.isPinned) return 1;
                
                // Then sort alphabetically
                return a.chapter.localeCompare(b.chapter);
            });
        }
        
        console.log("DEBUG: About to render chapter switcher");
        this._renderChapterSwitcher(); // Render the switcher UI
    } catch (error) {
        console.error("DEBUG: Chapter loading failed with error:", error);
        console.error("DEBUG: Error stack:", error.stack);
        this.allChaptersInMaterial = [];
        this._renderChapterSwitcher(); // Render empty/error state
        this._showError(`Could not load chapter list for switcher: ${error.message}`);
    } finally {
        this._updateLoadingState('allChapters', false);
        console.log("DEBUG: _loadAllChaptersForSwitcher - END");
    }
}

     // --- NEW: Material Settings Loading ---
    /**
      * Fetches and caches settings for the current material.
      * Updates the batch size input in the pill.
      * @private
      */
    async _loadCurrentMaterialSettings() {
        if (!this.currentMaterial) {
            console.warn("_loadCurrentMaterialSettings: No current material set.");
            if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = 20; // Fallback
            this._updateLoadingState('materialSettings', false); // Ensure state is off
            return;
        }
        this._updateLoadingState('materialSettings', true);
        try {
            console.log(`Fetching settings for material: ${this.currentMaterial}`);
            const settings = await apiClient.getMaterialSettings(this.currentMaterial);
            this.currentMaterialSettings = settings; // Cache the full settings object

            // Assuming 'defaultBatchSize' is directly on settings
            const defaultBatchSize = settings?.defaultBatchSize ?? 20;

            if (this.pillReviewBatchSize) {
                this.pillReviewBatchSize.value = defaultBatchSize;
                console.log(`Material settings loaded, batch size set to: ${defaultBatchSize}`);
            } else {
                console.warn("Pill Batch size input element not found.");
            }

        } catch (error) {
            console.error(`Failed to load material settings for ${this.currentMaterial}:`, error);
            this.currentMaterialSettings = null; // Indicate failure
            if (this.pillReviewBatchSize) {
                this.pillReviewBatchSize.value = 20; // Fallback on error
            }
            this._showError(`Could not load material settings. Using default batch size.`, true);
        } finally {
            this._updateLoadingState('materialSettings', false);
        }
    }

        // --- Header Rename Implementation ---

        _handleHeaderRenameDblClick(event) {
            if (!this.breadcrumbChapterSpan || this.isHeaderRenaming || this.isLoading.headerRename) return;
    
            this.isHeaderRenaming = true;
            const currentChapterName = this.breadcrumbChapterSpan.textContent;
    
            let input = this.breadcrumbsEl.querySelector('.rename-input-header');
            if (!input) {
                input = document.createElement('input');
                input.type = 'text';
                input.classList.add('rename-input-header');
                input.dataset.originalName = currentChapterName;
                this.breadcrumbsEl.appendChild(input); // Append to breadcrumbs container
                input.addEventListener('keydown', this._handleHeaderRenameInputKeydown);
                input.addEventListener('blur', this._handleHeaderRenameInputBlur);
            }
    
            input.value = currentChapterName;
            this.breadcrumbsEl.classList.add('is-renaming');
            input.style.display = 'inline-block';
            input.focus();
            input.select();
            this.activeHeaderRenameInput = input;
        }
    
        _handleHeaderRenameInputKeydown(event) {
            if (!this.isHeaderRenaming) return;
            if (event.key === 'Enter') {
                event.preventDefault();
                this._confirmHeaderRename();
            } else if (event.key === 'Escape') {
                this._cancelHeaderRename();
            }
        }
    
        _handleHeaderRenameInputBlur() {
             // Use setTimeout to allow potential Enter keydown to process first
             setTimeout(() => {
                 if (this.isHeaderRenaming && this.activeHeaderRenameInput) {
                     // If blur happens and wasn't triggered by Enter/Escape, treat as cancel
                     console.log("Header rename input blurred, cancelling.");
                     this._cancelHeaderRename();
                 }
             }, 100);
        }
    
        async _confirmHeaderRename() {
            if (!this.isHeaderRenaming || !this.activeHeaderRenameInput || this.isLoading.headerRename) return;
    
            const input = this.activeHeaderRenameInput;
            const originalName = input.dataset.originalName;
            const newName = input.value.trim();
    
            if (!newName) {
                this._showError("Chapter name cannot be empty.");
                this._cancelHeaderRename(); // Revert UI
                return;
            }
            if (newName === originalName) {
                this._cancelHeaderRename(); // No change, just revert UI
                return;
            }
    
            this._updateLoadingState('headerRename', true);
            input.disabled = true;
    
            try {
                await apiClient.renameChapter(this.currentMaterial, originalName, newName);
    
                // Update state and UI
                const encodedNewName = encodeURIComponent(newName);
                this.currentChapter = encodedNewName; // Update encoded state var
                this.breadcrumbChapterSpan.textContent = newName; // Update displayed name
    
                // Update URL without reloading page (optional but nice)
                const url = new URL(window.location);
                url.searchParams.set('chapter', encodedNewName);
                history.pushState({}, '', url);
    
                console.log(`Chapter successfully renamed to: ${newName}`);
                this._showError(`Chapter renamed to "${newName}"`, true); // Temp success message
    
                 // Do we need to reload analytics/timeline? If API uses chapter *name*, yes.
                 // Assuming chapter *name* might be used by getDueTimeline
                 this._loadTimeline();
                 // Assuming getChapterStats uses name too (less likely, might use ID internally)
                 // this._loadAnalytics(); // Decide if needed
                 // Reload cards ONLY if chapter name affects card data/filtering significantly
                 // this._loadInitialCards(); // Probably overkill unless chapter name is stored *on* cards and used for filtering
    
                this._cancelHeaderRename(); // Clean up UI
    
            } catch (error) {
                console.error("Header rename failed:", error);
                this._showError(`Error renaming chapter: ${error.message}`);
                input.value = originalName; // Revert input value on error
                this._cancelHeaderRename(); // Clean up UI
            } finally {
                this._updateLoadingState('headerRename', false);
                if(input) input.disabled = false; // Ensure re-enabled
            }
        }
    
        _cancelHeaderRename() {
            if (!this.isHeaderRenaming) return;
            this.breadcrumbsEl.classList.remove('is-renaming');
            if (this.activeHeaderRenameInput) {
                this.activeHeaderRenameInput.style.display = 'none';
                this.activeHeaderRenameInput = null;
            }
            this.isHeaderRenaming = false;
        }

    // --- Replace the entire _renderCardGrid function ---
    /**
     * Renders the card grid.
     * CORRECTED: Processes and renders LaTeX for each card's brief explanation individually.
     * @param {Array|null} [cardsToRenderDirectly=null] - Optional: For rendering buried cards directly.
     * @private
     */
    _renderCardGrid(cardsToRenderDirectly = null) {
        if (!this.cardGridEl) return;
        this.cardGridEl.innerHTML = ''; // Clear grid

        let cardList; // The list of card OBJECTS to render

        if (cardsToRenderDirectly) {
            // Use the list passed directly (for buried view)
            cardList = cardsToRenderDirectly;
            cardList.sort((a, b) => (a.name || '').localeCompare(b.name || '')); // Sort buried alphabetically
        } else {
            // Get cards from the main non-buried list using filtered IDs
            const cardMap = new Map(this.allCards.map(card => [card.id, card]));
            cardList = this.filteredCardIds.map(id => cardMap.get(id)).filter(Boolean);
            // Sort non-buried: starred first, then alphabetically
            cardList.sort((a, b) => {
                const starDiff = (b.is_starred ? 1 : 0) - (a.is_starred ? 1 : 0);
                if (starDiff !== 0) return starDiff;
                return (a.name || '').localeCompare(b.name || '');
            });
        }

        // --- Render Logic ---
        if (cardList.length === 0) {
            // ... (empty message logic remains the same) ...
             const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
             if (activeFilter === 'buried') { this.cardGridEl.innerHTML = '<p>No buried cards found.</p>'; }
             else if (this.allCards.length === 0 && !this.isLoading.cards) { this.cardGridEl.innerHTML = '<p>No cards found in this chapter.</p>'; }
             else { this.cardGridEl.innerHTML = '<p>No cards match the filter.</p>'; }
            return;
        }

        const fragment = document.createDocumentFragment();

        // --- Loop through cards and render individually ---
        cardList.forEach(cardData => {
            // 1. Create elements
            const cardElement = document.createElement('div');
            cardElement.classList.add('theorem-card-minimal');
            cardElement.dataset.cardId = cardData.id;
            if (cardData.is_starred) cardElement.classList.add('starred');
            if (cardData.is_buried) cardElement.classList.add('buried-card-style');

            const nameEl = document.createElement('div');
            nameEl.classList.add('theorem-name-minimal');
            nameEl.textContent = (cardData.name || 'Unnamed Card').replace(/^\*\*|\*\*$/g, '').trim();

            const briefEl = document.createElement('div');
            briefEl.classList.add('explanation-preview');
            // Add a placeholder while rendering, or leave empty
            briefEl.innerHTML = '...'; // Or empty: briefEl.innerHTML = '';

            // 2. Append STRUCTURE to cardElement first
            cardElement.appendChild(nameEl);
            cardElement.appendChild(briefEl);

            // 3. Append cardElement to fragment (so briefEl is in the DOM tree, though not visible yet)
            fragment.appendChild(cardElement);

            // 4. *** NOW call processAndRenderLatex on the specific briefEl ***
            const briefText = cardData.briefExplanation || '';
            processAndRenderLatex(briefText, briefEl, { // Pass the element itself
                 delimiters: [ // Options to only allow INLINE math for previews
                     // Disable display math for previews:
                     // {left: '$$', right: '$$', display: true},
                     // {left: '\\[', right: '\\]', display: true},
                     {left: '$', right: '$', display: false},
                     {left: '\\(', right: '\\)', display: false}
                 ]
            });
            // processAndRenderLatex will modify briefEl's innerHTML directly
        });

        // 5. Append the fully processed fragment to the grid
        this.cardGridEl.appendChild(fragment);
        console.log("DEBUG: Finished rendering card grid.");
        // NO final renderMathInElement call needed on the whole grid anymore.
    }
    // --- End replacement of _renderCardGrid ---

    /**
     * Updates the status pills in the modal's pill section.
     * @param {string|null} status - Card status.
     * @param {string|null} relativeNext - Relative next review time.
     * @param {string|null} relativeLast - Relative last review time.
     * @param {string|null} masteryLevel - Mastery level/text.
     * @private
     */
     _updateStatusPills(status, relativeNext, relativeLast, masteryLevel) {
         // Convert masteryLevel number to text if needed
         const masteryText = masteryLevel ? `Level ${masteryLevel}` : null;

         const pills = [
             { el: this.modalCardStatusPill, value: status, type: 'card-status', statusForClass: status }, // Use actual status for class
             { el: this.modalNextReviewPill, value: relativeNext, type: 'next-review', statusForClass: status },
             { el: this.modalLastReviewPill, value: relativeLast, type: 'last-review', statusForClass: status },
             { el: this.modalMasteryLevelPill, value: masteryText, type: 'mastery-level', statusForClass: status } // Use masteryText
         ];

         pills.forEach(pill => {
             if (pill.el) {
                 if (pill.value) {
                     pill.el.textContent = pill.value;
                     pill.el.dataset.status = pill.statusForClass || 'Unknown'; // Use card status for color consistency, fallback
                     pill.el.dataset.pillType = pill.type;
                     pill.el.style.display = '';
                 } else {
                     pill.el.textContent = '';
                     pill.el.style.display = 'none';
                 }
             }
         });
    }
    // --------------------------------------


     /**
      * Helper to strip basic HTML for preview text. Replace with a more robust method if needed.
      * @param {string} htmlString
      * @returns {string}
      * @private
      */
     _extractTextFromHtml(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString || '';
        // Basic cleanup, remove latex blocks specifically if they exist
        tempDiv.querySelectorAll('.latex-block').forEach(el => el.remove());
        return tempDiv.textContent || tempDiv.innerText || '';
     }

/**
 * Renders the analytics section.
 * UPDATED: Uses 'criticalCards' field and populates pill stats.
 * @param {object | null} stats - Statistics object from API
 * @private
 */
_renderAnalytics(stats) {
    // Main Analytics Section
    const mastery = stats?.mastery ?? 0;
    const totalCards = stats?.totalCards ?? '-';
    const learningCards = stats?.learningCards ?? '-';
    const masteredCards = stats?.masteredCards ?? '-';
    const criticalCards = stats?.criticalCards ?? '-'; // Use new field

    if (this.masteryProgressEl) this.masteryProgressEl.value = mastery;
    if (this.masteryValueEl) this.masteryValueEl.textContent = `${mastery.toFixed(0)}%`;

    // Update ONLY the text content of stat boxes but preserve their styling
    if (this.totalCardsEl) {
        // Find the stat-value span within the card-stat-box
        const valueSpan = this.totalCardsEl.closest('.card-stat-box')?.querySelector('.stat-value');
        if (valueSpan) valueSpan.textContent = totalCards;
    }
    
    if (this.criticalCardsEl) {
        const valueSpan = this.criticalCardsEl.closest('.card-stat-box')?.querySelector('.stat-value');
        if (valueSpan) valueSpan.textContent = criticalCards;
    }
    
    if (this.learningCardsEl) {
        const valueSpan = this.learningCardsEl.closest('.card-stat-box')?.querySelector('.stat-value');
        if (valueSpan) valueSpan.textContent = learningCards;
    }
    
    if (this.masteredCardsEl) {
        const valueSpan = this.masteredCardsEl.closest('.card-stat-box')?.querySelector('.stat-value');
        if (valueSpan) valueSpan.textContent = masteredCards;
    }

    // Pill Stats Section
    const pillDueCount = stats?.totalDueCards ?? '?';
    const pillNewCount = stats?.remainingNewCards ?? '?';

    if (this.pillDueCardsCount) this.pillDueCardsCount.textContent = pillDueCount;
    if (this.pillNewCardsCount) this.pillNewCardsCount.textContent = pillNewCount;

    // Optional: Disable study buttons if counts are 0?
    if (this.pillStudyDueButton) this.pillStudyDueButton.disabled = !(parseInt(pillDueCount, 10) > 0);
}

    /**
     * Renders the timeline graph using Chart.js.
     * @param {object | null} timelineData - Data from API (e.g., {"YYYY-MM-DD": count}).
     * @private
     */
    _renderTimelineGraph(timelineData) {
        if (!this.timelineGraphContainer || typeof Chart === 'undefined') {
            return;
        }

         this.timelineGraphContainer.innerHTML = ''; // Clear placeholder/loading
         const canvas = document.createElement('canvas');
         this.timelineGraphContainer.appendChild(canvas);
         const ctx = canvas.getContext('2d');

        if (this.timelineChartInstance) {
            this.timelineChartInstance.destroy();
            this.timelineChartInstance = null;
        }

        if (!timelineData || Object.keys(timelineData).length === 0) {
            this.timelineGraphContainer.innerHTML = '<p style="text-align: center; color: #a0a0c0; padding: 20px;">No upcoming reviews scheduled for this chapter.</p>';
            return;
        }

        const sortedDates = Object.keys(timelineData).sort();
        const labels = sortedDates;
        const dataCounts = sortedDates.map(date => timelineData[date]);

        try {
            this.timelineChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                     labels: labels,
                     datasets: [{
                         label: 'Due Cards',
                         data: dataCounts,
                         backgroundColor: 'rgba(91, 192, 222, 0.6)', // #5bc0de with opacity
                         borderColor: 'rgba(91, 192, 222, 1)', // #5bc0de
                         borderWidth: 1,
                         borderRadius: 4,
                         borderSkipped: false,
                     }]
                 },
                 options: {
                     responsive: true, maintainAspectRatio: false,
                     plugins: {
                         legend: { display: false },
                         tooltip: {
                            backgroundColor: '#1a1a2e', titleColor: '#e0e0e0', bodyColor: '#e0e0e0',
                             displayColors: false, callbacks: { label: (item) => `Reviews: ${item.raw}` }
                         }
                     },
                     scales: {
                        x: { grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', maxRotation: 45, minRotation: 45 } },
                        y: { beginAtZero: true, grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', precision: 0 } } // Ensure integer ticks
                     }
                 }
            });
        } catch (chartError) {
            console.error("Failed to render chapter timeline chart:", chartError);
            this.timelineGraphContainer.innerHTML = '<p style="color: red; text-align: center;">Error displaying timeline graph.</p>';
        }
    }


        // --- Event Handlers ---

     /**
     * Handles filter clicks. If selection mode is active, disable it first.
     * @param {Event} event
     */
     _handleFilterClick(event) {
        const button = event.target.closest('.filter-btn');
        if (!button || button.classList.contains('active')) return;

        // Deactivate card selection mode if active when changing filters
        if (this.isCardSelectionMode) {
             this._toggleCardSelectionMode(false);
        }

        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const filterType = button.dataset.filter;
        console.log(`Filtering by: ${filterType}`);
        this._applyFilter(filterType);
    }


/**
 * Filters the card list and re-renders the grid OR fetches from API for specific filters.
 * @param {string} filterType - 'all', 'due', 'learning', 'mastered', 'starred', 'buried'.
 * @private
 */
async _applyFilter(filterType) { // Ensure it remains async

    console.log(`Applying filter: ${filterType}`); // Log filter type

    // --- Handle API-driven filters first ---
    if (filterType === 'buried') {
        this._fetchAndRenderBuriedCards(); // Fetches buried via API
        return;
    }
    if (filterType === 'due') {
        await this._fetchAndRenderDueCards(); // Fetches due *for this chapter* via API
        return; // Stop here for due filter
    }

    // --- Handle Client-Side Filters (learning, mastered, starred, all) ---
    // These filters operate on the `this.allCards` list loaded by _loadInitialCards

    // Ensure allCards is ready (contains all non-buried cards for the chapter)
    if (!Array.isArray(this.allCards)) {
         console.error("Client-side filter error: this.allCards is not an array!", this.allCards);
         this._showError("Cannot apply filter: Card data missing.");
         this.filteredCardIds = [];
         this._renderCardGrid();
         return;
    }

    // Ensure thresholds are ready for learning/mastered
    if (!this.srsThresholds) {
         console.warn("Client-side filter warning: SRS Thresholds not loaded yet.");
         // Attempt to load them synchronously? Risky. Better to show temporary error/default.
         // await this._loadSrsThresholds(); // Only if _loadSrsThresholds is robust
         this.filteredCardIds = this.allCards.map(c => c.id); // Default to 'all' non-buried
         this._showError("Cannot apply filter: Settings still loading. Showing all cards.");
         this._renderCardGrid();
         return;
    }

    const now = new Date();
    const { learningReps } = this.srsThresholds; // Use the correct threshold
    console.log(`DEBUG: Applying client-side filter "${filterType}" with learningReps=${learningReps}`);

    // Filter `this.allCards` which should contain *all* non-buried cards for this chapter
    this.filteredCardIds = this.allCards
        .filter(card => {
            // Basic check: card exists, has SRS data, and is NOT buried
            // (allCards should already exclude buried, but double-check is safe)
            if (!card || !card.srs_data || card.is_buried) return false;

            const isStarred = !!card.is_starred;
            // Need lastReviewDate and repetitions for learning/mastered checks
            const lastReviewTimestamp = card.srs_data.last_review;
            const lastReviewDate = lastReviewTimestamp ? new Date(lastReviewTimestamp.seconds * 1000 + (lastReviewTimestamp.nanoseconds || 0) / 1e6) : null;
            const repetitions = card.srs_data.repetitions ?? 0;

            // Check if the card has been seen at least once for learning/mastered states
            const hasBeenReviewed = !!lastReviewDate;

            // We don't need isDue check here because 'due' is handled by API.
            // We only filter the non-due, non-buried cards based on their state.

            switch (filterType) {
                case 'starred':
                    return isStarred; // Filter *all* non-buried cards by star status
                case 'learning':
                    // Definition: Has been reviewed, and repetitions are within the learning threshold.
                    return hasBeenReviewed && repetitions <= learningReps;
                case 'mastered':
                     // Definition: Has been reviewed, and repetitions are beyond the learning threshold.
                    return hasBeenReviewed && repetitions > learningReps;
                case 'all':
                default:
                    // Return all cards currently held in `this.allCards` (which are the non-buried ones for the chapter)
                    return true;
            }
        })
        .map(card => card.id);

    console.log(`DEBUG (Local Filter '${filterType}'): Result IDs (${this.filteredCardIds.length})`);
    this._renderCardGrid(); // Render using the locally filtered IDs
}

/**
 * Helper to fetch DUE cards *for the current chapter* from the API and render them.
 * @private
 */
async _fetchAndRenderDueCards() {
    // Ensure we have context
    if (!this.currentMaterial || !this.currentChapter) {
         console.error("Cannot fetch due cards: Missing material or chapter context.");
         this._showError("Cannot load due cards: context missing.");
         this.filteredCardIds = [];
         this._renderCardGrid(); // Render empty grid
         return;
    }

    console.log(`Fetching DUE cards for Chapter: ${this.currentChapterNameDecoded} in Material: ${this.currentMaterial}`);
    this._updateLoadingState('cards', true); // Use 'cards' loading state for the grid
    this.cardGridEl.innerHTML = '<p>Loading due cards...</p>'; // Show loading in grid

    try {
        // *** FIX: Add the chapter parameter to the API call ***
        const dueCards = await apiClient.getCards({
             material: this.currentMaterial,
             chapter: this.currentChapter, // Pass the *encoded* chapter name
             due: true,
             buried: false // Explicitly exclude buried cards from the due list
             // batchSize: undefined // Don't apply batch limit for viewing list
         });

        // --- IMPORTANT ---
        // DO NOT overwrite this.allCards here.
        // `allCards` should always hold the full set loaded initially by _loadInitialCards
        // so that switching back to 'all', 'learning', etc. works correctly.
        // Only update the filtered IDs for rendering.
        this.filteredCardIds = (dueCards || []).map(card => card.id);

        console.log(`Fetched ${this.filteredCardIds.length} DUE card IDs from API for chapter.`);
        this._renderCardGrid(); // Render the grid with only the due card IDs

    } catch (error) {
         console.error("Failed to fetch due cards:", error);
         this._showError(`Error fetching due cards: ${error.message}`);
         this.filteredCardIds = []; // Clear grid on error
         this._renderCardGrid();
    } finally {
         this._updateLoadingState('cards', false); // Turn off 'cards' loading state
    }
}

        /**
     * Fetches buried cards via API and renders them directly.
     * @private
     */
        async _fetchAndRenderBuriedCards() {
            console.log("Fetching BURIED cards...");
            this._updateLoadingState('cards', true); // Use 'cards' loading state
            this.cardGridEl.innerHTML = '<p>Loading buried cards...</p>';
            this.filteredCardIds = []; // Clear filtered IDs from non-buried list
   
            try {
                const buriedCards = await apiClient.getCards({
                    material: this.currentMaterial,
                    chapter: this.currentChapter,
                    buried: "true" // Specifically request buried
                });
                console.log(`Fetched ${buriedCards?.length || 0} buried cards.`);
                // Render the fetched buried cards directly
                this._renderCardGrid(buriedCards || []); // Pass the actual card objects
            } catch (error) {
                console.error("Failed to load buried cards:", error);
                this.cardGridEl.innerHTML = `<p style="color: red;">Error loading buried cards: ${error.message}</p>`;
                this._showError("Could not fetch buried cards.");
                this._renderCardGrid([]); // Render empty state
            } finally {
                 this._updateLoadingState('cards', false);
            }
       }


    /**
     * Handles clicks on the card grid: Opens modal OR selects card.
     * @param {Event} event
     * @private
     */
    _handleCardGridClick(event) {
        const cardElement = event.target.closest('.theorem-card-minimal');
        if (!cardElement) return;
        const cardId = cardElement.dataset.cardId;
        if (!cardId) return;

        if (this.isCardSelectionMode) {
             // --- Card Selection Logic ---
             event.stopPropagation(); // Prevent modal potentially opening if logic changes
             cardElement.classList.toggle('selected');
             if (this.selectedCardIds.has(cardId)) {
                 this.selectedCardIds.delete(cardId);
             } else {
                 this.selectedCardIds.add(cardId);
             }
             console.log("Selected card IDs:", this.selectedCardIds);
             // Update bulk action button states if needed (e.g., enable/disable)
        } else {
             // --- Open Modal Logic (Fetch fresh data) ---
             console.log(`Card clicked: ${cardId}. Fetching details & opening preview.`);
             this._updateLoadingState('modalLoad', true);
             apiClient.getCard(cardId)
                 .then(fullCardData => {
                     if (!fullCardData) throw new Error(`Card data not found for ID: ${cardId}`);
                     this.currentModalCardId = cardId;
                     this.currentModalCardIndex = this.filteredCardIds.indexOf(cardId);
                     this._populateModal(fullCardData);
                     this._showModal();
                 })
                 .catch(error => {
                     console.error(`Failed to load details for card ${cardId}:`, error);
                     this._showError(`Could not load card details: ${error.message}`);
                 })
                 .finally(() => {
                     this._updateLoadingState('modalLoad', false);
                 });
        }
    }

    /**
     * Handles click on the pill's "Study Due Cards" button.
     * Reads batch size from pill input.
     * @private
     */
    _handleStudyDueClick() {
        console.log(`Initiating study session for DUE cards in chapter: ${this.currentChapterNameDecoded}`);
        const batchSize = parseInt(this.pillReviewBatchSize?.value, 10) || 0; // Read from pill input
        // URL uses encoded chapter name
        const url = `study-session.html?material=${encodeURIComponent(this.currentMaterial)}&chapters=${this.currentChapter}${batchSize > 0 ? '&batchSize=' + batchSize : ''}`;
        window.location.href = url;
    }

   /**
     * Handles click on the pill popup's "Study All Cards" button.
     * Reads batch size from pill input.
     * @private
     */
   _handleStudyAllClick() {
    console.log(`Initiating study session for ALL non-buried cards in chapter: ${this.currentChapterNameDecoded}`);
    const batchSize = parseInt(this.pillReviewBatchSize?.value, 10) || 0; // Read from pill input
    // URL uses encoded chapter name, add mode=all
    const url = `study-session.html?material=${encodeURIComponent(this.currentMaterial)}&chapters=${this.currentChapter}&mode=all${batchSize > 0 ? '&batchSize=' + batchSize : ''}`;
    window.location.href = url;
    // NOTE: studyView.js needs to handle mode=all correctly.
    this._hideStudyOptionsPopup(); // Close popup after clicking
}

         /**
      * Toggles card selection mode on/off.
      * @param {boolean} [forceState] - Optional: true to force on, false to force off.
      * @private
      */
         _toggleCardSelectionMode(forceState) {
            const newState = typeof forceState === 'boolean' ? forceState : !this.isCardSelectionMode;
            if (newState === this.isCardSelectionMode) return; // No change
  
            this.isCardSelectionMode = newState;
            this.selectCardsToggleBtn?.classList.toggle('active', newState);
            this.bulkActionsGroup?.classList.toggle('active', newState); // Show/hide bulk buttons
            this.cardGridEl?.classList.toggle('selection-mode', newState); // Enable selection styling on grid
  
            if (!newState) {
                 // Clear selections when exiting mode
                 this.selectedCardIds.clear();
                 this.cardGridEl?.querySelectorAll('.theorem-card-minimal.selected').forEach(card => card.classList.remove('selected'));
                 console.log("Card selection mode deactivated. Selections cleared.");
            } else {
                  console.log("Card selection mode activated.");
                  // Ensure no modal is open when entering selection mode
                  if(this.isModalVisible) this._hideModal();
            }
       }
  
       /**
        * Handles bulk star action.
        * @private
        */
       async _handleBulkStar() {
           if (this.selectedCardIds.size === 0) {
               this._showError("No cards selected.", true); return;
           }
           if (!confirm(`Star ${this.selectedCardIds.size} selected card(s)?`)) return;
           if (this.isLoading.bulkAction) return;
  
           console.log(`Bulk starring cards:`, Array.from(this.selectedCardIds));
           this._updateLoadingState('bulkAction', true);
           const idsToProcess = Array.from(this.selectedCardIds); // Copy set
  
           // Determine if most selected cards are already starred (to decide toggle direction)
           let currentlyStarredCount = 0;
           idsToProcess.forEach(id => {
              const card = this.allCards.find(c => c.id === id);
              if (card?.is_starred) currentlyStarredCount++;
           });
           const shouldStar = currentlyStarredCount <= idsToProcess.length / 2; // Star if less than half are starred
  
           const promises = idsToProcess.map(cardId => {
               const card = this.allCards.find(c => c.id === cardId);
               // Only call API if state needs changing
               if (card && card.is_starred !== shouldStar) {
                    return apiClient[shouldStar ? 'starCard' : 'unstarCard'](cardId)
                           .then(() => ({ id: cardId, success: true, newState: shouldStar }))
                           .catch(err => ({ id: cardId, success: false, error: err }));
               } else {
                   return Promise.resolve({ id: cardId, success: true, newState: card?.is_starred }); // No change needed
               }
           });
  
           const results = await Promise.allSettled(promises);
           let successCount = 0;
           let failCount = 0;
  
           results.forEach(result => {
               if (result.status === 'fulfilled' && result.value.success) {
                   successCount++;
                   // Update local state and UI for successfully toggled cards
                   const cardInList = this.allCards.find(c => c.id === result.value.id);
                   if (cardInList) cardInList.is_starred = result.value.newState;
                   const gridCardEl = this.cardGridEl.querySelector(`.theorem-card-minimal[data-card-id="${result.value.id}"]`);
                   gridCardEl?.classList.toggle('starred', result.value.newState);
               } else {
                   failCount++;
                   console.error(`Failed to ${shouldStar ? 'star' : 'unstar'} card ${result.reason?.id || result.value?.id}:`, result.reason || result.value?.error);
               }
           });
  
           this._updateLoadingState('bulkAction', false);
           this._showError(`${successCount} card(s) updated. ${failCount > 0 ? failCount + ' failed.' : ''}`, true);
  
           // Optionally re-apply filter and exit selection mode
           const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
           if (activeFilter) this._applyFilter(activeFilter);
           this._toggleCardSelectionMode(false); // Exit selection mode after action
       }
  
     /**
      * Handles bulk bury/unbury action.
      * @private
      */
     async _handleBulkBury() {
        if (this.selectedCardIds.size === 0) { this._showError("No cards selected.", true); return; }
        if (this.isLoading.bulkAction) return;

        const idsToProcess = Array.from(this.selectedCardIds);

        // Determine dominant state to decide action
        let buriedCount = 0;
        idsToProcess.forEach(id => {
            const card = this.allCards.find(c => c.id === id);
            if (card?.is_buried) buriedCount++;
        });
        const shouldBury = buriedCount <= idsToProcess.length / 2; // Bury if less than half are buried
        const action = shouldBury ? 'bury' : 'unbury';
        const actionVerb = shouldBury ? 'Bury' : 'Unbury';

        if (!confirm(`${actionVerb} ${idsToProcess.length} selected card(s)?`)) return;

        console.log(`Bulk ${action}ing cards:`, idsToProcess);
        this._updateLoadingState('bulkAction', true);

        const promises = idsToProcess.map(cardId => {
            const card = this.allCards.find(c => c.id === cardId);
            // Only call API if state needs changing
            if (card && card.is_buried !== shouldBury) {
                return apiClient[shouldBury ? 'buryCard' : 'unburyCard'](cardId)
                       .then((updatedCard) => ({ id: cardId, success: true, newState: updatedCard.is_buried })) // Use response state
                       .catch(err => ({ id: cardId, success: false, error: err }));
            } else {
                 return Promise.resolve({ id: cardId, success: true, newState: card?.is_buried }); // No change needed
            }
        });

        const results = await Promise.allSettled(promises);
        let successCount = 0;
        let failCount = 0;

        results.forEach(result => {
            if (result.status === 'fulfilled' && result.value.success) {
                successCount++;
                // Update local state ONLY for successfully processed cards
                const cardInList = this.allCards.find(c => c.id === result.value.id);
                if (cardInList) cardInList.is_buried = result.value.newState; // Update based on API response or no-change state
            } else {
                failCount++;
                console.error(`Failed to ${action} card ${result.reason?.id || result.value?.id}:`, result.reason || result.value?.error);
            }
        });

        this._updateLoadingState('bulkAction', false);
        this._showError(`${successCount} card(s) ${action} success. ${failCount > 0 ? failCount + ' failed.' : ''}`, true);

        // Re-apply filter and exit selection mode
        const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
        if (activeFilter) this._applyFilter(activeFilter); // Re-renders the grid
        this._toggleCardSelectionMode(false);
        this._loadAnalytics(); // Update counts
    }
  
      /**
       * Handles bulk delete action.
       * @private
       */
      async _handleBulkDelete() {
           if (this.selectedCardIds.size === 0) { this._showError("No cards selected.", true); return; }
           if (!confirm(`PERMANENTLY DELETE ${this.selectedCardIds.size} selected card(s)? This cannot be undone.`)) return;
           if (this.isLoading.bulkAction) return;
           if (typeof apiClient.deleteCard !== 'function') { this._showError("Delete feature not available."); return; }
  
           console.log(`Bulk deleting cards:`, Array.from(this.selectedCardIds));
           this._updateLoadingState('bulkAction', true);
           const idsToProcess = Array.from(this.selectedCardIds);
  
           const promises = idsToProcess.map(cardId => {
               return apiClient.deleteCard(cardId)
                   .then(() => ({ id: cardId, success: true }))
                   .catch(err => ({ id: cardId, success: false, error: err }));
           });
  
           const results = await Promise.allSettled(promises);
           let successCount = 0;
           let failCount = 0;
           const successfullyDeletedIds = new Set();
  
           results.forEach(result => {
               if (result.status === 'fulfilled' && result.value.success) {
                   successCount++;
                   successfullyDeletedIds.add(result.value.id);
               } else {
                   failCount++;
                   console.error(`Failed to delete card ${result.reason?.id || result.value?.id}:`, result.reason || result.value?.error);
               }
           });
  
           // Update local state
           this.allCards = this.allCards.filter(c => !successfullyDeletedIds.has(c.id));
  
           this._updateLoadingState('bulkAction', false);
           this._showError(`${successCount} card(s) deleted. ${failCount > 0 ? failCount + ' failed.' : ''}`, true);
  
           // Re-apply filter and exit selection mode
           const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
           if (activeFilter) this._applyFilter(activeFilter);
           this._toggleCardSelectionMode(false);
           this._loadAnalytics(); // Update counts
      }

    
         /**
     * Renders the chapter switcher tabs in the floating pill.
     * @private
     */
_renderChapterSwitcher() {
    if (!this.pillChapterSwitcher || !this.pillChapterSwitcherInner) {
         console.error("Chapter switcher element(s) not found.");
         return;
    }
    this.pillChapterSwitcherInner.innerHTML = ''; // Clear previous tabs

    if (!this.allChaptersInMaterial || this.allChaptersInMaterial.length === 0) {
        this.pillChapterSwitcherInner.innerHTML = '<span class="no-chapters" style="padding: 0 10px; font-size: 0.9em; color: var(--text-secondary);">No Chapters</span>';
        this.pillChapterSwitcher.classList.remove('has-multiple', 'has-3plus-chapters');
        return;
    }

    const hasMultiple = this.allChaptersInMaterial.length > 1;
    const has3Plus = this.allChaptersInMaterial.length >= 3;
    this.pillChapterSwitcher.classList.toggle('has-multiple', hasMultiple);
    this.pillChapterSwitcher.classList.toggle('has-3plus-chapters', has3Plus);

    this.allChaptersInMaterial.forEach((chapterData, index) => {
        const chapterName = chapterData.chapter; // Already decoded from API
        const tab = document.createElement('button');
        tab.classList.add('chapter-tab'); 
        tab.dataset.chapterName = chapterName; // Store decoded name
        tab.dataset.index = index;

        const iconHtml = this._generateChapterIcon(chapterName); // Generate icon
        tab.innerHTML = iconHtml;
        tab.title = chapterName;
        tab.setAttribute('aria-label', `Select chapter: ${chapterName}`);

        this.pillChapterSwitcherInner.appendChild(tab);
    });

    this._updateActiveChapterTab(); 
    this._updateChapterScrollState();
}

    /**
     * Generates a simple icon HTML based on the first 3 letters of the chapter name.
     * @param {string} chapterName - The decoded chapter name.
     * @returns {string} HTML string for the icon.
     * @private
     */
     _generateChapterIcon(chapterName) {
        const letters = chapterName.substring(0, 3).toUpperCase();
        // Simple div with letters - ensure CSS for .generated-icon exists
        return `<div class="generated-icon">${letters}</div>`;
    }

    /**
     * Updates the active state and position classes for the chapter switcher tabs.
     * @private
     */
/**
     * Updates the active state and position classes for the chapter switcher tabs,
     * AND sets the required width on the inner container for scrolling.
     * @private
     */
_updateActiveChapterTab() {
    // console.log(`DEBUG: _updateActiveChapterTab - START - currentChapterNameDecoded: ${this.currentChapterNameDecoded}`);
    if (!this.pillChapterSwitcher || !this.pillChapterSwitcherInner || !this.currentChapterNameDecoded) {
        console.warn("DEBUG: _updateActiveChapterTab - Missing elements or chapter name.");
        return;
    }

    const tabs = Array.from(this.pillChapterSwitcherInner.querySelectorAll('.chapter-tab'));
    const totalTabs = tabs.length;
    if (totalTabs === 0) {
        // Reset inner width if empty
         this.pillChapterSwitcherInner.style.width = '100%'; // Or initial width
         this._updateChapterScrollState();
        return;
    }

    // console.log(`DEBUG: _updateActiveChapterTab - Found ${totalTabs} tabs. Comparing against '${this.currentChapterNameDecoded}'.`);

    let activeIndex = -1;
    // --- Track the calculated center position (translateX offset) of the first and last tabs ---


    // --- First Pass: Find Active Index ---
    tabs.forEach((tab, index) => {
        const tabChapterName = tab.dataset.chapterName;
        if (tabChapterName === this.currentChapterNameDecoded) {
            activeIndex = index;
        }
         // Reset classes (important to do before recalculating)
         tab.classList.remove('is-active', 'is-prev-1', 'is-prev-2', 'is-prev-3', 'is-next-1', 'is-next-2', 'is-next-3');
         tab.style.removeProperty('--tx'); // Clear previous --tx
    });

    // Handle case where active chapter not found (e.g., deleted chapter in URL)
    if (activeIndex === -1) {
        console.warn(`Active chapter '${this.currentChapterNameDecoded}' not found in tabs. Defaulting active to index 0.`);
        activeIndex = 0; // Default to the first tab as active
        if(tabs.length > 0) {
            tabs[0].classList.add('is-active'); // Mark first as active visually
        } else {
             this.pillChapterSwitcherInner.style.width = '100%';
             this._updateChapterScrollState();
             return; // No tabs to process
        }
    } else {
        tabs[activeIndex].classList.add('is-active'); // Mark the correct tab as active
    }

       // --- Second Pass: Apply Classes and Calculate Positions/Width ---
       let firstTabTx = 0;
       let lastTabTx = 0;
       const tabWidth = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pill-icon-size') || '40');
       const tabGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--pill-icon-gap') || '10');

        tabs.forEach((tab, index) => {
           const distance = index - activeIndex;
           let currentTxNum = 0; // TranslateX offset relative to the container center

           // Clear classes first
           tab.classList.remove('is-active', 'is-prev-1', 'is-prev-2', 'is-prev-3', 'is-next-1', 'is-next-2', 'is-next-3');
           tab.style.removeProperty('--tx');

           if(index === activeIndex){
                tab.classList.add('is-active');
           } else {
                // Use --expand-translate vars for positioning ALL non-active tabs
                const expandVar = `--expand-translate-${Math.abs(distance)}`;
                const fallbackCalc = (Math.abs(distance) * (tabWidth + tabGap)) - (tabGap / 2);
                const translateValueStr = getComputedStyle(document.documentElement).getPropertyValue(expandVar) || `${fallbackCalc}px`;
                const translateValue = parseFloat(translateValueStr.replace('px', '')) || fallbackCalc;
                currentTxNum = distance < 0 ? -translateValue : translateValue;

                // Apply VISUAL position class ONLY for nearby tabs (e.g., up to 2)
                if (Math.abs(distance) <= 2) { // Apply classes only for visible/peeking ones
                     tab.classList.add(distance < 0 ? `is-prev-${Math.abs(distance)}` : `is-next-${distance}`);
                }

                // Set --tx variable for CSS transform for ALL non-active tabs
                const translateXCss = `calc(-50% + ${currentTxNum}px)`;
                tab.style.setProperty('--tx', translateXCss);
           }

           // --- Store Tx for first and last tabs (based on calculated position) ---
           if (index === 0) { firstTabTx = currentTxNum; }
           if (index === totalTabs - 1) { lastTabTx = currentTxNum; }

       }); // End forEach tab


       // --- Calculate and Set Inner Container Width ---
       const firstTabLeftEdge = firstTabTx - (tabWidth / 2);
       const lastTabRightEdge = lastTabTx + (tabWidth / 2);
       const totalSpan = lastTabRightEdge - firstTabLeftEdge;
       const buffer = tabGap * 2;
       const requiredWidth = totalSpan + buffer;

       // console.log(`DEBUG: FirstTabTx: ${firstTabTx.toFixed(1)}, LastTabTx: ${lastTabTx.toFixed(1)}, TotalSpan: ${totalSpan.toFixed(1)}, RequiredWidth: ${requiredWidth.toFixed(1)}`);

       // Set the calculated width on the inner container
       const minRequiredWidth = this.pillChapterSwitcher.offsetWidth + tabGap;
       this.pillChapterSwitcherInner.style.width = `${Math.max(requiredWidth, minRequiredWidth)}px`;

       this._updateChapterScrollState();
   }

    /**
     * Updates the scroll indicator state for the chapter switcher.
     * @private
     */
    _updateChapterScrollState() {
        if (!this.pillChapterSwitcher || !this.pillChapterSwitcherInner) return;
        const containerWidth = this.pillChapterSwitcher.offsetWidth;
        const innerWidth = this.pillChapterSwitcherInner.scrollWidth;
        const scrollLeft = this.currentChapterScroll || 0;
        const maxScroll = Math.max(0, innerWidth - containerWidth);

        this.pillChapterSwitcher.classList.toggle('is-scrollable-left', scrollLeft > 0);
        this.pillChapterSwitcher.classList.toggle('is-scrollable-right', scrollLeft < maxScroll);
    }

       // --- Event Handlers ---

    /**
     * Handles clicks on the chapter switcher tabs. Navigates to the selected chapter.
     * @param {Event} event
     * @private
     */
    _handleChapterSwitch(event) {
        const clickedTab = event.target.closest('.chapter-tab');
        if (!clickedTab || !this.pillChapterSwitcher?.classList.contains('has-multiple')) return;

        const chapterName = clickedTab.dataset.chapterName; // Decoded name
        const anyLoading = Object.values(this.isLoading).some(state => state);

        if (chapterName && chapterName !== this.currentChapterNameDecoded && !anyLoading) {
            console.log(`Switching to chapter: ${chapterName}`);
            // Construct the URL and navigate
            const encodedChapter = encodeURIComponent(chapterName);
            const url = `flashcards-view.html?material=${encodeURIComponent(this.currentMaterial)}&chapter=${encodedChapter}`;
            window.location.href = url; // Reload the page for the new chapter
        } else if (chapterName === this.currentChapterNameDecoded) {
            console.log("Clicked active chapter, no change.");
        }
    }

    /**
     * Handles wheel scroll events on the chapter switcher pill.
     * @param {Event} event
     * @private
     */
     _handleChapterScroll(event) {
        if (!this.pillChapterSwitcher?.classList.contains('has-multiple') || !this.pillChapterSwitcherInner) return;

        event.preventDefault(); // Prevent page scroll

        const scrollAmount = event.deltaY || event.deltaX;
        const direction = scrollAmount > 0 ? 1 : -1;
        const scrollSpeedMultiplier = 50; // Adjust sensitivity

        const containerWidth = this.pillChapterSwitcher.offsetWidth;
        const innerWidth = this.pillChapterSwitcherInner.scrollWidth;
        const maxScroll = Math.max(0, innerWidth - containerWidth);

        let newScroll = this.currentChapterScroll + (direction * scrollSpeedMultiplier); // Adjust direction if needed
        newScroll = Math.max(0, Math.min(newScroll, maxScroll));

        if (this.currentChapterScroll !== newScroll) {
            this.currentChapterScroll = newScroll;
            this.pillChapterSwitcherInner.style.transform = `translateX(-${this.currentChapterScroll}px)`;
            this._updateChapterScrollState();
        }
    }

    /**
     * Toggles the study options popup visibility.
     * @private
     */
    _toggleStudyOptionsPopup() {
        this.isStudyOptionsPopupVisible = !this.isStudyOptionsPopupVisible;
        this.studyOptionsPopup.classList.toggle('visible', this.isStudyOptionsPopupVisible);
        this.pillStudyButtonWrapper?.classList.toggle('popup-open', this.isStudyOptionsPopupVisible);
        this.pillOptionsTrigger?.setAttribute('aria-expanded', this.isStudyOptionsPopupVisible);

         // Adjust display property for visibility/animation
        if (this.isStudyOptionsPopupVisible) {
            this.studyOptionsPopup.style.display = 'flex'; // Or 'block' depending on CSS
        } else {
            // Delay hiding display to allow animation
            setTimeout(() => {
                 if (!this.isStudyOptionsPopupVisible && this.studyOptionsPopup) {
                     this.studyOptionsPopup.style.display = 'none';
                 }
            }, 250); // Match CSS transition duration
        }
        console.log("Popup toggled:", this.isStudyOptionsPopupVisible);
    }

    /**
     * Hides the study options popup.
     * @private
     */
    _hideStudyOptionsPopup() {
        if (!this.isStudyOptionsPopupVisible) return;
        this.isStudyOptionsPopupVisible = false;
        this.studyOptionsPopup?.classList.remove('visible');
        this.pillStudyButtonWrapper?.classList.remove('popup-open');
        this.pillOptionsTrigger?.setAttribute('aria-expanded', 'false');
         // Delay hiding display
         setTimeout(() => {
             if (this.studyOptionsPopup) { // Check again in case it was reopened quickly
                 this.studyOptionsPopup.style.display = 'none';
             }
         }, 250);
        console.log("Popup hidden");
    }

    /**
     * Handles change events on the batch size input.
     * @param {Event} event
     * @private
     */
    _handleBatchSizeChange(event) {
        const newSize = parseInt(event.target.value, 10);
        if (isNaN(newSize) || newSize < 1) {
             console.warn("Invalid batch size input:", event.target.value);
             event.target.value = this.currentMaterialSettings?.defaultBatchSize || 20; // Revert
             return;
        }
        console.log("Batch size changed to:", newSize, "- Debouncing save...");
        this.saveBatchSizeDebounced(newSize); // Call debounced save
    }

     /**
      * Saves the batch size setting for the material via API.
      * @param {number} newSize
      * @private
      */
     async _saveBatchSizeSetting(newSize) {
         if (!this.currentMaterial) return;
         console.log(`Attempting to save batch size ${newSize} for material ${this.currentMaterial}`);

         // Update local cache optimistically
         if (this.currentMaterialSettings) {
            this.currentMaterialSettings.defaultBatchSize = newSize;
         } else {
             this.currentMaterialSettings = { defaultBatchSize: newSize }; // Initialize if null
         }

         this._updateLoadingState('materialSettings', true); // Show loading during save

         try {
             // API expects object with settings to update
             await apiClient.updateMaterialSettings(this.currentMaterial, {
                 defaultBatchSize: newSize
             });
             console.log("Batch size saved successfully via API.");
             // Optional: Show temporary success message
              this._showError("Batch size saved.", true);
         } catch (error) {
             console.error("Failed to save batch size via API:", error);
             this._showError(`Failed to save batch size: ${error.message}`);
             // Revert UI input if save fails?
              if (this.pillReviewBatchSize && this.currentMaterialSettings) {
                   this.pillReviewBatchSize.value = this.currentMaterialSettings.defaultBatchSize || 20; // Use cached value before optimistic update
              }
         } finally {
              this._updateLoadingState('materialSettings', false);
         }
     }

    // --- Modal Methods ---

    /**
     * Populates the modal content.
     * MODIFIED: Uses processAndRenderLatex for brief and detailed separately.
     * @param {object} cardData - Full card data object from API.
     * @private
     */
    _populateModal(cardData) {
        if (!this.modalOverlay || !cardData) return;
        this.currentModalCardId = cardData.id;

        console.log(`DEBUG (_populateModal): Populating modal for card ${cardData.id}`);

        // Set name (unchanged)
        this.modalTheoremName.textContent = (cardData.name || 'Unnamed Card').replace(/^\*\*|\*\*$/g, '').trim();

        // --- Render Brief Explanation ---
        const briefText = cardData.briefExplanation || '';
        this.modalBriefExplanation.innerHTML = '[Processing Brief...]'; // Placeholder
        console.log("DEBUG (_populateModal): Calling processAndRenderLatex for Brief Explanation.");
        console.log("DEBUG (_populateModal):   Brief Raw Text Length:", briefText.length);
        try {
            processAndRenderLatex(briefText, this.modalBriefExplanation);
            console.log("DEBUG (_populateModal): processAndRenderLatex for Brief finished.");
            console.log("DEBUG (_populateModal):   Brief final innerHTML (start):", this.modalBriefExplanation.innerHTML.substring(0, 150) + '...');
        } catch (err) {
            console.error("ERROR calling processAndRenderLatex for Brief:", err);
            this.modalBriefExplanation.innerHTML = '<span style="color:red;">[Render Error]</span>';
        }
        // --------------------------------

        // --- Render Detailed Explanation ---
        const detailedText = cardData.detailedExplanation || '';
        this.modalDetailedExplanation.innerHTML = '[Processing Detailed...]'; // Placeholder
        console.log("DEBUG (_populateModal): Calling processAndRenderLatex for Detailed Explanation.");
        console.log("DEBUG (_populateModal):   Detailed Raw Text Length:", detailedText.length);
        try {
            processAndRenderLatex(detailedText, this.modalDetailedExplanation);
            console.log("DEBUG (_populateModal): processAndRenderLatex for Detailed finished.");
            console.log("DEBUG (_populateModal):   Detailed final innerHTML (start):", this.modalDetailedExplanation.innerHTML.substring(0, 150) + '...');
        } catch (err) {
             console.error("ERROR calling processAndRenderLatex for Detailed:", err);
             this.modalDetailedExplanation.innerHTML = '<span style="color:red;">[Render Error]</span>';
        }
        // ----------------------------------

        // Reset view state (unchanged)
        this.modalDetailedExplanation.style.display = 'none';
        this.modalBriefExplanation.style.display = 'block';
        this.modalDetailSeparator.style.display = 'none';
        this.modalToggleBtn.innerHTML = 'Show Detailed<span class="keyboard-hint">(D)</span>';

        // Update buttons/pills (unchanged)
        
        // --- Update Bury Button State ---
        const isBuried = !!cardData.is_buried;
        this.modalBuryBtn?.classList.toggle('is-buried', isBuried);
        this.modalBuryBtn?.setAttribute('title', isBuried ? 'Unbury Card' : 'Bury Card');
        this.modalBuryBtn?.setAttribute('aria-label', isBuried ? 'Unbury Card' : 'Bury Card');
        // -------------------------------
        this.modalStarBtn?.classList.toggle('active', !!cardData.is_starred);
        this._updateStatusPills(
            cardData.cardStatus,        // e.g., "Learning"
            cardData.relativeNextReview,// e.g., "in 3d"
            cardData.relativeLastReview,// e.g., "2d ago" -> NEW, ensure API provides this
            cardData.masteryLevel       // e.g., "Level 1" -> NEW, ensure API provides this
        );
        this.modalPrevBtn.disabled = (this.currentModalCardIndex <= 0);
        this.modalNextBtn.disabled = (this.currentModalCardIndex >= this.filteredCardIds.length - 1);
        if (this.isAIViewActive) { this._toggleAIView(false); }

        console.log(`DEBUG (_populateModal): Modal population complete for card ${cardData.id}`);
    }


    /**
     * Shows the modal, side arrows, global close button, and blurs the background.
     * @private
     */
    _showModal() {
        if (!this.modalOverlay || !this.mainContent || !this.globalModalCloseBtn) return;

        // Reset AI state visually before showing modal
        this.isAIViewActive = false;
        this.isEditViewActive = false;
        this.modalOverlay.classList.remove('ai-active','edit-active', 'panel-active');

        // Make modal visible
        this.modalOverlay.classList.add('visible');
        this.mainContent.classList.add('blurred');
        this.globalModalCloseBtn.style.display = ''; // Show close button
        document.body.classList.add('modal-open');
        this.isModalVisible = true;

        // REMOVED: this.globalModalCloseBtn?.focus(); // Remove explicit focus
    }
     /**
     * Hides the modal and related UI elements. Ensures AI state is reset.
     * @private
     */
     _hideModal() {
        if (!this.modalOverlay || !this.mainContent || !this.globalModalCloseBtn) return;

        // Remove ALL relevant classes
        this.modalOverlay.classList.remove('visible', 'ai-active', 'edit-active', 'panel-active');

        this.mainContent.classList.remove('blurred');
        this.globalModalCloseBtn.style.display = 'none';
        document.body.classList.remove('modal-open');
        this.isModalVisible = false;
        this.isAIViewActive = false;
        this.isEditViewActive = false; // Ensure edit state is reset
        this.currentModalCardId = null;
        this.currentModalCardIndex = -1;
        this.currentModalOriginalData = null; // Clear stored original data
        // --- NEW: Reset button active states ---
        this.modalAIBtn?.classList.remove('active');
        this.modalEditBtn?.classList.remove('active');
        // ---
    }

    /**
     * Toggles visibility of detailed explanation and separator. Brief remains visible.
     * @private
     */
    _toggleModalDetail() {
        if (!this.modalDetailedExplanation || !this.modalToggleBtn || !this.modalDetailSeparator || !this.modalBriefExplanation) return;

        // Ensure brief is always visible
        this.modalBriefExplanation.style.display = 'block';

        const isDetailedVisible = this.modalDetailedExplanation.style.display !== 'none';

        if (isDetailedVisible) {
            // Hide Detailed and Separator
            this.modalDetailedExplanation.style.display = 'none';
            this.modalDetailSeparator.style.display = 'none';
            this.modalToggleBtn.innerHTML = 'Show Detailed<span class="keyboard-hint">(D)</span>';
        } else {
            // Show Detailed and Separator (if detailed has content)
            const detailedContent = this.modalDetailedExplanation.innerHTML.trim();
            const hasContent = detailedContent !== '' && detailedContent !== '<p>No detailed explanation.</p>'; // Check against potential placeholder

            this.modalDetailedExplanation.style.display = hasContent ? 'block' : 'none'; // Only show if content exists
            this.modalDetailSeparator.style.display = hasContent ? 'block' : 'none'; // Show separator only if detailed shown
            this.modalToggleBtn.innerHTML = 'Show Brief<span class="keyboard-hint">(D)</span>';

            // Render math if shown
            if (hasContent && typeof preprocessAndRenderMathInElementTest === 'function') {
                 preprocessAndRenderMathInElementTest(this.modalDetailedExplanation);
            }
        }
    }

    async _handleModalStarClick() {
        if (!this.currentModalCardId || this.isLoading.modalAction) return;
        this._updateLoadingState('modalAction', true);

        const cardId = this.currentModalCardId;
        const wasStarred = this.modalStarBtn.classList.contains('active');
        const newState = !wasStarred;

        this.modalStarBtn.classList.toggle('active', newState); // Optimistic update

        try {
            await apiClient[newState ? 'starCard' : 'unstarCard'](cardId);
            console.log(`Card ${cardId} ${newState ? 'starred' : 'unstarred'}`);

             // Update local state
             const cardInList = this.allCards.find(c => c.id === cardId);
             if (cardInList) cardInList.is_starred = newState;

             // Update grid appearance
             const gridCardEl = this.cardGridEl.querySelector(`.theorem-card-minimal[data-card-id="${cardId}"]`);
             gridCardEl?.classList.toggle('starred', newState);

             // Re-apply filter if filtering by starred
             const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
             if (activeFilter === 'starred') this._applyFilter(activeFilter);

        } catch (error) {
            console.error(`Failed to ${newState ? 'star' : 'unstar'} card ${cardId}:`, error);
            this._showError(`Failed to update star status.`);
            this.modalStarBtn.classList.toggle('active', wasStarred); // Revert UI
        } finally {
             this._updateLoadingState('modalAction', false);
        }
    }

    /**
     * Handles click on the modal's Bury/Unbury button.
     * @private
     */
    async _handleModalBuryClick() {
        if (!this.currentModalCardId || this.isLoading.modalAction) return;

        const cardId = this.currentModalCardId;
        // Find the card's current state from the *master* list
        const card = this.allCards.find(c => c.id === cardId);
        if (!card) {
             console.error(`Cannot toggle bury: Card ${cardId} not found in allCards.`);
             this._showError("Card data not found.");
             return;
        }
        const isCurrentlyBuried = !!card.is_buried;
        const action = isCurrentlyBuried ? 'unbury' : 'bury';
        const confirmMessage = isCurrentlyBuried ? "Unbury this card?" : "Bury this card?";

        if (!confirm(confirmMessage)) return;

        this._updateLoadingState('modalAction', true);
        this.modalBuryBtn?.classList.toggle('is-buried', !isCurrentlyBuried); // Optimistic UI update

        try {
            const updatedCardData = await apiClient[action === 'bury' ? 'buryCard' : 'unburyCard'](cardId);
            console.log(`Card ${cardId} ${action} success.`);

            // Update card data in the main list
            card.is_buried = updatedCardData.is_buried; // Update state from response
            card.srs_data = updatedCardData.srs_data; // Update SRS if changed

            // Update modal button state definitively based on response
            this.modalBuryBtn?.classList.toggle('is-buried', updatedCardData.is_buried);
            this.modalBuryBtn?.setAttribute('title', updatedCardData.is_buried ? 'Unbury Card' : 'Bury Card');
            this.modalBuryBtn?.setAttribute('aria-label', updatedCardData.is_buried ? 'Unbury Card' : 'Bury Card');

             // Refresh the grid view if the current filter might change due to bury/unbury
             const activeFilter = this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter;
             this._applyFilter(activeFilter || 'all'); // Re-apply current filter

             // Should we close the modal after unbury? Maybe not. Keep it open.
             // If burying, maybe close it? Let's close on bury for consistency.
             this._loadAnalytics(); // Update counts

        } catch (error) {
            console.error(`Failed to ${action} card ${cardId}:`, error);
            this._showError(`Failed to ${action} card.`);
            // Revert optimistic UI update
            this.modalBuryBtn?.classList.toggle('is-buried', isCurrentlyBuried);
            this.modalBuryBtn?.setAttribute('title', isCurrentlyBuried ? 'Unbury Card' : 'Bury Card');
            this.modalBuryBtn?.setAttribute('aria-label', isCurrentlyBuried ? 'Unbury Card' : 'Bury Card');
        } finally {
             this._updateLoadingState('modalAction', false);
        }
    }

    /**
     * Handles click on the modal's Edit button.
     * Toggles edit view OR closes it if already active.
     * Switches from AI view if AI is active.
     * @private
     */
    _handleModalEditClick() {
        if (this.isLoading.modalAction || this.isLoading.editSave) return;
        console.log(`Edit button clicked. Current states: Edit=${this.isEditViewActive}, AI=${this.isAIViewActive}`);

        if (this.isEditViewActive) {
            // If edit is already active, close it (treat as cancel)
            this._handleEditCancel();
        } else {
            // If AI is active, close it first, then open edit
            if (this.isAIViewActive) {
                this._toggleAIView(false);
            }
            // Open edit panel
            this._toggleEditView(true);
        }
    }

     /**
      * Handles click on the modal's Previous button.
      * MODIFIED: Fetches fresh data for the previous card.
      * @private
      */
     async _handleModalPrevClick() {
        if (this.currentModalCardIndex <= 0 || this.isLoading.modalLoad || this.isLoading.modalAction) return; // Check modalLoad too

        this.currentModalCardIndex--;
        const prevCardId = this.filteredCardIds[this.currentModalCardIndex];
        this._updateLoadingState('modalLoad', true); // Indicate loading

        try {
             // Fetch fresh data for the new card
             const prevCardData = await apiClient.getCard(prevCardId);
             if (!prevCardData) throw new Error(`Previous card data not found for ID: ${prevCardId}`);
             this.currentModalCardId = prevCardId; // Update current ID
             this._populateModal(prevCardData); // Populate with fresh data
        } catch (error) {
             console.error(`Failed to load previous card ${prevCardId}:`, error);
             this._showError("Could not load previous card.");
             this.currentModalCardIndex++; // Revert index on error
        } finally {
             this._updateLoadingState('modalLoad', false);
        }
    }

    /**
     * Toggles the Edit Card panel view AND updates button active state.
     * @param {boolean} showEdit - True to show Edit panel, false to hide it.
     * @private
     */
    _toggleEditView(showEdit) {
        if (!this.modalOverlay || !this.editCardPanel || !this.modalEditBtn) return;

        // Prevent double toggling or conflict with AI panel
        if (showEdit === this.isEditViewActive) return; // Already in desired state
        if (showEdit && this.isAIViewActive) {
             console.warn("Cannot open Edit panel while AI panel is active.");
             // Optionally close AI first: this._toggleAIView(false);
             return;
        }

        this.isEditViewActive = showEdit;
        this.modalOverlay.classList.toggle('edit-active', showEdit);
        this.modalOverlay.classList.toggle('panel-active', showEdit);
        this.modalEditBtn.classList.toggle('active', showEdit); // Update button state

        if (showEdit) {
            const cardData = this.allCards.find(c => c.id === this.currentModalCardId);
            if (cardData) {
                this.currentModalOriginalData = { ...cardData };
                this._populateEditPanel(cardData);
            } else {
                console.error("Cannot open edit panel: Card data not found.");
                this._showError("Could not load card data for editing.");
                // Revert state immediately if card data fails
                this.isEditViewActive = false;
                this.modalOverlay.classList.remove('edit-active', 'panel-active');
                this.modalEditBtn.classList.remove('active');
                return;
            }
        } else {
            // Clean up on hide (already handled by cancel/save logic)
             this.currentModalOriginalData = null;
        }
        console.log(`Edit View toggled: ${showEdit ? 'ON' : 'OFF'}`);
    }
    
        /**
         * Populates the edit panel form fields.
         * @param {object} cardData
         * @private
         */
        _populateEditPanel(cardData) {
             if (!this.editNameInput || !this.editChapterInput || !this.editBriefTextarea || !this.editDetailedTextarea) return;
    
             this.editNameInput.value = cardData.name || '';
             this.editChapterInput.value = cardData.chapter || ''; // Assumes cardData has chapter name
             this.editBriefTextarea.value = cardData.briefExplanation || '';
             this.editDetailedTextarea.value = cardData.detailedExplanation || '';
        }
    
         /**
         * Updates the main modal preview based on edit panel input.
         * @param {'name' | 'brief' | 'detailed' | 'chapter'} field - Which field changed.
         * @private
         */
         _updatePreviewContent(field) {
            if (!this.isEditViewActive) return; // Don't update if panel closed
    
            console.log(`DEBUG: Updating preview for field: ${field}`); // Log which field triggered
    
            try {
                switch (field) {
                    case 'name':
                        if (this.modalTheoremName && this.editNameInput) {
                             this.modalTheoremName.textContent = this.editNameInput.value.replace(/^\*\*|\*\*$/g, '').trim() || 'Unnamed Card';
                        }
                        break;
                    case 'brief':
                         if (this.modalBriefExplanation && this.editBriefTextarea) {
                             const briefText = this.editBriefTextarea.value;
                             console.log("DEBUG: Rendering Brief Preview, length:", briefText.length);
                             processAndRenderLatex(briefText, this.modalBriefExplanation); // Re-render
                             console.log("DEBUG: Brief Preview Rendered.");
                         }
                         break;
                    case 'detailed':
                        if (this.modalDetailedExplanation && this.editDetailedTextarea) {
                             const detailedText = this.editDetailedTextarea.value;
                             console.log("DEBUG: Rendering Detailed Preview, length:", detailedText.length);
                             processAndRenderLatex(detailedText, this.modalDetailedExplanation); // Re-render
                             console.log("DEBUG: Detailed Preview Rendered.");
                         }
                         break;
                     case 'chapter':
                         // Do we need to preview the chapter change? Probably not critical.
                         // Could update a (currently non-existent) chapter pill in the modal.
                         break;
                }
            } catch (error) {
                // Handle potential errors during processAndRenderLatex
                console.error(`Error updating preview for ${field}:`, error);
                // Optionally display a temporary error message near the affected field in the edit panel
            }
        }
    
        /**
         * Handles saving changes from the edit panel.
         * @private
         */
        async _handleEditSave() {
            if (!this.currentModalCardId || this.isLoading.editSave) return;
    
            const cardId = this.currentModalCardId;
            const originalCardData = this.allCards.find(c => c.id === cardId);
            if (!originalCardData) {
                this._showError("Cannot save: Original card data not found.");
                return;
            }
    
            // Get updated values
            const newName = this.editNameInput.value.trim();
            const newChapter = this.editChapterInput.value.trim();
            const newBrief = this.editBriefTextarea.value;
            const newDetailed = this.editDetailedTextarea.value;
    
            // --- Basic Validation ---
            if (!newName) {
                this._showError("Card name cannot be empty.");
                this.editNameInput.focus();
                return;
            }
            if (!newChapter) {
                this._showError("Chapter name cannot be empty.");
                this.editChapterInput.focus();
                return;
            }
    
            // --- Construct Update Payload (Only changed fields) ---
            const updateData = {};
            if (newName !== originalCardData.name) updateData.name = newName;
            if (newChapter !== originalCardData.chapter) updateData.chapter = newChapter;
            if (newBrief !== originalCardData.briefExplanation) updateData.briefExplanation = newBrief;
            if (newDetailed !== originalCardData.detailedExplanation) updateData.detailedExplanation = newDetailed;
    
            if (Object.keys(updateData).length === 0) {
                 this._showError("No changes detected.", true);
                 this._toggleEditView(false); // Close panel if no changes
                 return;
            }
    
            this._updateLoadingState('editSave', true);
            this.editSaveBtn.disabled = true;
            this.editCancelBtn.disabled = true;
    
            try {
                console.log("Sending update payload:", updateData);
                const updatedCard = await apiClient.updateCard(cardId, updateData);
                console.log("Card update successful:", updatedCard);
    
                // --- Update Local State and UI ---
                // 1. Update the card in the main `allCards` array
                const cardIndex = this.allCards.findIndex(c => c.id === cardId);
                if (cardIndex > -1) {
                    // Merge the updated fields into the existing card object
                    // Important: Use the response `updatedCard` as the source of truth
                    this.allCards[cardIndex] = { ...this.allCards[cardIndex], ...updatedCard };
                }
    
                // 2. Repopulate the *main modal* with the definitive updated data
                this._populateModal(updatedCard);
    
                // 3. Update the card preview in the grid
                 this._updateGridCardPreview(updatedCard);
    
                // 4. Handle potential chapter change
                if (updateData.chapter && updateData.chapter !== this.currentChapter) {
                     this._showError(`Card moved to chapter "${updateData.chapter}". Refreshing view...`, true);
                     // Simplest approach: reload the view or filter
                     this._applyFilter(this.filterButtonContainer?.querySelector('.filter-btn.active')?.dataset.filter || 'all');
                     // Analytics might also need update if card counts changed for *this* chapter
                     this._loadAnalytics();
                     this._hideModal(); // Close modal as card is gone from this chapter view
                } else {
                     // 5. Close the edit panel only if chapter didn't change
                     this._toggleEditView(false);
                     this._showError("Card updated successfully.", true); // Temp success message
                }
    
    
            } catch (error) {
                 console.error("Failed to save card:", error);
                 this._showError(`Error saving card: ${error.message}`);
                 // Keep panel open for user to review/retry
            } finally {
                 this._updateLoadingState('editSave', false);
                 if(this.editSaveBtn) this.editSaveBtn.disabled = false;
                 if(this.editCancelBtn) this.editCancelBtn.disabled = false;
            }
        }

    /**
     * Handles click on the modal's Next button.
     * MODIFIED: Fetches fresh data for the next card.
     * @private
     */
    async _handleModalNextClick() {
        if (this.currentModalCardIndex >= this.filteredCardIds.length - 1 || this.isLoading.modalLoad || this.isLoading.modalAction) return;

        this.currentModalCardIndex++;
        const nextCardId = this.filteredCardIds[this.currentModalCardIndex];
        this._updateLoadingState('modalLoad', true); // Indicate loading

        try {
             // Fetch fresh data for the new card
             const nextCardData = await apiClient.getCard(nextCardId);
             if (!nextCardData) throw new Error(`Next card data not found for ID: ${nextCardId}`);
             this.currentModalCardId = nextCardId; // Update current ID
             this._populateModal(nextCardData); // Populate with fresh data
        } catch (error) {
             console.error(`Failed to load next card ${nextCardId}:`, error);
             this._showError("Could not load next card.");
             this.currentModalCardIndex--; // Revert index on error
        } finally {
             this._updateLoadingState('modalLoad', false);
        }
    }


    /**
     * Handles click on the modal's Delete button.
     * Added check for apiClient.deleteCard method existence.
     * @private
     */
    async _handleModalDeleteClick() {
        if (!this.currentModalCardId || this.isLoading.modalAction || !confirm("Permanently delete this card? This action cannot be undone.")) return;

        // --- Check if delete function exists ---
        if (typeof apiClient.deleteCard !== 'function') {
             console.error("Delete functionality not available in apiClient.");
             this._showError("Delete feature not implemented.");
             return;
        }
        // -------------------------------------

        this._updateLoadingState('modalAction', true);
        const cardId = this.currentModalCardId;
        console.log(`Attempting to delete card ${cardId}`);

        try {
            await apiClient.deleteCard(cardId);
            console.log(`Card ${cardId} deleted successfully.`);
            this._showError(`Card deleted.`, true); // Use temporary success message

            // --- Remove card from UI and state ---
            const deletedIndexAll = this.allCards.findIndex(c => c.id === cardId);
            if (deletedIndexAll > -1) this.allCards.splice(deletedIndexAll, 1);
            const deletedIndexFiltered = this.filteredCardIds.indexOf(cardId);
            if (deletedIndexFiltered > -1) this.filteredCardIds.splice(deletedIndexFiltered, 1);
            // ------------------------------------

            this._hideModal();
            this._renderCardGrid();
            this._loadAnalytics(); // Refresh counts

        } catch (error) {
            console.error(`Failed to delete card ${cardId}:`, error);
            this._showError(`Failed to delete card: ${error.message}`);
            this._updateLoadingState('modalAction', false);
        }
        // No finally needed as modal closes on success
    }

         /**
      * Updates a single card's preview in the main grid.
      * @param {object} updatedCardData - The full, updated card data.
      * @private
      */
         _updateGridCardPreview(updatedCardData) {
            const cardElement = this.cardGridEl?.querySelector(`.theorem-card-minimal[data-card-id="${updatedCardData.id}"]`);
            if (!cardElement) return;
   
            const nameEl = cardElement.querySelector('.theorem-name-minimal');
            const briefEl = cardElement.querySelector('.explanation-preview');
   
            if (nameEl) nameEl.textContent = (updatedCardData.name || 'Unnamed Card').replace(/^\*\*|\*\*$/g, '').trim();
            if (briefEl) {
                const briefText = updatedCardData.briefExplanation || '';
                processAndRenderLatex(briefText, briefEl, { // Re-render with limited delimiters
                     delimiters: [
                         {left: '$', right: '$', display: false},
                         {left: '\\(', right: '\\)', display: false}
                     ]
                });
            }
            // Update starred class
            cardElement.classList.toggle('starred', !!updatedCardData.is_starred);
            // Update buried style (it might have been unburied via edit, though unlikely)
            cardElement.classList.toggle('buried-card-style', !!updatedCardData.is_buried);
        }
   
   
       /**
        * Handles canceling edits and closes the edit panel.
        * Reverts the main modal preview to the original state.
        * @private
        */
       _handleEditCancel() {
           console.log("Edit cancelled.");
           if (this.currentModalOriginalData) {
               // Repopulate the main modal with the stored original data
               this._populateModal(this.currentModalOriginalData);
           } else {
               // Fallback if original data wasn't stored (shouldn't happen)
               console.warn("Original card data not found on cancel, modal content might be inconsistent.");
           }
           this._toggleEditView(false); // Close the panel
       }

    /**
     * Handles click on the modal's AI button.
     * Toggles AI view OR closes it if already active.
     * Switches from Edit view if Edit is active.
     * @private
     */
    _handleModalAIClick() {
        if (this.isLoading.modalAction) return;
        console.log(`AI button clicked. Current states: Edit=${this.isEditViewActive}, AI=${this.isAIViewActive}`);

        if (this.isAIViewActive) {
            // If AI is already active, close it
            this._toggleAIView(false);
        } else {
            // If Edit is active, close it first, then open AI
            if (this.isEditViewActive) {
                // IMPORTANT: Cancel edits explicitly before switching
                this._handleEditCancel(); // This will also call _toggleEditView(false)
            }
            // Open AI panel
            this._toggleAIView(true);
        }
    }

     /**
      * Toggles the AI Chat panel view AND updates button active state.
      * @param {boolean} showAi - True to show AI panel, false to hide it.
      * @private
      */
     _toggleAIView(showAi) {
        if (!this.modalOverlay || !this.aiChatPanel || !this.modalAIBtn) return;

        // Prevent double toggling or conflict with Edit panel
        if (showAi === this.isAIViewActive) return; // Already in desired state
        if (showAi && this.isEditViewActive) {
             console.warn("Cannot open AI panel while Edit panel is active.");
             // Optionally close Edit first: this._handleEditCancel();
             return;
        }

        this.isAIViewActive = showAi;
        this.modalOverlay.classList.toggle('ai-active', showAi);
        this.modalOverlay.classList.toggle('panel-active', showAi);
        this.modalAIBtn.classList.toggle('active', showAi); // Update button state

        // Add any AI panel initialization/cleanup logic here if needed

        console.log(`AI View toggled: ${showAi ? 'ON' : 'OFF'}`);
    }


    // --- Utility Methods ---

    // --- Utility Methods ---

    /**
     * Updates loading state for different parts and disables relevant UI.
     * @param {string} part - Key from this.isLoading object.
     * @param {boolean} isLoading - True if loading, false otherwise.
     * @private
     */
    _updateLoadingState(part, isLoading) {
        if (typeof this.isLoading[part] === 'undefined') {
            console.warn(`_updateLoadingState called for unknown part: ${part}`);
            return;
        }
        if (this.isLoading[part] === isLoading) return; // No change

        this.isLoading[part] = isLoading;
        console.log(`Loading state for ${part}: ${isLoading}`);

        const anyMajorLoading = this.isLoading.cards || this.isLoading.analytics || this.isLoading.timeline || this.isLoading.srsThresholds || this.isLoading.allChapters || this.isLoading.materialSettings;
        const anyModalInteractionLoading = this.isLoading.modalLoad || this.isLoading.modalAction || this.isLoading.bulkAction || this.isLoading.editSave;
        const anyPillInteractionLoading = this.isLoading.materialSettings || this.isLoading.allChapters; // Disable pill during critical loads

        // Dim grid/controls if major data is loading
        this.mainContent?.classList.toggle('loading-major', anyMajorLoading || this.isLoading.headerRename);

        // Disable modal interactions
        [this.modalStarBtn, this.modalBuryBtn, this.modalDeleteBtn, this.modalEditBtn, this.modalAIBtn].forEach(btn => { if (btn) btn.disabled = anyModalInteractionLoading || anyMajorLoading; });
        this.modalPrevBtn.disabled = this.isLoading.modalLoad || this.isLoading.modalAction || this.currentModalCardIndex <= 0;
        this.modalNextBtn.disabled = this.isLoading.modalLoad || this.isLoading.modalAction || this.currentModalCardIndex < 0 || this.currentModalCardIndex >= this.filteredCardIds.length - 1;

        // Disable bulk actions / selection toggle
        [this.bulkStarBtn, this.bulkBuryBtn, this.bulkDeleteBtn, this.selectCardsToggleBtn].forEach(btn => { if (btn) btn.disabled = anyMajorLoading || anyModalInteractionLoading; });

        // Disable Pill Interactions
        this.pillChapterSwitcher?.querySelectorAll('button').forEach(btn => { if (btn) btn.disabled = anyPillInteractionLoading || anyMajorLoading; });
        if(this.pillStudyDueButton) this.pillStudyDueButton.disabled = anyPillInteractionLoading || anyMajorLoading || this.isLoading.analytics || (parseInt(this.pillDueCardsCount?.textContent || '0', 10) <= 0); // Also disable if 0 due
        if(this.pillOptionsTrigger) this.pillOptionsTrigger.disabled = anyPillInteractionLoading || anyMajorLoading;
        if(this.pillStudyAllButton) this.pillStudyAllButton.disabled = anyPillInteractionLoading || anyMajorLoading; // Inside popup
        if(this.pillReviewBatchSize) this.pillReviewBatchSize.disabled = anyPillInteractionLoading; // Disable batch during settings/chapter load

        // Disable header rename during its own process or major loads
        if(this.breadcrumbChapterSpan) this.breadcrumbChapterSpan.style.pointerEvents = (this.isLoading.headerRename || anyMajorLoading) ? 'none' : '';
    }

    _showError(message, temporary = false) {
        console.error("ChapterDetailsView Error:", message);
        // Simple alert for now, replace with a better UI element if desired
        if (temporary) {
           // TODO: Implement a temporary notification bar/toast
           console.log(`INFO (Temporary): ${message}`);
           // Example: Display in a temporary element
           const tempNotice = document.getElementById('temp-notice'); // Assuming an element exists
           if (tempNotice) {
               tempNotice.textContent = message;
               tempNotice.style.display = 'block';
               setTimeout(() => { tempNotice.style.display = 'none'; }, 3000);
           }
        } else {
            alert(`Error: ${message}`);
        }
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // KaTeX auto-render might run on initial HTML, but we need manual calls for dynamic content.
    // Check if already initialized (simple flag)
    if (window.chapterDetailsViewInitialized) {
        console.warn("ChapterDetailsView: Attempting to initialize again. Skipping.");
        return;
    }
    window.chapterDetailsViewInitialized = true;

    const view = new ChapterDetailsView();
    view.initialize().catch(err => {
        console.error("Unhandled error during view initialization:", err);
        // Display a critical error message to the user
        const body = document.body;
        if (body) {
            body.innerHTML = `<div style="padding: 20px; color: red; text-align: center; font-size: 1.2em;">
                <h2>Initialization Error</h2>
                <p>Could not load the chapter details. Please try again later.</p>
                <p><small>${err.message || 'Unknown error'}</small></p>
            </div>`;
        }
    });
});