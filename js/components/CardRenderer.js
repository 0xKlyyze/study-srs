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
        this.cardSceneEl = cardSceneElement;

        const cardFront = this.cardSceneEl.querySelector('.card-face.card-front');
        const cardBack = this.cardSceneEl.querySelector('.card-face.card-back');

        if (!cardFront || !cardBack) {
            throw new Error("CardRenderer could not find .card-face elements.");
        }

        // Front elements
        this.theoremNameEl = cardFront.querySelector('.theorem-name');
        this.cardMetaEl = cardFront.querySelector('.card-meta');

        // Back elements
        this.cardBackContentWrapper = cardBack.querySelector('.card-content-wrapper'); // Store wrapper
        this.briefExplanationEl = this.cardBackContentWrapper?.querySelector('.brief-explanation');
        this.detailedExplanationEl = this.cardBackContentWrapper?.querySelector('.detailed-explanation');
        this.detailSeparator = this.cardBackContentWrapper?.querySelector('.explanation-separator');
        this.toggleButtonContainer = this.cardBackContentWrapper?.querySelector('.detail-toggle-container');
        this.toggleButton = this.toggleButtonContainer?.querySelector('.toggle-detail-btn');


        if (!this.theoremNameEl || !this.cardMetaEl || !this.briefExplanationEl || !this.detailedExplanationEl || !this.detailSeparator || !this.cardBackContentWrapper) {
            console.error("Card scene element is missing required child elements. Check selectors.", {
                theoremName: !!this.theoremNameEl, cardMeta: !!this.cardMetaEl,
                brief: !!this.briefExplanationEl, detailed: !!this.detailedExplanationEl,
                separator: !!this.detailSeparator, wrapper: !!this.cardBackContentWrapper
            });
        }

        if (!this.toggleButton) {
            console.warn("Detail toggle button or its container not found.");
        }

        this.isDetailedView = false;
        this.currentKeyboardSelectedHeader = null; // Track keyboard selection

        // Bind methods ONCE
        this._handleToggleClickBound = this._handleToggleClick.bind(this);
        this._handleClickDelegatedBound = this._handleClickDelegated.bind(this);
        this._handleKeydownDelegatedBound = this._handleKeydownDelegated.bind(this);

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


           // --- Render Back ---
         if (this.detailedExplanationEl) {
            processAndRenderLatex(cardData.detailedExplanation || '', this.detailedExplanationEl);
            this._resetExplanationBlocks(this.detailedExplanationEl);
        }
        if (this.briefExplanationEl) {
            processAndRenderLatex(cardData.briefExplanation || '', this.briefExplanationEl);
            this._resetExplanationBlocks(this.briefExplanationEl);
        }

        // --- Reset View State ---
        this.isDetailedView = false; // Always reset to brief on new card
        this._updateDetailToggleView(); // This handles visibility AND initial keyboard selection

        console.log("DEBUG: CardRenderer.render finished.");
   }

    /** Helper to reset state of explanation blocks within a container */
_resetExplanationBlocks(container) {
    if (!container) return;
    container.querySelectorAll('.explanation-block').forEach(block => {
        block.classList.remove('is-expanded', 'is-hinted', 'keyboard-selected');
        const header = block.querySelector('.explanation-block-header');
        const hintPreview = block.querySelector('.explanation-block-hint-preview');
        if (header) {
            header.setAttribute('aria-expanded', 'false');
            header.setAttribute('tabindex', '-1');
        }
        if (hintPreview) {
             // Clear the preview container
             while (hintPreview.firstChild) {
                 hintPreview.removeChild(hintPreview.firstChild);
             }
             // CSS handles display:none based on is-hinted removal
        }
        block.querySelector('.hint-button')?.classList.remove('active');
    });
}



    /** Sets keyboard selection to the first header in the currently visible container */
    _initializeKeyboardSelection() {
        console.log("DEBUG: Initializing keyboard selection.");
        const visibleContainer = this.isDetailedView ? this.detailedExplanationEl : this.briefExplanationEl;
        if (!visibleContainer) {
            console.warn("DEBUG: Cannot initialize keyboard selection - visible container not found.");
            this.currentKeyboardSelectedHeader = null;
            this.cardBackContentWrapper?.querySelector('.keyboard-selected')?.classList.remove('keyboard-selected');
            return;
        }

        // Remove selection and focusability from previously selected (if any)
        if (this.currentKeyboardSelectedHeader) {
            this.currentKeyboardSelectedHeader.closest('.explanation-block')?.classList.remove('keyboard-selected');
            this.currentKeyboardSelectedHeader.setAttribute('tabindex', '-1');
            this.currentKeyboardSelectedHeader = null;
        }
         // Make all headers non-focusable first (important reset)
        this.cardBackContentWrapper?.querySelectorAll('.explanation-block-header').forEach(h => h.setAttribute('tabindex', '-1'));

        // Find the first header *within the visible container*
        const firstHeader = visibleContainer.querySelector('.explanation-block .explanation-block-header');

        if (firstHeader) {
            console.log("DEBUG: Selecting and focusing first visible header:", firstHeader);
            firstHeader.setAttribute('tabindex', '0'); // Make it focusable
            this._updateKeyboardSelection(firstHeader); // Apply visual style

            // *** ADD FOCUS CALL ***
            // Use setTimeout to ensure focus call happens after potential rendering updates
            setTimeout(() => {
                firstHeader.focus({ preventScroll: true }); // Move focus programmatically
                console.log("DEBUG: Focused first header.");
            }, 0);

        } else {
            console.log("DEBUG: No headers found in visible container to select.");
        }
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
        // Detail Toggle Button
        if (this.toggleButton) {
            this.toggleButton.removeEventListener('click', this._handleToggleClickBound);
            this.toggleButton.addEventListener('click', this._handleToggleClickBound);
        } else {
            console.warn("Detail toggle button not found during setup.");
        }

       // Event Delegation for Explanation Blocks
       if (this.cardBackContentWrapper) {
           // --- Click Listener ---
           this.cardBackContentWrapper.removeEventListener('click', this._handleClickDelegatedBound);
           this.cardBackContentWrapper.addEventListener('click', this._handleClickDelegatedBound);
           console.log("DEBUG: Added explanation block CLICK listener.");

           // --- Keydown Listener ---
           this.cardBackContentWrapper.removeEventListener('keydown', this._handleKeydownDelegatedBound);
           this.cardBackContentWrapper.addEventListener('keydown', this._handleKeydownDelegatedBound);
           console.log("DEBUG: Added explanation block KEYDOWN listener.");
       } else {
           console.warn("Card back content wrapper not found for explanation listeners.");
       }
   }

   _handleToggleClick() {
       console.log("DEBUG: CardRenderer toggle button clicked.");
       this.toggleDetails();
   }

   // --- Delegated Click Handler ---
 // --- Delegated Click Handler ---
 _handleClickDelegated(event) {
    const header = event.target.closest('.explanation-block-header');
    if (!header) return;

    const block = header.closest('.explanation-block');
    if (!block) return;

    const hintButton = event.target.closest('.hint-button');
    // Check if click is DIRECTLY on the hint button or its children
    if (hintButton) {
        // --- Hint Button Click ---
        console.log("DEBUG: Hint button clicked.");
        // event.stopPropagation(); // Stop propagation might not be needed if logic below handles it
        this._toggleHintState(block);
        this._updateKeyboardSelection(header);
        header.focus(); // Keep focus on header after hint interaction
    } else {
        // --- Click on Header (anywhere else) or Toggle Icon ---
        console.log("DEBUG: Header area (non-hint) clicked.");
        this._toggleBlockState(block); // Normal toggle
        this._updateKeyboardSelection(header);
        // No need to focus manually, click does it if element is focusable (tabindex=0)
    }
}

      _handleToggleClick() {
          console.log("DEBUG: CardRenderer toggle button clicked.");
          this.toggleDetails();
          this._initializeKeyboardSelection(); // Re-initialize selection when view changes
      }

      // --- NEW: Delegated Click Handler ---
      // --- Delegated Click Handler ---
    _handleClickDelegated(event) {
        // Find the closest header ancestor
        const header = event.target.closest('.explanation-block-header');
        if (!header) {
            console.log("DEBUG: Click outside any header.");
            return; // Click wasn't inside a header at all
        }

        const block = header.closest('.explanation-block');
        if (!block) return; // Should not happen if header exists

        // Check if the click specifically targeted the hint button or its contents
        const hintButton = event.target.closest('.hint-button');

        if (hintButton) {
            // --- Hint Button Click ---
            console.log("DEBUG: Hint button clicked.");
            // No stopPropagation needed unless specific issues arise
            this._toggleHintState(block);
            this._updateKeyboardSelection(header); // Ensure header remains selected
            // Focus remains on the button or shifts slightly, which is okay
        } else {
            // --- Click landed anywhere else within the header ---
            console.log("DEBUG: Header area (non-hint) clicked.");
            this._toggleBlockState(block); // Normal toggle
            this._updateKeyboardSelection(header); // Update selection state
            // No need to focus manually, click handles it
        }
    }

      /** Helper to toggle the main expanded/collapsed state */
    /** Helper to toggle the main expanded/collapsed state */
 /** Helper to toggle the main expanded/collapsed state */
 _toggleBlockState(blockElement) {
    const header = blockElement.querySelector('.explanation-block-header');
    const hintPreviewElement = blockElement.querySelector('.explanation-block-hint-preview');
    const isCurrentlyExpanded = blockElement.classList.contains('is-expanded');
    const isCurrentlyHinted = blockElement.classList.contains('is-hinted');

    // --- ALWAYS remove hint state when toggling normally ---
    if (isCurrentlyHinted) {
         blockElement.classList.remove('is-hinted');
         // Clear and hide the hint preview element
         if (hintPreviewElement) {
             while (hintPreviewElement.firstChild) {
                hintPreviewElement.removeChild(hintPreviewElement.firstChild);
             }
             // CSS will hide it based on is-hinted class removal
         }
    }

    // Toggle expanded state
    blockElement.classList.toggle('is-expanded', !isCurrentlyExpanded);

    // Update ARIA
    if (header) {
        header.setAttribute('aria-expanded', !isCurrentlyExpanded);
    }
    console.log(`DEBUG: Toggled block expanded state to ${!isCurrentlyExpanded}`);
}



    /** Helper to toggle the hint state */
 /**
     * Helper to toggle the hint state using JS overlay.
     * @param {HTMLElement} blockElement
     * @private
     */

  _toggleHintState(blockElement) {
    const header = blockElement.querySelector('.explanation-block-header');
    const contentBlurredElement = blockElement.querySelector('.explanation-block-content-blurred');
    const hintPreviewElement = blockElement.querySelector('.explanation-block-hint-preview');

    if (!contentBlurredElement || !hintPreviewElement) {
        console.error("Missing content elements for hint state toggle in block:", blockElement);
        return;
    }

    const isCurrentlyHinted = blockElement.classList.contains('is-hinted');

    if (isCurrentlyHinted) {
        // --- Turn hint OFF ---
        console.log("DEBUG: Removing hint state.");
        blockElement.classList.remove('is-hinted', 'is-expanded');
        // Clear the preview container thoroughly
        while (hintPreviewElement.firstChild) {
            hintPreviewElement.removeChild(hintPreviewElement.firstChild);
        }
        // CSS handles hiding hintPreviewElement via display:none based on is-hinted class
        if (header) header.setAttribute('aria-expanded', 'false');

    } else {
        // --- Turn hint ON ---
        console.log("DEBUG: Adding hint state by cloning content.");

        // 1. Clear any previous preview content
        while (hintPreviewElement.firstChild) {
            hintPreviewElement.removeChild(hintPreviewElement.firstChild);
        }

        // 2. Clone the nodes from the original content
        const clonedNodes = [];
        contentBlurredElement.childNodes.forEach(node => {
            clonedNodes.push(node.cloneNode(true)); // Deep clone each node
        });

        // 3. Append cloned nodes to the preview element
        if (clonedNodes.length > 0) {
            clonedNodes.forEach(node => {
                hintPreviewElement.appendChild(node);
            });
            console.log("DEBUG: Cloned content appended to hint preview.");

             // 4. Apply classes to the main block
             blockElement.classList.remove('is-expanded');
             blockElement.classList.add('is-hinted', 'is-expanded');
             if (header) header.setAttribute('aria-expanded', 'true');
             // CSS handles making hintPreviewElement visible and limiting its height

        } else {
             console.warn("DEBUG: No content found in blurred container to clone for hint.");
             // Fallback: Just expand normally
             blockElement.classList.remove('is-hinted');
             blockElement.classList.add('is-expanded');
             if (header) header.setAttribute('aria-expanded', 'true');
        }
    }
}

     /** Helper to update which header is 'selected' for keyboard nav */
     _updateKeyboardSelection(newSelectedHeader) {
        if (this.currentKeyboardSelectedHeader && this.currentKeyboardSelectedHeader !== newSelectedHeader) {
            this.currentKeyboardSelectedHeader.closest('.explanation-block')?.classList.remove('keyboard-selected');
            this.currentKeyboardSelectedHeader.setAttribute('tabindex', '-1');
        }

        if (newSelectedHeader) {
            newSelectedHeader.closest('.explanation-block')?.classList.add('keyboard-selected');
            newSelectedHeader.setAttribute('tabindex', '0'); // Make current one focusable
            this.currentKeyboardSelectedHeader = newSelectedHeader;
        } else {
            this.currentKeyboardSelectedHeader = null;
        }
    }

    // --- NEW: Delegated Keydown Handler ---      // --- NEW: Delegated Keydown Handler ---
      // --- Delegated Keydown Handler ---
// --- Delegated Keydown Handler Refinement ---
// --- Delegated Keydown Handler (Ensure Enter Propagation is stopped) ---
_handleKeydownDelegated(event) {
    // ... (existing checks for target, visibleContainer, headers, currentIndex) ...
    if (!event.target.matches('.explanation-block-header') || !this.cardBackContentWrapper.contains(event.target)) {
         const buttonInHeader = event.target.closest('.explanation-block-header .hint-button, .explanation-block-header .toggle-icon-button');
         if (!buttonInHeader) { return; }
    }
    const currentElement = event.target;
    const currentHeader = currentElement.closest('.explanation-block-header');
    if (!currentHeader) return;

    const visibleContainer = this.isDetailedView ? this.detailedExplanationEl : this.briefExplanationEl;
    if (!visibleContainer) return;
    const headers = Array.from(visibleContainer.querySelectorAll('.explanation-block .explanation-block-header'));
    if (headers.length === 0) return;
    const currentIndex = headers.indexOf(currentHeader);
    if (currentIndex === -1) return;

    let nextHeader = null;

    switch (event.key) {
        case 'ArrowDown':
        case 'ArrowUp':
            event.preventDefault(); // Prevent page scroll
            event.stopPropagation(); // *** Stop propagation for arrows ***
            const direction = event.key === 'ArrowDown' ? 1 : -1;
            const nextIndex = (currentIndex + direction + headers.length) % headers.length;
            nextHeader = headers[nextIndex];
            break;

        case 'Enter':
             if (currentElement.matches('.hint-button, .toggle-icon-button')) {
                 return; // Let default button activation happen
             }
             event.preventDefault(); // *** Prevent default (e.g., form submission if applicable) ***
             event.stopPropagation(); // *** CRITICAL: Stop Enter from bubbling to global handler ***
             console.log("DEBUG: Enter caught by CardRenderer, toggling block.");
             const blockToToggle = currentHeader.closest('.explanation-block');
             if (blockToToggle) this._toggleBlockState(blockToToggle);
             break;

        case 'h':
             if (currentElement === currentHeader) {
                 event.preventDefault();
                 event.stopPropagation(); // *** Stop propagation for H ***
                 const hintBlock = currentHeader.closest('.explanation-block');
                 if(hintBlock) this._toggleHintState(hintBlock);
             }
             break;

         case ' ':
             if (currentElement.matches('.hint-button, .toggle-icon-button')) {
                 return; // Allow default space activation for buttons
             }
             // If space on header itself, prevent scroll but let it bubble
             // so the global handler *can* flip the card.
             event.preventDefault();
             console.log("DEBUG: Space on header, preventing scroll, allowing flip.");
             return;


        default:
            return; // Let other keys bubble up
    }

    if (nextHeader) {
        this._updateKeyboardSelection(nextHeader);
        nextHeader.focus({ preventScroll: true }); // Move focus smoothly
    }
}

      // --- NEW: Explanation Block Toggle Handler ---
      _handleExplanationToggle(event) {
        const header = event.target.closest('.explanation-block-header');
        // Ensure the click is on a header, but NOT the old detail toggle button if it happens to be inside
        if (!header || event.target.closest('.toggle-detail-btn')) {
            return;
        }

        const block = header.closest('.explanation-block');
        if (!block) return;

        console.log("DEBUG: Explanation block header clicked.");

        // Toggle the expanded state
        const isExpanded = block.classList.toggle('is-expanded');

        // Update ARIA attribute
        header.setAttribute('aria-expanded', isExpanded);

        // Optional: Adjust max-height using scrollHeight for perfect animation (might be needed if CSS max-height is insufficient)
        // const content = block.querySelector('.explanation-block-content');
        // if (content) {
        //     if (isExpanded) {
        //         content.style.maxHeight = content.scrollHeight + 'px';
        //         // Optional: Reset after transition if using scrollHeight
        //         // content.addEventListener('transitionend', () => {
        //         //     if (block.classList.contains('is-expanded')) {
        //         //         content.style.maxHeight = 'none'; // Allow natural height
        //         //     }
        //         // }, { once: true });
        //     } else {
        //         // Temporarily set max-height to scrollHeight before collapsing for smooth transition
        //         // content.style.maxHeight = content.scrollHeight + 'px';
        //         // requestAnimationFrame(() => { // Allow repaint
        //         //    content.style.maxHeight = '0';
        //         // });
        //         content.style.maxHeight = '0'; // Simpler approach relying on CSS transition
        //     }
        // }
    }

    // Updated logic for detail view state
    _updateDetailToggleView() {
        console.log(`DEBUG: CardRenderer._updateDetailToggleView. isDetailedView: ${this.isDetailedView}`);
        // Check elements needed for this update
        if (!this.cardSceneEl || !this.toggleButton) {
            console.warn("Cannot update detail toggle view - missing scene or button element.");
            return;
        }

        this.cardSceneEl.classList.toggle('show-detailed', this.isDetailedView);
        this.toggleButton.innerHTML = this.isDetailedView
             ? 'Show Brief <span class="keyboard-hint">(D)</span>'
             : 'Show Detailed <span class="keyboard-hint">(D)</span>';
        // *** CRITICAL: Initialize keyboard selection AFTER updating view ***
        this._initializeKeyboardSelection();
   }

   // Optional: Add a cleanup method if CardRenderer instances are destroyed
   destroy() {
    if (this.toggleButton) {
        this.toggleButton.removeEventListener('click', this._handleToggleClickBound);
    }
    this.cardBackContentWrapper?.querySelectorAll('.explanation-block-hint-preview').forEach(preview => {
        while (preview.firstChild) { // Clear content safely
            preview.removeChild(preview.firstChild);
        }
   });
    this.currentKeyboardSelectedHeader = null;
    console.log("CardRenderer destroyed.");
   }
}