// --- File: js/api/apiClient.js ---
// Refactored to use a class structure for better context management ('this')

class ApiClient {
    constructor() {
        // Base URL for the API from the documentation [cite: 6]
        this.baseURL = 'https://flashcard-api-957892315214.europe-west9.run.app/api';
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
        console.log(`DEBUG: [_fetchJson] Preparing request for endpoint: ${endpoint}`); // Added log
        console.log(`DEBUG: [_fetchJson] Received options:`, JSON.stringify(options)); // Added log (stringify for cleaner object view)

        // --- FIX STARTS HERE ---
        // 1. Determine the method *before* creating the config object
        const method = options.method || 'GET';

        // 2. Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers,
        };

        // 3. Prepare the body based on the determined method
        const body = (options.body && method !== 'GET' && method !== 'HEAD')
            ? JSON.stringify(options.body)
            : undefined;

        // 4. Now create the config object using the prepared variables
        const config = {
            method: method, // Use the pre-determined method
            headers: headers,
            body: body,     // Use the pre-determined body
        };
        // --- FIX ENDS HERE ---

        console.log(`DEBUG: [_fetchJson] Fetching ${config.method} ${url}`);
        if (config.body) {
            console.log(`DEBUG: [_fetchJson] Request body:`, config.body); // Log the body being sent
        }

        try {
            const response = await fetch(url, config);

            console.log(`DEBUG: [_fetchJson] Received response status for ${endpoint}: ${response.status} ${response.statusText}`); // Added log

            if (!response.ok) {
                let errorMessage = `API Error: ${response.status} ${response.statusText}`;
                let errorDetails = null;
                try {
                    // Try to get more specific error message from response body
                    errorDetails = await response.json();
                    errorMessage = errorDetails.message || errorDetails.error || errorMessage;
                    console.log(`DEBUG: [_fetchJson] API error details:`, errorDetails); // Log error details
                } catch (e) {
                    console.log(`DEBUG: [_fetchJson] Could not parse error response as JSON.`); // Log if parsing fails
                 }
                console.error(`API request failed for ${endpoint}: ${errorMessage}`, errorDetails);
                throw new Error(errorMessage); // Throw the potentially more detailed error message
            }

            // Handle empty responses (like 204 No Content)
            if (response.status === 204) {
                console.log(`DEBUG: [_fetchJson] Received 204 No Content for ${endpoint}. Returning null.`); // Added log
                return null;
            }

            // Only parse JSON if the content type indicates it
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                 try {
                    const data = await response.json();
                    console.log(`DEBUG: [_fetchJson] Received JSON data for ${endpoint}:`, data);
                    return data;
                 } catch (parseError) {
                    console.error(`Error parsing JSON response for ${endpoint}:`, parseError);
                    throw new Error(`Invalid JSON received from server for ${endpoint}.`); // Throw specific parse error
                 }
            } else {
                // Handle non-JSON responses if necessary, or return null/text
                console.log(`DEBUG: [_fetchJson] Received non-JSON response for ${endpoint} (Status: ${response.status}, Content-Type: ${contentType}). Returning null.`);
                return null; // Or handle as text: return response.text();
            }

        } catch (error) {
            // Catch both fetch/network errors and errors thrown above (like !response.ok or JSON parse errors)
            console.error(`Error during fetch operation for ${endpoint}:`, error);
             // Don't re-throw generic 'Network or other error' if a specific one was already thrown
            if (error instanceof Error && error.message.startsWith('API Error:')) {
                throw error; // Re-throw the specific API error
            } else if (error instanceof Error && error.message.startsWith('Invalid JSON')) {
                 throw error; // Re-throw the specific JSON parse error
            } else {
                 // Provide a generic fallback error for network issues etc.
                 throw new Error(`Network error or failed to fetch resource from ${endpoint}. Details: ${error.message}`);
            }
        }
    }

    // --- Public API Methods ---
// Add inside ApiClient class
    async deleteCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required for deletion."));
        const endpoint = `/cards/${cardId}`; // Assuming this endpoint
        console.log(`DEBUG: [deleteCard] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, { method: 'DELETE' });
        // Adjust response handling based on what your API returns on DELETE
    }


        /**
     * Retrieves the current SRS threshold settings.
     * Calls GET /api/settings/srs-thresholds
     * @returns {Promise<object>} - Promise resolving to the SRS settings object (e.g., { learningReps, masteredEase, ... }).
     * @throws {Error} If the fetch operation fails.
     */
        async getSrsThresholds() {
            const endpoint = '/settings/srs-thresholds';
            console.log(`DEBUG: [getSrsThresholds] Calling endpoint: ${endpoint}`);
            // Use the existing _fetchJson helper
            return this._fetchJson(endpoint);
        }

    // --- Add this method inside the ApiClient class in js/api/apiClient.js ---
    
   /**
     * Retrieves materials, ordered by card count descending.
     * Includes 'dueCount' if available from API.
     * @returns {Promise<Array<{material: string, cardCount: number, dueCount?: number}>>} // Added dueCount
     */
   async getMaterials() {
    const endpoint = '/materials';
    console.log(`DEBUG: [getMaterials] Calling endpoint: ${endpoint}`);
    return this._fetchJson(endpoint);
}

    /**
     * Get specific flashcard details by ID.
     * Calls GET /api/cards/:id
     * @param {string} cardId - The unique ID of the flashcard.
     * @returns {Promise<object>} - Promise resolving to the full flashcard object.
     * @throws {Error} If cardId is missing or fetch fails.
     */
    async getCard(cardId) {
        if (!cardId) {
            return Promise.reject(new Error("Card ID is required to get card details."));
        }
        const endpoint = `/cards/${cardId}`;
        console.log(`DEBUG: [getCard] Calling endpoint: ${endpoint}`);
        // Use the existing _fetchJson helper
        return this._fetchJson(endpoint);
    }

    /**
     * Fetch flashcards with optional filters. [cite: 10]
     * @param {object} [filters={}] - Optional filters (material, chapter, buried, starred, due) [cite: 26, 27, 28, 29, 30]
     * @returns {Promise<Array>} - Promise resolving to an array of flashcard objects.
     */
    async getCards(filters = {}) {
        // Remove undefined/null filters before creating query string
        const validFilters = Object.fromEntries(
             Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined)
        );
        const queryParams = new URLSearchParams(validFilters).toString();
        return this._fetchJson(`/cards${queryParams ? '?' + queryParams : ''}`); // Use 'this._fetchJson'
    }

    /**
     * Fetch minimal card data for quick previews. [cite: 50, 78]
     * @param {object} filters - Filters (material, chapter required)
     * @returns {Promise<Array>} - Promise resolving to an array of preview card objects.
     */
    async getCardPreviews(filters) {
        if (!filters || !filters.material || !filters.chapter) {
           return Promise.reject(new Error("Material and chapter are required for card previews."));
        }
        const queryParams = new URLSearchParams(filters).toString();
        return this._fetchJson(`/cards/previews?${queryParams}`); // Use 'this._fetchJson'
    }

    /**
     * Create a new flashcard. [cite: 11]
     * @param {object} cardData - Data for the new flashcard (material, chapter, name, briefExplanation, detailedExplanation).
     * @returns {Promise<object>} - Promise resolving to the created flashcard object.
     */
    async createCard(cardData) {
        return this._fetchJson('/flashcards', { // Use 'this._fetchJson'
            method: 'POST',
            body: cardData,
        });
    }

    /**
     * Star a flashcard. [cite: 12]
     * @param {string} cardId - The ID of the flashcard to star.
     * @returns {Promise<object>} - Promise resolving to the updated card data.
     */
    async starCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        return this._fetchJson(`/cards/${cardId}/star`, { method: 'PUT' }); // Use 'this._fetchJson'
    }

    /**
     * Unstar a flashcard. [cite: 13]
     * @param {string} cardId - The ID of the flashcard to unstar.
     * @returns {Promise<object>} - Promise resolving to the updated card data.
     */
    async unstarCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        return this._fetchJson(`/cards/${cardId}/unstar`, { method: 'PUT' }); // Use 'this._fetchJson'
    }

    /**
     * Bury a flashcard. [cite: 14]
     * @param {string} cardId - The ID of the flashcard to bury.
     * @returns {Promise<object>} - Promise resolving to the updated card data.
     */
    async buryCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        return this._fetchJson(`/cards/${cardId}/bury`, { method: 'PUT' }); // Use 'this._fetchJson'
    }

    /**
     * Unbury a flashcard. [cite: 15]
     * @param {string} cardId - The ID of the flashcard to unbury.
     * @returns {Promise<object>} - Promise resolving to the updated card data.
     */
    async unburyCard(cardId) {
        if (!cardId) return Promise.reject(new Error("Card ID is required."));
        return this._fetchJson(`/cards/${cardId}/unbury`, { method: 'PUT' }); // Use 'this._fetchJson'
    }

    /**
     * Submit a review for a flashcard. [cite: 18]
     * @param {string} cardId - The ID of the flashcard being reviewed.
     * @param {number} quality - The review quality (0-3).
     * @returns {Promise<object>} - Promise resolving to the review result (next review time, etc.).
     */
    async submitReview(cardId, quality) {
         // Add validation checks from previous example if needed
         if (typeof cardId === 'undefined' || cardId === null) return Promise.reject(new Error("Card ID is required."));
         if (typeof quality !== 'number' || quality < 0 || quality > 3) return Promise.reject(new Error("Invalid quality rating (0-3)."));
        return this._fetchJson(`/flashcards/${cardId}/review`, { // Use 'this._fetchJson'
            method: 'PUT',
            body: { quality },
        });
    }

    /**
     * Get daily study statistics. [cite: 22]
     * @param {number} [days=7] - Number of past days to include.
     * @returns {Promise<object>} - Promise resolving to daily stats object.
     */
    async getDailyAnalytics(days = 7) {
        return this._fetchJson(`/analytics/daily?days=${encodeURIComponent(days)}`); // Use 'this._fetchJson'
    }

    /**
     * Get mastery level distribution. [cite: 23]
     * @returns {Promise<object>} - Promise resolving to mastery distribution data.
     */
    async getMasteryAnalytics() {
        return this._fetchJson('/analytics/mastery'); // Use 'this._fetchJson'
    }

     /**
     * Get chapter difficulty analysis. [cite: 24]
     * @returns {Promise<Array>} - Promise resolving to an array of chapter analysis objects.
     */
    async getChapterDifficultyAnalytics() {
        return this._fetchJson('/analytics/chapters'); // Use 'this._fetchJson'
    }

    /**
     * Get mastery metrics for all chapters in a subject. [cite: 42, 68]
     * @param {string} material - "Mathematics" or "Physics".
     * @returns {Promise<Array>} - Promise resolving to an array of chapter mastery objects.
     */
    async getChapterMastery(material) {
        if (!material) return Promise.reject(new Error("Material is required for chapter mastery."));
        return this._fetchJson(`/chapter-mastery?material=${encodeURIComponent(material)}`); // Use 'this._fetchJson'
    }

    /**
     * Get learning stage breakdown for a specific chapter. [cite: 44, 69]
     * @param {string} material - Subject name.
     * @param {string} chapter - Chapter name.
     * @returns {Promise<object>} - Promise resolving to chapter stats object.
     */
    async getChapterStats(material, chapter) {
         if (!material || !chapter) return Promise.reject(new Error("Material and chapter are required for chapter stats."));
        return this._fetchJson(`/chapter-stats?material=${encodeURIComponent(material)}&chapter=${encodeURIComponent(chapter)}`); // Use 'this._fetchJson'
    }


    // --- Add this method inside the ApiClient class in js/api/apiClient.js ---

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

// --- End of added method ---

    /**
     * Fetches cards for a focused study session based on material and selected chapters.
     * Calls GET /api/study-session
     * @param {string} material - The material (e.g., 'Mathematics').
     * @param {string} chapters - Comma-separated string of chapter names.
     * @returns {Promise<Array<object>>} A promise that resolves to an array of card objects.
     * @throws {Error} If the fetch operation fails.
     */
    async getStudySessionCards(material, chapters) {
        if (!material || !chapters) {
            // Use reject for consistency with other validation checks
            return Promise.reject(new Error("Material and chapters are required for a focused study session."));
        }
        const encodedMaterial = encodeURIComponent(material);
        // For chapters, commas are generally safe in query params, but encoding is safer
        const encodedChapters = encodeURIComponent(chapters);
        const endpoint = `/study-session?material=${encodedMaterial}&chapters=${encodedChapters}`;
        console.log(`DEBUG: apiClient.getStudySessionCards calling: ${this.baseURL}${endpoint}`);
        return this._fetchJson(endpoint, { method: 'GET' }); // Use 'this._fetchJson'
    }

    /**
     * Get all chapters for a given material. [cite: 73]
     * @param {string} material - "Mathematics" or "Physics".
     * @returns {Promise<object>} - Promise resolving to an object containing the list of chapters.
     */
     async getChaptersForMaterial(material) {
        if (!material) return Promise.reject(new Error("Material is required to get chapters."));
        return this._fetchJson(`/materials/${encodeURIComponent(material)}/chapters`); // Use 'this._fetchJson'
    }

// --- START: Replace the entire getDueTimeline method in js/api/apiClient.js ---

    /**
     * Get due card distribution over time for a material or a specific chapter.
     * Calls GET /api/due-timeline
     * @param {string} material - The material name (Required).
     * @param {string | null} [chapter=null] - The chapter name. If null or omitted, fetches for the entire material.
     * @param {string} [granularity='daily'] - 'daily' or 'hourly'.
     * @returns {Promise<object>} - Promise resolving to timeline data (e.g., {"YYYY-MM-DD": count}).
     * @throws {Error} If material is not provided or fetch fails.
     */
    async getDueTimeline(material, chapter = null, granularity = 'daily') {
        // Validation: Only material is strictly required now according to docs
        if (!material) {
            console.error("API Error: Material is required for getDueTimeline.");
            return Promise.reject(new Error("Material is required for due timeline.")); // Use reject for consistency
        }

        // Build parameters: Start with required/defaulted ones
        const params = new URLSearchParams({
            material: material,
            granularity: granularity // Default is 'daily'
        });

        // Conditionally add chapter ONLY if it's provided (not null/undefined/empty string)
        if (chapter) {
            params.append('chapter', chapter);
            console.log(`DEBUG: [getDueTimeline] Fetching timeline for Specific Chapter: ${chapter}`);
        } else {
             console.log(`DEBUG: [getDueTimeline] Fetching timeline for Entire Material: ${material}`);
        }

        const endpoint = `/due-timeline?${params.toString()}`;
        console.log(`DEBUG: [getDueTimeline] Calling endpoint: ${endpoint}`);

        // Use the existing _fetchJson helper
        return this._fetchJson(endpoint);
   }

// --- END: Replace the entire getDueTimeline method in js/api/apiClient.js ---


    // --- NOTE ---
    // The endpoint PUT /api/cards/bulk-bury mentioned in flashcard-management-implementation.txt [cite: 72]
    // is not specified in the api-docs.txt. Therefore, it's not implemented here.
    // If this functionality is needed, the API documentation should be updated first.

   // --- NEW: Rename Chapter ---
    /**
     * Renames a chapter for all flashcards within a specific material.
     * Calls POST /api/materials/:material/chapters/rename
     * @param {string} material - The name of the material.
     * @param {string} currentChapterName - The current name of the chapter.
     * @param {string} newChapterName - The desired new name for the chapter.
     * @returns {Promise<object>} - Promise resolving to { message: string, updatedCount: number }.
     * @throws {Error} If parameters are invalid or fetch fails.
     */
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

    // --- NEW: Update Card (Generic) ---
    /**
     * Updates specific fields of an existing flashcard.
     * Calls PATCH /api/cards/:id
     * @param {string} cardId - The unique ID of the flashcard to update.
     * @param {object} updateData - An object containing the fields to update (e.g., { name: "New Name", is_starred: true }).
     * @returns {Promise<object>} - Promise resolving to the complete, updated flashcard data.
     * @throws {Error} If cardId or updateData is invalid, or fetch fails.
     */
    async updateCard(cardId, updateData) {
        if (!cardId) {
            return Promise.reject(new Error("Card ID is required for updating."));
        }
        if (!updateData || Object.keys(updateData).length === 0) {
            return Promise.reject(new Error("Update data cannot be empty."));
        }
        // Add validation for allowed fields if necessary on the client-side,
        // although the API doc indicates the server handles this.
        const endpoint = `/cards/${cardId}`;
        console.log(`DEBUG: [updateCard] Calling PATCH ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'PATCH',
            body: updateData,
        });
    }

    // --- NEW: Delete Chapter ---
    /**
     * Permanently deletes all flashcards belonging to a specific chapter within a material.
     * Calls DELETE /api/materials/:material/chapters/:chapterName
     * @param {string} material - The name of the material.
     * @param {string} chapterName - The name of the chapter to delete.
     * @returns {Promise<object>} - Promise resolving to { message: string, deletedCount: number }.
     * @throws {Error} If parameters are invalid or fetch fails.
     */
    async deleteChapter(material, chapterName) {
        if (!material || !chapterName) {
            return Promise.reject(new Error("Material and chapter name are required for deletion."));
        }
        const encodedMaterial = encodeURIComponent(material);
        const encodedChapterName = encodeURIComponent(chapterName); // Ensure chapter name is encoded
        const endpoint = `/materials/${encodedMaterial}/chapters/${encodedChapterName}`;
        console.log(`DEBUG: [deleteChapter] Calling DELETE ${endpoint}`);
        return this._fetchJson(endpoint, {
            method: 'DELETE',
        });
    }

} // End of ApiClient class

// Create and export a single instance (singleton pattern)
export const apiClient = new ApiClient();

// You would then import this in other files like:
// import { apiClient } from './api/apiClient.js';
//
// Example usage:
// apiClient.getCards({ due: true, material: 'Mathematics' })
//   .then(cards => console.log('Due Math cards:', cards))
//   .catch(error => console.error('Failed to fetch cards:', error));