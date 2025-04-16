// --- File: js/api/apiClient.js ---
// Refactored to use a class structure for better context management ('this')

class ApiClient {
    constructor() {
        // Base URL for the API
        // Use environment variable or configuration for production
        this.baseURL = "https://flashcard-api-957892315214.europe-west9.run.app/api" ; // No fallback needed if configured correctly // Example using Vue-like env var
        console.log("ApiClient initialized with baseURL:", this.baseURL);
    }

    /**
     * Private helper method for making requests to the API.
     * It handles common tasks like setting headers, checking response status,
     * and parsing JSON data. It also includes basic error handling.
     * @param {string} endpoint - The API endpoint path (e.g., '/cards')
     * @param {object} [options={}] - Options for the fetch request (method, headers, body, etc.)
     * @returns {Promise<object>} - A promise that resolves with the JSON response body.
     * @throws {Error} - Throws an error if the network request fails or the API returns an error status (4xx or 5xx).
     * @private
     */
    async _fetchJson(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        console.log(`DEBUG: [_fetchJson] Preparing request for endpoint: ${endpoint}`);
        // console.log(`DEBUG: [_fetchJson] Received options:`, JSON.stringify(options)); // Keep logging minimal unless debugging

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
        // if (config.body) { console.log(`DEBUG: [_fetchJson] Request body:`, config.body); }

        try {
            const response = await fetch(url, config);
            // console.log(`DEBUG: [_fetchJson] Received response status for ${endpoint}: ${response.status} ${response.statusText}`);

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                let errorDetails = null;
                try {
                    errorDetails = await response.json();
                    errorMessage = errorDetails.message || errorDetails.error || errorMessage;
                } catch (e) { /* Ignore if error response isn't JSON */ }
                console.error(`API request failed for ${endpoint}: ${errorMessage}`, errorDetails);
                throw new Error(errorMessage);
            }

            if (response.status === 204) return null;

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                 try {
                    const data = await response.json();
                    // console.log(`DEBUG: [_fetchJson] Received JSON data for ${endpoint}:`, data);
                    return data;
                 } catch (parseError) {
                    console.error(`Error parsing JSON response for ${endpoint}:`, parseError);
                    throw new Error(`Invalid JSON received from server for ${endpoint}.`);
                 }
            } else {
                console.log(`DEBUG: [_fetchJson] Received non-JSON response for ${endpoint} (Status: ${response.status}, Content-Type: ${contentType}). Returning null.`);
                return null;
            }
        } catch (error) {
            console.error(`Error during fetch operation for ${endpoint}:`, error);
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

    async getMaterials() {
        const endpoint = '/materials';
        console.log(`DEBUG: [getMaterials] Calling endpoint: ${endpoint}`);
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

    async getChapterMastery(material) {
        if (!material) return Promise.reject(new Error("Material is required for chapter mastery."));
        const endpoint = `/chapter-mastery?material=${encodeURIComponent(material)}`;
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


    async getChaptersForMaterial(material) {
        if (!material) return Promise.reject(new Error("Material is required to get chapters."));
        const endpoint = `/materials/${encodeURIComponent(material)}/chapters`;
        console.log(`DEBUG: [getChaptersForMaterial] Calling endpoint: ${endpoint}`);
        return this._fetchJson(endpoint);
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
    async getDashboardSummary(material = null, timelineGranularity = null, statsDays = null) {
        const params = new URLSearchParams();
        if (material) params.append('material', material);
        if (timelineGranularity) params.append('timelineGranularity', timelineGranularity);
        if (statsDays) params.append('statsDays', statsDays);

        const queryString = params.toString();
        const endpoint = `/dashboard-summary${queryString ? '?' + queryString : ''}`;
        console.log(`DEBUG: [getDashboardSummary] Calling GET ${endpoint}`);
        return this._fetchJson(endpoint);
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