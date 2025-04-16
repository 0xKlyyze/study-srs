// --- START OF FILE chapterFoldersView.js ---

// --- File: js/views/chapterFoldersView.js ---

import { apiClient } from '../api/apiClient.js';

let isViewInitialized = false;

class ChapterFoldersView {
    constructor() {
        // --- DOM Element References ---
        this.container = document.getElementById('managementContainer');
        this.heatmapGrid = this.container?.querySelector('.chapter-mastery-section .heatmap-grid');
        this.reviewScheduleContainer = this.container?.querySelector('.review-schedule-graph');
        this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas');
        this.reviewStatusElement = this.reviewScheduleContainer?.querySelector('.graph-status');
        this.reviewActivityGrid = this.container?.querySelector('.review-activity-section .review-heatmap-grid');
        this.chapterGrid = document.getElementById('chapterGrid');
        this.heatmapTooltipElement = document.getElementById('heatmap-tooltip');

        // Context Menus
        this.chapterContextMenu = document.getElementById('chapterContextMenu');
        this.materialContextMenu = document.getElementById('materialContextMenu');

        // Modals
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

        // Settings Modal
        this.settingsModalOverlay = document.getElementById('materialSettingsModal');
        this.settingsModalTitle = document.getElementById('settingsModalTitle');
        this.settingsModalForm = document.getElementById('materialSettingsForm');
        this.settingsEditMaterialNameInput = document.getElementById('settingsEditMaterialName');
        this.settingsMaterialNameInput = document.getElementById('settingsMaterialName');
        this.settingsDailyLimitInput = document.getElementById('settingsDailyLimit');
        this.settingsDefaultBatchSizeInput = document.getElementById('settingsDefaultBatchSize');
        // SRS Algo Inputs
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
        // SRS Threshold Inputs
        this.settingsThresholdLearningRepsInput = document.getElementById('settingsThresholdLearningReps');
        this.settingsThresholdMasteredRepsInput = document.getElementById('settingsThresholdMasteredReps');
        this.settingsThresholdMasteredEaseInput = document.getElementById('settingsThresholdMasteredEase');
        this.settingsThresholdCriticalEaseInput = document.getElementById('settingsThresholdCriticalEase');
        // Settings Actions
        this.settingsModalActions = document.getElementById('settingsModalActions');
        this.settingsSaveButton = document.getElementById('settingsSaveButton');
        this.settingsCancelButton = document.getElementById('settingsCancelButton');

        // --- Floating Pill References ---
        this.floatingStudyPill = document.getElementById('floatingStudyPill');
        this.pillMaterialSwitcher = document.getElementById('pillMaterialSwitcher');
        this.pillMaterialSwitcherInner = this.pillMaterialSwitcher?.querySelector('.material-switcher-pill-inner'); // Query inner div
        this.pillNewCardsCount = document.getElementById('pillNewCardsCount');
        this.pillDueCardsCount = document.getElementById('pillDueCardsCount');
        this.pillStudyButtonWrapper = this.floatingStudyPill?.querySelector('.study-button-wrapper');
        this.pillStudyDueButton = document.getElementById('pillStudyDueButton');
        this.pillOptionsTrigger = document.getElementById('pillOptionsTrigger');
        this.studyOptionsPopup = document.getElementById('studyOptionsPopup');
        this.pillStartFocusedButton = document.getElementById('pillStartFocusedButton');
        this.pillReviewBatchSize = document.getElementById('pillReviewBatchSize');

        // --- Material Icons (Skipped as requested) ---
        this.materialIcons = {
            'Mathematics': '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 142.514 142.514" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M34.367,142.514c11.645,0,17.827-10.4,19.645-16.544c0.029-0.097,0.056-0.196,0.081-0.297 c4.236-17.545,10.984-45.353,15.983-65.58h17.886c3.363,0,6.09-2.726,6.09-6.09c0-3.364-2.727-6.09-6.09-6.09H73.103 c1.6-6.373,2.771-10.912,3.232-12.461l0.512-1.734c1.888-6.443,6.309-21.535,13.146-21.535c6.34,0,7.285,9.764,7.328,10.236 c0.27,3.343,3.186,5.868,6.537,5.579c3.354-0.256,5.864-3.187,5.605-6.539C108.894,14.036,104.087,0,89.991,0 C74.03,0,68.038,20.458,65.159,30.292l-0.49,1.659c-0.585,1.946-2.12,7.942-4.122,15.962H39.239c-3.364,0-6.09,2.726-6.09,6.09 c0,3.364,2.726,6.09,6.09,6.09H57.53c-6.253,25.362-14.334,58.815-15.223,62.498c-0.332,0.965-2.829,7.742-7.937,7.742 c-7.8,0-11.177-10.948-11.204-11.03c-0.936-3.229-4.305-5.098-7.544-4.156c-3.23,0.937-5.092,4.314-4.156,7.545 C13.597,130.053,20.816,142.514,34.367,142.514z"></path> <path d="M124.685,126.809c3.589,0,6.605-2.549,6.605-6.607c0-1.885-0.754-3.586-2.359-5.474l-12.646-14.534l12.271-14.346 c1.132-1.416,1.98-2.926,1.98-4.908c0-3.59-2.927-6.231-6.703-6.231c-2.547,0-4.527,1.604-6.229,3.684l-9.531,12.454L98.73,78.391 c-1.89-2.357-3.869-3.682-6.7-3.682c-3.59,0-6.607,2.551-6.607,6.609c0,1.885,0.756,3.586,2.357,5.471l11.799,13.592 L86.647,115.67c-1.227,1.416-1.98,2.926-1.98,4.908c0,3.589,2.926,6.229,6.699,6.229c2.549,0,4.53-1.604,6.229-3.682l10.19-13.4 l10.193,13.4C119.872,125.488,121.854,126.809,124.685,126.809z"></path> </g> </g> </g></svg>', // Example: Calculator icon
            'Physics': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,256c0-38.187-36.574-71.637-94.583-93.355c1.015-6.127,1.894-12.177,2.5-18.091 c5.589-54.502-7.168-93.653-35.917-110.251c-9.489-5.478-20.378-8.26-32.341-8.26c-28.356,0-61.858,16.111-95.428,43.716 c-27.187-22.434-54.443-37.257-79.275-42.01c-4.642-0.905-9.105,2.142-9.993,6.776c-0.879,4.625,2.15,9.096,6.775,9.975 c21.282,4.079,45.15,17.109,69.308,36.702c-18.278,16.708-36.378,36.651-53.487,59.255c-28.561,3.447-55.031,9.088-78.592,16.529 c-4.395-27.913-4.13-52.813,1.331-72.439c2.321,0.495,4.71,0.785,7.168,0.785c18.825,0,34.133-15.309,34.133-34.133 c0-18.816-15.309-34.133-34.133-34.133S85.333,32.384,85.333,51.2c0,10.146,4.531,19.166,11.58,25.429 c-7.305,23.347-7.996,52.915-2.475,86.067C36.514,184.414,0,217.839,0,256c0,37.12,34.765,70.784,94.447,93.099 C84.25,410.206,94.933,458.615,128,477.713c9.489,5.478,20.378,8.252,32.35,8.252c28.382,0,61.918-16.136,95.505-43.785 c27.469,22.682,54.733,37.385,79.206,42.078c0.538,0.102,1.084,0.154,1.613,0.154c4.011,0,7.595-2.842,8.38-6.921 c0.879-4.634-2.15-9.105-6.776-9.992c-20.847-3.994-44.843-16.913-69.308-36.702c18.287-16.708,36.378-36.651,53.487-59.255 c28.578-3.456,55.066-9.088,78.626-16.538c4.395,27.887,4.122,52.787-1.365,72.457c-2.33-0.503-4.719-0.794-7.185-0.794 c-18.825,0-34.133,15.317-34.133,34.133c0,18.824,15.309,34.133,34.133,34.133c18.824,0,34.133-15.309,34.133-34.133 c0-10.138-4.523-19.149-11.563-25.412c7.339-23.407,8.047-52.966,2.526-86.101C475.52,327.561,512,294.144,512,256z M351.659,43.11c8.934,0,16.947,2.014,23.808,5.973c22.246,12.843,32.265,47.01,27.477,93.73 c-0.478,4.625-1.22,9.395-1.963,14.157c-23.518-7.424-49.937-13.047-78.438-16.495c-17.041-22.613-35.029-42.675-53.248-59.383 C298.846,57.148,327.791,43.11,351.659,43.11z M397.764,174.208c-4.139,19.396-10.266,39.603-18.202,60.186 c-6.093-12.689-12.766-25.429-20.087-38.127c-7.313-12.681-15.036-24.815-22.997-36.437 C358.519,163.328,379.153,168.209,397.764,174.208z M256.12,92.407c14.507,13.158,28.945,28.552,42.871,45.764 c-13.952-1.058-28.297-1.638-42.991-1.638c-14.669,0-28.988,0.58-42.914,1.63C227.063,120.934,241.579,105.574,256.12,92.407z M175.522,159.829c-7.97,11.614-15.676,23.782-22.98,36.446c-7.356,12.74-14.037,25.472-20.096,38.101 c-7.987-20.727-14.148-40.986-18.278-60.143C132.804,168.218,153.455,163.337,175.522,159.829z M119.467,34.133 c9.412,0,17.067,7.654,17.067,17.067c0,9.412-7.654,17.067-17.067,17.067c-9.404,0-17.067-7.654-17.067-17.067 C102.4,41.788,110.063,34.133,119.467,34.133z M17.067,256c0-29.79,31.548-57.088,80.777-75.998 c5.359,24.141,13.722,49.758,24.832,75.887c-11.264,26.419-19.61,52.113-24.934,76.194C47.283,312.619,17.067,284.774,17.067,256z M255.923,419.576c-13.474-12.169-26.923-26.291-39.927-42.052c0.734-1.092,1.28-2.295,1.886-3.465 c12.766,0.879,25.557,1.408,38.118,1.408c14.677,0,28.996-0.572,42.931-1.63C284.962,391.057,270.447,406.417,255.923,419.576z M313.267,355.277c-18.415,2.031-37.606,3.123-57.267,3.123c-11.29,0-22.775-0.469-34.261-1.203 c-0.648-18.253-15.59-32.93-34.005-32.93c-18.825,0-34.133,15.317-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133 c5.547,0,10.726-1.459,15.36-3.823c12.996,15.735,26.334,29.858,39.714,42.129c-29.585,23.996-58.573,38.059-82.458,38.059 c-8.943,0-16.947-2.005-23.817-5.973c-25.813-14.899-33.673-55.91-25.404-108.041c4.659,1.468,9.455,2.876,14.37,4.215 c4.523,1.237,9.233-1.451,10.479-5.99c1.237-4.548-1.442-9.233-5.999-10.47c-5.41-1.476-10.615-3.072-15.701-4.71 c4.105-19.123,10.197-39.424,18.185-60.262c5.658,11.802,11.844,23.646,18.577,35.447c1.57,2.756,4.454,4.301,7.415,4.301 c1.434,0,2.884-0.358,4.224-1.118c4.096-2.33,5.521-7.543,3.183-11.639c-9.207-16.128-17.391-32.418-24.516-48.58 c7.467-17.007,16.128-34.21,25.975-51.268c9.796-16.973,20.378-33.058,31.42-48.085c18.423-2.022,37.598-3.123,57.259-3.123 c19.686,0,38.886,1.101,57.327,3.132c11.017,15.036,21.572,31.112,31.369,48.068c9.796,16.964,18.458,34.116,25.967,51.106 c-7.561,17.101-16.162,34.295-25.975,51.302C334.891,324.164,324.318,340.25,313.267,355.277z M204.8,358.4 c0,4.796-1.997,9.122-5.197,12.22c-0.043,0.034-0.094,0.043-0.137,0.077c-0.051,0.034-0.068,0.094-0.119,0.137 c-3.046,2.85-7.117,4.634-11.614,4.634c-9.404,0-17.067-7.654-17.067-17.067c0-9.412,7.663-17.067,17.067-17.067 C197.146,341.333,204.8,348.988,204.8,358.4z M336.486,352.171c7.979-11.614,15.676-23.774,22.98-36.429 c7.313-12.672,13.943-25.472,20.062-38.263c8.021,20.779,14.208,41.079,18.347,60.279 C379.23,343.774,358.571,348.663,336.486,352.171z M392.533,477.867c-9.404,0-17.067-7.654-17.067-17.067 c0-9.412,7.663-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067C409.6,470.212,401.946,477.867,392.533,477.867z M414.242,331.972c-5.376-24.192-13.815-49.877-24.977-76.075c10.991-25.899,19.354-51.516,24.738-75.955 c49.314,18.91,80.93,46.234,80.93,76.058C494.933,285.773,463.428,313.062,414.242,331.972z"></path> </g> </g> </g></svg>', // Example: Atom icon
            // Add more mappings as needed
            'default': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M151.245,222.446C148.054,237.039,135.036,248,119.5,248c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c23.774,0,43.522-17.557,46.966-40.386c14.556-1.574,27.993-8.06,38.395-18.677c2.899-2.959,2.85-7.708-0.109-10.606 c-2.958-2.897-7.707-2.851-10.606,0.108C184.947,202.829,172.643,208,159.5,208c-26.743,0-48.5-21.757-48.5-48.5 c0-4.143-3.358-7.5-7.5-7.5s-7.5,3.357-7.5,7.5C96,191.715,120.119,218.384,151.245,222.446z"></path> <path d="M183,287.5c0-4.143-3.358-7.5-7.5-7.5c-35.014,0-63.5,28.486-63.5,63.5c0,0.362,0.013,0.725,0.019,1.088 C109.23,344.212,106.39,344,103.5,344c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5 c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.611-16.462-49.437-39.731-58.867c-0.178-1.699-0.269-3.418-0.269-5.133 c0-26.743,21.757-48.5,48.5-48.5C179.642,295,183,291.643,183,287.5z"></path> <path d="M439,223.5c0-17.075-6.82-33.256-18.875-45.156c1.909-6.108,2.875-12.426,2.875-18.844 c0-30.874-22.152-56.659-51.394-62.329C373.841,91.6,375,85.628,375,79.5c0-19.557-11.883-36.387-28.806-43.661 C317.999,13.383,287.162,0,263.5,0c-13.153,0-24.817,6.468-32,16.384C224.317,6.468,212.653,0,199.5,0 c-23.662,0-54.499,13.383-82.694,35.839C99.883,43.113,88,59.943,88,79.5c0,6.128,1.159,12.1,3.394,17.671 C62.152,102.841,40,128.626,40,159.5c0,6.418,0.965,12.735,2.875,18.844C30.82,190.244,24,206.425,24,223.5 c0,13.348,4.149,25.741,11.213,35.975C27.872,270.087,24,282.466,24,295.5c0,23.088,12.587,44.242,32.516,55.396 C56.173,353.748,56,356.626,56,359.5c0,31.144,20.315,58.679,49.79,68.063C118.611,449.505,141.965,463,167.5,463 c27.995,0,52.269-16.181,64-39.674c11.731,23.493,36.005,39.674,64,39.674c25.535,0,48.889-13.495,61.71-35.437 c29.475-9.385,49.79-36.92,49.79-68.063c0-2.874-0.173-5.752-0.516-8.604C426.413,339.742,439,318.588,439,295.5 c0-13.034-3.872-25.413-11.213-36.025C434.851,249.241,439,236.848,439,223.5z M167.5,448c-21.029,0-40.191-11.594-50.009-30.256 c-0.973-1.849-2.671-3.208-4.688-3.751C88.19,407.369,71,384.961,71,359.5c0-3.81,0.384-7.626,1.141-11.344 c0.702-3.447-1.087-6.92-4.302-8.35C50.32,332.018,39,314.626,39,295.5c0-8.699,2.256-17.014,6.561-24.379 C56.757,280.992,71.436,287,87.5,287c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5C60.757,272,39,250.243,39,223.5 c0-14.396,6.352-27.964,17.428-37.221c2.5-2.09,3.365-5.555,2.14-8.574C56.2,171.869,55,165.744,55,159.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-33.642-26.302-61.243-59.421-63.355C104.577,91.127,103,85.421,103,79.5c0-13.369,8.116-24.875,19.678-29.859 c0.447-0.133,0.885-0.307,1.308-0.527C127.568,47.752,131.447,47,135.5,47c12.557,0,23.767,7.021,29.256,18.325 c1.81,3.727,6.298,5.281,10.023,3.47c3.726-1.809,5.28-6.296,3.47-10.022c-6.266-12.903-18.125-22.177-31.782-25.462 C165.609,21.631,184.454,15,199.5,15c13.509,0,24.5,10.99,24.5,24.5v97.051c-6.739-5.346-15.25-8.551-24.5-8.551 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c13.509,0,24.5,10.99,24.5,24.5v180.279c-9.325-12.031-22.471-21.111-37.935-25.266 c-3.999-1.071-8.114,1.297-9.189,5.297c-1.075,4.001,1.297,8.115,5.297,9.189C206.8,343.616,224,366.027,224,391.5 C224,422.654,198.654,448,167.5,448z M395.161,339.807c-3.215,1.43-5.004,4.902-4.302,8.35c0.757,3.718,1.141,7.534,1.141,11.344 c0,25.461-17.19,47.869-41.803,54.493c-2.017,0.543-3.716,1.902-4.688,3.751C335.691,436.406,316.529,448,295.5,448 c-31.154,0-56.5-25.346-56.5-56.5c0-2.109-0.098-4.2-0.281-6.271c0.178-0.641,0.281-1.314,0.281-2.012V135.5 c0-13.51,10.991-24.5,24.5-24.5c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5c-9.25,0-17.761,3.205-24.5,8.551V39.5 c0-13.51,10.991-24.5,24.5-24.5c15.046,0,33.891,6.631,53.033,18.311c-13.657,3.284-25.516,12.559-31.782,25.462 c-1.81,3.727-0.256,8.214,3.47,10.022c3.726,1.81,8.213,0.257,10.023-3.47C303.733,54.021,314.943,47,327.5,47 c4.053,0,7.933,0.752,11.514,2.114c0.422,0.22,0.86,0.393,1.305,0.526C351.883,54.624,360,66.13,360,79.5 c0,5.921-1.577,11.627-4.579,16.645C322.302,98.257,296,125.858,296,159.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,6.244-1.2,12.369-3.567,18.205c-1.225,3.02-0.36,6.484,2.14,8.574 C417.648,195.536,424,209.104,424,223.5c0,26.743-21.757,48.5-48.5,48.5c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c16.064,0,30.743-6.008,41.939-15.879c4.306,7.365,6.561,15.68,6.561,24.379C424,314.626,412.68,332.018,395.161,339.807z"></path> <path d="M359.5,240c-15.536,0-28.554-10.961-31.745-25.554C358.881,210.384,383,183.715,383,151.5c0-4.143-3.358-7.5-7.5-7.5 s-7.5,3.357-7.5,7.5c0,26.743-21.757,48.5-48.5,48.5c-13.143,0-25.447-5.171-34.646-14.561c-2.898-2.958-7.647-3.007-10.606-0.108 s-3.008,7.647-0.109,10.606c10.402,10.617,23.839,17.103,38.395,18.677C315.978,237.443,335.726,255,359.5,255 c4.142,0,7.5-3.357,7.5-7.5S363.642,240,359.5,240z"></path> <path d="M335.5,328c-2.89,0-5.73,0.212-8.519,0.588c0.006-0.363,0.019-0.726,0.019-1.088c0-35.014-28.486-63.5-63.5-63.5 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5c0,1.714-0.091,3.434-0.269,5.133 C288.462,342.063,272,364.889,272,391.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.743,21.757-48.5,48.5-48.5 c4.142,0,7.5-3.357,7.5-7.5S339.642,328,335.5,328z"></path> </g> </g></svg>' // Fallback icon (e.g., book/brain)
        };

        // --- State ---
        this.currentMaterial = null; // Determined by API response initially
        this.availableMaterials = []; // Summary data for all materials
        this.chaptersData = []; // Mastery data for the *current* material
        this.currentMaterialSettings = null; // Settings for the *current* material
        this.selectedChapters = new Set();
        this.isSelectionMode = false;
        this.isLoading = { // Track loading state for different parts
            dashboard: false, // For the main dashboard summary call
            switchMaterial: false, // For loading data when switching materials
            rename: false,
            delete: false,
            saveSettings: false,
        };
        this.chartInstance = null;
        this.chapterContextMenuTargetChapter = null;
        this.materialContextMenuTargetMaterial = null;
        this.activeRenameInput = null;
        this.isStudyOptionsPopupVisible = false;
        this.materialScrollInterval = null;
        this.materialScrollSpeed = 0;
        this.currentMaterialScroll = 0;
        this.editingMaterialName = null;
        this.editingMaterialSettings = null;
        this.batchSizeSaveTimeout = null;

        // --- Bind Methods ---
        // Main Load & Switch
        this.initialize = this.initialize.bind(this);
        this._processDashboardSummary = this._processDashboardSummary.bind(this);
        this._handleMaterialSwitch = this._handleMaterialSwitch.bind(this);
        // Rendering
        this._renderMaterialTabs = this._renderMaterialTabs.bind(this);
        this._renderHeatmap = this._renderHeatmap.bind(this);
        this._renderChapterGrid = this._renderChapterGrid.bind(this);
        this._renderTimelineGraph = this._renderTimelineGraph.bind(this);
        this._renderReviewActivityHeatmap = this._renderReviewActivityHeatmap.bind(this);
        // Interactions
        this._handleChapterGridClick = this._handleChapterGridClick.bind(this);
        this._handleStudyDueClick = this._handleStudyDueClick.bind(this);
        this._handleFocusedStudyClick = this._handleFocusedStudyClick.bind(this);
        this._toggleStudyOptionsPopup = this._toggleStudyOptionsPopup.bind(this);
        this._hideStudyOptionsPopup = this._hideStudyOptionsPopup.bind(this);
        this._handleBatchSizeChange = this._handleBatchSizeChange.bind(this);
        this._saveBatchSizeSetting = this._saveBatchSizeSetting.bind(this);
        // Context Menus & Actions
        this._handleContextMenu = this._handleContextMenu.bind(this); // Chapter right-click
        this._handleContextMenuClick = this._handleContextMenuClick.bind(this); // Chapter menu action
        this._handleMaterialContextMenu = this._handleMaterialContextMenu.bind(this); // Material right-click
        this._handleMaterialContextMenuClick = this._handleMaterialContextMenuClick.bind(this); // Material menu action
        this._handleRenameChapter = this._handleRenameChapter.bind(this);
        this._handleDeleteChapter = this._handleDeleteChapter.bind(this);
        this._executeDeleteChapter = this._executeDeleteChapter.bind(this);
        this._handleRenameInputKeydown = this._handleRenameInputKeydown.bind(this);
        this._handleRenameInputBlur = this._handleRenameInputBlur.bind(this);
        this._confirmRename = this._confirmRename.bind(this);
        this._cancelRename = this._cancelRename.bind(this);
        this._handleSetDefaultMaterial = this._handleSetDefaultMaterial.bind(this);
        // Settings Modal
        this._openMaterialSettingsModal = this._openMaterialSettingsModal.bind(this);
        this._populateSettingsForm = this._populateSettingsForm.bind(this);
        this._handleSettingsSave = this._handleSettingsSave.bind(this);
        this._handleSettingsCancel = this._handleSettingsCancel.bind(this);
        this._collectSettingsFormData = this._collectSettingsFormData.bind(this);
        // Modals & Tooltips
        this._showModal = this._showModal.bind(this);
        this._hideModal = this._hideModal.bind(this);
        this._showInfoMessage = this._showInfoMessage.bind(this);
        this._showError = this._showError.bind(this);
        this._showHeatmapTooltip = this._showHeatmapTooltip.bind(this);
        this._hideHeatmapTooltip = this._hideHeatmapTooltip.bind(this);
        // Helpers
        this._updateLoadingState = this._updateLoadingState.bind(this);
        this._updateActiveMaterialTab = this._updateActiveMaterialTab.bind(this);
        this._updatePillStats = this._updatePillStats.bind(this);
        this._toggleSelectionModeUI = this._toggleSelectionModeUI.bind(this);
        this._updateFocusedStudyButtonState = this._updateFocusedStudyButtonState.bind(this);
        this._navigateToChapterDetails = this._navigateToChapterDetails.bind(this);
        this._getMasteryLevelClass = this._getMasteryLevelClass.bind(this);
        this._getReviewIntensityClass = this._getReviewIntensityClass.bind(this);
        this._findChapterCardElement = this._findChapterCardElement.bind(this);
        this._debounce = this._debounce.bind(this);
        // Material Scrolling
        this._handleMaterialScroll = this._handleMaterialScroll.bind(this);
        this._updateMaterialScrollState = this._updateMaterialScrollState.bind(this);
    }

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

    /**
     * Initializes the Chapter Folders view.
     * Uses the new dashboard summary endpoint for efficient initial data loading.
     * Displays skeleton loaders while fetching data.
     */
    async initialize() {
        console.log(`Initializing ChapterFoldersView...`);

        // Check required elements (ensure pill switcher inner is included)
        const requiredElements = [
            this.container, this.heatmapGrid, this.reviewScheduleCanvas, this.reviewScheduleContainer,
            this.reviewStatusElement, this.chapterGrid, this.heatmapTooltipElement, this.reviewActivityGrid,
            this.chapterContextMenu, this.materialContextMenu,
            this.confirmationModalOverlay, this.errorModalOverlay, this.infoModalOverlay, this.settingsModalOverlay,
            this.floatingStudyPill, this.pillMaterialSwitcher, this.pillMaterialSwitcherInner, // Check inner
            this.pillNewCardsCount, this.pillDueCardsCount, this.pillStudyButtonWrapper,
            this.pillStudyDueButton, this.pillOptionsTrigger, this.studyOptionsPopup,
            this.pillStartFocusedButton, this.pillReviewBatchSize
        ];
        if (requiredElements.some(el => !el)) {
            console.error("ChapterFoldersView: Missing required DOM elements. Check IDs and structure.", { missing: requiredElements.map((el, i) => el ? null : i).filter(x => x !== null) });
            if (document.body) document.body.innerHTML = '<p style="color: red; font-size: 1.2em; padding: 20px;">Error: Interface failed to load - elements missing.</p>';
            return;
        }

        // Check Chart.js
        if (typeof Chart === 'undefined') {
            console.error("Chart.js library not found.");
            this._renderTimelineGraph(null, false, true, "Charting library failed to load."); // Show error in graph area
            // Don't necessarily stop the whole view init, other parts might work
        }

        // --- Setup & Initial State ---
        this._attachEventListeners();
        this.saveBatchSizeDebounced = this._debounce(this._saveBatchSizeSetting, 1000);
        this.isSelectionMode = false;
        this._toggleSelectionModeUI(false); // Ensure correct initial UI

        // --- Show Skeleton Loaders & Start Data Fetch ---
        this._updateLoadingState('dashboard', true); // Set main loading state
        this._renderUIPlaceholders(true); // Render all sections in loading state

        try {
            console.log("Fetching dashboard summary data...");
            const summaryData = await apiClient.getDashboardSummary();
            console.log("Dashboard summary data received:", summaryData);
            this._processDashboardSummary(summaryData);

        } catch (error) {
            console.error("FATAL: Failed to fetch initial dashboard summary:", error);
            this._showError(`Failed to load dashboard: ${error.message || 'Unknown error'}`);
            this._renderUIPlaceholders(false, true); // Render all sections in error state
        } finally {
            this._updateLoadingState('dashboard', false); // Clear main loading state
            console.log("Chapter Folders View Initialized (or initialization failed).");
        }
    }

    /**
     * Renders placeholder/skeleton/loading or error states for all main UI sections.
     * @param {boolean} showLoading - True to show loading state, false otherwise.
     * @param {boolean} showError - True to show error state (overrides loading).
     * @private
     */
    _renderUIPlaceholders(showLoading, showError = false) {
        console.log(`Rendering placeholders: loading=${showLoading}, error=${showError}`);
        const loadingMsg = '<p class="loading-text">Loading...</p>';
        const errorMsg = '<p class="error-text">Error loading data</p>';

        // Material Tabs (Render a single loading button)
        if (this.pillMaterialSwitcherInner) {
            if (showLoading || showError) {
                this.pillMaterialSwitcherInner.innerHTML = `
                    <button class="material-tab is-loading" aria-label="${showError ? 'Error loading' : 'Loading'} materials..." disabled>
                        ${showError
                            ? '<svg viewBox="0 0 24 24" fill="#d9534f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path></svg>'
                            : '<svg viewBox="0 0 24 24" style="animation: spin 1.5s linear infinite;"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"></path></svg>'
                        }
                    </button>`;
                this.pillMaterialSwitcher.classList.remove('has-multiple', 'has-3plus-materials');
            } else {
                 // Do nothing here, _renderMaterialTabs will handle actual rendering
                 // this.pillMaterialSwitcherInner.innerHTML = ''; // Clear only if needed
            }
        }

        // Pill Stats
        if (this.pillDueCardsCount) this.pillDueCardsCount.textContent = (showLoading || showError) ? '-' : '0';
        if (this.pillNewCardsCount) this.pillNewCardsCount.textContent = (showLoading || showError) ? '-' : '0';

        // Chapter Mastery Heatmap
        if (this.heatmapGrid) {
            this.heatmapGrid.innerHTML = showError ? errorMsg : (showLoading ? loadingMsg : '');
        }
        // Chapter Grid
        if (this.chapterGrid) {
            this.chapterGrid.innerHTML = showError ? errorMsg : (showLoading ? loadingMsg : '');
        }
        // Review Activity Heatmap
        if (this.reviewActivityGrid) {
            this.reviewActivityGrid.innerHTML = showError ? errorMsg : (showLoading ? loadingMsg : '');
        }
        // Review Schedule Graph
        this._renderTimelineGraph(null, showLoading, showError);
    }

    /**
     * Processes the data received from the /dashboard-summary endpoint.
     * Updates state and triggers rendering for each section.
     * @param {object} summaryData - The response object from getDashboardSummary.
     * @private
     */
    _processDashboardSummary(summaryData) {
        if (!summaryData) {
             console.error("Processing failed: No summary data received.");
             this._renderUIPlaceholders(false, true); // Show error state everywhere
             this._showError("Received invalid data from server.");
            return;
        }

        // --- 1. Process Materials & Select Current ---
        if (summaryData.materials && Array.isArray(summaryData.materials)) {
            this.availableMaterials = summaryData.materials;
            this.currentMaterial = summaryData.selectedMaterialName; // Can be null if none found
            this._renderMaterialTabs(this.availableMaterials); // Render tabs (handles errors within)
        } else {
            console.warn("No materials data found in summary response.");
            this.availableMaterials = [];
            this.currentMaterial = null;
            this._renderMaterialTabs([]); // Render empty state
            // Don't necessarily error out the whole view if just materials are missing
        }

        // If no material could be selected (e.g., first load, no materials exist)
        if (!this.currentMaterial) {
            console.warn("No material selected or available. Skipping dependent data processing.");
            this._renderHeatmap(null, false, !summaryData.materials); // Show error if materials fetch failed
            this._renderChapterGrid(null, false, !summaryData.materials);
            this._renderTimelineGraph(null, false, true, 'No material selected');
            this._updatePillStats(null);
            // Keep activity heatmap loading/error state as is (it's global)
            if (summaryData.recentStudyStats) {
                this._renderReviewActivityHeatmap(summaryData.recentStudyStats);
            } else {
                this._renderReviewActivityHeatmap(null, true); // Show error for activity
            }
            return; // Stop further processing if no material
        }

        // --- 2. Process Data for the Selected Material ---
        // Settings
        if (summaryData.settings && !summaryData.settings.error) {
            this.currentMaterialSettings = summaryData.settings;
            // Update UI elements directly related to settings
            const batchSize = this.currentMaterialSettings.defaultBatchSize ?? 20;
            if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = batchSize;
            console.log(`Settings processed for ${this.currentMaterial}, batch size: ${batchSize}`);
        } else {
            console.error(`Error loading settings for ${this.currentMaterial}:`, summaryData.settings?.error);
            this.currentMaterialSettings = null;
            if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = 20; // Fallback
             // Optionally show a non-critical error message
             // this._showError(`Could not load settings for ${this.currentMaterial}. Using defaults.`, true); // Temporary?
        }

        // Chapter Mastery
        if (summaryData.chapterMastery && !summaryData.chapterMastery.error) {
            this.chaptersData = summaryData.chapterMastery;
            this.chaptersData.sort((a, b) => (a.chapter || '').localeCompare(b.chapter || ''));
            this._renderHeatmap(this.chaptersData); // Render with data
            this._renderChapterGrid(this.chaptersData); // Render with data
        } else {
            console.error(`Error loading chapter mastery for ${this.currentMaterial}:`, summaryData.chapterMastery?.error);
            this.chaptersData = [];
            this._renderHeatmap(null, true); // Show error state
            this._renderChapterGrid(null, true); // Show error state
        }

        // Due Timeline
        if (summaryData.dueTimeline && !summaryData.dueTimeline.error) {
            this._renderTimelineGraph(summaryData.dueTimeline); // Render with data
        } else {
            console.error(`Error loading due timeline for ${this.currentMaterial}:`, summaryData.dueTimeline?.error);
            this._renderTimelineGraph(null, false, true); // Show error state
        }

        // --- 3. Process Global Data ---
        // Recent Study Stats (Activity Heatmap)
        if (summaryData.recentStudyStats && !summaryData.recentStudyStats.error) {
            this._renderReviewActivityHeatmap(summaryData.recentStudyStats); // Render with data
        } else {
            console.error("Error loading recent study stats:", summaryData.recentStudyStats?.error);
            this._renderReviewActivityHeatmap(null, true); // Show error state
        }

        // --- 4. Update Pill Stats (using processed materials data) ---
        this._updatePillStats(this.currentMaterial);

        // Update scroll state for material tabs now that they are rendered
        this._updateMaterialScrollState();
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


    /**
     * Attaches event listeners.
     * @private
     */
    _attachEventListeners() {
        // Chapter Grid Listeners
        this.chapterGrid?.addEventListener('click', this._handleChapterGridClick);
        this.chapterGrid?.addEventListener('contextmenu', this._handleContextMenu);
        this.chapterContextMenu?.addEventListener('click', this._handleContextMenuClick);

        // Pill Listeners
        this.pillMaterialSwitcher?.addEventListener('click', this._handleMaterialSwitch);
        this.pillMaterialSwitcher?.addEventListener('contextmenu', this._handleMaterialContextMenu);
        this.pillMaterialSwitcher?.addEventListener('wheel', this._handleMaterialScroll, { passive: false });
        this.pillStudyDueButton?.addEventListener('click', this._handleStudyDueClick);
        this.pillOptionsTrigger?.addEventListener('click', this._toggleStudyOptionsPopup);
        this.pillStartFocusedButton?.addEventListener('click', this._handleFocusedStudyClick);
        this.pillReviewBatchSize?.addEventListener('input', this._handleBatchSizeChange);

        // Material Context Menu Listener
        this.materialContextMenu?.addEventListener('click', this._handleMaterialContextMenuClick);

        // Settings Modal Listeners
        this.settingsSaveButton?.addEventListener('click', this._handleSettingsSave);
        this.settingsCancelButton?.addEventListener('click', this._handleSettingsCancel);

        // Generic Modal Close Buttons
        this.errorModalActions?.addEventListener('click', (event) => {
            if (event.target.matches('[data-action="close"]')) this._hideModal('errorModal');
        });
        this.infoModalActions?.addEventListener('click', (event) => {
            if (event.target.matches('[data-action="close"]')) this._hideModal('infoModal');
        });
        // Confirmation modal buttons are handled dynamically in _showModal

        // Global Listeners
        document.addEventListener('click', (event) => {
            // Hide Chapter Context Menu
            if (this.chapterContextMenu?.style.display === 'block' && !this.chapterContextMenu.contains(event.target) && !event.target.closest('.chapter-card')) {
                this._hideContextMenu('chapter');
            }
            // Hide Material Context Menu
            if (this.materialContextMenu?.style.display === 'block' && !this.materialContextMenu.contains(event.target) && !event.target.closest('.material-tab')) {
                this._hideContextMenu('material');
            }
            // Hide Study Options Popup (if not selecting chapters)
            if (this.isStudyOptionsPopupVisible && !this.studyOptionsPopup?.contains(event.target) && !this.pillStudyButtonWrapper?.contains(event.target) && !this.isSelectionMode) {
                this._hideStudyOptionsPopup();
            }
            // Hide Rename Input
            if (this.activeRenameInput && !this.activeRenameInput.contains(event.target) && !event.target.closest('.chapter-card.is-renaming')) {
                const card = this.activeRenameInput.closest('.chapter-card');
                if (card) this._cancelRename(card);
            }
        }, true); // Use capture phase

        // Hide menus/popups on scroll/resize/escape
        const hidePopupsOnEvent = () => {
            this._hideContextMenu('chapter');
            this._hideContextMenu('material');
            if (!this.isSelectionMode) { // Don't hide study popup if selecting
                this._hideStudyOptionsPopup();
            }
        };
        window.addEventListener('scroll', hidePopupsOnEvent, true);
        window.addEventListener('resize', hidePopupsOnEvent);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                if (this.activeRenameInput) { // Prioritize rename cancel
                    const card = this.activeRenameInput.closest('.chapter-card');
                    if (card) this._cancelRename(card);
                } else if (this.isSelectionMode) { // Then selection mode cancel
                    this._toggleSelectionModeUI(false);
                } else { // Then hide popups/menus
                    hidePopupsOnEvent();
                }
            }
        });
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


     /**
     * Renders the chapter grid. Handles loading/error/empty states.
     * @param {Array<object> | null} chapters - Array of chapter mastery objects or null/error indicator.
     * @param {boolean} [showError=false] - Explicitly show error state.
     * @private
     */
     _renderChapterGrid(chapters, showError = false) {
        if (!this.chapterGrid) return;

        if (showError) {
            this.chapterGrid.innerHTML = '<p class="error-text">Error loading chapters</p>';
            return;
        }
        if (chapters === null || typeof chapters === 'undefined') { // Loading state
            this.chapterGrid.innerHTML = '<p class="loading-text">Loading chapters...</p>'; // Or skeleton cards
            return;
        }
         if (chapters.length === 0) {
            this.chapterGrid.innerHTML = `<p>No chapters available for ${this.currentMaterial || 'this material'}.</p>`; // Empty state
             return;
         }

        // Render actual chapter cards
        this.chapterGrid.innerHTML = ''; // Clear loading/previous
        const fragment = document.createDocumentFragment();

        chapters.forEach(chapter => {
            if (!chapter || !chapter.chapter) return; // Skip invalid data

            const card = document.createElement('div');
            card.classList.add('chapter-card');
            const chapterName = chapter.chapter;
            card.dataset.chapterName = chapterName;

            const masteryPercent = Math.max(0, Math.min(100, chapter.mastery ?? 0));
            const totalCards = chapter.totalCards ?? 0;
            const dueCards = chapter.dueCards ?? 0;
            const remainingNewCards = chapter.remainingNewCards ?? 0;
            const masteryLevel = this._getMasteryLevelClass(masteryPercent);
            const radius = 15.915;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (masteryPercent / 100) * circumference;

            // Using template literal for structure
            card.innerHTML = `
                <input type="checkbox" class="selection-checkbox" aria-label="Select Chapter: ${chapterName}">
                <div class="card-content-wrapper">
                    <div class="card-header-new">
                        <div class="chapter-title-area">
                            <span class="chapter-name">${chapterName}</span>
                            <input type="text" class="rename-input" value="${chapterName}" style="display: none;" data-original-name="${chapterName}">
                        </div>
                        <div class="mastery-progress-circle ${masteryLevel}" data-mastery-percent="${masteryPercent}" title="Mastery: ${masteryPercent}%">
                            <svg viewBox="0 0 36 36" class="progress-ring">
                                <circle class="progress-ring-bg" cx="18" cy="18" r="${radius}" />
                                <circle class="progress-ring-circle" cx="18" cy="18" r="${radius}"
                                        stroke-dasharray="${circumference} ${circumference}"
                                        stroke-dashoffset="${offset}" />
                            </svg>
                            <span class="mastery-percentage">${masteryPercent}%</span>
                        </div>
                    </div>
                    <div class="card-stats-new">
                        <div class="stat-item-new total-cards" title="Total Cards">
                            <svg class="card-icon" width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                        <title>Icon representing a deck of taller flashcards, showing one</title>
                                        <!-- Back Card (rotated slightly more, taller) -->
                                        <rect x="6" y="4" width="20" height="24" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.5" transform="rotate(-6 16 16)" /> 
                                        <!-- Front Card Group (rotated slightly less) -->
                                        <g transform="rotate(4 13 13)"> 
                                            <!-- Front Card Outline (taller) -->
                                            <rect x="4" y="2" width="18" height="22" rx="3" ry="3" fill="none" stroke="currentColor" stroke-width="1.5" />
                                        </g>
                                    </svg>
                            <span class="stat-value" data-stat="total">${totalCards}</span>
                        </div>
                        <div class="stat-item-new due-cards" title="Cards Due">
                            <svg class="stat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                 <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
                            <span class="stat-value" data-stat="due">${dueCards}</span>
                        </div>
                        <div class="stat-item-new new-cards" title="New Cards Remaining">
                            <svg class="stat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 7H11v4H7v2h4v4h2v-4h4v-2h-4V7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
             </svg>
                            <span class="stat-value" data-stat="new">${remainingNewCards}</span>
                        </div>
                    </div>
                </div>`;

            // Attach listeners for rename input
            const renameInput = card.querySelector('.rename-input');
            if (renameInput) {
                renameInput.addEventListener('keydown', this._handleRenameInputKeydown);
                renameInput.addEventListener('blur', this._handleRenameInputBlur);
            } else {
                console.warn("Rename input not found for card:", chapterName);
            }

            fragment.appendChild(card);
        });

        this.chapterGrid.appendChild(fragment);
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
     * @param {object | null} timelineData - Date->count map, or null/error indicator.
     * @param {boolean} [isLoading=false] - Explicitly show loading state.
     * @param {boolean} [isError=false] - Explicitly show error state.
     * @param {string} [customMessage=null] - Override default status messages.
     * @private
     */
    _renderTimelineGraph(timelineData, isLoading = false, isError = false, customMessage = null) {
        if (!this.reviewScheduleCanvas || !this.reviewScheduleContainer || !this.reviewStatusElement) {
            console.error("Timeline graph elements missing!");
            return;
        }
        const ctx = this.reviewScheduleCanvas.getContext('2d');

        const showStatus = (message, isErr = false) => {
            this.reviewStatusElement.textContent = message;
            this.reviewStatusElement.style.color = isErr ? 'var(--danger-red)' : 'var(--text-secondary)';
            this.reviewStatusElement.style.display = 'block';
            this.reviewScheduleCanvas.style.display = 'none';
            if (this.chartInstance) {
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
        };
        const hideStatus = () => {
            this.reviewStatusElement.style.display = 'none';
            this.reviewScheduleCanvas.style.display = 'block';
        };

        // Handle States
        if (customMessage) {
            showStatus(customMessage, isError);
            return;
        }
        if (isLoading) {
            showStatus('Loading schedule...');
            return;
        }
        if (isError) {
            showStatus('Error loading schedule', true);
            return;
        }
        if (!timelineData || Object.keys(timelineData).length === 0) {
            showStatus('No upcoming reviews');
            return;
        }

        // Proceed with rendering
        hideStatus();
        if (this.chartInstance) {
             this.chartInstance.destroy(); // Destroy previous instance
        }
        let existingChart = Chart.getChart(this.reviewScheduleCanvas);
        if (existingChart) { existingChart.destroy(); } // Ensure canvas is clean

        const sortedDates = Object.keys(timelineData).sort();
        const labels = sortedDates;
        const dataCounts = sortedDates.map(date => timelineData[date]);

        try {
            this.chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Due Cards',
                        data: dataCounts,
                        backgroundColor: 'rgba(91, 192, 222, 0.6)',
                        borderColor: 'rgba(91, 192, 222, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        borderSkipped: false,
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
        } catch (chartError) {
            console.error("Failed to render chart:", chartError);
            showStatus('Error displaying graph', true);
            this._showError("Failed to display review schedule graph.");
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

    _handleFocusedStudyClick() {
        if (!this.currentMaterial || this.isLoading.dashboard || this.isLoading.switchMaterial) return;

        if (!this.isSelectionMode) {
            // Enter Selection Mode
            console.log("Entering chapter selection mode...");
            this._toggleSelectionModeUI(true);
            // Keep popup open automatically
        } else {
            // Launch Focused Session
            console.log("Attempting to launch focused study...");
            if (this.selectedChapters.size === 0) {
                this._showModal('errorModal', 'No Chapters Selected', 'Please select one or more chapters from the grid first.');
                return;
            }

            const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0;
            const chapters = Array.from(this.selectedChapters);
            const encodedChapters = chapters.map(name => encodeURIComponent(name)).join(',');
            const material = encodeURIComponent(this.currentMaterial);
            let url = `study-session.html?material=${material}&chapters=${encodedChapters}`;
            if (batchSize > 0) {
                url += `&batchSize=${batchSize}`;
            }
            console.log(`Navigating to focused session: ${url}`);
            window.location.href = url;

            // Exit selection mode after launching
            this._toggleSelectionModeUI(false);
        }
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

    _handleContextMenu(event) { this._showContextMenu('chapter', event); }
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

    _findChapterCardElement(chapterName) {
        // Use CSS escaping for special characters if needed
        try {
           return this.chapterGrid?.querySelector(`.chapter-card[data-chapter-name="${CSS.escape(chapterName)}"]`);
        } catch (e) { // Fallback for browsers without CSS.escape
           return this.chapterGrid?.querySelector(`.chapter-card[data-chapter-name="${chapterName.replace(/["\\]/g, '\\$&')}"]`);
        }
    }

    // --- Settings Modal Logic (Largely Unchanged) ---

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

    // --- Selection Mode & UI Updates ---

    _toggleSelectionModeUI(isEntering) {
        this.isSelectionMode = isEntering;
        this.container?.classList.toggle('selection-mode', isEntering);

        if (!this.pillStartFocusedButton) return;

        if (isEntering) {
            this.pillStartFocusedButton.textContent = 'Focused Study (0)'; // Initial count
            this.pillStartFocusedButton.classList.add('is-selecting-chapters');
            this.pillStartFocusedButton.disabled = true; // Disabled initially
            this._updateFocusedStudyButtonState(); // Update count/disabled state

            // Ensure popup stays open
            if (!this.isStudyOptionsPopupVisible) {
                this._toggleStudyOptionsPopup();
            }
            // Clear any previous selections
             this.selectedChapters.clear();
             this.chapterGrid?.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
             this.chapterGrid?.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);

        } else {
            this.pillStartFocusedButton.textContent = 'Select Chapters...';
            this.pillStartFocusedButton.classList.remove('is-selecting-chapters');
            this.pillStartFocusedButton.disabled = false;
            this.pillStartFocusedButton.style.opacity = '1';
            this.pillStartFocusedButton.style.cursor = 'pointer';

            // Deselect visually
            this.selectedChapters.clear();
            this.chapterGrid?.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
            this.chapterGrid?.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);

            // Optionally close the popup when exiting selection mode
            // if (this.isStudyOptionsPopupVisible) {
            //     this._hideStudyOptionsPopup();
            // }
        }

        this._hideHeatmapTooltip();
        this._hideContextMenu('chapter');
        this._hideContextMenu('material');
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


    // --- Modal & Tooltip Helpers (Unchanged) ---

    _showModal(modalId, title, message, buttons = [], iconType = 'warning') {
        let modalOverlay, modalTitle, modalMessage, modalActions, modalIcon;

        // Use specific refs based on modalId
        if (modalId === 'confirmationModal') {
            modalOverlay = this.confirmationModalOverlay; modalTitle = this.confirmModalTitle; modalMessage = this.confirmModalMessage; modalActions = this.confirmModalActions; modalIcon = this.confirmModalIcon;
            if (modalIcon) modalIcon.className = `modal-icon ${iconType}`; // Set icon
        } else if (modalId === 'errorModal') {
            modalOverlay = this.errorModalOverlay; modalTitle = this.errorModalTitle; modalMessage = this.errorModalMessage; modalActions = this.errorModalActions;
            // Error icon is usually static via CSS/HTML
        } else if (modalId === 'infoModal') {
            modalOverlay = this.infoModalOverlay; modalTitle = this.infoModalTitle; modalMessage = this.infoModalMessage; modalActions = this.infoModalActions; modalIcon = this.infoModalIcon;
             if (modalIcon) modalIcon.className = `modal-icon info`; // Set icon to 'info'
        } else if (modalId === 'settingsModal') {
            modalOverlay = this.settingsModalOverlay;
            // Settings modal content/title is managed separately, just show/hide overlay
             if (!modalOverlay) { console.error("Settings modal elements not found"); return; }
             modalOverlay.classList.add('visible');
             return; // Exit early for settings modal
        } else {
            console.error("Unknown modal ID:", modalId); return;
        }

        if (!modalOverlay || !modalTitle || !modalMessage || !modalActions) {
            console.error("Modal elements not found for ID:", modalId); return;
        }

        modalTitle.textContent = title;
        modalMessage.innerHTML = message; // Allow basic HTML like <strong>
        modalActions.innerHTML = ''; // Clear previous buttons

        // Add dynamic buttons (primarily for confirmation)
        if (buttons.length > 0) {
            buttons.forEach(btnConfig => {
                const button = document.createElement('button');
                button.textContent = btnConfig.text;
                button.classList.add('modal-button', btnConfig.class);
                button.addEventListener('click', () => {
                    this._hideModal(modalId); // Hide first
                    if (typeof btnConfig.action === 'function') btnConfig.action();
                });
                modalActions.appendChild(button);
            });
        } else if (modalId === 'errorModal' || modalId === 'infoModal') {
            // Add default OK button if none provided for error/info
            const okButton = modalActions.querySelector('[data-action="close"]');
             if (!okButton) { // Ensure it doesn't already exist
                 const staticOkButton = document.createElement('button');
                 staticOkButton.textContent = 'OK';
                 staticOkButton.classList.add('modal-button', 'secondary');
                 staticOkButton.dataset.action = 'close'; // Use data-action for listener
                 // Add listener directly (since we clear actions)
                 staticOkButton.addEventListener('click', () => this._hideModal(modalId));
                 modalActions.appendChild(staticOkButton);
             }
        }

        modalOverlay.classList.add('visible');
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

    // --- Helper Methods (Unchanged) ---

    _updateLoadingState(part, isLoading) {
        if (typeof this.isLoading[part] === 'undefined') {
            console.warn(`_updateLoadingState called for unknown part: ${part}`); return;
        }
        if (this.isLoading[part] === isLoading) return; // No change

        this.isLoading[part] = isLoading;
        console.log(`Loading state for ${part}: ${isLoading}`);

        // Determine if *any* operation is loading
        const anyLoading = Object.values(this.isLoading).some(state => state);
        this.container?.classList.toggle('is-loading', anyLoading); // General loading class

        // Disable specific controls based on which part is loading
        const disablePill = this.isLoading.dashboard || this.isLoading.switchMaterial || this.isLoading.saveSettings;
        this.pillMaterialSwitcher?.querySelectorAll('button').forEach(button => button.disabled = disablePill);
        if (this.pillStudyDueButton) this.pillStudyDueButton.disabled = disablePill;
        if (this.pillOptionsTrigger) this.pillOptionsTrigger.disabled = disablePill;
        if (this.pillReviewBatchSize) this.pillReviewBatchSize.disabled = this.isLoading.saveSettings || this.isLoading.dashboard; // Disable if saving or initial load

        // Hide tooltip if relevant data might be changing
        if (isLoading && (part === 'dashboard' || part === 'switchMaterial')) {
            this._hideHeatmapTooltip();
        }
    }

    _navigateToChapterDetails(chapterName) {
        if (!chapterName || !this.currentMaterial) return;
        const encodedChapter = encodeURIComponent(chapterName);
        const material = encodeURIComponent(this.currentMaterial);
        const url = `flashcards-view.html?material=${material}&chapter=${encodedChapter}`;
        console.log(`Navigating to chapter details: ${url}`);
        window.location.href = url;
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

} // End of ChapterFoldersView class


// --- Initialization Listener ---
document.addEventListener('DOMContentLoaded', () => {
    if (isViewInitialized) {
        console.warn("ChapterFoldersView: DOMContentLoaded fired again - Initialization attempt skipped.");
        return;
    }
    isViewInitialized = true;
    console.log("DOM Content Loaded - preparing to initialize view");
    const view = new ChapterFoldersView();
    view.initialize(); // Start the initialization process
});
// --- END OF FILE chapterFoldersView.js ---