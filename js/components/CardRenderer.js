// --- File: js/components/CardRenderer.js ---
// UPDATE: Adapt to V3 HTML structure (.card-scene, .card-face, etc.), handle front meta, handle star state

import { processAndRenderLatex } from '../utils/latexProcessor.js';

export class CardRenderer {
    /**
    * @param {HTMLElement} cardSceneElement - The main .card-scene container element.
    */
    constructor(cardSceneElement) {
        console.log("DEBUG: CardRenderer constructor called.");
        if (!cardSceneElement) throw new Error("CardRenderer requires a valid card scene element.");
        this.cardSceneEl = cardSceneElement; // Renamed for clarity

        // Find elements within the scene
        const cardFront = this.cardSceneEl.querySelector('.card-face.card-front');
        const cardBack = this.cardSceneEl.querySelector('.card-face.card-back');

        if (!cardFront || !cardBack) {
            throw new Error("CardRenderer could not find .card-face elements.");
        }

        // Front elements
        this.theoremNameEl = cardFront.querySelector('.theorem-name');
        this.cardMetaEl = cardFront.querySelector('.card-meta'); // Element for Material/Chapter

        // Back elements
        const contentWrapper = cardBack.querySelector('.card-content-wrapper');
        this.briefExplanationEl = contentWrapper.querySelector('.brief-explanation');
        this.detailedExplanationEl = contentWrapper.querySelector('.detailed-explanation');
        this.detailSeparator = contentWrapper.querySelector('.explanation-separator');
        // Find button in its new container
        this.toggleButtonContainer = contentWrapper.querySelector('.detail-toggle-container');
        this.toggleButton = this.toggleButtonContainer?.querySelector('.toggle-detail-btn');

        // Check all elements found
        if (!this.theoremNameEl || !this.cardMetaEl || !this.briefExplanationEl || !this.detailedExplanationEl || !this.detailSeparator) {
            console.error("Card scene element is missing required child elements. Check selectors.", {
                theoremName: !!this.theoremNameEl, cardMeta: !!this.cardMetaEl,
                brief: !!this.briefExplanationEl, detailed: !!this.detailedExplanationEl,
                separator: !!this.detailSeparator
            });
             // Attempt to continue, but rendering might fail partially
        }

        if (!this.toggleButton) {
            console.warn("Detail toggle button or its container not found.");
        }

        this.isDetailedView = false;
        this._setupEventListeners();
    }

    /**
     * Renders the flashcard data into the HTML elements.
     * Now also handles front meta and starred state visual.
     * @param {object} cardData - The flashcard data object.
     */
    render(cardData) {
         console.log("DEBUG: CardRenderer.render called with cardData:", cardData);
         if (!cardData) {
             console.error("DEBUG: render: Invalid cardData.");
             if (this.theoremNameEl) this.theoremNameEl.textContent = 'Error: No Card Data';
             // Clear other fields if possible
             if (this.cardMetaEl) this.cardMetaEl.textContent = '';
             if (this.briefExplanationEl) this.briefExplanationEl.innerHTML = '';
             if (this.detailedExplanationEl) this.detailedExplanationEl.innerHTML = '';
             return;
         }
        if (!this.theoremNameEl || !this.cardMetaEl || !this.briefExplanationEl || !this.detailedExplanationEl) {
            console.error("DEBUG: render: Missing required render elements. Cannot render fully.");
            // Render what we can
         }


         // --- Render Front ---
         if(this.theoremNameEl) {
            this.theoremNameEl.textContent = (cardData.name || 'Untitled Card').replace(/^\*\*|\*\*$/g, '').trim();
         }
         if(this.cardMetaEl) {
             const materialText = cardData.material || '';
             const chapterText = cardData.chapter || '';
             let displayText = '';
             if (materialText && chapterText) {
                 displayText = `${materialText} • ${chapterText}`; // Use a different separator
             } else {
                 displayText = materialText || chapterText;
             }
             this.cardMetaEl.textContent = displayText;
         }
          // Update starred state visual on the scene container
         this.updateStarState(!!cardData.is_starred);


        // --- Render Back (Detailed) ---
        if(this.detailedExplanationEl) {
            const detailedText = cardData.detailedExplanation || '(No detailed explanation)';
            this.detailedExplanationEl.innerHTML = '';
            // *** Set data-block-type on the OUTER div ***
            this.detailedExplanationEl.dataset.blockType = cardData.detailedBlockType || 'Détail';
            // *** Process content which generates INNER divs ***
            processAndRenderLatex(detailedText, this.detailedExplanationEl);
        } else { console.warn("Detailed explanation element not found for rendering."); }

       // --- Render Back (Brief) ---
        if(this.briefExplanationEl) {
            const briefText = cardData.briefExplanation || '(No brief explanation)';
            this.briefExplanationEl.innerHTML = '';
            // *** Set data-block-type on the OUTER div ***
            this.briefExplanationEl.dataset.blockType = cardData.briefBlockType || 'Explication';
            // *** Process content which generates INNER divs ***
            processAndRenderLatex(briefText, this.briefExplanationEl);
        } else { console.warn("Brief explanation element not found for rendering."); }

         // --- Reset View State ---
         this.isDetailedView = false;
         this._updateDetailToggleView();
         console.log("DEBUG: CardRenderer.render finished.");
    }

     /**
      * Updates the visual state for starring/unstarring the card.
      * Adds/removes a class to the main scene element.
      * @param {boolean} isStarred - Whether the card is currently starred.
      */
     updateStarState(isStarred) {
         this.cardSceneEl?.classList.toggle('card-scene--starred', isStarred);
         // Ensure CSS exists: .card-scene.card-scene--starred .card-face { border-left: 5px solid var(--accent-yellow); }
         // Or any other desired visual cue.
     }


    /**
     * Toggles the visibility between brief and detailed explanations.
     */
    toggleDetails() {
        console.log(`DEBUG: CardRenderer.toggleDetails called. Current isDetailedView: ${this.isDetailedView}`);
        this.isDetailedView = !this.isDetailedView;
        this._updateDetailToggleView();
    }

     _setupEventListeners() {
         if (this.toggleButton) {
             // Remove potentially existing listener to prevent duplicates if constructor runs again
             this.toggleButton.removeEventListener('click', this._handleToggleClickBound);
             // Bind the handler *once* and store it
             this._handleToggleClickBound = this._handleToggleClick.bind(this);
             this.toggleButton.addEventListener('click', this._handleToggleClickBound);
         } else {
             console.warn("Detail toggle button not found during setup.");
         }
     }

      _handleToggleClick() {
          console.log("DEBUG: CardRenderer toggle button clicked.");
          this.toggleDetails();
      }

    // Updated logic for detail view state
    _updateDetailToggleView() {
        console.log(`DEBUG: CardRenderer._updateDetailToggleView. isDetailedView: ${this.isDetailedView}`);
        // Check elements needed for this update
        if (!this.cardSceneEl || !this.toggleButton) {
            console.warn("Cannot update detail toggle view - missing scene or button element.");
            return;
        }

        // 1. Add/remove class on the main scene element
        // This class now controls visibility of detailed explanation AND separator via CSS
        this.cardSceneEl.classList.toggle('show-detailed', this.isDetailedView);

        // 2. Update button text
        this.toggleButton.innerHTML = this.isDetailedView
             ? 'Show Brief <span class="keyboard-hint">(D)</span>' // Or maybe "Hide Detail"?
             : 'Show Detailed <span class="keyboard-hint">(D)</span>';

        // 3. Separator visibility is now purely handled by CSS based on .show-detailed

        // 4. Brief explanation visibility is also now handled by CSS (it's always block)

   }
} 