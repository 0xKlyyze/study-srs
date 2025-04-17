// --- File: js/utils/renderLatexTest.js ---

/**
 * Production-ready LaTeX processor that handles fenced code blocks, structural environments,
 * and math expressions using KaTeX. Processes \textbf{} blocks into styled HTML structures
 * and converts LaTeX environments into semantic HTML.
 *
 * @param {string} rawText - The raw input text.
 * @param {HTMLElement} outputElement - The container element to render the final HTML into.
 * @param {object} [katexOptions] - Optional KaTeX auto-render options for the final pass.
 * @returns {{finalHTML: string}} - Object containing the final innerHTML.
 */
export function processAndRenderLatex(rawText, outputElement, katexOptions = null) {
    // --- Essential Checks ---
    if (typeof katex !== 'object' || typeof katex.renderToString !== 'function') {
        console.error("Global 'katex' object or 'katex.renderToString' not found.");
        outputElement.innerHTML = `<span style="color: red;">Error: KaTeX library missing renderToString.</span>`;
        return { finalHTML: outputElement.innerHTML };
    }
    
    if (typeof window.renderMathInElement !== 'function') {
        console.warn("Global 'renderMathInElement' function not found. Final pass for delimited math might fail.");
    }
    
    if (!outputElement) {
        console.error("Output element not provided.");
        return { finalHTML: '' };
    }

    let inputText = rawText || '';
    const finalOutputSegments = [];
    let finalRenderPassNeeded = false;

    // --- Regex Definitions ---
    const fenceDelimiterRegexGlobal = /(```\s*latex\s*\n?([\s\S]*?)\n?\s*```)/gi;
    const v3_blockRegex = /\\textbf\{([^}]+)\}(?:\s*:\s*)?([\s\S]*?)(?=\\textbf\{[^}]+\}(?:\s*:\s*)?|$)/gi;
    const v3_looseTextbfCheckRegex = /\\textbf\{[^}]+\}/i;
    const delimiterCheckRegex = /(\${1,2}|\\\[|\\\()/;

    // --- Environment Definitions ---
    const LIST_ENVIRONMENTS = ['enumerate', 'itemize'];
    const STRUCTURAL_ENVIRONMENTS = ['theorem', 'proposition', 'definition', 'lemma', 'corollary', 'remark', 'proof', 'demonstration', 'theoreme', 'lemme', 'corollaire', 'remarque', 'preuve', 'example', 'explanation', 'exemple', 'explication'];
    const STRUCTURAL_ENV_MAP = {
        theorem: 'theoreme', theoreme: 'theoreme',
        proposition: 'proposition',
        definition: 'definition',
        lemma: 'lemme', lemme: 'lemme',
        corollary: 'corollaire', corollaire: 'corollaire',
        remark: 'remarque', remarque: 'remarque',
        proof: 'preuve', preuve: 'preuve',
        demonstration: 'preuve', 
        example: 'exemple', exemple: 'exemple',
        explanation: 'explication', explication: 'explication'
    };

    // Precompile structural env regex for efficiency
    const structuralEnvBlockRegex = new RegExp(
        `\\\\begin\\{(${STRUCTURAL_ENVIRONMENTS.join('|')})\\}` +
        `(?:\\s*\\[([^\\]]*)\\])?` +
        `([\\s\\S]*?)` +
        `\\\\end\\{\\1\\}`,
        'gi'
    );

    // --- Step 1: Find fences ---
    const matches = [...inputText.matchAll(fenceDelimiterRegexGlobal)];
    let lastIndex = 0;

    // --- Step 2: Process Segments ---
    matches.forEach((match, i) => {
        const fenceStartIndex = match.index;
        const fenceEndIndex = fenceStartIndex + match[0].length;
        const fencedContentRaw = match[2] || '';

        // --- Process Text BEFORE ---
        if (fenceStartIndex > lastIndex) {
            let outsideText = inputText.substring(lastIndex, fenceStartIndex);
            if (outsideText.trim()) {
                processOutsideTextSegment(outsideText, finalOutputSegments);
                finalRenderPassNeeded = true;
            }
        }

        // --- Process FENCED Content ---
        processFencedContentSegment(fencedContentRaw, finalOutputSegments);

        lastIndex = fenceEndIndex;
    });

    // --- Process Remaining Text AFTER ---
    if (lastIndex < inputText.length) {
        let remainingText = inputText.substring(lastIndex);
        if (remainingText.trim()) {
            processOutsideTextSegment(remainingText, finalOutputSegments);
            finalRenderPassNeeded = true;
        }
    }

    // --- Helper: processOutsideTextSegment ---
    function processOutsideTextSegment(text, outputSegments) {
        let processedText = text.trim();
        if (processedText.length === 0) return;

        // 1. Preprocess Structural Envs
        processedText = preprocessStructuralEnvs(processedText);
        
        // 2. Preprocess Lists
        processedText = preprocessListEnvironments(processedText);
        
        // 3. Markdown removal (simple)
        processedText = processedText.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');
        
        // 4. Segment remaining text using V3 \textbf logic
        segmentUsingTextbf(processedText, outputSegments, "Outer");
    }

    // --- Helper: Preprocess List Environments ---
    function preprocessListEnvironments(text) {
        const listBlockRegex = /\\begin\{(enumerate|itemize)\}([\s\S]*?)\\end\{\1\}/gi;
        let iteration = 0; // Safety break

        return text.replace(listBlockRegex, (match, envName, innerContent) => {
            if (iteration++ > 10) return match;
            
            const listTag = (envName === 'enumerate') ? 'ol' : 'ul';
            const listClass = `latex-${envName}`;

            const items = [];
            const itemRegex = /\\item/g;
            let itemMatch;
            let lastItemIndex = 0;
            let foundAnyItem = false;

            while ((itemMatch = itemRegex.exec(innerContent)) !== null) {
                foundAnyItem = true;
                let segment = innerContent.substring(lastItemIndex, itemMatch.index);
                if (lastItemIndex !== 0) {
                    items.push(segment.trim());
                }
                lastItemIndex = itemMatch.index + itemMatch[0].length;
            }
            
            let lastSegment = innerContent.substring(lastItemIndex).trim();
            if (foundAnyItem || lastSegment) {
                items.push(lastSegment);
            }

            if (items.length === 0) {
                return `<${listTag} class="${listClass}"></${listTag}>`;
            }

            let listItemsHtml = items.map(itemContent => 
                `<li>${itemContent}</li>`
            ).join('\n');

            return `<${listTag} class="${listClass}">\n${listItemsHtml}\n</${listTag}>`;
        });
    }

    // --- Helper: Preprocess Structural Environments ---
    function preprocessStructuralEnvs(text) {
        let iteration = 0; // Safety break
        
        // Reset regex state just in case
        structuralEnvBlockRegex.lastIndex = 0;
        
        const processedText = text.replace(structuralEnvBlockRegex, (match, envName, optionalTitle, innerContent) => {
            if (iteration++ > 20) return match;
            
            const envNameLower = envName.toLowerCase();
            const slug = STRUCTURAL_ENV_MAP[envNameLower] || envNameLower;
            const title = (optionalTitle || '').trim() || (envName.charAt(0).toUpperCase() + envName.slice(1));
            
            const contentDiv = `<div class="explanation-block-content">${(innerContent || '').trim()}</div>`;
            const headerDiv = `<div class="explanation-block-header">${title}</div>`;
            const blockDiv = `<div class="explanation-block type-${slug}" data-env-name="${envName}">\n${headerDiv}\n${contentDiv}\n</div>`;
            
            return blockDiv;
        });
        
        // Reset regex state after use
        structuralEnvBlockRegex.lastIndex = 0;
        
        return processedText;
    }

    // --- Helper: processFencedContentSegment ---
    function processFencedContentSegment(fencedContentRaw, outputSegments) {
        let fencedContentTrimmed = fencedContentRaw.trim();
        if (fencedContentTrimmed.length === 0) return;
        
        const originalContent = fencedContentTrimmed;

        // Apply Preprocessing Steps
        let processedContent = fencedContentTrimmed;
        processedContent = preprocessStructuralEnvs(processedContent);
        processedContent = preprocessListEnvironments(processedContent);

        const wasPreprocessed = (processedContent !== originalContent);
        
        // Check characteristics of the preprocessed content
        const containsDelimiters = delimiterCheckRegex.test(processedContent);
        const containsTextbf = v3_looseTextbfCheckRegex.test(processedContent);

        if (containsDelimiters || containsTextbf || wasPreprocessed) {
            // Content needs segmentation and final pass
            finalRenderPassNeeded = true;
            segmentUsingTextbf(processedContent, outputSegments, "Fenced-Internal");
        } else {
            // Pure LaTeX - Direct render
            try {
                const renderOptions = { 
                    displayMode: true, 
                    throwOnError: false, 
                    errorColor: '#FF5555', 
                    trust: true, 
                    fleqn: true 
                };
                
                const renderedHtml = katex.renderToString(originalContent, renderOptions);
                outputSegments.push(`<div class="explanation-block type-latex-block">${renderedHtml}</div>`);
            } catch (error) {
                console.error("KaTeX rendering error:", error);
                outputSegments.push(`<div class="explanation-block type-latex-block katex-error">Error rendering LaTeX</div>`);
            }
        }
    }

    // --- Helper: segmentUsingTextbf ---
    function segmentUsingTextbf(textToSegment, outputSegments, context) {
        v3_blockRegex.lastIndex = 0;
        let localLastIndex = 0;
        let blockMatch;
        let foundBlocks = false;
        const currentSegmentOutputs = [];
        let accumulatedPlainText = "";

        while ((blockMatch = v3_blockRegex.exec(textToSegment)) !== null) {
            // Text BEFORE block
            let textBefore = textToSegment.substring(localLastIndex, blockMatch.index).trim();
            if (textBefore) {
                accumulatedPlainText += (accumulatedPlainText ? " " : "") + textBefore;
            }

            // Process \textbf Block
            const blockTypeRaw = blockMatch[1].trim();
            let blockContent = blockMatch[2].trim();

            // Lowercase Heuristic
            if (blockTypeRaw && blockTypeRaw[0] === blockTypeRaw[0].toLowerCase() && blockTypeRaw[0] !== blockTypeRaw[0].toUpperCase()) {
                // Starts with lowercase -> Treat as plain text, append to accumulator
                accumulatedPlainText += (accumulatedPlainText ? " " : "") + blockTypeRaw + (blockContent ? (blockTypeRaw.endsWith(':') ? " " : ": ") + blockContent : "");
            } else {
                // --- Treat ALL non-lowercase as structural blocks (V16 change) ---
                // Finalize any accumulated plain text FIRST
                if (accumulatedPlainText) {
                    currentSegmentOutputs.push(`<div class="explanation-block type-text">${accumulatedPlainText}</div>`);
                    accumulatedPlainText = ""; // Reset accumulator
                }

                // Determine Slug (same logic as before)
                let blockTypeSlug = 'other'; const blockTypeLower = blockTypeRaw.toLowerCase();
                if (blockTypeLower.includes('théorème') || blockTypeLower.includes('theorem')) blockTypeSlug = 'theoreme'; else if (blockTypeLower.includes('proposition')) blockTypeSlug = 'proposition'; else if (blockTypeLower.includes('définition') || blockTypeLower.includes('definition')) blockTypeSlug = 'definition'; else if (blockTypeLower.includes('exemple') || blockTypeLower.includes('example')) blockTypeSlug = 'exemple'; else if (blockTypeLower.includes('explication') || blockTypeLower.includes('explanation')) blockTypeSlug = 'explication'; else if (blockTypeLower.includes('lemme') || blockTypeLower.includes('lemma')) blockTypeSlug = 'lemme'; else if (blockTypeLower.includes('corollaire') || blockTypeLower.includes('corollary')) blockTypeSlug = 'corollaire'; else if (blockTypeLower.includes('remarque') || blockTypeLower.includes('remark')) blockTypeSlug = 'remarque'; else if (blockTypeLower.includes('preuve') || blockTypeLower.includes('proof') || blockTypeLower.includes('demonstration')) blockTypeSlug = 'preuve';

                // Create the structured block HTML (this now includes 'type-other')
                currentSegmentOutputs.push(`<div class="explanation-block type-${blockTypeSlug}" data-block-type="${blockTypeRaw}">`);
                currentSegmentOutputs.push(`  <div class="explanation-block-header">${blockTypeRaw.replace(/:$/, '').trim()}</div>`);
                currentSegmentOutputs.push(`  <div class="explanation-block-content">`);
                currentSegmentOutputs.push(blockContent); // Add content
                currentSegmentOutputs.push(`  </div>`);
                currentSegmentOutputs.push(`</div>`);
            }

            localLastIndex = v3_blockRegex.lastIndex;
        }
        
        v3_blockRegex.lastIndex = 0; // Reset

        // Remaining Text AFTER Last Block
        let remainingTextAfter = textToSegment.substring(localLastIndex).trim();
        if (remainingTextAfter) {
            accumulatedPlainText += (accumulatedPlainText ? " " : "") + remainingTextAfter;
        }

        // Finalize any remaining accumulated text
        if (accumulatedPlainText) {
            currentSegmentOutputs.push(`<div class="explanation-block type-text">${accumulatedPlainText}</div>`);
        }

        // Handle cases where nothing was output
        if (currentSegmentOutputs.length === 0 && textToSegment.trim()) {
            currentSegmentOutputs.push(`<div class="explanation-block type-text">${textToSegment}</div>`);
        }

        outputSegments.push(...currentSegmentOutputs);
    }

    // --- Step 3: Set HTML and Run Final Pass ---
    const intermediateHTML = finalOutputSegments.join('\n');
    outputElement.innerHTML = intermediateHTML;

    if (finalRenderPassNeeded && intermediateHTML.trim() !== '') {
        if (typeof window.renderMathInElement === 'function') {
            const defaultFinalOptions = {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false,
                errorColor: '#FF5555',
                trust: true
            };
            
            const effectiveFinalOptions = katexOptions ? 
                { ...defaultFinalOptions, ...katexOptions } : defaultFinalOptions;
                
            try {
                window.renderMathInElement(outputElement, effectiveFinalOptions);
            } catch(error) {
                console.error("Error in final KaTeX rendering pass:", error);
            }
        } else {
            console.warn("Final pass needed but window.renderMathInElement not found");
        }
    }

    return { finalHTML: outputElement.innerHTML };
}