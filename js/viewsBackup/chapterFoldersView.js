// --- File: js/views/chapterFoldersView.js ---

// Import the API client
import { apiClient } from '../api/apiClient.js';
// Import utility functions if needed (e.g., for URL encoding, maybe later)
// import { encodeUrlParams } from '../utils/helpers.js'; // Example

let isViewInitialized = false;
class ChapterFoldersView {
    constructor() {
        // --- DOM Element References ---
        this.container = document.getElementById('managementContainer');
        this.heatmapGrid = this.container?.querySelector('.chapter-mastery-section .heatmap-grid');
        this.reviewScheduleContainer = this.container?.querySelector('.review-schedule-graph'); // Container div
        this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas'); // Canvas element
        this.reviewStatusElement = this.reviewScheduleContainer?.querySelector('.graph-status');
        // --- ADD REFERENCE FOR REVIEW ACTIVITY HEATMAP ---
        this.reviewActivityGrid = this.container?.querySelector('.review-activity-section .review-heatmap-grid'); // Review Activity
        this.chapterGrid = document.getElementById('chapterGrid');
        this.heatmapTooltipElement = document.getElementById('heatmap-tooltip');
        // Chapter context menu
        this.chapterContextMenu = document.getElementById('chapterContextMenu');
        // --- NEW: Modal References ---
        this.confirmationModalOverlay = document.getElementById('confirmationModal');
        this.confirmModalTitle = document.getElementById('confirmModalTitle');
        this.confirmModalMessage = document.getElementById('confirmModalMessage');
        this.confirmModalActions = document.getElementById('confirmModalActions');
        this.confirmModalIcon = document.getElementById('confirmModalIcon'); // Added for icon setting

        this.errorModalOverlay = document.getElementById('errorModal');
        this.errorModalTitle = document.getElementById('errorModalTitle');
        this.errorModalMessage = document.getElementById('errorModalMessage');
        this.errorModalActions = document.getElementById('errorModalActions');

         // Settings modal direct references
         this.settingsModalOverlay = document.getElementById('materialSettingsModal');
         this.settingsModalTitle = document.getElementById('settingsModalTitle');
         this.settingsModalForm = document.getElementById('materialSettingsForm');
         this.settingsEditMaterialNameInput = document.getElementById('settingsEditMaterialName');
         this.settingsMaterialNameInput = document.getElementById('settingsMaterialName');
         this.settingsDailyLimitInput = document.getElementById('settingsDailyLimit');
         this.settingsDefaultBatchSizeInput = document.getElementById('settingsDefaultBatchSize');
         // SRS Algo Inputs (Ensure IDs match HTML)
         this.settingsAlgoLearningStepsInput = document.getElementById('settingsAlgoLearningSteps');
         this.settingsAlgoGraduationIntervalInput = document.getElementById('settingsAlgoGraduationInterval'); // Add if exists
         this.settingsAlgoLapseIntervalInput = document.getElementById('settingsAlgoLapseInterval'); // Add if exists
         this.settingsAlgoEasyBonusInput = document.getElementById('settingsAlgoEasyBonus');
         this.settingsAlgoMinEaseInput = document.getElementById('settingsAlgoMinEase'); // Add if exists
         this.settingsAlgoDefaultEaseInput = document.getElementById('settingsAlgoDefaultEase'); // Add if exists
         this.settingsAlgoHardMultiplierInput = document.getElementById('settingsAlgoHardMultiplier'); // Add if exists
         this.settingsAlgoMaxIntervalInput = document.getElementById('settingsAlgoMaxInterval'); // Add if exists
         this.settingsAlgoEaseAdjLapseInput = document.getElementById('settingsAlgoEaseAdjLapse'); // Add if exists
         this.settingsAlgoEaseAdjHardInput = document.getElementById('settingsAlgoEaseAdjHard'); // Add if exists
         this.settingsAlgoEaseAdjEasyInput = document.getElementById('settingsAlgoEaseAdjEasy'); // Add if exists
         // SRS Threshold Inputs
         this.settingsThresholdLearningRepsInput = document.getElementById('settingsThresholdLearningReps');
         this.settingsThresholdMasteredRepsInput = document.getElementById('settingsThresholdMasteredReps');
         this.settingsThresholdMasteredEaseInput = document.getElementById('settingsThresholdMasteredEase');
         this.settingsThresholdCriticalEaseInput = document.getElementById('settingsThresholdCriticalEase');
         // Actions
         this.settingsModalActions = document.getElementById('settingsModalActions');
         this.settingsSaveButton = document.getElementById('settingsSaveButton');
         this.settingsCancelButton = document.getElementById('settingsCancelButton');
                 // *** NEW: Info Modal Direct References ***
        this.infoModalOverlay = document.getElementById('infoModal');
        this.infoModalTitle = document.getElementById('infoModalTitle');
        this.infoModalMessage = document.getElementById('infoModalMessage');
        this.infoModalActions = document.getElementById('infoModalActions'); // Ref to actions container
        this.infoModalIcon = document.getElementById('infoModalIcon'); // Ref to icon span
        // --- End Info Modal Refs ---
        this.materialIcons = {
            'Mathematics': '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 142.514 142.514" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M34.367,142.514c11.645,0,17.827-10.4,19.645-16.544c0.029-0.097,0.056-0.196,0.081-0.297 c4.236-17.545,10.984-45.353,15.983-65.58h17.886c3.363,0,6.09-2.726,6.09-6.09c0-3.364-2.727-6.09-6.09-6.09H73.103 c1.6-6.373,2.771-10.912,3.232-12.461l0.512-1.734c1.888-6.443,6.309-21.535,13.146-21.535c6.34,0,7.285,9.764,7.328,10.236 c0.27,3.343,3.186,5.868,6.537,5.579c3.354-0.256,5.864-3.187,5.605-6.539C108.894,14.036,104.087,0,89.991,0 C74.03,0,68.038,20.458,65.159,30.292l-0.49,1.659c-0.585,1.946-2.12,7.942-4.122,15.962H39.239c-3.364,0-6.09,2.726-6.09,6.09 c0,3.364,2.726,6.09,6.09,6.09H57.53c-6.253,25.362-14.334,58.815-15.223,62.498c-0.332,0.965-2.829,7.742-7.937,7.742 c-7.8,0-11.177-10.948-11.204-11.03c-0.936-3.229-4.305-5.098-7.544-4.156c-3.23,0.937-5.092,4.314-4.156,7.545 C13.597,130.053,20.816,142.514,34.367,142.514z"></path> <path d="M124.685,126.809c3.589,0,6.605-2.549,6.605-6.607c0-1.885-0.754-3.586-2.359-5.474l-12.646-14.534l12.271-14.346 c1.132-1.416,1.98-2.926,1.98-4.908c0-3.59-2.927-6.231-6.703-6.231c-2.547,0-4.527,1.604-6.229,3.684l-9.531,12.454L98.73,78.391 c-1.89-2.357-3.869-3.682-6.7-3.682c-3.59,0-6.607,2.551-6.607,6.609c0,1.885,0.756,3.586,2.357,5.471l11.799,13.592 L86.647,115.67c-1.227,1.416-1.98,2.926-1.98,4.908c0,3.589,2.926,6.229,6.699,6.229c2.549,0,4.53-1.604,6.229-3.682l10.19-13.4 l10.193,13.4C119.872,125.488,121.854,126.809,124.685,126.809z"></path> </g> </g> </g></svg>', // Example: Calculator icon
            'Physics': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,256c0-38.187-36.574-71.637-94.583-93.355c1.015-6.127,1.894-12.177,2.5-18.091 c5.589-54.502-7.168-93.653-35.917-110.251c-9.489-5.478-20.378-8.26-32.341-8.26c-28.356,0-61.858,16.111-95.428,43.716 c-27.187-22.434-54.443-37.257-79.275-42.01c-4.642-0.905-9.105,2.142-9.993,6.776c-0.879,4.625,2.15,9.096,6.775,9.975 c21.282,4.079,45.15,17.109,69.308,36.702c-18.278,16.708-36.378,36.651-53.487,59.255c-28.561,3.447-55.031,9.088-78.592,16.529 c-4.395-27.913-4.13-52.813,1.331-72.439c2.321,0.495,4.71,0.785,7.168,0.785c18.825,0,34.133-15.309,34.133-34.133 c0-18.816-15.309-34.133-34.133-34.133S85.333,32.384,85.333,51.2c0,10.146,4.531,19.166,11.58,25.429 c-7.305,23.347-7.996,52.915-2.475,86.067C36.514,184.414,0,217.839,0,256c0,37.12,34.765,70.784,94.447,93.099 C84.25,410.206,94.933,458.615,128,477.713c9.489,5.478,20.378,8.252,32.35,8.252c28.382,0,61.918-16.136,95.505-43.785 c27.469,22.682,54.733,37.385,79.206,42.078c0.538,0.102,1.084,0.154,1.613,0.154c4.011,0,7.595-2.842,8.38-6.921 c0.879-4.634-2.15-9.105-6.776-9.992c-20.847-3.994-44.843-16.913-69.308-36.702c18.287-16.708,36.378-36.651,53.487-59.255 c28.578-3.456,55.066-9.088,78.626-16.538c4.395,27.887,4.122,52.787-1.365,72.457c-2.33-0.503-4.719-0.794-7.185-0.794 c-18.825,0-34.133,15.317-34.133,34.133c0,18.824,15.309,34.133,34.133,34.133c18.824,0,34.133-15.309,34.133-34.133 c0-10.138-4.523-19.149-11.563-25.412c7.339-23.407,8.047-52.966,2.526-86.101C475.52,327.561,512,294.144,512,256z M351.659,43.11c8.934,0,16.947,2.014,23.808,5.973c22.246,12.843,32.265,47.01,27.477,93.73 c-0.478,4.625-1.22,9.395-1.963,14.157c-23.518-7.424-49.937-13.047-78.438-16.495c-17.041-22.613-35.029-42.675-53.248-59.383 C298.846,57.148,327.791,43.11,351.659,43.11z M397.764,174.208c-4.139,19.396-10.266,39.603-18.202,60.186 c-6.093-12.689-12.766-25.429-20.087-38.127c-7.313-12.681-15.036-24.815-22.997-36.437 C358.519,163.328,379.153,168.209,397.764,174.208z M256.12,92.407c14.507,13.158,28.945,28.552,42.871,45.764 c-13.952-1.058-28.297-1.638-42.991-1.638c-14.669,0-28.988,0.58-42.914,1.63C227.063,120.934,241.579,105.574,256.12,92.407z M175.522,159.829c-7.97,11.614-15.676,23.782-22.98,36.446c-7.356,12.74-14.037,25.472-20.096,38.101 c-7.987-20.727-14.148-40.986-18.278-60.143C132.804,168.218,153.455,163.337,175.522,159.829z M119.467,34.133 c9.412,0,17.067,7.654,17.067,17.067c0,9.412-7.654,17.067-17.067,17.067c-9.404,0-17.067-7.654-17.067-17.067 C102.4,41.788,110.063,34.133,119.467,34.133z M17.067,256c0-29.79,31.548-57.088,80.777-75.998 c5.359,24.141,13.722,49.758,24.832,75.887c-11.264,26.419-19.61,52.113-24.934,76.194C47.283,312.619,17.067,284.774,17.067,256z M255.923,419.576c-13.474-12.169-26.923-26.291-39.927-42.052c0.734-1.092,1.28-2.295,1.886-3.465 c12.766,0.879,25.557,1.408,38.118,1.408c14.677,0,28.996-0.572,42.931-1.63C284.962,391.057,270.447,406.417,255.923,419.576z M313.267,355.277c-18.415,2.031-37.606,3.123-57.267,3.123c-11.29,0-22.775-0.469-34.261-1.203 c-0.648-18.253-15.59-32.93-34.005-32.93c-18.825,0-34.133,15.317-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133 c5.547,0,10.726-1.459,15.36-3.823c12.996,15.735,26.334,29.858,39.714,42.129c-29.585,23.996-58.573,38.059-82.458,38.059 c-8.943,0-16.947-2.005-23.817-5.973c-25.813-14.899-33.673-55.91-25.404-108.041c4.659,1.468,9.455,2.876,14.37,4.215 c4.523,1.237,9.233-1.451,10.479-5.99c1.237-4.548-1.442-9.233-5.999-10.47c-5.41-1.476-10.615-3.072-15.701-4.71 c4.105-19.123,10.197-39.424,18.185-60.262c5.658,11.802,11.844,23.646,18.577,35.447c1.57,2.756,4.454,4.301,7.415,4.301 c1.434,0,2.884-0.358,4.224-1.118c4.096-2.33,5.521-7.543,3.183-11.639c-9.207-16.128-17.391-32.418-24.516-48.58 c7.467-17.007,16.128-34.21,25.975-51.268c9.796-16.973,20.378-33.058,31.42-48.085c18.423-2.022,37.598-3.123,57.259-3.123 c19.686,0,38.886,1.101,57.327,3.132c11.017,15.036,21.572,31.112,31.369,48.068c9.796,16.964,18.458,34.116,25.967,51.106 c-7.561,17.101-16.162,34.295-25.975,51.302C334.891,324.164,324.318,340.25,313.267,355.277z M204.8,358.4 c0,4.796-1.997,9.122-5.197,12.22c-0.043,0.034-0.094,0.043-0.137,0.077c-0.051,0.034-0.068,0.094-0.119,0.137 c-3.046,2.85-7.117,4.634-11.614,4.634c-9.404,0-17.067-7.654-17.067-17.067c0-9.412,7.663-17.067,17.067-17.067 C197.146,341.333,204.8,348.988,204.8,358.4z M336.486,352.171c7.979-11.614,15.676-23.774,22.98-36.429 c7.313-12.672,13.943-25.472,20.062-38.263c8.021,20.779,14.208,41.079,18.347,60.279 C379.23,343.774,358.571,348.663,336.486,352.171z M392.533,477.867c-9.404,0-17.067-7.654-17.067-17.067 c0-9.412,7.663-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067C409.6,470.212,401.946,477.867,392.533,477.867z M414.242,331.972c-5.376-24.192-13.815-49.877-24.977-76.075c10.991-25.899,19.354-51.516,24.738-75.955 c49.314,18.91,80.93,46.234,80.93,76.058C494.933,285.773,463.428,313.062,414.242,331.972z"></path> </g> </g> </g></svg>', // Example: Atom icon
            // Add more mappings as needed
            'default': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M151.245,222.446C148.054,237.039,135.036,248,119.5,248c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c23.774,0,43.522-17.557,46.966-40.386c14.556-1.574,27.993-8.06,38.395-18.677c2.899-2.959,2.85-7.708-0.109-10.606 c-2.958-2.897-7.707-2.851-10.606,0.108C184.947,202.829,172.643,208,159.5,208c-26.743,0-48.5-21.757-48.5-48.5 c0-4.143-3.358-7.5-7.5-7.5s-7.5,3.357-7.5,7.5C96,191.715,120.119,218.384,151.245,222.446z"></path> <path d="M183,287.5c0-4.143-3.358-7.5-7.5-7.5c-35.014,0-63.5,28.486-63.5,63.5c0,0.362,0.013,0.725,0.019,1.088 C109.23,344.212,106.39,344,103.5,344c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5 c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.611-16.462-49.437-39.731-58.867c-0.178-1.699-0.269-3.418-0.269-5.133 c0-26.743,21.757-48.5,48.5-48.5C179.642,295,183,291.643,183,287.5z"></path> <path d="M439,223.5c0-17.075-6.82-33.256-18.875-45.156c1.909-6.108,2.875-12.426,2.875-18.844 c0-30.874-22.152-56.659-51.394-62.329C373.841,91.6,375,85.628,375,79.5c0-19.557-11.883-36.387-28.806-43.661 C317.999,13.383,287.162,0,263.5,0c-13.153,0-24.817,6.468-32,16.384C224.317,6.468,212.653,0,199.5,0 c-23.662,0-54.499,13.383-82.694,35.839C99.883,43.113,88,59.943,88,79.5c0,6.128,1.159,12.1,3.394,17.671 C62.152,102.841,40,128.626,40,159.5c0,6.418,0.965,12.735,2.875,18.844C30.82,190.244,24,206.425,24,223.5 c0,13.348,4.149,25.741,11.213,35.975C27.872,270.087,24,282.466,24,295.5c0,23.088,12.587,44.242,32.516,55.396 C56.173,353.748,56,356.626,56,359.5c0,31.144,20.315,58.679,49.79,68.063C118.611,449.505,141.965,463,167.5,463 c27.995,0,52.269-16.181,64-39.674c11.731,23.493,36.005,39.674,64,39.674c25.535,0,48.889-13.495,61.71-35.437 c29.475-9.385,49.79-36.92,49.79-68.063c0-2.874-0.173-5.752-0.516-8.604C426.413,339.742,439,318.588,439,295.5 c0-13.034-3.872-25.413-11.213-36.025C434.851,249.241,439,236.848,439,223.5z M167.5,448c-21.029,0-40.191-11.594-50.009-30.256 c-0.973-1.849-2.671-3.208-4.688-3.751C88.19,407.369,71,384.961,71,359.5c0-3.81,0.384-7.626,1.141-11.344 c0.702-3.447-1.087-6.92-4.302-8.35C50.32,332.018,39,314.626,39,295.5c0-8.699,2.256-17.014,6.561-24.379 C56.757,280.992,71.436,287,87.5,287c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5C60.757,272,39,250.243,39,223.5 c0-14.396,6.352-27.964,17.428-37.221c2.5-2.09,3.365-5.555,2.14-8.574C56.2,171.869,55,165.744,55,159.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-33.642-26.302-61.243-59.421-63.355C104.577,91.127,103,85.421,103,79.5c0-13.369,8.116-24.875,19.678-29.859 c0.447-0.133,0.885-0.307,1.308-0.527C127.568,47.752,131.447,47,135.5,47c12.557,0,23.767,7.021,29.256,18.325 c1.81,3.727,6.298,5.281,10.023,3.47c3.726-1.809,5.28-6.296,3.47-10.022c-6.266-12.903-18.125-22.177-31.782-25.462 C165.609,21.631,184.454,15,199.5,15c13.509,0,24.5,10.99,24.5,24.5v97.051c-6.739-5.346-15.25-8.551-24.5-8.551 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c13.509,0,24.5,10.99,24.5,24.5v180.279c-9.325-12.031-22.471-21.111-37.935-25.266 c-3.999-1.071-8.114,1.297-9.189,5.297c-1.075,4.001,1.297,8.115,5.297,9.189C206.8,343.616,224,366.027,224,391.5 C224,422.654,198.654,448,167.5,448z M395.161,339.807c-3.215,1.43-5.004,4.902-4.302,8.35c0.757,3.718,1.141,7.534,1.141,11.344 c0,25.461-17.19,47.869-41.803,54.493c-2.017,0.543-3.716,1.902-4.688,3.751C335.691,436.406,316.529,448,295.5,448 c-31.154,0-56.5-25.346-56.5-56.5c0-2.109-0.098-4.2-0.281-6.271c0.178-0.641,0.281-1.314,0.281-2.012V135.5 c0-13.51,10.991-24.5,24.5-24.5c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5c-9.25,0-17.761,3.205-24.5,8.551V39.5 c0-13.51,10.991-24.5,24.5-24.5c15.046,0,33.891,6.631,53.033,18.311c-13.657,3.284-25.516,12.559-31.782,25.462 c-1.81,3.727-0.256,8.214,3.47,10.022c3.726,1.81,8.213,0.257,10.023-3.47C303.733,54.021,314.943,47,327.5,47 c4.053,0,7.933,0.752,11.514,2.114c0.422,0.22,0.86,0.393,1.305,0.526C351.883,54.624,360,66.13,360,79.5 c0,5.921-1.577,11.627-4.579,16.645C322.302,98.257,296,125.858,296,159.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,6.244-1.2,12.369-3.567,18.205c-1.225,3.02-0.36,6.484,2.14,8.574 C417.648,195.536,424,209.104,424,223.5c0,26.743-21.757,48.5-48.5,48.5c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c16.064,0,30.743-6.008,41.939-15.879c4.306,7.365,6.561,15.68,6.561,24.379C424,314.626,412.68,332.018,395.161,339.807z"></path> <path d="M359.5,240c-15.536,0-28.554-10.961-31.745-25.554C358.881,210.384,383,183.715,383,151.5c0-4.143-3.358-7.5-7.5-7.5 s-7.5,3.357-7.5,7.5c0,26.743-21.757,48.5-48.5,48.5c-13.143,0-25.447-5.171-34.646-14.561c-2.898-2.958-7.647-3.007-10.606-0.108 s-3.008,7.647-0.109,10.606c10.402,10.617,23.839,17.103,38.395,18.677C315.978,237.443,335.726,255,359.5,255 c4.142,0,7.5-3.357,7.5-7.5S363.642,240,359.5,240z"></path> <path d="M335.5,328c-2.89,0-5.73,0.212-8.519,0.588c0.006-0.363,0.019-0.726,0.019-1.088c0-35.014-28.486-63.5-63.5-63.5 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5c0,1.714-0.091,3.434-0.269,5.133 C288.462,342.063,272,364.889,272,391.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.743,21.757-48.5,48.5-48.5 c4.142,0,7.5-3.357,7.5-7.5S339.642,328,335.5,328z"></path> </g> </g></svg>' // Fallback icon (e.g., book/brain)
        };
        // errorModalIcon ref not strictly needed if only ever error icon
        // --- Floating Pill References ---
        this.floatingStudyPill = document.getElementById('floatingStudyPill');
        this.pillMaterialSwitcher = document.getElementById('pillMaterialSwitcher');
        // *** ADDED: Inner container for scrolling ***
        this.pillMaterialSwitcherInner = null; // Will query inside initialize
        this.pillNewCardsCount = document.getElementById('pillNewCardsCount');
        this.pillDueCardsCount = document.getElementById('pillDueCardsCount');
        // Study Button Wrapper & Trigger
        this.pillStudyButtonWrapper = this.floatingStudyPill?.querySelector('.study-button-wrapper'); // Get wrapper
        this.pillStudyDueButton = document.getElementById('pillStudyDueButton');
        this.pillOptionsTrigger = document.getElementById('pillOptionsTrigger');
        // Study Options Popup & Contents
        this.studyOptionsPopup = document.getElementById('studyOptionsPopup');
        this.pillStartFocusedButton = document.getElementById('pillStartFocusedButton');
        this.pillReviewBatchSize = document.getElementById('pillReviewBatchSize');
        // --- End Pill References ---
        // --- NEW: Material Context Menu Reference ---
        this.materialContextMenu = document.getElementById('materialContextMenu');

        // --- State ---
        this.currentMaterial = 'Mathematics'; // Default material
        this.availableMaterials = []; // Store fetched materials
        this.chaptersData = []; // To store fetched data [{ chapter, mastery, totalCards, ... }, ...]
        this.selectedChapters = new Set(); // Store names/ids of selected chapters
        this.isSelectionMode = false;
        this.isLoading = {
            materials: false, // For initial material load
            chapters: false,  // For chapter grid / mastery heatmap
            timeline: false,  // For due timeline graph
            activity: false   // For activity heatmap
        };
        this.chartInstance = null; // To hold the Chart.js instance
        this.chapterContextMenuTargetChapter = null; // For chapter context menu
        this.materialContextMenuTargetMaterial = null; // For material context menu
        this.activeRenameInput = null; // Track the currently active input for blur/escape handling
        this.currentMaterialSettings = null; // Cache settings for batch size etc.
        this.isStudyOptionsPopupVisible = false; // Track popup state
        // --- Material Switcher Scroll State ---
        this.materialScrollInterval = null; // For holding down scroll
        this.materialScrollSpeed = 0;
        this.currentMaterialScroll = 0; // Current translateX value
        this.editingMaterialName = null; // Track which material is being edited
        this.editingMaterialSettings = null; // Store settings *before* editing
        this.batchSizeSaveTimeout = null; // For debouncing batch size saves

        

        // --- Bind Methods ---
        this._updateLoadingState = this._updateLoadingState.bind(this); // Bind this!
        this._loadAndRenderMaterials = this._loadAndRenderMaterials.bind(this);
        this._loadDataForMaterial = this._loadDataForMaterial.bind(this);
        this._loadReviewActivityData = this._loadReviewActivityData.bind(this);
        // ... other binds ...
        this._handleMaterialSwitch = this._handleMaterialSwitch.bind(this);
        this._handleSessionButtonClick = this._handleSessionButtonClick.bind(this);
        this._handleChapterGridClick = this._handleChapterGridClick.bind(this);
        this._showHeatmapTooltip = this._showHeatmapTooltip.bind(this);
        this._hideHeatmapTooltip = this._hideHeatmapTooltip.bind(this);
        // --- NEW: Bind Context Menu Methods ---
        this._handleContextMenu = this._handleContextMenu.bind(this);
        this._hideContextMenu = this._hideContextMenu.bind(this);
        this._handleContextMenuClick = this._handleContextMenuClick.bind(this);
        this._handleRenameChapter = this._handleRenameChapter.bind(this);
        this._handleDeleteChapter = this._handleDeleteChapter.bind(this); // Initiates confirmation
        this._handleRenameInputKeydown = this._handleRenameInputKeydown.bind(this);
        this._handleRenameInputBlur = this._handleRenameInputBlur.bind(this);
        this._confirmRename = this._confirmRename.bind(this);
        this._cancelRename = this._cancelRename.bind(this);
        this._showModal = this._showModal.bind(this); // Bind modal helpers
        this._hideModal = this._hideModal.bind(this);
        // --- UPDATED/NEW Binds ---
        this._handleStudyDueClick = this._handleStudyDueClick.bind(this);
        // Removed: _handleSettingsClick (now context menu)
        this._handleFocusedStudyClick = this._handleFocusedStudyClick.bind(this);
        this._updateActiveMaterialTab = this._updateActiveMaterialTab.bind(this);
        // Popup
        this._toggleStudyOptionsPopup = this._toggleStudyOptionsPopup.bind(this);
        this._hideStudyOptionsPopup = this._hideStudyOptionsPopup.bind(this);
        // Material Context Menu
        this._handleMaterialContextMenu = this._handleMaterialContextMenu.bind(this);
        this._handleMaterialContextMenuClick = this._handleMaterialContextMenuClick.bind(this);
        this._handleSetDefaultMaterial = this._handleSetDefaultMaterial.bind(this);
        this._openMaterialSettingsModal = this._openMaterialSettingsModal.bind(this); // New specific function
        // Material Scrolling
        this._handleMaterialScroll = this._handleMaterialScroll.bind(this);
        // --- End Updated Binds ---
        this._loadCurrentMaterialSettings = this._loadCurrentMaterialSettings.bind(this); // Ensure bound
        this._handleBatchSizeChange = this._handleBatchSizeChange.bind(this);
        // REMOVE: this._saveBatchSizeDebounced = this._saveBatchSizeDebounced.bind(this); // <--- REMOVE THIS LINE
        this._saveBatchSizeSetting = this._saveBatchSizeSetting.bind(this); // <--- ADD THIS LINE (Bind the actual method)
        this._openMaterialSettingsModal = this._openMaterialSettingsModal.bind(this);
        this._handleSettingsSave = this._handleSettingsSave.bind(this);
        this._handleSettingsCancel = this._handleSettingsCancel.bind(this);
        this._populateSettingsForm = this._populateSettingsForm.bind(this);
        this._collectSettingsFormData = this._collectSettingsFormData.bind(this);
        this._showInfoMessage = this._showInfoMessage.bind(this);
    
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
     * Attaches event listeners and loads initial data.
     */
    async initialize() {
        console.log(`Initializing ChapterFoldersView...`);

        // --- Check required elements (ensure new ones are checked) ---
        const requiredElements = [
            this.container, this.heatmapGrid, this.reviewScheduleCanvas, this.reviewScheduleContainer,
            this.reviewStatusElement, this.chapterGrid, this.heatmapTooltipElement, this.reviewActivityGrid,
            this.chapterContextMenu, this.confirmationModalOverlay, this.errorModalOverlay,
            this.floatingStudyPill, this.pillMaterialSwitcher, this.pillNewCardsCount, this.pillDueCardsCount,
            this.pillStudyButtonWrapper, this.pillStudyDueButton, this.pillOptionsTrigger, this.studyOptionsPopup,
            this.pillStartFocusedButton, this.pillReviewBatchSize, this.materialContextMenu
        ];
        if (requiredElements.some(el => !el)) {
            console.error("ChapterFoldersView: Missing required DOM elements. Check IDs and structure.", { missing: requiredElements.map((el, i) => el ? null : i).filter(x => x !== null) });
            if (document.body) document.body.innerHTML = '<p style="color: red; font-size: 1.2em; padding: 20px;">Error: Interface failed to load - elements missing.</p>';
            return;
        }
    if (typeof Chart === 'undefined') {
        console.error("Chart.js library not found.");
         if(this.reviewScheduleContainer) {
             this.reviewScheduleContainer.innerHTML = '<p style="color: red;">Charting library failed to load.</p>';
         }
         this._showError("Charting library failed to load.");
        return; // Stop execution
    }
    // *** Get ref to inner switcher container ***
    this.pillMaterialSwitcherInner = this.pillMaterialSwitcher.querySelector('.material-switcher-pill-inner');
    if (!this.pillMaterialSwitcherInner) { // Add the inner div if missing
        console.warn("'.material-switcher-pill-inner' not found. Creating dynamically.");
        this.pillMaterialSwitcherInner = document.createElement('div');
        this.pillMaterialSwitcherInner.className = 'material-switcher-pill-inner';
        // Move existing buttons into the inner container
        while (this.pillMaterialSwitcher.firstChild) {
            this.pillMaterialSwitcherInner.appendChild(this.pillMaterialSwitcher.firstChild);
        }
        this.pillMaterialSwitcher.appendChild(this.pillMaterialSwitcherInner);
    }
    
    console.log("Required DOM elements found, attaching listeners and loading data...");
        this._attachEventListeners();
        // *** Set up debounced function AFTER constructor binding ***
        this.saveBatchSizeDebounced = this._debounce(this._saveBatchSizeSetting, 1000); // Wrap the *actual* bound method
        // --- >> Load Materials and Set Initial State << ---
        try {
            this._updateLoadingState('materials', true);
            await this._loadAndRenderMaterials(); // Fetches materials, sets this.currentMaterial
            // No need to set loading false here, _loadAndRenderMaterials should handle its own state if needed

            if (this.currentMaterial && this.availableMaterials && this.availableMaterials.length > 0) {
                console.log(`Material '${this.currentMaterial}' found. Loading related data...`);
                // Load settings first (await it)
                await this._loadCurrentMaterialSettings();

                // Set loading states for parallel tasks
                this._updateLoadingState('chapters', true);
                // this._updateLoadingState('timeline', true); // Let _updatePillStats handle this
                this._updateLoadingState('activity', true);
                // this._updateLoadingState('stats', true); // Let _updatePillStats handle this
                this._updateLoadingState('timeline', true); // Set timeline loading here


                // Define promises for parallel tasks
                const loadDataPromise = this._loadDataForMaterial(this.currentMaterial);
                const loadActivityPromise = this._loadReviewActivityData();
                const loadTimelinePromise = apiClient.getDueTimeline(this.currentMaterial)
                .then(timelineData => {
                    this._renderTimelineGraph(timelineData, false); // Render graph
                    this._updateLoadingState('timeline', false); // Clear loading state
                })
                .catch(err => {
                    console.error("Error fetching timeline for graph:", err);
                    this._renderTimelineGraph(null, false, true); // Show error state
                    this._updateLoadingState('timeline', false); // Clear loading state
                });

                // *** FIX: Await all necessary promises ***
                // Wait for chapters, activity, AND timeline graph rendering
                await Promise.all([loadDataPromise, loadActivityPromise, loadTimelinePromise]);

                console.log("All initial parallel data loads complete.");

            } else {
                console.warn("No study materials found after loading.");
                this._showError("No study materials found.", false);
                // Clear UI elements
                if(this.heatmapGrid) this.heatmapGrid.innerHTML = '';
                if(this.chapterGrid) this.chapterGrid.innerHTML = '';
                if(this.pillNewCardsCount) this.pillNewCardsCount.textContent = '-';
                if(this.pillDueCardsCount) this.pillDueCardsCount.textContent = '-';
                // Set default batch size even if no material, or clear it? Let's clear/default.
                if(this.pillReviewBatchSize) this.pillReviewBatchSize.value = 20; // Default if no materials
                this._renderTimelineGraph(null, false); // Ensure graph is cleared, not loading
                // Ensure all loading states are off if no material
                Object.keys(this.isLoading).forEach(key => this._updateLoadingState(key, false));
            }
        } catch (error) {
             console.error("Error during main initialization sequence:", error);
             this._showError(`Failed to initialize: ${error.message || 'Unknown error'}`);
             // Ensure loading states are off on error
              Object.keys(this.isLoading).forEach(key => this._updateLoadingState(key, false));
              // Show error in graph area too
              this._renderTimelineGraph(null, false, true);
        }
        // *** REMOVE generic finally block that resets loading states ***
        // finally {
        //      // This was causing premature state resets
        //      Object.keys(this.isLoading).forEach(key => this._updateLoadingState(key, false));
        // }

        this.isSelectionMode = false;
        this._toggleSelectionModeUI(false); // Ensure initial UI state is correct

        console.log("Chapter Folders View Initialized");
    }

        // --- Batch Size Saving ---

        _handleBatchSizeChange(event) {
            const newSize = parseInt(event.target.value, 10);
            // Optional: Basic validation before trying to save
            if (isNaN(newSize) || newSize < 1) {
                 console.warn("Invalid batch size input:", event.target.value);
                // Optionally revert or show validation message
                event.target.value = this.currentMaterialSettings?.studyOptions?.defaultBatchSize || 20; // Revert to saved/default
                return;
            }
            console.log("Batch size changed to:", newSize, "- Debouncing save...");
            // Call the debounced save function
            this.saveBatchSizeDebounced(newSize);
        }
    
        async _saveBatchSizeSetting(newSize) {
            if (!this.currentMaterial) return;
            console.log(`Attempting to save batch size ${newSize} for ${this.currentMaterial}`);
    
            // Optimistic UI update (value is already in input)
            // Update local cache if needed
            if (this.currentMaterialSettings?.studyOptions) {
                this.currentMaterialSettings.studyOptions.defaultBatchSize = newSize;
            }
    
            try {
                // Assume updateMaterialSettings can handle partial updates
                await apiClient.updateMaterialSettings(this.currentMaterial, {
                    defaultBatchSize: newSize 
                });
                console.log("Batch size saved successfully via API.");
                // Optional: Show subtle success feedback?
            } catch (error) {
                console.error("Failed to save batch size via API:", error);
                this._showError(`Failed to save batch size: ${error.message}`);
                // Optional: Revert UI input if save fails?
                 if (this.pillReviewBatchSize && this.currentMaterialSettings?.studyOptions) {
                     this.pillReviewBatchSize.value = this.currentMaterialSettings.studyOptions.defaultBatchSize || 20;
                 }
            }
        }

         /**
      * Fetches and caches settings for the current material.
      * Updates the batch size input.
      * @private
      */
         async _loadCurrentMaterialSettings() {
            if (!this.currentMaterial) {
                console.warn("_loadCurrentMaterialSettings: No current material set.");
                if (this.pillReviewBatchSize) this.pillReviewBatchSize.value = 20; // Fallback if no material
                return;
            }
            this._updateLoadingState('settings', true); // Use a 'settings' loading state if needed
            try {
                console.log(`Fetching settings for: ${this.currentMaterial}`);
                const settings = await apiClient.getMaterialSettings(this.currentMaterial);
                this.currentMaterialSettings = settings; // Cache the full settings object
    
                // --- >>> Extract and set the default batch size <<< ---
                // Check API Docs V2 / Actual API response for the correct field name.
                // Assuming 'defaultBatchSize' is directly on the settings object for now.
                const defaultBatchSize = settings?.defaultBatchSize ?? 20; // Default to 20 if not found or settings are null
    
                if (this.pillReviewBatchSize) {
                    this.pillReviewBatchSize.value = defaultBatchSize;
                    console.log(`Settings loaded for ${this.currentMaterial}, default batch size set to: ${defaultBatchSize}`);
                } else {
                    console.warn("Batch size input element (pillReviewBatchSize) not found.");
                }
                this._updateLoadingState('settings', false);
    
            } catch (error) {
                this._updateLoadingState('settings', false);
                console.error(`Failed to load settings for ${this.currentMaterial}:`, error);
                this.currentMaterialSettings = null; // Indicate settings failed
                if (this.pillReviewBatchSize) {
                    this.pillReviewBatchSize.value = 20; // Fallback on error
                }
                // Optionally show a non-blocking warning
                 this._showError(`Could not load settings for ${this.currentMaterial}. Using default batch size.`, true); // Make error temporary?
            }
        }
    
/**
     * Fetches materials, renders them in the pill switcher's inner container.
     * @private
     */
async _loadAndRenderMaterials() {
    console.log("DEBUG: _loadAndRenderMaterials - START");
    // isLoading state handled by initialize

    // *** Ensure inner container reference is valid ***
    if (!this.pillMaterialSwitcherInner) {
        console.error("FATAL: pillMaterialSwitcherInner not found during _loadAndRenderMaterials.");
        // Attempt to re-query or handle error appropriately
         this.pillMaterialSwitcherInner = this.pillMaterialSwitcher?.querySelector('.material-switcher-pill-inner');
         if (!this.pillMaterialSwitcherInner) {
             // If STILL not found, maybe create it again, though this indicates an earlier init problem
              console.error("FATAL: Still couldn't find/create pillMaterialSwitcherInner.");
              this.pillMaterialSwitcher.innerHTML = '<span class="error-text">UI Error</span>'; // Show error
              this.currentMaterial = null;
              return;
         }
    }


    try {
        const materialsData = await apiClient.getMaterials();
        this.availableMaterials = materialsData; // Store the array directly
        console.log("DEBUG: _loadAndRenderMaterials - Materials fetched:", this.availableMaterials?.length ?? 0);


        if (!this.pillMaterialSwitcher) { throw new Error("Pill Material Switcher element not found."); }

        // *** Clear the INNER container ***
        this.pillMaterialSwitcherInner.innerHTML = '';
        console.log("DEBUG: _loadAndRenderMaterials - Cleared pillMaterialSwitcherInner innerHTML");

        if (!this.availableMaterials || this.availableMaterials.length === 0) {
            this.pillMaterialSwitcherInner.innerHTML = '<span class="no-materials">No materials</span>'; // Message inside inner
            this.pillMaterialSwitcher.classList.remove('has-multiple'); // Remove class if no materials
            this.currentMaterial = null;
             this._updateActiveMaterialTab(); // Update layout even if empty
            return;
        }

        if (!this.currentMaterial) {
            this.currentMaterial = this.availableMaterials[0].material;
        }
        console.log(`DEBUG: _loadAndRenderMaterials - Current material set to: ${this.currentMaterial}`);

        const hasMultiple = this.availableMaterials.length > 1;
        const has3Plus = this.availableMaterials.length >= 3; // *** CHECK FOR 3+ ***
        this.pillMaterialSwitcher.classList.toggle('has-multiple', hasMultiple);
         console.log(`DEBUG: _loadAndRenderMaterials - hasMultiple: ${hasMultiple}, class set on`, this.pillMaterialSwitcher);
         this.pillMaterialSwitcher.classList.toggle('has-3plus-materials', has3Plus); // *** SET ADAPTIVE WIDTH CLASS ***
         console.log(`DEBUG: _loadAndRenderMaterials - hasMultiple: ${hasMultiple}, has3Plus: ${has3Plus}`);

        this.availableMaterials.forEach((matData, index) => {
             console.log(`DEBUG: _loadAndRenderMaterials - Creating button for: ${matData.material} at index ${index}`);
            const tab = document.createElement('button');
            tab.classList.add('material-tab');
            tab.dataset.material = matData.material;
            tab.dataset.index = index;

            const iconSvg = this.materialIcons[matData.material] || this.materialIcons['default'];
            tab.innerHTML = iconSvg;
            tab.title = matData.material;
            tab.setAttribute('aria-label', `Select material: ${matData.material}`);
             console.log("DEBUG: _loadAndRenderMaterials - Button element created:", tab.outerHTML.substring(0, 200) + '...');


            // *** Append to the INNER container ***
            this.pillMaterialSwitcherInner.appendChild(tab);
             console.log(`DEBUG: _loadAndRenderMaterials - Appended button for ${matData.material}. Inner container child count: ${this.pillMaterialSwitcherInner.childElementCount}`);
        });
         console.log(`DEBUG: _loadAndRenderMaterials - Finished creating buttons. Final inner child count: ${this.pillMaterialSwitcherInner.childElementCount}`);
         console.log("DEBUG: _loadAndRenderMaterials - pillMaterialSwitcherInner after loop:", this.pillMaterialSwitcherInner.outerHTML.substring(0, 300) + '...');


        this._updateActiveMaterialTab(); // Set initial active/peeking classes
        // *** Update stats immediately after loading materials ***
        this._updatePillStats(this.currentMaterial);

    } catch (error) {
         console.error("Error loading materials:", error);
         this.pillMaterialSwitcherInner.innerHTML = '<span class="error-text">Error</span>'; // Error inside inner
         this.currentMaterial = null;
         this._showError(`Failed to load materials: ${error.message}`);
    } finally {
         this._updateLoadingState('materials', false); // Ensure loading state is off
    }
     console.log("DEBUG: _loadAndRenderMaterials - END");
}
    

     /**
     * Attaches event listeners.
     * @private
     */
     _attachEventListeners() {
        // Chapter Grid Listeners (Keep)
        this.chapterGrid.addEventListener('click', this._handleChapterGridClick);
        this.chapterGrid.addEventListener('contextmenu', this._handleContextMenu); // For chapters
        this.chapterContextMenu.addEventListener('click', this._handleContextMenuClick); // For chapters

        // Pill Listeners
        this.pillMaterialSwitcher?.addEventListener('click', this._handleMaterialSwitch);
        this.pillMaterialSwitcher?.addEventListener('contextmenu', this._handleMaterialContextMenu); // *** NEW ***
        this.pillMaterialSwitcher?.addEventListener('wheel', this._handleMaterialScroll, { passive: false }); // *** NEW - passive: false to preventDefault ***

        this.pillStudyDueButton?.addEventListener('click', this._handleStudyDueClick);
        this.pillOptionsTrigger?.addEventListener('click', this._toggleStudyOptionsPopup); // *** NEW ***
        this.pillStartFocusedButton?.addEventListener('click', this._handleFocusedStudyClick); // Handles both select/launch

        // Material Context Menu Listener (Keep similar structure to chapter one)
        this.materialContextMenu?.addEventListener('click', this._handleMaterialContextMenuClick); // *** NEW ***
                // *** NEW: Settings Modal Listeners ***
        this.settingsSaveButton?.addEventListener('click', this._handleSettingsSave);
        this.settingsCancelButton?.addEventListener('click', this._handleSettingsCancel);

        // *** Update Info Modal Listener ***
        this.infoModalActions?.addEventListener('click', (event) => {
            if (event.target.matches('[data-action="close"]')) {
                // Hide using direct reference or generic helper
                // Option A: Direct manipulation
                    if (this.infoModalOverlay) this.infoModalOverlay.classList.remove('visible');
                // Option B: Keep generic hide but modify it
                // this._hideModal('info');
            }
        });

        // *** NEW: Batch Size Input Listener ***
        this.pillReviewBatchSize?.addEventListener('input', this._handleBatchSizeChange);
        

        // Global Listeners
        document.addEventListener('click', (event) => {
            // Hide Chapter Context Menu
            if (this.chapterContextMenu?.style.display === 'block' && !this.chapterContextMenu.contains(event.target) && !event.target.closest('.chapter-card')) {
                this._hideContextMenu('chapter');
            }
            // *** NEW: Hide Material Context Menu ***
             if (this.materialContextMenu?.style.display === 'block' && !this.materialContextMenu.contains(event.target) && !event.target.closest('.material-tab')) {
                this._hideContextMenu('material');
            }
            // Hide Study Options Popup
            // Hide Study Options Popup
            if (this.isStudyOptionsPopupVisible &&
                !this.studyOptionsPopup.contains(event.target) && 
                !this.pillStudyButtonWrapper.contains(event.target) && 
                !this.isSelectionMode) { // Don't hide if selecting chapters
                this._hideStudyOptionsPopup();
            }
            // Hide Rename Input (Keep)
            if (this.activeRenameInput && !this.activeRenameInput.contains(event.target) && !event.target.closest('.chapter-card.is-renaming')) {
                const card = this.activeRenameInput.closest('.chapter-card');
                if (card) this._cancelRename(card);
            }
        }, true); // Use capture phase

        // Hide menus/popups on scroll/resize/escape
        window.addEventListener('scroll', () => {
            this._hideContextMenu('chapter');
            this._hideContextMenu('material');
            if (!this.isSelectionMode) {
                this._hideStudyOptionsPopup();
            }
        }, true);
        window.addEventListener('resize', () => {
            this._hideContextMenu('chapter');
            this._hideContextMenu('material');
            // Only hide the popup if not in selection mode
            if (!this.isSelectionMode) {
            this._hideStudyOptionsPopup();
            }
        });
         document.addEventListener('keydown', (event) => {
             if (event.key === 'Escape') {
                // First handle rename input if active
                if (this.activeRenameInput) {
                    const card = this.activeRenameInput.closest('.chapter-card');
                    if (card) {
                        this._cancelRename(card);
                        return; // Exit early after handling rename
                    }
                }
                
                // Check if in selection mode
                if (this.isSelectionMode) {
                    console.log("Exiting selection mode via Escape key");
                    this._toggleSelectionModeUI(false);
                    return; // Exit early after handling selection mode
                }
                
                // Otherwise hide menus/popup
                this._hideContextMenu('chapter');
                this._hideContextMenu('material');
                this._hideStudyOptionsPopup();
            }
         });

         // Modal close actions - KEEP
         this.errorModalActions.addEventListener('click', (event) => {
              if (event.target.matches('[data-action="close"]')) {
                  this._hideModal('errorModal');
              }
          });
    }
       
        // --- Popup Logic ---

// Replace _toggleStudyOptionsPopup with this version:
_toggleStudyOptionsPopup() {
    this.isStudyOptionsPopupVisible = !this.isStudyOptionsPopupVisible;
    this.studyOptionsPopup.classList.toggle('visible', this.isStudyOptionsPopupVisible);
    this.pillStudyButtonWrapper.classList.toggle('popup-open', this.isStudyOptionsPopupVisible);
    this.pillOptionsTrigger.setAttribute('aria-expanded', this.isStudyOptionsPopupVisible);
    
    // Explicitly set display property to override inline style
    if (this.isStudyOptionsPopupVisible) {
        this.studyOptionsPopup.style.display = 'flex';
    } else {
        // Use a timeout to allow the hide animation to complete
        setTimeout(() => {
            if (!this.isStudyOptionsPopupVisible) {
                this.studyOptionsPopup.style.display = 'none';
            }
        }, 250); // Match transition duration
    }
    
    console.log("Popup toggled:", this.isStudyOptionsPopupVisible);
}

    _hideStudyOptionsPopup() {
        if (!this.isStudyOptionsPopupVisible) return;
        this.isStudyOptionsPopupVisible = false;
        this.studyOptionsPopup.classList.remove('visible');
        this.pillStudyButtonWrapper.classList.remove('popup-open');
        this.pillOptionsTrigger.setAttribute('aria-expanded', 'false');
        console.log("Popup hidden");
    }

        // --- Context Menu Logic (Generalized) ---

// Replace _showContextMenu with this version:
_showContextMenu(menuType, event) {
    let menuElement, targetElement;
    if (menuType === 'chapter') {
        menuElement = this.chapterContextMenu;
        const card = event.target.closest('.chapter-card');
        if (!card) return;
        targetElement = card;
        const chapterName = card.dataset.chapterName;
        if (!chapterName) return;
        this.chapterContextMenuTargetChapter = chapterName;
    } else {
        // Fixed material menu handling
        menuElement = this.materialContextMenu;
        const tab = event.target.closest('.material-tab');
        if (!tab) return;
        targetElement = tab;
        const material = tab.dataset.material;
        if (!material) return;
        this.materialContextMenuTargetMaterial = material;
    }

    event.preventDefault();
    this._hideStudyOptionsPopup();
    this._hideContextMenu(menuType === 'chapter' ? 'material' : 'chapter');

    const posX = event.clientX + 2;
    const posY = event.clientY + 2;
    
    const menuWidth = menuElement.offsetWidth;
    const menuHeight = menuElement.offsetHeight;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    menuElement.style.left = `${Math.min(posX, viewportWidth - menuWidth - 10)}px`;
    
    // Position context menu appropriately based on type
    if (menuType === 'material') {
        // Position above the tab for material menu
        menuElement.style.top = `${posY - menuHeight - 10}px`;
    } else {
        menuElement.style.top = `${Math.min(posY, viewportHeight - menuHeight - 10)}px`;
    }

    menuElement.style.display = 'block';
    console.log(`${menuType} context menu shown for ${menuType === 'chapter' ? this.chapterContextMenuTargetChapter : this.materialContextMenuTargetMaterial}`);
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
    
        // Specific handlers call the generalized show/hide
        _handleContextMenu(event) { this._showContextMenu('chapter', event); } // Chapter grid right-click
        _handleMaterialContextMenu(event) { this._showContextMenu('material', event); } // Material tab right-click

        
    // --- Modal Helper Methods ---

    // --- Session Launching (Use Input Value) ---

    _handleStudyDueClick() {
        if (!this.currentMaterial) return;
        const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0; // Read from input, 0 = no limit
        console.log(`Starting study session for DUE cards in ${this.currentMaterial}, limit: ${batchSize || 'None'}`);
        const material = encodeURIComponent(this.currentMaterial);
        let url = `study-session.html?material=${material}`; // Add status filter
        if (batchSize > 0) {
            url += `&batchSize=${batchSize}`;
        }
        window.location.href = url;
    }
    
        /**
         * Handles clicking the Settings button in the pill.
         * TODO: Implement the actual settings modal display.
         * @private
         */
        async _handleSettingsClick() {
            if (!this.currentMaterial) return;
            console.log(`Opening settings modal for: ${this.currentMaterial}`);
    
            // 1. Fetch latest settings (or use cached this.currentMaterialSettings if fresh enough)
            try {
                 this._updateLoadingState('settings', true); // Add 'settings' to isLoading state if needed
                 const settings = await apiClient.getMaterialSettings(this.currentMaterial);
                 this.currentMaterialSettings = settings; // Update cache
                 this._updateLoadingState('settings', false);
    
                 // 2. TODO: Populate and Show a Settings Modal
                 //    - Create HTML structure for the modal if not present.
                 //    - Get references to modal form elements.
                 //    - Populate form fields with values from 'settings' object.
                 //    - Add event listeners for save/cancel buttons in the modal.
                 //    - Use _showModal or a dedicated settings modal function.
                 alert(`Settings Modal Placeholder:\nMaterial: ${this.currentMaterial}\nSettings: ${JSON.stringify(settings, null, 2)}`);
                 // Example using generic modal:
                 // this._showModal('settingsModal', `${this.currentMaterial} Settings`, '<p>Modal Content Here...</p>', [{ text: 'Close', class: 'secondary', action: () => {} }]);
    
            } catch (error) {
                 this._updateLoadingState('settings', false);
                 console.error(`Failed to load settings for modal: ${error.message}`);
                 this._showError(`Could not load settings: ${error.message}`);
            }
        }

        _showInfoMessage(message, title = 'Information') {
            // Use direct refs
            if (this.infoModalOverlay && this.infoModalTitle && this.infoModalMessage) {
                this.infoModalTitle.textContent = title;
                this.infoModalMessage.textContent = message;
                // Show using direct reference
                this.infoModalOverlay.classList.add('visible');
                // Or call generic show if kept: this._showModal('info');
            } else {
                console.warn("Info modal elements not found, falling back to alert.");
                alert(`${title}: ${message}`);
            }
        }
    
    // --- Focused Study Logic ---

    /**
     * Handles clicking the "Launch Focused Study" button.
     * Reads batch size and passes it as 'limit' parameter along with chapters.
     * @private
     */
    _handleFocusedStudyClick() {
        // Keep the check for selection mode
        if (!this.isSelectionMode) {
            // Enter Selection Mode
            console.log("Entering chapter selection mode...");
            this._toggleSelectionModeUI(true);
            // Keep popup open
        } else {
            // Launch Focused Session
            console.log("Attempting to launch focused study...");
            if (this.selectedChapters.size === 0) {
                this._showModal('errorModal', 'No Chapters Selected', 'Please select one or more chapters from the grid first.');
                return;
            }

            const batchSize = parseInt(this.pillReviewBatchSize.value, 10) || 0; // Read from input
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
             this._toggleSelectionModeUI(false); // This also hides the popup usually
        }
         // Remove the hide popup call from here if _toggleSelectionModeUI handles it
         // this._hideStudyOptionsPopup();
    }

    /**
     * Shows a specific modal with configured content and buttons.
     * @param {'confirmationModal' | 'errorModal'} modalId - The ID of the modal overlay to show.
     * @param {string} title - The text for the modal title.
     * @param {string} message - The HTML content for the modal message.
     * @param {Array<object>} buttons - Array of button config objects.
     *        Each object: { text: string, class: string ('primary'|'secondary'), action: function }
     * @param {'warning' | 'error'} [iconType='warning'] - Type of icon for confirmation modal.
     * @private
     */
    _showModal(modalId, title, message, buttons = [], iconType = 'warning') {
        let modalOverlay, modalTitle, modalMessage, modalActions, modalIcon;

        if (modalId === 'confirmationModal') {
            modalOverlay = this.confirmationModalOverlay;
            modalTitle = this.confirmModalTitle;
            modalMessage = this.confirmModalMessage;
            modalActions = this.confirmModalActions;
            modalIcon = this.confirmModalIcon; // Get icon span
            // Set icon class
            modalIcon.className = `modal-icon ${iconType}`; // Reset and set class
        } else if (modalId === 'errorModal') {
            modalOverlay = this.errorModalOverlay;
            modalTitle = this.errorModalTitle;
            modalMessage = this.errorModalMessage;
            modalActions = this.errorModalActions; // Actions for error modal might be static (just OK)
            // Error modal icon is usually static
        } else if (modalId === 'settings') {
            // Handle settings modal specifically - don't modify its content here
            // as it's managed by _populateSettingsForm() and related methods
            if (!this.settingsModalOverlay) {
                console.error("Settings modal elements not found");
                return;
            }
            modalOverlay = this.settingsModalOverlay;
            // Don't override title/content/buttons as these are managed elsewhere
        } else {
            console.error("Unknown modal ID:", modalId);
            return;
        }
    
        if (modalId !== 'settings' && (!modalOverlay || !modalTitle || !modalMessage || !modalActions)) {
            console.error("Modal elements not found for ID:", modalId);
            return;
        }

    // Only apply title/message/buttons if not a settings modal
    if (modalId !== 'settings') {
        modalTitle.textContent = title;
        modalMessage.innerHTML = message; // Use innerHTML to allow <strong> etc.

        // Clear previous dynamic buttons (important!)
        modalActions.innerHTML = '';

        // Add new buttons dynamically (primarily for confirmation modal)
        buttons.forEach(btnConfig => {
            const button = document.createElement('button');
            button.textContent = btnConfig.text;
            button.classList.add('modal-button', btnConfig.class);
            // Use a closure to correctly capture the action function
            button.addEventListener('click', (event) => {
                 // Hide modal *before* executing action
                 // Pass the event if the action needs it (unlikely here)
                 this._hideModal(modalId);
                 // Execute the action
                 if (typeof btnConfig.action === 'function') {
                     btnConfig.action();
                 }
            });
            modalActions.appendChild(button);
        });

        // Add static 'OK' button for error modal if it wasn't passed dynamically
        if (modalId === 'errorModal' && buttons.length === 0) {
            const okButton = modalActions.querySelector('[data-action="close"]');
            if (!okButton) { // Ensure it doesn't already exist
                const staticOkButton = document.createElement('button');
                staticOkButton.textContent = 'OK';
                staticOkButton.classList.add('modal-button', 'secondary');
                staticOkButton.dataset.action = 'close'; // Use data-action for listener
                modalActions.appendChild(staticOkButton);
            }
        }
    }

    modalOverlay.classList.add('visible');
}

    /**
     * Hides a specific modal.
     * @param {'confirmationModal' | 'errorModal'} modalId
     * @private
     */
    _hideModal(modalId) {
        let modalOverlay;
        
        if (modalId === 'confirmationModal') {
            modalOverlay = this.confirmationModalOverlay;
            
            // If hiding confirmation, remove animation class from target card
            if (this.contextMenuTargetChapter) {
                const card = this.chapterGrid.querySelector(`.chapter-card[data-chapter-name="${this.contextMenuTargetChapter}"]`);
                if (card) card.classList.remove('confirming-delete');
            }
        } else if (modalId === 'errorModal') {
            modalOverlay = this.errorModalOverlay;
        } else if (modalId === 'settings') {
            // Handle settings modal with direct reference
            modalOverlay = this.settingsModalOverlay;
            if (!modalOverlay) {
                console.error("Settings modal overlay not found");
                return;
            }
        } else if (modalId && modalId.endsWith('Modal')) {
            // Handle case where full ID is passed (like "materialSettingsModal")
            modalOverlay = document.getElementById(modalId);
        } else {
            console.error("Unknown modal ID:", modalId);
            return;
        }
    
        if (!modalOverlay) {
            console.error("Modal overlay element not found for ID:", modalId);
            return;
        }
    
        // Hide the modal
        modalOverlay.classList.remove('visible');
    }

    _handleContextMenu(event) {
        const card = event.target.closest('.chapter-card');
        if (!card || !this.chapterContextMenu) return;
    
        // Specific check for rename input
        const renameInput = card.querySelector('.rename-input');
        if (card.classList.contains('is-renaming') && renameInput && renameInput === event.target) {
            console.log("Context menu prevented: Right-click on active rename input.");
            return;
        }
    
        event.preventDefault();
    
        const chapterName = card.dataset.chapterName;
        if (!chapterName) {
            console.warn("Could not find chapter name on the card element.");
            return;
        }
    
        this.chapterContextMenuTargetChapter = chapterName;
    
        // Position and show the menu
        const posX = event.clientX + 2;
        const posY = event.clientY + 2;
        const menuWidth = this.chapterContextMenu.offsetWidth;
        const menuHeight = this.chapterContextMenu.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
    
        this.chapterContextMenu.style.left = `${Math.min(posX, viewportWidth - menuWidth - 10)}px`;
        this.chapterContextMenu.style.top = `${Math.min(posY, viewportHeight - menuHeight - 10)}px`;
        this.chapterContextMenu.style.display = 'block';
        
        console.log(`Chapter context menu shown for ${chapterName}`);
    }
    
// Fix for _hideContextMenu to properly reset state
_hideContextMenu(menuType) {
    const menuElement = menuType === 'chapter' ? this.chapterContextMenu : this.materialContextMenu;
    if (menuElement && menuElement.style.display === 'block') {
        menuElement.style.display = 'none';
        
        // Reset target variables
        if (menuType === 'chapter') {
            this.chapterContextMenuTargetChapter = null;
        }
        if (menuType === 'material') {
            this.materialContextMenuTargetMaterial = null;
        }
        
        console.log(`${menuType} context menu hidden.`);
    }
}
    // --- Context Menu Handlers (Modified Actions) ---

    // Specific click handlers
    _handleContextMenuClick(event) { // Chapter menu click
        const menuItem = event.target.closest('li[data-action]');
        if (!menuItem || !this.chapterContextMenuTargetChapter) {
            this._hideContextMenu('chapter'); return;
        }
        const action = menuItem.dataset.action;
        const chapterName = this.chapterContextMenuTargetChapter;
        const targetCard = this._findChapterCardElement(chapterName);
        this._hideContextMenu('chapter');

        if (!targetCard) { console.error(`Card not found for ${chapterName}`); return; }

        switch (action) {
            case 'open': this._navigateToChapterDetails(chapterName); break;
            case 'rename': this._handleRenameChapter(targetCard); break;
            case 'delete': this._handleDeleteChapter(targetCard); break;
            default: console.warn(`Unknown chapter action: ${action}`);
        }
    }

// Fix for _handleMaterialContextMenuClick
// Replace _handleMaterialContextMenuClick with this version:
_handleMaterialContextMenuClick(event) {
    const menuItem = event.target.closest('li[data-action]');
    if (!menuItem || !this.materialContextMenuTargetMaterial) {
        return;
    }
    
    const action = menuItem.dataset.action;
    const materialName = this.materialContextMenuTargetMaterial;
    
    // Always hide the menu first
    this._hideContextMenu('material');

    // Then handle the action
    switch (action) {
        case 'settings':
            this._openMaterialSettingsModal(materialName);
            break;
        case 'set-default':
            this._handleSetDefaultMaterial(materialName);
            break;
        default:
            console.warn(`Unhandled material context menu action: ${action}`);
    }
}

    // --- Settings Modal Logic ---

    async _openMaterialSettingsModal(materialName) {
        // Use direct refs
        if (!materialName || !this.settingsModalOverlay) return;
        console.log(`Opening settings modal for: ${materialName}`);
        this._updateLoadingState('settings', true);

        try {
            const settings = await apiClient.getMaterialSettings(materialName);
            this.editingMaterialName = materialName;
            this.editingMaterialSettings = JSON.parse(JSON.stringify(settings));

            this._populateSettingsForm(settings); // Use direct refs inside this function

            this.settingsModalTitle.textContent = `${materialName} - Settings`; // Use direct ref
            this.settingsModalOverlay.classList.add('visible'); // Show modal directly

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
        // Use direct refs, no need for formRefs alias
        if (!this.settingsModalForm) return;
        this.settingsModalForm.reset();

        this.settingsEditMaterialNameInput.value = this.editingMaterialName || '';
        this.settingsMaterialNameInput.value = this.editingMaterialName || '';

        // Study Options
        this.settingsDailyLimitInput.value = settings?.studyOptions?.newCardsPerDay ?? 50;
        this.settingsDefaultBatchSizeInput.value = settings?.studyOptions?.defaultBatchSize ?? 20;

        // SRS Algo Params (Use direct refs, check for existence)
        const algo = settings?.srsAlgorithmParams || {};
        if (this.settingsAlgoLearningStepsInput) this.settingsAlgoLearningStepsInput.value = (algo.learningStepsDays || []).join(', ');
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
        if (this.settingsThresholdLearningRepsInput) this.settingsThresholdLearningRepsInput.value = thresholds.learningReps || 2;
        if (this.settingsThresholdMasteredRepsInput) this.settingsThresholdMasteredRepsInput.value = thresholds.masteredReps || 5;
        if (this.settingsThresholdMasteredEaseInput) this.settingsThresholdMasteredEaseInput.value = thresholds.masteredEase || 2.0;
        if (this.settingsThresholdCriticalEaseInput) this.settingsThresholdCriticalEaseInput.value = thresholds.criticalEase || 1.5;
    }

    _handleSettingsCancel() {
        // Use direct ref for overlay
        if (this.settingsModalOverlay) {
            this.settingsModalOverlay.classList.remove('visible');
        }
        this.editingMaterialName = null;
        this.editingMaterialSettings = null;
    }

    async _handleSettingsSave() {
        // Use direct refs now
        if (!this.settingsModalForm || !this.editingMaterialName || !this.editingMaterialSettings) {
             console.error("Settings save attempted without valid editing state.");
             // Optionally show an error to the user here too
             this._showError("Cannot save settings: internal state error.");
             return;
        }

        this.settingsSaveButton.disabled = true;
        this.settingsSaveButton.textContent = 'Saving...';

        const originalName = this.settingsEditMaterialNameInput.value;
        const originalSettings = this.editingMaterialSettings;
        const collectedData = this._collectSettingsFormData();
        let targetMaterialName = originalName;
        let nameChanged = false;
        const apiCalls = [];
        let settingsChanged = false; // Flag to track if any setting (other than name) changed

        // --- 1. Handle Potential Rename First ---
        if (collectedData.materialName !== originalName) {
             console.log("Attempting material rename...");
             try {
                  await apiClient.renameMaterial(originalName, collectedData.materialName);
                  console.log("Rename successful.");
                  targetMaterialName = collectedData.materialName;
                  this.editingMaterialName = targetMaterialName;
                  this.settingsEditMaterialNameInput.value = targetMaterialName;
                  nameChanged = true;
             } catch(renameError) {
                  console.error("Material rename failed:", renameError);
                  this._showError(`Failed to rename material: ${renameError.message}`); // CORRECT: Use _showError for actual error
                  this.settingsSaveButton.disabled = false; this.settingsSaveButton.textContent = 'Save Changes';
                  return;
             }
        }

        // --- 2. Build PATCH Payload for Other Settings ---
        const patchPayload = {};

        // Compare Daily Limit
        if (collectedData.studyOptions.newCardsPerDay !== originalSettings.dailyNewCardLimit) {
            patchPayload.dailyNewCardLimit = collectedData.studyOptions.newCardsPerDay;
            settingsChanged = true;
        }
        // Compare Batch Size
        if (collectedData.studyOptions.defaultBatchSize !== originalSettings.defaultBatchSize) {
             patchPayload.defaultBatchSize = collectedData.studyOptions.defaultBatchSize;
             settingsChanged = true;
        }
        // Compare Thresholds
        const thresholdsChanges = {};
        for (const key in originalSettings.srsThresholds) {
            if (originalSettings.srsThresholds.hasOwnProperty(key) &&
                collectedData.srsThresholds.hasOwnProperty(key) &&
                originalSettings.srsThresholds[key] !== collectedData.srsThresholds[key])
            {   thresholdsChanges[key] = collectedData.srsThresholds[key]; }
        }
        if (Object.keys(thresholdsChanges).length > 0) {
            patchPayload.srsThresholds = thresholdsChanges;
            settingsChanged = true;
        }
        // Compare Algorithm Params
        const algoParamsChanges = {};
        for (const key in originalSettings.srsAlgorithmParams) {
             if (originalSettings.srsAlgorithmParams.hasOwnProperty(key) &&
                 collectedData.srsAlgorithmParams.hasOwnProperty(key))
             {   if (key === 'learningStepsDays') {
                     if (JSON.stringify(originalSettings.srsAlgorithmParams[key]) !== JSON.stringify(collectedData.srsAlgorithmParams[key])) {
                         algoParamsChanges[key] = collectedData.srsAlgorithmParams[key];
                     }
                 } else if (originalSettings.srsAlgorithmParams[key] !== collectedData.srsAlgorithmParams[key]) {
                      algoParamsChanges[key] = collectedData.srsAlgorithmParams[key];
                 }
             }
        }
        if (Object.keys(algoParamsChanges).length > 0) {
            patchPayload.srsAlgorithmParams = algoParamsChanges;
            settingsChanged = true;
        }


        // --- 3. Execute PATCH Call only if necessary ---
        if (!settingsChanged && !nameChanged) {
            console.log("No changes detected.");
            // *** FIX: Use alert or nothing for info, not _showError ***
            alert("No changes were made."); // Or simply do nothing and leave modal open
            // this._handleSettingsCancel(); // Optionally close modal silently
            this.settingsSaveButton.disabled = false;
            this.settingsSaveButton.textContent = 'Save Changes';
            return;
        }
        else if (!settingsChanged && nameChanged) {
             console.log("Only material name changed successfully.");
            // *** FIX: Use alert for success ***
             alert("Material renamed successfully.");
             // Trigger UI updates needed after only a rename
             await this._loadAndRenderMaterials(); // Reload list
              if (this.currentMaterial === originalName) { // If current was renamed
                  this.currentMaterial = targetMaterialName;
                   await this._loadDataForMaterial(this.currentMaterial); // Reload data for new name
                   await this._loadCurrentMaterialSettings(); // Reload settings for new name
                   // Trigger timeline reload too
                    apiClient.getDueTimeline(this.currentMaterial)
                       .then(timelineData => this._renderTimelineGraph(timelineData, false))
                       .catch(err => this._renderTimelineGraph(null, false, true));
              }
             this._handleSettingsCancel(); // Close modal after rename success + UI update
             this.settingsSaveButton.disabled = false;
             this.settingsSaveButton.textContent = 'Save Changes';
             return;
        }

        // --- Proceed with PATCH if settingsChanged ---
        try {
            console.log(`Sending PATCH for '${targetMaterialName}' with payload:`, JSON.stringify(patchPayload, null, 2));
            const result = await apiClient.updateMaterialSettings(targetMaterialName, patchPayload);
            console.log("Settings PATCH successful:", result);

            // *** FIX: Use _showInfoMessage ***
            this._showInfoMessage("Settings updated successfully."); // Success message
            this._hideModal('settings'); // Hide settings modal


            // --- Post-Save Updates ---
            // Use the 'settings' property from the API response if available and structure matches
            const updatedSettings = result?.settings || collectedData; // Fallback to collected data if API response format is uncertain

            const isCurrentMaterial = targetMaterialName === this.currentMaterial;

            if (nameChanged) {
                // Name changed AND settings changed
                await this._loadAndRenderMaterials();
                 if (isCurrentMaterial) {
                     this.currentMaterial = targetMaterialName; // Ensure current material name is updated
                     // Update cached settings with response/collected data
                     this.editingMaterialSettings = updatedSettings;
                     this.currentMaterialSettings = updatedSettings;
                     await this._loadDataForMaterial(this.currentMaterial); // Reload chapters
                     this._updatePillStats(this.currentMaterial); // Refresh stats display
                     this.pillReviewBatchSize.value = updatedSettings.defaultBatchSize ?? 20; // Update batch size input
                      // Reload timeline
                     apiClient.getDueTimeline(this.currentMaterial)
                        .then(timelineData => this._renderTimelineGraph(timelineData, false))
                        .catch(err => this._renderTimelineGraph(null, false, true));
                 }
            } else if (isCurrentMaterial) {
                // Settings changed, name didn't, and it's the current material
                 this.editingMaterialSettings = updatedSettings; // Update cache
                 this.currentMaterialSettings = updatedSettings;
                 this._updatePillStats(this.currentMaterial); // Refresh stats display
                 this.pillReviewBatchSize.value = updatedSettings.defaultBatchSize ?? 20; // Update batch size input
            }
            this.editingMaterialName = null; // Clear editing state
            this.editingMaterialSettings = null;

        } catch (error) {
            console.error("Failed settings PATCH:", error);
            // *** CORRECT: Use _showError for actual error ***
            this._showError(`Error saving settings: ${error.message}`);
            // Keep modal open on error
        } finally {
            if (this.settingsSaveButton) {
               this.settingsSaveButton.disabled = false;
               this.settingsSaveButton.textContent = 'Save Changes';
            }
        }
    }

    // Helper to read form data and structure it
    _collectSettingsFormData() {
        // Helper to parse float, provide default
        const parseFloatOrDefault = (input, defaultValue) => {
            // Check if input exists before accessing .value
            if (!input) return defaultValue;
            const value = parseFloat(input.value);
            // Check if parsing result is NaN (Not a Number)
            return isNaN(value) ? defaultValue : value;
        };
         // Helper to parse int, provide default
        const parseIntOrDefault = (input, defaultValue) => {
            // Check if input exists before accessing .value
            if (!input) return defaultValue;
            // Use base 10 for parseInt
            const value = parseInt(input.value, 10);
            // Check if parsing result is NaN
            return isNaN(value) ? defaultValue : value;
        };

        const formData = {
            materialName: this.settingsMaterialNameInput.value.trim(),
            studyOptions: {
                newCardsPerDay: parseIntOrDefault(this.settingsDailyLimitInput, 50),
                defaultBatchSize: parseIntOrDefault(this.settingsDefaultBatchSizeInput, 20)
            },
            srsAlgorithmParams: {
                learningStepsDays: this.settingsAlgoLearningStepsInput.value.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n) && n > 0),
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
        if (formData.srsAlgorithmParams.learningStepsDays.length === 0) formData.srsAlgorithmParams.learningStepsDays = [1];
        return formData;
    }
    
        async _handleSetDefaultMaterial(materialName) {
            if (!materialName) return;
            console.log(`TODO: Setting ${materialName} as default material via API.`);
            // 1. Call API: await apiClient.setDefaultMaterial(materialName); (Requires API endpoint)
            // 2. Optional: Visually update UI - maybe reorder tabs in _loadAndRenderMaterials or add indicator
            alert(`Placeholder: Set ${materialName} as default.`);
            // Example: await this._loadAndRenderMaterials(); // Reload to potentially reflect order change
        }
    
    
         // --- Material Tab Scrolling ---
        _handleMaterialScroll(event) {
            if (!this.pillMaterialSwitcher?.classList.contains('has-multiple')) return; // Only scroll if multiple
    
            event.preventDefault(); // Prevent page scroll
    
            const scrollAmount = event.deltaY || event.deltaX; // Use deltaY (most common) or deltaX
            const direction = scrollAmount > 0 ? 1 : -1; // 1 for right, -1 for left
            const scrollSpeedMultiplier = 50; // Pixels per scroll tick (adjust for sensitivity)
    
            // Calculate max scroll distance
            const containerWidth = this.pillMaterialSwitcher.offsetWidth;
            const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
            const maxScroll = Math.max(0, innerWidth - containerWidth); // Cannot scroll beyond content
    
            // Calculate new scroll position
            let newScroll = this.currentMaterialScroll - (direction * scrollSpeedMultiplier);
    
            // Clamp the scroll position
            newScroll = Math.max(0, Math.min(newScroll, maxScroll));
    
            // Apply the transform
            if (this.currentMaterialScroll !== newScroll) {
                this.currentMaterialScroll = newScroll;
                this.pillMaterialSwitcherInner.style.transform = `translateX(-${this.currentMaterialScroll}px)`;
    
                // Update scroll indicator classes (optional but nice)
                 this.pillMaterialSwitcher.classList.toggle('is-scrollable-left', this.currentMaterialScroll > 0);
                 this.pillMaterialSwitcher.classList.toggle('is-scrollable-right', this.currentMaterialScroll < maxScroll);
            }
        }
    
    /**
     * Initiates the inline rename process for a chapter card.
     * @param {HTMLElement} cardElement - The chapter card element.
     * @private
     */
    _handleRenameChapter(cardElement) {
        if (!cardElement || cardElement.classList.contains('is-renaming')) return;

        // If another rename is active, cancel it first
        if (this.activeRenameInput) {
            const otherCard = this.activeRenameInput.closest('.chapter-card');
            if (otherCard) this._cancelRename(otherCard);
        }

        const nameSpan = cardElement.querySelector('.chapter-name');
        if (!nameSpan) return;

        const currentChapterName = nameSpan.textContent;

        // Create input field if it doesn't exist, otherwise reuse
        let input = cardElement.querySelector('.rename-input');
        if (!input) {
             input = document.createElement('input');
             input.type = 'text';
             input.classList.add('rename-input');
             input.dataset.originalName = currentChapterName; // Store original name
             // Insert after the name span
             nameSpan.parentNode.insertBefore(input, nameSpan.nextSibling);
             // Attach listeners only once
             input.addEventListener('keydown', this._handleRenameInputKeydown);
             input.addEventListener('blur', this._handleRenameInputBlur);
        }


        input.value = currentChapterName; // Set current value
        cardElement.classList.add('is-renaming');
        input.style.display = 'block'; // Ensure visible (CSS might handle this)
        input.focus();
        input.select();

        this.activeRenameInput = input; // Track the active input
    }

     /**
      * Handles keydown events on the rename input field.
      * @param {KeyboardEvent} event
      * @private
      */
     _handleRenameInputKeydown(event) {
         const input = event.target;
         const card = input.closest('.chapter-card');
         if (!card) return;

         if (event.key === 'Enter') {
             event.preventDefault(); // Prevent potential form submission
             this._confirmRename(card);
         } else if (event.key === 'Escape') {
             this._cancelRename(card);
         }
     }

     /**
      * Handles blur event (losing focus) on the rename input field.
      * @param {FocusEvent} event
      * @private
      */
     _handleRenameInputBlur(event) {
         // Use setTimeout to allow click on context menu etc. without immediate cancel
         // Also check if the blur was caused by clicking *inside* the modal, if applicable
         setTimeout(() => {
             // Check if rename is still active (might have been confirmed/cancelled by Enter/Esc)
             // And check if the new focus target is *not* part of the rename interaction itself
             if (this.activeRenameInput === event.target && !event.relatedTarget?.closest('.modal-overlay')) {
                  const card = event.target.closest('.chapter-card');
                  if (card) {
                     // Treat blur as cancel if not Enter/Esc
                     this._cancelRename(card);
                  }
             }
         }, 100); // Small delay
     }


     /**
      * Confirms the rename action, validates, calls API, updates UI.
      * @param {HTMLElement} cardElement
      * @private
      */
     async _confirmRename(cardElement) {
        const input = cardElement.querySelector('.rename-input');
        const nameSpan = cardElement.querySelector('.chapter-name');
        if (!input || !nameSpan) return;

        const currentChapterName = input.dataset.originalName;
        const newChapterName = input.value.trim();

        // --- Validation ---
        if (!newChapterName) {
            // Visually indicate error? Or just cancel? For now, cancel.
            console.warn("Rename cancelled: New name is empty.");
            this._showModal('errorModal', 'Rename Failed', 'Chapter name cannot be empty.', []);
            this._cancelRename(cardElement); // Revert UI
            return;
        }

        if (newChapterName === currentChapterName) {
            console.log("Rename cancelled: Name unchanged.");
            this._cancelRename(cardElement); // No change, just revert UI
            return;
        }

        // Prevent further interaction while processing
        input.disabled = true;
        cardElement.style.cursor = 'wait';

        try {
            console.log(`Attempting API rename: ${currentChapterName} -> ${newChapterName}`);
            await apiClient.renameChapter(this.currentMaterial, currentChapterName, newChapterName);
            console.log("API rename successful.");

            // --- Update UI Directly ---
            nameSpan.textContent = newChapterName; // Update the span
            cardElement.dataset.chapterName = newChapterName; // Update data attribute
            input.dataset.originalName = newChapterName; // Update original name for future edits


            // Update internal data store
            const chapterIndex = this.chaptersData.findIndex(ch => ch.chapter === currentChapterName);
            if (chapterIndex > -1) {
                this.chaptersData[chapterIndex].chapter = newChapterName;
                 // Optional: Re-sort if order matters? this.chaptersData.sort(...)
            }

            // Update corresponding mastery heatmap cell (if applicable)
            const heatmapCell = this.heatmapGrid.querySelector(`.heatmap-cell[data-chapter="${currentChapterName}"]`);
            if (heatmapCell) {
                heatmapCell.dataset.chapter = newChapterName;
                // Update tooltip text (get mastery % from chaptersData)
                const chapterData = this.chaptersData[chapterIndex] || {};
                const mastery = chapterData.mastery || 0;
                const tooltipText = `${newChapterName} (${mastery}%)`;
                // Remove old listeners, add new ones (safer)
                const newCell = heatmapCell.cloneNode(true); // Clone to easily remove listeners
                newCell.dataset.chapter = newChapterName; // Ensure new name is set on clone
                 newCell.addEventListener('mouseenter', (event) => {
                      this._showHeatmapTooltip(tooltipText, event.target);
                 });
                 newCell.addEventListener('mouseleave', () => {
                      this._hideHeatmapTooltip();
                 });
                 newCell.addEventListener('click', () => {
                      if (!this.isSelectionMode) {
                           this._navigateToChapterDetails(newChapterName);
                      }
                 });
                 heatmapCell.parentNode.replaceChild(newCell, heatmapCell);
             }

             // --- Finalize UI state ---
             this._cancelRename(cardElement, false); // Revert UI state without resetting value


        } catch (error) {
            console.error("Failed to rename chapter via API:", error);
             this._showModal('errorModal', 'Rename Failed', `Could not rename chapter: ${error.message}`, []);
             // Re-enable input for correction? Or just cancel? Let's cancel.
             input.value = currentChapterName; // Revert value in input
             this._cancelRename(cardElement); // Revert UI fully
        } finally {
            // Ensure input is re-enabled and cursor resets even if cancelRename wasn't called fully
             if(input) input.disabled = false;
             cardElement.style.cursor = '';
             this.activeRenameInput = null; // Ensure active input is cleared
        }
    }

    /**
     * Cancels the inline rename UI, reverting back to the chapter name display.
     * @param {HTMLElement} cardElement
     * @param {boolean} [resetValue=true] - Whether to reset the input value to original.
     * @private
     */
    _cancelRename(cardElement, resetValue = true) {
        if (!cardElement) return;
        const input = cardElement.querySelector('.rename-input');
        const nameSpan = cardElement.querySelector('.chapter-name');

        cardElement.classList.remove('is-renaming');
        if (input) {
             if (resetValue) {
                 input.value = input.dataset.originalName || nameSpan?.textContent || ''; // Reset to original
             }
             input.style.display = 'none'; // Hide input (CSS might handle this)
             input.disabled = false; // Ensure enabled
        }
         if(nameSpan) nameSpan.style.display = ''; // Show span (CSS might handle this)
         cardElement.style.cursor = ''; // Reset cursor


        if (this.activeRenameInput === input) {
             this.activeRenameInput = null; // Clear active input tracking
        }
    }
    
    /**
     * Initiates the delete process using a custom confirmation modal.
     * @param {HTMLElement} cardElement - The chapter card element.
     * @private
     */
    _handleDeleteChapter(cardElement) {
        if (!cardElement) return;
        const chapterName = cardElement.dataset.chapterName;
        if (!chapterName) return;

        this.contextMenuTargetChapter = chapterName; // Store for cleanup

        // Add animation class WHILE modal is shown
        cardElement.classList.add('confirming-delete');

        // --- Show Custom Confirmation Modal ---
        this._showModal(
            'confirmationModal',
            'Delete Chapter?',
            `Are you absolutely sure you want to permanently delete the chapter <strong>"${chapterName}"</strong> and all its cards? <br><br>This action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    class: 'secondary',
                    action: () => {
                        console.log("Deletion cancelled by user via modal.");
                         cardElement.classList.remove('confirming-delete'); // Remove animation
                         this.contextMenuTargetChapter = null; // Clear target
                    }
                },
                {
                    text: 'Delete Permanently',
                    class: 'primary',
                    action: () => {
                        console.log("Deletion confirmed by user via modal.");
                        // Animation class removed automatically by _hideModal
                        this._executeDeleteChapter(cardElement, chapterName); // Proceed with actual deletion
                    }
                }
            ],
            'warning' // Use warning icon
        );
   }

   /**
    * Executes the actual API call for chapter deletion and handles UI animation.
    * @param {HTMLElement} cardElement
    * @param {string} chapterName
    * @private
    */
   async _executeDeleteChapter(cardElement, chapterName) {
       console.log(`Attempting to delete chapter '${chapterName}' in material '${this.currentMaterial}'`);
       // Optional: Show global loading indicator if deletion takes time?
       cardElement.style.pointerEvents = 'none'; // Prevent interaction during fade

       try {
           const result = await apiClient.deleteChapter(this.currentMaterial, chapterName);
           console.log("Deletion successful:", result);

           // --- Animate Out and Remove ---
            cardElement.classList.add('fading-out');

           // Listen for animation end to remove the element from DOM
           cardElement.addEventListener('animationend', () => {
               cardElement.remove(); // Remove from DOM

                // Update internal data store
               this.chaptersData = this.chaptersData.filter(ch => ch.chapter !== chapterName);

                // Remove from mastery heatmap
                const heatmapCell = this.heatmapGrid.querySelector(`.heatmap-cell[data-chapter="${chapterName}"]`);
                if (heatmapCell) {
                    heatmapCell.remove();
                }

                // Optional: Update any other dependent UI elements (e.g., counts)

                console.log(`UI elements for chapter '${chapterName}' removed after animation.`);

           }, { once: true }); // Ensure listener runs only once


       } catch (error) {
            console.error("Failed to delete chapter via API:", error);
            this._showModal('errorModal', 'Deletion Failed', `Could not delete chapter: ${error.message}`, []);
            cardElement.style.pointerEvents = ''; // Re-enable interaction on error
            cardElement.classList.remove('confirming-delete'); // Ensure animation stops if it was still pulsing
       } finally {
            this.contextMenuTargetChapter = null; // Clear target
            // Hide global loading indicator if shown
       }
   }

   // --- Helper to find card element (if needed elsewhere) ---
   _findChapterCardElement(chapterName) {
        return this.chapterGrid.querySelector(`.chapter-card[data-chapter-name="${chapterName}"]`);
   }

    // --- Modified Methods for Pill ---

    /**
     * Handles clicks on the material switcher icons within the pill.
     * @param {Event} event - The click event.
     * @private
     */
    async _handleMaterialSwitch(event) {
        const clickedTab = event.target.closest('.material-tab');
        if (!clickedTab || !this.pillMaterialSwitcher?.classList.contains('has-multiple')) return;

        const material = clickedTab.dataset.material;
        const anyLoading = Object.values(this.isLoading).some(state => state);

        if (material && material !== this.currentMaterial && !anyLoading) {
            console.log(`Switching material to: ${material}`);
            this.currentMaterial = material;

            // --- Set Loading States ---
            this._updateLoadingState('chapters', true);
            this._updateLoadingState('timeline', true);
            // Don't reload activity heatmap on material switch (it's global)
            this._updateLoadingState('stats', true);
            // Settings loading handled by _loadCurrentMaterialSettings call below

            this.heatmapGrid.innerHTML = '<p class="loading-text">Loading mastery...</p>';
            this.chapterGrid.innerHTML = '<p class="loading-text">Loading chapters...</p>';
            this._renderTimelineGraph(null, true); // Show loading state for graph

            try {
                // --- Fetch settings first to get batch size etc. ---
                await this._loadCurrentMaterialSettings(); // <-- Reload settings for new material

                // Update stats using cached data (already fetched in loadAndRender)
                this._updatePillStats(this.currentMaterial);
                this._updateLoadingState('stats', false);

                // Fetch chapters and timeline graph data
                const loadDataPromise = this._loadDataForMaterial(this.currentMaterial); // Only loads chapters now
                const loadTimelinePromise = apiClient.getDueTimeline(this.currentMaterial) // Fetch timeline for graph
                    .then(timelineData => {
                        this._renderTimelineGraph(timelineData, false);
                        this._updateLoadingState('timeline', false);
                    })
                    .catch(err => {
                        console.error("Error fetching timeline for graph on switch:", err);
                        this._renderTimelineGraph(null, false, true);
                        this._updateLoadingState('timeline', false);
                    });

                await Promise.all([loadDataPromise, loadTimelinePromise]);

                // Update Material Tabs Visual State *after* data is loaded/updated
                this._updateActiveMaterialTab();

                // Reset chapter selection state when material changes
                if (this.isSelectionMode) {
                    this._toggleSelectionModeUI(false); // Exit selection mode
                } else {
                    this.selectedChapters.clear();
                    this.chapterGrid.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
                    this.chapterGrid.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);
                }
                // No need to hide context menu here explicitly, should happen on click-off

            } catch (error) {
                console.error(`Error loading data after material switch:`, error);
                 this._showError(`Failed to switch material: ${error.message}`);
                 // Ensure loading states are off even on error within switch handler
                 this._updateLoadingState('chapters', false);
                 this._updateLoadingState('timeline', false);
                 this._updateLoadingState('stats', false);
                 this._updateLoadingState('settings', false);
            }
            // REMOVED FINALLY BLOCK that reset loading states, it's handled in paths now.

        } else if (material === this.currentMaterial) {
            console.log("Clicked active material, no change.");
        }
    }
    /**
     * Updates the active state and relative position classes (is-prev-N, is-next-N)
     * for the material tabs within the pill switcher.
     * Handles both compressed and expanded transforms based on pill state.
     * @private
     */
/**
 * Updates the active state and relative position classes (is-prev-N, is-next-N)
 * for the material tabs within the pill switcher.
 * @private
 */
_updateActiveMaterialTab() {
    if (!this.pillMaterialSwitcher) return;
    const has3Plus = this.availableMaterials.length >= 3;
    this.pillMaterialSwitcher.classList.toggle('has-3plus-materials', has3Plus);

    if (!this.currentMaterial || !this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) {
        console.warn("_updateActiveMaterialTab: Missing required references");
        return;
    }
    

    const tabs = Array.from(this.pillMaterialSwitcherInner.querySelectorAll('.material-tab'));
    const totalTabs = tabs.length;
    if (totalTabs === 0) {
        console.warn("_updateActiveMaterialTab: No tabs found");
        return;
    }

    console.log(`Updating active material tab for: ${this.currentMaterial}, total tabs: ${totalTabs}`);

    // Find active index
    let activeIndex = -1;
    tabs.forEach((tab, index) => {
        const isActive = tab.dataset.material === this.currentMaterial;
        tab.classList.toggle('is-active', isActive);
        if (isActive) {
            activeIndex = index;
        }
        
        // First remove all position classes
        tab.classList.remove('is-prev-1', 'is-prev-2', 'is-prev-3', 
                            'is-next-1', 'is-next-2', 'is-next-3');
    });

    // If no active tab found, default to first tab
    if (activeIndex === -1 && totalTabs > 0) {
        activeIndex = 0;
        tabs[activeIndex].classList.add('is-active');
        this.currentMaterial = tabs[activeIndex].dataset.material;
        console.log(`No active tab found, defaulting to index 0: ${this.currentMaterial}`);
    }

    // Apply position classes relative to active tab
    for (let i = 0; i < totalTabs; i++) {
        const distance = i - activeIndex;
        const tab = tabs[i];
        
        // Apply appropriate position class
        if (distance === -1) tab.classList.add('is-prev-1');
        else if (distance === 1) tab.classList.add('is-next-1');
        else if (distance === -2) tab.classList.add('is-prev-2');
        else if (distance === 2) tab.classList.add('is-next-2');
        else if (distance === -3) tab.classList.add('is-prev-3');
        else if (distance === 3) tab.classList.add('is-next-3');
        
        // For hover transitions, store the transform X adjustment as a CSS variable
        if (distance !== 0) {
            const translateX = distance < 0 ? 
                `calc(-50% - var(--expand-translate-${Math.abs(distance)}))` : 
                `calc(-50% + var(--expand-translate-${distance}))`;
            tab.style.setProperty('--tx', translateX);
        }
    }

    // Update scroll indicators if needed (optional)
    this._updateMaterialScrollState();
    
    console.log(`Active material tab classes updated. Active index: ${activeIndex}`);
}

/**
 * Updates the scroll indicator state for the material switcher.
 * @private
 */
_updateMaterialScrollState() {
    if (!this.pillMaterialSwitcher || !this.pillMaterialSwitcherInner) return;
    
    const containerWidth = this.pillMaterialSwitcher.offsetWidth;
    const innerWidth = this.pillMaterialSwitcherInner.scrollWidth;
    const scrollLeft = this.currentMaterialScroll || 0;
    
    // Show left/right indicators based on scroll position
    this.pillMaterialSwitcher.classList.toggle('is-scrollable-left', scrollLeft > 0);
    this.pillMaterialSwitcher.classList.toggle('is-scrollable-right', scrollLeft + containerWidth < innerWidth);
    
    console.log(`Material scroll state: ${scrollLeft}px / ${innerWidth}px, container: ${containerWidth}px`);
}

/**
     * Updates the New/Due counts in the pill using cached material data.
     * Does NOT fetch timeline data anymore.
     * @param {string | null} material - The material name, or null to clear stats.
     * @private
     */
_updatePillStats(material) {
    console.log(`Updating pill stats for ${material || 'none'} using cached data.`);
    // No loading state needed here as data should already be loaded
    this._updateLoadingState('stats', true); // Show loading state for stats specifically

    let dueCount = '-';
    let newCount = '-';

    if (material && this.availableMaterials.length > 0) {
        const materialData = this.availableMaterials.find(m => m.material === material);
        if (materialData) {
            // Names from API Docs: `dueCount`, `newCardsTodayCount`
            dueCount = materialData.dueCount ?? '?';
            newCount = materialData.newCardsTodayCount ?? '?';
            console.log(`Stats for ${material}: Due=${dueCount}, New=${newCount}`);
        } else {
            console.warn(`Material data not found in cache for: ${material}`);
            dueCount = 'err'; newCount = 'err';
        }
    } else {
        console.log("Clearing pill stats (no material or no data).");
    }

    // Update DOM elements
    if (this.pillDueCardsCount) this.pillDueCardsCount.textContent = dueCount;
    if (this.pillNewCardsCount) this.pillNewCardsCount.textContent = newCount;
    this._updateLoadingState('stats', false); // Hide loading state for stats
}

 _updateLoadingState(part, isLoading) {
    if (typeof this.isLoading[part] === 'undefined') {
        console.warn(`_updateLoadingState called for unknown part: ${part}`);
        return; // Don't process unknown parts
    }
    if (this.isLoading[part] === isLoading) return; // No change

    this.isLoading[part] = isLoading;
    console.log(`Loading state for ${part}: ${isLoading}`);

    // Determine if *any* essential part is loading
     // Include 'settings' in the check for disabling interactions
    const anyEssentialLoading = this.isLoading.materials || this.isLoading.chapters || this.isLoading.timeline || this.isLoading.activity || this.isLoading.stats || this.isLoading.settings;

    // Apply a global loading class for disabling interactions etc.
    this.container?.classList.toggle('is-loading', anyEssentialLoading);

    // Disable major interactions if anything critical is loading
     this.pillMaterialSwitcher?.querySelectorAll('button').forEach(button => button.disabled = anyEssentialLoading);
     this.pillStudyDueButton.disabled = anyEssentialLoading;
     this.pillOptionsTrigger.disabled = anyEssentialLoading;
     // Disable batch size input during load? Maybe not necessary unless settings are loading.
     if (this.pillReviewBatchSize) this.pillReviewBatchSize.disabled = this.isLoading.settings || this.isLoading.materials;


    // Hide tooltip if loading might affect its target
    if (isLoading && (part === 'chapters' || part === 'materials')) {
         this._hideHeatmapTooltip();
    }
}

        // Make _updateLoadingState more generic or rename to _setLoading
        _setLoading(isLoading) {
            this.isLoading = isLoading; // Simple boolean for overall loading state during init/switch
            this.container?.classList.toggle('is-loading', isLoading);
            // Disable major controls during load
            this.materialSwitcher?.querySelectorAll('button').forEach(button => button.disabled = isLoading);
            // Assuming the main "Start Studying" button from V7 is still relevant?
            // If its ID changed, update the reference and disable logic here.
    
            // Hide tooltips etc. during load
            if (isLoading) { this._hideHeatmapTooltip(); }
        }

/**
     * Fetches chapter mastery data for the given material.
     * Timeline data is handled by _updatePillStats.
     * @param {string} material - The material to load data for.
     * @private
     */
     async _loadDataForMaterial(material) {
        console.log(`Loading chapter mastery data for ${material}...`);
        // Loading states handled by caller (initialize or _handleMaterialSwitch)

        try {
            // Fetch Chapter Mastery
            const chaptersResult = await apiClient.getChapterMastery(material);
            // Process Chapter Mastery Results
            this.chaptersData = chaptersResult; // No need for Promise.allSettled if only one promise
            if (!this.chaptersData || this.chaptersData.length === 0) {
                this.heatmapGrid.innerHTML = '';
                this.chapterGrid.innerHTML = `<p>No chapters available for ${material}.</p>`;
            } else {
                this.chaptersData.sort((a, b) => a.chapter.localeCompare(b.chapter));
                this._renderHeatmap();
                this._renderChapterGrid();
            }
             this._updateLoadingState('chapters', false); // Clear chapter loading state


            // --- REMOVED ---
            // // Process Timeline Results (Now fetched separately, render placeholder/loading state)
            // this._updateLoadingState('timeline', true); // REMOVE THIS
            // this._renderTimelineGraph(null, true); // REMOVE THIS - Handled by _updatePillStats now

        } catch (error) { // Catch error from getChapterMastery
            console.error(`Failed to fetch chapter mastery for ${material}:`, error);
            this.heatmapGrid.innerHTML = '<p class="error-text">Error loading mastery</p>';
            this.chapterGrid.innerHTML = '<p class="error-text">Error loading chapters</p>';
             this._updateLoadingState('chapters', false);
             // Let caller handle showing the main error modal if necessary
             throw error; // Rethrow so caller knows data loading failed
        }
        // No finally block needed here, state cleared within try/catch
    }


        /**
     * Fetches and renders the recent review activity data.
     * @private
     */
    async _loadReviewActivityData() {
        console.log("Loading review activity data (last 30 days)...");
        this._updateLoadingState('activity', true);
        this.reviewActivityGrid.innerHTML = '<p class="loading-text">Loading activity...</p>'; // Show loading in the grid

        try {
            const activityData = await apiClient.getRecentStudyStats();
            console.log("Fetched review activity data:", activityData);
            this._renderReviewActivityHeatmap(activityData); // Render with fetched data
        } catch (error) {
            console.error("Failed to load review activity data:", error);
            this.reviewActivityGrid.innerHTML = '<p class="error-text">Error loading activity</p>'; // Show error in the grid
            this._showError("Could not load recent study activity.");
            this._updateLoadingState('activity', false);
        }
    }

    /**
     * Renders the chapter mastery heatmap.
     * @private
     */
    // --- Make sure these methods exist and are adapted if needed ---
    _renderHeatmap() {
        this.heatmapGrid.innerHTML = '';
        if (!this.chaptersData || !this.heatmapTooltipElement) return;
        // Add 'is-loading' class initially?
        // this.heatmapGrid.classList.add('is-loading');

        this.chaptersData.forEach(chapter => {
            const cell = document.createElement('div');
            cell.classList.add('heatmap-cell');
            const masteryLevel = this._getMasteryLevelClass(chapter.mastery);
            cell.dataset.mastery = masteryLevel;
            cell.dataset.chapter = chapter.chapter; // Use chapter name for consistency

            const tooltipText = `${chapter.chapter} (${chapter.mastery}%)`;

            cell.addEventListener('mouseenter', (event) => this._showHeatmapTooltip(tooltipText, event.target));
            cell.addEventListener('mouseleave', () => this._hideHeatmapTooltip());
            cell.addEventListener('click', () => {
                 if (!this.isSelectionMode) {
                     this._navigateToChapterDetails(chapter.chapter);
                 }
             });
            this.heatmapGrid.appendChild(cell);
        });
         // Remove loading class after rendering
         // requestAnimationFrame(() => this.heatmapGrid.classList.remove('is-loading'));
    }

        // --- ADD NEW: RENDER REVIEW ACTIVITY HEATMAP ---
    /**
     * Renders the review activity heatmap based on fetched data.
     * @param {object | null} activityData - Object mapping 'YYYY-MM-DD' to study count.
     * @private
     */
    _renderReviewActivityHeatmap(activityData) {
        if (!this.reviewActivityGrid) return;
        this.reviewActivityGrid.innerHTML = ''; // Clear previous/loading state

        if (!activityData || Object.keys(activityData).length === 0) {
            this.reviewActivityGrid.innerHTML = '<p>No activity data found.</p>';
            return;
        }

        // API guarantees 30 days, sorted chronologically.
        // We just need the counts.
        const counts = Object.values(activityData);
        const dates = Object.keys(activityData); // Get dates for tooltips

        // Ensure we only render up to 30 cells, even if API returns more/less unexpectedly
        const cellCount = Math.min(counts.length, 30);

        for (let i = 0; i < cellCount; i++) {
            const count = counts[i];
            const date = dates[i]; // Get corresponding date

            const cell = document.createElement('div');
            cell.classList.add('review-heatmap-cell');

            // Determine intensity based on count
            const intensityClass = this._getReviewIntensityClass(count);
            if (intensityClass) {
                 // Use the intensity class as the value for data-reviews attribute
                 cell.dataset.reviews = intensityClass;
            }

            // Set tooltip using the date and count
            cell.dataset.tooltip = `${date}: ${count} review${count === 1 ? '' : 's'}`;

            this.reviewActivityGrid.appendChild(cell);
        }

        // If API returned fewer than 30, fill remaining spots with empty cells
        for (let i = cellCount; i < 30; i++) {
             const emptyCell = document.createElement('div');
             emptyCell.classList.add('review-heatmap-cell'); // Apply basic style
             // Optionally add a tooltip indicating no data or future date?
             // emptyCell.dataset.tooltip = "Future/No Data";
             this.reviewActivityGrid.appendChild(emptyCell);
        }
    }

    // --- ADD NEW: Helper to get intensity class ---
    /**
     * Determines the CSS data attribute value based on review count.
     * Matches the CSS rules: [data-reviews="1-3"], [data-reviews="4-7"], [data-reviews="8+"]
     * @param {number} count - Number of reviews.
     * @returns {string | null} The data attribute value ('1-3', '4-7', '8+') or null if count is 0.
     * @private
     */
    _getReviewIntensityClass(count) {
         if (count >= 8) return '8+';
         if (count >= 4) return '4-7';
         if (count >= 1) return '1-3';
         return null; // Return null for 0 reviews, so no data-reviews attribute is set
     }

     _renderChapterGrid() {
        if (!this.chapterGrid) return;
        this.chapterGrid.innerHTML = ''; // Clear previous cards
        if (!this.chaptersData) {
             this.chapterGrid.innerHTML = '<p>No chapter data available.</p>';
            return;
        }

        this.chaptersData.forEach(chapter => {
            const card = document.createElement('div');
            card.classList.add('chapter-card');
            const chapterName = chapter.chapter || 'Unnamed Chapter'; // Use name from data
            card.dataset.chapterName = chapterName;

            // Ensure data properties exist or default to 0/unknown
            const masteryPercent = Math.max(0, Math.min(100, chapter.mastery ?? 0)); // Clamp 0-100
            const totalCards = chapter.totalCards ?? 0;
            const dueCards = chapter.dueCards ?? 0; // Use new data field
            const remainingNewCards = chapter.remainingNewCards ?? 0; // Use new data field

            // Determine mastery level class for circle/text color
            const masteryLevel = this._getMasteryLevelClass(masteryPercent); // low, medium, high

            // Calculate progress circle attributes
            const radius = 15.915; // Radius of the SVG circle
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (masteryPercent / 100) * circumference;

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
                                <circle class="progress-ring-circle"
                                        cx="18" cy="18" r="${radius}"
                                        stroke-dasharray="${circumference} ${circumference}"
                                        stroke-dashoffset="${offset}" />
                            </svg>
                            <span class="mastery-percentage">${masteryPercent}%</span>
                        </div>
                    </div>
                    <div class="card-stats-new">
                        <div class="stat-item-new total-cards" title="Total Cards">
                                    <svg class="stat-icon" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <title>Icon representing a deck of taller flashcards, showing one</title>
            <!-- Keep the rest of the SVG content as is -->
            <!-- Back Card (rotated slightly more, taller) -->
            <rect 
              x="6" y="4" 
              width="20" height="24" 
              rx="3" ry="3" 
              fill="none" 
              stroke="white" 
              stroke-width="1.5" 
              transform="rotate(-6 16 16)" />
            <!-- Front Card Group (rotated slightly less) -->
            <g transform="rotate(4 13 13)">
              <!-- Front Card Outline (taller) -->
              <rect 
                x="4" y="2" 
                width="18" height="22" 
                rx="3" ry="3" 
                fill="none" 
                stroke="white" 
                stroke-width="1.5" />
            </g>
        </svg>
                            <span class="stat-value" data-stat="total">${totalCards}</span>
                        </div>
                        <div class="stat-item-new due-cards" title="Cards Due">
                             <svg class="stat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                            <span class="stat-value" data-stat="due">${dueCards}</span>
                        </div>
                        <div class="stat-item-new new-cards" title="New Cards Remaining">
                            <svg class="stat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13 7H11v4H7v2h4v4h2v-4h4v-2h-4V7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                            <span class="stat-value" data-stat="new">${remainingNewCards}</span>
                        </div>
                    </div>
                </div>
            `;

            // Add event listeners for rename input directly here
            const renameInput = card.querySelector('.rename-input');
            if (renameInput) {
                 renameInput.addEventListener('keydown', this._handleRenameInputKeydown);
                 renameInput.addEventListener('blur', this._handleRenameInputBlur);
            } else {
                 console.warn("Rename input not found for card:", chapterName);
            }


            this.chapterGrid.appendChild(card);
        });
    }

     _renderTimelineGraph(timelineData, isLoading = false, isError = false) {
        if (!this.reviewScheduleCanvas || !this.reviewScheduleContainer || !this.reviewStatusElement) {
            console.error("Timeline graph elements missing!");
            return;
        }
        const ctx = this.reviewScheduleCanvas.getContext('2d');

        // --- Status Message Handling (Keep this) ---
        const showStatus = (message, isErr = false) => {
            console.log(`DEBUG: Showing graph status: "${message}"`); // Log status changes
            this.reviewStatusElement.textContent = message;
            this.reviewStatusElement.style.color = isErr ? '#d9534f' : '#a0a0c0';
            this.reviewStatusElement.style.display = 'block';
            this.reviewScheduleCanvas.style.display = 'none';
            // Destroy existing chart instance IF showing a status message (loading, error, no data)
            if (this.chartInstance) {
                console.log("DEBUG: Destroying chart instance because status message is shown.");
                this.chartInstance.destroy();
                this.chartInstance = null;
            }
        };
        const hideStatus = () => {
            console.log("DEBUG: Hiding graph status, showing canvas.");
            this.reviewStatusElement.style.display = 'none';
            this.reviewScheduleCanvas.style.display = 'block';
        };

       // --- Handle Loading/Error/No Data States FIRST ---
       // If any of these are true, just show status and EXIT. Do NOT proceed to create chart.
       if (isLoading) {
        showStatus('Loading schedule...');
        return; // Exit
   }
   if (isError) {
       showStatus('Error loading schedule', true);
       return; // Exit
   }
   if (!timelineData || Object.keys(timelineData).length === 0) {
    showStatus('No upcoming reviews scheduled');
    return; // Exit
}

// --- If we reach here, we have valid data and are not loading/error ---

// Ensure any existing chart on this canvas is destroyed, even if not tracked in this.chartInstance
let existingChart = Chart.getChart(this.reviewScheduleCanvas);
if (existingChart) {
    console.log("DEBUG: Destroying existing chart found on canvas.");
    existingChart.destroy();
}

// Also destroy our tracked instance if it exists (might be on a different canvas)
if (this.chartInstance) {
    console.log("DEBUG: Destroying previous chart instance before creating new one.");
    this.chartInstance.destroy();
    this.chartInstance = null;
}

// Also destroy our tracked instance if it exists (might be on a different canvas)
if (this.chartInstance) {
    console.log("DEBUG: Destroying previous chart instance before creating new one.");
    this.chartInstance.destroy();
    this.chartInstance = null;
}

// Ensure canvas is visible
// Call the local function correctly
if (this.reviewStatusElement) {
    this.reviewStatusElement.style.display = 'none';
}
if (this.reviewScheduleCanvas) {
    this.reviewScheduleCanvas.style.display = 'block';
}
console.log("DEBUG: Hiding graph status, showing canvas.");


         // Process data for Chart.js
         const sortedDates = Object.keys(timelineData).sort();
         const labels = sortedDates;
         const dataCounts = sortedDates.map(date => timelineData[date]);

         // Create the chart
         try {
             this.chartInstance = new Chart(ctx, {
                 type: 'bar',
                 data: { /* ... Chart data structure ... */
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
                 options: { /* ... Chart options structure ... */
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#1a1a2e',
                            titleColor: '#e0e0e0',
                            bodyColor: '#e0e0e0',
                            displayColors: false,
                            callbacks: {
                                title: (tooltipItems) => tooltipItems[0].label,
                                label: (tooltipItem) => `Reviews: ${tooltipItem.raw}`
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(160, 160, 192, 0.1)' },
                            ticks: { color: '#a0a0c0', maxRotation: 45, minRotation: 45 }
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(160, 160, 192, 0.1)' },
                            ticks: {
                                color: '#a0a0c0',
                                stepSize: 1,
                                callback: function(value) { if (Number.isInteger(value)) return value; }
                            }
                        }
                    }
                 }
             });
         } catch (chartError) {
              console.error("Failed to render chart:", chartError);
               this._updateLoadingState('timeline', false); // Ensure loading state is off on error
               showStatus('Error displaying graph', true); // Use status element for error
              this._showError("Failed to display review schedule graph."); // Show modal error too?
         }
     }
     /**
     * Handles clicks within the chapter grid (cards or checkboxes).
     * Updated to call _updateFocusedStudyButton after selection changes.
     * @param {Event} event - The click event.
     * @private
     */
     _handleChapterGridClick(event) {
        const card = event.target.closest('.chapter-card');
        if (!card) return;

        const chapterName = card.dataset.chapterName;
        const checkbox = card.querySelector('.selection-checkbox');

        if (this.isSelectionMode) {
            if (event.target.classList.contains('rename-input')) return; // Ignore rename input clicks

            let isChecked;
            if (event.target === checkbox) {
                 setTimeout(() => { // Defer to ensure checkbox state is updated
                    isChecked = checkbox.checked;
                    card.classList.toggle('selected', isChecked);
                    if (isChecked) this.selectedChapters.add(chapterName);
                    else this.selectedChapters.delete(chapterName);
                    this._updateFocusedStudyButtonState(); // Update button state/count
                }, 0);
            } else {
                 isChecked = !checkbox.checked;
                 checkbox.checked = isChecked;
                 card.classList.toggle('selected', isChecked);
                 if (isChecked) this.selectedChapters.add(chapterName);
                 else this.selectedChapters.delete(chapterName);
                 this._updateFocusedStudyButtonState(); // Update button state/count
            }
             console.log("Selected chapters:", Array.from(this.selectedChapters));
        } else {
            // Navigation Mode Logic
            if (event.target !== checkbox && !event.target.classList.contains('rename-input')) {
                this._navigateToChapterDetails(chapterName);
            }
        }
   }

    /**
     * Handles clicks on the main session button (#sessionButton).
     * Launches either a global session or a focused session based on selection mode.
     * @private
     */
    _handleSessionButtonClick() {
        if (this.isSelectionMode) {
            // Launch focused session (if chapters selected)
            if (this.selectedChapters.size > 0) {
                this._launchFocusedSession();
                // Optional: Exit selection mode after launching?
                // this.isSelectionMode = false;
                // this._toggleSelectionModeUI(false);
                // this.selectedChapters.clear();
            } else {
                 console.warn("No chapters selected for focused study.");
                 // Maybe show a small message to the user?
                 alert("Please select one or more chapters first.");
            }
        } else {
            // Launch global session for the current material
            this._launchGlobalSession();
        }
    }

   /**
     * Handles clicks on the "Select Chapters" icon button in the pill.
     * Toggles the chapter selection mode.
     * @private
     */
   _handleSelectChaptersClick() {
    this.isSelectionMode = !this.isSelectionMode;
    this._toggleSelectionModeUI(this.isSelectionMode);

    // Clear selections when entering mode
    if (this.isSelectionMode) {
        this.selectedChapters.clear();
        this.chapterGrid.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
        this.chapterGrid.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);
        this._updateFocusedStudyButton(); // Update count immediately
    }
}

     /**
     * Updates the UI elements based on the selection mode state.
     * @param {boolean} isEntering - True if entering selection mode, false if exiting.
     * @private
     */
     _toggleSelectionModeUI(isEntering) {
        this.isSelectionMode = isEntering;
    
        // Toggle class on main container for chapter card styling
        this.container.classList.toggle('selection-mode', isEntering);
    
        // Update Focused Study Button Text & Style
        if (isEntering) {
            this.pillStartFocusedButton.textContent = 'Focused Study';
            this.pillStartFocusedButton.classList.add('is-selecting-chapters');
            this._updateFocusedStudyButtonState(); // Update count/disabled state
            
            // IMPORTANT: Keep popup open during selection mode
            // Make sure popup stays visible when entering selection mode
            if (!this.isStudyOptionsPopupVisible) {
                this._toggleStudyOptionsPopup();
            }
        } else {
            this.pillStartFocusedButton.textContent = 'Select Chapters...';
            this.pillStartFocusedButton.classList.remove('is-selecting-chapters');
            this.pillStartFocusedButton.disabled = false;
            this.pillStartFocusedButton.style.opacity = '1';
            this.pillStartFocusedButton.style.cursor = 'pointer';
            
            // Deselect all cards visually
            this.selectedChapters.clear();
            this.chapterGrid.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
            this.chapterGrid.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);
            
            // We can optionally close the popup when exiting selection mode
            // this._hideStudyOptionsPopup();
        }
    
        // Hide tooltips/menus when mode changes
        this._hideHeatmapTooltip();
        this._hideContextMenu('chapter');
        this._hideContextMenu('material');
        // DON'T hide study options popup during selection mode
        // this._hideStudyOptionsPopup();
    }
    /**
     * Updates the text of the session button based on the number of selected chapters.
     * @private
     */
    _updateSessionButtonState() {
       // ... (Keep existing code from previous step) ...
        if (!this.isSelectionMode) return;
        const count = this.selectedChapters.size;
        if (count > 0) {
            this.sessionButton.textContent = `Start Focused Study (${count})`;
        } else {
            this.sessionButton.textContent = 'Start Focused Study';
        }
    }

     /**
     * Updates the count and disabled state of the "Start Focused Study" button.
     * Separated from _toggleSelectionModeUI for clarity when selections change.
     * @private
     */
     _updateFocusedStudyButtonState() {
        if (!this.isSelectionMode || !this.pillStartFocusedButton) return;

        const count = this.selectedChapters.size;
        // Update text to include count only if > 0 and in selection mode
        this.pillStartFocusedButton.textContent = `Focused Study (${count})`;


        // Disable button if count is 0
        const isDisabled = count === 0;
        this.pillStartFocusedButton.disabled = isDisabled;
        this.pillStartFocusedButton.style.opacity = isDisabled ? '0.6' : '1';
        this.pillStartFocusedButton.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
    }

    /**
     * Constructs the URL and navigates to the focused study session page.
     * (No changes needed, but called only when isSelectionMode is true).
     * @private
     */
    _launchFocusedSession() {
        if (this.selectedChapters.size === 0) {
            console.warn("No chapters selected to launch focused session.");
            // Already handled with alert in _handleSessionButtonClick
            return;
        }
        const chapters = Array.from(this.selectedChapters);
        const encodedChapters = chapters.map(name => encodeURIComponent(name)).join(',');
        const material = encodeURIComponent(this.currentMaterial);
        const url = `study-session.html?material=${material}&chapters=${encodedChapters}`;
        console.log(`Navigating to focused session: ${url}`);
        window.location.href = url;
    }

        /**
     * ADD NEW: Constructs URL and navigates to a global study session for the current material.
     * @private
     */
        _launchGlobalSession() {
            const material = encodeURIComponent(this.currentMaterial);
            // URL only contains the material, studyView.js needs to handle this
            const url = `study-session.html?material=${material}`;
            console.log(`Navigating to global session for material: ${url}`);
            window.location.href = url;
        }

    /**
     * Navigates to the chapter details page for the selected chapter.
     * @param {string} chapterName - The name of the chapter to navigate to.
     * @private
     */
    _navigateToChapterDetails(chapterName) {
        // ... (Keep existing code from previous step) ...
         if (!chapterName) return;
         const encodedChapter = encodeURIComponent(chapterName);
         const material = encodeURIComponent(this.currentMaterial);
         const url = `flashcards-view.html?material=${material}&chapter=${encodedChapter}`;
         console.log(`Navigating to chapter details: ${url}`);
         window.location.href = url;
    }


    // --- Helper Methods ---

    /**
     * Determines the CSS class ('low', 'medium', 'high') based on mastery percentage.
     * @param {number} masteryPercent - The mastery percentage (0-100).
     * @returns {'low' | 'medium' | 'high'}
     * @private
     */
    _getMasteryLevelClass(masteryPercent) {
       // ... (Keep existing code from previous step) ...
        if (masteryPercent >= 85) return 'high';
        if (masteryPercent >= 50) return 'medium';
        return 'low';
    }

    /**
     * RESTORED/KEPT: Updates the visual loading state for different parts of the view.
     * @param {'materials'|'chapters'|'timeline'|'activity'} part - Which part is loading.
     * @param {boolean} isLoading - Whether the part is currently loading data.
     * @private
     */
    _updateLoadingState(part, isLoading) {
        if (this.isLoading[part] === isLoading) return; // No change

        this.isLoading[part] = isLoading;
        console.log(`Loading state for ${part}: ${isLoading}`);

        // Determine if *any* essential part is loading
        const anyLoading = Object.values(this.isLoading).some(state => state);

        // Apply a global loading class for disabling interactions etc.
        this.container?.classList.toggle('is-loading', anyLoading);

        // Disable major interactions if anything critical is loading
        const disableInteractions = this.isLoading.materials || this.isLoading.chapters || this.isLoading.timeline || this.isLoading.activity;
        this.materialSwitcher?.querySelectorAll('button').forEach(button => button.disabled = disableInteractions);

        // Hide tooltip if loading might affect its target
        if (isLoading && (part === 'chapters' || part === 'materials')) {
             this._hideHeatmapTooltip();
        }
    }

    // --- Error Display (Uses Modal Now) ---
    /**
     * Displays an error message using the custom error modal.
     * @param {string} message - The error message.
     * @private
     */
    _showError(message) {
        console.error("ChapterFoldersView Error:", message);
        this._showModal('errorModal', 'Error', message);
   }


    // --- ADD TOOLTIP HELPER METHODS ---

    /**
     * Shows the heatmap tooltip with specific content, positioned near the target element.
     * @param {string} text - The text content for the tooltip.
     * @param {HTMLElement} targetElement - The element the tooltip should be positioned near (the hovered cell).
     * @private
     */
    _showHeatmapTooltip(text, targetElement) {
        if (!this.heatmapTooltipElement || !targetElement) return;

        // Update tooltip content
        this.heatmapTooltipElement.textContent = text;

        // Calculate position
        const targetRect = targetElement.getBoundingClientRect();
        const tooltipRect = this.heatmapTooltipElement.getBoundingClientRect(); // Get initial size (may be 0 if hidden)

        // Position above the target element, centered horizontally
        // Add scroll offsets to use fixed positioning correctly
        let top = targetRect.top + window.scrollY - tooltipRect.height - 8; // 8px gap above
        let left = targetRect.left + window.scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);

        // Adjust if tooltip goes off-screen (basic adjustments)
        if (left < 10) { // Too far left
             left = 10;
        } else if (left + tooltipRect.width > window.innerWidth - 10) { // Too far right
             left = window.innerWidth - tooltipRect.width - 10;
        }
         if (top < 10) { // Too high (might overlap header, etc.) - position below instead
            top = targetRect.bottom + window.scrollY + 8; // 8px gap below
        }


        // Apply position and make visible
        this.heatmapTooltipElement.style.left = `${left}px`;
        this.heatmapTooltipElement.style.top = `${top}px`;
        this.heatmapTooltipElement.classList.add('visible');
    }

    /**
     * Hides the heatmap tooltip.
     * @private
     */
    _hideHeatmapTooltip() {
        if (!this.heatmapTooltipElement) return;
        this.heatmapTooltipElement.classList.remove('visible');
        // Reset position slightly delayed to allow fade-out transition
        setTimeout(() => {
            if (!this.heatmapTooltipElement.classList.contains('visible')) { // Check if still hidden
                this.heatmapTooltipElement.style.left = '-9999px';
                this.heatmapTooltipElement.style.top = '-9999px';
            }
        }, 250); // Should match transition duration
    }

    // ---------------------------------

} // End of ChapterFoldersView class



// --- Initialization Listener (Modified) ---
document.addEventListener('DOMContentLoaded', () => {
    // *** CHECK THE FLAG HERE ***
    if (isViewInitialized) {
        console.warn("ChapterFoldersView: DOMContentLoaded fired again - Initialization attempt skipped.");
        return; // Exit if already initialized
    }
    isViewInitialized = true; // Set the flag
    console.log("DOM Content Loaded - preparing to initialize view");

    const view = new ChapterFoldersView();
    view.initialize();
});
