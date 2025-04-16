// --- START OF MODIFIED FILE chapterFoldersView.js ---
// @version vNext - Phase 2 Implementation

import { apiClient } from '../api/apiClient.js';
// Gridstack assumed loaded globally

let isViewInitialized = false;

// Constants for placeholder text (avoids magic strings)
const LOADING_TEXT_SMALL = '<div class="loading-text-small">Loading...</div>';
const ERROR_TEXT_SMALL = '<div class="error-text-small">Error loading.</div>';
const EMPTY_GROUP_TEXT = '<div class="empty-group-text">No chapters.</div>';


class ChapterFoldersView {
    constructor() {
        console.log("ChapterFoldersView Constructor vNext");

        // --- DOM Element References ---
        // (Keep all existing references from the original file)
        // ... (references omitted for brevity, assume they are the same as the input file) ...
        // Main Container & Grid
        this.container = document.getElementById('managementContainer');
        this.dashboardGridContainer = document.getElementById('dashboardGrid');

        // Overview Section
        this.heatmapGrid = this.container?.querySelector('.chapter-mastery-section .heatmap-grid');
        this.reviewScheduleContainer = this.container?.querySelector('.review-schedule-graph');
        this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas');
        this.reviewStatusElement = this.reviewScheduleContainer?.querySelector('.graph-status');
        this.reviewActivityGrid = this.container?.querySelector('.review-activity-section .review-heatmap-grid');
        this.heatmapTooltipElement = document.getElementById('heatmap-tooltip');

        // Top Controls & Pills
        this.sortControlsContainer = document.getElementById('sortControlsContainer');
        this.sortFieldSelect = document.getElementById('sortField');
        this.sortOrderSelect = document.getElementById('sortOrder');
        this.tagPillsContainer = document.getElementById('tagPillsContainer');
        this.selectChaptersButton = document.getElementById('selectChaptersButton'); // Expected static ID
        this.createGroupButton = document.getElementById('createGroupButton');     // Expected static ID

        // Selection Toolbar (Appears during selection mode)
        this.selectionToolbar = document.getElementById('selectionToolbar');
        this.confirmGroupSelectionButton = document.getElementById('confirmGroupSelectionButton');

        // Floating Study Pill
        this.floatingStudyPill = document.getElementById('floatingStudyPill');
        this.pillMaterialSwitcher = document.getElementById('pillMaterialSwitcher');
        this.pillMaterialSwitcherInner = this.pillMaterialSwitcher?.querySelector('.material-switcher-pill-inner');
        this.pillNewCardsCount = document.getElementById('pillNewCardsCount');
        this.pillDueCardsCount = document.getElementById('pillDueCardsCount');
        this.pillStudyButtonWrapper = this.floatingStudyPill?.querySelector('.study-button-wrapper');
        this.pillStudyDueButton = document.getElementById('pillStudyDueButton');
        this.pillOptionsTrigger = document.getElementById('pillOptionsTrigger');
        this.studyOptionsPopup = document.getElementById('studyOptionsPopup');
        this.pillStartFocusedButton = document.getElementById('pillStartFocusedButton');
        this.pillReviewBatchSize = document.getElementById('pillReviewBatchSize');

        // Context Menus
        this.chapterContextMenu = document.getElementById('chapterContextMenu');
        this.materialContextMenu = document.getElementById('materialContextMenu');
        this.groupContextMenu = document.getElementById('groupContextMenu');

        // Generic Modals
        this.confirmationModalOverlay = document.getElementById('confirmationModal');
        this.confirmModalTitle = document.getElementById('confirmModalTitle');
        this.confirmModalMessage = document.getElementById('confirmModalMessage');
        this.confirmModalActions = document.getElementById('confirmModalActions');
        this.confirmModalIcon = document.getElementById('confirmModalIcon');
        this.errorModalOverlay = document.getElementById('errorModal');
        this.errorModalTitle = document.getElementById('errorModalTitle');
        this.errorModalMessage = document.getElementById('errorModalMessage');
        this.errorModalActions = document.getElementById('errorModalActions');
        this.infoModalOverlay = document.getElementById('infoModal');
        this.infoModalTitle = document.getElementById('infoModalTitle');
        this.infoModalMessage = document.getElementById('infoModalMessage');
        this.infoModalActions = document.getElementById('infoModalActions');
        this.infoModalIcon = document.getElementById('infoModalIcon');

        // Specific Modals & Inputs
        this.settingsModalOverlay = document.getElementById('materialSettingsModal');
        this.settingsModalTitle = document.getElementById('settingsModalTitle');
        this.settingsModalForm = document.getElementById('materialSettingsForm');
        this.settingsEditMaterialNameInput = document.getElementById('settingsEditMaterialName');
        this.settingsMaterialNameInput = document.getElementById('settingsMaterialName');
        this.settingsDailyLimitInput = document.getElementById('settingsDailyLimit');
        this.settingsDefaultBatchSizeInput = document.getElementById('settingsDefaultBatchSize');
        // ... (other settings inputs) ...
        this.settingsAlgoLearningStepsInput = document.getElementById('settingsAlgoLearningSteps');
        this.settingsAlgoGraduationIntervalInput = document.getElementById('settingsAlgoGraduationInterval');
        this.settingsAlgoLapseIntervalInput = document.getElementById('settingsAlgoLapseInterval');
        this.settingsAlgoEasyBonusInput = document.getElementById('settingsAlgoEasyBonus');
        this.settingsAlgoMinEaseInput = document.getElementById('settingsAlgoMinEase');
        this.settingsAlgoDefaultEaseInput = document.getElementById('settingsAlgoDefaultEase');
        this.settingsAlgoHardMultiplierInput = document.getElementById('settingsAlgoHardMultiplier');
        this.settingsAlgoMaxIntervalInput = document.getElementById('settingsAlgoMaxInterval');
        this.settingsAlgoEaseAdjLapseInput = document.getElementById('settingsAlgoEaseAdjLapse');
        this.settingsAlgoEaseAdjHardInput = document.getElementById('settingsAlgoEaseAdjHard');
        this.settingsAlgoEaseAdjEasyInput = document.getElementById('settingsAlgoEaseAdjEasy');
        this.settingsThresholdLearningRepsInput = document.getElementById('settingsThresholdLearningReps');
        this.settingsThresholdMasteredRepsInput = document.getElementById('settingsThresholdMasteredReps');
        this.settingsThresholdMasteredEaseInput = document.getElementById('settingsThresholdMasteredEase');
        this.settingsThresholdCriticalEaseInput = document.getElementById('settingsThresholdCriticalEase');
        this.settingsModalActions = document.getElementById('settingsModalActions');
        this.settingsSaveButton = document.getElementById('settingsSaveButton');
        this.settingsCancelButton = document.getElementById('settingsCancelButton');

        this.tagManagementModalOverlay = document.getElementById('tagManagementModal');
        this.newTagNameInput = document.getElementById('newTagNameInput');
        this.existingTagsList = document.getElementById('existingTagsList');
        this.createTagButton = document.getElementById('createTagButton');

        this.createGroupModalOverlay = document.getElementById('createGroupModal');
        this.newGroupNameInput = document.getElementById('newGroupNameInput');
        this.newGroupColorInput = document.getElementById('newGroupColorInput');
        this.createGroupConfirmButton = document.getElementById('createGroupConfirmButton');

        this.groupSortModalOverlay = document.getElementById('groupSortModal');
        this.groupSortFieldSelect = document.getElementById('groupSortField');
        this.groupSortOrderSelect = document.getElementById('groupSortOrder');
        this.groupSortConfirmButton = document.getElementById('groupSortConfirmButton');

        this.tagSelectorModalOverlay = document.getElementById('tagSelectorModal');
        this.tagSelectorList = document.getElementById('tagSelectorList');
        this.tagSelectorConfirmButton = document.getElementById('tagSelectorConfirmButton');

        this.colorPickerModalOverlay = document.getElementById('groupColorPickerModal');
        this.colorPickerInput = document.getElementById('groupColorPickerInput');

        this.groupCreationInstruction = document.getElementById('groupCreationInstruction');

        // --- Material Icons ---
        // (Keep existing icons - UI team likely styles these elsewhere)
        this.materialIcons = { /* ... same as before ... */
            'Mathematics': '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 142.514 142.514" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M34.367,142.514c11.645,0,17.827-10.4,19.645-16.544c0.029-0.097,0.056-0.196,0.081-0.297 c4.236-17.545,10.984-45.353,15.983-65.58h17.886c3.363,0,6.09-2.726,6.09-6.09c0-3.364-2.727-6.09-6.09-6.09H73.103 c1.6-6.373,2.771-10.912,3.232-12.461l0.512-1.734c1.888-6.443,6.309-21.535,13.146-21.535c6.34,0,7.285,9.764,7.328,10.236 c0.27,3.343,3.186,5.868,6.537,5.579c3.354-0.256,5.864-3.187,5.605-6.539C108.894,14.036,104.087,0,89.991,0 C74.03,0,68.038,20.458,65.159,30.292l-0.49,1.659c-0.585,1.946-2.12,7.942-4.122,15.962H39.239c-3.364,0-6.09,2.726-6.09,6.09 c0,3.364,2.726,6.09,6.09,6.09H57.53c-6.253,25.362-14.334,58.815-15.223,62.498c-0.332,0.965-2.829,7.742-7.937,7.742 c-7.8,0-11.177-10.948-11.204-11.03c-0.936-3.229-4.305-5.098-7.544-4.156c-3.23,0.937-5.092,4.314-4.156,7.545 C13.597,130.053,20.816,142.514,34.367,142.514z"></path> <path d="M124.685,126.809c3.589,0,6.605-2.549,6.605-6.607c0-1.885-0.754-3.586-2.359-5.474l-12.646-14.534l12.271-14.346 c1.132-1.416,1.98-2.926,1.98-4.908c0-3.59-2.927-6.231-6.703-6.231c-2.547,0-4.527,1.604-6.229,3.684l-9.531,12.454L98.73,78.391 c-1.89-2.357-3.869-3.682-6.7-3.682c-3.59,0-6.607,2.551-6.607,6.609c0,1.885,0.756,3.586,2.357,5.471l11.799,13.592 L86.647,115.67c-1.227,1.416-1.98,2.926-1.98,4.908c0,3.589,2.926,6.229,6.699,6.229c2.549,0,4.53-1.604,6.229-3.682l10.19-13.4 l10.193,13.4C119.872,125.488,121.854,126.809,124.685,126.809z"></path> </g> </g> </g></svg>',
            'Physics': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,256c0-38.187-36.574-71.637-94.583-93.355c1.015-6.127,1.894-12.177,2.5-18.091 c5.589-54.502-7.168-93.653-35.917-110.251c-9.489-5.478-20.378-8.26-32.341-8.26c-28.356,0-61.858,16.111-95.428,43.716 c-27.187-22.434-54.443-37.257-79.275-42.01c-4.642-0.905-9.105,2.142-9.993,6.776c-0.879,4.625,2.15,9.096,6.775,9.975 c21.282,4.079,45.15,17.109,69.308,36.702c-18.278,16.708-36.378,36.651-53.487,59.255c-28.561,3.447-55.031,9.088-78.592,16.529 c-4.395-27.913-4.13-52.813,1.331-72.439c2.321,0.495,4.71,0.785,7.168,0.785c18.825,0,34.133-15.309,34.133-34.133 c0-18.816-15.309-34.133-34.133-34.133S85.333,32.384,85.333,51.2c0,10.146,4.531,19.166,11.58,25.429 c-7.305,23.347-7.996,52.915-2.475,86.067C36.514,184.414,0,217.839,0,256c0,37.12,34.765,70.784,94.447,93.099 C84.25,410.206,94.933,458.615,128,477.713c9.489,5.478,20.378,8.252,32.35,8.252c28.382,0,61.918-16.136,95.505-43.785 c27.469,22.682,54.733,37.385,79.206,42.078c0.538,0.102,1.084,0.154,1.613,0.154c4.011,0,7.595-2.842,8.38-6.921 c0.879-4.634-2.15-9.105-6.776-9.992c-20.847-3.994-44.843-16.913-69.308-36.702c18.287-16.708,36.378-36.651,53.487-59.255 c28.578-3.456,55.066-9.088,78.626-16.538c4.395,27.887,4.122,52.787-1.365,72.457c-2.33-0.503-4.719-0.794-7.185-0.794 c-18.825,0-34.133,15.317-34.133,34.133c0,18.824,15.309,34.133,34.133,34.133c18.824,0,34.133-15.309,34.133-34.133 c0-10.138-4.523-19.149-11.563-25.412c7.339-23.407,8.047-52.966,2.526-86.101C475.52,327.561,512,294.144,512,256z M351.659,43.11c8.934,0,16.947,2.014,23.808,5.973c22.246,12.843,32.265,47.01,27.477,93.73 c-0.478,4.625-1.22,9.395-1.963,14.157c-23.518-7.424-49.937-13.047-78.438-16.495c-17.041-22.613-35.029-42.675-53.248-59.383 C298.846,57.148,327.791,43.11,351.659,43.11z M397.764,174.208c-4.139,19.396-10.266,39.603-18.202,60.186 c-6.093-12.689-12.766-25.429-20.087-38.127c-7.313-12.681-15.036-24.815-22.997-36.437 C358.519,163.328,379.153,168.209,397.764,174.208z M256.12,92.407c14.507,13.158,28.945,28.552,42.871,45.764 c-13.952-1.058-28.297-1.638-42.991-1.638c-14.669,0-28.988,0.58-42.914,1.63C227.063,120.934,241.579,105.574,256.12,92.407z M175.522,159.829c-7.97,11.614-15.676,23.782-22.98,36.446c-7.356,12.74-14.037,25.472-20.096,38.101 c-7.987-20.727-14.148-40.986-18.278-60.143C132.804,168.218,153.455,163.337,175.522,159.829z M119.467,34.133 c9.412,0,17.067,7.654,17.067,17.067c0,9.412-7.654,17.067-17.067,17.067c-9.404,0-17.067-7.654-17.067-17.067 C102.4,41.788,110.063,34.133,119.467,34.133z M17.067,256c0-29.79,31.548-57.088,80.777-75.998 c5.359,24.141,13.722,49.758,24.832,75.887c-11.264,26.419-19.61,52.113-24.934,76.194C47.283,312.619,17.067,284.774,17.067,256z M255.923,419.576c-13.474-12.169-26.923-26.291-39.927-42.052c0.734-1.092,1.28-2.295,1.886-3.465 c12.766,0.879,25.557,1.408,38.118,1.408c14.677,0,28.996-0.572,42.931-1.63C284.962,391.057,270.447,406.417,255.923,419.576z M313.267,355.277c-18.415,2.031-37.606,3.123-57.267,3.123c-11.29,0-22.775-0.469-34.261-1.203 c-0.648-18.253-15.59-32.93-34.005-32.93c-18.825,0-34.133,15.317-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133 c5.547,0,10.726-1.459,15.36-3.823c12.996,15.735,26.334,29.858,39.714,42.129c-29.585,23.996-58.573,38.059-82.458,38.059 c-8.943,0-16.947-2.005-23.817-5.973c-25.813-14.899-33.673-55.91-25.404-108.041c4.659,1.468,9.455,2.876,14.37,4.215 c4.523,1.237,9.233-1.451,10.479-5.99c1.237-4.548-1.442-9.233-5.999-10.47c-5.41-1.476-10.615-3.072-15.701-4.71 c4.105-19.123,10.197-39.424,18.185-60.262c5.658,11.802,11.844,23.646,18.577,35.447c1.57,2.756,4.454,4.301,7.415,4.301 c1.434,0,2.884-0.358,4.224-1.118c4.096-2.33,5.521-7.543,3.183-11.639c-9.207-16.128-17.391-32.418-24.516-48.58 c7.467-17.007,16.128-34.21,25.975-51.268c9.796-16.973,20.378-33.058,31.42-48.085c18.423-2.022,37.598-3.123,57.259-3.123 c19.686,0,38.886,1.101,57.327,3.132c11.017,15.036,21.572,31.112,31.369,48.068c9.796,16.964,18.458,34.116,25.967,51.106 c-7.561,17.101-16.162,34.295-25.975,51.302C334.891,324.164,324.318,340.25,313.267,355.277z M204.8,358.4 c0,4.796-1.997,9.122-5.197,12.22c-0.043,0.034-0.094,0.043-0.137,0.077c-0.051,0.034-0.068,0.094-0.119,0.137 c-3.046,2.85-7.117,4.634-11.614,4.634c-9.404,0-17.067-7.654-17.067-17.067c0-9.412,7.663-17.067,17.067-17.067 C197.146,341.333,204.8,348.988,204.8,358.4z M336.486,352.171c7.979-11.614,15.676-23.774,22.98-36.429 c7.313-12.672,13.943-25.472,20.062-38.263c8.021,20.779,14.208,41.079,18.347,60.279 C379.23,343.774,358.571,348.663,336.486,352.171z M392.533,477.867c-9.404,0-17.067-7.654-17.067-17.067 c0-9.412,7.663-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067C409.6,470.212,401.946,477.867,392.533,477.867z M414.242,331.972c-5.376-24.192-13.815-49.877-24.977-76.075c10.991-25.899,19.354-51.516,24.738-75.955 c49.314,18.91,80.93,46.234,80.93,76.058C494.933,285.773,463.428,313.062,414.242,331.972z"></path> </g> </g> </g></svg>',
            'default': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M151.245,222.446C148.054,237.039,135.036,248,119.5,248c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c23.774,0,43.522-17.557,46.966-40.386c14.556-1.574,27.993-8.06,38.395-18.677c2.899-2.959,2.85-7.708-0.109-10.606 c-2.958-2.897-7.707-2.851-10.606,0.108C184.947,202.829,172.643,208,159.5,208c-26.743,0-48.5-21.757-48.5-48.5 c0-4.143-3.358-7.5-7.5-7.5s-7.5,3.357-7.5,7.5C96,191.715,120.119,218.384,151.245,222.446z"></path> <path d="M183,287.5c0-4.143-3.358-7.5-7.5-7.5c-35.014,0-63.5,28.486-63.5,63.5c0,0.362,0.013,0.725,0.019,1.088 C109.23,344.212,106.39,344,103.5,344c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5 c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.611-16.462-49.437-39.731-58.867c-0.178-1.699-0.269-3.418-0.269-5.133 c0-26.743,21.757-48.5,48.5-48.5C179.642,295,183,291.643,183,287.5z"></path> <path d="M439,223.5c0-17.075-6.82-33.256-18.875-45.156c1.909-6.108,2.875-12.426,2.875-18.844 c0-30.874-22.152-56.659-51.394-62.329C373.841,91.6,375,85.628,375,79.5c0-19.557-11.883-36.387-28.806-43.661 C317.999,13.383,287.162,0,263.5,0c-13.153,0-24.817,6.468-32,16.384C224.317,6.468,212.653,0,199.5,0 c-23.662,0-54.499,13.383-82.694,35.839C99.883,43.113,88,59.943,88,79.5c0,6.128,1.159,12.1,3.394,17.671 C62.152,102.841,40,128.626,40,159.5c0,6.418,0.965,12.735,2.875,18.844C30.82,190.244,24,206.425,24,223.5 c0,13.348,4.149,25.741,11.213,35.975C27.872,270.087,24,282.466,24,295.5c0,23.088,12.587,44.242,32.516,55.396 C56.173,353.748,56,356.626,56,359.5c0,31.144,20.315,58.679,49.79,68.063C118.611,449.505,141.965,463,167.5,463 c27.995,0,52.269-16.181,64-39.674c11.731,23.493,36.005,39.674,64,39.674c25.535,0,48.889-13.495,61.71-35.437 c29.475-9.385,49.79-36.92,49.79-68.063c0-2.874-0.173-5.752-0.516-8.604C426.413,339.742,439,318.588,439,295.5 c0-13.034-3.872-25.413-11.213-36.025C434.851,249.241,439,236.848,439,223.5z M167.5,448c-21.029,0-40.191-11.594-50.009-30.256 c-0.973-1.849-2.671-3.208-4.688-3.751C88.19,407.369,71,384.961,71,359.5c0-3.81,0.384-7.626,1.141-11.344 c0.702-3.447-1.087-6.92-4.302-8.35C50.32,332.018,39,314.626,39,295.5c0-8.699,2.256-17.014,6.561-24.379 C56.757,280.992,71.436,287,87.5,287c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5C60.757,272,39,250.243,39,223.5 c0-14.396,6.352-27.964,17.428-37.221c2.5-2.09,3.365-5.555,2.14-8.574C56.2,171.869,55,165.744,55,159.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-33.642-26.302-61.243-59.421-63.355C104.577,91.127,103,85.421,103,79.5c0-13.369,8.116-24.875,19.678-29.859 c0.447-0.133,0.885-0.307,1.308-0.527C127.568,47.752,131.447,47,135.5,47c12.557,0,23.767,7.021,29.256,18.325 c1.81,3.727,6.298,5.281,10.023,3.47c3.726-1.809,5.28-6.296,3.47-10.022c-6.266-12.903-18.125-22.177-31.782-25.462 C165.609,21.631,184.454,15,199.5,15c13.509,0,24.5,10.99,24.5,24.5v97.051c-6.739-5.346-15.25-8.551-24.5-8.551 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c13.509,0,24.5,10.99,24.5,24.5v180.279c-9.325-12.031-22.471-21.111-37.935-25.266 c-3.999-1.071-8.114,1.297-9.189,5.297c-1.075,4.001,1.297,8.115,5.297,9.189C206.8,343.616,224,366.027,224,391.5 C224,422.654,198.654,448,167.5,448z M395.161,339.807c-3.215,1.43-5.004,4.902-4.302,8.35c0.757,3.718,1.141,7.534,1.141,11.344 c0,25.461-17.19,47.869-41.803,54.493c-2.017,0.543-3.716,1.902-4.688,3.751C335.691,436.406,316.529,448,295.5,448 c-31.154,0-56.5-25.346-56.5-56.5c0-2.109-0.098-4.2-0.281-6.271c0.178-0.641,0.281-1.314,0.281-2.012V135.5 c0-13.51,10.991-24.5,24.5-24.5c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5c-9.25,0-17.761,3.205-24.5,8.551V39.5 c0-13.51,10.991-24.5,24.5-24.5c15.046,0,33.891,6.631,53.033,18.311c-13.657,3.284-25.516,12.559-31.782,25.462 c-1.81,3.727-0.256,8.214,3.47,10.022c3.726,1.81,8.213,0.257,10.023-3.47C303.733,54.021,314.943,47,327.5,47 c4.053,0,7.933,0.752,11.514,2.114c0.422,0.22,0.86,0.393,1.305,0.526C351.883,54.624,360,66.13,360,79.5 c0,5.921-1.577,11.627-4.579,16.645C322.302,98.257,296,125.858,296,159.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,6.244-1.2,12.369-3.567,18.205c-1.225,3.02-0.36,6.484,2.14,8.574 C417.648,195.536,424,209.104,424,223.5c0,26.743-21.757,48.5-48.5,48.5c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c16.064,0,30.743-6.008,41.939-15.879c4.306,7.365,6.561,15.68,6.561,24.379C424,314.626,412.68,332.018,395.161,339.807z"></path> <path d="M359.5,240c-15.536,0-28.554-10.961-31.745-25.554C358.881,210.384,383,183.715,383,151.5c0-4.143-3.358-7.5-7.5-7.5 s-7.5,3.357-7.5,7.5c0,26.743-21.757,48.5-48.5,48.5c-13.143,0-25.447-5.171-34.646-14.561c-2.898-2.958-7.647-3.007-10.606-0.108 s-3.008,7.647-0.109,10.606c10.402,10.617,23.839,17.103,38.395,18.677C315.978,237.443,335.726,255,359.5,255 c4.142,0,7.5-3.357,7.5-7.5S363.642,240,359.5,240z"></path> <path d="M335.5,328c-2.89,0-5.73,0.212-8.519,0.588c0.006-0.363,0.019-0.726,0.019-1.088c0-35.014-28.486-63.5-63.5-63.5 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5c0,1.714-0.091,3.434-0.269,5.133 C288.462,342.063,272,364.889,272,391.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.743,21.757-48.5,48.5-48.5 c4.142,0,7.5-3.357,7.5-7.5S339.642,328,335.5,328z"></path> </g> </g></svg>'
        };


        // --- State ---
        // (Keep all existing state variables)
        // ... (state variables omitted for brevity, assume they are the same as the input file) ...
        this.currentMaterial = null;
        this.availableMaterials = [];
        this.currentMaterialSettings = {};
        this.gridInstance = null;
        this.groupsData = [];
        this.ungroupedChaptersData = [];
        this.chaptersByGroup = {}; // Cache: { groupId: [chapter, chapter,...] }
        this.allChaptersData = {};   // Flat map for quick lookup: { chapterId: chapter }
        this.availableTags = [];
        this.currentFilter = { type: 'all', value: null }; // { type: 'all'|'tag'|'pinned'|'suspended', value: string|null }
        this.currentSort = { field: 'name', order: 'asc' }; // Default sort
        this.isSelectionModeActive = false;
        this.selectedItemIds = { chapters: new Set(), groups: new Set() }; // Store IDs
        this.activeContextMenuTarget = null; // { type: 'chapter'|'group'|'material', id: '...', element: ... }
        this.activeRenameTarget = null; // { type: 'chapter'|'group', id: '...', element: ... }
        this.draggedItemData = null; // { type: 'chapter'/'multi-chapter', items: [{id, ...}] }
        this.dragPreviewElement = null;
        this.chartInstance = null;
        this.isLoading = {
            dashboard: false,         // Initial load / Full refresh
            overview: false,          // Overview section (heatmaps, graph)
            chaptersUngrouped: false, // Ungrouped chapters fetch/render
            chaptersInGroup: {},      // { groupId: boolean } Fetch/render chapters inside a group
            groups: false,            // Groups list fetch
            tags: false,              // Tags list fetch/update
            materialSwitch: false,    // Switching material
            action: false,            // Generic action (rename, delete, pin, group, tag, etc.)
            settings: false,          // Loading settings modal
            saveSettings: false,      // Saving settings
        };
        this.isCreatingGroup = false; // State flag for direct group creation flow (DEPRECATED?)
        this.groupCreateSelectedChapters = new Set(); // Temp store for direct creation flow (DEPRECATED?)
        this.batchSizeSaveTimeout = null;
        // Debounced handlers (defined in constructor)
        this.saveBatchSizeDebounced = this._debounce(this._saveBatchSizeSetting, 1000);
        this.debouncedUpdateGroupLayout = this._debounce(this._handleGroupLayoutUpdateAPI, 1500);
        // Active interaction element targets
        this.activeColorPickerTarget = null; // { type: 'group', id: '...', element: ... }
        this.activeTagSelectorTarget = null; // { type: 'chapter', id: '...', element: ... } or null for bulk edit
        this.bulkActionTargetIds = null; // Array of chapterIds for bulk tag operations
        this.groupSortModalGroupId = null;
        this.isStudyOptionsPopupVisible = false; // Track popup state
        this.currentMaterialScroll = 0; // Scroll position for material switcher


        // Bind methods - IMPORTANT
        this._bindMethods();
    }

    _bindMethods() {
        // Bind all methods starting with _ or handle
        Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => typeof this[prop] === 'function' && (prop.startsWith('_') || prop.startsWith('handle')))
            .forEach(method => {
                // Avoid re-binding if already bound (e.g., via arrow functions or previous bind calls)
                // Simple check based on name prefix, might not be foolproof but works for this pattern
                if (this[method].name !== `bound ${method}`) {
                    this[method] = this[method].bind(this);
                }
            });
        // Ensure specific critical methods are bound if needed (belt-and-suspenders)
        this.initialize = this.initialize.bind(this);
        this._handleToggleSelectionMode = this._handleToggleSelectionMode.bind(this);
        this._handleSelectionToolbarClick = this._handleSelectionToolbarClick.bind(this);
        this._handleGlobalClick = this._handleGlobalClick.bind(this);
        this._handleGlobalKeydown = this._handleGlobalKeydown.bind(this);
        this._handleSortChange = this._handleSortChange.bind(this);
        this._handleTagPillOrActionClick = this._handleTagPillOrActionClick.bind(this);
        this._handleAddTagToggle = this._handleAddTagToggle.bind(this);
        this._handleAddTagInputKeydown = this._handleAddTagInputKeydown.bind(this);
        this._handleAddTagInputBlur = this._handleAddTagInputBlur.bind(this);
        this._cancelAddTagInline = this._cancelAddTagInline.bind(this);
    }

    // --- Initialization & Data Fetching ---
    // initialize(), _fetchAndRenderInitialDashboardContent(), _processSummaryData_Phase1()
    // _loadOverviewData()
    // ... (Keep existing implementations, ensure they call the *new* rendering functions where appropriate) ...
    /**
     * Initializes the view: Fetches initial data, sets up grid, renders UI.
     */
    async initialize() {
        console.log("ChapterFoldersView Initialize vNext");
        this.container?.classList.add('is-loading-main');
        if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p class="loading-text">Initializing Dashboard...</p>';
        this._renderOverviewPlaceholders(true);

        // Check Critical DOM Elements
         const criticalElements = [
              this.container, this.dashboardGridContainer, this.pillMaterialSwitcherInner,
              this.tagPillsContainer, this.sortControlsContainer, this.selectionToolbar
              // Add more critical elements if identified
         ];
         if (criticalElements.some(el => !el)) {
              console.error("Missing critical dashboard elements! Check HTML IDs.");
              if (this.container) this.container.innerHTML = "<p class='error-text'>Error: UI failed to initialize (missing elements).</p>";
              this.container?.classList.remove('is-loading-main');
              return;
         }

        // Initialize Grid Library
        this._initializeGrid();
        if (!this.gridInstance) {
            this.container?.classList.remove('is-loading-main');
            return; // Gridstack init failed
        }

        // Attach Base Event Listeners
        this._attachBaseEventListeners();
        this._attachModalListeners();

        // Fetch Initial Dashboard Data
        this._updateLoadingState('dashboard', true);
        try {
            console.log("FETCH: Initial Dashboard Summary");
            const summaryData = await apiClient.getDashboardSummary();
            console.log("FETCH_SUCCESS: Dashboard Summary", summaryData);
            // Process summary BUT defer rendering layout until dependent fetches complete
            await this._processSummaryData_Phase1(summaryData); // Renders controls, tags, pill

            // Fetch chapters and render layout AFTER phase 1 processing is done
            await this._fetchAndRenderInitialDashboardContent(); // Renders grid items

            // Fetch Overview Data SEPARATELY and AFTER dashboard basics are initiated
            await this._loadOverviewData(); // Renders overview graphs/heatmaps

        } catch (error) {
            console.error("FATAL: Failed to initialize dashboard:", error);
            this._showError(`Failed to load dashboard data: ${error.message}`);
            if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = `<p class="error-text">Could not load chapter data.</p>`;
            this._renderOverviewPlaceholders(false, true); // Show error in overview
        } finally {
            this._updateLoadingState('dashboard', false);
            this.container?.classList.remove('is-loading-main');
            console.log("INITIALIZATION COMPLETE (or failed)");
        }
    }

    /** Phase 1: Process non-chapter data from summary */
    async _processSummaryData_Phase1(summaryData) {
        console.log("DEBUG: Processing Summary Phase 1");
        if (!summaryData) throw new Error("No summary data received.");

        this.availableMaterials = summaryData.materials || [];
        this.currentMaterial = summaryData.selectedMaterialName;
        this.currentMaterialSettings = summaryData.settings || {};
        this.availableTags = this.currentMaterialSettings.uniqueTags || [];
        const defaultSort = this.currentMaterialSettings.defaultChapterSort;
        this.currentSort = (defaultSort?.field)
            ? { field: defaultSort.field, order: defaultSort.order || 'asc' }
            : { field: 'name', order: 'asc' }; // Default if no setting
        this.groupsData = summaryData.groups || [];

        console.log("DEBUG: Phase 1 - Current Material:", this.currentMaterial);
        console.log("DEBUG: Phase 1 - Current Sort:", this.currentSort);
        console.log("DEBUG: Phase 1 - Groups Found:", this.groupsData.length);
        console.log("DEBUG: Phase 1 - Tags Found:", this.availableTags.length);

        // RENDER UI ELEMENTS using processed data
        this._renderMaterialTabs(this.availableMaterials);
        this._updatePillStats(this.currentMaterial);
        this._renderTagPills(); // <= MODIFIED
        this._renderSortControls(); // <= MODIFIED (minor change likely)

        // Handle potential errors reported in the summary data
        if (summaryData.groups?.error) {
             console.error("Error fetching groups included in summary:", summaryData.groups.message);
             this._showError("Could not load chapter groups list.");
        }
        if (summaryData.settings?.error) {
            console.error("Error fetching settings included in summary:", summaryData.settings.message);
            this._showError("Could not load material settings.");
        }
    }

    /** Phase 2: Fetch chapter data (ungrouped & for groups) and render grid */
    async _fetchAndRenderInitialDashboardContent() {
        console.log("DEBUG: Fetching Initial Dashboard Content (Chapters)");
        if (!this.currentMaterial) {
             console.warn("DEBUG: Skipping chapter fetch, no current material.");
             if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p>No material selected.</p>';
             return;
        }

        // Reset chapter caches
        this.ungroupedChaptersData = [];
        this.chaptersByGroup = {};
        this.allChaptersData = {}; // Clear the flat map

        // Clear previous grid items (if any)
        this.gridInstance?.removeAll(true);
        if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = ''; // Clear loading message

        const fetchPromises = [];

        // Fetch Ungrouped
        this._updateLoadingState('chaptersUngrouped', true);
        fetchPromises.push(
             apiClient.getChapters(this.currentMaterial, {
                  groupId: 'none', // Fetch ungrouped
                  sortBy: this.currentSort.field,
                  order: this.currentSort.order,
                  suspended: false // Exclude suspended by default
             }).then(chapters => {
                  console.log(`FETCH_SUCCESS: Ungrouped Chapters (${chapters?.length || 0})`);
                  this.ungroupedChaptersData = chapters || [];
                  this.ungroupedChaptersData.forEach(ch => { this.allChaptersData[ch.id] = ch; }); // Update flat map
             }).catch(error => {
                 console.error("FETCH_ERROR: Ungrouped Chapters:", error);
                 this._showError(`Could not load ungrouped chapters: ${error.message}`);
                 this.ungroupedChaptersData = []; // Ensure empty array on error
             }).finally(() => {
                  this._updateLoadingState('chaptersUngrouped', false);
             })
        );

        // Fetch Grouped (concurrently)
        this.groupsData.forEach(group => {
            if (!group || !group.id) return; // Skip invalid groups
            this._updateLoadingState('chaptersInGroup', true, group.id);
            const sortPref = group.sortPreference || this.currentSort; // Use group pref or global default
            fetchPromises.push(
                 apiClient.getChapters(this.currentMaterial, {
                      groupId: group.id,
                      sortBy: sortPref.field,
                      order: sortPref.order,
                      suspended: false // Exclude suspended by default
                 }).then(chapters => {
                      console.log(`FETCH_SUCCESS: Group ${group.id} Chapters (${chapters?.length || 0})`);
                      this.chaptersByGroup[group.id] = chapters || [];
                      // Update flat map cache with chapters from this group
                      this.chaptersByGroup[group.id].forEach(ch => { this.allChaptersData[ch.id] = ch; });
                 }).catch(error => {
                      console.error(`FETCH_ERROR: Chapters for Group ${group.id}:`, error);
                      this._showError(`Could not load chapters for group ${group.name || group.id}: ${error.message}`);
                      this.chaptersByGroup[group.id] = []; // Ensure empty array on error
                 }).finally(() => {
                      this._updateLoadingState('chaptersInGroup', false, group.id);
                 })
             );
        });

        // Wait for ALL chapter data fetches
        await Promise.allSettled(fetchPromises);
        console.log("DEBUG: All chapter fetches complete. Rendering layout.");

        // NOW render the full layout using the populated caches
        this._renderDashboardLayout(); // <= Calls MODIFIED rendering functions
    }


    // --- Rendering Methods ---

    /** MODIFIED: Updates sort control values based on current state */
    _renderSortControls() {
        console.log("Rendering sort controls");
        // Assumes the <label> and <select> elements exist in the HTML.
        // This function just updates their values.
        if (!this.sortFieldSelect || !this.sortOrderSelect || !this.sortControlsContainer) {
             console.warn("Sort control elements not found.");
             return;
        }
        // Set dropdown values based on this.currentSort
        this.sortFieldSelect.value = this.currentSort.field;
        this.sortOrderSelect.value = this.currentSort.order;
        // Add any necessary classes or attributes if the design requires them
        // e.g., this.sortControlsContainer.classList.add('new-design-class');
    }

    /** MODIFIED: Renders the top filter/action pills/buttons based on the new structure */
    _renderTagPills() {
        console.log("Rendering tag pills / dashboard controls");
        if (!this.tagPillsContainer) return;

        this.tagPillsContainer.innerHTML = ''; // Clear existing
        const fragment = document.createDocumentFragment();

        // Helper to create buttons
        const createButton = (text, type, value = null, classes = [], action = null, id = null) => {
            const button = document.createElement('button');
            button.textContent = text;
            button.classList.add(...classes); // Add base and specific classes
            if (id) button.id = id;

            // Data attributes for functionality
            if (type === 'filter') {
                 button.dataset.filterType = value; // Use filter value as type ('all', 'pinned', 'suspended', 'tag')
                 if (value === 'tag') button.dataset.tagName = text; // Store tag name if it's a tag filter
                 button.dataset.dropTargetType = value; // Mark drop target type
            } else if (type === 'action') {
                 button.dataset.action = action; // Action identifier ('toggle-select', 'create-group', 'add-tag')
            }

            // Active state for filters
             if (type === 'filter') {
                 if (this.currentFilter.type === value) { // Direct match for 'all', 'pinned', 'suspended'
                      button.classList.add('active');
                 } else if (value === 'tag' && this.currentFilter.type === 'tag' && this.currentFilter.value === text) { // Match tag name
                      button.classList.add('active');
                 }
            }

            return button;
        };

        // 1. Filter Pills/Buttons
        fragment.appendChild(createButton('All', 'filter', 'all', ['filter-pill']));
        fragment.appendChild(createButton('Pinned', 'filter', 'pinned', ['filter-pill', 'special-filter']));
        fragment.appendChild(createButton('Suspended', 'filter', 'suspended', ['filter-pill', 'special-filter']));

        // 2. Tag Filtering Mechanism (Using Pills as assumed default)
        // TODO: Confirm if a dropdown is preferred. If so, replace this loop with <select> population.
        this.availableTags.sort().forEach(tag => {
             fragment.appendChild(createButton(tag, 'filter', 'tag', ['filter-pill', 'tag-filter'])); // Added 'tag-filter' class
        });

        // 3. Action Buttons
        const selectButton = createButton(
             this.isSelectionModeActive ? 'Cancel Select' : 'Select Chapters',
             'action', null, ['action-button'], 'toggle-select', 'selectChaptersButton'
        );
        if (this.isSelectionModeActive) selectButton.classList.add('selection-active'); // Add class if active
        fragment.appendChild(selectButton);

        // Create Group Button (assuming static ID 'createGroupButton' is used)
        fragment.appendChild(createButton('+ Create Group', 'action', null, ['action-button'], 'create-group', 'createGroupButton'));

        // Add Tag Button with internal structure
        const addTagButton = document.createElement('button');
        addTagButton.classList.add('action-button', 'add-tag-button');
        addTagButton.dataset.action = 'add-tag'; // Action identifier
        // Add inner elements for text and input
        addTagButton.innerHTML = `
             <span class="add-tag-text">+ Add Tag</span>
             <input type="text" class="add-tag-input" placeholder="New tag..." style="display: none;">
        `;
        fragment.appendChild(addTagButton);

        this.tagPillsContainer.appendChild(fragment);

        // Add specific listeners for the input inside the add tag button (RE-ATTACH)
        const input = this.tagPillsContainer.querySelector('.add-tag-input');
        if (input) {
             input.addEventListener('keydown', this._handleAddTagInputKeydown);
             input.addEventListener('blur', this._handleAddTagInputBlur);
        }

        console.log("DEBUG: Tag pills/controls rendered.");
    }


    /** MODIFIED: Renders a single group widget with the new structure */
    _renderGroupWidget(group) {
        console.log(`DEBUG: Rendering group widget START: ${group.name} (${group.id}) - Layout: ${group.layoutMode || 'card'}`);
        const groupWidget = document.createElement('div');
        groupWidget.classList.add('grid-stack-item', 'group-widget');
        groupWidget.dataset.groupId = group.id;
        groupWidget.dataset.layoutMode = group.layoutMode || 'card'; // Store layout mode
        if (group.color) {
            // Apply color as CSS variable for flexible styling
            groupWidget.style.setProperty('--group-bg-color', group.color);
        }
        groupWidget.setAttribute('gs-id', group.id); // For Gridstack identification

        const groupChapters = this.chaptersByGroup[group.id] || []; // Get cached chapters
        const avgMastery = group.stats?.averageMastery ?? '--';
        const chapterCount = group.stats?.chapterCount ?? groupChapters.length;

        // Build the inner structure required by Gridstack and the new design
        const contentDiv = document.createElement('div');
        contentDiv.className = 'grid-stack-item-content'; // REQUIRED by Gridstack

        // Header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'group-widget-header';
        headerDiv.draggable = false; // Prevent header drag from moving widget
        headerDiv.innerHTML = `
            <span class="group-name">${group.name}</span>
            <input type="text" class="rename-input group-rename-input" value="${group.name}" style="display: none;" data-original-name="${group.name}">
            <span class="group-stats" title="Average Mastery / Chapter Count">${avgMastery}% / ${chapterCount}</span>
        `;
        contentDiv.appendChild(headerDiv);

        // Chapter Area
        const chapterAreaDiv = document.createElement('div');
        chapterAreaDiv.classList.add('group-chapter-area', `layout-${group.layoutMode || 'card'}`, 'scrollable');
        contentDiv.appendChild(chapterAreaDiv);

        // Render and append chapters into the chapter area
        if (this.isLoading.chaptersInGroup[group.id]) {
            chapterAreaDiv.innerHTML = LOADING_TEXT_SMALL;
        } else if (!Array.isArray(this.chaptersByGroup[group.id])) { // Check if fetch failed or data invalid
             chapterAreaDiv.innerHTML = ERROR_TEXT_SMALL;
             console.error(`DEBUG: Chapter data missing/invalid for group ${group.id} during render.`);
        } else if (groupChapters.length === 0) {
            chapterAreaDiv.innerHTML = EMPTY_GROUP_TEXT;
        } else {
            const fragment = document.createDocumentFragment();
            groupChapters.forEach(chapter => {
                try {
                    const chapterItemElement = this._renderChapterItem(chapter, {
                        layout: group.layoutMode || 'card',
                        containerSize: group.gridSize || { rows: 1, cols: 2 } // Pass container size info
                    });
                    if (chapterItemElement) {
                        fragment.appendChild(chapterItemElement);
                    } else {
                         console.warn(`DEBUG: _renderChapterItem returned null for chapter ${chapter.id} in group ${group.id}`);
                    }
                } catch (renderError) {
                    console.error(`Error rendering chapter item ${chapter.id} inside group ${group.id}:`, renderError);
                    const errorEl = document.createElement('div');
                    errorEl.className = 'error-text-small'; // Use consistent error class
                    errorEl.textContent = `Error: ${chapter.name}`;
                    fragment.appendChild(errorEl);
                }
            });
            chapterAreaDiv.appendChild(fragment);
        }

        // Final assembly
        groupWidget.appendChild(contentDiv);

        // Attach listeners to the rename input specifically within this widget
        // Context menu handled by delegation on dashboardGridContainer
        const renameInput = headerDiv.querySelector('.group-rename-input');
        renameInput?.addEventListener('keydown', this._handleRenameInputKeydown);
        renameInput?.addEventListener('blur', this._handleRenameInputBlur);

        console.log(`DEBUG: Rendering group widget END: ${group.name}`);
        return groupWidget;
    }


    /** MODIFIED: Renders a single chapter item with the new structure */
    _renderChapterItem(chapter, options = {}) {
        const { isStandalone = false, layout = 'card', containerSize = { rows: 1, cols: 1 } } = options;
        if (!chapter || !chapter.id) { console.warn("DEBUG: Skipping render for chapter with missing data:", chapter); return null; }

        const chapterElement = document.createElement('div');
        chapterElement.draggable = true; // Make the item draggable
        chapterElement.dataset.chapterId = chapter.id;
        chapterElement.dataset.chapterName = chapter.name;
        if (chapter.groupId) {
            chapterElement.dataset.groupId = chapter.groupId;
        }

        // --- Base Classes & State ---
        chapterElement.classList.add('chapter-item'); // Base class for all chapter items
        if (chapter.isPinned) chapterElement.classList.add('is-pinned');
        if (chapter.isSuspended) chapterElement.classList.add('is-suspended'); // Add class for potential styling

        // --- Determine Layout & Size Classes ---
        let sizeClass = '';
        if (isStandalone) {
            chapterElement.classList.add('grid-stack-item', 'standalone-chapter'); // Gridstack wrapper class for standalone
            chapterElement.setAttribute('gs-id', chapter.id);
            sizeClass = 'size-full'; // Assume standalone is always full size
            chapterElement.classList.add('layout-card'); // Standalone usually uses card layout
        } else { // Grouped item
            chapterElement.classList.add(`layout-${layout}`); // Add card/list layout class
            // Determine size class based on layout and container info (passed from group render)
            if (layout === 'card') {
                sizeClass = 'size-full'; // Grouped card items are usually full size within their slot
            } else { // List layout size variations
                 // Example logic - adjust based on final design breakpoints for list items
                 const cellWidth = containerSize.cols || 1;
                 if (cellWidth >= 3) { sizeClass = 'size-wide-list'; }
                 else if (cellWidth === 2) { sizeClass = 'size-medium-list'; }
                 else { sizeClass = 'size-compact-list'; }
            }
        }
        chapterElement.classList.add(sizeClass);

        // --- Build Inner HTML ---
        // Wrapper div as requested
        let innerHTML = `<div class="chapter-item-content-wrapper">`;

        // Main Info (Name & Rename Input)
        innerHTML += `<div class="chapter-main-info">
                        <span class="chapter-item-name">${chapter.name}</span>
                        <input type="text" class="rename-input chapter-rename-input" value="${chapter.name}" style="display: none;" data-original-name="${chapter.name}">
                      </div>`;

        // Mastery Progress Bar
        const masteryPercent = Math.max(0, Math.min(100, chapter.stats?.mastery ?? 0)); // Clamp 0-100
        const masteryLevel = this._getMasteryLevelClass(masteryPercent); // low, medium, high
        innerHTML += `<div class="mastery-progress-bar-container" title="Mastery: ${masteryPercent}%">
                        <div class="mastery-progress-bar ${masteryLevel}" style="width: ${masteryPercent}%;"></div>
                      </div>`;

        // Card Stats (New Structure)
        const totalCards = chapter.stats?.cardCount ?? 0;
        const dueCards = chapter.stats?.totalDueCards ?? 0;
        const newCards = chapter.stats?.remainingNewCards ?? 0;
        innerHTML += `<div class="card-stats-new">
                        <div class="stat-item-new total-cards" title="Total Cards">
                          <!-- Include SVG Icon here if provided by UI team -->
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M14.5 3.00003L10.5 0.500031H1.5C0.947715 0.500031 0.5 0.947746 0.5 1.50003V14.5C0.5 15.0523 0.947715 15.5 1.5 15.5H14.5C15.0523 15.5 15.5 15.0523 15.5 14.5V4.50003C15.5 3.94775 15.0523 3.50003 14.5 3.50003V3.00003ZM10.5 2.31803L13.682 4.50003H10.5V2.31803ZM14.5 14.5H1.5V1.50003H9.5V5.00003C9.5 5.27617 9.72386 5.50003 10 5.50003H14.5V14.5Z"/></svg>
                          <span class="stat-value">${totalCards}</span>
                        </div>
                        <div class="stat-item-new due-cards" title="Cards Due">
                          <!-- Include SVG Icon here -->
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58875 0 0 3.58875 0 8C0 12.4112 3.58875 16 8 16C12.4112 16 16 12.4112 16 8C16 3.58875 12.4112 0 8 0ZM8.625 8.25V4.375C8.625 4.17812 8.47187 4.025 8.275 4.025H7.725C7.52812 4.025 7.375 4.17812 7.375 4.375V8.625C7.375 8.82187 7.52812 8.975 7.725 8.975H11.625C11.8219 8.975 11.975 8.82187 11.975 8.625V8.075C11.975 7.87812 11.8219 7.725 11.625 7.725H8.625V8.25Z"/></svg>
                          <span class="stat-value">${dueCards}</span>
                        </div>
                        <div class="stat-item-new new-cards" title="New Cards">
                          <!-- Include SVG Icon here -->
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M8 0C3.58875 0 0 3.58875 0 8C0 12.4112 3.58875 16 8 16C12.4112 16 16 12.4112 16 8C16 3.58875 12.4112 0 8 0ZM11.5 8.5H8.5V11.5C8.5 11.7762 8.27625 12 8 12C7.72375 12 7.5 11.7762 7.5 11.5V8.5H4.5C4.22375 8.5 4 8.27625 4 8C4 7.72375 4.22375 7.5 4.5 7.5H7.5V4.5C7.5 4.22375 7.72375 4 8 4C8.27625 4 8.5 4.22375 8.5 4.5V7.5H11.5C11.7762 7.5 12 7.72375 12 8C12 8.27625 11.7762 8.5 11.5 8.5Z"/></svg>
                          <span class="stat-value">${newCards}</span>
                        </div>
                      </div>`;

        // Pinned Indicator (if applicable)
        if (chapter.isPinned) {
            // Using a simple text indicator, UI team can style/replace with icon via CSS
            innerHTML += `<span class="pinned-indicator" title="Pinned">📌</span>`;
        }

        innerHTML += `</div>`; // End .chapter-item-content-wrapper
        chapterElement.innerHTML = innerHTML;

        // Attach Listeners specifically needed for elements inside (rename input)
        // Context menu handled by delegation on dashboardGridContainer
        const renameInput = chapterElement.querySelector('.chapter-rename-input');
        renameInput?.addEventListener('keydown', this._handleRenameInputKeydown);
        renameInput?.addEventListener('blur', this._handleRenameInputBlur);

        return chapterElement;
    }

    /** MODIFIED: Renders the dashboard layout using updated rendering functions */
    _renderDashboardLayout() {
        console.log("DEBUG: _renderDashboardLayout START");
        if (!this.gridInstance) { console.error("Grid instance not available for layout rendering."); return; }
        this._updateLoadingState('action', true); // Indicate layout update is in progress

        this.gridInstance.removeAll(true); // Clear existing widgets and DOM nodes
        this.dashboardGridContainer.innerHTML = ''; // Clear any fallback text

        const widgetsToAdd = [];

        // --- Prepare Group Widgets ---
        console.log(`DEBUG: Preparing ${this.groupsData.length} group widgets.`);
        this.groupsData.forEach(group => {
            if (!group || !group.id) { console.warn("Skipping invalid group data:", group); return; }
            try {
                 // Call the MODIFIED render function
                 const groupElement = this._renderGroupWidget(group);
                 if (groupElement) {
                      widgetsToAdd.push({
                           el: groupElement,
                           x: group.gridPosition?.col ? group.gridPosition.col - 1 : undefined,
                           y: group.gridPosition?.row ? group.gridPosition.row - 1 : undefined,
                           w: group.gridSize?.cols || 2, // Default size if not specified
                           h: group.gridSize?.rows || 1, // Default size if not specified
                           id: group.id, // Use group ID for Gridstack node ID
                           autoPosition: !(group.gridPosition?.col && group.gridPosition?.row) // Auto-position if no coords
                      });
                 }
            } catch (error) { console.error(`Error preparing group widget ${group.id}:`, error); }
        });

        // --- Prepare Ungrouped Chapter Widgets ---
        console.log(`DEBUG: Preparing ${this.ungroupedChaptersData.length} ungrouped chapter widgets.`);
        this.ungroupedChaptersData.forEach(chapter => {
             if (!chapter || !chapter.id) { console.warn("Skipping invalid ungrouped chapter data:", chapter); return; }
            try {
                 // Call the MODIFIED render function with isStandalone: true
                 const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                 if (chapterElement) {
                      // Standalone chapters default to 1x1 unless data specified otherwise
                      widgetsToAdd.push({
                           el: chapterElement,
                           x: chapter.position?.x, // Use stored position if available
                           y: chapter.position?.y,
                           w: chapter.size?.w || 1, // Default 1x1
                           h: chapter.size?.h || 1,
                           id: chapter.id, // Use chapter ID for Gridstack node ID
                           autoPosition: !(chapter.position?.x !== undefined && chapter.position?.y !== undefined) // Auto-position if no coords
                      });
                 }
            } catch (error) { console.error(`Error preparing chapter widget ${chapter.id}:`, error); }
        });

        // --- Add Widgets to Gridstack ---
        if (widgetsToAdd.length > 0) {
            console.log(`DEBUG: Adding/Configuring ${widgetsToAdd.length} widgets...`);
            this.gridInstance.batchUpdate(); // Improve performance for multiple additions
            widgetsToAdd.forEach(config => {
                try {
                    // Add widget first
                    const widgetEl = this.gridInstance.addWidget(config.el, config);

                    // Set movable/resizable state AFTER adding
                    const isGroup = widgetEl.classList.contains('group-widget');
                    // Per UI plan, only Groups are user-movable/resizable by default
                    this.gridInstance.movable(widgetEl, isGroup);
                    this.gridInstance.resizable(widgetEl, isGroup);
                    console.log(`DEBUG: Widget ${config.id || 'unknown'} added. Movable=${isGroup}, Resizable=${isGroup}`);

                } catch (e) {
                     console.error("Gridstack error adding widget:", config.id || 'unknown', e);
                     config.el?.remove(); // Clean up element if addWidget failed
                }
            });
            this.gridInstance.commit(); // Apply batch updates
            console.log("DEBUG: Gridstack batch update committed.");
        } else {
             console.log("DEBUG: No widgets to add.");
             this.dashboardGridContainer.innerHTML = '<p>No chapters or groups found.</p>'; // Fallback message
        }

        // Re-attach delegated listeners IF they were removed (unlikely with current structure)
        // this._attachGridEventListeners(); // Usually not needed with delegation

        this._updateLoadingState('action', false);
        console.log("DEBUG: Dashboard layout rendering complete.");
    }

    // --- Event Handlers & Interaction Logic ---

    /** MODIFIED: Toggles selection mode and adds/removes .selection-active on button */
    _handleToggleSelectionMode(forceState = null) {
        const targetState = forceState !== null ? forceState : !this.isSelectionModeActive;
        if (targetState === this.isSelectionModeActive) return; // No change

        this.isSelectionModeActive = targetState;
        console.log("DEBUG: Selection Mode Active:", this.isSelectionModeActive);
        this.container?.classList.toggle('selection-mode-active', this.isSelectionModeActive);

        // Clear selection when exiting
        if (!this.isSelectionModeActive) {
             this.selectedItemIds = { chapters: new Set(), groups: new Set() };
             this.dashboardGridContainer?.querySelectorAll('.is-selected').forEach(el => el.classList.remove('is-selected'));
        }

        // Update the "Select Chapters" button appearance
        if (this.selectChaptersButton) {
             this.selectChaptersButton.textContent = this.isSelectionModeActive ? 'Cancel Select' : 'Select Chapters';
             // ** Add/remove specific class for styling the active state **
             this.selectChaptersButton.classList.toggle('selection-active', this.isSelectionModeActive);
        }
         // Also re-render the whole pill bar potentially if button styles change significantly
         // this._renderTagPills(); // Option: Re-render all pills/buttons

        // Add 'selectable' class to grid items for visual cues (e.g., cursor change)
        this.dashboardGridContainer?.querySelectorAll('.grid-stack-item').forEach(el => {
             el.classList.toggle('selectable', this.isSelectionModeActive);
        });

        // Manage Gridstack interactions: Disable move/resize during selection
        if (this.gridInstance) {
             if (this.isSelectionModeActive) {
                  this.gridInstance.disable(); // Disables all move/resize
                  console.log("DEBUG: Grid interactions disabled for selection.");
             } else {
                  this.gridInstance.enable(); // Enable all first
                  // Then specifically restrict standalone chapters
                  this.gridInstance.getGridItems().forEach(item => {
                       const isGroup = item.classList.contains('group-widget');
                       this.gridInstance.movable(item, isGroup); // Only groups movable
                       this.gridInstance.resizable(item, isGroup); // Only groups resizable
                  });
                  console.log("DEBUG: Grid interactions re-enabled (groups only).");
             }
        }

        // Show/hide the selection toolbar
        if (this.selectionToolbar) {
             this.selectionToolbar.style.display = this.isSelectionModeActive ? 'flex' : 'none';
        }
        // Update toolbar content if entering selection mode
        if (this.isSelectionModeActive) {
             this._updateSelectionToolbar();
        }

         // Handle Create Group Instruction Banner visibility if applicable
         if (this.groupCreationInstruction) {
             // Hide banner when exiting selection mode or if not in create group flow
             if (!this.isSelectionModeActive || !this.isCreatingGroup) { // DEPRECATED: isCreatingGroup
                  this.groupCreationInstruction.style.display = 'none';
             }
         }
    }


    /** MODIFIED: Handles clicks within the controls/tag pills container */
    _handleTagPillOrActionClick(event) {
        // Target the button element itself
        const targetButton = event.target.closest('button');
        if (!targetButton || !this.tagPillsContainer?.contains(targetButton)) return; // Ensure click is within container

        const action = targetButton.dataset.action; // For action buttons
        const filterType = targetButton.dataset.filterType; // For filter buttons/pills
        const tagName = targetButton.dataset.tagName; // Specific for tag filters

        console.log(`DEBUG: Pill/Action click: action=${action}, filterType=${filterType}, tagName=${tagName}`);

        // --- Handle ACTION buttons ---
        if (action === 'toggle-select') {
             this._handleToggleSelectionMode();
        } else if (action === 'create-group') {
            console.log("DEBUG: Action 'create-group' clicked.");
            // Assuming this button directly opens the modal now,
            // selection happens *after* confirming the modal.
            this._handleOpenCreateGroupModal(); // Open modal for name/color
        } else if (action === 'add-tag') {
             this._handleAddTagToggle(targetButton); // Toggle inline input
        }
        // --- Handle FILTER buttons/pills ---
        else if (filterType) {
             let newFilter = { type: filterType, value: null };
             if (filterType === 'tag' && tagName) {
                  newFilter.value = tagName;
             } else if (filterType !== 'all' && filterType !== 'pinned' && filterType !== 'suspended') {
                 // If filterType is something unexpected (like 'tag' but tagName is missing), treat as 'all'
                 console.warn(`Unexpected filter type combination: ${filterType} / ${tagName}. Resetting to 'all'.`);
                 newFilter.type = 'all';
             } else {
                 newFilter.value = null; // For 'all', 'pinned', 'suspended'
                 newFilter.type = filterType; // Ensure type is set correctly
             }


             // Check if filter actually changed
             if (this.currentFilter.type === newFilter.type && this.currentFilter.value === newFilter.value) {
                 console.log("Filter unchanged.");
                 return;
             }

             this.currentFilter = newFilter;
             console.log("Filter changed:", this.currentFilter);

             // Exit selection mode if active when filter changes
             if (this.isSelectionModeActive) {
                 this._handleToggleSelectionMode(false);
             }

             this._renderTagPills(); // Update active states visually

             // Render appropriate view
             if (this.currentFilter.type === 'all') {
                 this.dashboardGridContainer?.classList.remove('filtered-view');
                 this._renderDashboardLayout(); // Render full dashboard
             } else {
                 this._renderFilteredView(this.currentFilter); // Render filtered flat list
             }
        }
    }

    /** MODIFIED: Uses new progress bar structure */
    _getMasteryLevelClass(masteryPercent) {
        // Ensure masteryPercent is a number
        const percent = Number(masteryPercent);
        if (isNaN(percent)) return 'low'; // Default if not a number

        if (percent >= 85) return 'high';
        if (percent >= 50) return 'medium';
        return 'low';
    }


    // --- Rename Handlers ---
    // These should target the new input/span classes:
    // .group-name, .group-rename-input
    // .chapter-item-name, .chapter-rename-input

    _handleRename(element, type) { // type is 'chapter' or 'group'
        if (!element || this.activeRenameTarget) return;

        // Use new class names
        const nameSpanClass = type === 'chapter' ? '.chapter-item-name' : '.group-name';
        const inputClass = type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input';

        const nameSpan = element.querySelector(nameSpanClass);
        const input = element.querySelector(inputClass);
        const id = element.dataset.chapterId || element.dataset.groupId;

        if (!nameSpan || !input || !id) {
             console.error(`Rename elements not found for ${type} ID ${id}`); return;
        }

        // Cancel any existing rename
        if (this.activeRenameTarget) this._cancelRename();

        input.value = nameSpan.textContent;
        input.dataset.originalName = nameSpan.textContent;
        element.classList.add('is-renaming'); // CSS should hide span, show input
        input.style.display = 'block'; // Ensure visibility
        input.disabled = false;
        input.focus();
        input.select();

        this.activeRenameTarget = { type, id, element }; // Store active target
        console.log(`DEBUG: Starting rename for ${type} ${id}`);
    }

    async _confirmRename() {
        if (!this.activeRenameTarget) return;
        const { type, id, element } = this.activeRenameTarget;

        const nameSpanClass = type === 'chapter' ? '.chapter-item-name' : '.group-name';
        const inputClass = type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input';
        const input = element.querySelector(inputClass);
        const nameSpan = element.querySelector(nameSpanClass);

        if (!input || !nameSpan || input.disabled) return;

        const originalName = input.dataset.originalName;
        const newName = input.value.trim();

        if (!newName) { /* ... error handling ... */ this._showError(`${type === 'chapter' ? 'Chapter' : 'Group'} name cannot be empty.`); this._cancelRename(); return; }
        if (newName === originalName) { /* ... cancel ... */ this._cancelRename(); return; }

        this._updateLoadingState('action', true);
        input.disabled = true;
        element.style.cursor = 'wait';
        const tempTarget = this.activeRenameTarget;
        this.activeRenameTarget = null; // Clear state

        try {
            let result;
            if (tempTarget.type === 'chapter') {
                 const chapterData = this._findChapterData(tempTarget.id);
                 if (!chapterData) throw new Error("Chapter data not found locally.");
                 // API uses OLD NAME for lookup
                 result = await apiClient.renameChapter(this.currentMaterial, originalName, newName);
                 // Update local cache (flat map and potentially grouped list)
                 chapterData.name = newName;
                 if (this.allChaptersData[tempTarget.id]) this.allChaptersData[tempTarget.id].name = newName;
                 // Update element data attribute for consistency
                 element.dataset.chapterName = newName;

            } else { // type === 'group'
                 result = await apiClient.updateGroup(tempTarget.id, { name: newName });
                 const groupData = this._findGroupData(tempTarget.id);
                 if (groupData) groupData.name = newName;
            }
            console.log(`${tempTarget.type} rename successful:`, result);
            nameSpan.textContent = newName; // Update UI span
            element.classList.remove('is-renaming'); // Hide input via CSS
            input.style.display = 'none';
            this._showInfoMessage(`${tempTarget.type === 'chapter' ? 'Chapter' : 'Group'} renamed to "${newName}".`);

        } catch (error) { /* ... error handling ... */
            console.error(`Failed to rename ${tempTarget.type}:`, error);
            this._showError(`Could not rename ${tempTarget.type}: ${error.message}`);
            input.value = originalName; // Revert input value
            element.classList.remove('is-renaming'); // Revert UI state
            input.style.display = 'none';
            nameSpan.style.display = ''; // Ensure span is visible again
        } finally {
            input.disabled = false;
            element.style.cursor = '';
            this._updateLoadingState('action', false);
            this.activeRenameTarget = null; // Ensure cleared
        }
    }

    _cancelRename() {
        if (!this.activeRenameTarget) return;
        const { type, element } = this.activeRenameTarget;

        const nameSpanClass = type === 'chapter' ? '.chapter-item-name' : '.group-name';
        const inputClass = type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input';
        const input = element.querySelector(inputClass);
        const nameSpan = element.querySelector(nameSpanClass);

        element.classList.remove('is-renaming');
        if (input) {
             input.value = input.dataset.originalName || nameSpan?.textContent || ''; // Reset value
             input.style.display = 'none';
             input.disabled = false;
        }
        if (nameSpan) nameSpan.style.display = ''; // Ensure span is visible
        element.style.cursor = '';
        this.activeRenameTarget = null; // Clear state
        console.log("DEBUG: Rename cancelled.");
    }


    // --- Gridstack Handlers ---
    // _initializeGrid, _handleGridItemStackChanged, _updateGroupPositionAPI, _updateGroupSizeAPI
    // The logic identifying groups vs chapters based on class/dataset should still work.
    // Ensure Gridstack options match desired behavior (e.g., disabling drag/resize for chapters).

   _initializeGrid() {
        console.log("Initializing Gridstack vNext");
        if (!this.dashboardGridContainer) { /* ... error ... */ console.error("Cannot initialize Gridstack: Container element not found."); return; }
        try {
             if (typeof GridStack === 'undefined') { throw new Error("GridStack library not loaded."); }

             this.gridInstance = GridStack.init({
                column: 4, // Adjust as needed based on new design
                cellHeight: 'auto', // Let content determine height initially? Or set fixed value?
                // cellHeight: 150, // Example fixed height
                margin: 15, // Adjust spacing
                float: false, // Usually better for dashboards
                // We don't accept widgets via drag *from outside* the grid in this view
                // acceptWidgets: false,
                itemClass: 'grid-stack-item', // Default class
                // Disable Gridstack's built-in resize handles if using custom ones or CSS only
                resizable: {
                    handles: '' // Example: Use CSS for handles or rely on group-only resizing logic
                },
                // Disable Gridstack's built-in move handle if needed
                // handle: '.your-custom-drag-handle' // Or rely on group-only dragging logic
             }, this.dashboardGridContainer);

            // Attach Gridstack event listeners
            const debouncedHandler = this._debounce(this._handleGridItemStackChanged, 1500);
            this.gridInstance.on('resizestop dragstop', debouncedHandler);

            console.log("Gridstack initialized successfully.");
        } catch (error) {
             console.error("Failed to initialize Gridstack:", error);
              if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = `<p class="error-text">Error initializing layout library.</p>`;
             this.gridInstance = null;
        }
    }

    _handleGridItemStackChanged(event, element) {
        // This handler logic should still work as it identifies groups vs chapters
        // based on `element.dataset.groupId` and `element.classList.contains('group-widget')`.
        // Ensure the API calls `_updateGroupPositionAPI` and `_updateGroupSizeAPI` are still correct.
        console.log(`DEBUG: Gridstack event: ${event.type} on element:`, element?.dataset?.groupId || element?.dataset?.chapterId);

        if (!element || !this.gridInstance?.isWidget(element)) { console.warn("Gridstack event on non-widget/null element."); return; }

        const groupId = element.dataset.groupId;
        const isGroup = element.classList.contains('group-widget');
        const node = this.gridInstance.getNodeData(element); // Use Gridstack's method to get node info

        if (!node) { console.warn("Could not get Gridstack node data for element:", element); return; }

        if (isGroup && groupId) {
            const groupData = this._findGroupData(groupId);
            if (!groupData) { console.warn(`Group data not found for ID ${groupId} during grid change.`); return; }

            if (event.type === 'dragstop') {
                // Gridstack uses 0-based index (node.x, node.y)
                const newPosition = { row: node.y + 1, col: node.x + 1 }; // API expects 1-based? Verify API doc. Assume 1-based.
                // Check if position actually changed
                if (groupData.gridPosition?.row !== newPosition.row || groupData.gridPosition?.col !== newPosition.col) {
                    console.log(`DEBUG: Group ${groupId} DRAGGED to: r${newPosition.row}, c${newPosition.col}`);
                    groupData.gridPosition = newPosition; // Optimistic update
                    this._updateGroupPositionAPI(groupId, newPosition); // API call
                }
            } else if (event.type === 'resizestop') {
                 // Gridstack provides width/height in grid units (node.w, node.h)
                const newSize = { rows: node.h, cols: node.w };
                // Check if size actually changed
                if (groupData.gridSize?.rows !== newSize.rows || groupData.gridSize?.cols !== newSize.cols) {
                    console.log(`DEBUG: Group ${groupId} RESIZED to: ${newSize.cols}x${newSize.rows}`);
                    groupData.gridSize = newSize; // Optimistic update
                    this._updateGroupSizeAPI(groupId, newSize); // API call
                    // Re-fetch/render chapters within the group as size affects their layout
                    this._fetchAndRenderGroupChapters(groupId); // Refresh chapters
                }
            }
        } else {
             // Handle standalone chapter move/resize stop IF that's allowed/tracked
             // Currently, only groups are meant to be user-movable/resizable
             console.log(`DEBUG: Standalone chapter ${element.dataset.chapterId} moved/resized (if tracking enabled).`);
             // TODO: Implement API calls for standalone chapter position/size if needed
        }
    }

        async _fetchAndRenderUngroupedChapters(forceWidgetRecreation = false) {
            if (!this.gridInstance) return; // Guard against missing grid
            // Only proceed if dashboard view is active
            if (this.currentFilter.type !== 'all') {
                 console.log("DEBUG: Skipping ungrouped refresh (filtered view active).");
                 return;
            }
            console.log("DEBUG: Refreshing Ungrouped Chapters. Sort:", this.currentSort);
            this._updateLoadingState('chaptersUngrouped', true);
    
            let fetchedChapters = [];
            try {
                fetchedChapters = await apiClient.getChapters(this.currentMaterial, {
                     groupId: 'none', sortBy: this.currentSort.field, order: this.currentSort.order, suspended: false
                });
                fetchedChapters = fetchedChapters || [];
                const oldUngroupedIds = new Set(this.ungroupedChaptersData.map(c => c.id));
                const newUngroupedIds = new Set(fetchedChapters.map(c => c.id));
    
                this.ungroupedChaptersData = fetchedChapters; // Update local cache
                this.ungroupedChaptersData.forEach(ch => { this.allChaptersData[ch.id] = ch; }); // Update flat map
    
                this.gridInstance.batchUpdate();
    
                // Remove chapters that are no longer ungrouped
                oldUngroupedIds.forEach(id => {
                     if (!newUngroupedIds.has(id)) {
                          const el = this.gridInstance.engine.nodes.find(n => n.id === id)?.el;
                          if (el && this.gridInstance.isWidget(el)) {
                               try { this.gridInstance.removeWidget(el, true, false); console.log(`DEBUG: Removed old ungrouped ${id}`);} // Remove DOM node too
                               catch(e){ console.warn("Error removing old ungrouped widget", e); el?.remove(); }
                          }
                     }
                });
    
                // Add or update chapters
                fetchedChapters.forEach(chapter => {
                     const existingNode = this.gridInstance.engine.nodes.find(n => n.id === chapter.id);
                     if (existingNode && !forceWidgetRecreation) {
                          // Widget exists, maybe update content? For sorting, position is handled by Gridstack if using its sort mechanisms, or by removal/re-adding if not. Since we remove old ones first, this path might not be hit often for sorting.
                          console.log(`DEBUG: Ungrouped chapter ${chapter.id} exists, potential update needed.`);
                          // Example crude update:
                          // const newElement = this._renderChapterItem(chapter, { isStandalone: true });
                          // if (newElement && existingNode.el) existingNode.el.innerHTML = newElement.innerHTML;
                     } else if (!existingNode) {
                          // Chapter is new or needs re-adding, add it
                          const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                          if (chapterElement) {
                               try { this.gridInstance.addWidget(chapterElement, { autoPosition: true, w: 1, h: 1, id: chapter.id }); console.log(`DEBUG: Added new ungrouped widget ${chapter.id}`);}
                               catch (e) { console.error("Error adding new ungrouped widget:", e); chapterElement.remove();}
                          }
                     } else if (existingNode && forceWidgetRecreation) {
                         // Force recreation: remove existing, add new
                          const el = existingNode.el;
                          try { this.gridInstance.removeWidget(el, true, false); console.log(`DEBUG: Force removing widget ${chapter.id} for re-adding`);}
                          catch(e){ console.warn("Error force removing widget", e); el?.remove(); }
    
                          const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                          if (chapterElement) {
                               try { this.gridInstance.addWidget(chapterElement, { autoPosition: true, w: 1, h: 1, id: chapter.id }); console.log(`DEBUG: Force re-added widget ${chapter.id}`);}
                               catch (e) { console.error("Error force re-adding widget:", e); chapterElement.remove();}
                          }
                     }
                });
    
                this.gridInstance.commit();
                console.log("DEBUG: Ungrouped chapters update committed.");
    
            } catch (error) { console.error("Failed fetch/render ungrouped:", error); }
            finally { this._updateLoadingState('chaptersUngrouped', false); }
        }

    // --- Other Methods ---
    // Keep remaining methods (_bindMethods, initialize, data fetching, modals, context menus,
    // drag/drop, selection logic, helpers like _findChapterData, _debounce, etc.)
    // Ensure querySelectors and class checks within these methods are updated if the
    // surrounding HTML structure changes significantly.
    // For example, `_handleContextMenu` needs to correctly find `.chapter-item` and `.group-widget`
    // within the potentially changed DOM.

    // Add other existing methods back here...
    // _bindMethods already included
    // initialize already included
    async _loadOverviewData() { /* ... Keep existing ... */
        console.log("DEBUG: Loading overview section data...");
        if (!this.currentMaterial) { /* ... */ return; }
        this._updateLoadingState('overview', true);
        // DO NOT call _renderOverviewPlaceholders here - let specific renders handle state

        try {
            const results = await Promise.allSettled([
                 apiClient.getChapterMastery(this.currentMaterial),
                 apiClient.getRecentStudyStats(),
                 apiClient.getDueTimeline(this.currentMaterial)
            ]);
            console.log("DEBUG: Overview data fetched results:", results);

            // Process Mastery Heatmap (Keep if still part of design)
            const masteryResult = results[0];
            if (this.heatmapGrid) { // Only render if element exists
                if (masteryResult.status === 'fulfilled') this._renderHeatmap(masteryResult.value || []);
                else { console.error("DEBUG: Failed mastery:", masteryResult.reason); this._renderHeatmap(null, true); }
            }

            // Process Activity Heatmap
            const activityResult = results[1];
             if (this.reviewActivityGrid) { // Only render if element exists
                if (activityResult.status === 'fulfilled') this._renderReviewActivityHeatmap(activityResult.value);
                else { console.error("DEBUG: Failed activity:", activityResult.reason); this._renderReviewActivityHeatmap(null, true); }
            }

            // Process Timeline Graph
            const timelineResult = results[2];
             if (this.reviewScheduleCanvas) { // Only render if element exists
                if (timelineResult.status === 'fulfilled') {
                    const timelineData = timelineResult.value;
                    console.log("DEBUG TIMELINE: Data received:", JSON.stringify(timelineData));
                    if (!timelineData || Object.keys(timelineData).length === 0) {
                        console.log("DEBUG TIMELINE: Empty timeline data received");
                    }
                    this._renderTimelineGraph(timelineData);
                } else {
                    console.error("DEBUG: Failed timeline:", timelineResult.reason);
                    this._renderTimelineGraph(null, false, true);
                }
            }

        } catch (error) {
            console.error("DEBUG: Unexpected error in _loadOverviewData:", error);
            this._renderOverviewPlaceholders(false, true);
        } finally {
            this._updateLoadingState('overview', false);
        }
    }
    _renderOverviewPlaceholders(showLoading, showError = false) { /* ... Keep existing ... */
         console.log(`DEBUG: Rendering overview placeholders: loading=${showLoading}, error=${showError}`);
         const loadingMsg = '<p class="loading-text">Loading...</p>';
         const errorMsg = '<p class="error-text">Error loading data</p>';
         const message = showError ? errorMsg : (showLoading ? loadingMsg : '');

         if (this.heatmapGrid) this.heatmapGrid.innerHTML = message; // Handle mastery heatmap placeholder
         if (this.reviewActivityGrid) this.reviewActivityGrid.innerHTML = message; // Handle activity heatmap placeholder

         // Timeline graph handles its own state via _renderTimelineGraph
          if(!showLoading && !showError && this.reviewScheduleContainer && !this.chartInstance){
               // If not loading and no error, but graph failed to render, ensure status is cleared or shows default
               const graphStatusMsg = this.reviewStatusElement?.textContent;
               if(!graphStatusMsg || graphStatusMsg.includes('Loading')) {
                    this._renderTimelineGraph(null); // Render empty state
               }
          } else if (showLoading || showError) {
               // Explicitly set loading/error state for the graph area
                this._renderTimelineGraph(null, showLoading, showError);
          }
    }
    _attachBaseEventListeners() { /* ... Keep existing, verify selectors inside ... */
         console.log("Attaching base event listeners vNext");
         // --- Context Menus ---
         // Listen on the container and delegate based on target closest element
         this.dashboardGridContainer?.addEventListener('contextmenu', this._handleContextMenu);
         this.materialContextMenu?.addEventListener('click', this._handleMaterialContextMenuClick);
         // Note: Individual menu item clicks are handled within their specific handlers
         // this.groupContextMenu?.addEventListener('click', this._handleGroupContextMenuClick); // Now delegated
         // this.chapterContextMenu?.addEventListener('click', this._handleChapterContextMenuClick); // Now delegated

         // --- Modals --- (Modal-specific actions handled in _attachModalListeners)
         // Generic modal close buttons (assuming they have data-action="close")
         this.errorModalActions?.addEventListener('click', (e) => e.target.matches('[data-action="close"]') && this._hideModal('errorModal'));
         this.infoModalActions?.addEventListener('click', (e) => e.target.matches('[data-action="close"]') && this._hideModal('infoModal'));
         // Close modals on backdrop click
         this.confirmationModalOverlay?.addEventListener('click', (e) => e.target === this.confirmationModalOverlay && this._hideModal('confirmationModal'));
         this.errorModalOverlay?.addEventListener('click', (e) => e.target === this.errorModalOverlay && this._hideModal('errorModal'));
         this.infoModalOverlay?.addEventListener('click', (e) => e.target === this.infoModalOverlay && this._hideModal('infoModal'));
         this.settingsModalOverlay?.addEventListener('click', (e) => e.target === this.settingsModalOverlay && this._handleSettingsCancel()); // Specific cancel logic
         this.tagManagementModalOverlay?.addEventListener('click', (e) => e.target === this.tagManagementModalOverlay && this._hideModal('tagManagementModal'));
         this.createGroupModalOverlay?.addEventListener('click', (e) => e.target === this.createGroupModalOverlay && this._handleCancelModal('createGroupModal'));
         this.groupSortModalOverlay?.addEventListener('click', (e) => e.target === this.groupSortModalOverlay && this._handleCancelModal('groupSortModal'));
         this.tagSelectorModalOverlay?.addEventListener('click', (e) => e.target === this.tagSelectorModalOverlay && this._handleCancelModal('tagSelectorModal'));
         this.colorPickerModalOverlay?.addEventListener('click', (e) => e.target === this.colorPickerModalOverlay && this._handleCancelModal('groupColorPickerModal'));


         // --- Top Controls (Sort, Tag Pills/Actions) ---
         this.sortFieldSelect?.addEventListener('change', this._handleSortChange);
         this.sortOrderSelect?.addEventListener('change', this._handleSortChange);
         this.tagPillsContainer?.addEventListener('click', this._handleTagPillOrActionClick); // Handles filters AND actions

         // --- Selection Toolbar ---
         this.selectionToolbar?.addEventListener('click', this._handleSelectionToolbarClick);
         this.confirmGroupSelectionButton?.addEventListener('click', this._handleConfirmGroupSelection); // Specific button in toolbar


         // --- Floating Pill ---
         this.pillMaterialSwitcher?.addEventListener('click', this._handleMaterialSwitch);
         this.pillMaterialSwitcher?.addEventListener('contextmenu', this._handleMaterialContextMenu);
         this.pillStudyDueButton?.addEventListener('click', this._handleStudyDueClick);
         this.pillOptionsTrigger?.addEventListener('click', this._handleToggleStudyOptionsPopup);
         this.pillStartFocusedButton?.addEventListener('click', this._handleFocusedStudyClick);
         this.pillReviewBatchSize?.addEventListener('input', this._handleBatchSizeChange);
         this.pillMaterialSwitcher?.addEventListener('wheel', this._handleMaterialScroll, { passive: false }); // Add scroll listener


         // --- Global Listeners ---
         document.addEventListener('click', this._handleGlobalClick, true); // Use capture phase maybe? Test needed. Standard bubble phase is usually okay.
         document.addEventListener('keydown', this._handleGlobalKeydown);


         // --- Drag and Drop Listeners (Delegated on Grid Container) ---
         this.dashboardGridContainer?.addEventListener('dragstart', this._handleDragStart);
         this.dashboardGridContainer?.addEventListener('dragend', this._handleDragEnd);
         // Drag over/leave/drop listeners needed on potential drop targets
         // Grid background (for ungroup)
         this.dashboardGridContainer?.addEventListener('dragover', this._handleDragOver);
         this.dashboardGridContainer?.addEventListener('dragleave', this._handleDragLeave);
         this.dashboardGridContainer?.addEventListener('drop', this._handleDrop);
         // Tag pills container (for tag/pin/suspend drops)
         this.tagPillsContainer?.addEventListener('dragover', this._handleDragOver);
         this.tagPillsContainer?.addEventListener('dragleave', this._handleDragLeave);
         this.tagPillsContainer?.addEventListener('drop', this._handleDrop);
         // Note: dragover/leave/drop on individual groups is handled by the listener on dashboardGridContainer
         // because the event will bubble up. _handleDragOver checks event.target.closest().

         // --- Grid Item Clicks (Delegated) ---
         this.dashboardGridContainer?.addEventListener('click', this._handleGridItemClick);

    }
    _attachModalListeners() { /* ... Keep existing ... */
        console.log("DEBUG: Attaching modal-specific listeners");

        // Tag Management Modal
        this.createTagButton?.addEventListener('click', this._handleCreateTag);
        // Note: Delete tag buttons added dynamically in _handleOpenTagManagementModal

        // Group Sort Modal
        this.groupSortConfirmButton?.addEventListener('click', this._handleGroupSortConfirm);

        // Group Color Picker Modal
        // Use confirm button if one exists, otherwise use change event on input
        const colorConfirmButton = this.colorPickerModalOverlay?.querySelector('[data-action="confirm-color"]');
        if (colorConfirmButton) {
             colorConfirmButton.addEventListener('click', this._handleConfirmGroupColor);
        } else {
             this.colorPickerInput?.addEventListener('change', this._handleConfirmGroupColor); // Fallback to change event
        }
        // Add cancel listener if needed
        const colorCancelButton = this.colorPickerModalOverlay?.querySelector('[data-action="cancel-color"]');
        colorCancelButton?.addEventListener('click', () => this._handleCancelModal('groupColorPickerModal'));


        // Chapter Tag Selector Modal
        this.tagSelectorConfirmButton?.addEventListener('click', this._handleConfirmChapterTags);
        // Note: Checkbox interactions are handled by reading state in _handleConfirmChapterTags

        // Settings Modal
        this.settingsSaveButton?.addEventListener('click', this._handleSettingsSave);
        this.settingsCancelButton?.addEventListener('click', this._handleSettingsCancel); // Uses specific cancel logic

        // Create Group Modal
        this.createGroupConfirmButton?.addEventListener('click', this._handleCreateGroupConfirm);


        console.log("DEBUG: Modal-specific listeners attached.");
   }
    _handleSortChange() { /* ... Keep existing ... */
        console.log("DEBUG: Sort changed");
        const newField = this.sortFieldSelect?.value;
        const newOrder = this.sortOrderSelect?.value;
        if (!newField || !newOrder || (newField === this.currentSort.field && newOrder === this.currentSort.order)) return;

        this.currentSort = { field: newField, order: newOrder };
        console.log("DEBUG: New global sort:", this.currentSort);

        this._updateLoadingState('action', true);
        // Save preference async, but update UI immediately
        apiClient.setDefaultChapterSort(this.currentMaterial, newField, newOrder)
            .catch(error => console.error("Failed to save default sort preference:", error));

        // Refresh view based on current filter state
        const refreshPromise = this.currentFilter.type === 'all'
            ? this._fetchAndRenderUngroupedChapters() // Refresh only ungrouped in dashboard view
            : this._renderFilteredView(this.currentFilter); // Refresh filtered view

        refreshPromise.finally(() => this._updateLoadingState('action', false));
    }
    _handleAddTagToggle(buttonElement) { /* ... Keep existing ... */
        const input = buttonElement.querySelector('.add-tag-input');
        const text = buttonElement.querySelector('.add-tag-text');
        if (!input || !text) return;

        const isEditing = buttonElement.classList.contains('is-editing');

        if (!isEditing) {
            console.log("DEBUG: Enabling inline tag input");
            if (this.activeRenameTarget) this._cancelRename(); // Cancel rename if active

            input.value = '';
            buttonElement.classList.add('is-editing');
            input.style.display = 'block'; // Use block or flex depending on CSS needs
            text.style.display = 'none';
            input.focus();
        }
        // Blur/Enter handlers will exit editing state
    }
    async _handleAddTagInputKeydown(event) { /* ... Keep existing ... */
       if (event.key !== 'Enter') return;
       event.preventDefault();
       const input = event.target;
       const buttonElement = input.closest('.add-tag-button');
       const newTagName = input.value.trim();

       if (!newTagName) { this._cancelAddTagInline(buttonElement); return; }
       if (this.availableTags.includes(newTagName)) { this._showError(`Tag "${newTagName}" already exists.`, true); input.select(); return; }

       console.log(`DEBUG: Creating tag "${newTagName}" via inline input`);
       input.disabled = true;
       this._updateLoadingState('action', true);

       try {
           const result = await apiClient.createMaterialTag(this.currentMaterial, newTagName);
           this.availableTags = result.tags || this.availableTags;
           this._renderTagPills(); // Re-render implicitly cancels inline edit state
           this._showInfoMessage(`Tag "${newTagName}" created.`);
       } catch (error) {
           console.error("Failed to create tag inline:", error);
           this._showError(`Could not create tag: ${error.message}`);
           input.disabled = false; input.focus();
       } finally {
           this._updateLoadingState('action', false);
           // Ensure input is re-enabled if render didn't happen fast enough
            const potentiallyNewInput = buttonElement?.querySelector('.add-tag-input');
            if (potentiallyNewInput) potentiallyNewInput.disabled = false;
       }
    }
    _handleAddTagInputBlur(event) { /* ... Keep existing ... */
        setTimeout(() => {
            const input = event.target;
            const buttonElement = input.closest('.add-tag-button');
            // Check if focus moved outside the button AND it's still editing
            if (buttonElement?.classList.contains('is-editing') && !buttonElement.contains(document.activeElement)) {
                 console.log("DEBUG: Cancelling inline tag add due to blur");
                 this._cancelAddTagInline(buttonElement);
            }
        }, 150);
    }
    _cancelAddTagInline(buttonElement) { /* ... Keep existing ... */
       if (!buttonElement) return;
       const input = buttonElement.querySelector('.add-tag-input');
       const text = buttonElement.querySelector('.add-tag-text');
       if (!input || !text) return;

       buttonElement.classList.remove('is-editing');
       input.style.display = 'none';
       text.style.display = ''; // Reset display (CSS handles default)
       input.disabled = false;
       input.value = '';
    }
    _handleContextMenu(event) { /* ... Keep existing context menu logic ... */
         event.preventDefault();
         this._hideContextMenu(); // Hide previous menus

         const chapterItemElement = event.target.closest('.chapter-item'); // Works for grouped and standalone
         const groupWidgetElement = event.target.closest('.group-widget.grid-stack-item');
         const materialTabElement = event.target.closest('.material-tab'); // Check for material tab context menu

         let type = null, id = null, element = null;

         if (materialTabElement && this.pillMaterialSwitcher?.contains(materialTabElement)) {
             type = 'material';
             id = materialTabElement.dataset.material;
             element = materialTabElement;
             console.log(`DEBUG: Context menu target identified as MATERIAL ${id}`);
         } else if (chapterItemElement) { // Prioritize chapter
              // Prevent context menu on active rename input inside a chapter
              if (event.target.classList.contains('chapter-rename-input') && chapterItemElement.classList.contains('is-renaming')) return;
              type = 'chapter'; id = chapterItemElement.dataset.chapterId; element = chapterItemElement;
              console.log(`DEBUG: Context menu target identified as CHAPTER ${id}`);
         } else if (groupWidgetElement) { // Fallback to group
              // Prevent context menu on active rename input inside a group header
              if (event.target.classList.contains('group-rename-input') && groupWidgetElement.classList.contains('is-renaming')) return;
              type = 'group'; id = groupWidgetElement.dataset.groupId; element = groupWidgetElement;
              console.log(`DEBUG: Context menu target identified as GROUP ${id}`);
         } else {
              console.log("DEBUG: Context menu click not on a valid target.");
              return; // Not on a valid target
         }

         if (!type || !id || !element) return;

         this.activeContextMenuTarget = { type, id, element };
         let menuElement;
         switch (type) {
              case 'material':
                   menuElement = this.materialContextMenu;
                   this.materialContextMenuTargetMaterial = id; // Keep for handler
                   break;
              case 'group':
                   menuElement = this.groupContextMenu;
                   // TODO: Setup group menu items if needed based on group state (e.g., disable ungroup if empty)
                   break;
              case 'chapter':
                   menuElement = this.chapterContextMenu;
                   this._setupChapterContextMenu(id);
                   break;
              default: return; // Should not happen
         }

         if (!menuElement) {
              console.warn(`Context menu element for type '${type}' not found.`); return;
         }

         this._positionAndShowContextMenu(menuElement, event);
    }
    _handleGroupContextMenuClick(event) { /* ... Keep existing ... */
        const actionItem = event.target.closest('li[data-action]');
        if (!actionItem || !this.activeContextMenuTarget || this.activeContextMenuTarget.type !== 'group') { this._hideContextMenu(); return; }
        const action = actionItem.dataset.action;
        const groupId = this.activeContextMenuTarget.id;
        const groupElement = this.activeContextMenuTarget.element;
        const groupData = this._findGroupData(groupId);
        this._hideContextMenu(); // Hide menu immediately
        if (!groupData || !groupElement) { console.error(`Group data/element missing for ID: ${groupId}`); return; }

        console.log(`DEBUG: Group Action: ${action} on Group: ${groupId}`);
        switch (action) {
             case 'toggle-layout': this._handleToggleGroupLayout(groupId, groupData, groupElement); break;
             case 'change-color': this._handleOpenGroupColorPicker(groupId, groupData); break;
             case 'ungroup': this._handleUngroupChapters(groupId, groupElement); break;
             case 'rename': this._handleRename(groupElement, 'group'); break;
             case 'set-sort': this._handleOpenGroupSortModal(groupId, groupData); break;
             case 'delete': this._handleDeleteGroup(groupElement, groupData); break; // Added Delete Group Action
             default: console.warn(`Unknown group action: ${action}`);
        }
    }
    _handleChapterContextMenuClick(event) { /* ... Keep existing ... */
         const actionItem = event.target.closest('li[data-action]');
         if (!actionItem || !this.activeContextMenuTarget || this.activeContextMenuTarget.type !== 'chapter') { this._hideContextMenu(); return; }
         const action = actionItem.dataset.action;
         const chapterId = this.activeContextMenuTarget.id;
         const chapterElement = this.activeContextMenuTarget.element;
         const chapterData = this._findChapterData(chapterId);
         this._hideContextMenu();
         if (!chapterData || !chapterElement) { console.error(`Chapter data/element not found for ID: ${chapterId}`); return; }

        console.log(`DEBUG: Chapter Action: ${action} on Chapter: ${chapterId}`);
        switch (action) {
            case 'rename': this._handleRename(chapterElement, 'chapter'); break;
            case 'pin': this._handleTogglePinChapter(chapterId, chapterElement); break;
            case 'suspend': this._handleToggleSuspendChapter(chapterId, chapterElement); break;
            case 'add-tag': this._handleOpenChapterTagSelector(chapterId, chapterData); break;
            case 'delete': this._handleDeleteChapter(chapterElement, chapterData.name); break; // Pass name too
            default: console.warn(`Unknown chapter action: ${action}`);
        }
    }
    _handleSelectionClick(event) { /* ... Keep existing logic, ensure closest() targets work ... */
         if (!this.isSelectionModeActive) return;
         // Target can be .chapter-item (standalone or grouped) or .group-widget
         const targetItemElement = event.target.closest('.chapter-item, .group-widget.grid-stack-item');
         if (!targetItemElement) return;

         // Prevent click-through from interactive elements inside selectable items (e.g., rename input)
         if (event.target.closest('input, button, a')) {
              // Exception: Allow click if it's the item itself and NOT specifically the input/button etc.
              if (event.target !== targetItemElement && !targetItemElement.contains(event.target)) {
                   return;
              }
         }

         event.stopPropagation(); // Prevent grid click from navigating if selection handled

         const chapterId = targetItemElement.dataset.chapterId;
         const groupId = targetItemElement.dataset.groupId;
         let idToToggle = null;
         let type = null; // 'chapters' or 'groups'

         // Determine if it's a chapter or a group widget
         if (targetItemElement.classList.contains('group-widget')) {
              idToToggle = groupId; type = 'groups';
         } else if (targetItemElement.classList.contains('chapter-item') && chapterId) {
              idToToggle = chapterId; type = 'chapters';
         }

         if (idToToggle && type) {
              const currentSet = this.selectedItemIds[type];
              const isSelected = currentSet.has(idToToggle);

              if (isSelected) {
                   currentSet.delete(idToToggle);
                   targetItemElement.classList.remove('is-selected');
              } else {
                   currentSet.add(idToToggle);
                   targetItemElement.classList.add('is-selected');
              }
              console.log("DEBUG: Selection updated:", this.selectedItemIds);
              this._updateSelectionToolbar(); // Update count and button states
         }
    }
     _updateSelectionToolbar() { /* ... Keep existing logic ... */
        if (!this.selectionToolbar) return;
        const chapterCount = this.selectedItemIds.chapters.size;
        const groupCount = this.selectedItemIds.groups.size;
        const totalSelected = chapterCount + groupCount;
        const countSpan = this.selectionToolbar.querySelector('#selectionCount'); // Assuming ID exists

        let text = `${totalSelected} item${totalSelected !== 1 ? 's' : ''} selected`;
        if (chapterCount > 0 && groupCount > 0) {
             text = `${chapterCount} chapter${chapterCount !== 1 ? 's' : ''}, ${groupCount} group${groupCount !== 1 ? 's' : ''} selected`;
        } else if (chapterCount > 0) {
             text = `${chapterCount} chapter${chapterCount !== 1 ? 's' : ''} selected`;
        } else if (groupCount > 0) {
             text = `${groupCount} group${groupCount !== 1 ? 's' : ''} selected`;
        }

        if (countSpan) countSpan.textContent = text;

         // Enable/disable bulk action buttons based on selection
         const canTag = chapterCount > 0;
         const canPinSuspend = chapterCount > 0;
         const canGroup = chapterCount > 0; // Can group chapters
         const canDeleteChapters = chapterCount > 0;
         const canDeleteGroups = groupCount > 0; // Maybe add separate delete groups button?
         const canDelete = canDeleteChapters || canDeleteGroups; // Combined delete? Assume delete button targets chapters for now based on original code.

         this.selectionToolbar.querySelector('#tagSelectedButton')?.toggleAttribute('disabled', !canTag);
         this.selectionToolbar.querySelector('#pinSelectedButton')?.toggleAttribute('disabled', !canPinSuspend);
         this.selectionToolbar.querySelector('#suspendSelectedButton')?.toggleAttribute('disabled', !canPinSuspend);
         this.selectionToolbar.querySelector('#groupSelectedButton')?.toggleAttribute('disabled', !canGroup);
         this.selectionToolbar.querySelector('#deleteSelectedButton')?.toggleAttribute('disabled', !canDeleteChapters); // Only enable if chapters selected

         // Show/hide the "Confirm Group Selection" button only during the specific flow
         if (this.confirmGroupSelectionButton) {
              // This logic might need refinement based on how 'isCreatingGroup' flow is handled now
              const showConfirmButton = this.isSelectionModeActive && this.isCreatingGroup; // DEPRECATED?
              this.confirmGroupSelectionButton.style.display = showConfirmButton ? 'inline-block' : 'none';
              this.confirmGroupSelectionButton.toggleAttribute('disabled', chapterCount === 0);
         }
    }
    _handleSelectionToolbarClick(event) { /* ... Keep existing logic ... */
         const button = event.target.closest('button');
         if (!button || button.disabled) return; // Ignore disabled buttons

         const action = button.id; // Use button ID as action identifier
         console.log("DEBUG: Selection Toolbar Action:", action);

         switch(action) {
              case 'tagSelectedButton':
                   this._handleBulkTagChapters(); break;
              case 'pinSelectedButton':
                   this._handleBulkPinChapters(); break;
              case 'suspendSelectedButton':
                   this._handleBulkSuspendChapters(); break;
              case 'groupSelectedButton': // Assumed to group selected *chapters*
                   this._handleBulkGroupChapters(); break;
              case 'deleteSelectedButton': // Assumed to delete selected *chapters*
                   this._handleBulkDeleteChapters(); break;
               case 'confirmGroupSelectionButton': // Added this case
                    this._handleConfirmGroupSelection(); break;
              default:
                   console.warn("Unknown selection toolbar action:", action);
         }
    }

     // Add placeholder for _renderFilteredView if needed by filter logic
     async _renderFilteredView(filterOptions) {
        console.log("DEBUG: Rendering filtered view:", filterOptions);
        if (!this.gridInstance || !this.dashboardGridContainer) return;

        this.dashboardGridContainer.classList.add('filtered-view');
        this.gridInstance.removeAll(true); // Clear existing layout
        this.dashboardGridContainer.innerHTML = '<p class="loading-text">Loading filtered chapters...</p>';
        this._updateLoadingState('action', true);

        const apiOptions = {
             sortBy: this.currentSort.field,
             order: this.currentSort.order,
             suspended: false // Default to not showing suspended unless filter is 'suspended'
        };
        if (filterOptions.type === 'tag') apiOptions.tag = filterOptions.value;
        else if (filterOptions.type === 'pinned') apiOptions.pinned = true;
        else if (filterOptions.type === 'suspended') apiOptions.suspended = true; // Explicitly show suspended

        try {
            const filteredChapters = await apiClient.getChapters(this.currentMaterial, apiOptions);
            this.dashboardGridContainer.innerHTML = ''; // Clear loading

            if (!filteredChapters || filteredChapters.length === 0) {
                 this.dashboardGridContainer.innerHTML = `<p>No chapters match the current filter.</p>`;
            } else {
                 // Render as Gridstack widgets using standalone card style
                 const widgetsToAdd = [];
                 filteredChapters.forEach(chapter => {
                     const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                     if (chapterElement) {
                          widgetsToAdd.push({
                               el: chapterElement, w: 1, h: 1, id: chapter.id, autoPosition: true
                          });
                     }
                 });

                 if (widgetsToAdd.length > 0) {
                      this.gridInstance.batchUpdate();
                      widgetsToAdd.forEach(config => {
                           try {
                                // Add widget and make it non-interactive in filtered view
                                const widgetEl = this.gridInstance.addWidget(config.el, config);
                                this.gridInstance.movable(widgetEl, false);
                                this.gridInstance.resizable(widgetEl, false);
                           }
                           catch (e) { console.error("Gridstack error adding filtered widget:", e); config.el?.remove();}
                      });
                      this.gridInstance.commit();
                 }
            }
        } catch (error) {
            console.error("Failed to fetch filtered chapters:", error);
            this.dashboardGridContainer.innerHTML = `<p class="error-text">Error loading filtered chapters.</p>`;
            this._showError(`Could not load filtered chapters: ${error.message}`);
        } finally {
            this._updateLoadingState('action', false);
            // Ensure grid interactions remain disabled in filtered view
            this.gridInstance?.disable();
        }
    }

     // Keep other helper methods like _findChapterData, _findGroupData, _moveChapterLocally,
     // _debounce, modal helpers, etc.
     _findChapterData(chapterId) { return this.allChaptersData[chapterId]; }
     _findGroupData(groupId) { return this.groupsData.find(g => g.id === groupId); }
     _findChapterElement(chapterId) { return this.dashboardGridContainer?.querySelector(`.chapter-item[data-chapter-id="${chapterId}"]`); }
     _findGroupElement(groupId) { return this.dashboardGridContainer?.querySelector(`.group-widget[data-group-id="${groupId}"]`); }
     _moveChapterLocally(chapterId, fromGroupId, toGroupId) { /* ... Keep existing ... */
        let chapterData = this._findChapterData(chapterId); if (!chapterData) return;
        console.log(`DEBUG: Moving ${chapterId} locally from ${fromGroupId} to ${toGroupId}`);

        // Remove from old location cache
        if (fromGroupId && this.chaptersByGroup[fromGroupId]) {
            this.chaptersByGroup[fromGroupId] = this.chaptersByGroup[fromGroupId].filter(c => c.id !== chapterId);
        } else if (!fromGroupId) { // Was ungrouped
            this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
        }

        // Add to new location cache
        chapterData.groupId = toGroupId; // Update chapter's group ID
        if (toGroupId) {
            if (!this.chaptersByGroup[toGroupId]) this.chaptersByGroup[toGroupId] = [];
            this.chaptersByGroup[toGroupId].push(chapterData);
            // TODO: Potentially re-sort the target group array based on its preference
            // this.chaptersByGroup[toGroupId].sort(...)
        } else { // Moved to ungrouped
            this.ungroupedChaptersData.push(chapterData);
            // TODO: Potentially re-sort the ungrouped array based on global preference
            // this.ungroupedChaptersData.sort(...)
        }
        // UI refresh (removing/adding widgets) is handled by the caller (usually _renderDashboardLayout or specific updates)
    }
     _debounce(func, delay) { /* ... Keep existing ... */
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
     }
     _showModal(modalId, title, message, buttons = [], iconType = 'warning') { /* ... Keep existing ... */
        let modalOverlay, modalTitle, modalMessage, modalActions, modalIcon;
        let isGenericModal = false;

        console.log(`DEBUG: _showModal called for ID: ${modalId}`);

        // --- Identify Modal and Get References ---
        // (Keep the checks for confirmationModal, errorModal, infoModal)
         if (modalId === 'confirmationModal') { modalOverlay = this.confirmationModalOverlay; modalTitle = this.confirmModalTitle; modalMessage = this.confirmModalMessage; modalActions = this.confirmModalActions; modalIcon = this.confirmModalIcon; if (modalIcon) modalIcon.className = `modal-icon ${iconType}`; isGenericModal = true; }
         else if (modalId === 'errorModal') { modalOverlay = this.errorModalOverlay; modalTitle = this.errorModalTitle; modalMessage = this.errorModalMessage; modalActions = this.errorModalActions; isGenericModal = true; }
         else if (modalId === 'infoModal') { modalOverlay = this.infoModalOverlay; modalTitle = this.infoModalTitle; modalMessage = this.infoModalMessage; modalActions = this.infoModalActions; modalIcon = this.infoModalIcon; if (modalIcon) modalIcon.className = `modal-icon info`; isGenericModal = true; }
         // --- Handle SPECIALIZED Modals (Just find the overlay) ---
         else if (modalId === 'settingsModal') { modalOverlay = this.settingsModalOverlay; }
         else if (modalId === 'tagManagementModal') { modalOverlay = this.tagManagementModalOverlay; }
         else if (modalId === 'createGroupModal') { modalOverlay = this.createGroupModalOverlay; }
         else if (modalId === 'groupSortModal') { modalOverlay = this.groupSortModalOverlay; }
         else if (modalId === 'tagSelectorModal') { modalOverlay = this.tagSelectorModalOverlay; }
         else if (modalId === 'groupColorPickerModal') { modalOverlay = this.colorPickerModalOverlay; }
         else { console.error(`_showModal Error: Unknown modal ID requested: "${modalId}"`); return; }

         // Check if Overlay Element was Found
         if (!modalOverlay) { console.error(`_showModal Error: Modal overlay element not found for ID: "${modalId}".`); return; }

        // Set Content/Buttons ONLY for Generic Modals
        if (isGenericModal) {
             if (!modalTitle || !modalMessage || !modalActions) { console.error(`Modal elements (title/message/actions) not found for generic modal ID: ${modalId}`); }
             else {
                  modalTitle.textContent = title || '';
                  modalMessage.innerHTML = message || '';
                  modalActions.innerHTML = ''; // Clear previous dynamic buttons

                  if (buttons && buttons.length > 0) {
                       buttons.forEach(btnConfig => { /* ... create button ... */
                           const button = document.createElement('button');
                           button.textContent = btnConfig.text;
                           button.classList.add('modal-button', btnConfig.class || 'secondary');
                           button.addEventListener('click', () => {
                                this._hideModal(modalId); // Always hide first
                                if (typeof btnConfig.action === 'function') btnConfig.action();
                           }, { once: true });
                           modalActions.appendChild(button);
                       });
                  } else if (modalId === 'errorModal' || modalId === 'infoModal') { // Add default OK button
                      if (!modalActions.querySelector('[data-action="close"]')) { /* ... add OK button ... */
                          const okButton = document.createElement('button');
                          okButton.textContent = 'OK';
                          okButton.classList.add('modal-button', 'secondary');
                          okButton.dataset.action = 'close'; // Use consistent action
                          okButton.addEventListener('click', () => this._hideModal(modalId));
                          modalActions.appendChild(okButton);
                      }
                  }
             }
        }

        // Show the Modal
        modalOverlay.classList.add('visible');
        console.log(`DEBUG: Modal "${modalId}" shown.`);
     }
     _hideModal(modalId) { /* ... Keep existing ... */
         let modalOverlay;
         // Determine overlay based on ID using the constructor references
          if (modalId === 'confirmationModal') modalOverlay = this.confirmationModalOverlay;
          else if (modalId === 'errorModal') modalOverlay = this.errorModalOverlay;
          else if (modalId === 'infoModal') modalOverlay = this.infoModalOverlay;
          else if (modalId === 'settingsModal') modalOverlay = this.settingsModalOverlay;
          else if (modalId === 'tagManagementModal') modalOverlay = this.tagManagementModalOverlay;
          else if (modalId === 'createGroupModal') modalOverlay = this.createGroupModalOverlay;
          else if (modalId === 'groupSortModal') modalOverlay = this.groupSortModalOverlay;
          else if (modalId === 'tagSelectorModal') modalOverlay = this.tagSelectorModalOverlay;
          else if (modalId === 'groupColorPickerModal') modalOverlay = this.colorPickerModalOverlay;
          else { // Fallback for unexpected IDs
              console.warn(`Trying to hide unknown modal ID: ${modalId}. Attempting lookup by ID.`);
              modalOverlay = document.getElementById(modalId);
          }

         if (modalOverlay) {
             modalOverlay.classList.remove('visible');
             console.log(`DEBUG: Modal "${modalId}" hidden.`);
              // Specific cleanup for confirmation modal target highlighting
             // if (modalId === 'confirmationModal' && this.contextMenuTargetChapter) { // Deprecated? Using activeContextMenuTarget now
             //     const card = this._findChapterCardElement(this.contextMenuTargetChapter);
             //     card?.classList.remove('confirming-delete');
             // }
              if (modalId === 'confirmationModal' && this.activeContextMenuTarget) {
                  this.activeContextMenuTarget.element?.classList.remove('confirming-delete');
              }
         } else {
             console.error("Hide Modal Error: Modal overlay element not found for ID:", modalId);
         }
    }
     _showInfoMessage(message, title = 'Information') { this._showModal('infoModal', title, message); }
     _showError(message, isTemporary = false) { console.error("ChapterFoldersView Error:", message); this._showModal('errorModal', 'Error', message); }
     // ... and any other necessary methods from the original file ...
     _handleGlobalClick(event) { /* ... Keep existing ... */
         // Check Rename Input First
         if (this.activeRenameTarget && !this.activeRenameTarget.element.contains(event.target) && !event.target.closest('.context-menu, .modal-overlay')) {
             console.log("DEBUG: Global click - cancelling rename");
             this._cancelRename(); return;
         }
         // Check Context Menus
         if (this.activeContextMenuTarget && !event.target.closest('.context-menu')) {
             const menu = this.activeContextMenuTarget.type === 'group' ? this.groupContextMenu
                         : this.activeContextMenuTarget.type === 'chapter' ? this.chapterContextMenu
                         : this.activeContextMenuTarget.type === 'material' ? this.materialContextMenu
                         : null;
             if (menu?.style.display === 'block' && !menu.contains(event.target) && !event.target.closest('.grid-stack-item, .material-tab')) {
                  console.log("DEBUG: Global click - hiding context menu");
                  this._hideContextMenu(); return;
             }
         }
         // Check Modals (check visibility and ensure click is on backdrop)
         const visibleModal = document.querySelector('.modal-overlay.visible');
         if (visibleModal && event.target === visibleModal) {
             const modalId = visibleModal.id;
             console.log(`DEBUG: Global click - closing modal ${modalId} via backdrop`);
             this._handleCancelModal(modalId); return; // Use generic cancel
         }
         // Check Study Options Popup
         if (this.isStudyOptionsPopupVisible && !this.studyOptionsPopup?.contains(event.target) && !this.pillStudyButtonWrapper?.contains(event.target)) {
             console.log("DEBUG: Global click - hiding study options popup");
             this._hideStudyOptionsPopup(); return;
         }
    }
    _handleGlobalKeydown(event) { /* ... Keep existing ... */
         if (event.key !== 'Escape') return;
         console.log("DEBUG: Escape key pressed");

         // Priority: Rename > Selection Mode > Context Menus > Modals > Study Popup
         if (this.activeRenameTarget) {
             console.log("DEBUG: Esc - cancelling rename"); this._cancelRename();
         } else if (this.isSelectionModeActive) {
             console.log("DEBUG: Esc - cancelling selection mode"); this._handleToggleSelectionMode(false); // Force exit
         } else if (this.activeContextMenuTarget) {
             console.log("DEBUG: Esc - hiding active context menu"); this._hideContextMenu();
         } else {
              const visibleModal = document.querySelector('.modal-overlay.visible');
              if (visibleModal) {
                   const modalId = visibleModal.id;
                   console.log(`DEBUG: Esc - closing modal ${modalId}`);
                   this._handleCancelModal(modalId); // Use generic cancel
              } else if (this.isStudyOptionsPopupVisible) {
                   console.log("DEBUG: Esc - hiding study options popup"); this._hideStudyOptionsPopup();
              }
         }
    }
    _handleCancelModal(modalId) { /* ... Keep existing ... */
        console.log(`DEBUG: Cancelling modal: ${modalId}`);
        this._hideModal(modalId); // Hide the modal

        // If cancelling the Create Group modal, also exit selection mode IF it was entered specifically for it
        // This flow might be deprecated based on new interaction design
        // if (modalId === 'createGroupModal' && this.isSelectionModeActive && this.isCreatingGroup) {
        //     console.log("DEBUG: Exiting selection mode because Create Group modal cancelled.");
        //     this._handleToggleSelectionMode(false); // Pass false to exit
        //     this.isCreatingGroup = false;
        // }

        // Reset specific states tied to modals
        if (modalId === 'groupColorPickerModal') this.activeColorPickerTarget = null;
        else if (modalId === 'tagSelectorModal') { this.activeTagSelectorTarget = null; this.bulkActionTargetIds = null; }
        else if (modalId === 'groupSortModal') this.groupSortModalGroupId = null;
        else if (modalId === 'settingsModal') this._handleSettingsCancel(); // Use specific cancel handler
    }

    _handleGridItemClick(event) { /* ... Keep existing ... */
        // Determine the target: chapter item or group widget
        const targetChapterItem = event.target.closest('.chapter-item');
        const targetGroupWidget = event.target.closest('.group-widget.grid-stack-item');

        if (this.isSelectionModeActive) {
             // Let _handleSelectionClick handle it (called because it's a click on the grid)
             this._handleSelectionClick(event);
        } else {
            // --- Navigation Mode ---
             // Check if the click is on a chapter item BUT NOT on an interactive element within it
             if (targetChapterItem && !event.target.closest('.rename-input, button, a, .selection-checkbox')) {
                  const chapterName = targetChapterItem.dataset.chapterName;
                  if (chapterName) {
                       this._navigateToChapterDetails(chapterName);
                  } else {
                       console.warn("Clicked chapter item missing chapter name dataset.");
                  }
             }
             // Handle clicks on group header/background - currently does nothing in nav mode
             else if (targetGroupWidget && !event.target.closest('.rename-input, button, a, .chapter-item')) {
                 console.log("DEBUG: Clicked on group header/background (nav mode):", targetGroupWidget.dataset.groupId);
             }
        }
    }

     // Include Drag and Drop Handlers (_handleDragStart, _handleDragEnd, _handleDragOver, _handleDragLeave, _handleDrop)
     // Ensure selectors like `closest('.chapter-item[draggable="true"]')`, `closest('.tag-pill')`, `closest('.group-widget')` are still correct.
     // Ensure `_findChapterData` is used correctly.
     _handleDragStart(event) { /* ... Keep existing, ensure querySelectors match new item structure if needed ... */
        const targetItem = event.target.closest('.chapter-item[draggable="true"]'); // Draggable is set in _renderChapterItem
        if (!targetItem) { /* event.preventDefault(); */ return; } // Don't prevent default if not draggable target
        const chapterId = targetItem.dataset.chapterId;
        if (!chapterId) { /* event.preventDefault(); */ return; }
        const chapterData = this._findChapterData(chapterId);
        if (!chapterData) { /* event.preventDefault(); */ return; }

        console.log(`DEBUG: Drag Start: Chapter ${chapterId} (Selecting: ${this.isSelectionModeActive})`);
        let itemsToDrag = []; let dragType = 'chapter'; let isSelectionDrag = false;

        // If selection mode is active AND the dragged item is part of the selection
        if (this.isSelectionModeActive && this.selectedItemIds.chapters.has(chapterId)) {
            itemsToDrag = Array.from(this.selectedItemIds.chapters).map(id => ({ type: 'chapter', id }));
            if (itemsToDrag.length > 1) dragType = 'multi-chapter';
            isSelectionDrag = true;
            // Add styling hook to the element being physically dragged to represent the selection
            targetItem.classList.add('dragging-selection');
            console.log(`DEBUG: Dragging selection of ${itemsToDrag.length} chapters.`);
        } else {
            // Dragging a single item (even if selection mode is on, but item wasn't selected)
            itemsToDrag = [{ type: 'chapter', id: chapterId }];
            targetItem.classList.add('dragging'); // Style single dragged item
            console.log(`DEBUG: Dragging single chapter ${chapterId}`);
            // Ensure selection mode doesn't interfere if dragging a non-selected item
            if(this.isSelectionModeActive) {
                 // Optional: Temporarily disable selection highlights during single drag?
            }
        }

        this.draggedItemData = { type: dragType, items: itemsToDrag };
        event.dataTransfer.effectAllowed = 'linkMove'; // Allow linking (tagging) or moving (grouping/ungrouping)
        event.dataTransfer.setData('application/json', JSON.stringify(this.draggedItemData));

        // Custom Drag Image
        try {
             let previewText = chapterData.name;
             if (isSelectionDrag && itemsToDrag.length > 1) {
                  previewText = `${itemsToDrag.length} Chapters`;
             }
             const preview = document.createElement('div');
             preview.textContent = previewText;
             preview.classList.add('drag-preview-item'); // Style via CSS
             preview.style.position = 'absolute'; preview.style.top = '-9999px'; preview.style.left = '-9999px';
             document.body.appendChild(preview);
             this.dragPreviewElement = preview;
             // Use rAF to ensure element is in DOM before setting drag image
             requestAnimationFrame(() => {
                 if(this.dragPreviewElement) { // Check if it still exists
                     event.dataTransfer.setDragImage(preview, preview.offsetWidth / 2, preview.offsetHeight / 2);
                     console.log("DEBUG: Custom drag image set.");
                 }
             });
        } catch (e) { console.error("DEBUG: Error creating/setting drag image", e); }

        this.container?.classList.add('is-dragging-chapter'); // Global dragging state class
    }
    _handleDragEnd(event) { /* ... Keep existing ... */
        console.log("DEBUG: Drag End");
        // Find the original dragged element (it might be different from event.target)
        const draggedElement = this.dashboardGridContainer?.querySelector('.dragging, .dragging-selection');
        draggedElement?.classList.remove('dragging', 'dragging-selection');

        // Clean up drag preview
        this.dragPreviewElement?.remove();
        this.dragPreviewElement = null;

        // Clean up drop target highlighting
        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-dragging-chapter', 'is-over-ungroup-zone'); // Clear global states

        this.draggedItemData = null; // Clear dragged data state
    }
    _handleDragOver(event) { /* ... Keep existing ... */
        if (!this.draggedItemData || !this.draggedItemData.type.includes('chapter')) return;
        event.preventDefault(); // Necessary to allow drop

        const targetPill = event.target.closest('.tag-pill');
        const targetGroupWidget = event.target.closest('.group-widget[data-group-id]');
        const targetStandaloneChapter = event.target.closest('.chapter-item.standalone-chapter');
        const targetIsGridStackItem = event.target.closest('.grid-stack-item');
        // Check if hovering directly over the main grid container background
        const targetIsGridBackground = !targetIsGridStackItem && (event.target === this.dashboardGridContainer || this.dashboardGridContainer.contains(event.target));

        // Clear previous highlights
        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-over-ungroup-zone');

        let isValidDrop = false;
        let dropEffect = 'none';
        let dropTargetElement = null;
        const isAnyDraggedChapterGrouped = this.draggedItemData.items.some(item => {
             const chap = this._findChapterData(item.id); return chap && chap.groupId;
        });

        // Check potential drop targets
        if (targetPill) {
            const filterType = targetPill.dataset.filterType;
             const tagName = targetPill.dataset.tagName;
             if (filterType === 'tag' && tagName) { // Tag Pill
                  // Valid if any dragged chapter doesn't already have the tag
                  isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.tags || []).includes(tagName));
                  if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
             } else if (filterType === 'pinned') { // Pin Pill
                  // Valid if any dragged chapter is not already pinned
                  isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.isPinned));
                  if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
             } else if (filterType === 'suspended') { // Suspend Pill
                  // Valid if any dragged chapter is not already suspended
                  isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.isSuspended));
                  if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
             }
        } else if (targetGroupWidget) { // Group Widget
            const targetGroupId = targetGroupWidget.dataset.groupId;
             // Valid if any dragged chapter is not already in this target group
            isValidDrop = this.draggedItemData.items.some(item => (this._findChapterData(item.id)?.groupId || null) !== targetGroupId);
            if(isValidDrop) { dropEffect = 'move'; dropTargetElement = targetGroupWidget; }
        } else if (targetIsGridBackground || targetStandaloneChapter) { // Grid Background or Standalone Chapter (Potential Ungroup Target)
             // Valid drop for ungrouping only if at least one dragged chapter IS currently grouped
             if (isAnyDraggedChapterGrouped) {
                 isValidDrop = true;
                 dropEffect = 'move';
                 this.container?.classList.add('is-over-ungroup-zone'); // Highlight ungroup zone
                 // dropTargetElement = targetStandaloneChapter || this.dashboardGridContainer; // Not needed if using container class
                 console.log("DEBUG: Drag Over Ungroup Target detected");
             }
        }

        event.dataTransfer.dropEffect = dropEffect; // Set cursor icon

        // Apply highlight class to the specific target element (unless it's the ungroup zone)
        if (isValidDrop && !this.container?.classList.contains('is-over-ungroup-zone') && dropTargetElement) {
            dropTargetElement.classList.add('drag-over-target');
        }
    }
    _handleDragLeave(event) { /* ... Keep existing ... */
         // Remove specific target highlight
         const target = event.target.closest('.tag-pill, .group-widget, .chapter-item.standalone-chapter');
         if (target?.classList.contains('drag-over-target') && !target.contains(event.relatedTarget)) {
              target.classList.remove('drag-over-target');
         }

         // Remove ungroup zone highlight if leaving the grid container or entering another widget
         const relatedTarget = event.relatedTarget;
         const leavingGridContainer = event.target === this.dashboardGridContainer && !this.dashboardGridContainer.contains(relatedTarget);
         const enteringWidgetFromBg = event.target === this.dashboardGridContainer && relatedTarget?.closest('.grid-stack-item');

         if (this.container?.classList.contains('is-over-ungroup-zone') && (leavingGridContainer || enteringWidgetFromBg)) {
              this.container.classList.remove('is-over-ungroup-zone');
              console.log("DEBUG: Drag Left Ungroup Target zone.");
         }
    }
    async _handleDrop(event) { /* ... Keep existing logic, ensure target detection works ... */
        event.preventDefault();
        console.log("DEBUG: Drop detected. Target:", event.target);
        const targetPill = event.target.closest('.tag-pill.drag-over-target'); // Check highlighted pill
        const targetGroup = event.target.closest('.group-widget.drag-over-target'); // Check highlighted group
        const wasOverUngroupZone = this.container?.classList.contains('is-over-ungroup-zone');
        const targetStandaloneChapter = event.target.closest('.chapter-item.standalone-chapter'); // Check if dropped ON a chapter
        const isUngroupDropTarget = wasOverUngroupZone && (event.target === this.dashboardGridContainer || targetStandaloneChapter || this.dashboardGridContainer.contains(event.target) && !event.target.closest('.group-widget')); // Drop on bg or standalone while zone active

        // Clear visual cues immediately
        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-over-ungroup-zone');

        if (!this.draggedItemData || !this.draggedItemData.type.includes('chapter')) { /* ... */ this.draggedItemData = null; return; }

        // Determine final drop action based on target priority
        let finalDropTargetType = null;
        let targetValue = null; // e.g., tag name, group id

        if (targetPill) {
            const filterType = targetPill.dataset.filterType;
             if (filterType === 'tag') { finalDropTargetType = 'tag'; targetValue = targetPill.dataset.tagName; }
             else if (filterType === 'pinned') { finalDropTargetType = 'pin'; }
             else if (filterType === 'suspended') { finalDropTargetType = 'suspend'; }
        } else if (targetGroup) {
            finalDropTargetType = 'group'; targetValue = targetGroup.dataset.groupId;
        } else if (isUngroupDropTarget) {
            finalDropTargetType = 'ungroup';
        }

        if (!finalDropTargetType) { console.log("DEBUG: Drop occurred on non-designated target area."); this.draggedItemData = null; return; }

        this._updateLoadingState('action', true);
        let errorsOccurred = false;
        let successOccurred = false; // Track if at least one operation succeeded
        const itemsToProcess = this.draggedItemData.items;
        const currentMaterial = this.currentMaterial;
        const processedDraggedData = { ...this.draggedItemData }; // Store data before clearing
        this.draggedItemData = null; // Clear global state

        try {
            let promises = [];
            console.log(`DEBUG: Processing drop action: ${finalDropTargetType.toUpperCase()}, Value: ${targetValue || 'N/A'}`);

            switch(finalDropTargetType) {
                case 'tag':
                    promises = itemsToProcess.map(async (item) => {
                        try {
                            const chapter = this._findChapterData(item.id);
                            if (!chapter || (chapter.tags || []).includes(targetValue)) return;
                            const newTags = [...new Set([...(chapter.tags || []), targetValue])].sort(); // Ensure unique
                            await apiClient.setChapterTags(currentMaterial, item.id, newTags);
                            chapter.tags = newTags; // Update local data
                            successOccurred = true;
                        } catch (e) { errorsOccurred = true; console.error(`Tagging error for ${item.id}:`, e); }
                    });
                    break;
                case 'group':
                    promises = itemsToProcess.map(async (item) => {
                        try {
                            const chapter = this._findChapterData(item.id);
                            if (!chapter || chapter.groupId === targetValue) return;
                            const originalGroupId = chapter.groupId;
                            await apiClient.assignChapterToGroup(item.id, targetValue);
                            this._moveChapterLocally(item.id, originalGroupId, targetValue);
                            successOccurred = true;
                        } catch (e) { errorsOccurred = true; console.error(`Grouping error for ${item.id}:`, e); }
                    });
                    break;
                case 'ungroup':
                    promises = itemsToProcess.map(async (item) => {
                        try {
                            const chapter = this._findChapterData(item.id);
                            if (!chapter || chapter.groupId === null) return;
                            const originalGroupId = chapter.groupId;
                            await apiClient.assignChapterToGroup(item.id, null);
                            this._moveChapterLocally(item.id, originalGroupId, null);
                            successOccurred = true;
                        } catch (e) { errorsOccurred = true; console.error(`Ungrouping error for ${item.id}:`, e); }
                    });
                    break;
                case 'pin':
                    promises = itemsToProcess.map(async (item) => {
                        try { await this._executePinToggle(item.id, true); successOccurred = true; }
                        catch (e) { errorsOccurred = true; console.error(`Pin error for ${item.id}:`, e); }
                    });
                    break;
                case 'suspend':
                    promises = itemsToProcess.map(async (item) => {
                        try { await this._executeSuspendToggle(item.id, true); successOccurred = true; }
                        catch (e) { errorsOccurred = true; console.error(`Suspend error for ${item.id}:`, e); }
                    });
                    break;
            }

            // Execute all API calls
            await Promise.allSettled(promises);

            // Refresh UI *after* all promises settle
            // Re-render layout is needed for group/ungroup/suspend to reflect structure changes
             if (['group', 'ungroup', 'suspend'].includes(finalDropTargetType) && successOccurred) {
                 console.log("DEBUG: Re-rendering layout after drop action:", finalDropTargetType);
                 // Check if we are in filtered view - if so, refresh that instead
                 if (this.currentFilter.type !== 'all') {
                     this._renderFilteredView(this.currentFilter);
                 } else {
                     this._renderDashboardLayout();
                 }
            } else if (finalDropTargetType === 'pin' && successOccurred) {
                 // Pinning only requires style updates, which _executePinToggle handles directly.
                 // If viewing the 'Pinned' filter, refresh it
                 if (this.currentFilter.type === 'pinned') {
                      this._renderFilteredView(this.currentFilter);
                 }
            }
            // Tagging doesn't require visual update on the item itself currently.

            // Show feedback
            if (errorsOccurred && successOccurred) this._showError("Some chapters could not be updated.", true);
            else if (errorsOccurred) this._showError("Operation failed for selected chapters.", true);
            else if (successOccurred) { // Show success message only if something actually happened
                 let successMsg = "Operation successful."; // Generic message
                 if (finalDropTargetType === 'tag') successMsg = `Tag "${targetValue}" added to chapter(s).`;
                 else if (finalDropTargetType === 'group') successMsg = "Chapter(s) moved to group.";
                 else if (finalDropTargetType === 'ungroup') successMsg = "Chapter(s) removed from group.";
                 else if (finalDropTargetType === 'pin') successMsg = "Chapter(s) pinned.";
                 else if (finalDropTargetType === 'suspend') successMsg = "Chapter(s) suspended.";
                 this._showInfoMessage(successMsg);
            }

        } catch (error) {
            console.error("Error processing drop event:", error);
            this._showError(`Drop failed: ${error.message}`);
            errorsOccurred = true; // Mark error if outer try fails
        } finally {
            this._updateLoadingState('action', false);
            // Exit selection mode if a multi-item drag succeeded without errors
            if (this.isSelectionModeActive && processedDraggedData?.type === 'multi-chapter' && !errorsOccurred && successOccurred) {
                 this._handleToggleSelectionMode(false); // Exit selection
            }
        }
    }

     // --- Make sure remaining helpers and event handlers are present ---
     // e.g., _handleToggleGroupLayout, _handleConfirmGroupColor, _handleOpenChapterTagSelector, _handleConfirmChapterTags,
     // _handleBulk..., delete handlers, create/delete tag handlers, create group handlers, etc.
     // Ensure their internal logic (esp. querySelectors) matches the new structure.

     // Example: Keep settings modal logic
     _openMaterialSettingsModal(materialName) { /* ... Keep existing ... */
         if (!materialName || !this.settingsModalOverlay) return;
         console.log(`Opening settings modal for: ${materialName}`);
         this._updateLoadingState('settings', true);

         apiClient.getMaterialSettings(materialName)
             .then(settings => {
                 this.editingMaterialName = materialName;
                 this.editingMaterialSettings = JSON.parse(JSON.stringify(settings || {})); // Deep clone or default empty
                 this._populateSettingsForm(settings || {}); // Pass empty object if settings are null/undefined
                 this.settingsModalTitle.textContent = `${materialName} - Settings`;
                 this._showModal('settingsModal');
             })
             .catch(error => {
                 console.error(`Failed to load settings for ${materialName}:`, error);
                 this._showError(`Could not load settings: ${error.message}`);
                 this.editingMaterialName = null;
                 this.editingMaterialSettings = null;
             })
             .finally(() => {
                 this._updateLoadingState('settings', false);
             });
     }
     _populateSettingsForm(settings) { /* ... Keep existing ... */
         if (!this.settingsModalForm) return;
         this.settingsModalForm.reset();

         // Use Optional Chaining (?.) and Nullish Coalescing (??) for safety
         this.settingsEditMaterialNameInput.value = this.editingMaterialName || ''; // Hidden original name
         this.settingsMaterialNameInput.value = this.editingMaterialName || ''; // Visible name

         // Study Options
         this.settingsDailyLimitInput.value = settings?.dailyNewCardLimit ?? 20;
         this.settingsDefaultBatchSizeInput.value = settings?.defaultBatchSize ?? 20;

         // SRS Algo Params
         const algo = settings?.srsAlgorithmParams || {};
         if (this.settingsAlgoLearningStepsInput) this.settingsAlgoLearningStepsInput.value = (algo.learningStepsDays || [1]).join(', ');
         if (this.settingsAlgoGraduationIntervalInput) this.settingsAlgoGraduationIntervalInput.value = algo.graduationIntervalDays ?? 3;
         if (this.settingsAlgoLapseIntervalInput) this.settingsAlgoLapseIntervalInput.value = algo.lapseNewIntervalDays ?? 1;
         if (this.settingsAlgoEasyBonusInput) this.settingsAlgoEasyBonusInput.value = algo.easyBonusMultiplier ?? 1.3;
         if (this.settingsAlgoMinEaseInput) this.settingsAlgoMinEaseInput.value = algo.minEaseFactor ?? 1.3;
         if (this.settingsAlgoDefaultEaseInput) this.settingsAlgoDefaultEaseInput.value = algo.defaultEaseFactor ?? 2.5;
         if (this.settingsAlgoHardMultiplierInput) this.settingsAlgoHardMultiplierInput.value = algo.hardIntervalMultiplier ?? 1.2;
         if (this.settingsAlgoMaxIntervalInput) this.settingsAlgoMaxIntervalInput.value = algo.maxIntervalDays ?? 60;
         if (this.settingsAlgoEaseAdjLapseInput) this.settingsAlgoEaseAdjLapseInput.value = algo.easeAdjustmentLapse ?? -0.2;
         if (this.settingsAlgoEaseAdjHardInput) this.settingsAlgoEaseAdjHardInput.value = algo.easeAdjustmentHard ?? -0.15;
         if (this.settingsAlgoEaseAdjEasyInput) this.settingsAlgoEaseAdjEasyInput.value = algo.easeAdjustmentEasy ?? 0.15;

         // SRS Thresholds
         const thresholds = settings?.srsThresholds || {};
         if (this.settingsThresholdLearningRepsInput) this.settingsThresholdLearningRepsInput.value = thresholds.learningReps ?? 2;
         if (this.settingsThresholdMasteredRepsInput) this.settingsThresholdMasteredRepsInput.value = thresholds.masteredReps ?? 5;
         if (this.settingsThresholdMasteredEaseInput) this.settingsThresholdMasteredEaseInput.value = thresholds.masteredEase ?? 2.0;
         if (this.settingsThresholdCriticalEaseInput) this.settingsThresholdCriticalEaseInput.value = thresholds.criticalEase ?? 1.5;
    }
    _handleSettingsCancel() { /* ... Keep existing ... */
        this._hideModal('settingsModal');
        this.editingMaterialName = null;
        this.editingMaterialSettings = null;
    }
    async _handleSettingsSave() { /* ... Keep existing ... */
         if (!this.settingsModalForm || !this.editingMaterialName || !this.editingMaterialSettings || this.isLoading.saveSettings) { return; }
         this._updateLoadingState('saveSettings', true);
         this.settingsSaveButton.disabled = true; this.settingsSaveButton.textContent = 'Saving...';

         const originalName = this.settingsEditMaterialNameInput.value;
         const originalSettings = this.editingMaterialSettings;
         const collectedData = this._collectSettingsFormData();
         let targetMaterialName = originalName;
         let nameChanged = false; let settingsChanged = false;
         const patchPayload = {};

         // 1. Handle Rename
         if (collectedData.materialName && collectedData.materialName !== originalName) {
              try {
                   await apiClient.renameMaterial(originalName, collectedData.materialName);
                   targetMaterialName = collectedData.materialName; nameChanged = true;
                   this.editingMaterialName = targetMaterialName; this.settingsEditMaterialNameInput.value = targetMaterialName;
                   console.log("Rename successful.");
              } catch (renameError) {
                   console.error("Material rename failed:", renameError); this._showError(`Failed to rename material: ${renameError.message}`);
                   this._resetSettingsSaveButton(); this._updateLoadingState('saveSettings', false); return;
              }
         }
         // 2. Build PATCH Payload
         const deepCompare = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);
         if (collectedData.studyOptions.newCardsPerDay !== originalSettings.dailyNewCardLimit) { patchPayload.dailyNewCardLimit = collectedData.studyOptions.newCardsPerDay; settingsChanged = true; }
         if (collectedData.studyOptions.defaultBatchSize !== originalSettings.defaultBatchSize) { patchPayload.defaultBatchSize = collectedData.studyOptions.defaultBatchSize; settingsChanged = true; }
         if (!deepCompare(collectedData.srsAlgorithmParams, originalSettings.srsAlgorithmParams)) { patchPayload.srsAlgorithmParams = collectedData.srsAlgorithmParams; settingsChanged = true; }
         if (!deepCompare(collectedData.srsThresholds, originalSettings.srsThresholds)) { patchPayload.srsThresholds = collectedData.srsThresholds; settingsChanged = true; }

         // 3. Execute Update/PATCH
         if (!settingsChanged && !nameChanged) { /* ... no changes ... */ this._showInfoMessage("No changes were made."); this._resetSettingsSaveButton(); this._updateLoadingState('saveSettings', false); return; }
         if (!settingsChanged && nameChanged) { /* ... only name changed ... */ console.log("Material renamed, no other settings changed."); this._showInfoMessage(`Material renamed to "${targetMaterialName}".`); await this._handlePostSettingsSaveUIUpdates(originalName, targetMaterialName, null, nameChanged, settingsChanged); this._resetSettingsSaveButton(); this._updateLoadingState('saveSettings', false); this._handleSettingsCancel(); return; }

         try {
              console.log(`Sending PATCH for '${targetMaterialName}' with payload:`, JSON.stringify(patchPayload, null, 2));
              const result = await apiClient.updateMaterialSettings(targetMaterialName, patchPayload);
              console.log("Settings PATCH successful:", result); this._showInfoMessage("Settings updated successfully.");
              await this._handlePostSettingsSaveUIUpdates(originalName, targetMaterialName, result?.settings || collectedData, nameChanged, settingsChanged);
              this._handleSettingsCancel(); // Close modal on success
         } catch (error) {
              console.error("Failed settings PATCH:", error); this._showError(`Error saving settings: ${error.message}`);
         } finally {
              this._resetSettingsSaveButton(); this._updateLoadingState('saveSettings', false);
         }
    }
    _collectSettingsFormData() { /* ... Keep existing ... */
         const parseFloatOrDefault = (input, defaultValue) => input ? (parseFloat(input.value) || defaultValue) : defaultValue;
         const parseIntOrDefault = (input, defaultValue) => input ? (parseInt(input.value, 10) || defaultValue) : defaultValue;
         const parseSteps = (input) => {
             if (!input || !input.value) return [1];
              return input.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0); // Ensure > 0
         };
         const steps = parseSteps(this.settingsAlgoLearningStepsInput);

         return {
             materialName: this.settingsMaterialNameInput?.value.trim() || '',
             studyOptions: {
                 newCardsPerDay: parseIntOrDefault(this.settingsDailyLimitInput, 20),
                 defaultBatchSize: parseIntOrDefault(this.settingsDefaultBatchSizeInput, 20)
             },
             srsAlgorithmParams: {
                 learningStepsDays: steps.length > 0 ? steps : [1],
                 graduationIntervalDays: parseIntOrDefault(this.settingsAlgoGraduationIntervalInput, 3),
                 lapseNewIntervalDays: parseFloatOrDefault(this.settingsAlgoLapseIntervalInput, 1), // API uses float? Check FSM defaults
                 easyBonusMultiplier: parseFloatOrDefault(this.settingsAlgoEasyBonusInput, 1.3),
                 minEaseFactor: parseFloatOrDefault(this.settingsAlgoMinEaseInput, 1.3),
                 defaultEaseFactor: parseFloatOrDefault(this.settingsAlgoDefaultEaseInput, 2.5),
                 hardIntervalMultiplier: parseFloatOrDefault(this.settingsAlgoHardMultiplierInput, 1.2),
                 maxIntervalDays: parseIntOrDefault(this.settingsAlgoMaxIntervalInput, 60),
                 easeAdjustmentLapse: parseFloatOrDefault(this.settingsAlgoEaseAdjLapseInput, -0.2),
                 easeAdjustmentHard: parseFloatOrDefault(this.settingsAlgoEaseAdjHardInput, -0.15),
                 easeAdjustmentEasy: parseFloatOrDefault(this.settingsAlgoEaseAdjEasyInput, 0.15),
             },
             srsThresholds: {
                 learningReps: parseIntOrDefault(this.settingsThresholdLearningRepsInput, 2),
                 masteredReps: parseIntOrDefault(this.settingsThresholdMasteredRepsInput, 5),
                 masteredEase: parseFloatOrDefault(this.settingsThresholdMasteredEaseInput, 2.0),
                 criticalEase: parseFloatOrDefault(this.settingsThresholdCriticalEaseInput, 1.5)
             }
         };
    }
    _resetSettingsSaveButton() { /* ... Keep existing ... */
         if (this.settingsSaveButton) { this.settingsSaveButton.disabled = false; this.settingsSaveButton.textContent = 'Save Changes'; }
    }
     
    // ... (Continuing from previous code block in chapterFoldersView.js)

     async _handlePostSettingsSaveUIUpdates(originalName, newName, updatedSettingsData, nameChanged, settingsChanged) {
        const wasCurrentMaterial = originalName === this.currentMaterial;
        const materialDataToUpdate = updatedSettingsData || this.editingMaterialSettings;

        // If name changed, reload the material list entirely
        if (nameChanged) {
            console.log("Name changed, reloading materials list...");
            try {
                 const materials = await apiClient.getMaterials(); // Assuming this just gets names/basic info
                 this.availableMaterials = materials;
                 this._renderMaterialTabs(this.availableMaterials); // Re-render tabs with new name
            } catch (err) {
                 console.error("Failed to reload materials after rename:", err);
                 this._showError("Failed to update materials list after rename.");
            }
        }

        // If the material being edited *was* the currently displayed one
        if (wasCurrentMaterial) {
            this.currentMaterial = newName; // Update current material name if it changed

            // Update the cached settings for the *current* view
            this.currentMaterialSettings = materialDataToUpdate;

            // If settings affecting the main view changed, update them
            if (settingsChanged) {
                const batchSize = materialDataToUpdate.defaultBatchSize ?? 20;
                if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = batchSize;
                // Update tags if they are part of settings (unlikely based on current structure, but possible)
                if (materialDataToUpdate.uniqueTags) {
                    this.availableTags = materialDataToUpdate.uniqueTags;
                    this._renderTagPills(); // Re-render tags if they changed
                }
                 this._updatePillStats(this.currentMaterial); // Update stats based on potentially new settings
                 // Maybe reload chapter grid/overview if settings drastically affect display? Avoid if possible.
                 // Example: If daily limit affects "new card" display on chapter items
                 // await this._fetchAndRenderInitialDashboardContent(); // More heavy-handed refresh
            }

            // Ensure the correct tab is visually selected if name changed or list re-rendered
            if (nameChanged) this._updateActiveMaterialTab();
        }

        // Clear the temporary editing state
        this.editingMaterialName = null;
        this.editingMaterialSettings = null;
    }

    // --- Study Pill & Options ---
    _handleToggleStudyOptionsPopup() { /* ... Keep existing ... */
        if (!this.studyOptionsPopup || !this.pillStudyButtonWrapper || !this.pillOptionsTrigger) return;
        this.isStudyOptionsPopupVisible = !this.isStudyOptionsPopupVisible;
        this.studyOptionsPopup.classList.toggle('visible', this.isStudyOptionsPopupVisible);
        this.pillStudyButtonWrapper.classList.toggle('popup-open', this.isStudyOptionsPopupVisible);
        this.pillOptionsTrigger.setAttribute('aria-expanded', this.isStudyOptionsPopupVisible);

        // Use CSS transitions for visibility, avoid direct display:none/flex manipulation here
        // CSS should handle the transition based on the 'visible' class.
        // If display property is strictly needed for the transition:
        if (this.isStudyOptionsPopupVisible) {
            this.studyOptionsPopup.style.display = 'flex'; // Or 'block', match CSS
        } else {
             // Let CSS handle the transition out
             // Optional: Add display:none after transition if needed for accessibility/layout
             // this.studyOptionsPopup.addEventListener('transitionend', () => {
             //      if (!this.isStudyOptionsPopupVisible) this.studyOptionsPopup.style.display = 'none';
             // }, { once: true });
        }
        console.log("Study options popup toggled:", this.isStudyOptionsPopupVisible);
    }
    _hideStudyOptionsPopup() { /* ... Keep existing ... */
         if (!this.isStudyOptionsPopupVisible || !this.studyOptionsPopup || !this.pillStudyButtonWrapper || !this.pillOptionsTrigger) return;
         this.isStudyOptionsPopupVisible = false;
         this.studyOptionsPopup.classList.remove('visible');
         this.pillStudyButtonWrapper.classList.remove('popup-open');
         this.pillOptionsTrigger.setAttribute('aria-expanded', 'false');
         // Let CSS handle transition out based on 'visible' class removal
         console.log("Study options popup hidden");
    }
    _handleBatchSizeChange(event) { /* ... Keep existing ... */
        const newSize = parseInt(event.target.value, 10);
        if (isNaN(newSize) || newSize < 1) {
            console.warn("Invalid batch size input:", event.target.value);
            // Revert to current setting or default
            event.target.value = this.currentMaterialSettings?.defaultBatchSize ?? 20;
            return;
        }
        console.log("Batch size changed to:", newSize, "- Debouncing save...");
        this.saveBatchSizeDebounced(newSize); // Use debounced function
    }
    async _saveBatchSizeSetting(newSize) { /* ... Keep existing ... */
         if (!this.currentMaterial || this.isLoading.saveSettings) return;
         console.log(`Attempting to save batch size ${newSize} for ${this.currentMaterial}`);
         this._updateLoadingState('saveSettings', true);

         const oldSize = this.currentMaterialSettings?.defaultBatchSize;
         if (this.currentMaterialSettings) {
             this.currentMaterialSettings.defaultBatchSize = newSize; // Optimistic UI update
         }

         try {
             await apiClient.updateMaterialSettings(this.currentMaterial, { defaultBatchSize: newSize });
             console.log("Batch size saved successfully via API.");
             // Update cache for other materials if needed (less critical now)
             // const materialIndex = this.availableMaterials.findIndex(m => m.material === this.currentMaterial);
             // if (materialIndex > -1 && this.availableMaterials[materialIndex].settings) {
             //      this.availableMaterials[materialIndex].settings.defaultBatchSize = newSize;
             // }
         } catch (error) {
             console.error("Failed to save batch size via API:", error);
             this._showError(`Failed to save batch size: ${error.message}`);
             // Revert optimistic update on error
             if (this.currentMaterialSettings) this.currentMaterialSettings.defaultBatchSize = oldSize;
             if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = oldSize ?? 20;
         } finally {
             this._updateLoadingState('saveSettings', false);
         }
    }
    _handleMaterialSwitch(event) { /* ... Keep existing, ensure _render functions called are the new ones ... */
        const clickedTab = event.target.closest('.material-tab:not([disabled])');
        if (!clickedTab || !this.pillMaterialSwitcher?.classList.contains('has-multiple')) return;

        const material = clickedTab.dataset.material;
        const isLoadingAnything = Object.values(this.isLoading).some(state => typeof state === 'boolean' ? state : Object.values(state).some(s => s));

        if (material && material !== this.currentMaterial && !isLoadingAnything) {
            console.log(`Switching material to: ${material}`);
            const previousMaterial = this.currentMaterial;
            this.currentMaterial = material;
            this._updateActiveMaterialTab(); // Update visual selection

            // Reset selection mode if active
            if (this.isSelectionModeActive) {
                this._handleToggleSelectionMode(false);
            }

            // Set loading state
            this._updateLoadingState('materialSwitch', true);
            // Show loading states in relevant sections
            if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p class="loading-text">Loading chapters...</p>';
            this._renderOverviewPlaceholders(true); // Show loading in overview
            this._updatePillStats(null); // Clear stats temporarily

            // Fetch all necessary data for the new material
            Promise.allSettled([
                apiClient.getDashboardSummary(material), // Fetch full summary for the new material
                 apiClient.getChapterMastery(material), // Fetch mastery data for heatmap (if heatmap exists)
                 apiClient.getRecentStudyStats(), // Fetch activity (usually not material specific?)
                 apiClient.getDueTimeline(material) // Fetch timeline
            ]).then(async (results) => {
                console.log(`Material switch data fetched for ${material}`, results);

                const summaryResult = results[0];
                const masteryResult = results[1];
                const activityResult = results[2]; // Assuming activity isn't material specific
                const timelineResult = results[3];

                // --- Process Summary ---
                if (summaryResult.status === 'fulfilled' && summaryResult.value) {
                     const summaryData = summaryResult.value;
                     // Re-process essential non-chapter data from summary FIRST
                     await this._processSummaryData_Phase1(summaryData); // This updates settings, tags, groups, controls
                     // THEN fetch and render chapters based on the new summary data
                     await this._fetchAndRenderInitialDashboardContent(); // This renders the grid items
                } else {
                     console.error(`Failed to fetch dashboard summary for ${material}:`, summaryResult.reason);
                     this._showError(`Could not load data for ${material}.`);
                     // Revert to previous material? Or show error state?
                     this.currentMaterial = previousMaterial;
                     this._updateActiveMaterialTab();
                     if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p class="error-text">Error loading material data.</p>';
                     this._renderOverviewPlaceholders(false, true);
                     return; // Stop processing if summary fails
                }

                // --- Process Overview Data ---
                // Mastery Heatmap
                 if (this.heatmapGrid) { // Check if element exists
                     if (masteryResult.status === 'fulfilled') this._renderHeatmap(masteryResult.value || []);
                     else { console.error("Failed mastery fetch on switch:", masteryResult.reason); this._renderHeatmap(null, true); }
                 }
                // Activity Heatmap
                if (this.reviewActivityGrid) { // Check if element exists
                    if (activityResult.status === 'fulfilled') this._renderReviewActivityHeatmap(activityResult.value);
                    else { console.error("Failed activity fetch on switch:", activityResult.reason); this._renderReviewActivityHeatmap(null, true); }
                }
                // Timeline Graph
                if (this.reviewScheduleCanvas) { // Check if element exists
                    if (timelineResult.status === 'fulfilled') this._renderTimelineGraph(timelineResult.value);
                    else { console.error("Failed timeline fetch on switch:", timelineResult.reason); this._renderTimelineGraph(null, false, true); }
                }


            }).catch(error => { // Catch unexpected errors during the Promise.all/processing
                console.error(`Unexpected error during material switch to ${material}:`, error);
                this._showError(`Failed to switch material: ${error.message}`);
                // Revert or show error state
                this.currentMaterial = previousMaterial;
                 this._updateActiveMaterialTab();
                if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p class="error-text">Error loading material data.</p>';
                 this._renderOverviewPlaceholders(false, true);
            }).finally(() => {
                 this._updateLoadingState('materialSwitch', false);
                 // Ensure pill stats are updated with final data
                 this._updatePillStats(this.currentMaterial);
                 // Ensure batch size reflects potentially new setting
                 const batchSize = this.currentMaterialSettings?.defaultBatchSize ?? 20;
                 if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = batchSize;
            });

        } else if (material === this.currentMaterial) {
            console.log("Clicked active material, no change.");
        } else if (isLoadingAnything) {
            console.log("Ignoring material switch click while loading.");
        }
    }
    _updatePillStats(material) { /* ... Keep existing ... */
         console.log(`Updating pill stats for ${material || 'none'} using cached data.`);
         let dueCount = '-'; let newCount = '-';

         if (material && this.availableMaterials && this.availableMaterials.length > 0) {
             const materialData = this.availableMaterials.find(m => m.material === material && !m.error);
             if (materialData) {
                 dueCount = materialData.dueCount ?? '?';
                 newCount = materialData.newCardsTodayCount ?? '?';
                 console.log(`Stats for ${material}: Due=${dueCount}, New=${newCount}`);
             } else {
                 console.warn(`Material data not found or has error in cache for: ${material}`);
                 dueCount = '?'; newCount = '?';
             }
         } else { console.log("Clearing pill stats (no material or no data)."); }

         if (this.pillDueCardsCount) this.pillDueCardsCount.textContent = dueCount;
         if (this.pillNewCardsCount) this.pillNewCardsCount.textContent = newCount;
    }
    _renderMaterialTabs(materials) { /* ... Keep existing ... */
         console.log("DEBUG: _renderMaterialTabs - START, processing", materials?.length ?? 0, "materials.");
         if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) { console.error("FATAL: pillMaterialSwitcher or inner not found during _renderMaterialTabs."); return; }

         this.pillMaterialSwitcherInner.innerHTML = ''; // Clear previous
         this.currentMaterialScroll = 0; // Reset scroll position
         this.pillMaterialSwitcherInner.style.transform = `translateX(0px)`; // Reset transform

         if (!materials || materials.length === 0) { /* ... handle no materials ... */
              this.pillMaterialSwitcherInner.innerHTML = '<span class="no-materials">No materials found</span>';
              this.pillMaterialSwitcher.classList.remove('has-multiple', 'has-3plus-materials');
              this.currentMaterial = null;
              console.log("DEBUG: _renderMaterialTabs - No materials, showing message.");
              this._updateActiveMaterialTab(); return;
         }

         const hasMultiple = materials.length > 1;
         const has3Plus = materials.length >= 3; // Example threshold for different styling/scrolling behavior
         this.pillMaterialSwitcher.classList.toggle('has-multiple', hasMultiple);
         this.pillMaterialSwitcher.classList.toggle('has-3plus-materials', has3Plus); // Add class if needed by CSS

         // Ensure currentMaterial is valid
         if (this.currentMaterial && !materials.some(m => m.material === this.currentMaterial && !m.error)) { /* ... find fallback ... */
              console.warn(`Current material '${this.currentMaterial}' not found or has error in list. Finding fallback.`);
              const fallbackMaterial = materials.find(m => !m.error)?.material;
              this.currentMaterial = fallbackMaterial || null;
              console.log(`Fallback material set to: ${this.currentMaterial}`);
         } else if (!this.currentMaterial && materials.length > 0) { // If no current material, pick the first valid one
             this.currentMaterial = materials.find(m => !m.error)?.material || null;
             console.log(`No current material, set to first valid: ${this.currentMaterial}`);
         }

         // Render tabs
         materials.forEach((matData, index) => { /* ... create tab elements ... */
             if (!matData || !matData.material) { console.warn("Skipping invalid material data at index:", index); return; }

             const tab = document.createElement('button');
             tab.classList.add('material-tab');
             tab.dataset.material = matData.material;
             tab.dataset.index = index;
             tab.title = matData.material;
             tab.setAttribute('aria-label', `Select material: ${matData.material}`);

             if (matData.error) {
                 tab.classList.add('has-error'); tab.disabled = true;
                 tab.title += ` (Error: ${matData.message || 'Failed to load'})`;
                 tab.innerHTML = '<svg viewBox="0 0 24 24" fill="#d9534f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>';
             } else {
                 const iconSvg = this.materialIcons[matData.material] || this.materialIcons['default'];
                 tab.innerHTML = iconSvg;
             }
             this.pillMaterialSwitcherInner.appendChild(tab);
         });

         console.log(`DEBUG: _renderMaterialTabs - Finished creating tabs. Final inner child count: ${this.pillMaterialSwitcherInner.childElementCount}`);
         this._updateActiveMaterialTab(); // Set initial active/peeking classes and scroll state
    }
    _updateActiveMaterialTab() { /* ... Keep existing ... */
         if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) { return; }
         const tabs = Array.from(this.pillMaterialSwitcherInner.querySelectorAll('.material-tab'));
         const totalTabs = tabs.length; if (totalTabs === 0) return;

         let activeIndex = -1;
         tabs.forEach((tab, index) => {
             const isActive = tab.dataset.material === this.currentMaterial;
             tab.classList.toggle('is-active', isActive);
             if (isActive) activeIndex = index;
             tab.classList.remove('is-prev-1', 'is-next-1', 'is-prev-2', 'is-next-2', 'is-prev-3', 'is-next-3'); // Reset position classes
             tab.style.removeProperty('--tx'); // Reset transform variable
         });

         if (activeIndex === -1 && this.currentMaterial) { console.warn(`Active material '${this.currentMaterial}' not found in tabs.`); /* Handle error or fallback */ }
         else if (activeIndex !== -1) {
              for (let i = 0; i < totalTabs; i++) { /* ... apply position classes and --tx variable ... */
                  const distance = i - activeIndex; const tab = tabs[i];
                  if (distance === -1) tab.classList.add('is-prev-1');
                  else if (distance === 1) tab.classList.add('is-next-1');
                  else if (distance === -2) tab.classList.add('is-prev-2');
                  else if (distance === 2) tab.classList.add('is-next-2');
                  else if (distance === -3) tab.classList.add('is-prev-3'); // Add more if needed
                  else if (distance === 3) tab.classList.add('is-next-3');
                  // Set --tx for hover transforms (match CSS variable names)
                  if (distance !== 0) {
                     const txSign = distance < 0 ? '-' : '+';
                     const txVarNum = Math.min(Math.abs(distance), 3); // Cap at 3 or max defined in CSS
                     tab.style.setProperty('--tx', `calc(-50% ${txSign} var(--expand-translate-${txVarNum}))`);
                  }
              }
         }
         // Update scroll state to ensure active tab is visible if possible
         this._updateMaterialScrollState(true); // Pass true to scroll active into view
         console.log(`Active material tab updated for: ${this.currentMaterial}, Index: ${activeIndex}`);
    }
    _handleMaterialScroll(event) { /* ... Keep existing ... */
         if (!this.pillMaterialSwitcher?.classList.contains('has-multiple') || !this.pillMaterialSwitcherInner) return;
         event.preventDefault(); // Prevent page scroll

         const scrollAmount = event.deltaY || event.deltaX;
         const direction = scrollAmount > 0 ? 1 : -1;
         const scrollSpeedMultiplier = 50; // Adjust sensitivity

         const containerWidth = this.pillMaterialSwitcher.offsetWidth;
         const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
         const maxScroll = Math.max(0, innerWidth - containerWidth);

         let newScroll = this.currentMaterialScroll + (direction * scrollSpeedMultiplier);
         newScroll = Math.max(0, Math.min(newScroll, maxScroll)); // Clamp

         if (this.currentMaterialScroll !== newScroll) {
             this.currentMaterialScroll = newScroll;
             this.pillMaterialSwitcherInner.style.transform = `translateX(-${this.currentMaterialScroll}px)`;
             this._updateMaterialScrollState(); // Update visual indicators (arrows)
         }
    }
    _updateMaterialScrollState(scrollToActive = false) { /* ... Modified to scroll active into view ... */
         if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) return;
         const containerWidth = this.pillMaterialSwitcher.offsetWidth;
         const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
         const scrollThreshold = 5; // Pixels tolerance

         if (scrollToActive) {
              const activeTab = this.pillMaterialSwitcherInner.querySelector('.material-tab.is-active');
              if (activeTab) {
                   const tabRect = activeTab.getBoundingClientRect();
                   const containerRect = this.pillMaterialSwitcher.getBoundingClientRect();
                   const desiredScroll = this.currentMaterialScroll + tabRect.left - containerRect.left - (containerWidth / 2) + (tabRect.width / 2);
                   this.currentMaterialScroll = Math.max(0, Math.min(desiredScroll, innerWidth - containerWidth)); // Clamp
                   this.pillMaterialSwitcherInner.style.transform = `translateX(-${this.currentMaterialScroll}px)`;
              }
         }

         // Update scroll indicators based on final scroll position
         const currentScroll = this.currentMaterialScroll;
         this.pillMaterialSwitcher.classList.toggle('is-scrollable-left', currentScroll > scrollThreshold);
         this.pillMaterialSwitcher.classList.toggle('is-scrollable-right', currentScroll < innerWidth - containerWidth - scrollThreshold);
    }

     // Include Study/Navigation handlers
     _handleStudyDueClick() { /* ... Keep existing ... */
         if (!this.currentMaterial || this.isLoading.action || this.isLoading.materialSwitch) return;
         const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0;
         console.log(`Starting study session for DUE cards in ${this.currentMaterial}, limit: ${batchSize || 'None'}`);
         const material = encodeURIComponent(this.currentMaterial);
         let url = `study-session.html?material=${material}`;
         if (batchSize > 0) { url += `&batchSize=${batchSize}`; }
         window.location.href = url;
    }
     async _handleFocusedStudyClick() { /* ... Keep existing, ensure _findChapterData works ... */
        console.log("DEBUG: Focused Study button clicked. Selection Mode:", this.isSelectionModeActive);
        if (!this.currentMaterial) { this._showError("Please select a material first."); return; }

        if (!this.isSelectionModeActive) {
             this._handleToggleSelectionMode(true); // Force enter selection mode
             this._showInfoMessage("Select chapters and/or groups, then click 'Start Focused Study' again.", "Selection Mode");
             return;
        }

        const selectedChapterIds = Array.from(this.selectedItemIds.chapters);
        const selectedGroupIds = Array.from(this.selectedItemIds.groups);
        const chapterNamesToStudy = new Set();

        console.log(`DEBUG: Starting focused study prep. Chapters: ${selectedChapterIds.length}, Groups: ${selectedGroupIds.length}`);

        this._updateLoadingState('action', true);
        let fetchError = false;

        try {
            // 1. Get names for directly selected chapters using flat map cache
            selectedChapterIds.forEach(id => {
                const chapter = this.allChaptersData[id]; // Use flat map
                if (chapter?.name) chapterNamesToStudy.add(chapter.name);
                else console.warn(`Chapter data or name missing for selected ID: ${id}`);
            });

            // 2. Get names for chapters within selected groups
            const groupFetchPromises = selectedGroupIds.map(async groupId => {
                try {
                     let groupChapters = this.chaptersByGroup[groupId];
                     // Fetch if not already cached (unlikely with current flow, but safe check)
                     if (!Array.isArray(groupChapters)) {
                          console.log(`DEBUG: Re-fetching chapters for selected group ${groupId} for study.`);
                          groupChapters = await apiClient.getChapters(this.currentMaterial, { groupId: groupId, suspended: false });
                          this.chaptersByGroup[groupId] = groupChapters || []; // Update cache
                          (groupChapters || []).forEach(ch => { this.allChaptersData[ch.id] = ch; }); // Update flat map
                     }
                     (groupChapters || []).forEach(ch => chapterNamesToStudy.add(ch.name));
                } catch (groupError) {
                     console.error(`Error fetching chapters for selected group ${groupId}:`, groupError);
                     fetchError = true;
                     this._showError(`Could not fetch chapters for group "${this._findGroupData(groupId)?.name || groupId}".`);
                }
            });
            await Promise.allSettled(groupFetchPromises); // Wait for all group fetches

            if (fetchError) { throw new Error("Could not gather all chapters for study."); }
            if (chapterNamesToStudy.size === 0) { this._showInfoMessage("No chapters selected or found in selected groups."); this._updateLoadingState('action', false); return; }

            // 4. Construct URL and navigate
            const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0;
            const chapterNamesString = Array.from(chapterNamesToStudy).join(',');
            const encodedChapters = encodeURIComponent(chapterNamesString);
            const material = encodeURIComponent(this.currentMaterial);
            let url = `study-session.html?material=${material}&chapters=${encodedChapters}`;
            if (batchSize > 0) url += `&batchSize=${batchSize}`;

            console.log(`DEBUG: Navigating to focused session: ${url}`);
            window.location.href = url;

        } catch (error) {
             console.error("Error preparing focused study session:", error);
             this._showError(`Could not start focused study: ${error.message}`);
        } finally {
             this._updateLoadingState('action', false);
             // Exit selection mode AFTER potential navigation attempt
             if (this.isSelectionModeActive) this._handleToggleSelectionMode(false);
        }
    }
     _navigateToChapterDetails(chapterName) { /* ... Keep existing ... */
         if (!chapterName || !this.currentMaterial) return;
         const encodedChapter = encodeURIComponent(chapterName);
         const material = encodeURIComponent(this.currentMaterial);
         const url = `flashcards-view.html?material=${material}&chapter=${encodedChapter}`;
         console.log(`Navigating to chapter details: ${url}`);
         window.location.href = url;
    }

     // --- Overview Section Rendering ---
     // _renderHeatmap, _renderReviewActivityHeatmap, _renderTimelineGraph
     // These likely need minimal JS changes unless the underlying libraries or data formats change.
     // Style changes handled by UI team via CSS.
     _renderHeatmap(chapters, showError = false) { /* ... Keep existing ... */
         if (!this.heatmapGrid || !this.heatmapTooltipElement) return; // Check elements exist
         if (showError) { this.heatmapGrid.innerHTML = '<p class="error-text">Error loading mastery</p>'; return; }
         if (chapters === null || typeof chapters === 'undefined') { this.heatmapGrid.innerHTML = '<p class="loading-text">Loading mastery...</p>'; return; }
         if (chapters.length === 0) { this.heatmapGrid.innerHTML = '<p class="no-data">No chapters</p>'; return; }

         this.heatmapGrid.innerHTML = ''; // Clear previous
         const fragment = document.createDocumentFragment();
         chapters.forEach(chapter => {
             if (!chapter || !chapter.chapter) return; // Skip invalid data
             const cell = document.createElement('div');
             cell.classList.add('heatmap-cell');
             const masteryPercent = chapter.mastery ?? 0;
             const masteryLevel = this._getMasteryLevelClass(masteryPercent); // Uses updated logic if needed
             cell.dataset.mastery = masteryLevel;
             cell.dataset.chapter = chapter.chapter; // Use name for tooltip/nav
             const tooltipText = `${chapter.chapter} (${masteryPercent}%)`;
             cell.addEventListener('mouseenter', (event) => this._showHeatmapTooltip(tooltipText, event.target));
             cell.addEventListener('mouseleave', () => this._hideHeatmapTooltip());
             cell.addEventListener('click', () => {
                 if (!this.isSelectionModeActive) { this._navigateToChapterDetails(chapter.chapter); }
             });
             fragment.appendChild(cell);
         });
         this.heatmapGrid.appendChild(fragment);
    }
    _showHeatmapTooltip(text, targetElement) { /* ... Keep existing ... */
        if (!this.heatmapTooltipElement || !targetElement) return;
        this.heatmapTooltipElement.textContent = text;
        const targetRect = targetElement.getBoundingClientRect();
        this.heatmapTooltipElement.style.visibility = 'hidden'; this.heatmapTooltipElement.style.display = 'block';
        const tooltipRect = this.heatmapTooltipElement.getBoundingClientRect();
        this.heatmapTooltipElement.style.display = ''; this.heatmapTooltipElement.style.visibility = '';
        let top = targetRect.top + window.scrollY - tooltipRect.height - 8;
        let left = targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
        if (left < 10) left = 10;
        else if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
        if (top < window.scrollY + 10) top = targetRect.bottom + window.scrollY + 8; // Adjust for scrollY
        this.heatmapTooltipElement.style.left = `${left}px`;
        this.heatmapTooltipElement.style.top = `${top}px`;
        this.heatmapTooltipElement.classList.add('visible');
    }
    _hideHeatmapTooltip() { /* ... Keep existing ... */
        if (!this.heatmapTooltipElement) return;
        this.heatmapTooltipElement.classList.remove('visible');
        // Optional: Reset position after transition/timeout
        setTimeout(() => {
            if (!this.heatmapTooltipElement.classList.contains('visible')) {
                 this.heatmapTooltipElement.style.left = '-9999px'; this.heatmapTooltipElement.style.top = '-9999px';
            }
        }, 250); // Match transition duration
    }
     _renderReviewActivityHeatmap(activityData, showError = false) { /* ... Keep existing ... */
         if (!this.reviewActivityGrid) return;
         if (showError) { this.reviewActivityGrid.innerHTML = '<p class="error-text">Error loading activity</p>'; return; }
         if (activityData === null || typeof activityData === 'undefined') { this.reviewActivityGrid.innerHTML = '<p class="loading-text">Loading activity...</p>'; return; }
         if (Object.keys(activityData).length === 0) { this.reviewActivityGrid.innerHTML = '<p class="no-data">No recent activity</p>'; return; }

         this.reviewActivityGrid.innerHTML = '';
         const fragment = document.createDocumentFragment();
         const dates = Object.keys(activityData); const counts = Object.values(activityData);
         const cellCount = Math.min(counts.length, 30); // Max 30 days
         for (let i = 0; i < cellCount; i++) { /* ... create cells ... */
              const count = counts[i]; const date = dates[i];
              const cell = document.createElement('div'); cell.classList.add('review-heatmap-cell');
              const intensityClass = this._getReviewIntensityClass(count);
              if (intensityClass) cell.dataset.reviews = intensityClass;
              cell.dataset.tooltip = `${date}: ${count} review${count === 1 ? '' : 's'}`;
              // Add tooltip listeners if needed, or rely on CSS tooltips
              fragment.appendChild(cell);
         }
         for (let i = cellCount; i < 30; i++) { /* ... add empty cells ... */ fragment.appendChild(document.createElement('div')); }
         this.reviewActivityGrid.appendChild(fragment);
    }
     _getReviewIntensityClass(count) { /* ... Keep existing ... */
         if (count >= 8) return '8+'; if (count >= 4) return '4-7'; if (count >= 1) return '1-3'; return null;
    }
     _renderTimelineGraph(timelineData, isLoading = false, isError = false, customMessage = null) { /* ... Keep existing ... */
         console.log(`DEBUG TIMELINE: Render called - isLoading=${isLoading}, isError=${isError}, customMsg=${customMessage}, data=${!!timelineData}`);
         if (!this.reviewScheduleCanvas || !this.reviewScheduleContainer || !this.reviewStatusElement) { return; }
         const ctx = this.reviewScheduleCanvas.getContext('2d'); if (!ctx) { console.error("DEBUG TIMELINE: Failed context."); return; }

         const showStatus = (message, isErr = false) => { /* ... keep status logic ... */
              console.log(`DEBUG TIMELINE: Showing status - "${message}", isError=${isErr}`);
              this.reviewStatusElement.textContent = message;
              this.reviewStatusElement.style.color = isErr ? 'var(--danger-red)' : 'var(--text-secondary)'; // Use CSS vars
              this.reviewStatusElement.style.display = 'block';
              this.reviewScheduleCanvas.style.display = 'none';
              if (this.chartInstance) { console.log("DEBUG TIMELINE: Destroying chart (showStatus)."); this.chartInstance.destroy(); this.chartInstance = null; }
         };
         const hideStatus = () => { /* ... keep status logic ... */
              console.log("DEBUG TIMELINE: Hiding status, showing canvas.");
              this.reviewStatusElement.style.display = 'none'; this.reviewScheduleCanvas.style.display = 'block';
         };

         // Handle States FIRST
         if (customMessage) { showStatus(customMessage, isError); return; }
         if (isLoading) { showStatus('Loading schedule...'); return; }
         if (isError) { showStatus('Error loading schedule', true); return; }
         if (!timelineData || Object.keys(timelineData).length === 0 || !Object.values(timelineData).some(v => v > 0)) { // Added check for all zero values
             console.log("DEBUG TIMELINE: Empty or all-zero timeline data, showing 'No upcoming reviews'");
             showStatus('No upcoming reviews'); return;
         }

         // Render Chart
         console.log("DEBUG TIMELINE: Proceeding to render chart."); hideStatus();
         if (this.chartInstance) { console.log("DEBUG TIMELINE: Destroying previous chart."); this.chartInstance.destroy(); this.chartInstance = null; }
         let existingChart = Chart.getChart(this.reviewScheduleCanvas); if (existingChart) { console.log("DEBUG TIMELINE: Destroying existing on canvas."); existingChart.destroy(); }

         try {
              const sortedDates = Object.keys(timelineData).sort(); const labels = sortedDates; const dataCounts = sortedDates.map(date => timelineData[date]);
              console.log("DEBUG TIMELINE DATA:", JSON.stringify(labels), JSON.stringify(dataCounts));

              this.chartInstance = new Chart(ctx, {
                  type: 'bar',
                  data: { labels: labels, datasets: [{ label: 'Due Cards', data: dataCounts, backgroundColor: 'rgba(91, 192, 222, 0.6)', borderColor: 'rgba(91, 192, 222, 1)', borderWidth: 1, borderRadius: 4, borderSkipped: false, }] },
                  options: { // Apply new styling options here if needed
                       responsive: true, maintainAspectRatio: false,
                       plugins: { legend: { display: false }, tooltip: { /* ... tooltip styles ... */ backgroundColor: '#1a1a2e', titleColor: '#e0e0e0', bodyColor: '#e0e0e0', displayColors: false, callbacks: { title: (tooltipItems) => tooltipItems[0].label, label: (tooltipItem) => `Reviews: ${tooltipItem.raw}` } } },
                       scales: { x: { grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', maxRotation: 45, minRotation: 45 } }, y: { beginAtZero: true, grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', stepSize: 1, callback: function (value) { if (Number.isInteger(value)) return value; } } } }
                  }
              });
              console.log("DEBUG TIMELINE: Chart instance CREATED successfully.");
         } catch (chartError) { console.error("DEBUG TIMELINE: Chart.js error:", chartError); showStatus('Error displaying graph', true); this._showError(`Failed to display review schedule graph: ${chartError.message}`); }
    }

     // Include Update Loading State
     _updateLoadingState(part, isLoading, identifier = null) { /* ... Keep existing ... */
        let stateKey = part; let changed = false;
        if (identifier !== null && typeof this.isLoading[part] === 'object') { if (this.isLoading[part][identifier] !== isLoading) { this.isLoading[part][identifier] = isLoading; stateKey = `${part}.${identifier}`; changed = true; } }
        else if (typeof this.isLoading[part] === 'boolean') { if (this.isLoading[part] !== isLoading) { this.isLoading[part] = isLoading; changed = true; } }
        else { console.warn("Attempted to update unknown loading state:", part, identifier); return; }
        if (changed) { console.log(`DEBUG Loading state ${stateKey}: ${isLoading}`); }

        // Recalculate if *any* operation is loading
        let anyLoading = false;
        for (const key in this.isLoading) {
            const state = this.isLoading[key];
            if (typeof state === 'boolean' && state) { anyLoading = true; break; }
            else if (typeof state === 'object' && Object.values(state).some(val => val === true)) { anyLoading = true; break; }
        }
        this.container?.classList.toggle('is-loading-main', anyLoading);

        // Disable controls during relevant loading states
        const controlsDisabled = this.isLoading.dashboard || this.isLoading.chaptersUngrouped || this.isLoading.action || this.isLoading.materialSwitch;
        this.sortFieldSelect?.toggleAttribute('disabled', controlsDisabled);
        this.sortOrderSelect?.toggleAttribute('disabled', controlsDisabled);
        this.tagPillsContainer?.querySelectorAll('button').forEach(button => {
             // Disable filters/actions during major loads or specific actions
             if (controlsDisabled || (this.isLoading.action && button.dataset.action)) {
                  button.toggleAttribute('disabled', true);
             } else {
                  button.toggleAttribute('disabled', false); // Re-enable if not loading
             }
        });
        // Ensure add tag input is also disabled/enabled correctly
        const addTagInput = this.tagPillsContainer?.querySelector('.add-tag-input');
        if(addTagInput) addTagInput.disabled = controlsDisabled || this.isLoading.action;
    }

    // Bulk Action Handlers (_handleBulk...) should still work if _findChapterData and API calls are correct.
    _handleBulkTagChapters() { /* ... Keep existing, ensure _findChapterData is used ... */
         const chapterIds = Array.from(this.selectedItemIds.chapters);
         if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected to tag."); return; }
         console.log("DEBUG: Opening tag selector for BULK edit", chapterIds);
         if (!this.tagSelectorModalOverlay || !this.tagSelectorList || !this.tagSelectorConfirmButton) { this._showError("Tag selector UI elements not found."); return; }

         this.activeTagSelectorTarget = null; // Signal bulk mode
         this.bulkActionTargetIds = chapterIds; // Store IDs for confirm handler

         this.tagSelectorList.innerHTML = ''; // Clear previous
         if (this.availableTags.length === 0) { this.tagSelectorList.innerHTML = '<li>No tags available. Create tags first.</li>'; }
         else {
              this.availableTags.sort().forEach(tag => { /* ... Populate checkboxes, DO NOT check any by default in bulk mode ... */
                   const li = document.createElement('li');
                   const checkboxId = `tag-select-bulk-${tag.replace(/\s+/g, '-')}`;
                   li.innerHTML = `<input type="checkbox" id="${checkboxId}" value="${tag}"><label for="${checkboxId}">${tag}</label>`;
                   this.tagSelectorList.appendChild(li);
              });
         }
         const titleEl = this.tagSelectorModalOverlay.querySelector('.modal-title'); // Assuming .modal-title exists
         if(titleEl) titleEl.textContent = `Add Tags to ${chapterIds.length} Chapters`;
         this._showModal('tagSelectorModal');
    }
    async _handleConfirmChapterTags() { /* ... Keep existing ... */
         if (!this.tagSelectorList) return;
         const isBulkMode = !this.activeTagSelectorTarget; // Check if we're in bulk mode
         const chapterIdsToUpdate = isBulkMode ? this.bulkActionTargetIds : (this.activeTagSelectorTarget ? [this.activeTagSelectorTarget.id] : []);
         if (!chapterIdsToUpdate || chapterIdsToUpdate.length === 0 || chapterIdsToUpdate[0] === null) { console.warn("DEBUG: No target chapter ID found for tag confirmation."); this._hideModal('tagSelectorModal'); return; }

         const tagsSelectedInModal = Array.from(this.tagSelectorList.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value).sort();
         console.log(`DEBUG: Confirming tags for ${isBulkMode ? 'BULK' : chapterIdsToUpdate[0]}:`, tagsSelectedInModal);
         this._hideModal('tagSelectorModal');
         this._updateLoadingState('action', true);
         let errorsOccurred = false;

         const promises = chapterIdsToUpdate.map(async (chapterId) => {
              const chapterData = this._findChapterData(chapterId);
              if (!chapterData) { console.warn(`Skipping tag update for missing chapter ${chapterId}`); return; }
              const currentTagsSorted = (chapterData.tags || []).sort();
              let finalTags;
              if (isBulkMode) { // Bulk mode: ADD selected tags
                   finalTags = Array.from(new Set([...(chapterData.tags || []), ...tagsSelectedInModal])).sort();
              } else { // Single mode: REPLACE tags
                   finalTags = tagsSelectedInModal;
              }
              if (JSON.stringify(finalTags) !== JSON.stringify(currentTagsSorted)) { // Check if changed
                    try {
                         const materialName = this.currentMaterial; // Use current material
                         if (!materialName) throw new Error(`Material name missing for chapter ${chapterId}`);
                         await apiClient.setChapterTags(materialName, chapterId, finalTags); // API needs material + chapterId + tags
                         chapterData.tags = finalTags; // Update local cache
                    } catch (error) { console.error(`Failed to update tags for chapter ${chapterId}:`, error); errorsOccurred = true; }
              }
         });

         await Promise.allSettled(promises);
         this._updateLoadingState('action', false);
         this.activeTagSelectorTarget = null; this.bulkActionTargetIds = null; // Clear targets
         if (errorsOccurred) { this._showError("Some chapter tags could not be updated."); }
         else { this._showInfoMessage(`Chapter tags updated for ${chapterIdsToUpdate.length} chapter(s).`); }
         if (isBulkMode && !errorsOccurred && this.isSelectionModeActive) { this._handleToggleSelectionMode(false); } // Exit selection on success
    }
    async _handleBulkPinChapters() { /* ... Keep existing ... */
         const chapterIds = Array.from(this.selectedItemIds.chapters); if (chapterIds.length === 0) { /* ... */ return; }
         this._showModal('confirmationModal', 'Pin/Unpin Selected?', `Do you want to Pin or Unpin the ${chapterIds.length} selected chapters?`, [
              { text: 'Cancel', class: 'secondary' },
              { text: 'Unpin', class: 'secondary', action: () => this._executeBulkPinToggle(chapterIds, false) },
              { text: 'Pin', class: 'primary', action: () => this._executeBulkPinToggle(chapterIds, true) }
         ]);
    }
    async _executeBulkPinToggle(chapterIds, shouldPin) { /* ... Keep existing ... */
         this._updateLoadingState('action', true); let errorsOccurred = false; const actionVerb = shouldPin ? 'Pinning' : 'Unpinning';
         const apiCall = shouldPin ? apiClient.pinChapter : apiClient.unpinChapter;
         console.log(`DEBUG: ${actionVerb} ${chapterIds.length} chapters.`);
         const promises = chapterIds.map(async id => {
              try { await this._executePinToggle(id, shouldPin); } // Use helper
              catch (e) { errorsOccurred = true; console.error(`${actionVerb} error for ${id}:`, e); }
         });
         await Promise.allSettled(promises);
         this._updateLoadingState('action', false);
         if (errorsOccurred) this._showError(`Some chapters could not be ${shouldPin ? 'pinned' : 'unpinned'}.`);
         else this._showInfoMessage(`Selected chapters ${shouldPin ? 'pinned' : 'unpinned'}.`);
         this._handleToggleSelectionMode(false); // Exit selection mode
         if (this.currentFilter.type === 'pinned') this._renderFilteredView(this.currentFilter); // Refresh if viewing pinned
    }
    async _handleBulkSuspendChapters() { /* ... Keep existing ... */
        const chapterIds = Array.from(this.selectedItemIds.chapters); if (chapterIds.length === 0) { /* ... */ return; }
        this._showModal('confirmationModal', 'Suspend/Unsuspend?', `Do you want to Suspend or Unsuspend the ${chapterIds.length} selected chapters?`, [
             { text: 'Cancel', class: 'secondary' },
             { text: 'Unsuspend', class: 'secondary', action: () => this._executeBulkSuspendToggle(chapterIds, false) },
             { text: 'Suspend', class: 'primary', action: () => this._executeBulkSuspendToggle(chapterIds, true) }
        ]);
    }
    async _executeBulkSuspendToggle(chapterIds, shouldSuspend) { /* ... Keep existing ... */
         this._updateLoadingState('action', true); let errorsOccurred = false; const actionVerb = shouldSuspend ? 'Suspending' : 'Unsuspending';
         const apiCall = shouldSuspend ? apiClient.suspendChapter : apiClient.unsuspendChapter;
         console.log(`DEBUG: ${actionVerb} ${chapterIds.length} chapters.`);
         const promises = chapterIds.map(async id => {
              try { await this._executeSuspendToggle(id, shouldSuspend); } // Use helper
              catch (e) { errorsOccurred = true; console.error(`${actionVerb} error for ${id}:`, e); }
         });
         await Promise.allSettled(promises);
         this._updateLoadingState('action', false);
         if (errorsOccurred) this._showError(`Some chapters could not be ${shouldSuspend ? 'suspended' : 'unsuspended'}.`);
         else this._showInfoMessage(`Selected chapters ${shouldSuspend ? 'suspended' : 'unsuspended'}.`);
         // Refresh the current view (layout or filtered) to reflect removals/additions
         if (this.currentFilter.type === 'all') { await this._fetchAndRenderInitialDashboardContent(); } // Full refresh for dashboard
         else { this._renderFilteredView(this.currentFilter); } // Refresh filter view
         this._handleToggleSelectionMode(false); // Exit selection mode
    }
    async _handleBulkGroupChapters() { /* ... Keep existing ... */
         const chapterIds = Array.from(this.selectedItemIds.chapters);
         if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected."); return; }
         const defaultGroupName = `New Group (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
         console.log(`DEBUG: Bulk creating group "${defaultGroupName}" for ${chapterIds.length} chapters.`);
         this._updateLoadingState('action', true); let newGroup = null; let errorsOccurred = false;
         try {
              // 1. Create Group
               newGroup = await apiClient.createGroup(this.currentMaterial, { name: defaultGroupName, /* Add other defaults if needed */ });
               this.groupsData.push(newGroup); this.chaptersByGroup[newGroup.id] = [];
               console.log(`DEBUG: Group ${newGroup.id} created. Assigning chapters...`);
              // 2. Assign Chapters
               const assignPromises = chapterIds.map(async (chapterId) => {
                   try {
                        const chapter = this._findChapterData(chapterId);
                        const originalGroupId = chapter?.groupId || null;
                        await apiClient.assignChapterToGroup(chapterId, newGroup.id);
                        this._moveChapterLocally(chapterId, originalGroupId, newGroup.id);
                   } catch (assignError) { console.error(`Assign error ${chapterId}:`, assignError); errorsOccurred = true; }
               });
               await Promise.allSettled(assignPromises);
               console.log(`DEBUG: Chapter assignment complete. Rendering layout.`);
               // 3. Refresh layout
               this._renderDashboardLayout(); // Render new group and remove old chapter widgets
               // 4. Activate rename & scroll (delayed)
               setTimeout(() => {
                    const newGroupElement = this._findGroupElement(newGroup.id);
                    if (newGroupElement) { this._handleRename(newGroupElement, 'group'); newGroupElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
               }, 150);
               if (errorsOccurred) this._showError("Group created, but some chapters could not be added.");
         } catch (error) { console.error("Failed to bulk create group:", error); this._showError(`Could not create group: ${error.message}`); if (newGroup?.id) { /* Cleanup local data */ this.groupsData = this.groupsData.filter(g => g.id !== newGroup.id); delete this.chaptersByGroup[newGroup.id]; } }
         finally { this._updateLoadingState('action', false); if (this.isSelectionModeActive) { this._handleToggleSelectionMode(false); } }
    }
    async _handleBulkDeleteChapters() { /* ... Keep existing, ensure _findChapterData and API call work ... */
         const chapterIds = Array.from(this.selectedItemIds.chapters); if (chapterIds.length === 0) { /* ... */ return; }
         this._showModal('confirmationModal', `Delete ${chapterIds.length} Chapters?`, `Permanently delete the ${chapterIds.length} selected chapters and all their cards? This cannot be undone.`, [
              { text: 'Cancel', class: 'secondary' },
              { text: 'Delete Selected', class: 'primary', action: async () => {
                   this._updateLoadingState('action', true); let errorsOccurred = false;
                   console.log(`DEBUG: Deleting ${chapterIds.length} chapters.`);
                   const promises = chapterIds.map(async id => {
                        try {
                             const chapter = this._findChapterData(id); if (!chapter) return;
                             const chapterElement = this._findChapterElement(id);
                             await apiClient.deleteChapter(this.currentMaterial, chapter.name); // API uses name
                             // Remove locally
                             if (chapter.groupId && this.chaptersByGroup[chapter.groupId]) this.chaptersByGroup[chapter.groupId] = this.chaptersByGroup[chapter.groupId].filter(c => c.id !== id);
                             this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== id);
                             delete this.allChaptersData[id];
                             // Remove from grid
                             if (this.gridInstance && chapterElement && this.gridInstance.isWidget(chapterElement)) { this.gridInstance.removeWidget(chapterElement, true, false); } else { chapterElement?.remove(); }
                        } catch (e) { errorsOccurred = true; console.error(`Delete error for ${id} (${chapter?.name}):`, e); }
                   });
                   await Promise.allSettled(promises);
                   this._updateLoadingState('action', false);
                   if (errorsOccurred) this._showError("Some chapters could not be deleted.");
                   else this._showInfoMessage(`${chapterIds.length} chapters deleted.`);
                   this._handleToggleSelectionMode(false); // Exit selection
                   await this._loadOverviewData(); // Refresh overview after deletion
              }}
         ], 'warning');
    }

     // --- Toggle Pin/Suspend Helpers used by bulk actions and context menus ---
     async _executePinToggle(chapterId, shouldPin) { /* ... Keep existing ... */
          const chapter = this._findChapterData(chapterId); if (!chapter) return Promise.reject(`Chapter ${chapterId} not found locally.`);
          const chapterElement = this._findChapterElement(chapterId);
          const apiCall = shouldPin ? apiClient.pinChapter : apiClient.unpinChapter;
          try {
               const result = await apiCall(chapterId);
               chapter.isPinned = result.chapter.isPinned;
               if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isPinned = chapter.isPinned;
               chapterElement?.classList.toggle('is-pinned', chapter.isPinned);
               // Add/remove indicator span dynamically if needed by new structure
               const indicator = chapterElement?.querySelector('.pinned-indicator');
               if (chapter.isPinned && !indicator) {
                    const span = document.createElement('span'); span.className = 'pinned-indicator'; span.title = 'Pinned'; span.textContent = '📌';
                    // Append indicator to the appropriate place in the new structure
                    chapterElement?.querySelector('.chapter-item-content-wrapper')?.appendChild(span); // Example placement
               } else if (!chapter.isPinned && indicator) {
                    indicator.remove();
               }
               return result; // Return result for potential chaining
          } catch(error) {
               console.error(`Pin toggle failed for ${chapterId}:`, error);
               // Don't revert UI here, let caller handle overall success/failure message
               return Promise.reject(error); // Propagate error
          }
     }
     async _executeSuspendToggle(chapterId, shouldSuspend) { /* ... Keep existing ... */
          const chapter = this._findChapterData(chapterId); if (!chapter) return Promise.reject(`Chapter ${chapterId} not found locally.`);
          const chapterElement = this._findChapterElement(chapterId);
          const apiCall = shouldSuspend ? apiClient.suspendChapter : apiClient.unsuspendChapter;
          try {
               const result = await apiCall(chapterId);
               chapter.isSuspended = result.chapter.isSuspended;
               if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isSuspended = chapter.isSuspended;
               // Update UI class
               chapterElement?.classList.toggle('is-suspended', chapter.isSuspended);
               // Update local data caches immediately
               if (shouldSuspend) {
                    if (chapter.groupId && this.chaptersByGroup[chapter.groupId]) this.chaptersByGroup[chapter.groupId] = this.chaptersByGroup[chapter.groupId].filter(c => c.id !== chapterId);
                    this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
               }
               // Removal/re-adding from view is handled by the caller refreshing layout/filter
               return result;
          } catch(error) {
               console.error(`Suspend toggle failed for ${chapterId}:`, error);
               return Promise.reject(error);
          }
     }
     // --- Create Group Modal ---
     _handleOpenCreateGroupModal() { /* ... Keep existing ... */
         if (!this.createGroupModalOverlay || !this.newGroupNameInput || !this.newGroupColorInput) return;
         this.newGroupNameInput.value = ''; // Clear fields
         this.newGroupColorInput.value = '#cccccc'; // Default color?
         this._showModal('createGroupModal');
         // Note: Selection mode is NOT entered here anymore. It's handled by the selection toolbar button or focused study flow.
     }
     async _handleCreateGroupConfirm() { /* ... Modified logic (removed isCreatingGroup flag) ... */
         if (!this.newGroupNameInput) return;
         const name = this.newGroupNameInput.value.trim();
         const color = this.newGroupColorInput?.value || undefined;
         if (!name) { this._showError("Group name cannot be empty."); return; }

         // ** Get selected chapters from the CURRENT selection state **
         // This relies on the user having selected chapters *before* clicking the create group button in the toolbar
         // OR selecting chapters while the modal is open (if UI allows background interaction) - requires testing.
         // Let's assume chapters are selected *before* confirming the modal.
         const chaptersToAssign = Array.from(this.selectedItemIds.chapters);

         console.log(`DEBUG: Confirming Create Group "${name}". Chapters selected: ${chaptersToAssign.length}`);
         this._hideModal('createGroupModal');
         this._updateLoadingState('action', true);
         let newGroup = null; let errorsOccurred = false;

         try {
             // 1. Create Group
             newGroup = await apiClient.createGroup(this.currentMaterial, { name, color /* , default layout/sort? */ });
             this.groupsData.push(newGroup); this.chaptersByGroup[newGroup.id] = [];

             // 2. Assign Selected Chapters
             if (chaptersToAssign.length > 0) {
                 console.log(`DEBUG: Assigning ${chaptersToAssign.length} chapters to new group ${newGroup.id}`);
                 const assignPromises = chaptersToAssign.map(async (chapterId) => {
                     try {
                          const chapter = this._findChapterData(chapterId);
                          const originalGroupId = chapter?.groupId || null;
                          await apiClient.assignChapterToGroup(chapterId, newGroup.id);
                          this._moveChapterLocally(chapterId, originalGroupId, newGroup.id);
                     } catch (assignError) { console.error(`Assign error ${chapterId}:`, assignError); errorsOccurred = true; }
                 });
                 await Promise.allSettled(assignPromises);
             }

             // 3. Exit selection mode (assuming group creation implies action completion)
             if (this.isSelectionModeActive) { this._handleToggleSelectionMode(false); }

             // 4. Render the new layout
             this._renderDashboardLayout();

             // 5. Activate rename & scroll
             setTimeout(() => {
                 const newGroupElement = this._findGroupElement(newGroup.id);
                 if (newGroupElement) { this._handleRename(newGroupElement, 'group'); newGroupElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
             }, 150);

             if (errorsOccurred) this._showError("Group created, but some chapters could not be added.");
             else this._showInfoMessage(`Group "${name}" created.`);

         } catch (error) { /* ... error handling ... */
             console.error("Failed to create group or assign chapters:", error); this._showError(`Could not create group: ${error.message}`);
             if (newGroup?.id) { this.groupsData = this.groupsData.filter(g => g.id !== newGroup.id); delete this.chaptersByGroup[newGroup.id]; }
             if (this.isSelectionModeActive) { this._handleToggleSelectionMode(false); } // Ensure exit on failure too
         } finally {
             this._updateLoadingState('action', false);
             // this.isCreatingGroup = false; // Flag is removed/deprecated
             // this.groupCreateSelectedChapters.clear(); // Set is removed/deprecated
         }
    }


     // Add DELETE GROUP Handler
     _handleDeleteGroup(groupElement, groupData) {
         if (!groupElement || !groupData || this.isLoading.action) return;
         const groupId = groupData.id;
         const groupName = groupData.name;
         const chapterCount = this.chaptersByGroup[groupId]?.length || groupData.stats?.chapterCount || 0; // Estimate chapter count

         const message = chapterCount > 0
             ? `Permanently delete the group "${groupName}"? All ${chapterCount} chapters within it will become ungrouped (chapters themselves will not be deleted).`
             : `Permanently delete the empty group "${groupName}"?`;

         this._showModal('confirmationModal', 'Delete Group?', message, [
              { text: 'Cancel', class: 'secondary' },
              { text: 'Delete Group', class: 'primary', action: async () => {
                   this._updateLoadingState('action', true);
                   groupElement.style.pointerEvents = 'none'; // Prevent interaction
                   try {
                        await apiClient.deleteGroup(groupId);
                        console.log(`Deletion successful for group: ${groupName} (ID: ${groupId})`);

                        // Remove group from local state
                        this.groupsData = this.groupsData.filter(g => g.id !== groupId);
                        const chaptersToMove = this.chaptersByGroup[groupId] || [];
                        delete this.chaptersByGroup[groupId];

                        // Mark chapters as ungrouped locally
                        chaptersToMove.forEach(ch => {
                             const chapterData = this.allChaptersData[ch.id]; // Find in flat map
                             if(chapterData) {
                                  chapterData.groupId = null;
                                  this.ungroupedChaptersData.push(chapterData); // Add to ungrouped list
                             }
                         });
                        // Optionally re-sort ungrouped list
                        // this.ungroupedChaptersData.sort(...)

                        // Remove group widget from grid
                        if (this.gridInstance) { this.gridInstance.removeWidget(groupElement); }
                        else { groupElement.remove(); }

                        // Re-render the moved chapters as standalone items
                         this._renderDashboardLayout(); // Easiest way to refresh layout

                        this._showInfoMessage(`Group "${groupName}" deleted.`);
                        // Optionally refresh overview data if group stats affected it significantly
                        // await this._loadOverviewData();

                   } catch (error) {
                        console.error(`Failed to delete group ${groupName}:`, error);
                        this._showError(`Could not delete group: ${error.message}`);
                        groupElement.style.pointerEvents = '';
                   } finally {
                        this._updateLoadingState('action', false);
                   }
              }}
         ], 'warning');
     }

     // Include remaining handlers like _handleDeleteChapter, tag management handlers, etc.
     async _handleDeleteChapter(chapterElement, chapterName) { /* ... Keep existing, ensure name is passed correctly ... */
         const chapterId = chapterElement?.dataset.chapterId;
         if (!chapterId || !chapterName || this.isLoading.action) return;

         this._showModal('confirmationModal', 'Delete Chapter?', `Permanently delete chapter "${chapterName}" and all its cards? This cannot be undone.`, [
              { text: 'Cancel', class: 'secondary' },
              { text: 'Delete Permanently', class: 'primary', action: async () => {
                   this._updateLoadingState('action', true);
                   chapterElement.style.pointerEvents = 'none';
                   try {
                        await apiClient.deleteChapter(this.currentMaterial, chapterName); // API uses name
                        console.log(`Deletion successful for chapter: ${chapterName} (ID: ${chapterId})`);
                        const chapterData = this._findChapterData(chapterId); // Find data before removing
                        // Remove from local state
                        if (chapterData?.groupId && this.chaptersByGroup[chapterData.groupId]) { this.chaptersByGroup[chapterData.groupId] = this.chaptersByGroup[chapterData.groupId].filter(c => c.id !== chapterId); }
                        this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
                        delete this.allChaptersData[chapterId]; // Remove from flat map
                        // Remove from grid
                        if (this.gridInstance && this.gridInstance.isWidget(chapterElement)) { this.gridInstance.removeWidget(chapterElement, true, false); } else { chapterElement.remove(); }
                        this._showInfoMessage(`Chapter "${chapterName}" deleted.`);
                        await this._loadOverviewData(); // Refresh overview
                   } catch (error) { /* ... error handling ... */ console.error(`Failed to delete chapter ${chapterName}:`, error); this._showError(`Could not delete chapter: ${error.message}`); chapterElement.style.pointerEvents = ''; }
                   finally { this._updateLoadingState('action', false); }
              }}
         ], 'warning');
     }
     _handleOpenTagManagementModal() { /* ... Keep existing ... */
          console.log("Opening Tag Management Modal");
          if (!this.tagManagementModalOverlay || !this.existingTagsList || !this.newTagNameInput) return;
          this.existingTagsList.innerHTML = ''; // Clear previous
          if (this.availableTags.length === 0) { this.existingTagsList.innerHTML = '<li>No tags created yet.</li>'; }
          else {
              this.availableTags.sort().forEach(tag => {
                  const li = document.createElement('li');
                  li.innerHTML = `<span>${tag}</span><button class="delete-tag-btn" data-tag-name="${tag}" title="Delete tag">×</button>`;
                  li.querySelector('.delete-tag-btn')?.addEventListener('click', () => this._handleDeleteTag(tag));
                  this.existingTagsList.appendChild(li);
              });
          }
          this.newTagNameInput.value = '';
          this._showModal('tagManagementModal');
     }
     async _handleCreateTag() { /* ... Keep existing ... */
          if (!this.newTagNameInput) return; const newTagName = this.newTagNameInput.value.trim();
          if (!newTagName) { this._showError("Tag name cannot be empty.", true); return; }
          if (this.availableTags.includes(newTagName)) { this._showError(`Tag "${newTagName}" already exists.`, true); return; }
          this._updateLoadingState('action', true);
          try {
               const result = await apiClient.createMaterialTag(this.currentMaterial, newTagName);
               this.availableTags = result.tags || this.availableTags;
               this._renderTagPills(); // Re-render pills in main UI
               this._handleOpenTagManagementModal(); // Refresh modal content
               this.newTagNameInput.value = '';
               this._showInfoMessage(`Tag "${newTagName}" created.`);
          } catch (error) { console.error("Failed to create tag:", error); this._showError(`Could not create tag: ${error.message}`); }
          finally { this._updateLoadingState('action', false); }
     }
     async _handleDeleteTag(tagName) { /* ... Keep existing ... */
          if (!tagName) return;
          this._showModal('confirmationModal', 'Delete Tag?', `Are you sure you want to delete the tag "${tagName}"? This will only remove it from the available tag list, not from chapters already using it.`, [
               { text: 'Cancel', class: 'secondary' },
               { text: 'Delete Tag', class: 'primary', action: async () => {
                    this._updateLoadingState('action', true);
                    try {
                         const result = await apiClient.deleteMaterialTag(this.currentMaterial, tagName);
                         this.availableTags = result.tags || this.availableTags.filter(t => t !== tagName);
                          if (this.currentFilter.type === 'tag' && this.currentFilter.value === tagName) { this.currentFilter = { type: 'all', value: null }; this._renderDashboardLayout(); }
                          this._renderTagPills(); this._handleOpenTagManagementModal(); // Refresh modal
                         this._showInfoMessage(`Tag "${tagName}" deleted from list.`);
                    } catch (error) { console.error(`Failed to delete tag ${tagName}:`, error); this._showError(`Could not delete tag: ${error.message}`); }
                    finally { this._updateLoadingState('action', false); }
               }}
          ]);
     }


} // End of ChapterFoldersView class


// --- Initialization Listener ---
document.addEventListener('DOMContentLoaded', () => {
    if (isViewInitialized) {
        console.warn("ChapterFoldersView: DOMContentLoaded fired again - Skipped.");
        return;
    }
    isViewInitialized = true;
    console.log("DOM Content Loaded - Initializing ChapterFoldersView vNext (Phase 2)");
    // Ensure Gridstack is loaded before initializing
    if (typeof GridStack === 'undefined') {
         console.error("GridStack library not found. Dashboard layout will not work.");
         document.body.innerHTML = "<p>Error: Layout library failed to load.</p>";
    } else {
         const view = new ChapterFoldersView();
         view.initialize(); // Initialize the view
         window.chapterFoldersView = view; // Optional: expose for debugging
    }
});
// --- END OF MODIFIED FILE chapterFoldersView.js ---