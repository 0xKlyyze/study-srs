// --- File: js/views/chapterDetailsView.js ---
console.log("--- chapterDetailsView.js LOADED - Version XYZ ---"); // Put a unique version number here, like XYZ

import { apiClient } from '../api/apiClient.js';
import { processAndRenderLatex } from '../utils/latexProcessor.js';
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
                // ** New Button IDs **
        this.studyDueButton = document.getElementById('studyDueBtn'); // Renamed from studyNowButton
        this.studyAllButton = document.getElementById('studyAllBtn'); // New button

        // --- Analytics & Graph ---
        // Using more specific IDs would be better than nth-child selectors
        this.masteryProgressEl = this.mainContent?.querySelector('.chapter-analytics progress');
        this.masteryValueEl = this.mainContent?.querySelector('.chapter-analytics .value');
        this.totalCardsEl = document.getElementById('statTotalCards');
        this.dueCardsEl = document.getElementById('statDueCards');
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
        this.isLoading = { cards: false, analytics: false, timeline: false, modalAction: false, srsThresholds: false, modalLoad: false, bulkAction: false }; // Add bulkAction state
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

        // --- Debounced Preview Function ---
        this.debouncedPreviewUpdate = debounce(this._updatePreviewContent, 300); // 300ms debounce

        // --- Bind Methods ---
        this._handleFilterClick = this._handleFilterClick.bind(this);
        this._handleCardGridClick = this._handleCardGridClick.bind(this);
        // ** Bind New Handlers **
        this._handleStudyDueClick = this._handleStudyDueClick.bind(this); // Renamed handler
        this._handleStudyAllClick = this._handleStudyAllClick.bind(this);
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

    }

    /**
     * Initializes the view: parses URL, fetches data, sets up listeners.
     */
    async initialize() {
        if (!this.breadcrumbChapterSpan || !this.studyDueButton || !this.studyAllButton || !this.selectCardsToggleBtn || !this.bulkActionsGroup || !this.modalDetailSeparator || !this.mainContent || !this.cardGridEl || !this.modalOverlay || !this.modalBody || !this.globalModalCloseBtn || !this.modalPrevBtn || !this.modalNextBtn || !this.modalAIBtn || !this.modalDeleteBtn || !this.aiChatPanel || !this.breadcrumbChapterSpan || !this.masteredCardsEl || !this.editCardPanel || !this.editNameInput || !this.editSaveBtn || !this.editCancelBtn) {
            console.error("ChapterDetailsView: Missing critical elements (check modal buttons, side navs, AI panel).");
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
            this._parseUrlParams();
            this._setupEventListeners();
            this._updateLoadingState('srsThresholds', true); // Add state for thresholds load
            await this._loadSrsThresholds();
             this._updateLoadingState('cards', true);
            await this._loadInitialCards();
            await Promise.all([ this._loadAnalytics(), this._loadTimeline() ]);

        } catch (error) { // Catch errors from parsing or threshold loading too
            console.error("Error during initialization:", error);
            if (!this.currentMaterial || !this.currentChapter) return; // Stop if parsing failed
            this._showError(`Failed to initialize chapter view: ${error.message}`);
        } finally {
            this._updateLoadingState('srsThresholds', false);
            this._updateLoadingState('cards', false); // Turn off general loading state
        }

        console.log(`Chapter Details View Initialized for: ${this.currentMaterial} / ${this.currentChapter}`);
    }

    /**
     * Parses material and chapter from URL query parameters.
     * @private
     */
    /**
     * Parses URL params and updates the new breadcrumb structure.
     * @private
     */
    _parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentMaterial = urlParams.get('material');
        this.currentChapter = urlParams.get('chapter'); // Encoded

        if (!this.currentMaterial || !this.currentChapter) { /* ... error handling ... */ throw new Error("Missing params"); }

        const decodedChapter = decodeURIComponent(this.currentChapter);

        // Update Header Content using new structure
        if (this.breadcrumbMaterialLink) {
            this.breadcrumbMaterialLink.textContent = this.currentMaterial;
            this.breadcrumbMaterialLink.href = `index.html`; // Or appropriate link
        }
        if (this.breadcrumbChapterSpan) {
            this.breadcrumbChapterSpan.textContent = decodedChapter;
        }
        // H1 title is removed from HTML
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
        this.studyDueButton?.addEventListener('click', this._handleStudyDueClick); // Renamed handler
        this.studyAllButton?.addEventListener('click', this._handleStudyAllClick);
        this.selectCardsToggleBtn?.addEventListener('click', this._toggleCardSelectionMode);
        this.bulkStarBtn?.addEventListener('click', this._handleBulkStar);
        this.bulkBuryBtn?.addEventListener('click', this._handleBulkBury);
        this.bulkDeleteBtn?.addEventListener('click', this._handleBulkDelete);

        // --- NEW: Header Rename Listener ---
        this.breadcrumbChapterSpan?.addEventListener('dblclick', this._handleHeaderRenameDblClick);

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

        // Keyboard listeners
        document.addEventListener('keydown', this._handleKeyDown);
        console.log("--- Exiting _setupEventListeners (V6 Modal) ---");
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
     * ADDED: Fetches SRS threshold settings.
     * @private
     */
        async _loadSrsThresholds() {
            console.log("Fetching SRS thresholds...");
            try {
                const thresholds = await apiClient.getSrsThresholds();
                this.srsThresholds = { ...this.srsThresholds, ...thresholds }; // Merge fetched with defaults
                console.log("SRS Thresholds loaded:", this.srsThresholds);
            } catch (error) {
                console.error("Failed to load SRS thresholds, using defaults:", error);
                // Keep default values stored in this.srsThresholds
                this._showError("Could not load SRS settings, using defaults.");
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
     * Fetches analytics data for the current chapter.
     * @private
     */
     async _loadAnalytics() {
        this._updateLoadingState('analytics', true);
        try {
            const stats = await apiClient.getChapterStats(this.currentMaterial, this.currentChapter);
            this._renderAnalytics(stats);
        } catch (error) {
             console.error("Failed to load chapter analytics:", error);
             if(this.masteryValueEl) {
                 this.masteryValueEl.textContent = 'N/A';
                 this.masteryProgressEl.value = 0;
             }
             if(this.totalCardsEl) this.totalCardsEl.textContent = '-';
             if(this.dueCardsEl) this.dueCardsEl.textContent = '-';
             if(this.learningCardsEl) this.learningCardsEl.textContent = '-';

        } finally {
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
     * Updates the analytics section with fetched data.
     * MODIFIED: Populates 4 stat boxes using new IDs.
     * @param {object | null} stats - Statistics object from API (e.g., { mastery, totalCards, dueCards, learningCards, masteredCards, newCards })
     * @private
     */
    _renderAnalytics(stats) {
        const mastery = stats?.mastery ?? 0;
        const totalCards = stats?.totalCards ?? '-';
        const dueCards = stats?.dueCards ?? '-';
        const learningCards = stats?.learningCards ?? '-';
        const masteredCards = stats?.masteredCards ?? '-'; // Use actual field name from API
        // const newCards = stats?.newCards ?? '-'; // Use if available

        if (this.masteryProgressEl) this.masteryProgressEl.value = mastery;
        if (this.masteryValueEl) this.masteryValueEl.textContent = `${mastery.toFixed(0)}%`;

        if (this.totalCardsEl) this.totalCardsEl.textContent = totalCards;
        if (this.dueCardsEl) this.dueCardsEl.textContent = dueCards;
        if (this.learningCardsEl) this.learningCardsEl.textContent = learningCards;
        if (this.masteredCardsEl) this.masteredCardsEl.textContent = masteredCards; // Populate new box
        // if (this.newCardsEl) this.newCardsEl.textContent = newCards;
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
     * Filters the card list and re-renders the grid.
     * MODIFIED: Added detailed checks at the VERY beginning.
     * @param {string} filterType - 'all', 'due', 'learning', 'mastered', 'starred'.
     * @private
     */
    _applyFilter(filterType) {

        // --- Handle Buried Filter via API Call ---
        if (filterType === 'buried') {
            this._fetchAndRenderBuriedCards();
            return; // Stop here for buried filter
        }

        const now = new Date();
        const { learningReps } = this.srsThresholds;
        console.log(`DEBUG V8: Applying filter "${filterType}" with learningReps=${learningReps}`);

        // --- Check allCards AFTER checking thresholds ---
         if (!Array.isArray(this.allCards)) {
             console.error("DEBUG: ERROR - this.allCards is not an array!", this.allCards);
             this.filteredCardIds = [];
             this._renderCardGrid();
             return;
        }

        this.filteredCardIds = this.allCards // Filter the non-buried list
            .filter(card => {
                // Card is guaranteed non-buried here unless filterType was 'buried' (handled above)
                if (!card || !card.srs_data) return false;

                const isStarred = !!card.is_starred;
                const nextReviewTimestamp = card.srs_data.next_review;
                const lastReviewTimestamp = card.srs_data.last_review;
                const repetitions = card.srs_data.repetitions ?? 0;
                const nextReviewDate = nextReviewTimestamp ? new Date(nextReviewTimestamp.seconds * 1000 + (nextReviewTimestamp.nanoseconds || 0) / 1e6) : null;
                const lastReviewDate = lastReviewTimestamp ? new Date(lastReviewTimestamp.seconds * 1000 + (lastReviewTimestamp.nanoseconds || 0) / 1e6) : null;
                const isDue = !nextReviewDate || nextReviewDate <= now;

                switch (filterType) {
                    case 'starred': return isStarred;
                    case 'due': return isDue;
                    case 'learning': return !!lastReviewDate && !isDue && repetitions <= learningReps;
                    case 'mastered':
                        // Definition for non-buried mastered cards
                        const isLearning = !!lastReviewDate && !isDue && repetitions <= learningReps;
                        return !!lastReviewDate && !isDue && !isLearning;
                    case 'all': default: return true; // All non-buried
                }
            })
            .map(card => card.id);

        console.log(`DEBUG V8 (Local Filter): Result IDs (${this.filteredCardIds.length}):`, JSON.stringify(this.filteredCardIds));
        // Render using the filtered IDs from the non-buried list
        this._renderCardGrid(); // Pass null to use this.filteredCardIds
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
     * Handles click on the "Study Due Cards" button.
     * @private
     */
    _handleStudyDueClick() { // Renamed handler
        console.log(`Initiating study session for DUE cards in chapter: ${this.currentChapter}`);
        const url = `study-session.html?material=${encodeURIComponent(this.currentMaterial)}&chapters=${this.currentChapter}`;
        window.location.href = url;
        // Assumes studyView.js defaults to DUE for single chapter if no other flags present
    }

    /**
     * Handles click on the "Study All Cards" button.
     * @private
     */
    _handleStudyAllClick() {
         console.log(`Initiating study session for ALL non-buried cards in chapter: ${this.currentChapter}`);
         // Need a way to tell studyView to fetch ALL non-buried, not just due. Add a parameter?
         const url = `study-session.html?material=${encodeURIComponent(this.currentMaterial)}&chapters=${this.currentChapter}&mode=all`; // Added mode=all
         window.location.href = url;
         // NOTE: studyView.js needs to be updated to check for `mode=all` and call `apiClient.getCards({material, chapter, buried: false})` instead of `due: true`.
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

    _updateLoadingState(part, isLoading) {
        this.isLoading[part] = isLoading;
        console.log(`Loading state for ${part}: ${isLoading}`);
        const anyMajorLoading = this.isLoading.cards || this.isLoading.analytics || this.isLoading.timeline || this.isLoading.srsThresholds;
        const anyModalInteractionLoading = this.isLoading.modalLoad || this.isLoading.modalAction || this.isLoading.bulkAction;

        // Dim grid/controls if major data is loading
        this.mainContent?.classList.toggle('loading-major', anyMajorLoading);
        // Disable interactions during modal/bulk actions
         [this.modalStarBtn, this.modalBuryBtn, this.modalDeleteBtn, this.modalEditBtn, this.modalAIBtn, this.bulkStarBtn, this.bulkBuryBtn, this.bulkDeleteBtn].forEach(btn => {
            if (btn) btn.disabled = anyModalInteractionLoading;
         });
         this.selectCardsToggleBtn.disabled = anyMajorLoading; // Disable select toggle during loads
     }

    _showError(message, temporary = false /* Added optional param */) {
        console.error("ChapterDetailsView Error:", message);
        // Simple alert for now, replace with a better UI element if desired
        // Consider making temporary errors less intrusive
        if (temporary) {
           // TODO: Implement a temporary notification bar/toast
           console.log(`INFO (Temporary): ${message}`);
        } else {
            alert(`Error: ${message}`);
        }
    }
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // KaTeX auto-render might run on initial HTML, but we need manual calls for dynamic content.
    const view = new ChapterDetailsView();
    view.initialize();
});