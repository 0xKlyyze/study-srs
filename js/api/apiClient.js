// --- File: js/api/apiClient.js ---
// Refactored to use a class structure for better context management ('this')

class ApiClient {
    constructor() {
        // Base URL for the API
        // Use environment variable or configuration for production
        this.baseURL = "https://flashcard-api-957892315214.europe-west9.run.app/api" ; // No fallback needed if configured correctly // Example using Vue-like env var
        /* this.baseURL = "http://localhost:3000/api"; */
        console.log("ApiClient initialized with baseURL:", this.baseURL);
    }

    /**
     * Private helper method for making requests to the API.
     * Handles common tasks like setting headers, checking response status,
     * and parsing JSON data. Includes basic error handling.
     * @param {string} endpoint - The API endpoint path (e.g., '/cards')
     * @param {object} [options={}] - Options for the fetch request (method, headers, body, etc.)
     * @returns {Promise<object>} - A promise that resolves with the JSON response body or null for 204.
     * @throws {Error} - Throws an error if the network request fails or the API returns an error status (4xx or 5xx).
     * @private
     */
    async _fetchJson(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        // Keep logging minimal unless actively debugging
        // console.log(`DEBUG: [_fetchJson] Preparing request for endpoint: ${endpoint}`);

        const method = options.method || 'GET';
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };
        const body = (options.body && method !== 'GET' && method !== 'HEAD')
            ? JSON.stringify(options.body)
            : undefined;
        const config = { method, headers, body };

        console.log(`DEBUG: [_fetchJson] Fetching ${config.method} ${url}`);

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                let errorDetails = null;
                try {
                    // Try to parse error details from JSON response
                    errorDetails = await response.json();
                    errorMessage = errorDetails.message || errorDetails.error || errorMessage;
                } catch (e) { /* Ignore if error response isn't JSON */ }
                console.error(`API request failed for ${endpoint}: ${errorMessage}`, errorDetails || '');
                throw new Error(errorMessage);
            }

            // Handle successful responses with no content (e.g., DELETE)
            if (response.status === 204) {
                console.log(`DEBUG: [_fetchJson] Received 204 No Content for ${endpoint}. Returning null.`);
                return null;
            }

            // Handle JSON responses
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                 try {
                    const data = await response.json();
                    // console.log(`DEBUG: [_fetchJson] Received JSON data for ${endpoint}:`, data); // DEBUG
                    return data;
                 } catch (parseError) {
                    console.error(`Error parsing JSON response for ${endpoint}:`, parseError);
                    throw new Error(`Invalid JSON received from server for ${endpoint}.`);
                 }
            } else {
                 // Handle non-JSON successful responses if necessary (e.g., text)
                 // For now, assume successful non-JSON means no relevant data to return client-side
                console.log(`DEBUG: [_fetchJson] Received non-JSON response for ${endpoint} (Status: ${response.status}, Content-Type: ${contentType}). Returning null.`);
                return null;
            }
        } catch (error) {
            console.error(`Error during fetch operation for ${endpoint}:`, error);
            // Re-throw specific API or parsing errors, wrap others as network errors
            if (error instanceof Error && (error.message.startsWith('API Error:') || error.message.startsWith('Invalid JSON'))) {
                throw error;
            } else {
                 throw new Error(`Network error or failed to fetch resource from ${endpoint}. Details: ${error.message}`);
            }
        }
    }

    // --- Public API Methods ---

    async deleteCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required for deletion."));
        const endpoint = `/cards/${cardId}`;
        console.log(`DEBUG: [deleteCard] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'DELETE' });
    }

    /**
     * Retrieves the complete settings configuration for a specific material.
     * Calls GET /api/settings/:material
     * @param {string} material - The name of the material (e.g., "Mathematics").
     * @returns {Promise<object>} - Promise resolving to the full settings object.
     * @throws {Error} If material is missing or fetch operation fails.
     */
    async getMaterialSettings(material) {
        if (!material) {
            return Promise.reject(new Error("Material is required to get settings."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/settings/${encodedMaterial}`;
        console.log(`DEBUG: [getMaterialSettings] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

        /**
     * Sets the default sorting preference for chapters within a specific material.
     * Calls PUT /api/settings/:material/default-sort
     * @param {string} material - The material name.
     * @param {string} field - The field to sort by (e.g., 'name', 'createdAt', 'stats.mastery').
     * @param {string} order - Sort order ('asc' or 'desc').
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated settings).
     */
        async setDefaultChapterSort(material, field, order) {
            if (!material) return Promise.reject(new Error("Material is required."));
            if (!field) return Promise.reject(new Error("Sort field is required."));
            const validOrders = ['asc', 'desc'];
            const sortOrder = validOrders.includes(order?.toLowerCase()) ? order.toLowerCase() : 'asc'; // Default to 'asc' if invalid
    
            const encodedMaterial = encodeURIComponent(material);
            const endpoint = `/settings/${encodedMaterial}/default-sort`;
            console.log(`DEBUG: [setDefaultChapterSort] Calling PUT ${endpoint}`);
            return this._fetchJson(endpoint, {
                method: 'PUT',
                body: { field: field, order: sortOrder },
            });
        }

    /**
     * Updates specific settings fields for a given material.
     * Calls PATCH /api/settings/:material
     * @param {string} material - The name of the material.
     * @param {object} settingsUpdate - Object containing only the fields to update.
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated settings).
     * @throws {Error} If parameters are invalid or fetch fails.
     */
    async updateMaterialSettings(material, settingsUpdate) {
        if (!material) {
            return Promise.reject(new Error("Material is required to update settings."));
        }
        if (!settingsUpdate || Object.keys(settingsUpdate).length === 0) {
            return Promise.reject(new Error("Settings update data cannot be empty."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/settings/${encodedMaterial}`;
        console.log(`DEBUG: [updateMaterialSettings] Calling PATCH ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PATCH',
            body: settingsUpdate,
        });
    }

    // --- Material & Settings Methods ---
    async getMaterials() {
        const endpoint = '/materials';
        console.log(`DEBUG: [getMaterials] Calling GET ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getCard(cardId) {
        if (!cardId) {
            return Promise.reject(new Error("Card ID is required to get card details."));
        }
        const endpoint = `/cards/${cardId}`;
        console.log(`DEBUG: [getCard] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getCards(filters = {}) {
        const validFilters = Object.fromEntries(
             Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined)
        );
        const queryParams = new URLSearchParams(validFilters).toString();
        const endpoint = `/cards${queryParams ? '?' + queryParams : ''}`;
        console.log(`DEBUG: [getCards] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getCardPreviews(filters) {
        if (!filters || !filters.material || !filters.chapter) {
           return Promise.reject(new Error("Material and chapter are required for card previews."));
        }
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/cards/previews?${queryParams}`;
        console.log(`DEBUG: [getCardPreviews] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    /**
     * Create a new flashcard.
     * Calls POST /api/cards
     * @param {object} cardData - Data for the new flashcard (material, chapter, name, briefExplanation, detailedExplanation).
     * @returns {Promise<object>} - Promise resolving to the created flashcard object.
     */
    async createCard(cardData) {
        // *** PATH UPDATED ***
        const endpoint = '/cards';
        console.log(`DEBUG: [createCard] Calling POST ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'POST',
            body: cardData,
        });
    }

    async starCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        const endpoint = `/cards/${cardId}/star`;
        console.log(`DEBUG: [starCard] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'PUT' });
    }

    async unstarCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        const endpoint = `/cards/${cardId}/unstar`;
        console.log(`DEBUG: [unstarCard] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'PUT' });
    }

    async buryCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        const endpoint = `/cards/${cardId}/bury`;
        console.log(`DEBUG: [buryCard] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'PUT' });
    }

    async unburyCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        const endpoint = `/cards/${cardId}/unbury`;
        console.log(`DEBUG: [unburyCard] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'PUT' });
    }

    /**
     * Submit a review for a flashcard.
     * Calls PUT /api/cards/:id/review
     * @param {string} cardId - The ID of the flashcard being reviewed.
     * @param {number} quality - The review quality (0-3).
     * @returns {Promise<object>} - Promise resolving to the review result (next review time, etc.).
     */
    async submitReview(cardId, quality) {
         if (typeof cardId === 'undefined' || cardId === null) return Promise.reject(new Error("Card ID is required."));
         if (typeof quality !== 'number' || quality < 0 || quality > 3) return Promise.reject(new Error("Invalid quality rating (0-3)."));
        // *** PATH UPDATED ***
        const endpoint = `/cards/${cardId}/review`;
        console.log(`DEBUG: [submitReview] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { quality },
        });
    }

    async getDailyAnalytics(days = 7) {
        const endpoint = `/analytics/daily?days=${encodeURIComponent(days)}`;
        console.log(`DEBUG: [getDailyAnalytics] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getMasteryAnalytics() {
        const endpoint = '/analytics/mastery';
        console.log(`DEBUG: [getMasteryAnalytics] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getChapterDifficultyAnalytics() {
        const endpoint = '/analytics/chapters';
        console.log(`DEBUG: [getChapterDifficultyAnalytics] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

        // --- Chapter Methods (Modified & New) ---


    /**
     * Get chapters for a given material, with optional sorting and filtering.
     * Calls GET /api/materials/:material/chapters
     * @param {string} material - The material name.
     * @param {object} [options={}] - Optional object for sorting and filtering.
     * @param {string} [options.sortBy] - Field to sort by (e.g., 'name', 'createdAt', 'stats.mastery'). Server defaults if omitted.
     * @param {string} [options.order] - Sort order ('asc' or 'desc'). Server defaults if omitted.
     * @param {string} [options.groupId] - Filter by group ID ('none' for ungrouped, or a specific group ID).
     * @param {string} [options.tag] - Filter chapters containing this tag.
     * @param {boolean} [options.pinned] - Filter by pinned status (true/false).
     * @param {boolean} [options.suspended] - Filter by suspended status (true/false). Server defaults if omitted.
     * @returns {Promise<Array<object>>} - Promise resolving to an array of chapter document objects.
     */
    async getChapters(material, options = {}) {
        if (!material) return Promise.reject(new Error("Material is required to get chapters."));

        const encodedMaterial = encodeURIComponent(material);
        const params = new URLSearchParams();

        // Map client options to server query params
        if (options.sortBy) params.append('sort_by', options.sortBy);
        if (options.order) params.append('order', options.order);
        if (options.groupId) params.append('groupId', options.groupId); // Including 'none' or specific ID
        if (options.tag) params.append('tag', options.tag);
        if (typeof options.pinned === 'boolean') params.append('pinned', options.pinned.toString());
        if (typeof options.suspended === 'boolean') params.append('suspended', options.suspended.toString());

        const queryString = params.toString();
        const endpoint = `/materials/${encodedMaterial}/chapters${queryString ? '?' + queryString : ''}`;
        console.log(`DEBUG: [getChapters] Calling GET ${endpoint}`);
        return this._fetchJson(endpoint); // Expects an array of chapter objects
    }
    // getChapterMastery (Existing - Consider deprecating if getChapters provides all needed data)
    async getChapterMastery(material) {
        // This might now be redundant if getChapters returns the 'stats' object including mastery.
        // Decision: Keep for now, but prefer using getChapters in new features.
        if (!material) return Promise.reject(new Error("Material is required for chapter mastery."));
        console.warn("DEBUG: [getChapterMastery] Consider using getChapters which includes stats.");
        // Assuming the old endpoint still exists or is handled by the /chapters endpoint without stats filter
        const endpoint = `/materials/${encodeURIComponent(material)}/chapters`; // Example: using the main endpoint
        // Or if /chapter-mastery still exists:
        // const endpoint = `/chapter-mastery?material=${encodeURIComponent(material)}`;
        console.log(`DEBUG: [getChapterMastery] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

    async getChapterStats(material, chapter) {
         if (!material || !chapter) return Promise.reject(new Error("Material and chapter are required for chapter stats."));
        const endpoint = `/chapter-stats?material=${encodeURIComponent(material)}&chapter=${encodeURIComponent(chapter)}`;
        console.log(`DEBUG: [getChapterStats] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
    }

        /**
     * Retrieves study statistics for the last 30 days.
     * Calls GET /api/study-stats/last-30-days
     * @returns {Promise<object>} - Promise resolving to an object mapping 'YYYY-MM-DD' dates to study counts.
     * @throws {Error} If the fetch operation fails.
     */
        async getRecentStudyStats() {
            const endpoint = '/study-stats/last-30-days';
            console.log(`DEBUG: [getRecentStudyStats] Calling endpoint: ${endpoint}`);
            // Use the existing _fetchJson helper
            return this._fetchJson(endpoint);
        }

    /**
     * Retrieves cards specifically for a focused study session based on material and chapters.
     * Calls GET /api/study-session
     * @param {string} material - The name of the material.
     * @param {string | null | undefined} chapters - Comma-separated list of chapter names, or null/undefined if none.
     * @param {number | null | undefined} [limit] - Optional maximum number of cards to return.
     * @returns {Promise<Array<object>>} - Promise resolving to an array of card objects for the session.
     * @throws {Error} If material is missing or fetch fails.
     */
    async getStudySessionCards(material, chapters, limit) { // <-- Add limit parameter
        if (!material) {
            return Promise.reject(new Error("Material is required for a study session."));
        }
        const encodedMaterial = encodeURIComponent(material);
        let endpoint = `/study-session?material=${encodedMaterial}`;

        if (chapters) { // Only add chapters param if provided and not empty
            const encodedChapters = encodeURIComponent(chapters);
            endpoint += `&chapters=${encodedChapters}`;
        }

        // --- >>> Add limit parameter if provided and valid <<< ---
        if (typeof limit === 'number' && Number.isInteger(limit) && limit > 0) {
            endpoint += `&limit=${limit}`;
            console.log(`DEBUG: [getStudySessionCards] Applying limit: ${limit}`);
        } else if (limit !== undefined && limit !== null) {
            // Log if a limit was provided but invalid, but don't add it to the query
            console.warn(`DEBUG: [getStudySessionCards] Invalid or non-positive limit provided (${limit}), omitting from request.`);
        }
        // --- >>> End of limit parameter addition <<< ---

        console.log(`DEBUG: [getStudySessionCards] calling: ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'GET' });
    }

       // --- >>> NEW METHOD <<< ---
    /**
     * Checks the due status of a list of provided card IDs.
     * Calls POST /api/cards/check-due
     * @param {object} payload - The request payload.
     * @param {string[]} payload.cardIds - An array of card IDs to check.
     * @returns {Promise<object>} - Promise resolving to an object like { dueCardIds: [...] }.
     * @throws {Error} If payload is invalid or fetch fails.
     */
    async checkDueStatus(payload) {
        // --- Basic Client-Side Validation ---
        if (!payload || typeof payload !== 'object') {
            return Promise.reject(new Error("Invalid payload: Must be an object."));
        }
        if (!Array.isArray(payload.cardIds)) {
            return Promise.reject(new Error("Invalid payload: 'cardIds' must be an array."));
        }
        // Optional: Check if array is empty? API might handle it, but avoids call.
        // if (payload.cardIds.length === 0) {
        //     console.log("DEBUG: [checkDueStatus] cardIds array is empty, returning empty result.");
        //     return Promise.resolve({ dueCardIds: [] });
        // }
        // --- End Validation ---

        const endpoint = '/cards/check-due';
        console.log(`DEBUG: [checkDueStatus] Calling POST ${endpoint}`);

        // Use _fetchJson to handle the POST request
        return this._fetchJson(endpoint, {
            method: 'POST',
            body: payload, // Send the payload directly, _fetchJson will stringify
        });
    }


    /**
     * Simple method to get chapters without sorting/filtering (calls getChapters internally).
     * Kept for potential backward compatibility or simpler use cases.
     * @param {string} material - The material name.
     * @returns {Promise<Array<object>>} - Promise resolving to an array of chapter objects.
     */
    async getChaptersForMaterial(material) {
        console.log(`DEBUG: [getChaptersForMaterial] calling via getChapters for material: ${material}`);
        return this.getChapters(material); // Call the more general version with default options
    }

    async getDueTimeline(material, chapter = null, granularity = 'daily') {
        if (!material) {
            return Promise.reject(new Error("Material is required for due timeline."));
        }
        const params = new URLSearchParams({ material: material, granularity: granularity });
        if (chapter) { params.append('chapter', chapter); }
        const endpoint = `/due-timeline?${params.toString()}`;
        console.log(`DEBUG: [getDueTimeline] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
   }

   async renameChapter(material, currentChapterName, newChapterName) {
        if (!material || !currentChapterName || !newChapterName) {
            return Promise.reject(new Error("Material, current chapter name, and new chapter name are required for renaming."));
        }
        if (currentChapterName === newChapterName) {
            return Promise.reject(new Error("New chapter name cannot be the same as the current name."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/materials/${encodedMaterial}/chapters/rename`;
        console.log(`DEBUG: [renameChapter] Calling POST ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'POST',
            body: { currentChapterName, newChapterName },
        });
    }

        /**
     * Renames a material.
     * Calls POST /api/materials/rename
     * @param {string} currentMaterialName - The existing name of the material.
     * @param {string} newMaterialName - The desired new name.
     * @returns {Promise<object>} - Promise resolving to the server response (e.g., success message).
     * @throws {Error} If parameters are invalid or fetch fails.
     */
        async renameMaterial(currentMaterialName, newMaterialName) {
            if (!currentMaterialName || !newMaterialName) {
                return Promise.reject(new Error("Current and new material names are required for renaming."));
            }
            if (currentMaterialName === newMaterialName) {
                 // Optional: Handle this client-side earlier, but good to have safe API call
                return Promise.resolve({ message: "New name is the same as the current name. No changes made." });
                // Or reject: return Promise.reject(new Error("New name cannot be the same as the current name."));
            }
            const endpoint = `/materials/rename`; // Ensure this matches your API route exactly
            console.log(`DEBUG: [renameMaterial] Calling POST ${endpoint}`);
            return this._fetchJson(endpoint, {
                method: 'POST',
                body: { currentMaterialName, newMaterialName },
            });
        }

    async updateCard(cardId, updateData) {
        if (!cardId) {
            return Promise.reject(new Error("Card ID is required for updating."));
        }
        if (!updateData || Object.keys(updateData).length === 0) {
            return Promise.reject(new Error("Update data cannot be empty."));
        }
        const endpoint = `/cards/${cardId}`;
        console.log(`DEBUG: [updateCard] Calling PATCH ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PATCH',
            body: updateData,
        });
    }

    async deleteChapter(material, chapterName) {
        if (!material || !chapterName) {
            return Promise.reject(new Error("Material and chapter name are required for deletion."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const encodedChapterName = encodeURIComponent(chapterName);
        const endpoint = `/materials/${encodedMaterial}/chapters/${encodedChapterName}`;
        console.log(`DEBUG: [deleteChapter] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'DELETE',
        });
    }

    // Add this method inside the ApiClient class in js/api/apiClient.js
    async getSrsThresholds() {
    const endpoint = '/settings/srs-thresholds'; // Adjust endpoint if different
    console.log(`DEBUG: [getSrsThresholds] Calling endpoint: ${endpoint}`);
    return this._fetchJson(endpoint);
    }

    // Add these methods inside the ApiClient class in js/api/apiClient.js

    /**
     * Updates the daily new card limit for a specific material.
     * Calls PUT /api/settings/:material/daily-limit
     * @param {string} material - The name of the material.
     * @param {number} limit - The new daily limit (non-negative integer).
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated settings).
     * @throws {Error} If parameters are invalid or fetch fails.
     */
    async updateDailyLimit(material, limit) {
        if (!material) {
            return Promise.reject(new Error("Material is required to update daily limit."));
        }
        if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 0) {
            return Promise.reject(new Error("Invalid limit value. Must be a non-negative integer."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/settings/${encodedMaterial}/daily-limit`;
        console.log(`DEBUG: [updateDailyLimit] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { limit }, // Send { "limit": value }
        });
    }

    /**
     * Updates the entire SRS thresholds configuration for a specific material.
     * Calls PUT /api/settings/:material/srs-thresholds
     * @param {string} material - The name of the material.
     * @param {object} thresholds - The complete SRS thresholds object ({ learningReps, masteredEase, masteredReps, criticalEase }).
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated settings).
     * @throws {Error} If parameters are invalid or fetch fails.
     */
    async updateSrsThresholds(material, thresholds) {
        if (!material) {
            return Promise.reject(new Error("Material is required to update SRS thresholds."));
        }
        // Basic validation on client - server does more thorough validation
        if (typeof thresholds !== 'object' || thresholds === null ||
            typeof thresholds.learningReps !== 'number' ||
            typeof thresholds.masteredEase !== 'number' ||
            typeof thresholds.masteredReps !== 'number' ||
            typeof thresholds.criticalEase !== 'number') {
            return Promise.reject(new Error("Invalid or incomplete thresholds object provided."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/settings/${encodedMaterial}/srs-thresholds`;
        console.log(`DEBUG: [updateSrsThresholds] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: thresholds, // Send the full object
        });
    }

    /**
     * Updates the entire SRS algorithm parameters configuration for a specific material.
     * Calls PUT /api/settings/:material/srs-algorithm-params
     * @param {string} material - The name of the material.
     * @param {object} algoParams - The complete SRS algorithm parameters object.
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated settings).
     * @throws {Error} If parameters are invalid or fetch fails.
     */
    async updateSrsAlgorithmParams(material, algoParams) {
        if (!material) {
            return Promise.reject(new Error("Material is required to update SRS algorithm parameters."));
        }
        // Basic validation on client - server does more thorough validation
        if (typeof algoParams !== 'object' || algoParams === null || !Array.isArray(algoParams.learningStepsDays) /* Add more checks if needed */ ) {
             return Promise.reject(new Error("Invalid or incomplete algorithm parameters object provided."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/settings/${encodedMaterial}/srs-algorithm-params`;
        console.log(`DEBUG: [updateSrsAlgorithmParams] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: algoParams, // Send the full object
        });
    }

    // Add to ApiClient class
    /**
     * Fetches the combined initial data needed for the dashboard.
     * Calls GET /api/dashboard-summary
     * @param {string} [material] - Optional: Request data for a specific material instead of the default.
     * @param {string} [timelineGranularity] - Optional: 'daily' or 'hourly' for the timeline.
     * @param {number} [statsDays] - Optional: Number of days for recent study stats.
     * @returns {Promise<object>} - Promise resolving to the combined dashboard data object.
     */
   // --- Misc Methods ---
   async getDashboardSummary(material = null, timelineGranularity = null, statsDays = null) {
    // (Implementation remains the same)
    const params = new URLSearchParams();
    if (material) params.append('material', material);
    if (timelineGranularity) params.append('timelineGranularity', timelineGranularity);
    if (statsDays) params.append('statsDays', statsDays);
    const queryString = params.toString();
    const endpoint = `/dashboard-summary${queryString ? '?' + queryString : ''}`;
    console.log(`DEBUG: [getDashboardSummary] Calling GET ${endpoint}`);
    return this._fetchJson(endpoint);
}

        // --- Tag Management Methods (New) ---

    /**
     * Fetches the list of unique tags for a specific material.
     * Calls GET /api/materials/:material/tags
     * @param {string} material - The material name.
     * @returns {Promise<Array<string>>} - Promise resolving to an array of tag names.
     */
    async getMaterialTags(material) {
        if (!material) return Promise.reject(new Error("Material is required to get tags."));
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/materials/${encodedMaterial}/tags`;
        console.log(`DEBUG: [getMaterialTags] Calling GET ${endpoint}`);
        const response = await this._fetchJson(endpoint);
        // API returns { tags: ["tag1", ...] }, extract the array
        return response?.tags || [];
    }

    /**
     * Creates a new unique tag for a material if it doesn't exist.
     * Calls POST /api/materials/:material/tags
     * @param {string} material - The material name.
     * @param {string} tagName - The new tag name to create.
     * @returns {Promise<object>} - Promise resolving to the server response (e.g., { message: "...", tags: [...] }).
     */
    async createMaterialTag(material, tagName) {
        if (!material) return Promise.reject(new Error("Material is required."));
        const trimmedTagName = tagName?.trim();
        if (!trimmedTagName) return Promise.reject(new Error("tagName must be a non-empty string."));
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/materials/${encodedMaterial}/tags`;
        console.log(`DEBUG: [createMaterialTag] Calling POST ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'POST',
            body: { tagName: trimmedTagName },
        });
    }

     /**
      * Deletes a unique tag from a material's list.
      * Calls DELETE /api/materials/:material/tags/:tagName
      * @param {string} material - The material name.
      * @param {string} tagName - The tag name to delete from the list.
      * @returns {Promise<object>} - Promise resolving to the server response (e.g., { message: "...", tags: [...] }).
      */
     async deleteMaterialTag(material, tagName) {
        if (!material) return Promise.reject(new Error("Material is required."));
        if (!tagName) return Promise.reject(new Error("Tag name is required."));
        const encodedMaterial = encodeURIComponent(material);
        const encodedTagName = encodeURIComponent(tagName);
        const endpoint = `/materials/${encodedMaterial}/tags/${encodedTagName}`;
        console.log(`DEBUG: [deleteMaterialTag] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'DELETE' });
    }


     /**
     * Sets/overwrites the entire list of tags for a specific chapter document.
     * Calls PUT /api/materials/:material/chapters/:chapterId/tags (or PUT /api/chapters/:chapterId/tags if backend route changes)
     * @param {string} material - The material name (required for the current API route).
     * @param {string} chapterId - The Firestore Document ID of the chapter.
     * @param {Array<string>} tagsArray - The complete array of tags to set.
     * @returns {Promise<object>} - Promise resolving to the server response.
     */
     async setChapterTags(material, chapterId, tagsArray) {
        if (!material) return Promise.reject(new Error("Material name is required for the API route.")); // Keep if route needs material
        if (!chapterId) return Promise.reject(new Error("Chapter ID is required to update tags."));
        if (!Array.isArray(tagsArray)) return Promise.reject(new Error("tagsArray must be an array of strings."));

        const encodedMaterial = encodeURIComponent(material);
        const encodedChapterId = encodeURIComponent(chapterId);
        const endpoint = `/materials/${encodedMaterial}/chapters/${encodedChapterId}/tags`;

        // Alternative endpoint if backend route is simplified:
        // const endpoint = `/chapters/${encodedChapterId}/tags`;

        console.log(`DEBUG: [setChapterTags] Calling PUT ${endpoint} for chapter ${chapterId}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { tags: tagsArray },
        });
    }

        // --- Group Methods ---

    /**
     * Retrieves all groups for a specific material.
     * Calls GET /api/materials/:material/groups
     * @param {string} material - The material name.
     * @returns {Promise<Array<object>>} - Promise resolving to an array of group document objects.
     */
    async getMaterialGroups(material) {
        if (!material) return Promise.reject(new Error("Material is required to get groups."));
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/materials/${encodedMaterial}/groups`;
        console.log(`DEBUG: [getMaterialGroups] Calling GET ${endpoint}`);
        return this._fetchJson(endpoint); // Expects an array
    }

    /**
     * Creates a new, empty group for a specified material.
     * Calls POST /api/materials/:material/groups
     * @param {string} material - The material name.
     * @param {object} groupData - Data for the new group (at least `name` is required).
     * @param {string} groupData.name - The required name for the new group.
     * @param {string} [groupData.color] - Optional color.
     * @param {string} [groupData.layoutMode] - Optional layout mode ('card' or 'list').
     * @param {object} [groupData.gridPosition] - Optional position { row, col }.
     * @param {object} [groupData.gridSize] - Optional size { rows, cols }.
     * @returns {Promise<object>} - Promise resolving to the newly created group document object.
     */
    async createGroup(material, groupData) {
        if (!material) return Promise.reject(new Error("Material is required."));
        if (!groupData || !groupData.name?.trim()) return Promise.reject(new Error("Group name is required."));
        const encodedMaterial = encodeURIComponent(material);
        const endpoint = `/materials/${encodedMaterial}/groups`;
        console.log(`DEBUG: [createGroup] Calling POST ${endpoint}`);
        // Ensure only valid fields are sent, or let backend handle validation
        return this._fetchJson(endpoint, {
            method: 'POST',
            body: {
                name: groupData.name.trim(),
                color: groupData.color, // Send undefined if not provided
                layoutMode: groupData.layoutMode,
                gridPosition: groupData.gridPosition,
                gridSize: groupData.gridSize,
            },
        });
    }

    /**
     * Partially updates the properties of a specific group.
     * Calls PATCH /api/groups/:groupId
     * @param {string} groupId - The Firestore Document ID of the group.
     * @param {object} updateData - Object containing only fields to update (name, color, layoutMode, gridPosition, gridSize).
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated group).
     */
    async updateGroup(groupId, updateData) {
        if (!groupId) return Promise.reject(new Error("Group ID is required."));
        if (!updateData || Object.keys(updateData).length === 0) return Promise.reject(new Error("Update data cannot be empty."));
        // Optional: Client-side validation of allowed fields/types
        const endpoint = `/groups/${groupId}`;
        console.log(`DEBUG: [updateGroup] Calling PATCH ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PATCH',
            body: updateData,
        });
    }

    /**
     * Permanently deletes a group and unassigns its chapters.
     * Calls DELETE /api/groups/:groupId
     * @param {string} groupId - The Firestore Document ID of the group to delete.
     * @returns {Promise<object>} - Promise resolving to the server response message.
     */
    async deleteGroup(groupId) {
        if (!groupId) return Promise.reject(new Error("Group ID is required."));
        const endpoint = `/groups/${groupId}`;
        console.log(`DEBUG: [deleteGroup] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'DELETE' });
    }

    /**
     * Sets the preferred sorting method for chapters within a specific group.
     * Calls PUT /api/groups/:groupId/sort-preference
     * @param {string} groupId - The Firestore Document ID of the group.
     * @param {string} field - The field to sort by (e.g., 'name', 'stats.mastery').
     * @param {string} order - Sort order ('asc' or 'desc').
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated group).
     */
    async setGroupSortPreference(groupId, field, order) {
        if (!groupId) return Promise.reject(new Error("Group ID is required."));
        if (!field) return Promise.reject(new Error("Sort field is required."));
        const validOrders = ['asc', 'desc'];
        if (!validOrders.includes(order?.toLowerCase())) {
            return Promise.reject(new Error("Invalid sort order. Use 'asc' or 'desc'."));
        }

        const endpoint = `/groups/${groupId}/sort-preference`;
        console.log(`DEBUG: [setGroupSortPreference] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { field: field, order: order.toLowerCase() },
        });
    }

        /**
     * Assigns a chapter to a specific group or removes it from its current group.
     * Calls PATCH /api/chapters/:chapterId/assign-group
     * @param {string} chapterId - The Firestore Document ID of the chapter.
     * @param {string | null} groupId - The Document ID of the target group, or null to unassign.
     * @returns {Promise<object>} - Promise resolving to the server response (message + updated chapter).
     */
        async assignChapterToGroup(chapterId, groupId) {
            if (!chapterId) return Promise.reject(new Error("Chapter ID is required."));
            // groupId can be null
            if (typeof groupId !== 'string' && groupId !== null) {
                return Promise.reject(new Error("groupId must be a string or null."));
            }
    
            const endpoint = `/chapters/${chapterId}/assign-group`;
            console.log(`DEBUG: [assignChapterToGroup] Calling PATCH ${endpoint} for chapter ${chapterId}`);
            return this._fetchJson(endpoint, {
                method: 'PATCH',
                body: { groupId: groupId },
            });
        }
    
        /**
         * Marks a specific chapter as pinned.
         * Calls PUT /api/chapters/:chapterId/pin
         * @param {string} chapterId - The Firestore Document ID of the chapter.
         * @returns {Promise<object>} - Promise resolving to the server response (message + updated chapter).
         */
        async pinChapter(chapterId) {
            if (!chapterId) return Promise.reject(new Error("Chapter ID is required."));
            const endpoint = `/chapters/${chapterId}/pin`;
            console.log(`DEBUG: [pinChapter] Calling PUT ${endpoint}`);
            return this._fetchJson(endpoint, { method: 'PUT' });
        }
    
        /**
         * Marks a specific chapter as not pinned.
         * Calls PUT /api/chapters/:chapterId/unpin
         * @param {string} chapterId - The Firestore Document ID of the chapter.
         * @returns {Promise<object>} - Promise resolving to the server response (message + updated chapter).
         */
        async unpinChapter(chapterId) {
            if (!chapterId) return Promise.reject(new Error("Chapter ID is required."));
            const endpoint = `/chapters/${chapterId}/unpin`;
            console.log(`DEBUG: [unpinChapter] Calling PUT ${endpoint}`);
            return this._fetchJson(endpoint, { method: 'PUT' });
        }
    
        /**
         * Marks a specific chapter as suspended.
         * Calls PUT /api/chapters/:chapterId/suspend
         * @param {string} chapterId - The Firestore Document ID of the chapter.
         * @returns {Promise<object>} - Promise resolving to the server response (message + updated chapter).
         */
        async suspendChapter(chapterId) {
            if (!chapterId) return Promise.reject(new Error("Chapter ID is required."));
            const endpoint = `/chapters/${chapterId}/suspend`;
            console.log(`DEBUG: [suspendChapter] Calling PUT ${endpoint}`);
            return this._fetchJson(endpoint, { method: 'PUT' });
        }
    
        /**
         * Marks a specific chapter as not suspended.
         * Calls PUT /api/chapters/:chapterId/unsuspend
         * @param {string} chapterId - The Firestore Document ID of the chapter.
         * @returns {Promise<object>} - Promise resolving to the server response (message + updated chapter).
         */
        async unsuspendChapter(chapterId) {
            if (!chapterId) return Promise.reject(new Error("Chapter ID is required."));
            const endpoint = `/chapters/${chapterId}/unsuspend`;
            console.log(`DEBUG: [unsuspendChapter] Calling PUT ${endpoint}`);
            return this._fetchJson(endpoint, { method: 'PUT' });
        }

            /**
     * Sets the grid position for a specific group.
     * Calls PUT /api/groups/:groupId/position
     * @param {string} groupId - The Firestore Document ID of the group.
     * @param {object} position - Object with { row: number, col: number } (1-based).
     * @returns {Promise<object>} - Promise resolving to the server response.
     */
    async updateGroupPosition(groupId, position) {
        if (!groupId) return Promise.reject(new Error("Group ID is required."));
        if (!position || typeof position.row !== 'number' || typeof position.col !== 'number' || position.row < 1 || position.col < 1) {
            return Promise.reject(new Error("Valid position object {row, col} (1-based) is required."));
        }
        const endpoint = `/groups/${groupId}/position`;
        console.log(`DEBUG: [updateGroupPosition] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { row: position.row, col: position.col },
        });
    }

    /**
     * Sets the grid size for a specific group.
     * Calls PUT /api/groups/:groupId/size
     * @param {string} groupId - The Firestore Document ID of the group.
     * @param {object} size - Object with { rows: number, cols: number }.
     * @returns {Promise<object>} - Promise resolving to the server response.
     */
    async updateGroupSize(groupId, size) {
        if (!groupId) return Promise.reject(new Error("Group ID is required."));
        if (!size || typeof size.rows !== 'number' || typeof size.cols !== 'number' || size.rows < 1 || size.cols < 1) {
            return Promise.reject(new Error("Valid size object {rows, cols} is required."));
        }
        const endpoint = `/groups/${groupId}/size`;
        console.log(`DEBUG: [updateGroupSize] Calling PUT ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PUT',
            body: { rows: size.rows, cols: size.cols },
        });
    }

} // End of ApiClient class

// Create and export a single instance (singleton pattern)
export const apiClient = new ApiClient();

// Example Usage (in other JS files):
// import { apiClient } from './api/apiClient.js';
//
// async function loadSettingsAndCards() {
//   try {
//     const material = 'Mathematics';
//     const settings = await apiClient.getMaterialSettings(material);
//     console.log(`${material} Settings:`, settings);
//     const cards = await apiClient.getCards({ material: material });
//     console.log(`${material} Cards:`, cards);
//   } catch (error) {
//     console.error('Failed operation:', error);
//   }
// }
// loadSettingsAndCards();