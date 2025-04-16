// --- START OF FILE chapterFoldersView.js ---
// --- File: js/views/chapterFoldersView.js ---

import { apiClient } from '../api/apiClient.js';
// TODO: Import Gridstack library if using npm/modules
// import { GridStack } from 'gridstack';
// import 'gridstack/dist/gridstack.min.css';

let isViewInitialized = false;

const LOADING_TEXT_SMALL = '<div class="loading-text-small">Loading...</div>';
const ERROR_TEXT_SMALL = '<div class="error-text-small">Error loading.</div>';
const EMPTY_GROUP_TEXT = '<div class="empty-group-text">No chapters.</div>';

class ChapterFoldersView {
    constructor() {
   // --- DOM Element References ---
    this.container = document.getElementById('managementContainer');
    this.heatmapGrid = this.container?.querySelector('.chapter-mastery-section .heatmap-grid');
    this.reviewScheduleContainer = this.container?.querySelector('.review-schedule-graph');
    this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas');
    this.reviewStatusElement = this.reviewScheduleContainer?.querySelector('.graph-status');
    this.reviewActivityGrid = this.container?.querySelector('.review-activity-section .review-heatmap-grid');
    this.heatmapTooltipElement = document.getElementById('heatmap-tooltip');
    this.dashboardGridContainer = document.getElementById('dashboardGrid');
    this.sortControlsContainer = document.getElementById('sortControlsContainer');
    this.sortFieldSelect = document.getElementById('sortField');
    this.sortOrderSelect = document.getElementById('sortOrder');
    this.tagPillsContainer = document.getElementById('tagPillsContainer');
    this.selectionToolbar = document.getElementById('selectionToolbar');
    this.selectChaptersButton = document.getElementById('selectChaptersButton');
    this.createGroupButton = document.getElementById('createGroupButton');
    // Action buttons within tagPillsContainer are handled by delegation
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
    this.chapterContextMenu = document.getElementById('chapterContextMenu');
    this.materialContextMenu = document.getElementById('materialContextMenu');
    this.groupContextMenu = document.getElementById('groupContextMenu');
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
    this.settingsModalOverlay = document.getElementById('materialSettingsModal');
    this.settingsModalTitle = document.getElementById('settingsModalTitle');
    this.settingsModalForm = document.getElementById('materialSettingsForm');
    this.settingsEditMaterialNameInput = document.getElementById('settingsEditMaterialName');
    this.settingsMaterialNameInput = document.getElementById('settingsMaterialName');
    this.settingsDailyLimitInput = document.getElementById('settingsDailyLimit');
    this.settingsDefaultBatchSizeInput = document.getElementById('settingsDefaultBatchSize');
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
    this.groupSortModalGroupId = null;
    // Settings Refs
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
    this.confirmGroupSelectionButton = document.getElementById('confirmGroupSelectionButton'); // Add to selection toolbar HTML
    this.groupCreationInstruction = document.getElementById('groupCreationInstruction'); // Add banner HTML above grid

    // --- Material Icons ---
    this.materialIcons = {
        'Mathematics': '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 142.514 142.514" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M34.367,142.514c11.645,0,17.827-10.4,19.645-16.544c0.029-0.097,0.056-0.196,0.081-0.297 c4.236-17.545,10.984-45.353,15.983-65.58h17.886c3.363,0,6.09-2.726,6.09-6.09c0-3.364-2.727-6.09-6.09-6.09H73.103 c1.6-6.373,2.771-10.912,3.232-12.461l0.512-1.734c1.888-6.443,6.309-21.535,13.146-21.535c6.34,0,7.285,9.764,7.328,10.236 c0.27,3.343,3.186,5.868,6.537,5.579c3.354-0.256,5.864-3.187,5.605-6.539C108.894,14.036,104.087,0,89.991,0 C74.03,0,68.038,20.458,65.159,30.292l-0.49,1.659c-0.585,1.946-2.12,7.942-4.122,15.962H39.239c-3.364,0-6.09,2.726-6.09,6.09 c0,3.364,2.726,6.09,6.09,6.09H57.53c-6.253,25.362-14.334,58.815-15.223,62.498c-0.332,0.965-2.829,7.742-7.937,7.742 c-7.8,0-11.177-10.948-11.204-11.03c-0.936-3.229-4.305-5.098-7.544-4.156c-3.23,0.937-5.092,4.314-4.156,7.545 C13.597,130.053,20.816,142.514,34.367,142.514z"></path> <path d="M124.685,126.809c3.589,0,6.605-2.549,6.605-6.607c0-1.885-0.754-3.586-2.359-5.474l-12.646-14.534l12.271-14.346 c1.132-1.416,1.98-2.926,1.98-4.908c0-3.59-2.927-6.231-6.703-6.231c-2.547,0-4.527,1.604-6.229,3.684l-9.531,12.454L98.73,78.391 c-1.89-2.357-3.869-3.682-6.7-3.682c-3.59,0-6.607,2.551-6.607,6.609c0,1.885,0.756,3.586,2.357,5.471l11.799,13.592 L86.647,115.67c-1.227,1.416-1.98,2.926-1.98,4.908c0,3.589,2.926,6.229,6.699,6.229c2.549,0,4.53-1.604,6.229-3.682l10.19-13.4 l10.193,13.4C119.872,125.488,121.854,126.809,124.685,126.809z"></path> </g> </g> </g></svg>', // Example: Calculator icon
        'Physics': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,256c0-38.187-36.574-71.637-94.583-93.355c1.015-6.127,1.894-12.177,2.5-18.091 c5.589-54.502-7.168-93.653-35.917-110.251c-9.489-5.478-20.378-8.26-32.341-8.26c-28.356,0-61.858,16.111-95.428,43.716 c-27.187-22.434-54.443-37.257-79.275-42.01c-4.642-0.905-9.105,2.142-9.993,6.776c-0.879,4.625,2.15,9.096,6.775,9.975 c21.282,4.079,45.15,17.109,69.308,36.702c-18.278,16.708-36.378,36.651-53.487,59.255c-28.561,3.447-55.031,9.088-78.592,16.529 c-4.395-27.913-4.13-52.813,1.331-72.439c2.321,0.495,4.71,0.785,7.168,0.785c18.825,0,34.133-15.309,34.133-34.133 c0-18.816-15.309-34.133-34.133-34.133S85.333,32.384,85.333,51.2c0,10.146,4.531,19.166,11.58,25.429 c-7.305,23.347-7.996,52.915-2.475,86.067C36.514,184.414,0,217.839,0,256c0,37.12,34.765,70.784,94.447,93.099 C84.25,410.206,94.933,458.615,128,477.713c9.489,5.478,20.378,8.252,32.35,8.252c28.382,0,61.918-16.136,95.505-43.785 c27.469,22.682,54.733,37.385,79.206,42.078c0.538,0.102,1.084,0.154,1.613,0.154c4.011,0,7.595-2.842,8.38-6.921 c0.879-4.634-2.15-9.105-6.776-9.992c-20.847-3.994-44.843-16.913-69.308-36.702c18.287-16.708,36.378-36.651,53.487-59.255 c28.578-3.456,55.066-9.088,78.626-16.538c4.395,27.887,4.122,52.787-1.365,72.457c-2.33-0.503-4.719-0.794-7.185-0.794 c-18.825,0-34.133,15.317-34.133,34.133c0,18.824,15.309,34.133,34.133,34.133c18.824,0,34.133-15.309,34.133-34.133 c0-10.138-4.523-19.149-11.563-25.412c7.339-23.407,8.047-52.966,2.526-86.101C475.52,327.561,512,294.144,512,256z M351.659,43.11c8.934,0,16.947,2.014,23.808,5.973c22.246,12.843,32.265,47.01,27.477,93.73 c-0.478,4.625-1.22,9.395-1.963,14.157c-23.518-7.424-49.937-13.047-78.438-16.495c-17.041-22.613-35.029-42.675-53.248-59.383 C298.846,57.148,327.791,43.11,351.659,43.11z M397.764,174.208c-4.139,19.396-10.266,39.603-18.202,60.186 c-6.093-12.689-12.766-25.429-20.087-38.127c-7.313-12.681-15.036-24.815-22.997-36.437 C358.519,163.328,379.153,168.209,397.764,174.208z M256.12,92.407c14.507,13.158,28.945,28.552,42.871,45.764 c-13.952-1.058-28.297-1.638-42.991-1.638c-14.669,0-28.988,0.58-42.914,1.63C227.063,120.934,241.579,105.574,256.12,92.407z M175.522,159.829c-7.97,11.614-15.676,23.782-22.98,36.446c-7.356,12.74-14.037,25.472-20.096,38.101 c-7.987-20.727-14.148-40.986-18.278-60.143C132.804,168.218,153.455,163.337,175.522,159.829z M119.467,34.133 c9.412,0,17.067,7.654,17.067,17.067c0,9.412-7.654,17.067-17.067,17.067c-9.404,0-17.067-7.654-17.067-17.067 C102.4,41.788,110.063,34.133,119.467,34.133z M17.067,256c0-29.79,31.548-57.088,80.777-75.998 c5.359,24.141,13.722,49.758,24.832,75.887c-11.264,26.419-19.61,52.113-24.934,76.194C47.283,312.619,17.067,284.774,17.067,256z M255.923,419.576c-13.474-12.169-26.923-26.291-39.927-42.052c0.734-1.092,1.28-2.295,1.886-3.465 c12.766,0.879,25.557,1.408,38.118,1.408c14.677,0,28.996-0.572,42.931-1.63C284.962,391.057,270.447,406.417,255.923,419.576z M313.267,355.277c-18.415,2.031-37.606,3.123-57.267,3.123c-11.29,0-22.775-0.469-34.261-1.203 c-0.648-18.253-15.59-32.93-34.005-32.93c-18.825,0-34.133,15.317-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133 c5.547,0,10.726-1.459,15.36-3.823c12.996,15.735,26.334,29.858,39.714,42.129c-29.585,23.996-58.573,38.059-82.458,38.059 c-8.943,0-16.947-2.005-23.817-5.973c-25.813-14.899-33.673-55.91-25.404-108.041c4.659,1.468,9.455,2.876,14.37,4.215 c4.523,1.237,9.233-1.451,10.479-5.99c1.237-4.548-1.442-9.233-5.999-10.47c-5.41-1.476-10.615-3.072-15.701-4.71 c4.105-19.123,10.197-39.424,18.185-60.262c5.658,11.802,11.844,23.646,18.577,35.447c1.57,2.756,4.454,4.301,7.415,4.301 c1.434,0,2.884-0.358,4.224-1.118c4.096-2.33,5.521-7.543,3.183-11.639c-9.207-16.128-17.391-32.418-24.516-48.58 c7.467-17.007,16.128-34.21,25.975-51.268c9.796-16.973,20.378-33.058,31.42-48.085c18.423-2.022,37.598-3.123,57.259-3.123 c19.686,0,38.886,1.101,57.327,3.132c11.017,15.036,21.572,31.112,31.369,48.068c9.796,16.964,18.458,34.116,25.967,51.106 c-7.561,17.101-16.162,34.295-25.975,51.302C334.891,324.164,324.318,340.25,313.267,355.277z M204.8,358.4 c0,4.796-1.997,9.122-5.197,12.22c-0.043,0.034-0.094,0.043-0.137,0.077c-0.051,0.034-0.068,0.094-0.119,0.137 c-3.046,2.85-7.117,4.634-11.614,4.634c-9.404,0-17.067-7.654-17.067-17.067c0-9.412,7.663-17.067,17.067-17.067 C197.146,341.333,204.8,348.988,204.8,358.4z M336.486,352.171c7.979-11.614,15.676-23.774,22.98-36.429 c7.313-12.672,13.943-25.472,20.062-38.263c8.021,20.779,14.208,41.079,18.347,60.279 C379.23,343.774,358.571,348.663,336.486,352.171z M392.533,477.867c-9.404,0-17.067-7.654-17.067-17.067 c0-9.412,7.663-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067C409.6,470.212,401.946,477.867,392.533,477.867z M414.242,331.972c-5.376-24.192-13.815-49.877-24.977-76.075c10.991-25.899,19.354-51.516,24.738-75.955 c49.314,18.91,80.93,46.234,80.93,76.058C494.933,285.773,463.428,313.062,414.242,331.972z"></path> </g> </g> </g></svg>', // Example: Atom icon
        // Add more mappings as needed
        'default': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M151.245,222.446C148.054,237.039,135.036,248,119.5,248c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c23.774,0,43.522-17.557,46.966-40.386c14.556-1.574,27.993-8.06,38.395-18.677c2.899-2.959,2.85-7.708-0.109-10.606 c-2.958-2.897-7.707-2.851-10.606,0.108C184.947,202.829,172.643,208,159.5,208c-26.743,0-48.5-21.757-48.5-48.5 c0-4.143-3.358-7.5-7.5-7.5s-7.5,3.357-7.5,7.5C96,191.715,120.119,218.384,151.245,222.446z"></path> <path d="M183,287.5c0-4.143-3.358-7.5-7.5-7.5c-35.014,0-63.5,28.486-63.5,63.5c0,0.362,0.013,0.725,0.019,1.088 C109.23,344.212,106.39,344,103.5,344c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5 c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.611-16.462-49.437-39.731-58.867c-0.178-1.699-0.269-3.418-0.269-5.133 c0-26.743,21.757-48.5,48.5-48.5C179.642,295,183,291.643,183,287.5z"></path> <path d="M439,223.5c0-17.075-6.82-33.256-18.875-45.156c1.909-6.108,2.875-12.426,2.875-18.844 c0-30.874-22.152-56.659-51.394-62.329C373.841,91.6,375,85.628,375,79.5c0-19.557-11.883-36.387-28.806-43.661 C317.999,13.383,287.162,0,263.5,0c-13.153,0-24.817,6.468-32,16.384C224.317,6.468,212.653,0,199.5,0 c-23.662,0-54.499,13.383-82.694,35.839C99.883,43.113,88,59.943,88,79.5c0,6.128,1.159,12.1,3.394,17.671 C62.152,102.841,40,128.626,40,159.5c0,6.418,0.965,12.735,2.875,18.844C30.82,190.244,24,206.425,24,223.5 c0,13.348,4.149,25.741,11.213,35.975C27.872,270.087,24,282.466,24,295.5c0,23.088,12.587,44.242,32.516,55.396 C56.173,353.748,56,356.626,56,359.5c0,31.144,20.315,58.679,49.79,68.063C118.611,449.505,141.965,463,167.5,463 c27.995,0,52.269-16.181,64-39.674c11.731,23.493,36.005,39.674,64,39.674c25.535,0,48.889-13.495,61.71-35.437 c29.475-9.385,49.79-36.92,49.79-68.063c0-2.874-0.173-5.752-0.516-8.604C426.413,339.742,439,318.588,439,295.5 c0-13.034-3.872-25.413-11.213-36.025C434.851,249.241,439,236.848,439,223.5z M167.5,448c-21.029,0-40.191-11.594-50.009-30.256 c-0.973-1.849-2.671-3.208-4.688-3.751C88.19,407.369,71,384.961,71,359.5c0-3.81,0.384-7.626,1.141-11.344 c0.702-3.447-1.087-6.92-4.302-8.35C50.32,332.018,39,314.626,39,295.5c0-8.699,2.256-17.014,6.561-24.379 C56.757,280.992,71.436,287,87.5,287c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5C60.757,272,39,250.243,39,223.5 c0-14.396,6.352-27.964,17.428-37.221c2.5-2.09,3.365-5.555,2.14-8.574C56.2,171.869,55,165.744,55,159.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-33.642-26.302-61.243-59.421-63.355C104.577,91.127,103,85.421,103,79.5c0-13.369,8.116-24.875,19.678-29.859 c0.447-0.133,0.885-0.307,1.308-0.527C127.568,47.752,131.447,47,135.5,47c12.557,0,23.767,7.021,29.256,18.325 c1.81,3.727,6.298,5.281,10.023,3.47c3.726-1.809,5.28-6.296,3.47-10.022c-6.266-12.903-18.125-22.177-31.782-25.462 C165.609,21.631,184.454,15,199.5,15c13.509,0,24.5,10.99,24.5,24.5v97.051c-6.739-5.346-15.25-8.551-24.5-8.551 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c13.509,0,24.5,10.99,24.5,24.5v180.279c-9.325-12.031-22.471-21.111-37.935-25.266 c-3.999-1.071-8.114,1.297-9.189,5.297c-1.075,4.001,1.297,8.115,5.297,9.189C206.8,343.616,224,366.027,224,391.5 C224,422.654,198.654,448,167.5,448z M395.161,339.807c-3.215,1.43-5.004,4.902-4.302,8.35c0.757,3.718,1.141,7.534,1.141,11.344 c0,25.461-17.19,47.869-41.803,54.493c-2.017,0.543-3.716,1.902-4.688,3.751C335.691,436.406,316.529,448,295.5,448 c-31.154,0-56.5-25.346-56.5-56.5c0-2.109-0.098-4.2-0.281-6.271c0.178-0.641,0.281-1.314,0.281-2.012V135.5 c0-13.51,10.991-24.5,24.5-24.5c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5c-9.25,0-17.761,3.205-24.5,8.551V39.5 c0-13.51,10.991-24.5,24.5-24.5c15.046,0,33.891,6.631,53.033,18.311c-13.657,3.284-25.516,12.559-31.782,25.462 c-1.81,3.727-0.256,8.214,3.47,10.022c3.726,1.81,8.213,0.257,10.023-3.47C303.733,54.021,314.943,47,327.5,47 c4.053,0,7.933,0.752,11.514,2.114c0.422,0.22,0.86,0.393,1.305,0.526C351.883,54.624,360,66.13,360,79.5 c0,5.921-1.577,11.627-4.579,16.645C322.302,98.257,296,125.858,296,159.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,6.244-1.2,12.369-3.567,18.205c-1.225,3.02-0.36,6.484,2.14,8.574 C417.648,195.536,424,209.104,424,223.5c0,26.743-21.757,48.5-48.5,48.5c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c16.064,0,30.743-6.008,41.939-15.879c4.306,7.365,6.561,15.68,6.561,24.379C424,314.626,412.68,332.018,395.161,339.807z"></path> <path d="M359.5,240c-15.536,0-28.554-10.961-31.745-25.554C358.881,210.384,383,183.715,383,151.5c0-4.143-3.358-7.5-7.5-7.5 s-7.5,3.357-7.5,7.5c0,26.743-21.757,48.5-48.5,48.5c-13.143,0-25.447-5.171-34.646-14.561c-2.898-2.958-7.647-3.007-10.606-0.108 s-3.008,7.647-0.109,10.606c10.402,10.617,23.839,17.103,38.395,18.677C315.978,237.443,335.726,255,359.5,255 c4.142,0,7.5-3.357,7.5-7.5S363.642,240,359.5,240z"></path> <path d="M335.5,328c-2.89,0-5.73,0.212-8.519,0.588c0.006-0.363,0.019-0.726,0.019-1.088c0-35.014-28.486-63.5-63.5-63.5 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5c0,1.714-0.091,3.434-0.269,5.133 C288.462,342.063,272,364.889,272,391.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.743,21.757-48.5,48.5-48.5 c4.142,0,7.5-3.357,7.5-7.5S339.642,328,335.5,328z"></path> </g> </g></svg>' // Fallback icon (e.g., book/brain)
    };

    // --- State ---
    this.currentMaterial = null;
    this.availableMaterials = [];
    this.currentMaterialSettings = {};
    this.gridInstance = null;
    this.groupsData = [];
    this.ungroupedChaptersData = [];
    this.chaptersByGroup = {};
    this.allChaptersData = {};
    this.availableTags = [];
    this.currentFilter = { type: 'all', value: null };
    this.currentSort = { field: 'name', order: 'asc' };
    this.isSelectionModeActive = false;
    this.selectedItemIds = { chapters: new Set(), groups: new Set() };
    this.activeContextMenuTarget = null;
    this.activeRenameTarget = null;
    this.draggedItemData = null; // Holds { type: 'chapter'/'multi-chapter', items: [{id, ?currentTags, ?currentGroupId}] }
    this.dragPreviewElement = null; // For custom drag image
    this.chartInstance = null;
    this.isLoading = { 
        dashboard: false, 
        overview: false, 
        chaptersUngrouped: false, 
        chaptersInGroup: {}, 
        groups: false, 
        tags: false, 
        materialSwitch: false, 
        action: false 
    };
    this.isCreatingGroup = false; // State flag for direct group creation flow
    this.groupCreateSelectedChapters = new Set(); // Temp store for direct creation flow
    this.batchSizeSaveTimeout = null;
    this.debouncedUpdateGroupLayout = this._debounce(this._handleGroupLayoutUpdateAPI, 1500);
    this.activeColorPickerTarget = null; // { type: 'group', id: '...', element: ... }
    this.activeTagSelectorTarget = null; // { type: 'chapter', id: '...', element: ... }
    // Store references to modal elements needed for interactions
    this.tagSelectorModalOverlay = document.getElementById('tagSelectorModal'); // NEW HTML NEEDED
    this.tagSelectorList = document.getElementById('tagSelectorList'); // NEW HTML NEEDED
    this.tagSelectorConfirmButton = document.getElementById('tagSelectorConfirmButton'); // NEW HTML NEEDED
    this.colorPickerInput = document.getElementById('groupColorPickerInput'); // NEW HTML NEEDED (e.g., <input type="color">)
    this.colorPickerModalOverlay = document.getElementById('groupColorPickerModal'); // NEW HTML NEEDED


    // Bind methods
    this._bindMethods();
    }

    _bindMethods() {
        // (Implementation remains the same)
         Object.getOwnPropertyNames(Object.getPrototypeOf(this))
            .filter(prop => typeof this[prop] === 'function' && (prop.startsWith('_') || prop.startsWith('handle')))
            .forEach(method => {
                if (this[method].name !== `bound ${method}`) {
                   this[method] = this[method].bind(this);
                }
            });
        this.initialize = this.initialize.bind(this);
        this._handleOpenGroupColorPicker = this._handleOpenGroupColorPicker.bind(this);
        /* this._handleGroupColorChange = this._handleGroupColorChange.bind(this); */ // If using input type=color change event
        this._handleConfirmGroupColor = this._handleConfirmGroupColor.bind(this); // If using a separate confirm button
        this._handleOpenChapterTagSelector = this._handleOpenChapterTagSelector.bind(this);
        this._handleConfirmChapterTags = this._handleConfirmChapterTags.bind(this);
        this._handleSelectionToolbarClick = this._handleSelectionToolbarClick.bind(this);
        this._handleBulkTagChapters = this._handleBulkTagChapters.bind(this);
        this._handleBulkPinChapters = this._handleBulkPinChapters.bind(this);
        this._handleBulkSuspendChapters = this._handleBulkSuspendChapters.bind(this);
        this._handleBulkGroupChapters = this._handleBulkGroupChapters.bind(this);
        this._handleBulkDeleteChapters = this._handleBulkDeleteChapters.bind(this);
        this._attachModalListeners = this._attachModalListeners.bind(this); // Helper for modal listeners
        this._handleGlobalClick = this._handleGlobalClick.bind(this);
        this._handleGlobalKeydown = this._handleGlobalKeydown.bind(this);
        // this._handleDirectCreateGroupStart = this._handleDirectCreateGroupStart.bind(this);
        this._handleConfirmGroupSelection = this._handleConfirmGroupSelection.bind(this);
        // this._handleOpenCreateGroupModal = this._handleOpenCreateGroupModal.bind(this);
    }


    /**
     * Initializes the view: Fetches initial data, sets up grid, renders UI.
     */
    async initialize() {
        console.log("ChapterFoldersView Initialize vNext");
        this.container?.classList.add('is-loading-main');
        if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p class="loading-text">Initializing Dashboard...</p>';
        this._renderOverviewPlaceholders(true);

        // Check Critical DOM Elements
         const criticalElements = [this.container, this.dashboardGridContainer, this.pillMaterialSwitcherInner, /* add others */];
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
            return;
        }

        // Attach Base Event Listeners
        this._attachBaseEventListeners();
        this._attachModalListeners(); // <= CALL THIS HER

        // Fetch Initial Dashboard Data
        this._updateLoadingState('dashboard', true);
        try {
            console.log("FETCH: Initial Dashboard Summary"); // DEBUG
            const summaryData = await apiClient.getDashboardSummary();
            console.log("FETCH_SUCCESS: Dashboard Summary", summaryData); // DEBUG
            // Process summary BUT defer rendering layout until dependent fetches complete
            await this._processSummaryData_Phase1(summaryData);

            // Fetch chapters and render layout AFTER phase 1 processing is done
            await this._fetchAndRenderInitialDashboardContent();

            // Fetch Overview Data SEPARATELY and AFTER dashboard basics are initiated
            await this._loadOverviewData();

        } catch (error) {
            console.error("FATAL: Failed to initialize dashboard:", error); // DEBUG
            this._showError(`Failed to load dashboard data: ${error.message}`);
            if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = `<p class="error-text">Could not load chapter data.</p>`;
            this._renderOverviewPlaceholders(false, true); // Show error in overview
        } finally {
            this._updateLoadingState('dashboard', false);
            this.container?.classList.remove('is-loading-main'); // Ensure loading class is removed
            console.log("INITIALIZATION COMPLETE (or failed)"); // DEBUG
        }
    }

        /** Attach listeners specific to modal interactive elements */    /** MODIFIED: Attaches listeners ONLY for elements INSIDE modals */
     _attachModalListeners() {
        console.log("DEBUG: Attaching modal-specific listeners");

        // Tag Management Modal
        this.createTagButton?.addEventListener('click', this._handleCreateTag);
        // Note: Delete tag buttons added dynamically

        // Group Sort Modal
        this.groupSortConfirmButton?.addEventListener('click', this._handleGroupSortConfirm);

        // Group Color Picker Modal
        this.colorPickerInput?.addEventListener('change', this._handleConfirmGroupColor); // Using change event

        // Chapter Tag Selector Modal
        this.tagSelectorConfirmButton?.addEventListener('click', this._handleConfirmChapterTags);
        // Note: Checkbox listeners handled via delegation or within _handleConfirmChapterTags

        // Settings Modal
        this.settingsSaveButton?.addEventListener('click', this._handleSettingsSave);
        // Note: Cancel button handled by _handleGlobalClick/_handleGlobalKeydown

        console.log("DEBUG: Modal-specific listeners attached.");
   }

       /** Handles clicks outside of active elements to close them */
       _handleGlobalClick(event) {
        // Don't close if clicking inside an already open menu/modal/popup

        // Check Rename Input First
        if (this.activeRenameTarget && !this.activeRenameTarget.element.contains(event.target) && !event.target.closest('.context-menu')) {
             console.log("DEBUG: Global click - cancelling rename"); // DEBUG
             this._cancelRename();
             return; // Don't close other things if rename was cancelled
        }

        // Check Context Menus
        if (this.activeContextMenuTarget && !event.target.closest('.context-menu')) {
            const menu = this.activeContextMenuTarget.type === 'group' ? this.groupContextMenu : this.chapterContextMenu;
            if (menu?.style.display === 'block' && !menu.contains(event.target) && !event.target.closest('.grid-stack-item')) { // Ensure not clicking item again
                 console.log("DEBUG: Global click - hiding context menu"); // DEBUG
                 this._hideContextMenu();
                 return;
            }
        }
        if (this.materialContextMenu?.style.display === 'block' && !this.materialContextMenu.contains(event.target) && !event.target.closest('.material-tab')) {
             console.log("DEBUG: Global click - hiding material context menu"); // DEBUG
             this._hideContextMenu('material');
             return;
        }

        // Check Modals (check visibility and ensure click is on backdrop)
        const visibleModal = document.querySelector('.modal-overlay.visible');
        if (visibleModal && event.target === visibleModal) {
            console.log(`DEBUG: Global click - closing modal ${visibleModal.id} via backdrop`); // DEBUG
            this._handleCancelModal(visibleModal.id); // Use generic cancel
            return;
        }

        // Check Study Options Popup (only close if not in selection mode)
        if (this.isStudyOptionsPopupVisible && !this.studyOptionsPopup?.contains(event.target) && !this.pillStudyButtonWrapper?.contains(event.target) && !this.isSelectionModeActive) {
            console.log("DEBUG: Global click - hiding study options popup"); // DEBUG
            this._hideStudyOptionsPopup();
            return;
        }
    }

    /** Handles Escape key presses for closing active elements */
    _handleGlobalKeydown(event) {
        if (event.key !== 'Escape') return;

        console.log("DEBUG: Escape key pressed"); // DEBUG

        // Priority: Rename > Selection Mode > Context Menus > Modals > Study Popup
        if (this.activeRenameTarget) {
            console.log("DEBUG: Esc - cancelling rename"); // DEBUG
            this._cancelRename();
        } else if (this.isSelectionModeActive) {
            console.log("DEBUG: Esc - cancelling selection mode"); // DEBUG
            this._handleToggleSelectionMode();
        } else if (this.activeContextMenuTarget) {
            console.log("DEBUG: Esc - hiding context menu"); // DEBUG
            this._hideContextMenu();
        } else if (this.materialContextMenu?.style.display === 'block') {
            console.log("DEBUG: Esc - hiding material context menu"); // DEBUG
            this._hideContextMenu('material');
        } else {
             // Check visible modals sequentially
             const visibleModal = document.querySelector('.modal-overlay.visible');
             if (visibleModal) {
                  console.log(`DEBUG: Esc - closing modal ${visibleModal.id}`); // DEBUG
                  this._handleCancelModal(visibleModal.id); // Use generic cancel
             } else if (this.isStudyOptionsPopupVisible) {
                  console.log("DEBUG: Esc - hiding study options popup"); // DEBUG
                  this._hideStudyOptionsPopup();
             }
        }
    }

        /** MODIFIED: Generic cancel handler */
        _handleCancelModal(modalId) {
            console.log(`DEBUG: Cancelling modal: ${modalId}`);
            this._hideModal(modalId); // Hide the modal
    
            // If cancelling the Create Group modal, also exit selection mode IF it was entered specifically for it
            if (modalId === 'createGroupModal' && this.isSelectionModeActive) {
                console.log("DEBUG: Exiting selection mode because Create Group modal cancelled."); // DEBUG
                 // Check if selection mode was JUST for group creation (no other selections made maybe?)
                 // Simple approach: Always exit selection mode if create group modal is cancelled.
                this._handleToggleSelectionMode(false); // Pass false to exit
            }
            // ... (cleanup for other modals: color picker, tag selector, sort) ...
            if (modalId === 'groupColorPickerModal') this.activeColorPickerTarget = null;
            else if (modalId === 'tagSelectorModal') this.activeTagSelectorTarget = null;
            else if (modalId === 'groupSortModal') this.groupSortModalGroupId = null;
        }

    
        async _loadOverviewData() {
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
    
                // Process Mastery Heatmap
                const masteryResult = results[0];
                if (masteryResult.status === 'fulfilled') this._renderHeatmap(masteryResult.value || []);
                else { console.error("DEBUG: Failed mastery:", masteryResult.reason); this._renderHeatmap(null, true); }
    
                // Process Activity Heatmap
                const activityResult = results[1];
                if (activityResult.status === 'fulfilled') this._renderReviewActivityHeatmap(activityResult.value);
                else { console.error("DEBUG: Failed activity:", activityResult.reason); this._renderReviewActivityHeatmap(null, true); }
    
                // Process Timeline Graph
                const timelineResult = results[2];
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

        } catch (error) {
            console.error("DEBUG: Unexpected error in _loadOverviewData:", error); // DEBUG
            this._renderOverviewPlaceholders(false, true);
        } finally {
            this._updateLoadingState('overview', false);
        }
    }

    _renderOverviewPlaceholders(showLoading, showError = false) {
        console.log(`DEBUG: Rendering overview placeholders: loading=${showLoading}, error=${showError}`);
        const loadingMsg = '<p class="loading-text">Loading...</p>';
        const errorMsg = '<p class="error-text">Error loading data</p>';
        const message = showError ? errorMsg : (showLoading ? loadingMsg : '');

        if (this.heatmapGrid) this.heatmapGrid.innerHTML = message;
        if (this.reviewActivityGrid) this.reviewActivityGrid.innerHTML = message;
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


   /**
     * Initializes the Gridstack.js instance.
     * @private
     */
   _initializeGrid() {
    console.log("Initializing Gridstack");
    if (!this.dashboardGridContainer) {
        console.error("Cannot initialize Gridstack: Container element not found.");
        return;
    }
    try {
         if (typeof GridStack === 'undefined') {
             throw new Error("GridStack library not loaded.");
         }

         this.gridInstance = GridStack.init({
            column: 4,
            cellHeight: 150, // Start with a fixed height, adjust as needed based on content
            margin: 15,
            float: false,
            acceptWidgets: '.chapter-item.standalone-chapter', // Allow dropping standalone chapters? Check class name
            itemClass: 'grid-stack-item',
            // **MODIFICATION:** Disable default square handles
            resizable: {
                handles: '' // Empty string or consult docs (might be 'false' or specific classes to exclude)
           }
        }, this.dashboardGridContainer); // Pass the container element

        // Attach Gridstack event listeners
        // Debounce the handler to avoid spamming API on rapid changes
        const debouncedHandler = this._debounce(this._handleGridItemStackChanged, 1500);
        this.gridInstance.on('resizestop dragstop', debouncedHandler); // Use debounced handler
        // this.gridInstance.on('added removed change', (event, items) => {
        //     console.log(event.type, items?.map(i => i.el?.dataset.groupId || i.el?.dataset.chapterId));
        // }); // General logging

        console.log("Gridstack initialized successfully.");
    } catch (error) {
         console.error("Failed to initialize Gridstack:", error);
          if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = `<p class="error-text">Error initializing layout library.</p>`;
         this.gridInstance = null;
    }
}


    /**
     * Attaches base event listeners (menus, modals, global clicks, pill, etc.).
     * Listeners for dynamic grid items are attached during rendering.
     * @private
     */
    _attachBaseEventListeners() {
        console.log("Attaching base event listeners");
        // --- Context Menus ---
        this.materialContextMenu?.addEventListener('click', this._handleMaterialContextMenuClick);
        this.groupContextMenu?.addEventListener('click', this._handleGroupContextMenuClick);
        this.chapterContextMenu?.addEventListener('click', this._handleChapterContextMenuClick); // Will be delegated if attached to grid

        // --- Modals ---
        this.settingsCancelButton?.addEventListener('click', this._handleSettingsCancel);
        this.settingsSaveButton?.addEventListener('click', this._handleSettingsSave);
        this.createTagButton?.addEventListener('click', this._handleCreateTag); // In tag modal
        this.createGroupConfirmButton?.addEventListener('click', this._handleCreateGroupConfirm); // In group modal
        this.groupSortConfirmButton?.addEventListener('click', this._handleGroupSortConfirm); // In group sort modal
        // Generic modal close buttons
        this.errorModalActions?.addEventListener('click', (e) => e.target.matches('[data-action="close"]') && this._hideModal('errorModal'));
        this.infoModalActions?.addEventListener('click', (e) => e.target.matches('[data-action="close"]') && this._hideModal('infoModal'));
        this.tagManagementModalOverlay?.addEventListener('click', (e) => e.target === this.tagManagementModalOverlay && this._hideModal('tagManagementModal')); // Close on backdrop click
        this.createGroupModalOverlay?.addEventListener('click', (e) => e.target === this.createGroupModalOverlay && this._hideModal('createGroupModal'));
        this.groupSortModalOverlay?.addEventListener('click', (e) => e.target === this.groupSortModalOverlay && this._hideModal('groupSortModal'));

        // --- Top Controls ---
                // Selection Toolbar
                this.selectionToolbar?.addEventListener('click', this._handleSelectionToolbarClick);
        this.sortFieldSelect?.addEventListener('change', this._handleSortChange);
        this.sortOrderSelect?.addEventListener('change', this._handleSortChange);
        /* this.tagPillsContainer?.addEventListener('click', this._handleTagPillClick); */  // Delegated
        this.tagPillsContainer?.addEventListener('click', this._handleTagPillOrActionClick); // Handles filters AND actions
        this.selectChaptersButton?.addEventListener('click', this._handleToggleSelectionMode);
        this.createGroupButton?.addEventListener('click', this._handleOpenCreateGroupModal);

        // --- Floating Pill ---
        this.pillMaterialSwitcher?.addEventListener('click', this._handleMaterialSwitch);
        this.pillMaterialSwitcher?.addEventListener('contextmenu', this._handleMaterialContextMenu);
        this.pillStudyDueButton?.addEventListener('click', this._handleStudyDueClick); // Keep standard due study
        this.pillOptionsTrigger?.addEventListener('click', this._handleToggleStudyOptionsPopup); // Options (focused study, batch size)
        this.pillStartFocusedButton?.addEventListener('click', this._handleFocusedStudyClick); // Modified for chapter/group selection
        this.pillReviewBatchSize?.addEventListener('input', this._handleBatchSizeChange); // Keep batch size

        // Global Listeners
        document.addEventListener('click', this._handleGlobalClick); // Use dedicated handler
        document.addEventListener('keydown', this._handleGlobalKeydown); // Use dedicated handler


        // Drag and Drop Listeners
        this.dashboardGridContainer?.addEventListener('dragstart', this._handleDragStart);
        this.dashboardGridContainer?.addEventListener('dragend', this._handleDragEnd);
        this.tagPillsContainer?.addEventListener('dragover', this._handleDragOver);
        this.tagPillsContainer?.addEventListener('dragleave', this._handleDragLeave);
        this.tagPillsContainer?.addEventListener('drop', this._handleDrop);
        this.tagPillsContainer?.addEventListener('click', this._handleTagPillOrActionClick);
        this.dashboardGridContainer?.addEventListener('dragover', this._handleDragOver);
        this.dashboardGridContainer?.addEventListener('dragleave', this._handleDragLeave);
        this.dashboardGridContainer?.addEventListener('drop', this._handleDrop);
                // Attach DELEGATED listeners to the grid container
                this.dashboardGridContainer?.addEventListener('contextmenu', this._handleContextMenu);
                this.dashboardGridContainer?.addEventListener('click', this._handleGridItemClick); // Single click handler
                        // Listener for the NEW confirm group selection button
        this.confirmGroupSelectionButton?.addEventListener('click', this._handleConfirmGroupSelection);
    }

    async _openMaterialSettingsModal(materialName) {
        if (!materialName || !this.settingsModalOverlay) return;
        console.log(`Opening settings modal for: ${materialName}`);
        this._updateLoadingState('settings', true);

        try {
            const settings = await apiClient.getMaterialSettings(materialName);
            this.editingMaterialName = materialName;
            // Deep clone settings to compare changes later
            this.editingMaterialSettings = JSON.parse(JSON.stringify(settings));

            this._populateSettingsForm(settings);

            this.settingsModalTitle.textContent = `${materialName} - Settings`;
            this.settingsModalOverlay.classList.add('visible');

        } catch (error) {
            console.error(`Failed to load settings for ${materialName}:`, error);
            this._showError(`Could not load settings: ${error.message}`);
            this.editingMaterialName = null;
            this.editingMaterialSettings = null;
        } finally {
            this._updateLoadingState('settings', false);
        }
    }

    _populateSettingsForm(settings) {
        if (!this.settingsModalForm) return;
        this.settingsModalForm.reset(); // Clear previous values

        // Use Optional Chaining (?.) and Nullish Coalescing (??) for safety
        this.settingsEditMaterialNameInput.value = this.editingMaterialName || '';
        this.settingsMaterialNameInput.value = this.editingMaterialName || '';

        // Study Options
        this.settingsDailyLimitInput.value = settings?.dailyNewCardLimit ?? 20; // Updated field name from API doc
        this.settingsDefaultBatchSizeInput.value = settings?.defaultBatchSize ?? 20; // Updated field name

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

    _handleSettingsCancel() {
        if (this.settingsModalOverlay) {
            this.settingsModalOverlay.classList.remove('visible');
        }
        this.editingMaterialName = null;
        this.editingMaterialSettings = null; // Clear editing state
    }

    async _handleSettingsSave() {
        if (!this.settingsModalForm || !this.editingMaterialName || !this.editingMaterialSettings || this.isLoading.saveSettings) {
             console.error("Settings save attempted without valid editing state or while already saving.");
             return;
        }

        this._updateLoadingState('saveSettings', true);
        this.settingsSaveButton.disabled = true;
        this.settingsSaveButton.textContent = 'Saving...';

        const originalName = this.settingsEditMaterialNameInput.value; // Name *before* potential edit in the modal
        const originalSettings = this.editingMaterialSettings; // Settings *before* edits
        const collectedData = this._collectSettingsFormData(); // Settings *after* edits from form
        let targetMaterialName = originalName;
        let nameChanged = false;
        let settingsChanged = false;
        const patchPayload = {};

        // --- 1. Handle Potential Rename ---
        if (collectedData.materialName !== originalName) {
            console.log(`Attempting material rename: ${originalName} -> ${collectedData.materialName}`);
            try {
                await apiClient.renameMaterial(originalName, collectedData.materialName);
                targetMaterialName = collectedData.materialName;
                nameChanged = true;
                console.log("Rename successful.");
                // Update the hidden input and local state AFTER successful rename
                this.editingMaterialName = targetMaterialName;
                this.settingsEditMaterialNameInput.value = targetMaterialName;
            } catch (renameError) {
                console.error("Material rename failed:", renameError);
                this._showError(`Failed to rename material: ${renameError.message}`);
                this._resetSettingsSaveButton();
                this._updateLoadingState('saveSettings', false);
                return; // Stop processing if rename fails
            }
        }

        // --- 2. Build PATCH Payload (Compare collectedData with originalSettings) ---
        // Helper to compare potentially nested objects/arrays
        const deepCompare = (obj1, obj2) => JSON.stringify(obj1) === JSON.stringify(obj2);

        // Compare Study Options (using correct field names from API/form collection)
        if (collectedData.studyOptions.newCardsPerDay !== originalSettings.dailyNewCardLimit) {
             patchPayload.dailyNewCardLimit = collectedData.studyOptions.newCardsPerDay; settingsChanged = true;
        }
        if (collectedData.studyOptions.defaultBatchSize !== originalSettings.defaultBatchSize) {
             patchPayload.defaultBatchSize = collectedData.studyOptions.defaultBatchSize; settingsChanged = true;
        }
        // Compare SRS Algorithm Params
        if (!deepCompare(collectedData.srsAlgorithmParams, originalSettings.srsAlgorithmParams)) {
             patchPayload.srsAlgorithmParams = collectedData.srsAlgorithmParams; settingsChanged = true;
        }
        // Compare SRS Thresholds
        if (!deepCompare(collectedData.srsThresholds, originalSettings.srsThresholds)) {
             patchPayload.srsThresholds = collectedData.srsThresholds; settingsChanged = true;
        }

        // --- 3. Execute Update/PATCH Call only if necessary ---
        if (!settingsChanged && !nameChanged) {
            console.log("No changes detected.");
            this._showInfoMessage("No changes were made.");
            this._resetSettingsSaveButton();
            this._updateLoadingState('saveSettings', false);
            // Optionally close modal: this._handleSettingsCancel();
            return;
        }

        if (!settingsChanged && nameChanged) {
            // Only name changed, already handled above.
            console.log("Material renamed successfully, no other settings changed.");
            this._showInfoMessage(`Material renamed to "${targetMaterialName}".`);
            await this._handlePostSettingsSaveUIUpdates(originalName, targetMaterialName, null, nameChanged, settingsChanged);
            this._resetSettingsSaveButton();
            this._updateLoadingState('saveSettings', false);
            this._handleSettingsCancel(); // Close modal
            return;
        }

        // --- Proceed with PATCH if settingsChanged ---
        try {
            console.log(`Sending PATCH for '${targetMaterialName}' with payload:`, JSON.stringify(patchPayload, null, 2));
            // Use the specific updateMaterialSettings which likely does a PATCH
            const result = await apiClient.updateMaterialSettings(targetMaterialName, patchPayload);
            console.log("Settings PATCH successful:", result);
            this._showInfoMessage("Settings updated successfully.");

            // Update UI based on changes
            await this._handlePostSettingsSaveUIUpdates(originalName, targetMaterialName, result?.settings || collectedData, nameChanged, settingsChanged);

            this._handleSettingsCancel(); // Close modal on success

        } catch (error) {
            console.error("Failed settings PATCH:", error);
            this._showError(`Error saving settings: ${error.message}`);
            // Don't close modal on error
        } finally {
            this._resetSettingsSaveButton();
            this._updateLoadingState('saveSettings', false);
        }
    }

    /**
     * Helper to handle UI updates after settings save (rename or patch).
     * Reloads materials list if name changed, updates current view if needed.
     * @private
     */
     async _handlePostSettingsSaveUIUpdates(originalName, newName, updatedSettingsData, nameChanged, settingsChanged) {
        const wasCurrentMaterial = originalName === this.currentMaterial;
        const materialDataToUpdate = updatedSettingsData || this.editingMaterialSettings; // Use response or original cache

        // If name changed, reload the material list entirely
        if (nameChanged) {
            console.log("Name changed, reloading materials list...");
            // We don't have the full summary data here, so just reload materials
            // A full refresh might be better, but let's try just materials first
            try {
                 const materials = await apiClient.getMaterials();
                 this.availableMaterials = materials;
                 this._renderMaterialTabs(this.availableMaterials); // Re-render tabs
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
                 this._updatePillStats(this.currentMaterial); // Update stats which might depend on daily limits etc.
                 // Potentially reload chapter grid/heatmap if settings affect their display (unlikely now)
                 // await this._loadDataForMaterial(this.currentMaterial); // Avoid if possible
            }

            // Ensure the correct tab is visually selected
            this._updateActiveMaterialTab();
        }

        // Clear the temporary editing state
        this.editingMaterialName = null;
        this.editingMaterialSettings = null;
    }

    _resetSettingsSaveButton() {
        if (this.settingsSaveButton) {
            this.settingsSaveButton.disabled = false;
            this.settingsSaveButton.textContent = 'Save Changes';
        }
    }

    _collectSettingsFormData() {
        const parseFloatOrDefault = (input, defaultValue) => input ? (parseFloat(input.value) || defaultValue) : defaultValue;
        const parseIntOrDefault = (input, defaultValue) => input ? (parseInt(input.value, 10) || defaultValue) : defaultValue;
        const parseSteps = (input) => {
            if (!input || !input.value) return [1]; // Default step
             return input.value.split(',')
                       .map(s => parseFloat(s.trim()))
                       .filter(n => !isNaN(n) && n >= 0); // Allow 0 for lapse interval? FSM default is 1 day minimum. Let's stick to > 0. Filter NaN.
        };

        const steps = parseSteps(this.settingsAlgoLearningStepsInput);

        return {
            materialName: this.settingsMaterialNameInput?.value.trim() || '',
            studyOptions: { // Matches structure used in _populateSettingsForm & API calls
                newCardsPerDay: parseIntOrDefault(this.settingsDailyLimitInput, 20),
                defaultBatchSize: parseIntOrDefault(this.settingsDefaultBatchSizeInput, 20)
            },
            srsAlgorithmParams: {
                learningStepsDays: steps.length > 0 ? steps : [1], // Ensure at least one step
                graduationIntervalDays: parseIntOrDefault(this.settingsAlgoGraduationIntervalInput, 3),
                lapseNewIntervalDays: parseFloatOrDefault(this.settingsAlgoLapseIntervalInput, 1),
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

    _toggleStudyOptionsPopup() {
        if (!this.studyOptionsPopup || !this.pillStudyButtonWrapper || !this.pillOptionsTrigger) return;
        this.isStudyOptionsPopupVisible = !this.isStudyOptionsPopupVisible;
        this.studyOptionsPopup.classList.toggle('visible', this.isStudyOptionsPopupVisible);
        this.pillStudyButtonWrapper.classList.toggle('popup-open', this.isStudyOptionsPopupVisible);
        this.pillOptionsTrigger.setAttribute('aria-expanded', this.isStudyOptionsPopupVisible);

        if (this.isStudyOptionsPopupVisible) {
            this.studyOptionsPopup.style.display = 'flex'; // Use flex as defined in CSS
        } else {
            // Use timeout to allow hide animation
            setTimeout(() => {
                if (!this.isStudyOptionsPopupVisible) { // Check state again in case it reopened quickly
                    this.studyOptionsPopup.style.display = 'none';
                }
            }, 250); // Match CSS transition duration
        }
        console.log("Popup toggled:", this.isStudyOptionsPopupVisible);
    }

    _hideStudyOptionsPopup() {
        if (!this.isStudyOptionsPopupVisible || !this.studyOptionsPopup || !this.pillStudyButtonWrapper || !this.pillOptionsTrigger) return;
        this.isStudyOptionsPopupVisible = false;
        this.studyOptionsPopup.classList.remove('visible');
        this.pillStudyButtonWrapper.classList.remove('popup-open');
        this.pillOptionsTrigger.setAttribute('aria-expanded', 'false');
        // Use timeout for animation before setting display: none
        setTimeout(() => {
             if (!this.isStudyOptionsPopupVisible) { // Double check state
                 this.studyOptionsPopup.style.display = 'none';
             }
        }, 250); // Match CSS transition duration
        console.log("Popup hidden");
    }

    _handleBatchSizeChange(event) {
        const newSize = parseInt(event.target.value, 10);
        if (isNaN(newSize) || newSize < 1) {
            console.warn("Invalid batch size input:", event.target.value);
            event.target.value = this.currentMaterialSettings?.defaultBatchSize || 20;
            return;
        }
        console.log("Batch size changed to:", newSize, "- Debouncing save...");
        this.saveBatchSizeDebounced(newSize);
    }

    async _saveBatchSizeSetting(newSize) {
        if (!this.currentMaterial || this.isLoading.saveSettings) return;

        console.log(`Attempting to save batch size ${newSize} for ${this.currentMaterial}`);
        this._updateLoadingState('saveSettings', true); // Indicate saving

        // Optimistic UI update (already done in input)
        const oldSize = this.currentMaterialSettings?.defaultBatchSize;
        if (this.currentMaterialSettings) {
            this.currentMaterialSettings.defaultBatchSize = newSize;
        }

        try {
            await apiClient.updateMaterialSettings(this.currentMaterial, { defaultBatchSize: newSize });
            console.log("Batch size saved successfully via API.");
            // Find the material in the main list and update its cached setting if needed (though settings modal fetches fresh)
            const materialIndex = this.availableMaterials.findIndex(m => m.material === this.currentMaterial);
            if (materialIndex > -1 && this.availableMaterials[materialIndex].settings) {
                 this.availableMaterials[materialIndex].settings.defaultBatchSize = newSize;
            }
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


    // --- Context Menu Logic (Largely Unchanged) ---

    _showContextMenu(menuType, event) {
        let menuElement, targetElement, contextTargetName;
        const isMaterial = menuType === 'material';

        if (isMaterial) {
            menuElement = this.materialContextMenu;
            targetElement = event.target.closest('.material-tab');
            if (!targetElement || targetElement.disabled) return; // Don't show for disabled/error tabs
            contextTargetName = targetElement.dataset.material;
            if (!contextTargetName) return;
            this.materialContextMenuTargetMaterial = contextTargetName;
        } else { // Chapter
            menuElement = this.chapterContextMenu;
            targetElement = event.target.closest('.chapter-card');
            if (!targetElement) return;
            // Prevent context menu on active rename input
            if (targetElement.classList.contains('is-renaming') && event.target === targetElement.querySelector('.rename-input')) {
                 return;
            }
            contextTargetName = targetElement.dataset.chapterName;
            if (!contextTargetName) return;
            this.chapterContextMenuTargetChapter = contextTargetName;
        }

        event.preventDefault();
        this._hideStudyOptionsPopup();
        this._hideContextMenu(isMaterial ? 'chapter' : 'material'); // Hide other menu type

        const posX = event.clientX + 2;
        const posY = event.clientY + 2;
        const menuWidth = menuElement.offsetWidth;
        const menuHeight = menuElement.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        menuElement.style.left = `${Math.min(posX, viewportWidth - menuWidth - 10)}px`;
        menuElement.style.top = isMaterial
            ? `${posY - menuHeight - 10}px` // Position above for material
            : `${Math.min(posY, viewportHeight - menuHeight - 10)}px`; // Position below/adjust for chapter

        menuElement.style.display = 'block';
        console.log(`${menuType} context menu shown for ${contextTargetName}`);
    }

    _hideContextMenu(menuType) {
        const menuElement = menuType === 'chapter' ? this.chapterContextMenu : this.materialContextMenu;
        if (menuElement && menuElement.style.display === 'block') {
            menuElement.style.display = 'none';
            if (menuType === 'chapter') this.chapterContextMenuTargetChapter = null;
            if (menuType === 'material') this.materialContextMenuTargetMaterial = null;
            console.log(`${menuType} context menu hidden.`);
        }
    }

        /** MODIFIED: Handles context menu correctly even for chapters inside groups */
        _handleContextMenu(event) {
            event.preventDefault();
            this._hideContextMenu();
    
            const chapterItemElement = event.target.closest('.chapter-item');
            const groupWidgetElement = event.target.closest('.group-widget.grid-stack-item');
    
            let type = null, id = null, element = null;
    
            if (chapterItemElement) { // Prioritize chapter
                 type = 'chapter'; id = chapterItemElement.dataset.chapterId; element = chapterItemElement;
                 console.log(`DEBUG: Context menu target identified as CHAPTER ${id}`);
            } else if (groupWidgetElement) { // Fallback to group
                 type = 'group'; id = groupWidgetElement.dataset.groupId; element = groupWidgetElement;
                 console.log(`DEBUG: Context menu target identified as GROUP ${id}`);
            } else { return; } // Not on a valid target
    
            if (!type || !id || !element) return;
    
            this.activeContextMenuTarget = { type, id, element };
            const menuElement = type === 'group' ? this.groupContextMenu : this.chapterContextMenu;
            if (type === 'chapter') this._setupChapterContextMenu(id);
    
            this._positionAndShowContextMenu(menuElement, event);
        }
    _handleMaterialContextMenu(event) { this._showContextMenu('material', event); }

    _handleContextMenuClick(event) { // Chapter Menu Actions
        const menuItem = event.target.closest('li[data-action]');
        if (!menuItem || !this.chapterContextMenuTargetChapter) {
            this._hideContextMenu('chapter'); return;
        }
        const action = menuItem.dataset.action;
        const chapterName = this.chapterContextMenuTargetChapter;
        const targetCard = this._findChapterCardElement(chapterName);
        this._hideContextMenu('chapter'); // Hide menu first

        if (!targetCard && action !== 'open') { // 'open' might still work if card render failed
            console.error(`Card element not found for chapter "${chapterName}" for action "${action}".`);
            if (action !== 'open') return;
        }

        switch (action) {
            case 'open': this._navigateToChapterDetails(chapterName); break;
            case 'rename': this._handleRenameChapter(targetCard); break;
            case 'delete': this._handleDeleteChapter(targetCard); break;
            default: console.warn(`Unknown chapter action: ${action}`);
        }
    }

    _handleMaterialContextMenuClick(event) { // Material Menu Actions
        const menuItem = event.target.closest('li[data-action]');
        if (!menuItem || !this.materialContextMenuTargetMaterial) {
             this._hideContextMenu('material'); return;
        }
        const action = menuItem.dataset.action;
        const materialName = this.materialContextMenuTargetMaterial;
        this._hideContextMenu('material'); // Hide menu first

        switch (action) {
            case 'settings': this._openMaterialSettingsModal(materialName); break;
            case 'set-default': this._handleSetDefaultMaterial(materialName); break;
            default: console.warn(`Unhandled material context menu action: ${action}`);
        }
    }

    // --- Rename/Delete Logic (Largely Unchanged) ---

    _handleRenameChapter(cardElement) {
        if (!cardElement || cardElement.classList.contains('is-renaming') || this.isLoading.rename) return;

        if (this.activeRenameInput) { // Cancel any other active rename
            const otherCard = this.activeRenameInput.closest('.chapter-card');
            if (otherCard) this._cancelRename(otherCard);
        }

        const nameSpan = cardElement.querySelector('.chapter-name');
        if (!nameSpan) return;
        const currentChapterName = nameSpan.textContent;

        let input = cardElement.querySelector('.rename-input');
        if (!input) { // Create if doesn't exist
             input = document.createElement('input');
             input.type = 'text';
             input.classList.add('rename-input');
             nameSpan.parentNode.insertBefore(input, nameSpan.nextSibling);
             input.addEventListener('keydown', this._handleRenameInputKeydown);
             input.addEventListener('blur', this._handleRenameInputBlur);
        }

        input.dataset.originalName = currentChapterName;
        input.value = currentChapterName;
        cardElement.classList.add('is-renaming');
        input.style.display = 'block';
        input.disabled = false;
        input.focus();
        input.select();
        this.activeRenameInput = input;
    }

    _handleRenameInputKeydown(event) {
        const input = event.target;
        const card = input.closest('.chapter-card');
        if (!card) return;

        if (event.key === 'Enter') {
            event.preventDefault();
            this._confirmRename(card);
        } else if (event.key === 'Escape') {
            this._cancelRename(card);
        }
    }

    _handleRenameInputBlur(event) {
        setTimeout(() => {
            if (this.activeRenameInput === event.target && !event.relatedTarget?.closest('.modal-overlay')) {
                const card = event.target.closest('.chapter-card');
                if (card && card.classList.contains('is-renaming')) { // Check if still renaming
                    this._cancelRename(card);
                }
            }
        }, 150); // Increased delay slightly
    }

    async _confirmRename(cardElement) {
        const input = cardElement.querySelector('.rename-input');
        const nameSpan = cardElement.querySelector('.chapter-name');
        if (!input || !nameSpan || input.disabled) return;

        const currentChapterName = input.dataset.originalName;
        const newChapterName = input.value.trim();

        if (!newChapterName) {
            this._showModal('errorModal', 'Rename Failed', 'Chapter name cannot be empty.');
            this._cancelRename(cardElement); return;
        }
        if (newChapterName === currentChapterName) {
            this._cancelRename(cardElement); return;
        }

        this._updateLoadingState('rename', true);
        input.disabled = true;
        cardElement.style.cursor = 'wait';

        try {
            await apiClient.renameChapter(this.currentMaterial, currentChapterName, newChapterName);
            console.log("API rename successful.");

            nameSpan.textContent = newChapterName;
            cardElement.dataset.chapterName = newChapterName;
            input.dataset.originalName = newChapterName;

            // Update internal data store
            const chapterIndex = this.chaptersData.findIndex(ch => ch.chapter === currentChapterName);
            if (chapterIndex > -1) {
                this.chaptersData[chapterIndex].chapter = newChapterName;
                // Re-render heatmap to update tooltips/links if needed (or update cell directly)
                 this._renderHeatmap(this.chaptersData); // Simple re-render
            }
             this._cancelRename(cardElement, false); // Revert UI state without resetting value
             this._showInfoMessage(`Chapter renamed to "${newChapterName}"`);

        } catch (error) {
            console.error("Failed to rename chapter via API:", error);
            this._showError(`Could not rename chapter: ${error.message}`);
            input.value = currentChapterName; // Revert value
            this._cancelRename(cardElement); // Revert UI fully
        } finally {
            this._updateLoadingState('rename', false);
            if(input) input.disabled = false; // Ensure enabled even if cancel failed
            cardElement.style.cursor = '';
            this.activeRenameInput = null;
        }
    }

        /**
     * Renders the review activity heatmap. Handles loading/error states.
     * @param {object | null} activityData - Object map 'YYYY-MM-DD'->count, or null/error.
     * @param {boolean} [showError=false] - Explicitly show error state.
     * @private
     */
        _renderReviewActivityHeatmap(activityData, showError = false) {
            if (!this.reviewActivityGrid) return;
    
            if (showError) {
                this.reviewActivityGrid.innerHTML = '<p class="error-text">Error loading activity</p>';
                return;
            }
            if (activityData === null || typeof activityData === 'undefined') { // Loading state
                this.reviewActivityGrid.innerHTML = '<p class="loading-text">Loading activity...</p>'; // Or skeleton
                return;
            }
            if (Object.keys(activityData).length === 0) {
                this.reviewActivityGrid.innerHTML = '<p class="no-data">No recent activity</p>'; // Empty state
                return;
            }
    
            // Render activity heatmap
            this.reviewActivityGrid.innerHTML = ''; // Clear loading/previous
            const fragment = document.createDocumentFragment();
    
            // Assuming API returns sorted dates for the required number of days (e.g., 30)
            const dates = Object.keys(activityData);
            const counts = Object.values(activityData);
            const cellCount = Math.min(counts.length, 30); // Render max 30 days
    
            for (let i = 0; i < cellCount; i++) {
                const count = counts[i];
                const date = dates[i];
                const cell = document.createElement('div');
                cell.classList.add('review-heatmap-cell');
                const intensityClass = this._getReviewIntensityClass(count);
                if (intensityClass) {
                    cell.dataset.reviews = intensityClass;
                }
                cell.dataset.tooltip = `${date}: ${count} review${count === 1 ? '' : 's'}`;
                fragment.appendChild(cell);
            }
            // Add empty cells if needed
            for (let i = cellCount; i < 30; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('review-heatmap-cell');
                fragment.appendChild(emptyCell);
            }
    
            this.reviewActivityGrid.appendChild(fragment);
        }
    
/**
 * Renders the review schedule timeline graph. Handles loading/error/empty states.
 * Creates elements if needed.
 * @param {object | null} timelineData - Date->count map, or null/error indicator.
 * @param {boolean} [isLoading=false] - Explicitly show loading state.
 * @param {boolean} [isError=false] - Explicitly show error state.
 * @param {string} [customMessage=null] - Override default status messages.
 * @private
 */
_renderTimelineGraph(timelineData, isLoading = false, isError = false, customMessage = null) {
    console.log(`DEBUG TIMELINE: Render called - isLoading=${isLoading}, isError=${isError}, customMsg=${customMessage}, data=${!!timelineData}`); // DEBUG
    if (!this.reviewScheduleCanvas || !this.reviewScheduleContainer || !this.reviewStatusElement) { return; }
    const ctx = this.reviewScheduleCanvas.getContext('2d');
    if (!ctx) { console.error("DEBUG TIMELINE: Failed to get canvas context."); return; } // DEBUG

    const showStatus = (message, isErr = false) => {
         console.log(`DEBUG TIMELINE: Showing status - "${message}", isError=${isErr}`); // DEBUG
         this.reviewStatusElement.textContent = message;
         this.reviewStatusElement.style.color = isErr ? 'var(--danger-red)' : 'var(--text-secondary)';
         this.reviewStatusElement.style.display = 'block';
         this.reviewScheduleCanvas.style.display = 'none';
         // Destroy existing chart instance when showing status
         if (this.chartInstance) {
             console.log("DEBUG TIMELINE: Destroying chart instance (showStatus)."); // DEBUG
             this.chartInstance.destroy();
             this.chartInstance = null;
         }
    };
    const hideStatus = () => {
         console.log("DEBUG TIMELINE: Hiding status, showing canvas."); // DEBUG
         this.reviewStatusElement.style.display = 'none';
         this.reviewScheduleCanvas.style.display = 'block';
    };

    // Handle States FIRST
    if (customMessage) { showStatus(customMessage, isError); return; }
    if (isLoading) { showStatus('Loading schedule...'); return; }
    if (isError) { showStatus('Error loading schedule', true); return; }
    if (!timelineData || Object.keys(timelineData).length === 0) {
    console.log("DEBUG TIMELINE: Empty timeline data detected, showing 'No upcoming reviews'");
    showStatus('No upcoming reviews'); return;
    }

        // NEW CHECK: If we have data but all values are 0, treat as "no upcoming reviews"
    const hasNonZeroValues = Object.values(timelineData).some(value => value > 0);
    if (!hasNonZeroValues) {
        console.log("DEBUG TIMELINE: Timeline data contains only zeros, showing 'No upcoming reviews'");
        showStatus('No upcoming reviews'); 
        return;
    }

    // --- If we have data, attempt to render ---
    console.log("DEBUG TIMELINE: Proceeding to render chart."); // DEBUG
    hideStatus(); // Show canvas, hide status message

    // Destroy previous instances cleanly
    if (this.chartInstance) {
         console.log("DEBUG TIMELINE: Destroying previous chart instance."); // DEBUG
         this.chartInstance.destroy();
         this.chartInstance = null;
    }
    let existingChart = Chart.getChart(this.reviewScheduleCanvas); // Check canvas directly
    if (existingChart) {
         console.log("DEBUG TIMELINE: Destroying existing chart on canvas."); // DEBUG
         existingChart.destroy();
    }

    try {
         const sortedDates = Object.keys(timelineData).sort();
         const labels = sortedDates;
         const dataCounts = sortedDates.map(date => timelineData[date]);
         console.log("DEBUG TIMELINE DATA:", JSON.stringify(labels), JSON.stringify(dataCounts)); // DEBUG Verify data

         // --- Create Chart ---
         this.chartInstance = new Chart(ctx, {
             type: 'bar',
             data: {
                  labels: labels,
                  datasets: [{
                       label: 'Due Cards', data: dataCounts,
                       backgroundColor: 'rgba(91, 192, 222, 0.6)', borderColor: 'rgba(91, 192, 222, 1)',
                       borderWidth: 1, borderRadius: 4, borderSkipped: false,
                  }]
             },
             options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1a1a2e', titleColor: '#e0e0e0', bodyColor: '#e0e0e0', displayColors: false,
                        callbacks: {
                            title: (tooltipItems) => tooltipItems[0].label,
                            label: (tooltipItem) => `Reviews: ${tooltipItem.raw}`
                        }
                    }
                },
                scales: {
                    x: { grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', maxRotation: 45, minRotation: 45 } },
                    y: {
                        beginAtZero: true, grid: { color: 'rgba(160, 160, 192, 0.1)' }, ticks: { color: '#a0a0c0', stepSize: 1, callback: function (value) { if (Number.isInteger(value)) return value; } }
                    }
                }
            }
         });
         console.log("DEBUG TIMELINE: Chart instance CREATED successfully."); // DEBUG

    } catch (chartError) {
         console.error("DEBUG TIMELINE: Chart.js rendering error:", chartError); // DEBUG Log specific error
         showStatus('Error displaying graph', true); // Show error message in UI
         this._showError(`Failed to display review schedule graph: ${chartError.message}`); // Show modal error
    }
}
    
    
        // --- Interaction Handlers (Keep Existing Logic, Adapt if needed) ---
    
        _handleChapterGridClick(event) {
            const card = event.target.closest('.chapter-card');
            if (!card) return;
    
            const chapterName = card.dataset.chapterName;
            const checkbox = card.querySelector('.selection-checkbox');
    
            if (this.isSelectionMode) {
                if (event.target.classList.contains('rename-input')) return; // Ignore rename input clicks
    
                let isChecked;
                // Use setTimeout to ensure checkbox state is updated before reading
                setTimeout(() => {
                    if (event.target === checkbox) {
                        isChecked = checkbox.checked;
                    } else {
                        // Clicked elsewhere on card, toggle checkbox state
                        checkbox.checked = !checkbox.checked;
                        isChecked = checkbox.checked;
                    }
                    card.classList.toggle('selected', isChecked);
                    if (isChecked) this.selectedChapters.add(chapterName);
                    else this.selectedChapters.delete(chapterName);
                    this._updateFocusedStudyButtonState(); // Update button state/count
                    console.log("Selected chapters:", Array.from(this.selectedChapters));
                }, 0);
            } else {
                // Navigation Mode Logic (ignore checkbox or rename input)
                if (event.target !== checkbox && !event.target.classList.contains('rename-input')) {
                    this._navigateToChapterDetails(chapterName);
                }
            }
        }
    
        _handleStudyDueClick() {
            if (!this.currentMaterial || this.isLoading.dashboard || this.isLoading.switchMaterial) return;
            const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0;
            console.log(`Starting study session for DUE cards in ${this.currentMaterial}, limit: ${batchSize || 'None'}`);
            const material = encodeURIComponent(this.currentMaterial);
            let url = `study-session.html?material=${material}`;
            if (batchSize > 0) {
                url += `&batchSize=${batchSize}`;
            }
            window.location.href = url;
        }
    
     // --- Focused Study Click (Pill Button) ---
  // --- Focused Study Click (Pill Button) - Refined ---
  async _handleFocusedStudyClick() {
    console.log("DEBUG: Focused Study button clicked. Selection Mode:", this.isSelectionModeActive); // DEBUG
    if (!this.currentMaterial) { this._showError("Please select a material first."); return; }

    // If not in selection mode, activate it & guide user
    if (!this.isSelectionModeActive) {
         this._handleToggleSelectionMode();
         // Maybe use a more persistent info message or guide?
         this._showInfoMessage("Select chapters and/or groups, then click 'Start Focused Study' again.", "Selection Mode");
         return;
    }

    // If in selection mode, gather items and launch
    const selectedChapterIds = Array.from(this.selectedItemIds.chapters);
    const selectedGroupIds = Array.from(this.selectedItemIds.groups);
    const chapterNamesToStudy = new Set();

    console.log(`DEBUG: Starting focused study prep. Chapters: ${selectedChapterIds.length}, Groups: ${selectedGroupIds.length}`); // DEBUG

    this._updateLoadingState('action', true); // Indicate loading/prep
    let fetchError = false;

    try {
        // 1. Get names for directly selected chapters
        selectedChapterIds.forEach(id => {
            const chapter = this._findChapterData(id);
            if (chapter?.name) chapterNamesToStudy.add(chapter.name);
             else console.warn(`Chapter data or name missing for selected ID: ${id}`);
        });

        // 2. Get names for chapters within selected groups
        const groupFetchPromises = selectedGroupIds.map(async groupId => {
             try {
                  let groupChapters = this.chaptersByGroup[groupId];
                  // Fetch only if not already cached
                  if (!Array.isArray(groupChapters)) {
                       console.log(`DEBUG: Fetching chapters for selected group ${groupId}`); // DEBUG
                       // Use group's sort pref? Not strictly necessary for just getting names
                       groupChapters = await apiClient.getChapters(this.currentMaterial, { groupId: groupId, suspended: false });
                       this.chaptersByGroup[groupId] = groupChapters || []; // Cache result
                       (groupChapters || []).forEach(ch => { this.allChaptersData[ch.id] = ch; }); // Update flat map too
                  }
                  (groupChapters || []).forEach(ch => chapterNamesToStudy.add(ch.name));
             } catch (groupError) {
                  console.error(`Error fetching chapters for selected group ${groupId}:`, groupError);
                  fetchError = true; // Mark that an error occurred
                  this._showError(`Could not fetch chapters for group "${this._findGroupData(groupId)?.name || groupId}".`);
             }
        });
        await Promise.allSettled(groupFetchPromises); // Wait for all group fetches


        // 3. Proceed if no fetch errors and chapters were found
        if (fetchError) {
             console.error("DEBUG: Aborting focused study due to chapter fetch errors."); // DEBUG
             throw new Error("Could not gather all chapters for study."); // Let finally block handle loading state
        }
        if (chapterNamesToStudy.size === 0) {
             this._showInfoMessage("No chapters selected or found in selected groups.");
             this._updateLoadingState('action', false); // Turn off loading if nothing to study
             return;
        }

        // 4. Construct URL and navigate
        const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0;
        const chapterNamesString = Array.from(chapterNamesToStudy).join(',');
        const encodedChapters = encodeURIComponent(chapterNamesString);
        const material = encodeURIComponent(this.currentMaterial);
        let url = `study-session.html?material=${material}&chapters=${encodedChapters}`;
        if (batchSize > 0) url += `&batchSize=${batchSize}`;

        console.log(`DEBUG: Navigating to focused session: ${url}`); // DEBUG
        window.location.href = url;

        // Exit selection mode (maybe defer slightly after navigation starts?)
        // setTimeout(() => this._handleToggleSelectionMode(), 100);

    } catch (error) {
         console.error("Error preparing focused study session:", error);
         this._showError(`Could not start focused study: ${error.message}`);
    } finally {
         this._updateLoadingState('action', false);
          // Exit selection mode here ensures it happens even if navigation fails
          if (this.isSelectionModeActive) this._handleToggleSelectionMode();
    }
}
    
            /**
     * Handles clicks on the material switcher icons within the pill.
     * Fetches necessary data for the newly selected material individually.
     * @param {Event} event - The click event.
     * @private
     */
    async _handleMaterialSwitch(event) {
        const clickedTab = event.target.closest('.material-tab:not([disabled])'); // Ignore disabled/error tabs
        if (!clickedTab || !this.pillMaterialSwitcher?.classList.contains('has-multiple')) return;

        const material = clickedTab.dataset.material;
        const isLoadingAnything = Object.values(this.isLoading).some(state => state);

        if (material && material !== this.currentMaterial && !isLoadingAnything) {
            console.log(`Switching material to: ${material}`);
            this.currentMaterial = material;
            this._updateActiveMaterialTab(); // Update visual selection immediately

            // Reset chapter selection state if active
            if (this.isSelectionMode) {
                this._toggleSelectionModeUI(false);
            }

            // Set loading state specifically for material switching
            this._updateLoadingState('switchMaterial', true);
            // Render placeholders for sections that will be updated
            this._renderHeatmap(null);
            this._renderChapterGrid(null);
            this._renderTimelineGraph(null, true); // Show graph loading
            // Note: Activity heatmap and pill stats are updated differently

            try {
                // Fetch settings, chapters, and timeline in parallel
                const settingsPromise = apiClient.getMaterialSettings(material).catch(err => {
                    console.error(`Failed to fetch settings for ${material}:`, err);
                    return { error: err }; // Return error object to avoid Promise.all rejection
                });
                const chaptersPromise = apiClient.getChapterMastery(material).catch(err => {
                    console.error(`Failed to fetch chapters for ${material}:`, err);
                    return { error: err };
                });
                const timelinePromise = apiClient.getDueTimeline(material).catch(err => {
                    console.error(`Failed to fetch timeline for ${material}:`, err);
                    return { error: err };
                });

                const [settingsResult, chaptersResult, timelineResult] = await Promise.all([
                    settingsPromise, chaptersPromise, timelinePromise
                ]);

                // Process Settings
                if (settingsResult && !settingsResult.error) {
                    this.currentMaterialSettings = settingsResult;
                    const batchSize = this.currentMaterialSettings.defaultBatchSize ?? 20;
                    if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = batchSize;
                } else {
                    this.currentMaterialSettings = null;
                    if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = 20; // Fallback
                    this._showError(`Could not load settings for ${material}.`, true);
                }

                // Process Chapters
                if (chaptersResult && !chaptersResult.error) {
                    this.chaptersData = chaptersResult;
                    this.chaptersData.sort((a, b) => (a.chapter || '').localeCompare(b.chapter || ''));
                    this._renderHeatmap(this.chaptersData);
                    this._renderChapterGrid(this.chaptersData);
                } else {
                    this.chaptersData = [];
                    this._renderHeatmap(null, true); // Show error state
                    this._renderChapterGrid(null, true);
                }

                // Process Timeline
                if (timelineResult && !timelineResult.error) {
                    this._renderTimelineGraph(timelineResult);
                } else {
                    this._renderTimelineGraph(null, false, true); // Show error state
                }

                // Update Pill Stats using the globally available `availableMaterials` cache
                this._updatePillStats(this.currentMaterial);

            } catch (error) { // Catch unexpected errors from Promise.all itself (unlikely with caught promises)
                console.error(`Unexpected error during material switch:`, error);
                this._showError(`Failed to switch material: ${error.message}`);
                // Reset UI to error states
                this._renderHeatmap(null, true);
                this._renderChapterGrid(null, true);
                this._renderTimelineGraph(null, false, true);
            } finally {
                this._updateLoadingState('switchMaterial', false);
            }

        } else if (material === this.currentMaterial) {
            console.log("Clicked active material, no change.");
        } else if (isLoadingAnything) {
            console.log("Ignoring material switch click while loading.");
        }
    }

    /**
     * Updates the New/Due counts in the pill using cached material data.
     * @param {string | null} material - The material name, or null to clear stats.
     * @private
     */
    _updatePillStats(material) {
        console.log(`Updating pill stats for ${material || 'none'} using cached data.`);

        let dueCount = '-';
        let newCount = '-';

        if (material && this.availableMaterials && this.availableMaterials.length > 0) {
            // Find the data for the current material in the cached list
            const materialData = this.availableMaterials.find(m => m.material === material && !m.error);
            if (materialData) {
                dueCount = materialData.dueCount ?? '?';
                newCount = materialData.newCardsTodayCount ?? '?';
                console.log(`Stats for ${material}: Due=${dueCount}, New=${newCount}`);
            } else {
                console.warn(`Material data not found or has error in cache for: ${material}`);
                dueCount = '?'; newCount = '?'; // Indicate missing data rather than error
            }
        } else {
            console.log("Clearing pill stats (no material or no data).");
        }

        // Update DOM elements
        if (this.pillDueCardsCount) this.pillDueCardsCount.textContent = dueCount;
        if (this.pillNewCardsCount) this.pillNewCardsCount.textContent = newCount;
    }


    /**
     * Renders the chapter mastery heatmap. Handles loading/error states.
     * @param {Array<object> | null} chapters - Array of chapter mastery objects or null/error indicator.
     * @param {boolean} [showError=false] - Explicitly show error state.
     * @private
     */
    _renderHeatmap(chapters, showError = false) {
        if (!this.heatmapGrid || !this.heatmapTooltipElement) return;

        if (showError) {
            this.heatmapGrid.innerHTML = '<p class="error-text">Error loading mastery</p>';
            return;
        }
        if (chapters === null || typeof chapters === 'undefined') { // Loading state
            this.heatmapGrid.innerHTML = '<p class="loading-text">Loading mastery...</p>'; // Or skeleton
            return;
        }
         if (chapters.length === 0) {
             this.heatmapGrid.innerHTML = '<p class="no-data">No chapters</p>'; // Empty state
             return;
         }

        // Render actual heatmap cells
        this.heatmapGrid.innerHTML = ''; // Clear loading/previous
        const fragment = document.createDocumentFragment();

        chapters.forEach(chapter => {
            if (!chapter || !chapter.chapter) return; // Skip invalid data

            const cell = document.createElement('div');
            cell.classList.add('heatmap-cell');
            const masteryPercent = chapter.mastery ?? 0;
            const masteryLevel = this._getMasteryLevelClass(masteryPercent);
            cell.dataset.mastery = masteryLevel;
            cell.dataset.chapter = chapter.chapter;

            const tooltipText = `${chapter.chapter} (${masteryPercent}%)`;

            cell.addEventListener('mouseenter', (event) => this._showHeatmapTooltip(tooltipText, event.target));
            cell.addEventListener('mouseleave', () => this._hideHeatmapTooltip());
            cell.addEventListener('click', () => {
                if (!this.isSelectionMode) {
                    this._navigateToChapterDetails(chapter.chapter);
                }
            });
            fragment.appendChild(cell);
        });
        this.heatmapGrid.appendChild(fragment);
    }

    _cancelRename(cardElement, resetValue = true) {
        if (!cardElement) return;
        const input = cardElement.querySelector('.rename-input');
        const nameSpan = cardElement.querySelector('.chapter-name');

        cardElement.classList.remove('is-renaming');
        if (input) {
            if (resetValue) input.value = input.dataset.originalName || nameSpan?.textContent || '';
            input.style.display = 'none';
            input.disabled = false;
        }
        if (nameSpan) nameSpan.style.display = '';
        cardElement.style.cursor = '';

        if (this.activeRenameInput === input) {
            this.activeRenameInput = null;
        }
    }

    async _handleSetDefaultMaterial(materialName) {
        if (!materialName) return;
        console.log(`TODO: Setting ${materialName} as default material via API.`);
        try {
            // Placeholder: Assume an API call exists
            // await apiClient.setDefaultMaterial(materialName);
            this._showInfoMessage(`${materialName} set as default.`);
            // Optionally visually indicate the default tab (e.g., add a 'is-default' class)
            // May require re-rendering tabs or just finding and marking the specific tab.
        } catch (error) {
            console.error(`Failed to set ${materialName} as default:`, error);
            this._showError(`Could not set default material: ${error.message}`);
        }
    }

        /**
     * Renders the material tabs in the pill switcher.
     * Handles loading, error per material, and empty states.
     * @param {Array<object>} materials - Array of material summary objects from API.
     * @private
     */
        _renderMaterialTabs(materials) {
            console.log("DEBUG: _renderMaterialTabs - START, processing", materials?.length ?? 0, "materials.");
            if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) {
                console.error("FATAL: pillMaterialSwitcher or inner not found during _renderMaterialTabs.");
                return;
            }
    
            // Clear previous content
            this.pillMaterialSwitcherInner.innerHTML = '';
            console.log("DEBUG: _renderMaterialTabs - Cleared pillMaterialSwitcherInner");
    
            if (!materials || materials.length === 0) {
                this.pillMaterialSwitcherInner.innerHTML = '<span class="no-materials">No materials found</span>';
                this.pillMaterialSwitcher.classList.remove('has-multiple', 'has-3plus-materials');
                this.currentMaterial = null; // Ensure no material is selected
                console.log("DEBUG: _renderMaterialTabs - No materials, showing message.");
                this._updateActiveMaterialTab(); // Update layout even if empty
                return;
            }
    
            // Determine layout classes based on count
            const hasMultiple = materials.length > 1;
            const has3Plus = materials.length >= 3;
            this.pillMaterialSwitcher.classList.toggle('has-multiple', hasMultiple);
            this.pillMaterialSwitcher.classList.toggle('has-3plus-materials', has3Plus);
            console.log(`DEBUG: _renderMaterialTabs - hasMultiple: ${hasMultiple}, has3Plus: ${has3Plus}`);
    
            // Ensure currentMaterial is valid if it was set by summary
            if (this.currentMaterial && !materials.some(m => m.material === this.currentMaterial && !m.error)) {
                 console.warn(`Current material '${this.currentMaterial}' not found or has error in list. Attempting to find fallback.`);
                // Find first non-error material as fallback
                 const fallbackMaterial = materials.find(m => !m.error)?.material;
                 this.currentMaterial = fallbackMaterial || null; // May still be null if all have errors
                 console.log(`Fallback material set to: ${this.currentMaterial}`);
            }
    
            // Render tabs
            materials.forEach((matData, index) => {
                if (!matData || !matData.material) {
                     console.warn("Skipping invalid material data at index:", index);
                     return; // Skip malformed entries
                }
                console.log(`DEBUG: _renderMaterialTabs - Creating tab for: ${matData.material} (Error: ${!!matData.error})`);
    
                const tab = document.createElement('button');
                tab.classList.add('material-tab');
                tab.dataset.material = matData.material;
                tab.dataset.index = index;
                tab.title = matData.material;
                tab.setAttribute('aria-label', `Select material: ${matData.material}`);
    
                if (matData.error) {
                    tab.classList.add('has-error');
                    tab.disabled = true;
                    tab.title += ` (Error: ${matData.message || 'Failed to load'})`;
                    tab.innerHTML = '<svg viewBox="0 0 24 24" fill="#d9534f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>'; // Error icon
                } else {
                    const iconSvg = this.materialIcons[matData.material] || this.materialIcons['default'];
                    tab.innerHTML = iconSvg;
                }
    
                this.pillMaterialSwitcherInner.appendChild(tab);
            });
    
            console.log(`DEBUG: _renderMaterialTabs - Finished creating tabs. Final inner child count: ${this.pillMaterialSwitcherInner.childElementCount}`);
    
            // Set initial active/peeking classes
            this._updateActiveMaterialTab();
        }
    
        /** Phase 1: Process non-chapter data from summary */
        async _processSummaryData_Phase1(summaryData) {
            console.log("DEBUG: Processing Summary Phase 1"); // DEBUG
            if (!summaryData) throw new Error("No summary data received.");
    
            this.availableMaterials = summaryData.materials || [];
            this.currentMaterial = summaryData.selectedMaterialName;
            this.currentMaterialSettings = summaryData.settings || {};
            this.availableTags = this.currentMaterialSettings.uniqueTags || [];
            const defaultSort = this.currentMaterialSettings.defaultChapterSort;
            this.currentSort = (defaultSort?.field)
                ? { field: defaultSort.field, order: defaultSort.order || 'asc' }
                : { field: 'name', order: 'asc' };
            this.groupsData = summaryData.groups || [];
    
            console.log("DEBUG: Phase 1 - Current Material:", this.currentMaterial); // DEBUG
            console.log("DEBUG: Phase 1 - Current Sort:", this.currentSort); // DEBUG
            console.log("DEBUG: Phase 1 - Groups Found:", this.groupsData.length); // DEBUG
            console.log("DEBUG: Phase 1 - Tags Found:", this.availableTags.length); // DEBUG
    
    
            this._renderMaterialTabs(this.availableMaterials);
            this._updatePillStats(this.currentMaterial);
            this._renderTagPills();
            this._renderSortControls();
    
            if (summaryData.groups?.error) {
                 console.error("Error fetching groups included in summary:", summaryData.groups.message); // DEBUG
                 this._showError("Could not load chapter groups list.");
            }
            if (summaryData.settings?.error) {
                console.error("Error fetching settings included in summary:", summaryData.settings.message); // DEBUG
                this._showError("Could not load material settings.");
            }
        }
    
        /** Phase 2: Fetch chapter data (ungrouped & for groups) and render grid */
        async _fetchAndRenderInitialDashboardContent() {
            console.log("DEBUG: Fetching Initial Dashboard Content (Chapters)"); // DEBUG
            if (!this.currentMaterial) {
                 console.warn("DEBUG: Skipping chapter fetch, no current material."); // DEBUG
                 if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = '<p>No material selected.</p>';
                 return;
            }
    
            // Reset chapter caches
            this.ungroupedChaptersData = [];
            this.chaptersByGroup = {};
            this.allChaptersData = {};
    
            // Clear previous grid items (if any)
            this.gridInstance?.removeAll(true);
            if (this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = ''; // Clear loading message
    
            const fetchPromises = [];

            // Fetch Ungrouped
            this._updateLoadingState('chaptersUngrouped', true);
            fetchPromises.push(
                 apiClient.getChapters(this.currentMaterial, {
                      groupId: 'none', sortBy: this.currentSort.field, order: this.currentSort.order, suspended: false
                 }).then(chapters => {
                      console.log(`FETCH_SUCCESS: Ungrouped Chapters (${chapters?.length || 0})`);
                      this.ungroupedChaptersData = chapters || [];
                      this.ungroupedChaptersData.forEach(ch => { this.allChaptersData[ch.id] = ch; });
                }).catch(error => {
                     console.error("FETCH_ERROR: Ungrouped Chapters:", error); // DEBUG
                     this._showError(`Could not load ungrouped chapters: ${error.message}`);
                     this.ungroupedChaptersData = []; // Ensure empty array on error
                     this._updateLoadingState('chaptersUngrouped', false);
                })
                .finally(() => this._updateLoadingState('chaptersUngrouped', false))
            );
    
                // Fetch Grouped
                this.groupsData.forEach(group => {
                    this._updateLoadingState('chaptersInGroup', true, group.id);
                    const sortPref = group.sortPreference || this.currentSort;
                    fetchPromises.push(
                         apiClient.getChapters(this.currentMaterial, {
                              groupId: group.id, sortBy: sortPref.field, order: sortPref.order, suspended: false
                         }).then(chapters => {
                              console.log(`FETCH_SUCCESS: Group ${group.id} Chapters (${chapters?.length || 0})`);
                              this.chaptersByGroup[group.id] = chapters || [];
                              this.chaptersByGroup[group.id].forEach(ch => { this.allChaptersData[ch.id] = ch; });
                     }).catch(error => {
                          console.error(`FETCH_ERROR: Chapters for Group ${group.id}:`, error); // DEBUG
                          this._showError(`Could not load chapters for group ${group.name}: ${error.message}`);
                          this.chaptersByGroup[group.id] = []; // Ensure empty array on error
                          this._updateLoadingState('chaptersInGroup', false, group.id);
                     })
                     .finally(() => this._updateLoadingState('chaptersInGroup', false, group.id))
                 );
            });
    
            // Wait for ALL chapter data fetches
            await Promise.allSettled(fetchPromises);
            console.log("DEBUG: All chapter fetches complete. Rendering layout.");

            // NOW render the full layout
            this._renderDashboardLayout();
        }

    /**
     * Processes the initial data dump from the dashboard summary endpoint.
     * @param {object} summaryData - The data object from getDashboardSummary.
     * @private
     */

    
    async _processDashboardSummary(summaryData) {
        console.log("Processing dashboard summary");
        if (!summaryData) throw new Error("No summary data received.");

        // 1. Process Materials & Settings
        this.availableMaterials = summaryData.materials || [];
        this.currentMaterial = summaryData.selectedMaterialName;
        this.currentMaterialSettings = summaryData.settings || {};
        this.availableTags = this.currentMaterialSettings.uniqueTags || [];
        const defaultSort = this.currentMaterialSettings.defaultChapterSort;
        this.currentSort = (defaultSort && defaultSort.field)
            ? { field: defaultSort.field, order: defaultSort.order || 'asc' }
            : { field: 'name', order: 'asc' };

        // Render Material Tabs (Pill)
        this._renderMaterialTabs(this.availableMaterials); // Render based on fetched materials
        this._updatePillStats(this.currentMaterial); // Update counts


        // 2. Process Groups
        this._updateLoadingState('groups', true);
        this.groupsData = summaryData.groups || [];
        if (summaryData.groups?.error) {
            console.error("Error fetching groups:", summaryData.groups.message);
            this._showError("Could not load chapter groups.");
        }
        this._updateLoadingState('groups', false);

        // Reset chapter data caches
        this.ungroupedChaptersData = [];
        this.chaptersByGroup = {};
        this.allChaptersData = {};

        // Clear previous grid content before fetching new data
        this.gridInstance?.removeAll(true);
        if(this.dashboardGridContainer) this.dashboardGridContainer.innerHTML = ''; // Clear fallback text


        // 3. Fetch Ungrouped Chapters (using global sort)
        await this._fetchAndRenderUngroupedChapters(); // Fetches and adds widgets

        // 4. Fetch Chapters for Each Group (concurrently)
        const groupChapterPromises = this.groupsData.map(group =>
            this._fetchAndRenderGroupChapters(group.id) // Fetches and populates group cache
                .catch(error => console.error(`Error initially fetching chapters for group ${group.id}`, error)) // Log error but continue
        );
        await Promise.allSettled(groupChapterPromises); // Wait for all initial group fetches

        // 5. Render UI Controls
        this._renderDashboardLayout(); // Renders the *structure* based on current groups/ungrouped
        this._renderTagPills();
        this._renderSortControls();

        // 6. Fetch and Render Overview Section Separately
        await this._loadOverviewData(); // Load heatmaps/timeline

    }

    // --- Rendering Methods ---

    /**
     * Clears and renders the entire dashboard grid with groups and ungrouped chapters.
     * Uses Gridstack API to add widgets.
     * @private
     */
    _renderDashboardLayout() {
        console.log("DEBUG: _renderDashboardLayout START"); // DEBUG
        if (!this.gridInstance) { return; }
        this._updateLoadingState('action', true);

        this.gridInstance.removeAll(true);
        this.dashboardGridContainer.innerHTML = ''; // Clear fallback

        const widgetsToAdd = [];

        // Prepare Group Widgets
        console.log(`DEBUG: Preparing ${this.groupsData.length} group widgets.`);
        this.groupsData.forEach(group => {
            try {
                 const groupElement = this._renderGroupWidget(group); // This now relies on this.chaptersByGroup being populated
                 if (groupElement) {
                      widgetsToAdd.push({
                           el: groupElement,
                           x: group.gridPosition?.col ? group.gridPosition.col - 1 : undefined,
                           y: group.gridPosition?.row ? group.gridPosition.row - 1 : undefined,
                           w: group.gridSize?.cols || 2, h: group.gridSize?.rows || 1,
                           id: group.id,
                           autoPosition: !(group.gridPosition?.col && group.gridPosition?.row)
                      });
                 }
            } catch (error) { console.error(`Error preparing group widget ${group.id}:`, error); }
        });

        // Prepare Ungrouped Chapter Widgets
        console.log(`DEBUG: Preparing ${this.ungroupedChaptersData.length} ungrouped chapter widgets.`);
        this.ungroupedChaptersData.forEach(chapter => {
            try {
                 const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                 if (chapterElement) {
                      widgetsToAdd.push({
                        el: chapterElement,
                        x: chapter.position?.x || 0,
                        y: chapter.position?.y || 0,
                        w: chapter.size?.w || 1,
                        h: chapter.size?.h || 1,
                        // Adding these explicit margin settings:
                        marginTop: 15,
                        marginRight: 15,
                        marginBottom: 15,
                        marginLeft: 15, id: chapter.id, autoPosition: true
                      });
                 }
            } catch (error) { console.error(`Error preparing chapter widget ${chapter.id}:`, error); }
        });

        // Add widgets to Gridstack
        if (widgetsToAdd.length > 0) {
            console.log(`DEBUG: Adding/Configuring ${widgetsToAdd.length} widgets...`);
            this.gridInstance.batchUpdate();
            widgetsToAdd.forEach(config => {
                try {
                    // Add widget first
                    this.gridInstance.addWidget(config.el, config);

                    // **MODIFICATION:** Set movable/resizable state AFTER adding
                    const isGroup = config.el.classList.contains('group-widget');
                    this.gridInstance.movable(config.el, isGroup); // Only groups movable
                    this.gridInstance.resizable(config.el, isGroup); // Only groups resizable
                    console.log(`DEBUG: Widget ${config.id || 'unknown'} added. Movable=${isGroup}, Resizable=${isGroup}`);

                } catch (e) { console.error("Gridstack error adding widget:", config.id || 'unknown', e); config.el?.remove(); }
            });
            this.gridInstance.commit();
            console.log("DEBUG: Gridstack batch update committed.");
        } else {
             console.log("DEBUG: No widgets to add."); // DEBUG
             this.dashboardGridContainer.innerHTML = '<p>No chapters or groups found.</p>';
        }

        this._updateLoadingState('action', false);
        console.log("DEBUG: Dashboard layout rendering complete."); // DEBUG
    }

    _renderGroupWidget(group) {
        console.log(`DEBUG: Rendering group widget START: ${group.name} (${group.id})`);
        const groupWidget = document.createElement('div');
        groupWidget.classList.add('grid-stack-item', 'group-widget');
        groupWidget.dataset.groupId = group.id;
        groupWidget.dataset.layoutMode = group.layoutMode || 'card';
        if (group.color) groupWidget.style.setProperty('--group-bg-color', group.color);
        groupWidget.setAttribute('gs-id', group.id);

        const groupChapters = this.chaptersByGroup[group.id]; // Assumes data is ready
        const avgMastery = group.stats?.averageMastery ?? '--';
        const chapterCount = group.stats?.chapterCount ?? (Array.isArray(groupChapters) ? groupChapters.length : 0);

        let chapterHTML = '';
        if (this.isLoading.chaptersInGroup[group.id]) { // Should not happen with new flow, but keep check
             chapterHTML = LOADING_TEXT_SMALL;
        } else if (!Array.isArray(groupChapters)) { // Handle fetch error case
             chapterHTML = ERROR_TEXT_SMALL;
             console.error(`DEBUG: Chapter data missing or invalid for group ${group.id} during render.`); // DEBUG
        } else if (groupChapters.length === 0) {
             chapterHTML = EMPTY_GROUP_TEXT;
        } else {
            console.log(`DEBUG: Rendering ${groupChapters.length} chapter items inside group ${group.id}`); // DEBUG
             const fragment = document.createDocumentFragment(); // Use fragment for performance
             groupChapters.forEach(chapter => {
                 try {
                     const chapterItemElement = this._renderChapterItem(chapter, {
                         layout: group.layoutMode || 'card',
                         containerSize: group.gridSize || { rows: 1, cols: 2 }
                     });
                     if (chapterItemElement) {
                          fragment.appendChild(chapterItemElement); // Append element, not HTML string
                     } else {
                          console.warn(`DEBUG: _renderChapterItem returned null for chapter ${chapter.id} in group ${group.id}`); // DEBUG
                     }
                 } catch (renderError) {
                      console.error(`Error rendering chapter item ${chapter.id} inside group ${group.id}:`, renderError); // DEBUG
                      // Optionally append an error placeholder for the specific chapter
                      const errorEl = document.createElement('div');
                      errorEl.className = 'error-text-small';
                      errorEl.textContent = `Error: ${chapter.name}`;
                      fragment.appendChild(errorEl);
                 }
             });
             // Append fragment later after creating the chapterArea div
        }

        // Construct inner content REQUIRED by Gridstack
        groupWidget.innerHTML = `
            <div class="grid-stack-item-content">
                <div class="group-widget-header" draggable="false">
                    <span class="group-name">${group.name}</span>
                    <input type="text" class="rename-input group-rename-input" value="${group.name}" style="display: none;" data-original-name="${group.name}">
                    <span class="group-stats" title="Average Mastery / Chapter Count">${avgMastery}% / ${chapterCount}</span>
                </div>
                 <div class="group-chapter-area layout-${group.layoutMode || 'card'} scrollable">
                     <!-- Chapters will be appended here -->
                </div>
            </div>`;

        // Append chapters from fragment if they were created
         if (typeof fragment !== 'undefined') {
             const chapterArea = groupWidget.querySelector('.group-chapter-area');
             if (chapterArea) {
                  if(fragment.hasChildNodes()) {
                       chapterArea.appendChild(fragment);
                  } else if (!this.isLoading.chaptersInGroup[group.id]) { // If not loading and no chapters rendered
                       chapterArea.innerHTML = chapterHTML; // Use placeholder text (empty/error)
                  }
             }
         }


        // Attach listeners
        const renameInput = groupWidget.querySelector('.group-rename-input');
        renameInput?.addEventListener('keydown', this._handleRenameInputKeydown);
        renameInput?.addEventListener('blur', this._handleRenameInputBlur);
        // Context menu handled by delegation

        console.log(`DEBUG: Rendering group widget END: ${group.name}`); // DEBUG
        return groupWidget;
    }


    /** Opens the modal/UI to change group color */
    _handleOpenGroupColorPicker(groupId, groupData) {
        console.log("DEBUG: Opening color picker for group", groupId);
        // Assuming a simple modal with <input type="color">
        if (!this.colorPickerModalOverlay || !this.colorPickerInput) {
             this._showError("Color picker UI not found."); return;
        }
        this.activeColorPickerTarget = { type: 'group', id: groupId, element: this._findGroupElement(groupId) }; // Store target
        this.colorPickerInput.value = groupData.color || '#cccccc'; // Set current color or default
        // TODO: Show modal (assuming standard _showModal works or custom logic)
        this._showModal('groupColorPickerModal'); // Need this modal ID in HTML
    }

       /** Handles confirming the color selection */
       async _handleConfirmGroupColor() {
        if (!this.activeColorPickerTarget || this.activeColorPickerTarget.type !== 'group' || !this.colorPickerInput) return;

        const groupId = this.activeColorPickerTarget.id;
        const groupElement = this.activeColorPickerTarget.element;
        const newColor = this.colorPickerInput.value;
        const groupData = this._findGroupData(groupId);

        console.log(`DEBUG: Confirming color ${newColor} for group ${groupId}`);
        this._hideModal('groupColorPickerModal');
        if (!groupData || groupData.color === newColor) {
             console.log("DEBUG: Color unchanged or group data missing.");
             this.activeColorPickerTarget = null;
             return; // No change needed
        }

        this._updateLoadingState('action', true);
        try {
             await apiClient.updateGroup(groupId, { color: newColor });
             groupData.color = newColor; // Update local data
             if (groupElement) groupElement.style.setProperty('--group-bg-color', newColor); // Update live element
             this._showInfoMessage("Group color updated.");
        } catch (error) {
             console.error(`Failed to update color for group ${groupId}:`, error);
             this._showError(`Could not update color: ${error.message}`);
        } finally {
             this._updateLoadingState('action', false);
             this.activeColorPickerTarget = null; // Clear target
        }
   }

    /**
     * Renders a single group widget container and its internal chapters.
     * Returns the complete .grid-stack-item element.
     * @param {object} group - The group data object.
     * @returns {HTMLElement | null} The group widget element or null on error.
     * @private
     */
    _renderGroupWidget(group) {
        console.log(`Rendering group widget: ${group.name} (${group.id}) - Layout: ${group.layoutMode}`);
        const groupWidget = document.createElement('div');
        groupWidget.classList.add('grid-stack-item', 'group-widget'); // Base classes
        groupWidget.dataset.groupId = group.id;
        groupWidget.dataset.layoutMode = group.layoutMode || 'card';
        if (group.color) {
            groupWidget.style.setProperty('--group-bg-color', group.color);
        }
        // Add gs-id for gridstack reference
        groupWidget.setAttribute('gs-id', group.id);

        const groupChapters = this.chaptersByGroup[group.id] || [];
        const avgMastery = group.stats?.averageMastery ?? '--';
        const chapterCount = group.stats?.chapterCount ?? groupChapters.length;

        let chapterHTML = '';
        // Fetch chapters on demand if not already loaded
        if (!this.chaptersByGroup[group.id] && !this.isLoading.chaptersInGroup[group.id]) {
            // Trigger async fetch, show loading state for now
             this._fetchAndRenderGroupChapters(group.id); // Will update content later
             chapterHTML = '<div class="loading-text-small">Loading chapters...</div>';
        } else if (this.isLoading.chaptersInGroup[group.id]) {
             chapterHTML = '<div class="loading-text-small">Loading chapters...</div>';
        } else {
             // Chapters are loaded, render them
             groupChapters.forEach(chapter => {
                 try {
                      const chapterItemElement = this._renderChapterItem(chapter, {
                           layout: group.layoutMode || 'card',
                           containerSize: group.gridSize || { rows: 1, cols: 2 } // Use group size
                      });
                      if (chapterItemElement) {
                           chapterHTML += chapterItemElement.outerHTML; // Use outerHTML to get the full element string
                      }
                 } catch (renderError) {
                      console.error(`Error rendering chapter item ${chapter.id} inside group ${group.id}:`, renderError);
                      chapterHTML += `<div class="error-text-small">Error loading chapter ${chapter.name}.</div>`;
                 }
             });
             if (!chapterHTML) {
                  chapterHTML = '<div class="empty-group-text">No chapters in group.</div>';
             }
        }

        // Construct inner content REQUIRED by Gridstack
        groupWidget.innerHTML = `
            <div class="grid-stack-item-content">
                <div class="group-widget-header" draggable="false"> <!-- Prevent header drag from moving widget -->
                    <span class="group-name">${group.name}</span>
                    <input type="text" class="rename-input group-rename-input" value="${group.name}" style="display: none;" data-original-name="${group.name}">
                    <span class="group-stats" title="Average Mastery / Chapter Count">${avgMastery}% / ${chapterCount}</span>
                    <!-- TODO: Add controls for context menu trigger? -->
                </div>
                 <div class="group-chapter-area layout-${group.layoutMode || 'card'} scrollable"> <!-- Add scrollable class -->
                    ${chapterHTML}
                </div>
                <!-- Gridstack default resize handle is usually bottom-right -->
                 <!-- Add custom handle if needed: <div class="group-resize-handle grid-stack-handle"></div> -->
            </div>`;

        // Attach listeners to the newly created elements within the widget
        const renameInput = groupWidget.querySelector('.group-rename-input');
        renameInput?.addEventListener('keydown', this._handleRenameInputKeydown);
        renameInput?.addEventListener('blur', this._handleRenameInputBlur);
        // Attach context menu listener TO THE WIDGET ITSELF
        groupWidget.addEventListener('contextmenu', this._handleContextMenu);

        // Attach listeners to chapter items *within* the group AFTER adding to DOM?
        // Or rely on delegation from the main dashboard container. Delegation is better.

        return groupWidget;
    }

    /**
     * Renders a single chapter item (either standalone or within a group).
     * Returns the complete element (including .grid-stack-item wrapper if standalone).
     * @param {object} chapter - The chapter data object (MUST include id, name, stats, tags, isPinned, isSuspended, groupId).
     * @param {object} options - Rendering options.
     * @returns {HTMLElement | null} The chapter item element or null on error.
     * @private
     */
    _renderChapterItem(chapter, options = {}) {
    const { isStandalone = false, layout = 'card', containerSize = { rows: 1, cols: 1 } } = options;
    if (!chapter || !chapter.id) { console.warn("DEBUG: Skipping render for chapter with missing data:", chapter); return null; }

    const chapterElement = document.createElement('div');
    chapterElement.draggable = true; // Make the item draggable
    chapterElement.dataset.chapterId = chapter.id;
    chapterElement.dataset.chapterName = chapter.name; // Useful for study session link
    if (chapter.groupId) {
        chapterElement.dataset.groupId = chapter.groupId;
    }

    // --- Base Classes & State ---
    let contentHTML = ''; // Initialize empty content string
    let wrapperClass = 'chapter-item'; // Base class for grouped items

    // --- Base Classes & State ---
    // Add chapter-item class to ALL chapters (both standalone and grouped) for drag functionality
    chapterElement.classList.add('chapter-item');
    
    let contentWrapperClass = 'chapter-item-content-grouped'; // Assume grouped initially

    if (isStandalone) {
        // The element ITSELF is the grid-stack-item
        chapterElement.classList.add('grid-stack-item', 'standalone-chapter', 'chapter-card-style');
        chapterElement.setAttribute('gs-id', chapter.id);
        
        // Gridstack will wrap this element with '.grid-stack-item-content'
        // So, we render the chapter content directly inside chapterElement
   } else {
        // Grouped item: Just the chapter item, content wrapper added inside
        chapterElement.classList.add('chapter-item');
        chapterElement.classList.add(`layout-${layout}`);
        if (layout === 'card') chapterElement.classList.add('chapter-card-style');
        else chapterElement.classList.add('chapter-list-style');
        // Add the necessary inner content wrapper for grouped items
        contentHTML += `<div class="chapter-item-content-grouped">`;
   }

        // --- Determine Content Visibility ---
        // --- Determine Content Visibility (logic remains the same) ---
        let showMastery = false, showStats = false, sizeClass = '';
        if (isStandalone || layout === 'card') {
            sizeClass = 'size-full'; showMastery = true; showStats = true;
        } else { /* list layout logic */
             const cellWidth = containerSize.cols || 1;
             if (cellWidth >= 3) { sizeClass = 'size-wide-list'; showMastery = true; showStats = true; }
             else if (cellWidth === 2) { sizeClass = 'size-medium-list'; showMastery = true; showStats = false; }
             else { sizeClass = 'size-compact-list'; showMastery = false; showStats = false; }
        }
        chapterElement.classList.add(sizeClass); // Add size class to the main element
        if (chapter.isPinned) chapterElement.classList.add('is-pinned');
        // if (chapter.isSuspended) chapterElement.classList.add('is-suspended');

        // --- Build Inner HTML (directly or inside wrapper) ---
        const masteryPercent = chapter.stats?.mastery ?? 0;
        const totalCards = chapter.stats?.cardCount ?? 0;
        const dueCards = chapter.stats?.totalDueCards ?? 0;
        const newCards = chapter.stats?.remainingNewCards ?? 0;
        const masteryLevel = this._getMasteryLevelClass(masteryPercent);
        const radius = 15.915; const circumference = 2 * Math.PI * radius; const offset = circumference - (masteryPercent / 100) * circumference;

        // ISSUE 1 FIX: Ensure the content wrapper exists AND has necessary classes
        contentHTML += `<div class="chapter-main-info">`;
        contentHTML += `<span class="chapter-item-name">${chapter.name}</span>`;
        contentHTML += `<input type="text" class="rename-input chapter-rename-input" value="${chapter.name}" style="display: none;" data-original-name="${chapter.name}">`;
        if (showMastery) { /* ... mastery circle HTML ... */
            contentHTML += `<div class="mastery-progress-circle ${masteryLevel}" title="Mastery: ${masteryPercent}%"><svg viewBox="0 0 36 36" class="progress-ring"><circle class="progress-ring-bg" cx="18" cy="18" r="${radius}" /><circle class="progress-ring-circle" cx="18" cy="18" r="${radius}" stroke-dasharray="${circumference} ${circumference}" stroke-dashoffset="${offset}" /></svg><span class="mastery-percentage">${masteryPercent}%</span></div>`;
         }
         contentHTML += `</div>`; // End chapter-main-info
        if (showStats) { /* ... stats HTML ... */
            contentHTML += `<div class="card-stats-new"><div class="stat-item-new total-cards" title="Total Cards"><svg width="100" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  
                    <!-- Card 4 (Deepest in the stack) -->
                    <!-- Further offset (x=8, y=2), increased negative rotation -->
                    <rect 
                      x="8" y="2" 
                      width="20" height="24" 
                      rx="3" ry="3" 
                      fill="none" 
                      stroke="white" 
                      stroke-width="1.5" 
                      transform="rotate(-12 18 14)" /> 
                      <!-- Rotation center: x=8 + width/2=18, y=2 + height/2=14 -->
                  
                    <!-- Card 3 -->
                    <!-- Original "Back Card", now the third from front -->
                    <!-- Position (x=6, y=4), standard negative rotation -->
                     <rect 
                      x="6" y="4" 
                      width="20" height="24" 
                      rx="3" ry="3" 
                      fill="none" 
                      stroke="white" 
                      stroke-width="1.5" 
                      transform="rotate(-6 16 16)" /> 
                      <!-- Rotation center: x=6 + width/2=16, y=4 + height/2=16 -->
                  
                    <!-- Card 2 & Text '1' Group (Front Card Group) -->
                    <!-- Rotated slightly positive -->
                    <g transform="rotate(4 13 13)"> 
                       <!-- Rotation center: x=4 + width/2=13, y=2 + height/2=13 -->
                  
                      <!-- Card 2 Outline (Front Card Outline) -->
                      <rect 
                        x="4" y="2" 
                        width="18" height="22" 
                        rx="3" ry="3" 
                        fill="none" 
                        stroke="white" 
                        stroke-width="1.5" />
                  
                  
                    </g>
                  </svg><span class="stat-value">${totalCards}</span></div><div class="stat-item-new due-cards" title="Cards Due"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
               </svg><span class="stat-value">${dueCards}</span></div><div class="stat-item-new new-cards" title="New Cards"><svg>  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 7H11v4H7v2h4v4h2v-4h4v-2h-4V7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
 </svg></svg><span class="stat-value">${newCards}</span></div></div>`;
         }
        if (chapter.isPinned) contentHTML += `<span class="status-indicator pinned-indicator" title="Pinned">📌</span>`;
        // if (chapter.isSuspended) ... // Only show if filtering for suspended
        if (!isStandalone) {
            contentHTML += `</div>`; // End .chapter-item-content-grouped
        }

        chapterElement.innerHTML = contentHTML; // Set the final HTML

        // Attach Listeners (Attach to chapterElement itself)
        const renameInput = chapterElement.querySelector('.chapter-rename-input');
        renameInput?.addEventListener('keydown', this._handleRenameInputKeydown);
        renameInput?.addEventListener('blur', this._handleRenameInputBlur);
        // Context menu handled by delegation on dashboardGridContainer

        return chapterElement;
    }

    /** Renders the top sort controls */
    _renderSortControls() {
        console.log("Rendering sort controls");
        if (!this.sortFieldSelect || !this.sortOrderSelect) return;
        // Set dropdown values based on this.currentSort
        this.sortFieldSelect.value = this.currentSort.field;
        this.sortOrderSelect.value = this.currentSort.order;
        // Add other setup if needed
    }

    /** Renders the tag filter pills */
    _renderTagPills() {
        console.log("Rendering tag pills");
        if (!this.tagPillsContainer) return;
        

        this.tagPillsContainer.innerHTML = ''; // Clear existing
        const fragment = document.createDocumentFragment();

        // 1. "All Chapters" Pill
        const createPill = (text, type, value = null, specialClass = '', action = null) => {
            const pill = document.createElement('button');
            pill.textContent = text;
            pill.classList.add('tag-pill');
            if (specialClass) pill.classList.add(specialClass);
            pill.dataset.filterType = type; // For filter pills
            if (value !== null && type === 'tag') pill.dataset.filterValue = value; // Tag value
            if (type === 'tag') pill.dataset.tagName = value; // Keep for delete ID
            if (action) pill.dataset.action = action; // For action buttons
            if (type === 'tag') pill.dataset.dropTargetType = 'tag'; // Mark as drop target

            if (this.currentFilter.type === type && this.currentFilter.value === value) {
                pill.classList.add('active'); // Active filter
            }
            return pill;
        };

        fragment.appendChild(createPill('All Chapters', 'all', null, 'filter-pill'));
        fragment.appendChild(createPill('Pinned', 'pinned', null, 'filter-pill.special-filter'));
        fragment.appendChild(createPill('Suspended', 'suspended', null, 'filter-pill.special-filter'));
        this.availableTags.sort().forEach(tag => { fragment.appendChild(createPill(tag, 'tag', tag)); });

        const selectButton = createPill(this.isSelectionModeActive ? 'Cancel Select' : 'Select Chapters', 'action', null, 'action-button', 'toggle-select');
        selectButton.id = 'selectChaptersButton';
        fragment.appendChild(selectButton);

        // ONLY show Create Group button if NOT in selection mode OR if creating group directly
        // const createGroupBtn = createPill('+ Create Group', 'action', null, 'action-button', 'create-group');
        // createGroupBtn.id = 'createGroupButton';
        // Hide if selecting chapters UNLESS specifically in the group creation flow
        // createGroupBtn.style.display = (this.isSelectionModeActive && !this.isCreatingGroup) ? 'none' : '';
        // fragment.appendChild(createGroupBtn);

        const addTagButton = document.createElement('button');
        addTagButton.classList.add('tag-pill', 'action-button', 'add-tag-button');
        addTagButton.dataset.action = 'add-tag';
        // Add inner elements
        addTagButton.innerHTML = `
             <span class="add-tag-text">+ Add Tag</span>
             <input type="text" class="add-tag-input" placeholder="New tag..." style="display: none;">
        `;
        fragment.appendChild(addTagButton);
    
        this.tagPillsContainer.appendChild(fragment);
    
        // Add specific listeners for the input inside the add tag button
        const input = addTagButton.querySelector('.add-tag-input');
        if (input) {
             input.addEventListener('keydown', this._handleAddTagInputKeydown);
             input.addEventListener('blur', this._handleAddTagInputBlur);
        }

        // Ensure DELEGATED listener is attached ONCE in _attachBaseEventListeners
         console.log("DEBUG: Tag pills rendered."); // DEBUG
    }

    /**
     * Renders the view in filtered mode (flat list of chapters).
     * @param {object} filterOptions - e.g., { type: 'tag', value: 'calculus' } or { type: 'pinned' }
     * @private
     */
    /** MODIFIED: Renders the view in filtered mode using Gridstack card layout */
    async _renderFilteredView(filterOptions) {
        console.log("DEBUG: Rendering filtered view:", filterOptions);
        if (!this.gridInstance || !this.dashboardGridContainer) return;

        this.dashboardGridContainer.classList.add('filtered-view'); // Keep class for potential styling differences
        this.gridInstance.enable(); // Ensure grid is interactive (though maybe disable move/resize?)
        this.gridInstance.removeAll(true); // Clear existing widgets and DOM nodes
        this.dashboardGridContainer.innerHTML = '<p class="loading-text">Loading filtered chapters...</p>';
        this._updateLoadingState('action', true);

        const apiOptions = { sortBy: this.currentSort.field, order: this.currentSort.order };
        if (filterOptions.type === 'tag') apiOptions.tag = filterOptions.value;
        else if (filterOptions.type === 'pinned') apiOptions.pinned = true;
        else if (filterOptions.type === 'suspended') apiOptions.suspended = true;
        // Apply suspend filter unless explicitly viewing suspended
        if (filterOptions.type !== 'suspended') apiOptions.suspended = false;

        try {
            const filteredChapters = await apiClient.getChapters(this.currentMaterial, apiOptions);
            this.dashboardGridContainer.innerHTML = ''; // Clear loading message

            if (!filteredChapters || filteredChapters.length === 0) {
                 this.dashboardGridContainer.innerHTML = `<p>No chapters match the current filter.</p>`;
            } else {
                 // Render as Gridstack widgets using standalone card style
                 const widgetsToAdd = [];
                 filteredChapters.forEach(chapter => {
                     // Use isStandalone: true to get the full card rendering
                     const chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                     if (chapterElement) {
                          widgetsToAdd.push({
                               el: chapterElement, w: 1, h: 1, id: chapter.id, autoPosition: true
                          });
                     }
                 });

                 // Add widgets to Gridstack
                 if (widgetsToAdd.length > 0) {
                      this.gridInstance.batchUpdate();
                      widgetsToAdd.forEach(config => {
                           try { this.gridInstance.addWidget(config.el, config); this.gridInstance.movable(chapterElement, false);
                            this.gridInstance.resizable(chapterElement, false);}
                           catch (e) { console.error("Gridstack error adding filtered widget:", e); config.el?.remove();}
                      });
                      this.gridInstance.commit();
                 }
            }
        } catch (error) { /* ... error handling ... */
            console.error("Failed to fetch filtered chapters:", error);
            this.dashboardGridContainer.innerHTML = `<p class="error-text">Error loading filtered chapters.</p>`;
            this._showError(`Could not load filtered chapters: ${error.message}`);
        } finally {
            this._updateLoadingState('action', false);
            // Ensure grid edit mode reflects current state (likely disabled in filtered view)
            // this._updateGridEditMode(); // Might need adjustment if filter view disallows edits
             this.gridInstance.enableMove(false);
             this.gridInstance.enableResize(false);
        }
    }
    // --- Event Handlers ---

   /** Combined handler for clicks within the tag pills container */
   /** MODIFIED: Separates filter logic from action button logic */
    // --- Event Handlers ---

    _handleTagPillOrActionClick(event) {
        const targetButton = event.target.closest('.tag-pill');
        if (!targetButton) return;

        const action = targetButton.dataset.action;
        const filterType = targetButton.dataset.filterType;
        const filterValue = targetButton.dataset.filterValue;

        console.log(`DEBUG: Pill/Action click: action=${action}, filterType=${filterType}, filterValue=${filterValue}`);

        if (action === 'toggle-select') {
             this._handleToggleSelectionMode();
        } else if (action === 'create-group') {
            console.log("DEBUG: Action 'create-group' clicked."); // DEBUG
            this._handleOpenCreateGroupModal(); // Open modal for name/color
            this._handleToggleSelectionMode(true); // Enter selection mode simultaneously
            // Optionally add class to container: this.container?.classList.add('is-creating-group-selecting');
            // this._showInfoMessage("Enter group details and select chapters below.", "Create Group"); // Guide user
        } else if (action === 'add-tag') {
            // **MODIFIED:** Toggle inline input state
            this._handleAddTagToggle(targetButton); // Pass the button element
       } else if (filterType) {
             // Handle FILTER pills (same as before)
             // ... (set filter, render pills, render dashboard/filtered view) ...
             const newFilter = { type: filterType, value: filterValue || null };
             if (this.currentFilter.type === newFilter.type && this.currentFilter.value === newFilter.value) return;
             this.currentFilter = newFilter;
             this._renderTagPills();
             if (this.isSelectionModeActive) this._handleToggleSelectionMode(); // Exit selection on filter change
             if (this.currentFilter.type === 'all') {
                 this.dashboardGridContainer?.classList.remove('filtered-view');
                 this.gridInstance?.enable();
                 this._renderDashboardLayout();
             } else {
                 this._renderFilteredView(this.currentFilter);
             }
        }
    }

    /** Toggles the inline tag input state */
_handleAddTagToggle(buttonElement) {
    const input = buttonElement.querySelector('.add-tag-input');
    const text = buttonElement.querySelector('.add-tag-text');
    if (!input || !text) return;

    const isEditing = buttonElement.classList.contains('is-editing');

    if (!isEditing) {
        console.log("DEBUG: Enabling inline tag input"); // DEBUG
        // Cancel any other inline edits? (e.g., rename)
        if (this.activeRenameTarget) this._cancelRename();

        input.value = ''; // Clear previous value
        buttonElement.classList.add('is-editing');
        input.style.display = 'flex'; // Show input
        text.style.display = 'none'; // Hide text
        input.focus();
    }
    // Note: Blurring or pressing Enter will handle exiting the editing state
}

/** Handles keydown on the inline tag input */
async _handleAddTagInputKeydown(event) {
   if (event.key !== 'Enter') return;

   event.preventDefault(); // Prevent form submission/other defaults
   const input = event.target;
   const buttonElement = input.closest('.add-tag-button');
   const newTagName = input.value.trim();

   if (!newTagName) { // If empty, just cancel
       this._cancelAddTagInline(buttonElement);
       return;
   }

   if (this.availableTags.includes(newTagName)) {
       this._showError(`Tag "${newTagName}" already exists.`, true);
       // Maybe highlight the existing tag instead of error?
       input.select(); // Keep focus for correction
       return;
   }

   console.log(`DEBUG: Creating tag "${newTagName}" via inline input`); // DEBUG
   input.disabled = true; // Prevent double submit
   this._updateLoadingState('action', true);

   try {
       const result = await apiClient.createMaterialTag(this.currentMaterial, newTagName);
       this.availableTags = result.tags || this.availableTags; // Update local cache
       this._renderTagPills(); // Re-render pills (which removes the 'is-editing' state implicitly)
       this._showInfoMessage(`Tag "${newTagName}" created.`);
   } catch (error) {
       console.error("Failed to create tag inline:", error); // DEBUG
       this._showError(`Could not create tag: ${error.message}`);
       input.disabled = false; // Re-enable on error
       input.focus(); // Keep focus for correction
   } finally {
       this._updateLoadingState('action', false);
       // Ensure input is re-enabled if something went wrong after API call but before re-render
        const potentiallyNewInput = buttonElement?.querySelector('.add-tag-input');
        if (potentiallyNewInput) potentiallyNewInput.disabled = false;
       // No need to explicitly call _cancelAddTagInline if _renderTagPills runs
   }
}

/** Handles blur on the inline tag input */
_handleAddTagInputBlur(event) {
    // Use timeout to allow clicking Enter/elsewhere briefly
    setTimeout(() => {
        const input = event.target;
        const buttonElement = input.closest('.add-tag-button');
        // Check if focus moved outside the button AND it's still editing
        if (buttonElement?.classList.contains('is-editing') && !buttonElement.contains(document.activeElement)) {
             console.log("DEBUG: Cancelling inline tag add due to blur"); // DEBUG
             this._cancelAddTagInline(buttonElement);
        }
    }, 150);
}

/** Resets the inline tag button UI */
_cancelAddTagInline(buttonElement) {
   if (!buttonElement) return;
   const input = buttonElement.querySelector('.add-tag-input');
   const text = buttonElement.querySelector('.add-tag-text');
   if (!input || !text) return;

   buttonElement.classList.remove('is-editing');
   input.style.display = 'none';
   text.style.display = 'flex'; // Or 'inline' / 'block' depending on original style
   input.disabled = false;
   input.value = ''; // Clear value
}


    /** MODIFIED: Fixes grid update on sort */
    /** MODIFIED: Fixes grid update on sort */
    async _handleSortChange() {
        console.log("DEBUG: Sort changed");
        const newField = this.sortFieldSelect?.value;
        const newOrder = this.sortOrderSelect?.value;
        if (!newField || !newOrder || (newField === this.currentSort.field && newOrder === this.currentSort.order)) return;

        this.currentSort = { field: newField, order: newOrder };
        console.log("DEBUG: New global sort:", this.currentSort);

        this._updateLoadingState('action', true);
        try { await apiClient.setDefaultChapterSort(this.currentMaterial, newField, newOrder); }
        catch (error) { console.error("Failed to save default sort preference:", error); }

        // Refresh view based on current filter state
        if (this.currentFilter.type === 'all') {
            console.log("DEBUG: Re-fetching/rendering ungrouped for dashboard view due to sort change.");
            // Call the specific function to handle only ungrouped items update
            await this._fetchAndReorderUngroupedChapters();
            // TODO: Refresh groups without sort preference? Deferred.
        } else {
            console.log("DEBUG: Re-rendering filtered view due to sort change.");
            await this._renderFilteredView(this.currentFilter); // This already fetches with new sort
        }
        this._updateLoadingState('action', false);
    }

        /** MODIFIED: Re-fetches AND REORDERS/REPLACES ungrouped chapters in Gridstack */
        async _fetchAndReorderUngroupedChapters() {
            if (!this.gridInstance || this.currentFilter.type !== 'all') return;
            console.log("DEBUG: Refreshing & Reordering Ungrouped Chapters. Sort:", this.currentSort);
            this._updateLoadingState('chaptersUngrouped', true);
    
            try {
                // 1. Fetch chapters with the new sort order
                const sortedChapters = await apiClient.getChapters(this.currentMaterial, {
                     groupId: 'none', sortBy: this.currentSort.field, order: this.currentSort.order, suspended: false
                });
                this.ungroupedChaptersData = sortedChapters || []; // Update cache
                this.ungroupedChaptersData.forEach(ch => { this.allChaptersData[ch.id] = ch; });
    
                this.gridInstance.batchUpdate();
    
                // 2. Get current ungrouped widgets from Gridstack
                const currentWidgets = this.gridInstance.getGridItems().filter(el => el.classList.contains('standalone-chapter'));
                const currentWidgetMap = new Map(currentWidgets.map(el => [el.getAttribute('gs-id'), el]));
    
                // 3. Remove ALL current ungrouped widgets DETACHING them (keep node data)
                currentWidgets.forEach(widget => {
                     try {
                          this.gridInstance.removeWidget(widget, false, false); // Keep node, no event
                     } catch(e) { console.warn("Error removing widget during sort", e); widget?.remove(); }
                });
    
                // 4. Add widgets back in the NEW fetched order
                this.ungroupedChaptersData.forEach(chapter => {
                     let chapterElement = currentWidgetMap.get(chapter.id); // Get existing DOM node if available
                     if (!chapterElement) {
                         // If element wasn't in the grid before (shouldn't happen often here), render it
                         console.warn(`DEBUG: Re-rendering chapter element for ${chapter.id} during sort.`); // DEBUG
                         chapterElement = this._renderChapterItem(chapter, { isStandalone: true });
                     }
    
                     if (chapterElement) {
                         try {
                             // Add back with autoPosition. Gridstack should place them *roughly* in order added.
                              this.gridInstance.addWidget(chapterElement, { autoPosition: true, w: 1, h: 1, id: chapter.id });
                         } catch (e) {
                              console.error("Error re-adding sorted widget:", e); chapterElement.remove();
                         }
                     }
                });
    
                this.gridInstance.commit();
                console.log("DEBUG: Ungrouped chapters reordered in grid.");
    
            } catch (error) { console.error("Failed fetch/reorder ungrouped:", error); }
            finally { this._updateLoadingState('chaptersUngrouped', false); }
        }

    /** Handles clicks on tag pills */
    _handleTagPillClick(event) {
        const pill = event.target.closest('.tag-pill');
        if (!pill) return;

        if (pill.id === 'addTagButton') {
             this._handleOpenTagManagementModal();
             return;
        }

        const filterType = pill.dataset.filterType;
        let filterValue = null;

        if (filterType === 'tag') {
             filterValue = pill.dataset.tagName;
        }

        const newFilter = { type: filterType, value: filterValue };

        // Check if filter actually changed
         if (this.currentFilter.type === newFilter.type && this.currentFilter.value === newFilter.value) {
             console.log("Filter unchanged.");
             return;
         }

         this.currentFilter = newFilter;
         console.log("Filter changed:", this.currentFilter);


        // Update pill active states visually
         this._renderTagPills(); // Re-rendering handles active states

        // Render appropriate view
         if (this.currentFilter.type === 'all') {
             // Remove filtered view class, render dashboard
             this.dashboardGridContainer?.classList.remove('filtered-view');
             this._renderDashboardLayout();
         } else {
             // Render filtered flat list
             this._renderFilteredView(this.currentFilter);
         }
    }

    /** Handles clicks on the main grid (delegated for chapter/group context menus) */
    // _handleContextMenu (Needs refinement if delegation issues arise with Gridstack)
    /** MODIFIED: Handles context menu logic more accurately */
    /** MODIFIED: Handles context menu logic more accurately */
    _handleContextMenu(event) {
        event.preventDefault();
        this._hideContextMenu(); // Hide previous menu first

        // Prioritize chapter item if clicked directly within one
        const chapterItemElement = event.target.closest('.chapter-item');
        const groupWidgetElement = event.target.closest('.group-widget.grid-stack-item');

        let type = null;
        let id = null;
        let element = null;

        if (chapterItemElement) { // Clicked on or inside a chapter item
             type = 'chapter';
             id = chapterItemElement.dataset.chapterId;
             element = chapterItemElement;
             console.log(`DEBUG: Context menu target identified as CHAPTER ${id}`); // DEBUG
        } else if (groupWidgetElement) { // Clicked on a group widget (but not inside a chapter)
             type = 'group';
             id = groupWidgetElement.dataset.groupId;
             element = groupWidgetElement;
             console.log(`DEBUG: Context menu target identified as GROUP ${id}`); // DEBUG
        } else {
             console.log("DEBUG: Context menu click not on a valid target."); // DEBUG
             return; // Not on a chapter or group
        }

        if (!type || !id || !element) return;

        this.activeContextMenuTarget = { type, id, element };

        let menuElement;
        if (type === 'group') {
            menuElement = this.groupContextMenu;
            // TODO: Setup group menu items if needed
        } else { // chapter
            menuElement = this.chapterContextMenu;
            this._setupChapterContextMenu(id);
        }

        this._positionAndShowContextMenu(menuElement, event);
    }

    _setupChapterContextMenu(chapterId) {
        const chapter = this._findChapterData(chapterId);
        if (!chapter || !this.chapterContextMenu) return;
        const pinOption = this.chapterContextMenu.querySelector('[data-action="pin"]');
        const suspendOption = this.chapterContextMenu.querySelector('[data-action="suspend"]');
        if (pinOption) pinOption.textContent = chapter.isPinned ? 'Unpin Chapter' : 'Pin Chapter';
        if (suspendOption) suspendOption.textContent = chapter.isSuspended ? 'Unsuspend Chapter' : 'Suspend Chapter';
        // TODO: Setup "Add Tag" state if implementing dropdown menu here
    }

    /** Positions and displays a context menu */
    _positionAndShowContextMenu(menuElement, event) {
        if (!menuElement) return;
        const posX = event.clientX + 2; const posY = event.clientY + 2;
        const menuWidth = menuElement.offsetWidth; const menuHeight = menuElement.offsetHeight;
        const vpWidth = window.innerWidth; const vpHeight = window.innerHeight;
        menuElement.style.left = `${Math.min(posX, vpWidth - menuWidth - 10)}px`;
        menuElement.style.top = `${Math.min(posY, vpHeight - menuHeight - 10)}px`;
        menuElement.style.display = 'block';
   }

   _hideContextMenu(menuType = null) { // Can be called with specific type or generally
       if (menuType === 'material') {
            if (this.materialContextMenu) this.materialContextMenu.style.display = 'none';
            this.materialContextMenuTargetMaterial = null;
            return;
       }
       if (this.activeContextMenuTarget) {
            const menu = this.activeContextMenuTarget.type === 'group' ? this.groupContextMenu : this.chapterContextMenu;
            if (menu) menu.style.display = 'none';
            this.activeContextMenuTarget = null;
       }
        // Also hide chapter/group menus if called without target context
        if (!menuType && this.chapterContextMenu) this.chapterContextMenu.style.display = 'none';
        if (!menuType && this.groupContextMenu) this.groupContextMenu.style.display = 'none';
   }


    /** Handles clicks within the GROUP context menu */
    // _handleGroupContextMenuClick, _handleChapterContextMenuClick (Route actions, implementations below)
    async _handleGroupContextMenuClick(event) {
        const actionItem = event.target.closest('li[data-action]');
        if (!actionItem || !this.activeContextMenuTarget || this.activeContextMenuTarget.type !== 'group') { /* ... */ return; }
        const action = actionItem.dataset.action;
        const groupId = this.activeContextMenuTarget.id;
        const groupElement = this.activeContextMenuTarget.element;
        const groupData = this._findGroupData(groupId);
        this._hideContextMenu();
        if (!groupData || !groupElement) return;

        console.log(`DEBUG: Group Action: ${action} on Group: ${groupId}`);
        switch (action) {
             case 'toggle-layout': await this._handleToggleGroupLayout(groupId, groupData, groupElement); break;
             // REMOVED: case 'toggle-resize-move': this._handleToggleGroupResizeMove(); break;
             case 'change-color': this._handleOpenGroupColorPicker(groupId, groupData); break;
             case 'ungroup': await this._handleUngroupChapters(groupId, groupElement); break;
             case 'rename': this._handleRename(groupElement, 'group'); break;
             case 'set-sort': this._handleOpenGroupSortModal(groupId, groupData); break;
             default: console.warn(`Unknown group action: ${action}`);
        }
    }

    async _handleChapterContextMenuClick(event) {
        // ... (Logic to get action, chapterId, chapterData, hide menu) ...
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
            case 'pin': await this._handleTogglePinChapter(chapterId, chapterElement); break;
            case 'suspend': await this._handleToggleSuspendChapter(chapterId, chapterElement); break;
            case 'add-tag': this._handleOpenChapterTagSelector(chapterId, chapterData); break; // <= IMPLEMENTED
            case 'delete': await this._handleDeleteChapter(chapterElement, chapterData.name); break;
            default: console.warn(`Unknown chapter action: ${action}`);
        }
    }

    _handleDeleteChapter(cardElement) {
        if (!cardElement || this.isLoading.delete) return;
        const chapterName = cardElement.dataset.chapterName;
        if (!chapterName) return;

        this.contextMenuTargetChapter = chapterName; // Store for cleanup
        cardElement.classList.add('confirming-delete'); // Add pulsing animation

        this._showModal(
            'confirmationModal', 'Delete Chapter?',
            `Permanently delete <strong>"${chapterName}"</strong> and all associated cards? This cannot be undone.`,
            [
                { text: 'Cancel', class: 'secondary', action: () => {
                        cardElement.classList.remove('confirming-delete');
                        this.contextMenuTargetChapter = null;
                    }
                },
                { text: 'Delete Permanently', class: 'primary', action: () => {
                        // _hideModal will remove confirming-delete class
                        this._executeDeleteChapter(cardElement, chapterName);
                    }
                }
            ], 'warning'
        );
    }

    async _executeDeleteChapter(cardElement, chapterName) {
        console.log(`Attempting to delete chapter '${chapterName}' in material '${this.currentMaterial}'`);
        this._updateLoadingState('delete', true);
        cardElement.style.pointerEvents = 'none'; // Prevent interaction

        try {
            await apiClient.deleteChapter(this.currentMaterial, chapterName);
            console.log("Deletion successful for:", chapterName);

            cardElement.classList.add('fading-out');
            cardElement.addEventListener('animationend', () => {
                cardElement.remove(); // Remove from DOM after fade
                // Update internal data
                this.chaptersData = this.chaptersData.filter(ch => ch.chapter !== chapterName);
                // Re-render heatmap to remove cell
                this._renderHeatmap(this.chaptersData);
                // Optional: Update overall stats if needed
                 this._showInfoMessage(`Chapter "${chapterName}" deleted.`);
            }, { once: true });

        } catch (error) {
            console.error("Failed to delete chapter via API:", error);
            this._showError(`Could not delete chapter: ${error.message}`);
            cardElement.style.pointerEvents = ''; // Re-enable on error
            cardElement.classList.remove('confirming-delete', 'fading-out'); // Remove animations
        } finally {
            this._updateLoadingState('delete', false);
            this.contextMenuTargetChapter = null;
        }
    }

    /** Handles toggling group layout mode */
    async _handleToggleGroupLayout(groupId, groupData, groupElement) {
        console.log(`DEBUG: Toggling layout for group ${groupId}`); // DEBUG
        const newMode = groupData.layoutMode === 'card' ? 'list' : 'card';
        this._updateLoadingState('action', true);
        try {
             await apiClient.updateGroup(groupId, { layoutMode: newMode });
             groupData.layoutMode = newMode; // Update local data

             // Re-render just the content of this group widget
              const widgetContent = groupElement.querySelector('.grid-stack-item-content');
              const chapterArea = widgetContent?.querySelector('.group-chapter-area');
              if (widgetContent && chapterArea) {
                    chapterArea.className = `group-chapter-area layout-${newMode} scrollable`;
                    chapterArea.innerHTML = ''; // Clear old items
                    const chapters = this.chaptersByGroup[groupId] || [];
                     console.log(`DEBUG: Re-rendering ${chapters.length} chapters in new layout '${newMode}'`); // DEBUG
                    if (chapters.length > 0) {
                        const fragment = document.createDocumentFragment();
                         chapters.forEach(chapter => {
                              const chapterItemElement = this._renderChapterItem(chapter, {
                                   layout: newMode,
                                   containerSize: groupData.gridSize
                              });
                              if (chapterItemElement) fragment.appendChild(chapterItemElement);
                         });
                         chapterArea.appendChild(fragment);
                    } else {
                         chapterArea.innerHTML = EMPTY_GROUP_TEXT;
                    }
                    // Update the widget's data attribute as well
                    groupElement.dataset.layoutMode = newMode;
              } else {
                   console.warn("Could not find chapter area to re-render layout for group", groupId); // DEBUG
                   // Fallback: Full layout refresh might be needed if structure is broken
                   // this._renderDashboardLayout();
              }
             this._showInfoMessage(`Group layout changed to ${newMode}.`);
        } catch (error) { /* ... error handling ... */ }
        finally { this._updateLoadingState('action', false); }
    }

     /** Handles toggling group resize/move mode */
     _handleToggleGroupResizeMove() {
        this.isGroupResizeMoveMode = !this.isGroupResizeMoveMode;
        console.log("DEBUG: Group Resize/Move Mode:", this.isGroupResizeMoveMode); // DEBUG
        this._updateGridEditMode(); // Apply changes to Gridstack items
        this._showInfoMessage(`Group move/resize ${this.isGroupResizeMoveMode ? 'enabled' : 'disabled'}.`);
   }

    _updateGridEditMode() {
        if (!this.gridInstance) return;
        // Enable/disable interactions globally first
        this.gridInstance.enableMove(this.isGroupResizeMoveMode);
        this.gridInstance.enableResize(this.isGroupResizeMoveMode);

        // Selectively disable for non-group items if needed
        this.gridInstance.getGridItems().forEach(item => {
             const isGroup = item.classList.contains('group-widget');
             if (!isGroup) {
                  // Ensure standalone chapters are *never* draggable/resizable by user in this mode
                  this.gridInstance.movable(item, false);
                  this.gridInstance.resizable(item, false);
             } else {
                  // Ensure groups *are* interactive when mode is on
                  this.gridInstance.movable(item, this.isGroupResizeMoveMode);
                  this.gridInstance.resizable(item, this.isGroupResizeMoveMode);
             }
        });

        // Add/remove class to main container for visual cues
        this.dashboardGridContainer.classList.toggle('group-edit-mode', this.isGroupResizeMoveMode);
   }

     /** Opens the modal to set sort preference for a group */
     _handleOpenGroupSortModal(groupId, groupData) {
        console.log("DEBUG: Opening group sort modal for:", groupId); // DEBUG
        if (!this.groupSortModalOverlay || !this.groupSortFieldSelect || !this.groupSortOrderSelect) { return; }
        this.groupSortModalGroupId = groupId;
        const currentPref = groupData.sortPreference || this.currentSort;
        this.groupSortFieldSelect.value = currentPref.field;
        this.groupSortOrderSelect.value = currentPref.order;
        this._showModal('groupSortModal');
   }
    /** Confirms and saves group sort preference */
    async _handleGroupSortConfirm() {
        const groupId = this.groupSortModalGroupId;
        const field = this.groupSortFieldSelect?.value;
        const order = this.groupSortOrderSelect?.value;
        if (!groupId || !field || !order) return;

        console.log(`DEBUG: Confirming group sort for ${groupId}: ${field} ${order}`); // DEBUG
        this._hideModal('groupSortModal');
        this._updateLoadingState('action', true);
        try {
             const result = await apiClient.setGroupSortPreference(groupId, field, order);
             const groupData = this._findGroupData(groupId);
             if (groupData) groupData.sortPreference = result.group.sortPreference;
             await this._fetchAndRenderGroupChapters(groupId); // Refresh chapters with new sort
             this._showInfoMessage(`Sort preference updated for group "${groupData?.name || groupId}".`);
        } catch (error) { /* ... error handling ... */ }
        finally { this._updateLoadingState('action', false); this.groupSortModalGroupId = null; }
    }

     /** Handles ungrouping chapters */
     async _handleUngroupChapters(groupId, groupElement) {
        const groupData = this._findGroupData(groupId);
        const chapterCount = groupData?.stats?.chapterCount || (this.chaptersByGroup[groupId]?.length || 0);
        const groupName = groupData?.name || groupId;

         this._showModal('confirmationModal', 'Ungroup Chapters?',
             `Remove all ${chapterCount} chapters from "${groupName}" and delete the group? Chapters will not be deleted.`,
             [
                  { text: 'Cancel', class: 'secondary', action: () => {} },
                  { text: 'Ungroup & Delete Group', class: 'primary', action: async () => {
                       this._updateLoadingState('action', true);
                       try {
                           await apiClient.deleteGroup(groupId);
                            // Find chapters that were in this group (using cached ID before removing group data)
                            const chaptersToMove = this.chaptersByGroup[groupId] || [];
                            // Remove group from local state
                            this.groupsData = this.groupsData.filter(g => g.id !== groupId);
                            delete this.chaptersByGroup[groupId];
                            // Update chapter state and add to ungrouped
                            chaptersToMove.forEach(ch => {
                                 const chapterData = this._findChapterData(ch.id); // Find in flat map
                                 if(chapterData) chapterData.groupId = null;
                                 this.ungroupedChaptersData.push(chapterData || ch); // Add to ungrouped list
                            });
                            // Remove group widget from grid
                            if (this.gridInstance && groupElement) {
                                 this.gridInstance.removeWidget(groupElement);
                            }
                            // Re-render the moved chapters as standalone items
                            this._renderDashboardLayout(); // Easiest way to add them back correctly for now
                           this._showInfoMessage(`Group "${groupName}" deleted and chapters ungrouped.`);
                       } catch (error) {
                           console.error(`Failed to delete group ${groupId}:`, error);
                           this._showError(`Could not ungroup chapters: ${error.message}`);
                       } finally {
                           this._updateLoadingState('action', false);
                       }
                  }}
             ]);
    }

    // --- Pin / Suspend Handlers ---
     async _handleTogglePinChapter(chapterId, chapterElement) {
          const chapter = this._findChapterData(chapterId);
          if (!chapter) return;
          const shouldPin = !chapter.isPinned;
          this._updateLoadingState('action', true);
          try {
              const updatedChapter = shouldPin
                  ? await apiClient.pinChapter(chapterId)
                  : await apiClient.unpinChapter(chapterId);

              // Update local data
              chapter.isPinned = updatedChapter.chapter.isPinned; // Use response value
              // Update flat map cache
              if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isPinned = chapter.isPinned;

              // Update UI visually
               chapterElement?.classList.toggle('is-pinned', chapter.isPinned);
               this._showInfoMessage(`Chapter ${shouldPin ? 'pinned' : 'unpinned'}.`);

               // Refresh filtered view if currently filtering by pinned status
               if (this.currentFilter.type === 'pinned') {
                    this._renderFilteredView(this.currentFilter);
               }

          } catch (error) {
               console.error(`Failed to ${shouldPin ? 'pin' : 'unpin'} chapter ${chapterId}:`, error);
               this._showError(`Could not ${shouldPin ? 'pin' : 'unpin'} chapter: ${error.message}`);
          } finally {
               this._updateLoadingState('action', false);
          }
     }

     async _handleToggleSuspendChapter(chapterId, chapterElement) {
          const chapter = this._findChapterData(chapterId);
          if (!chapter) return;
          const shouldSuspend = !chapter.isSuspended;
          this._updateLoadingState('action', true);
          try {
              const updatedChapter = shouldSuspend
                  ? await apiClient.suspendChapter(chapterId)
                  : await apiClient.unsuspendChapter(chapterId);

              // Update local data
              chapter.isSuspended = updatedChapter.chapter.isSuspended;
               // Update flat map cache
              if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isSuspended = chapter.isSuspended;

              this._showInfoMessage(`Chapter ${shouldSuspend ? 'suspended' : 'unsuspended'}.`);

              // Remove/Add from current view (dashboard or filtered)
              if (shouldSuspend) {
                   // Remove from view
                   if (this.gridInstance && chapterElement) {
                        this.gridInstance.removeWidget(chapterElement);
                   }
                   // Also remove from local lists for current view
                   this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
                   if (chapter.groupId && this.chaptersByGroup[chapter.groupId]) {
                        this.chaptersByGroup[chapter.groupId] = this.chaptersByGroup[chapter.groupId].filter(c => c.id !== chapterId);
                         // TODO: Re-render the parent group to update its chapter list/count?
                   }
              } else {
                   // Chapter unsuspended - need to add it back to the correct place
                   // Easiest is often to just refresh the relevant part of the view
                   if (this.currentFilter.type === 'suspended') {
                        // If viewing suspended, refresh the filtered view
                         this._renderFilteredView(this.currentFilter);
                   } else if (this.currentFilter.type === 'all') {
                        // If viewing dashboard, add it back
                        if (chapter.groupId) {
                             // Add back to group and re-render group?
                             await this._fetchAndRenderGroupChapters(chapter.groupId); // Fetch fresh data for group
                        } else {
                             // Add back to ungrouped and render it
                             await this._fetchAndRenderUngroupedChapters(); // Fetch fresh ungrouped data
                        }
                   }
              }

          } catch (error) {
               console.error(`Failed to ${shouldSuspend ? 'suspend' : 'unsuspend'} chapter ${chapterId}:`, error);
               this._showError(`Could not ${shouldSuspend ? 'suspend' : 'unsuspend'} chapter: ${error.message}`);
          } finally {
               this._updateLoadingState('action', false);
          }
     }

    /** Opens the modal/UI to select tags for a chapter */
    _handleOpenChapterTagSelector(chapterId, chapterData) {
        console.log("DEBUG: Opening tag selector for chapter", chapterId);
        if (!this.tagSelectorModalOverlay || !this.tagSelectorList || !this.tagSelectorConfirmButton) {
             this._showError("Tag selector UI elements not found."); return;
        }
        if (!chapterData) { console.error("Chapter data not found for tag selector:", chapterId); return; }

        this.activeTagSelectorTarget = { type: 'chapter', id: chapterId, element: this._findChapterElement(chapterId) }; // Store target
        const currentTags = new Set(chapterData.tags || []);

        // Populate list with checkboxes
        this.tagSelectorList.innerHTML = ''; // Clear previous
        if (this.availableTags.length === 0) {
             this.tagSelectorList.innerHTML = '<li>No tags available. Create tags first.</li>';
        } else {
             this.availableTags.sort().forEach(tag => {
                  const li = document.createElement('li');
                  const checkboxId = `tag-select-${tag.replace(/\s+/g, '-')}-${chapterId}`; // Unique ID
                  li.innerHTML = `
                       <input type="checkbox" id="${checkboxId}" value="${tag}" ${currentTags.has(tag) ? 'checked' : ''}>
                       <label for="${checkboxId}">${tag}</label>
                  `;
                  this.tagSelectorList.appendChild(li);
             });
        }

        // TODO: Show modal
        this._showModal('tagSelectorModal'); // Need this modal ID in HTML
     }

          /** Handles confirming the tag selection for a chapter */
     /** MODIFIED: Handles both single and bulk tag updates */
     async _handleConfirmChapterTags() {
        if (!this.tagSelectorList) return;

        const isBulkMode = !this.activeTagSelectorTarget; // Check if we're in bulk mode
        const chapterIdsToUpdate = isBulkMode
             ? this.bulkActionTargetIds || []
             : [this.activeTagSelectorTarget?.id];

        if (!chapterIdsToUpdate || chapterIdsToUpdate.length === 0 || chapterIdsToUpdate[0] === null) {
            console.warn("DEBUG: No target chapter ID found for tag confirmation."); // DEBUG
            this._hideModal('tagSelectorModal'); return;
        }

        const tagsSelectedInModal = [];
        this.tagSelectorList.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
             tagsSelectedInModal.push(checkbox.value);
        });
        tagsSelectedInModal.sort();

        console.log(`DEBUG: Confirming tags for ${isBulkMode ? 'BULK' : chapterIdsToUpdate[0]}:`, tagsSelectedInModal); // DEBUG
        this._hideModal('tagSelectorModal');

        this._updateLoadingState('action', true);
        let errorsOccurred = false;

        const promises = chapterIdsToUpdate.map(async (chapterId) => {
             const chapterData = this._findChapterData(chapterId);
             if (!chapterData) { console.warn(`Skipping tag update for missing chapter ${chapterId}`); return; }

             const currentTagsSorted = (chapterData.tags || []).sort();
             let finalTags;

             if (isBulkMode) {
                  // Bulk mode: ADD selected tags to current tags
                   finalTags = Array.from(new Set([...(chapterData.tags || []), ...tagsSelectedInModal])).sort();
             } else {
                  // Single mode: REPLACE tags with selection
                  finalTags = tagsSelectedInModal;
             }

             // Check if tags actually changed for this chapter
             if (JSON.stringify(finalTags) !== JSON.stringify(currentTagsSorted)) {
                   try {
                        const materialName = chapterData.material || this.currentMaterial;
                        if (!materialName) throw new Error(`Material name missing for chapter ${chapterId}`);
                        await apiClient.setChapterTags(materialName, chapterId, finalTags);
                        chapterData.tags = finalTags; // Update local data
                   } catch (error) {
                        console.error(`Failed to update tags for chapter ${chapterId}:`, error); // DEBUG
                        errorsOccurred = true; // Mark error
                   }
             }
        });

        await Promise.allSettled(promises); // Wait for all updates

        this._updateLoadingState('action', false);
        this.activeTagSelectorTarget = null; // Clear single target
        this.bulkActionTargetIds = null; // Clear bulk targets

        if (errorsOccurred) {
             this._showError("Some chapter tags could not be updated.");
        } else {
             this._showInfoMessage(`Chapter tags updated for ${chapterIdsToUpdate.length} chapter(s).`);
        }
         // Exit selection mode if bulk action succeeded
         if (isBulkMode && !errorsOccurred && this.isSelectionModeActive) {
              this._handleToggleSelectionMode();
         }
    }


   async _handleDeleteChapter(chapterElement, chapterName) { // Now receives element and name
    const chapterId = chapterElement?.dataset.chapterId;
    if (!chapterId || !chapterName || this.isLoading.action) return;

    this._showModal('confirmationModal', 'Delete Chapter?',
        `Permanently delete chapter "${chapterName}" and all its cards? This cannot be undone.`,
        [
             { text: 'Cancel', class: 'secondary', action: () => {} },
             { text: 'Delete Permanently', class: 'primary', action: async () => {
                  this._updateLoadingState('action', true);
                  chapterElement.style.pointerEvents = 'none'; // Prevent interaction
                  try {
                       // API needs material and chapter NAME
                       await apiClient.deleteChapter(this.currentMaterial, chapterName);
                       console.log(`Deletion successful for chapter: ${chapterName} (ID: ${chapterId})`);

                       // Remove from local state
                       const chapterData = this._findChapterData(chapterId);
                       if (chapterData?.groupId) {
                            if (this.chaptersByGroup[chapterData.groupId]) {
                                 this.chaptersByGroup[chapterData.groupId] = this.chaptersByGroup[chapterData.groupId].filter(c => c.id !== chapterId);
                                 // TODO: Optionally re-render group or trigger group stat recalc?
                            }
                       } else {
                            this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
                       }
                       delete this.allChaptersData[chapterId]; // Remove from flat map

                       // Remove widget from grid
                        if (this.gridInstance) {
                             this.gridInstance.removeWidget(chapterElement); // Remove from Gridstack layout
                        } else {
                             chapterElement.remove(); // Fallback removal
                        }

                       this._showInfoMessage(`Chapter "${chapterName}" deleted.`);
                       // TODO: Refresh overview section data (mastery heatmap, timeline)?
                       await this._loadOverviewData();


                  } catch (error) {
                       console.error(`Failed to delete chapter ${chapterName}:`, error);
                       this._showError(`Could not delete chapter: ${error.message}`);
                       chapterElement.style.pointerEvents = '';
                  } finally {
                       this._updateLoadingState('action', false);
                  }
             }}
        ], 'warning'
    );
}

    // --- Tag Management Modal Handlers ---
     _handleOpenTagManagementModal() {
         console.log("Opening Tag Management Modal");
         if (!this.tagManagementModalOverlay || !this.existingTagsList || !this.newTagNameInput) return;

         // Populate existing tags list
         this.existingTagsList.innerHTML = ''; // Clear previous
         if (this.availableTags.length === 0) {
             this.existingTagsList.innerHTML = '<li>No tags created yet.</li>';
         } else {
             this.availableTags.sort().forEach(tag => {
                 const li = document.createElement('li');
                 li.innerHTML = `
                      <span>${tag}</span>
                      <button class="delete-tag-btn" data-tag-name="${tag}" title="Delete tag">&times;</button>
                 `;
                 // Add listener directly to button
                 li.querySelector('.delete-tag-btn')?.addEventListener('click', () => this._handleDeleteTag(tag));
                 this.existingTagsList.appendChild(li);
             });
         }

         this.newTagNameInput.value = ''; // Clear input
         this._showModal('tagManagementModal'); // Show the modal (assumes modal ID matches)
     }
    

     
    /** MODIFIED: Handles clicks on grid items for navigation OR selection */    /** MODIFIED: Handles all clicks on the grid container */
     _handleGridItemClick(event) {
        const targetChapterItem = event.target.closest('.chapter-item');
        const targetGroupItem = event.target.closest('.group-widget.grid-stack-item');

        if (this.isSelectionModeActive) {
             // Handle selection clicks (allows selecting chapters OR groups based on flag)
             this._handleSelectionClick(event);
        } else if (targetChapterItem && !event.target.closest('.rename-input, button, a')) {
             // Handle navigation click on a chapter
             const chapterName = targetChapterItem.dataset.chapterName;
             this._navigateToChapterDetails(chapterName);
        } else if (targetGroupItem && !event.target.closest('.rename-input, button, a, .chapter-item')) {
            // Handle click on group header/background (do nothing for now)
            console.log("DEBUG: Click on group header/background:", targetGroupItem.dataset.groupId);
        }
    }
    // --- Selection Mode ---
    _handleToggleSelectionMode(forceState = null) { // Allow forcing state
        const targetState = forceState !== null ? forceState : !this.isSelectionModeActive;
        if (targetState === this.isSelectionModeActive) return; // No change

        this.isSelectionModeActive = targetState;
        console.log("DEBUG: Selection Mode Active:", this.isSelectionModeActive);
        this.container?.classList.toggle('selection-mode-active', this.isSelectionModeActive);
        if (!this.isSelectionModeActive) { // Clear selection when exiting
             this.selectedItemIds = { chapters: new Set(), groups: new Set() };
        }

        this._renderTagPills(); // Update buttons

        // Clear visual styles & manage cursor/interactions
        this.dashboardGridContainer?.querySelectorAll('.is-selected').forEach(el => el.classList.remove('is-selected'));
        this.dashboardGridContainer?.querySelectorAll('.grid-stack-item').forEach(el => {
             el.classList.toggle('selectable', this.isSelectionModeActive);
        });

        // Manage grid interactions - Disable ALL grid interactions during selection
        if (this.gridInstance) {
             if (this.isSelectionModeActive) {
                  this.gridInstance.disable(); // Disable move/resize
                  console.log("DEBUG: Grid interactions disabled for selection.");
             } else {
                  // Re-enable ONLY groups on exiting selection mode
                  this.gridInstance.enable(); // Enable global first
                  this.gridInstance.getGridItems().forEach(item => {
                       const isGroup = item.classList.contains('group-widget');
                       this.gridInstance.movable(item, isGroup);
                       this.gridInstance.resizable(item, isGroup);
                  });
                  console.log("DEBUG: Grid interactions re-enabled (groups only).");
             }
        }
        if (this.selectionToolbar) this.selectionToolbar.style.display = this.isSelectionModeActive ? 'flex' : 'none';
        if(this.isSelectionModeActive) this._updateSelectionToolbar();
    }

        /** Handles clicks on grid items when selection mode is active */
    /** Click handler specifically for selecting items in selection mode */
    // _handleSelectionClick (Implementation okay)
         /** MODIFIED: Handles selection clicks based on current flow (general or group creation) */
         _handleSelectionClick(event) {
            if (!this.isSelectionModeActive) return;
            const targetItemElement = event.target.closest('.chapter-item, .group-widget');
            if (!targetItemElement) return;
  
            event.stopPropagation();
  
            const chapterId = targetItemElement.dataset.chapterId;
            const groupId = targetItemElement.dataset.groupId;
            let idToToggle = null;
            let type = null; // 'chapters' or 'groups'
  
                      // Check if the Create Group modal is currently visible
          const isCreatingGroupFlow = this.createGroupModalOverlay?.classList.contains('visible');

          if (isCreatingGroupFlow) {
               // ** Only allow selecting CHAPTERS when creating a group **
               if (chapterId) {
                    idToToggle = chapterId; type = 'chapters';
               } else {
                    console.log("DEBUG: Cannot select groups while Create Group modal is open."); // DEBUG
                    this._showInfoMessage("Please select only chapters for the new group.", "Info", true); // Temporary info
                    return; // Don't select groups
               }
          } else {
               // General selection mode: select chapter or group
                if (groupId && targetItemElement.classList.contains('group-widget')) {
                     idToToggle = groupId; type = 'groups';
                } else if (chapterId) {
                     idToToggle = chapterId; type = 'chapters';
                }
          }
  
  
            if (idToToggle && type) {
                 const currentSet = this.selectedItemIds[type];
                 const visualElement = targetItemElement.classList.contains('grid-stack-item') ? targetItemElement : targetItemElement.closest('.grid-stack-item');
                 const isSelected = currentSet.has(idToToggle);
  
                 if (isSelected) {
                      currentSet.delete(idToToggle);
                      visualElement?.classList.remove('is-selected');
                 } else {
                      currentSet.add(idToToggle);
                      visualElement?.classList.add('is-selected');
                 }
                 console.log("DEBUG: Selection updated:", this.selectedItemIds);
                 this._updateSelectionToolbar(); // Update count and button states
            }
       }

    /** MODIFIED: Opens tag selector in bulk mode */
    _handleBulkTagChapters() {
        const chapterIds = Array.from(this.selectedItemIds.chapters);
        if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected to tag."); return; }

        console.log("DEBUG: Opening tag selector for BULK edit", chapterIds); // DEBUG
        if (!this.tagSelectorModalOverlay || !this.tagSelectorList || !this.tagSelectorConfirmButton) {
            this._showError("Tag selector UI elements not found."); return;
        }

        // Clear active target, signaling bulk mode to confirm handler
        this.activeTagSelectorTarget = null;
        // Store selected IDs for the confirm handler
        this.bulkActionTargetIds = chapterIds;

        // Populate list - DO NOT pre-check based on individual chapter
        this.tagSelectorList.innerHTML = '';
        if (this.availableTags.length === 0) { /* ... show no tags message ... */ return; }

        this.availableTags.sort().forEach(tag => {
             const li = document.createElement('li');
             const checkboxId = `tag-select-bulk-${tag.replace(/\s+/g, '-')}`;
             li.innerHTML = `
                  <input type="checkbox" id="${checkboxId}" value="${tag}">
                  <label for="${checkboxId}">${tag}</label>
             `;
             this.tagSelectorList.appendChild(li);
        });

        // Change modal title for clarity
        const titleEl = this.tagSelectorModalOverlay.querySelector('.modal-title');
        if(titleEl) titleEl.textContent = `Add Tags to ${chapterIds.length} Chapters`;

        this._showModal('tagSelectorModal');
   }

async _handleBulkPinChapters() {
    const chapterIds = Array.from(this.selectedItemIds.chapters);
    if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected."); return; }
    // Ask user whether to Pin or Unpin
    this._showModal('confirmationModal', 'Pin/Unpin Selected?', `Do you want to Pin or Unpin the ${chapterIds.length} selected chapters?`, [
         { text: 'Cancel', class: 'secondary' },
         { text: 'Unpin', class: 'secondary', action: () => this._executeBulkPinToggle(chapterIds, false) }, // isPinned = false
         { text: 'Pin', class: 'primary', action: () => this._executeBulkPinToggle(chapterIds, true) }        // isPinned = true
    ]);
}
async _executeBulkPinToggle(chapterIds, shouldPin) {
    this._updateLoadingState('action', true); let errorsOccurred = false;
    const actionVerb = shouldPin ? 'Pinning' : 'Unpinning';
    const apiCall = shouldPin ? apiClient.pinChapter : apiClient.unpinChapter;
    console.log(`DEBUG: ${actionVerb} ${chapterIds.length} chapters.`);

    const promises = chapterIds.map(async id => {
         try {
              const result = await apiCall(id);
              const chapter = this._findChapterData(id);
              if(chapter) chapter.isPinned = result.chapter.isPinned;
              // Update UI directly
              this._findChapterElement(id)?.classList.toggle('is-pinned', result.chapter.isPinned);
         } catch (e) { errorsOccurred = true; console.error(`${actionVerb} error for ${id}:`, e); }
    });
    await Promise.allSettled(promises);

    this._updateLoadingState('action', false);
    if (errorsOccurred) this._showError(`Some chapters could not be ${shouldPin ? 'pinned' : 'unpinned'}.`);
    else this._showInfoMessage(`Selected chapters ${shouldPin ? 'pinned' : 'unpinned'}.`);
    this._handleToggleSelectionMode(); // Exit selection mode
    // Refresh if viewing pinned filter
    if (this.currentFilter.type === 'pinned') this._renderFilteredView(this.currentFilter);
}


async _handleBulkSuspendChapters() {
   const chapterIds = Array.from(this.selectedItemIds.chapters);
   if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected."); return; }
   this._showModal('confirmationModal', 'Suspend/Unsuspend?', `Do you want to Suspend or Unsuspend the ${chapterIds.length} selected chapters?`, [
        { text: 'Cancel', class: 'secondary' },
        { text: 'Unsuspend', class: 'secondary', action: () => this._executeBulkSuspendToggle(chapterIds, false) },
        { text: 'Suspend', class: 'primary', action: () => this._executeBulkSuspendToggle(chapterIds, true) }
   ]);
}
async _executeBulkSuspendToggle(chapterIds, shouldSuspend) {
    this._updateLoadingState('action', true); let errorsOccurred = false;
    const actionVerb = shouldSuspend ? 'Suspending' : 'Unsuspending';
    const apiCall = shouldSuspend ? apiClient.suspendChapter : apiClient.unsuspendChapter;
    console.log(`DEBUG: ${actionVerb} ${chapterIds.length} chapters.`);

    const promises = chapterIds.map(async id => {
         try {
              const result = await apiCall(id);
              const chapter = this._findChapterData(id);
              if(chapter) chapter.isSuspended = result.chapter.isSuspended;
              // Remove/re-add element from UI immediately
              const element = this._findChapterElement(id);
              if (element && this.gridInstance?.isWidget(element)) {
                   if (shouldSuspend) this.gridInstance.removeWidget(element);
                   // Re-adding on unsuspend is handled by refresh below
              } else { element?.remove(); }
         } catch (e) { errorsOccurred = true; console.error(`${actionVerb} error for ${id}:`, e); }
    });
    await Promise.allSettled(promises);

    this._updateLoadingState('action', false);
    if (errorsOccurred) this._showError(`Some chapters could not be ${shouldSuspend ? 'suspended' : 'unsuspended'}.`);
    else this._showInfoMessage(`Selected chapters ${shouldSuspend ? 'suspended' : 'unsuspended'}.`);

    // Refresh the current view to reflect removals/additions
    if (this.currentFilter.type === 'all') this._renderDashboardLayout(); // Refresh dashboard
    else this._renderFilteredView(this.currentFilter); // Refresh filter

    this._handleToggleSelectionMode(); // Exit selection mode
}


    /** MODIFIED: Handles bulk grouping via selection toolbar */
    async _handleBulkGroupChapters() {
         const chapterIds = Array.from(this.selectedItemIds.chapters);
         if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected."); return; }

         // For simplicity, directly create a new group with default settings
         const defaultGroupName = `New Group (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
         console.log(`DEBUG: Bulk creating group "${defaultGroupName}" for ${chapterIds.length} chapters.`); // DEBUG

         this._updateLoadingState('action', true);
         let newGroup = null;
         let errorsOccurred = false;

         try {
              // 1. Create Group
               newGroup = await apiClient.createGroup(this.currentMaterial, {
                   name: defaultGroupName,
                   layoutMode: 'card',
                   gridSize: { rows: 2, cols: 2 }, // Default 2x2 size
                   sortPreference: { field: 'stats.mastery', order: 'asc' } // Default sort
               });
               this.groupsData.push(newGroup);
               this.chaptersByGroup[newGroup.id] = [];

              // 2. Assign Chapters
               const assignPromises = chapterIds.map(async (chapterId) => {
                   try {
                        const chapter = this._findChapterData(chapterId);
                        const originalGroupId = chapter?.groupId || null;
                        await apiClient.assignChapterToGroup(chapterId, newGroup.id);
                        this._moveChapterLocally(chapterId, originalGroupId, newGroup.id);
                   } catch (assignError) {
                        console.error(`Failed to assign chapter ${chapterId} to bulk group ${newGroup.id}`, assignError);
                        errorsOccurred = true;
                   }
               });
               await Promise.allSettled(assignPromises);

               // 3. Refresh layout
               this._renderDashboardLayout(); // Render new group and remove old chapter widgets

               // 4. Activate rename & edit mode
               setTimeout(() => {
                    const newGroupElement = this._findGroupElement(newGroup.id);
                    if (newGroupElement) this._handleRename(newGroupElement, 'group');
                    newGroupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
               }, 100);

               if (errorsOccurred) this._showError("Group created, but some chapters could not be added.");
               // else this._showInfoMessage(`Group "${defaultGroupName}" created with selected chapters.`);

         } catch (error) {
              console.error("Failed to bulk create group:", error);
              this._showError(`Could not create group: ${error.message}`);
              if (newGroup?.id) this.groupsData = this.groupsData.filter(g => g.id !== newGroup.id); // Clean up local data on failure
         } finally {
              this._updateLoadingState('action', false);
              // Exit selection mode regardless of success/failure if initiated
              if (this.isSelectionModeActive) this._handleToggleSelectionMode();
         }
    }

async _handleBulkDeleteChapters() {
    const chapterIds = Array.from(this.selectedItemIds.chapters);
    if (chapterIds.length === 0) { this._showInfoMessage("No chapters selected to delete."); return; }

    this._showModal('confirmationModal', `Delete ${chapterIds.length} Chapters?`,
         `Permanently delete the ${chapterIds.length} selected chapters and all their cards? This cannot be undone.`,
         [
              { text: 'Cancel', class: 'secondary' },
              { text: 'Delete Selected', class: 'primary', action: async () => {
                   this._updateLoadingState('action', true); let errorsOccurred = false;
                   console.log(`DEBUG: Deleting ${chapterIds.length} chapters.`);
                   const promises = chapterIds.map(async id => {
                        try {
                             const chapter = this._findChapterData(id);
                             if (!chapter) return; // Skip if data missing
                              const chapterElement = this._findChapterElement(id);
                             await apiClient.deleteChapter(this.currentMaterial, chapter.name); // API uses name
                             // Remove locally
                              if (chapter.groupId && this.chaptersByGroup[chapter.groupId]) this.chaptersByGroup[chapter.groupId] = this.chaptersByGroup[chapter.groupId].filter(c => c.id !== id);
                              this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== id);
                              delete this.allChaptersData[id];
                              if (this.gridInstance && chapterElement && this.gridInstance.isWidget(chapterElement)) this.gridInstance.removeWidget(chapterElement);
                              else chapterElement?.remove();
                        } catch (e) { errorsOccurred = true; console.error(`Delete error for ${id}:`, e); }
                   });
                   await Promise.allSettled(promises);
                   this._updateLoadingState('action', false);
                   if (errorsOccurred) this._showError("Some chapters could not be deleted.");
                   else this._showInfoMessage(`${chapterIds.length} chapters deleted.`);
                   this._handleToggleSelectionMode(); // Exit selection
                    await this._loadOverviewData(); // Refresh overview after deletion
              }}
         ], 'warning'
    );
}

        /** Click handler for item navigation when NOT in selection mode */
        _handleItemNavigationClick(event) {
            if (this.isSelectionModeActive) return; // Should have been removed, but safety check
            const targetItem = event.target.closest('.grid-stack-item');
            if (!targetItem) return;
  
            const chapterId = targetItem.dataset.chapterId;
            const chapterName = targetItem.dataset.chapterName; // Get name for navigation
  
            if (chapterId && chapterName && !event.target.closest('.rename-input')) { // Don't navigate if clicking rename input
                 event.stopPropagation();
                 this._navigateToChapterDetails(chapterName);
            }
            // Add navigation for groups later if needed
       }

          /** Updates the text content of the selection toolbar */
    _updateSelectionToolbar() {
        if (!this.selectionToolbar) return;
        const chapterCount = this.selectedItemIds.chapters.size;
        const groupCount = this.selectedItemIds.groups.size;
        const totalSelected = chapterCount + groupCount;
        const countSpan = this.selectionToolbar.querySelector('#selectionCount');

        let text = `${totalSelected} item${totalSelected !== 1 ? 's' : ''} selected`;
        if (chapterCount > 0 && groupCount > 0) {
             text = `${chapterCount} chapter${chapterCount !== 1 ? 's' : ''}, ${groupCount} group${groupCount !== 1 ? 's' : ''} selected`;
        } else if (chapterCount > 0) {
             text = `${chapterCount} chapter${chapterCount !== 1 ? 's' : ''} selected`;
        } else if (groupCount > 0) {
             text = `${groupCount} group${groupCount !== 1 ? 's' : ''} selected`;
        }

         // Enable/disable bulk action buttons
         const canTag = chapterCount > 0;
         const canPinSuspend = chapterCount > 0;
         // Can group if > 0 chapters selected AND NOT currently in group creation selection phase
         const canGroup = chapterCount > 0 && !this.isCreatingGroup;
         // Can delete if chapters selected
         const canDelete = chapterCount > 0;

         this.selectionToolbar.querySelector('#tagSelectedButton')?.toggleAttribute('disabled', !canTag);
         this.selectionToolbar.querySelector('#pinSelectedButton')?.toggleAttribute('disabled', !canPinSuspend);
         this.selectionToolbar.querySelector('#suspendSelectedButton')?.toggleAttribute('disabled', !canPinSuspend);
         // this.selectionToolbar.querySelector('#groupSelectedButton')?.toggleAttribute('disabled', !canGroup);
         this.selectionToolbar.querySelector('#groupSelectedButton')?.toggleAttribute('disabled', this.selectedItemIds.chapters.size === 0); // Enable based on chapter selection
         this.selectionToolbar.querySelector('#deleteSelectedButton')?.toggleAttribute('disabled', !canDelete);

         // Show/hide the "Confirm Group Selection" button
          if (this.confirmGroupSelectionButton) {
               this.confirmGroupSelectionButton.style.display = this.isCreatingGroup ? 'inline-block' : 'none';
               this.confirmGroupSelectionButton.toggleAttribute('disabled', chapterCount === 0);
          }
     }

   /** Handles clicks on buttons within the selection toolbar */
   _handleSelectionToolbarClick(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const action = button.id; // Use button ID as action identifier
        console.log("DEBUG: Selection Toolbar Action:", action);

        switch(action) {
             case 'tagSelectedButton':
                  this._handleBulkTagChapters();
                  break;
             case 'pinSelectedButton':
                  this._handleBulkPinChapters();
                  break;
             case 'suspendSelectedButton':
                  this._handleBulkSuspendChapters();
                  break;
             case 'groupSelectedButton':
                  this._handleBulkGroupChapters();
                  break;
             case 'deleteSelectedButton':
                  this._handleBulkDeleteChapters();
                  break;
             default:
                  console.warn("Unknown selection toolbar action:", action);
        }
   }

     async _handleCreateTag() {
          if (!this.newTagNameInput) return;
          const newTagName = this.newTagNameInput.value.trim();
          if (!newTagName) {
               this._showError("Tag name cannot be empty.", true); return;
          }
          if (this.availableTags.includes(newTagName)) {
               this._showError(`Tag "${newTagName}" already exists.`, true); return;
          }

          this._updateLoadingState('action', true);
          try {
               const result = await apiClient.createMaterialTag(this.currentMaterial, newTagName);
               this.availableTags = result.tags || this.availableTags; // Update local tags list from response
               this._renderTagPills(); // Re-render pills in main UI
               this._handleOpenTagManagementModal(); // Refresh modal content
               this.newTagNameInput.value = ''; // Clear input after success
               this._showInfoMessage(`Tag "${newTagName}" created.`);
          } catch (error) {
               console.error("Failed to create tag:", error);
               this._showError(`Could not create tag: ${error.message}`);
          } finally {
               this._updateLoadingState('action', false);
          }
     }

     async _handleDeleteTag(tagName) {
          if (!tagName) return;
          // Confirmation
          this._showModal('confirmationModal', 'Delete Tag?', `Are you sure you want to delete the tag "${tagName}"? This will only remove it from the available tag list, not from chapters already using it.`, [
               { text: 'Cancel', class: 'secondary', action: () => {} },
               { text: 'Delete Tag', class: 'primary', action: async () => {
                    this._updateLoadingState('action', true);
                    try {
                         const result = await apiClient.deleteMaterialTag(this.currentMaterial, tagName);
                         this.availableTags = result.tags || this.availableTags.filter(t => t !== tagName); // Update local list

                          // If the deleted tag was the current filter, reset filter
                          if (this.currentFilter.type === 'tag' && this.currentFilter.value === tagName) {
                               this.currentFilter = { type: 'all', value: null };
                               this._renderDashboardLayout(); // Show dashboard layout
                          }
                          this._renderTagPills(); // Re-render pills
                          this._handleOpenTagManagementModal(); // Refresh modal content
                         this._showInfoMessage(`Tag "${tagName}" deleted from list.`);
                    } catch (error) {
                         console.error(`Failed to delete tag ${tagName}:`, error);
                         this._showError(`Could not delete tag: ${error.message}`);
                    } finally {
                         this._updateLoadingState('action', false);
                    }
               }}
          ]);
     }

     // --- Group Creation Modal Handlers --

          /** Starts the 'direct create group' flow *
  
       /** Confirms chapter selection and opens the group creation modal */
       _handleConfirmGroupSelection() {
            if (!this.isCreatingGroup) return;
            const selectedChapters = this.selectedItemIds.chapters;
            if (selectedChapters.size === 0) {
                 this._showError("Please select at least one chapter to include in the new group.");
                 return;
            }
  
            console.log(`DEBUG: Confirming selection of ${selectedChapters.size} chapters for new group.`); // DEBUG
            // Store selected chapters for after modal confirmation
            this.groupCreateSelectedChapters = new Set(selectedChapters);
  
             // Hide instructions, reset toolbar buttons (except Confirm?), open modal
             if (this.groupCreationInstruction) this.groupCreationInstruction.style.display = 'none';
             this._handleOpenCreateGroupModal(); // Open the standard create group modal
             // Selection mode remains active until group is created or cancelled
       }
  
       /** MODIFIED: Handles confirming group creation AFTER modal */
   /** MODIFIED: Handles confirming group creation - reads selection */
   async _handleCreateGroupConfirm() {
    if (!this.newGroupNameInput) return;
    const name = this.newGroupNameInput.value.trim();
    const color = this.newGroupColorInput?.value || undefined;
    if (!name) { this._showError("Group name cannot be empty."); return; }

    // ** Get selected chapters from the CURRENT selection state **
    const chaptersToAssign = Array.from(this.selectedItemIds.chapters);

    console.log(`DEBUG: Confirming Create Group "${name}". Chapters selected: ${chaptersToAssign.length}`);
    this._hideModal('createGroupModal'); // Hide modal first
    this._updateLoadingState('action', true);
    let newGroup = null;
    let errorsOccurred = false; // Track assignment errors

    try {
        // 1. Create the group via API
        newGroup = await apiClient.createGroup(this.currentMaterial, { name, color });
        this.groupsData.push(newGroup);
        this.chaptersByGroup[newGroup.id] = [];

        // 2. Assign selected chapters
        if (chaptersToAssign.length > 0) {
            console.log(`DEBUG: Assigning ${chaptersToAssign.length} chapters to new group ${newGroup.id}`);
            const assignPromises = chaptersToAssign.map(async (chapterId) => {
                try {
                    const chapter = this._findChapterData(chapterId);
                    const originalGroupId = chapter?.groupId || null;
                    await apiClient.assignChapterToGroup(chapterId, newGroup.id);
                    this._moveChapterLocally(chapterId, originalGroupId, newGroup.id);
                } catch (assignError) {
                    console.error(`Failed to assign chapter ${chapterId} to group ${newGroup.id}`, assignError);
                    errorsOccurred = true; // Mark error
                }
            });
            await Promise.allSettled(assignPromises);
        }

        // 3. Exit selection mode FIRST
        if (this.isSelectionModeActive) {
             this._handleToggleSelectionMode(false); // Exit selection mode
        }

        // 4. Render the new layout
        this._renderDashboardLayout();

        // 5. Activate edit/rename modes
        // Delay needed for Gridstack to render
        setTimeout(() => {
            const newGroupElement = this._findGroupElement(newGroup.id);
            if (newGroupElement) {
                this._handleRename(newGroupElement, 'group'); // Activate rename
                 // Scroll to the new group? Optional.
                 newGroupElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 150); // Adjust delay if needed

        if (errorsOccurred) this._showError("Group created, but some chapters could not be added.");
        else this._showInfoMessage(`Group "${name}" created.`);

    } catch (error) {
        console.error("Failed to create group or assign chapters:", error);
        this._showError(`Could not create group: ${error.message}`);
        if (newGroup?.id) this.groupsData = this.groupsData.filter(g => g.id !== newGroup.id);
         // Ensure selection mode is exited even on failure
         if (this.isSelectionModeActive) this._handleToggleSelectionMode(false);
    } finally {
        this.isCreatingGroup = false; // Ensure flag is reset (though it's removed)
        this.groupCreateSelectedChapters.clear(); // Ensure set is cleared
        this._updateLoadingState('action', false);
    }
}

    // --- Rename Handlers ---
     _handleRename(element, type) { // type is 'chapter' or 'group'
         if (!element || this.activeRenameTarget) return; // Prevent multiple renames

         const nameSpan = element.querySelector(type === 'chapter' ? '.chapter-item-name' : '.group-name');
         const input = element.querySelector(type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input');
         const id = element.dataset.chapterId || element.dataset.groupId;

         if (!nameSpan || !input || !id) return;

         // Cancel any existing rename
         if (this.activeRenameTarget) this._cancelRename();

         input.value = nameSpan.textContent; // Set current name
         input.dataset.originalName = nameSpan.textContent;
         console.log(`DEBUG: Adding 'is-renaming' to ${type} element`, element); // DEBUG
         element.classList.add('is-renaming'); // CSS hides span, shows input
         input.style.display = 'block'; // Ensure visible if CSS doesn't handle it
         input.disabled = false;
         input.focus();
         input.select();

         this.activeRenameTarget = { type, id, element }; // Store active target info
     }

     _handleRenameInputKeydown(event) {
         if (!this.activeRenameTarget) return;
         if (event.key === 'Enter') {
             event.preventDefault();
             this._confirmRename();
         } else if (event.key === 'Escape') {
             this._cancelRename();
         }
     }

     _handleRenameInputBlur(event) {
          // Use timeout to allow click on context menu etc. without immediate cancel
          // Also check if the blur was caused by clicking *inside* the modal, if applicable
          setTimeout(() => {
              // Check if rename is still active and focus hasn't moved to something safe (like a modal)
              if (this.activeRenameTarget && this.activeRenameTarget.element?.contains(event.target) && !event.relatedTarget?.closest('.modal-overlay')) {
                    console.log("Rename input blurred, cancelling.");
                    this._cancelRename();
              }
          }, 150);
     }

     async _confirmRename() {
         if (!this.activeRenameTarget) return;
         const { type, id, element } = this.activeRenameTarget;
         const input = element.querySelector(type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input');
         const nameSpan = element.querySelector(type === 'chapter' ? '.chapter-item-name' : '.group-name');
         if (!input || !nameSpan || input.disabled) return;

         const originalName = input.dataset.originalName;
         const newName = input.value.trim();

         if (!newName) {
              this._showError(`${type === 'chapter' ? 'Chapter' : 'Group'} name cannot be empty.`);
              this._cancelRename(); return;
         }
         if (newName === originalName) {
              this._cancelRename(); return;
         }

         this._updateLoadingState('action', true);
         input.disabled = true;
         element.style.cursor = 'wait';
         const tempTarget = this.activeRenameTarget; // Store locally before clearing
         this.activeRenameTarget = null; // Clear state early

         try {
              let result;
              if (tempTarget.type === 'chapter') {
                   // Rename chapter - API needs material and names
                   const chapterData = this._findChapterData(tempTarget.id);
                   if (!chapterData) throw new Error("Chapter data not found locally.");
                   // We need the *old name* for the API, use originalName
                   result = await apiClient.renameChapter(this.currentMaterial, originalName, newName);
                   // Update local data
                   chapterData.name = newName;
                   if(this.allChaptersData[tempTarget.id]) this.allChaptersData[tempTarget.id].name = newName;

              } else { // type === 'group'
                   result = await apiClient.updateGroup(tempTarget.id, { name: newName });
                   // Update local data
                   const groupData = this._findGroupData(tempTarget.id);
                   if (groupData) groupData.name = newName;
              }
              console.log(`${tempTarget.type} rename successful:`, result);
              nameSpan.textContent = newName; // Update UI
              element.classList.remove('is-renaming');
              input.style.display = 'none';
              this._showInfoMessage(`${tempTarget.type === 'chapter' ? 'Chapter' : 'Group'} renamed to "${newName}".`);

         } catch (error) {
              console.error(`Failed to rename ${tempTarget.type}:`, error);
              this._showError(`Could not rename ${tempTarget.type}: ${error.message}`);
              input.value = originalName; // Revert input value
              element.classList.remove('is-renaming'); // Revert UI state
              input.style.display = 'none';
              nameSpan.style.display = '';
         } finally {
              input.disabled = false;
              element.style.cursor = '';
              this._updateLoadingState('action', false);
              // Ensure activeRenameTarget is null even if errors occurred before clearing
              this.activeRenameTarget = null;
         }
     }

     _cancelRename() {
          if (!this.activeRenameTarget) return;
          const { type, element } = this.activeRenameTarget;
          const input = element.querySelector(type === 'chapter' ? '.chapter-rename-input' : '.group-rename-input');
          const nameSpan = element.querySelector(type === 'chapter' ? '.chapter-item-name' : '.group-name');

          element.classList.remove('is-renaming');
          if (input) {
               input.value = input.dataset.originalName || nameSpan?.textContent || ''; // Reset value
               input.style.display = 'none';
               input.disabled = false;
          }
          if (nameSpan) nameSpan.style.display = '';
          element.style.cursor = '';
          this.activeRenameTarget = null; // Clear state
          console.log("Rename cancelled.");
     }


    // --- Drag and Drop Handlers ---

    /** MODIFIED: Dragging selection + setDragImage */
    _handleDragStart(event) {
        const targetItem = event.target.closest('.chapter-item[draggable="true"]');
        if (!targetItem) { event.preventDefault(); return; }
        const chapterId = targetItem.dataset.chapterId;
        if (!chapterId) { event.preventDefault(); return; }
        const chapterData = this._findChapterData(chapterId);
        if (!chapterData) { event.preventDefault(); return; }

        console.log(`DEBUG: Drag Start: Chapter ${chapterId} (Selecting: ${this.isSelectionModeActive})`);
        let itemsToDrag = []; let dragType = 'chapter'; let isSelectionDrag = false;

        if (this.isSelectionModeActive && this.selectedItemIds.chapters.has(chapterId)) {
            // --- Dragging Selection ---
            itemsToDrag = Array.from(this.selectedItemIds.chapters).map(id => ({ type: 'chapter', id }));
            if (itemsToDrag.length > 1) dragType = 'multi-chapter';
            isSelectionDrag = true;
            targetItem.classList.add('dragging-selection'); // Style original item representing the group
            console.log(`DEBUG: Dragging selection of ${itemsToDrag.length} chapters.`);
        } else {
            // --- Dragging Single ---
            itemsToDrag = [{ type: 'chapter', id: chapterId }];
            targetItem.classList.add('dragging');
            console.log(`DEBUG: Dragging single chapter ${chapterId}`);
        }

        this.draggedItemData = { type: dragType, items: itemsToDrag };
        event.dataTransfer.effectAllowed = 'linkMove';
        event.dataTransfer.setData('application/json', JSON.stringify(this.draggedItemData));

        // --- Custom Drag Image ---
        try {
             let previewText = chapterData.name;
             if (isSelectionDrag && itemsToDrag.length > 1) {
                  previewText = `${itemsToDrag.length} Chapters`;
             }
             // Create simpler preview element
             const preview = document.createElement('div');
             preview.textContent = previewText;
             preview.classList.add('drag-preview-item'); // Use CSS for styling
             preview.style.position = 'absolute';
             preview.style.top = '-9999px'; preview.style.left = '-9999px';
             document.body.appendChild(preview);
             this.dragPreviewElement = preview;
             // Force reflow might not be needed with simpler element
             // void preview.offsetWidth;
             requestAnimationFrame(() => {
                 // Center the simpler preview
                  event.dataTransfer.setDragImage(preview, preview.offsetWidth / 2, preview.offsetHeight / 2);
                  console.log("DEBUG: Custom simplified drag image set.");
             });
        } catch (e) { console.error("DEBUG: Error creating/setting drag image", e); }

        this.container?.classList.add('is-dragging-chapter');
    }

    _handleDragEnd(event) {
        console.log("DEBUG: Drag End"); // DEBUG
        // Find the original dragged element (might not be event.target if preview was complex)
         const draggedElement = this.dashboardGridContainer?.querySelector('.dragging, .dragging-selection');
         draggedElement?.classList.remove('dragging', 'dragging-selection');

        // Remove the temporary drag preview element
        this.dragPreviewElement?.remove();
        this.dragPreviewElement = null;

        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-dragging-chapter', 'is-dragging-group', 'is-over-ungroup-zone'); // Clear states
        this.draggedItemData = null;
    }

    _handleDragLeave(event) {
        // Remove ungroup zone class when leaving grid or specific target
        if (event.target === this.dashboardGridContainer || event.target.closest('.grid-stack-item')) {
             const relatedTargetIsInside = this.dashboardGridContainer.contains(event.relatedTarget);
             if (!relatedTargetIsInside || !event.relatedTarget?.closest('.group-widget, .tag-pill, .standalone-chapter')) {
                this.container?.classList.remove('is-over-ungroup-zone');
             }
        }
        // Remove target class from pills/groups/chapters
        const target = event.target.closest('.tag-pill, .group-widget, .standalone-chapter');
        if (target?.classList.contains('drag-over-target') && !target.contains(event.relatedTarget)) {
             target.classList.remove('drag-over-target');
        }
    }

     /** MODIFIED: Added checks for pin/suspend pills */
     _handleDragOver(event) {
        if (!this.draggedItemData) return;
        event.preventDefault();

        const targetPill = event.target.closest('.tag-pill'); // Check any pill first
        const targetGroupWidget = event.target.closest('.group-widget[data-group-id]');
        const targetStandaloneChapter = event.target.closest('.chapter-item.standalone-chapter');
        const targetIsGridStackItem = event.target.closest('.grid-stack-item');
        const targetIsGridBackground = !targetIsGridStackItem && event.target === this.dashboardGridContainer;

        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-over-ungroup-zone');

        let isValidDrop = false;
        let dropEffect = 'none';
        let dropTargetElement = null;
        const isDraggingChapter = this.draggedItemData.type.includes('chapter');
        const isAnyDraggedChapterGrouped = isDraggingChapter && this.draggedItemData.items.some(item => (this._findChapterData(item.id)?.groupId || null) !== null);

        if (targetPill && isDraggingChapter) {
            const filterType = targetPill.dataset.filterType;
            if (filterType === 'tag') {
                 const tagName = targetPill.dataset.tagName;
                 isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.tags || []).includes(tagName));
                 if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
            } else if (filterType === 'pinned') {
                 isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.isPinned)); // Valid if any aren't pinned
                 if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
            } else if (filterType === 'suspended') {
                 isValidDrop = this.draggedItemData.items.some(item => !(this._findChapterData(item.id)?.isSuspended)); // Valid if any aren't suspended
                 if(isValidDrop) { dropEffect = 'link'; dropTargetElement = targetPill; }
            }
        } else if (targetGroupWidget && isDraggingChapter) {
            const targetGroupId = targetGroupWidget.dataset.groupId;
            isValidDrop = this.draggedItemData.items.some(item => (this._findChapterData(item.id)?.groupId || null) !== targetGroupId);
            if(isValidDrop) { dropEffect = 'move'; dropTargetElement = targetGroupWidget; }
        } else if ((targetIsGridBackground || targetStandaloneChapter) && isAnyDraggedChapterGrouped) {
            isValidDrop = true; // Valid if dragging grouped chapters over bg or standalone
            dropEffect = 'move';
            this.container?.classList.add('is-over-ungroup-zone');
            dropTargetElement = targetStandaloneChapter || this.dashboardGridContainer;
            console.log("DEBUG: Drag Over Ungroup Target detected");
        }

        event.dataTransfer.dropEffect = dropEffect;
        // Highlight target
        if (isValidDrop) {
            if (this.container?.classList.contains('is-over-ungroup-zone')) {
                 // Ungroup zone handled by container class
            } else if (dropTargetElement) {
                 dropTargetElement.classList.add('drag-over-target');
            }
       }
    }

    async _handleDrop(event) {
        event.preventDefault();
        console.log("DEBUG: Drop detected. Target:", event.target); // DEBUG
        const targetPill = event.target.closest('.tag-pill[data-tag-name].drag-over-target');
        const targetGroup = event.target.closest('.group-widget[data-group-id].drag-over-target');
        // ISSUE 3 FIX: Determine if drop was on background (use state set in dragOver)
        const targetStandaloneChapter = event.target.closest('.chapter-item.standalone-chapter');
        const wasOverUngroupZone = this.container?.classList.contains('is-over-ungroup-zone');
        // Determine if the drop location qualifies for ungrouping
        const isUngroupDropTarget = wasOverUngroupZone && (event.target === this.dashboardGridContainer || event.target.closest('.chapter-item.standalone-chapter'));
        // Clear visual cues immediately
        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-over-ungroup-zone');

        if (!this.draggedItemData || !this.draggedItemData.type.includes('chapter')) {
            console.warn("Invalid drop: No valid chapter data being dragged.");
            this.draggedItemData = null; // Clear data even if drop is invalid
            return;
        }

        // Determine final drop target priority: Pill > Group > Ungroup Zone
        let finalDropTargetType = null;
        let filterPillType = null;
        if (targetPill) {
            filterPillType = targetPill.dataset.filterType;
            if (filterPillType === 'tag') finalDropTargetType = 'tag';
            else if (filterPillType === 'pinned') finalDropTargetType = 'pin';
            else if (filterPillType === 'suspended') finalDropTargetType = 'suspend';
        }
        else if (targetGroup) finalDropTargetType = 'group';
        else if (isUngroupDropTarget) finalDropTargetType = 'ungroup';

        if (!finalDropTargetType) {
             console.log("DEBUG: Drop occurred on non-designated target area."); // DEBUG
             this.draggedItemData = null;
             return; // Exit if not a valid target type
        }

        this._updateLoadingState('action', true);
        let errorsOccurred = false;
        let firstSuccessMessage = null;
        const itemsToProcess = this.draggedItemData.items;
        const currentMaterial = this.currentMaterial;
        const processedDraggedData = { ...this.draggedItemData };
        this.draggedItemData = null;


        try {
            let promises = [];
            switch(finalDropTargetType) {
                case 'tag':
                    const targetTagName = targetPill.dataset.tagName;
                    promises = itemsToProcess.map(async (item) => {
                         try {
                              const chapter = this._findChapterData(item.id);
                              if (!chapter || (chapter.tags || []).includes(targetTagName)) return;
                              const newTags = [...(chapter.tags || []), targetTagName].sort();
                              await apiClient.setChapterTags(currentMaterial, item.id, newTags);
                              chapter.tags = newTags;
                              if (!firstSuccessMessage) firstSuccessMessage = `Tag "${targetTagName}" added.`;
                         } catch (e) { errorsOccurred = true; console.error(`Tagging error for ${item.id}:`, e); }
                    });
                    break;

                case 'group':
                    const targetGroupId = targetGroup.dataset.groupId;
                    console.log(`DEBUG: Processing drop on group: ${targetGroupId}`); // DEBUG
                    promises = itemsToProcess.map(async (item) => {
                         const chapter = this._findChapterData(item.id);
                         if (!chapter || chapter.groupId === targetGroupId) return;
                         const originalGroupId = chapter.groupId;
                         await apiClient.assignChapterToGroup(item.id, targetGroupId);
                         this._moveChapterLocally(item.id, originalGroupId, targetGroupId);
                         if (!firstSuccessMessage) firstSuccessMessage = `Chapter(s) moved to group.`;
                    });
                    break;

                    case 'ungroup': // ISSUE 3 FIX: This case now triggered correctly
                    console.log(`DEBUG: Processing drop action: UNGROUP`); // DEBUG
                    promises = itemsToProcess.map(async (item) => {
                         const chapter = this._findChapterData(item.id);
                         if (!chapter || chapter.groupId === null) return; // Skip if already ungrouped
                         const originalGroupId = chapter.groupId;
                         await apiClient.assignChapterToGroup(item.id, null); // API call to ungroup
                         this._moveChapterLocally(item.id, originalGroupId, null); // Update local state
                         if (!firstSuccessMessage) firstSuccessMessage = `Chapter(s) removed from group.`;
                    });
                    break;
                    case 'pin': // NEW
                    console.log(`DEBUG: Processing drop action: PIN`);
                       promises = itemsToProcess.map(async (item) => {
                            try { await this._executePinToggle(item.id, true); } // Pin = true
                            catch (e) { errorsOccurred = true; console.error(`Pin error for ${item.id}:`, e); }
                       });
                       firstSuccessMessage = errorsOccurred ? null : "Selected chapter(s) pinned.";
                       break;
                 case 'suspend': // Suspend chapters
                       console.log(`DEBUG: Processing drop action: SUSPEND`);
                       promises = itemsToProcess.map(async (item) => {
                            try { await this._executeSuspendToggle(item.id, true); } // Suspend = true
                            catch (e) { errorsOccurred = true; console.error(`Suspend error for ${item.id}:`, e); }
                       });
                       firstSuccessMessage = errorsOccurred ? null : "Selected chapter(s) suspended.";
                       break;
               case 'suspend': // NEW
                    console.log(`DEBUG: Processing drop action: SUSPEND`);
                    promises = itemsToProcess.map(async (item) => {
                         try { await this._executeSuspendToggle(item.id, true); } // Suspend = true
                         catch (e) { errorsOccurred = true; console.error(`Suspend error for ${item.id}:`, e); }
                    });
                    await Promise.allSettled(promises);
                    firstSuccessMessage = errorsOccurred ? null : "Selected chapter(s) suspended.";
                    break;
            }

            // Execute all API calls
            await Promise.allSettled(promises).then(results => {
                 results.forEach(r => { if (r.status === 'rejected') { errorsOccurred = true; console.error("Drop Action error:", r.reason); } });
            });

             // Refresh UI for group/ungroup/suspend (pin only changes style)
             if (['group', 'ungroup', 'suspend'].includes(finalDropTargetType)) {
                console.log("DEBUG: Re-rendering layout after drop action:", finalDropTargetType);
                this._renderDashboardLayout();
           } else if (finalDropTargetType === 'pin') {
               // Pinning only requires style update handled within _executePinToggle
           } else if (finalDropTargetType === 'tag') {
            // UI update handled if tags are shown on cards? Not currently.
       }

            // Show feedback
            if (errorsOccurred) this._showError("Some chapters could not be updated.", true);
            else if (firstSuccessMessage) this._showInfoMessage(firstSuccessMessage);

        } catch (error) {
            console.error("Error processing drop event:", error);
            this._showError(`Drop failed: ${error.message}`);
        } finally {
            this._updateLoadingState('action', false);
            // Exit selection mode? Only if multi-drag succeeded?
            if (this.isSelectionModeActive && processedDraggedData?.type === 'multi-chapter' && !errorsOccurred) {
                 this._handleToggleSelectionMode();
            }
        }
    }


    async _handleDrop(event) {
        event.preventDefault();
        console.log("DEBUG: Drop detected"); // DEBUG
        const targetPill = event.target.closest('.tag-pill[data-tag-name].drag-over-target');
        const targetGroup = event.target.closest('.group-widget[data-group-id].drag-over-target');
        // ISSUE 3 FIX: Check if drop target is the grid background
        // Fix the detection logic to match _handleDragOver
        const wasOverUngroupZone = this.container?.classList.contains('is-over-ungroup-zone');
        const targetStandaloneChapter = event.target.closest('.chapter-item.standalone-chapter');
        const isUngroupDropTarget = wasOverUngroupZone && (event.target === this.dashboardGridContainer || targetStandaloneChapter);

        // Clear visual cues
        document.querySelectorAll('.drag-over-target').forEach(el => el.classList.remove('drag-over-target'));
        this.container?.classList.remove('is-over-ungroup-zone');

        if (!this.draggedItemData || !this.draggedItemData.type.includes('chapter')) {
            console.warn("Invalid drop: No valid chapter data."); this.draggedItemData = null; return;
        }

        this._updateLoadingState('action', true);
        let errorsOccurred = false;
        let firstSuccessMessage = null;
        const itemsToProcess = this.draggedItemData.items;
        const currentMaterial = this.currentMaterial; // Cache for async calls

        try {
            if (targetPill) { // --- Dropped on TAG ---
                 const targetTagName = targetPill.dataset.tagName;
                 console.log(`DEBUG: Processing drop on tag: ${targetTagName}`);
                 const promises = itemsToProcess.map(async (item) => {
                      const chapter = this._findChapterData(item.id);
                      if (!chapter || (chapter.tags || []).includes(targetTagName)) return;
                      const newTags = [...(chapter.tags || []), targetTagName].sort();
                      // Use chapterId for API
                      await apiClient.setChapterTags(currentMaterial, item.id, newTags);
                      chapter.tags = newTags;
                      if (!firstSuccessMessage) firstSuccessMessage = `Tag "${targetTagName}" added.`;
                 });
                 await Promise.allSettled(promises).then(results => results.forEach(r => { if (r.status === 'rejected') { errorsOccurred = true; console.error("Tagging error:", r.reason); } }));

            } else if (targetGroup) { // --- Dropped on GROUP ---
                  const targetGroupId = targetGroup.dataset.groupId;
                  console.log(`DEBUG: Processing drop on group: ${targetGroupId}`);
                  const promises = itemsToProcess.map(async (item) => {
                       const chapter = this._findChapterData(item.id);
                       if (!chapter || chapter.groupId === targetGroupId) return; // Skip if already in group
                       const originalGroupId = chapter.groupId;
                       // API requires chapterId
                       await apiClient.assignChapterToGroup(item.id, targetGroupId);
                       this._moveChapterLocally(item.id, originalGroupId, targetGroupId); // Move locally AFTER success
                       if (!firstSuccessMessage) firstSuccessMessage = `Chapter(s) moved to group.`;
                  });
                   await Promise.allSettled(promises).then(results => results.forEach(r => { if (r.status === 'rejected') { errorsOccurred = true; console.error("Grouping error:", r.reason); } }));
                   // Re-render needed after group changes
                   this._renderDashboardLayout();

            } else if (isUngroupDropTarget) { // --- ISSUE 3 FIX: Dropped on background (Ungroup) ---
                 console.log(`DEBUG: Processing drop on background (ungroup).`);
                 const promises = itemsToProcess.map(async (item) => {
                      const chapter = this._findChapterData(item.id);
                      if (!chapter || chapter.groupId === null) return; // Skip if already ungrouped
                      const originalGroupId = chapter.groupId;
                       // API requires chapterId
                      await apiClient.assignChapterToGroup(item.id, null); // Assign to null
                      this._moveChapterLocally(item.id, originalGroupId, null); // Move locally AFTER success
                      if (!firstSuccessMessage) firstSuccessMessage = `Chapter(s) removed from group.`;
                 });
                  await Promise.allSettled(promises).then(results => results.forEach(r => { if (r.status === 'rejected') { errorsOccurred = true; console.error("Ungrouping error:", r.reason); } }));
                  // Re-render needed after ungrouping
                  this._renderDashboardLayout();

            } else {
                 console.log("DEBUG: Drop occurred on non-target area."); // DEBUG
            }

            // Show feedback
            if (errorsOccurred) this._showError("Some chapters could not be updated.", true);
            else if (firstSuccessMessage) this._showInfoMessage(firstSuccessMessage);

        } catch (error) { // Catch errors in the drop handler logic itself
            console.error("Error processing drop event:", error);
            this._showError(`Drop failed: ${error.message}`);
            errorsOccurred = true;
        } finally {
            this.draggedItemData = null;
            this._updateLoadingState('action', false);
            // Clear selection if items were successfully processed?
            if (!errorsOccurred && this.isSelectionModeActive) {
                 this._handleToggleSelectionMode(); // Exit selection mode after successful bulk action
            }
        }
   }

       /** Helper for Pin/Unpin API call and UI update */
       async _executePinToggle(chapterId, shouldPin) {
        const chapter = this._findChapterData(chapterId); if (!chapter) return;
        const apiCall = shouldPin ? apiClient.pinChapter : apiClient.unpinChapter;
        const result = await apiCall(chapterId);
        chapter.isPinned = result.chapter.isPinned;
        if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isPinned = chapter.isPinned;
        this._findChapterElement(chapterId)?.classList.toggle('is-pinned', chapter.isPinned);
        // Don't refresh filtered view here, let the caller handle bulk refresh
   }
   /** Helper for Suspend/Unsuspend API call and UI update */
    async _executeSuspendToggle(chapterId, shouldSuspend) {
         const chapter = this._findChapterData(chapterId); if (!chapter) return;
         const apiCall = shouldSuspend ? apiClient.suspendChapter : apiClient.unsuspendChapter;
         const result = await apiCall(chapterId);
         chapter.isSuspended = result.chapter.isSuspended;
         if (this.allChaptersData[chapterId]) this.allChaptersData[chapterId].isSuspended = chapter.isSuspended;

         // Remove/re-add from UI handled by caller refreshing layout/filter
          // But update local data cache immediately
          if (shouldSuspend) {
               if (chapter.groupId && this.chaptersByGroup[chapter.groupId]) this.chaptersByGroup[chapter.groupId] = this.chaptersByGroup[chapter.groupId].filter(c => c.id !== chapterId);
               this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
          } else {
               // If unsuspending, the data is updated, caller needs to add it back via refresh
          }
    }

    // --- Gridstack Event Handlers ---

/** MODIFIED: Handles Gridstack item move/resize stop events */
_handleGridItemStackChanged(event, element) {
    console.log(`DEBUG: Gridstack event: ${event.type} on element:`, element);

    if (!element || !this.gridInstance?.isWidget(element)) { /* ... */ return; }

    const groupId = element.dataset.groupId;
    const isGroup = element.classList.contains('group-widget');
    const node = this.gridInstance.getNodeData(element);
    if (!node) { /* ... */ return; }

    if (isGroup && groupId) {
        const groupData = this._findGroupData(groupId);
        if (!groupData) return;

        if (event.type === 'dragstop') {
            const newPosition = { row: node.y + 1, col: node.x + 1 };
            if (groupData.gridPosition?.row !== newPosition.row || groupData.gridPosition?.col !== newPosition.col) {
                console.log(`DEBUG: Group ${groupId} DRAGGED to:`, newPosition);
                groupData.gridPosition = newPosition;
                this._updateGroupPositionAPI(groupId, newPosition); // Call directly
            }
        } else if (event.type === 'resizestop') {
            const newSize = { rows: node.h, cols: node.w };
            if (groupData.gridSize?.rows !== newSize.rows || groupData.gridSize?.cols !== newSize.cols) {
                console.log(`DEBUG: Group ${groupId} RESIZED to:`, newSize);
                groupData.gridSize = newSize;
                this._updateGroupSizeAPI(groupId, newSize); // Call directly
                // Optionally trigger internal content re-render if needed based on size change
                 this._fetchAndRenderGroupChapters(groupId); // Refresh chapters to potentially change item display
            }
        }
    }
    // Standalone chapter saving logic (if implemented) would go here
}

        /** Calls API to update group position */
        async _updateGroupPositionAPI(groupId, newPosition) {
            console.log(`DEBUG: API Call - Updating position for group ${groupId}`, newPosition); // DEBUG
            this._updateLoadingState('action', true);
            try {
                 await apiClient.updateGroupPosition(groupId, newPosition);
                 console.log(`DEBUG: Group ${groupId} position saved.`); // DEBUG
                 // Local data already updated optimistically
            } catch (error) {
                 console.error(`Failed to update position for group ${groupId}:`, error); // DEBUG
                 this._showError(`Could not save group position: ${error.message}`);
                 // TODO: Revert UI change? Need to fetch old position or store it before update.
                 // Example basic revert (might cause flicker): this._renderDashboardLayout();
            } finally {
                 this._updateLoadingState('action', false);
            }
       }
   
        /** Calls API to update group size */
        async _updateGroupSizeAPI(groupId, newSize) {
             console.log(`DEBUG: API Call - Updating size for group ${groupId}`, newSize); // DEBUG
             this._updateLoadingState('action', true);
             try {
                  await apiClient.updateGroupSize(groupId, newSize);
                  console.log(`DEBUG: Group ${groupId} size saved.`); // DEBUG
                  // Local data already updated optimistically
             } catch (error) {
                  console.error(`Failed to update size for group ${groupId}:`, error); // DEBUG
                  this._showError(`Could not save group size: ${error.message}`);
                  // TODO: Revert UI change?
                  // Example basic revert: this._renderDashboardLayout();
             } finally {
                  this._updateLoadingState('action', false);
             }
        }

    /** Debounced API call to update group layout */
     // --- Debounced API Call for Layout ---
     async _handleGroupLayoutUpdateAPI(groupId, newLayout) {
        console.log(`Debounced: Saving layout for group ${groupId}`, newLayout);
        this._updateLoadingState('action', true); // Use generic action loader
        try {
             await apiClient.updateGroup(groupId, newLayout);
             // Update local data immediately (optimistic)
             const groupData = this._findGroupData(groupId);
             if (groupData) {
                  groupData.gridPosition = newLayout.gridPosition;
                  groupData.gridSize = newLayout.gridSize;
             }
             console.log(`Group ${groupId} layout saved successfully.`);
        } catch (error) {
             console.error(`Failed to update layout for group ${groupId}:`, error);
             this._showError(`Could not save group layout: ${error.message}`);
             // TODO: Revert UI change? Might be complex with Gridstack.
        } finally {
             this._updateLoadingState('action', false);
        }
    }

     /** Attaches event listeners that need to be on dynamic grid items */
     _attachGridEventListeners() {
         console.log("Attaching grid item listeners");
         // Remove previous listeners if necessary (or ensure delegation handles it)

         // Using event delegation on the main grid container
         // No need for separate function if base listeners use delegation properly
         // However, if specific setup is needed AFTER gridstack renders, do it here.
         // Example: Initializing tooltips or specific interactions on newly added widgets.
     }


    // --- Helper Methods ---

    /** Find group data object by ID */
    _findGroupData(groupId) {
        return this.groupsData.find(g => g.id === groupId);
    }

    /** Find chapter data object by ID from flat map */
    _findChapterData(chapterId) {
        return this.allChaptersData[chapterId];
        // Fallback: Search through groups/ungrouped if flat map isn't maintained
        // let chapter = this.ungroupedChaptersData.find(c => c.id === chapterId);
        // if (chapter) return chapter;
        // for (const grpId in this.chaptersByGroup) {
        //     chapter = this.chaptersByGroup[grpId].find(c => c.id === chapterId);
        //     if (chapter) return chapter;
        // }
        // return null;
    }

    /** MODIFIED: Re-fetches AND re-renders ungrouped chapters in Gridstack */
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


    async _fetchAndRenderGroupChapters(groupId) {
        const groupData = this._findGroupData(groupId);
        if (!groupData) { return; }
        const groupWidget = this.dashboardGridContainer?.querySelector(`.group-widget[data-group-id="${groupId}"]`);
        if (!groupWidget) { console.warn(`Widget not found for group ${groupId} during chapter refresh.`); return; } // Widget might not be rendered yet

        console.log(`DEBUG: Fetching/Rendering Chapters for Group: ${groupId}`); // DEBUG
        this._updateLoadingState('chaptersInGroup', true, groupId);
        const chapterArea = groupWidget.querySelector('.group-chapter-area');
        if (chapterArea) chapterArea.innerHTML = LOADING_TEXT_SMALL;

        try {
            const sortPref = groupData.sortPreference || this.currentSort;
            const chapters = await apiClient.getChapters(this.currentMaterial, {
                 groupId: groupId, sortBy: sortPref.field, order: sortPref.order, suspended: false
            });
            this.chaptersByGroup[groupId] = chapters || [];
            chapters.forEach(ch => { this.allChaptersData[ch.id] = ch; });

            // ** FIX: Update chapter area reliably **
            if (chapterArea) {
                 chapterArea.innerHTML = ''; // Clear loading/old content
                 if (this.chaptersByGroup[groupId].length > 0) {
                      const fragment = document.createDocumentFragment();
                      this.chaptersByGroup[groupId].forEach(chapter => {
                           const chapterItemElement = this._renderChapterItem(chapter, {
                                layout: groupData.layoutMode || 'card',
                                containerSize: groupData.gridSize
                           });
                           if (chapterItemElement) fragment.appendChild(chapterItemElement);
                      });
                      chapterArea.appendChild(fragment); // Append all new items
                 } else {
                      chapterArea.innerHTML = EMPTY_GROUP_TEXT;
                 }
            }
             // Update stats in header
             const statsSpan = groupWidget.querySelector('.group-stats');
             if(statsSpan) statsSpan.textContent = `${groupData.stats?.averageMastery ?? '--'}% / ${this.chaptersByGroup[groupId].length}`;


        } catch (error) {
             console.error(`Failed to fetch chapters for group ${groupId}:`, error);
             if (chapterArea) chapterArea.innerHTML = '<div class="error-text-small">Error loading chapters.</div>';
             this.chaptersByGroup[groupId] = []; // Ensure empty on error
        } finally {
             this._updateLoadingState('chaptersInGroup', false, groupId);
        }
    }

    /** Update local state and UI when moving a chapter between groups */
    _moveChapterLocally(chapterId, fromGroupId, toGroupId) {
        let chapterData = this._findChapterData(chapterId); if (!chapterData) return;
        console.log(`DEBUG: Moving ${chapterId} locally from ${fromGroupId} to ${toGroupId}`);

        // Remove from old location
        if (fromGroupId && this.chaptersByGroup[fromGroupId]) {
            this.chaptersByGroup[fromGroupId] = this.chaptersByGroup[fromGroupId].filter(c => c.id !== chapterId);
        } else if (!fromGroupId) {
            this.ungroupedChaptersData = this.ungroupedChaptersData.filter(c => c.id !== chapterId);
        }

        // Add to new location
        chapterData.groupId = toGroupId;
        if (toGroupId) {
            if (!this.chaptersByGroup[toGroupId]) this.chaptersByGroup[toGroupId] = [];
            this.chaptersByGroup[toGroupId].push(chapterData);
            // TODO: Resort target group chapters?
        } else {
            this.ungroupedChaptersData.push(chapterData);
            // TODO: Resort ungrouped chapters?
        }
        // UI refresh is handled by the caller (usually _renderDashboardLayout)
    }

    // ... Keep other existing helpers like _debounce, _getMasteryLevelClass, etc. ...
    // ... Keep modal helpers (_showModal, _hideModal, _showError, _showInfoMessage) ...
    // ... Keep Pill logic (_handleMaterialSwitch needs adaptation using getChapters/getMaterialGroups/getMaterialTags) ...
    // ... Refactor _updateLoadingState to handle new granular keys ...

     /** Debounce Utility **/
     _debounce(func, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    _getMasteryLevelClass(masteryPercent) {
        if (masteryPercent >= 85) return 'high';
        if (masteryPercent >= 50) return 'medium';
        return 'low';
    }
    _getReviewIntensityClass(count) {
        if (count >= 8) return '8+';
        if (count >= 4) return '4-7';
        if (count >= 1) return '1-3';
        return null;
    }
    /**
     * Shows a specific modal. Handles generic modals (confirm, error, info)
     * by setting content/buttons, and specialized modals by just making them visible.
     * @param {string} modalId - The ID of the modal overlay element.
     * @param {string} [title] - Title text (for generic modals).
     * @param {string} [message] - Message content (HTML allowed) (for generic modals).
     * @param {Array<object>} [buttons=[]] - Button config array (for generic modals).
     * @param {'warning'|'error'|'info'} [iconType='warning'] - Icon for generic modals.
     * @private
     */
    _showModal(modalId, title, message, buttons = [], iconType = 'warning') {
        let modalOverlay, modalTitle, modalMessage, modalActions, modalIcon;
        let isGenericModal = false; // Flag to know if we should set content/buttons

        console.log(`DEBUG: _showModal called for ID: ${modalId}`); // DEBUG

        // --- Identify Modal and Get References ---
        if (modalId === 'confirmationModal') {
            modalOverlay = this.confirmationModalOverlay;
            modalTitle = this.confirmModalTitle;
            modalMessage = this.confirmModalMessage;
            modalActions = this.confirmModalActions;
            modalIcon = this.confirmModalIcon;
            if (modalIcon) modalIcon.className = `modal-icon ${iconType}`;
            isGenericModal = true;
        } else if (modalId === 'errorModal') {
            modalOverlay = this.errorModalOverlay;
            modalTitle = this.errorModalTitle;
            modalMessage = this.errorModalMessage;
            modalActions = this.errorModalActions;
            // Error icon usually static
            isGenericModal = true;
        } else if (modalId === 'infoModal') {
            modalOverlay = this.infoModalOverlay;
            modalTitle = this.infoModalTitle;
            modalMessage = this.infoModalMessage;
            modalActions = this.infoModalActions;
            modalIcon = this.infoModalIcon;
            if (modalIcon) modalIcon.className = `modal-icon info`;
            isGenericModal = true;
        }
        // --- Handle SPECIALIZED Modals (Just find the overlay) ---
        else if (modalId === 'settingsModal') {
            modalOverlay = this.settingsModalOverlay;
        } else if (modalId === 'tagManagementModal') {
            modalOverlay = this.tagManagementModalOverlay;
        } else if (modalId === 'createGroupModal') {
            modalOverlay = this.createGroupModalOverlay;
        } else if (modalId === 'groupSortModal') {
            modalOverlay = this.groupSortModalOverlay;
        } else if (modalId === 'tagSelectorModal') { // <-- Added This
            modalOverlay = this.tagSelectorModalOverlay;
        } else if (modalId === 'groupColorPickerModal') { // <-- Added This
            modalOverlay = this.colorPickerModalOverlay;
        }
        // --- Unknown Modal ID ---
        else {
            console.error(`_showModal Error: Unknown modal ID requested: "${modalId}"`); // DEBUG More info
            // Optionally show a generic error modal here?
            // this._showModal('errorModal', 'UI Error', `Cannot find modal component: ${modalId}`);
            return; // Exit if ID is unknown
        }

        // --- Check if Overlay Element was Found ---
        if (!modalOverlay) {
            console.error(`_showModal Error: Modal overlay element not found in DOM for ID: "${modalId}". Check HTML structure.`); // DEBUG More info
            return; // Exit if overlay element doesn't exist
        }

        // --- Set Content/Buttons ONLY for Generic Modals ---
        if (isGenericModal) {
            if (!modalTitle || !modalMessage || !modalActions) {
                console.error(`Modal elements (title/message/actions) not found for generic modal ID: ${modalId}`);
                // Don't necessarily stop showing the overlay, but log the issue.
            } else {
                modalTitle.textContent = title || ''; // Use default empty string if null/undefined
                modalMessage.innerHTML = message || ''; // Use innerHTML for basic formatting
                modalActions.innerHTML = ''; // Clear previous dynamic buttons

                // Add dynamic buttons
                if (buttons && buttons.length > 0) {
                    buttons.forEach(btnConfig => {
                        const button = document.createElement('button');
                        button.textContent = btnConfig.text;
                        button.classList.add('modal-button', btnConfig.class || 'secondary');
                        button.addEventListener('click', () => {
                            this._hideModal(modalId); // Always hide first
                            if (typeof btnConfig.action === 'function') btnConfig.action();
                        }, { once: true }); // Add listener only once per show
                        modalActions.appendChild(button);
                    });
                } else if (modalId === 'errorModal' || modalId === 'infoModal') {
                    // Add default OK button if none provided and it doesn't exist statically
                    if (!modalActions.querySelector('[data-action="close"]')) {
                        const staticOkButton = document.createElement('button');
                        staticOkButton.textContent = 'OK';
                        staticOkButton.classList.add('modal-button', 'secondary');
                        staticOkButton.dataset.action = 'close';
                        staticOkButton.addEventListener('click', () => this._hideModal(modalId));
                        modalActions.appendChild(staticOkButton);
                    }
                }
            }
        } else {
            console.log(`DEBUG: Skipping content/button setup for specialized modal: ${modalId}`); // DEBUG
        }

        // --- Show the Modal ---
        modalOverlay.classList.add('visible');
        console.log(`DEBUG: Modal "${modalId}" shown.`); // DEBUG
    }
    _hideModal(modalId) {
        let modalOverlay;
        // Determine overlay based on ID
        if (modalId === 'confirmationModal') modalOverlay = this.confirmationModalOverlay;
        else if (modalId === 'errorModal') modalOverlay = this.errorModalOverlay;
        else if (modalId === 'infoModal') modalOverlay = this.infoModalOverlay;
        else if (modalId === 'settingsModal') modalOverlay = this.settingsModalOverlay;
        else modalOverlay = document.getElementById(modalId); // Fallback for potential full ID pass

        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
            // Clean up confirmation animation target
            if (modalId === 'confirmationModal' && this.contextMenuTargetChapter) {
                const card = this._findChapterCardElement(this.contextMenuTargetChapter);
                card?.classList.remove('confirming-delete');
            }
        } else {
            console.error("Modal overlay element not found for ID:", modalId);
        }
    }
    _showInfoMessage(message, title = 'Information') {
        this._showModal('infoModal', title, message);
    }

    _showError(message, isTemporary = false) { // Keep isTemporary flag? Might not be used now.
        console.error("ChapterFoldersView Error:", message);
        this._showModal('errorModal', 'Error', message);
    }

    _showHeatmapTooltip(text, targetElement) {
        if (!this.heatmapTooltipElement || !targetElement) return;
        this.heatmapTooltipElement.textContent = text;
        const targetRect = targetElement.getBoundingClientRect();
        // Recalculate tooltip size *after* setting text
         this.heatmapTooltipElement.style.visibility = 'hidden'; // Keep hidden while measuring
         this.heatmapTooltipElement.style.display = 'block';
        const tooltipRect = this.heatmapTooltipElement.getBoundingClientRect();
         this.heatmapTooltipElement.style.display = '';
         this.heatmapTooltipElement.style.visibility = ''; // Make visible again

        let top = targetRect.top + window.scrollY - tooltipRect.height - 8;
        let left = targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);

        // Boundary checks
        if (left < 10) left = 10;
        else if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
        if (top < 10) top = targetRect.bottom + window.scrollY + 8; // Position below if too high

        this.heatmapTooltipElement.style.left = `${left}px`;
        this.heatmapTooltipElement.style.top = `${top}px`;
        this.heatmapTooltipElement.classList.add('visible');
   }

   _hideHeatmapTooltip() {
       if (!this.heatmapTooltipElement) return;
       this.heatmapTooltipElement.classList.remove('visible');
       // Reset position after fade allows completion
       setTimeout(() => {
           if (!this.heatmapTooltipElement.classList.contains('visible')) {
               this.heatmapTooltipElement.style.left = '-9999px';
               this.heatmapTooltipElement.style.top = '-9999px';
           }
       }, 250);
   }

   _navigateToChapterDetails(chapterName) {
    if (!chapterName || !this.currentMaterial) return;
    const encodedChapter = encodeURIComponent(chapterName);
    const material = encodeURIComponent(this.currentMaterial);
    const url = `flashcards-view.html?material=${material}&chapter=${encodedChapter}`;
    console.log(`Navigating to chapter details: ${url}`);
    window.location.href = url;
}

_updateFocusedStudyButtonState() {
    if (!this.isSelectionMode || !this.pillStartFocusedButton) return;

    const count = this.selectedChapters.size;
    this.pillStartFocusedButton.textContent = `Focused Study (${count})`;
    const isDisabled = count === 0;
    this.pillStartFocusedButton.disabled = isDisabled;
    this.pillStartFocusedButton.style.opacity = isDisabled ? '0.6' : '1';
    this.pillStartFocusedButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
}

_updateActiveMaterialTab() {
     if (!this.currentMaterial || !this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) {
         console.warn("_updateActiveMaterialTab: Missing required refs or currentMaterial");
         // Maybe try to select the first non-error tab if currentMaterial is null
         if (!this.currentMaterial && this.availableMaterials?.length > 0) {
              const firstValidMaterial = this.availableMaterials.find(m => !m.error)?.material;
              if (firstValidMaterial) {
                   console.log("Defaulting active material to first valid one:", firstValidMaterial);
                   this.currentMaterial = firstValidMaterial;
                   // Re-call now that currentMaterial is set (avoid infinite loop)
                    this._updateActiveMaterialTab();
                    return;
              } else {
                   console.log("No valid materials to set as active.");
                   // Clear all active states if none are valid
                    const tabs = Array.from(this.pillMaterialSwitcherInner.querySelectorAll('.material-tab'));
                    tabs.forEach(tab => tab.classList.remove('is-active', 'is-prev-1', 'is-next-1', 'is-prev-2', 'is-next-2'));
                    return;
              }
         } else if (!this.currentMaterial) {
             return; // Still no material, exit
         }
     }

     const tabs = Array.from(this.pillMaterialSwitcherInner.querySelectorAll('.material-tab'));
     const totalTabs = tabs.length;
     if (totalTabs === 0) return;

     let activeIndex = -1;
     tabs.forEach((tab, index) => {
         const isActive = tab.dataset.material === this.currentMaterial;
         tab.classList.toggle('is-active', isActive);
         if (isActive) activeIndex = index;
         // Remove all position classes initially
         tab.classList.remove('is-prev-1', 'is-next-1', 'is-prev-2', 'is-next-2', 'is-prev-3', 'is-next-3');
     });

     if (activeIndex === -1) {
          console.warn(`Active material '${this.currentMaterial}' not found in rendered tabs.`);
          // Try to find the first non-error tab and make it active? Or leave as is?
          // For now, just log the warning. Ensure CSS handles no 'is-active' gracefully.
     } else {
          // Apply position classes relative to active tab
          for (let i = 0; i < totalTabs; i++) {
              const distance = i - activeIndex;
              const tab = tabs[i];
              if (distance === -1) tab.classList.add('is-prev-1');
              else if (distance === 1) tab.classList.add('is-next-1');
              else if (distance === -2) tab.classList.add('is-prev-2');
              else if (distance === 2) tab.classList.add('is-next-2');
              else if (distance === -3) tab.classList.add('is-prev-3');
              else if (distance === 3) tab.classList.add('is-next-3');
               // Set --tx CSS variable for hover transforms
              if (distance !== 0) {
                 const txSign = distance < 0 ? '-' : '+';
                 const txVarNum = Math.abs(distance);
                 tab.style.setProperty('--tx', `calc(-50% ${txSign} var(--expand-translate-${txVarNum}))`);
              } else {
                 tab.style.removeProperty('--tx');
              }
          }
     }

     // Update scroll state based on potentially new active tab position
     this._updateMaterialScrollState();
     console.log(`Active material tab updated for: ${this.currentMaterial}, Index: ${activeIndex}`);
 }


   // --- Material Scrolling ---
   _handleMaterialScroll(event) {
    if (!this.pillMaterialSwitcher?.classList.contains('has-multiple') || !this.pillMaterialSwitcherInner) return;
    event.preventDefault();

    const scrollAmount = event.deltaY || event.deltaX;
    const direction = scrollAmount > 0 ? 1 : -1;
    const scrollSpeedMultiplier = 50; // Adjust sensitivity

    const containerWidth = this.pillMaterialSwitcher.offsetWidth;
    const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
    const maxScroll = Math.max(0, innerWidth - containerWidth);

    let newScroll = this.currentMaterialScroll + (direction * scrollSpeedMultiplier); // Add delta
    newScroll = Math.max(0, Math.min(newScroll, maxScroll)); // Clamp

    if (this.currentMaterialScroll !== newScroll) {
        this.currentMaterialScroll = newScroll;
        this.pillMaterialSwitcherInner.style.transform = `translateX(-${this.currentMaterialScroll}px)`;
        this._updateMaterialScrollState(); // Update visual indicators
    }
}

_updateMaterialScrollState() {
    if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) return;
    const containerWidth = this.pillMaterialSwitcher.offsetWidth;
    const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
    const scrollLeft = this.currentMaterialScroll;
    const scrollThreshold = 5; // Pixels tolerance

    this.pillMaterialSwitcher.classList.toggle('is-scrollable-left', scrollLeft > scrollThreshold);
    this.pillMaterialSwitcher.classList.toggle('is-scrollable-right', scrollLeft < innerWidth - containerWidth - scrollThreshold);
}

    // --- Helper to find elements ---
    _findChapterElement(chapterId) {
        return this.dashboardGridContainer?.querySelector(`.chapter-item[data-chapter-id="${chapterId}"]`);
   }
   _findGroupElement(groupId) {
        return this.dashboardGridContainer?.querySelector(`.group-widget[data-group-id="${groupId}"]`);
   }



    /** Update loading state for specific parts */
    _updateLoadingState(part, isLoading, identifier = null) {
        let stateKey = part;
        let changed = false;
        if (identifier !== null && typeof this.isLoading[part] === 'object') {
             if (this.isLoading[part][identifier] !== isLoading) {
                  this.isLoading[part][identifier] = isLoading;
                  stateKey = `${part}.${identifier}`;
                  changed = true;
             }
        } else if (typeof this.isLoading[part] === 'boolean') {
             if (this.isLoading[part] !== isLoading) {
                  this.isLoading[part] = isLoading;
                  changed = true;
             }
        } else {
             console.warn("Attempted to update unknown loading state:", part, identifier);
             return;
        }

        if (changed) { // Only log if state actually changed
            console.log(`DEBUG Loading state ${stateKey}: ${isLoading}`); // DEBUG
        }

        // Recalculate if *any* operation is loading
        let anyLoading = false;
        for (const key in this.isLoading) {
            if (typeof this.isLoading[key] === 'boolean' && this.isLoading[key]) {
                anyLoading = true; break;
            } else if (typeof this.isLoading[key] === 'object') {
                if (Object.values(this.isLoading[key]).some(val => val === true)) { // Check specifically for true
                    anyLoading = true; break;
                }
            }
        }
        this.container?.classList.toggle('is-loading-main', anyLoading);

        // TODO: Add more specific UI disabling based on which part is loading
        // Example: Disable sort/filter controls if dashboard/chapters are loading
         const controlsDisabled = this.isLoading.dashboard || this.isLoading.chaptersUngrouped || this.isLoading.action; // Example condition
         this.sortFieldSelect?.toggleAttribute('disabled', controlsDisabled);
         this.sortOrderSelect?.toggleAttribute('disabled', controlsDisabled);
         // Disable tag pills during actions?
          this.tagPillsContainer?.querySelectorAll('.tag-pill').forEach(pill => pill.toggleAttribute('disabled', this.isLoading.action));
    }

} // End of ChapterFoldersView class


// --- Initialization Listener ---
document.addEventListener('DOMContentLoaded', () => {
    if (isViewInitialized) {
        console.warn("ChapterFoldersView: DOMContentLoaded fired again - Skipped.");
        return;
    }
    isViewInitialized = true;
    console.log("DOM Content Loaded - Initializing ChapterFoldersView vNext");
    // Ensure Gridstack is loaded before initializing
    // This might require waiting for a library load event or using dynamic import
    // For now, assume Gridstack is globally available via CDN before this runs
    if (typeof GridStack === 'undefined') {
         console.error("GridStack library not found. Dashboard layout will not work.");
         // Optionally display an error to the user
         document.body.innerHTML = "<p>Error: Layout library failed to load.</p>";
    } else {
         const view = new ChapterFoldersView();
         view.initialize();
    }
});
// --- END OF FILE chapterFoldersView.js ---