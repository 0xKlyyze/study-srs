// --- File: js/views/chapterFoldersView.js ---

// Import the API client
import { apiClient } from '../api/apiClient.js';
// Import utility functions if needed (e.g., for URL encoding, maybe later)
// import { encodeUrlParams } from '../utils/helpers.js'; // Example

class ChapterFoldersView {
    constructor() {
        // --- DOM Element References ---
        this.container = document.getElementById('managementContainer');
        this.materialSwitcher = this.materialSwitcher = document.getElementById('materialSwitcherContainer');
        this.heatmapGrid = this.container?.querySelector('.chapter-mastery-section .heatmap-grid');
        this.reviewScheduleContainer = this.container?.querySelector('.review-schedule-graph'); // Container div
        this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas'); // Canvas element
        this.reviewStatusElement = this.reviewScheduleContainer?.querySelector('.graph-status');
        // --- ADD REFERENCE FOR REVIEW ACTIVITY HEATMAP ---
        this.reviewActivityGrid = this.container?.querySelector('.review-activity-section .review-heatmap-grid'); // Review Activity
        this.sessionButton = document.getElementById('sessionButton');
        this.chapterGrid = document.getElementById('chapterGrid');
        this.heatmapTooltipElement = document.getElementById('heatmap-tooltip');
        this.selectChaptersButton = document.getElementById('selectChaptersButton');
        // --- NEW: Context Menu Reference ---
        this.contextMenu = document.getElementById('chapterContextMenu');
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
        this.materialSwitcher = document.getElementById('materialSwitcherContainer'); // Use ID for container
        this.materialIcons = {
            'Mathematics': '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 142.514 142.514" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M34.367,142.514c11.645,0,17.827-10.4,19.645-16.544c0.029-0.097,0.056-0.196,0.081-0.297 c4.236-17.545,10.984-45.353,15.983-65.58h17.886c3.363,0,6.09-2.726,6.09-6.09c0-3.364-2.727-6.09-6.09-6.09H73.103 c1.6-6.373,2.771-10.912,3.232-12.461l0.512-1.734c1.888-6.443,6.309-21.535,13.146-21.535c6.34,0,7.285,9.764,7.328,10.236 c0.27,3.343,3.186,5.868,6.537,5.579c3.354-0.256,5.864-3.187,5.605-6.539C108.894,14.036,104.087,0,89.991,0 C74.03,0,68.038,20.458,65.159,30.292l-0.49,1.659c-0.585,1.946-2.12,7.942-4.122,15.962H39.239c-3.364,0-6.09,2.726-6.09,6.09 c0,3.364,2.726,6.09,6.09,6.09H57.53c-6.253,25.362-14.334,58.815-15.223,62.498c-0.332,0.965-2.829,7.742-7.937,7.742 c-7.8,0-11.177-10.948-11.204-11.03c-0.936-3.229-4.305-5.098-7.544-4.156c-3.23,0.937-5.092,4.314-4.156,7.545 C13.597,130.053,20.816,142.514,34.367,142.514z"></path> <path d="M124.685,126.809c3.589,0,6.605-2.549,6.605-6.607c0-1.885-0.754-3.586-2.359-5.474l-12.646-14.534l12.271-14.346 c1.132-1.416,1.98-2.926,1.98-4.908c0-3.59-2.927-6.231-6.703-6.231c-2.547,0-4.527,1.604-6.229,3.684l-9.531,12.454L98.73,78.391 c-1.89-2.357-3.869-3.682-6.7-3.682c-3.59,0-6.607,2.551-6.607,6.609c0,1.885,0.756,3.586,2.357,5.471l11.799,13.592 L86.647,115.67c-1.227,1.416-1.98,2.926-1.98,4.908c0,3.589,2.926,6.229,6.699,6.229c2.549,0,4.53-1.604,6.229-3.682l10.19-13.4 l10.193,13.4C119.872,125.488,121.854,126.809,124.685,126.809z"></path> </g> </g> </g></svg>', // Example: Calculator icon
            'Physics': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M512,256c0-38.187-36.574-71.637-94.583-93.355c1.015-6.127,1.894-12.177,2.5-18.091 c5.589-54.502-7.168-93.653-35.917-110.251c-9.489-5.478-20.378-8.26-32.341-8.26c-28.356,0-61.858,16.111-95.428,43.716 c-27.187-22.434-54.443-37.257-79.275-42.01c-4.642-0.905-9.105,2.142-9.993,6.776c-0.879,4.625,2.15,9.096,6.775,9.975 c21.282,4.079,45.15,17.109,69.308,36.702c-18.278,16.708-36.378,36.651-53.487,59.255c-28.561,3.447-55.031,9.088-78.592,16.529 c-4.395-27.913-4.13-52.813,1.331-72.439c2.321,0.495,4.71,0.785,7.168,0.785c18.825,0,34.133-15.309,34.133-34.133 c0-18.816-15.309-34.133-34.133-34.133S85.333,32.384,85.333,51.2c0,10.146,4.531,19.166,11.58,25.429 c-7.305,23.347-7.996,52.915-2.475,86.067C36.514,184.414,0,217.839,0,256c0,37.12,34.765,70.784,94.447,93.099 C84.25,410.206,94.933,458.615,128,477.713c9.489,5.478,20.378,8.252,32.35,8.252c28.382,0,61.918-16.136,95.505-43.785 c27.469,22.682,54.733,37.385,79.206,42.078c0.538,0.102,1.084,0.154,1.613,0.154c4.011,0,7.595-2.842,8.38-6.921 c0.879-4.634-2.15-9.105-6.776-9.992c-20.847-3.994-44.843-16.913-69.308-36.702c18.287-16.708,36.378-36.651,53.487-59.255 c28.578-3.456,55.066-9.088,78.626-16.538c4.395,27.887,4.122,52.787-1.365,72.457c-2.33-0.503-4.719-0.794-7.185-0.794 c-18.825,0-34.133,15.317-34.133,34.133c0,18.824,15.309,34.133,34.133,34.133c18.824,0,34.133-15.309,34.133-34.133 c0-10.138-4.523-19.149-11.563-25.412c7.339-23.407,8.047-52.966,2.526-86.101C475.52,327.561,512,294.144,512,256z M351.659,43.11c8.934,0,16.947,2.014,23.808,5.973c22.246,12.843,32.265,47.01,27.477,93.73 c-0.478,4.625-1.22,9.395-1.963,14.157c-23.518-7.424-49.937-13.047-78.438-16.495c-17.041-22.613-35.029-42.675-53.248-59.383 C298.846,57.148,327.791,43.11,351.659,43.11z M397.764,174.208c-4.139,19.396-10.266,39.603-18.202,60.186 c-6.093-12.689-12.766-25.429-20.087-38.127c-7.313-12.681-15.036-24.815-22.997-36.437 C358.519,163.328,379.153,168.209,397.764,174.208z M256.12,92.407c14.507,13.158,28.945,28.552,42.871,45.764 c-13.952-1.058-28.297-1.638-42.991-1.638c-14.669,0-28.988,0.58-42.914,1.63C227.063,120.934,241.579,105.574,256.12,92.407z M175.522,159.829c-7.97,11.614-15.676,23.782-22.98,36.446c-7.356,12.74-14.037,25.472-20.096,38.101 c-7.987-20.727-14.148-40.986-18.278-60.143C132.804,168.218,153.455,163.337,175.522,159.829z M119.467,34.133 c9.412,0,17.067,7.654,17.067,17.067c0,9.412-7.654,17.067-17.067,17.067c-9.404,0-17.067-7.654-17.067-17.067 C102.4,41.788,110.063,34.133,119.467,34.133z M17.067,256c0-29.79,31.548-57.088,80.777-75.998 c5.359,24.141,13.722,49.758,24.832,75.887c-11.264,26.419-19.61,52.113-24.934,76.194C47.283,312.619,17.067,284.774,17.067,256z M255.923,419.576c-13.474-12.169-26.923-26.291-39.927-42.052c0.734-1.092,1.28-2.295,1.886-3.465 c12.766,0.879,25.557,1.408,38.118,1.408c14.677,0,28.996-0.572,42.931-1.63C284.962,391.057,270.447,406.417,255.923,419.576z M313.267,355.277c-18.415,2.031-37.606,3.123-57.267,3.123c-11.29,0-22.775-0.469-34.261-1.203 c-0.648-18.253-15.59-32.93-34.005-32.93c-18.825,0-34.133,15.317-34.133,34.133c0,18.825,15.309,34.133,34.133,34.133 c5.547,0,10.726-1.459,15.36-3.823c12.996,15.735,26.334,29.858,39.714,42.129c-29.585,23.996-58.573,38.059-82.458,38.059 c-8.943,0-16.947-2.005-23.817-5.973c-25.813-14.899-33.673-55.91-25.404-108.041c4.659,1.468,9.455,2.876,14.37,4.215 c4.523,1.237,9.233-1.451,10.479-5.99c1.237-4.548-1.442-9.233-5.999-10.47c-5.41-1.476-10.615-3.072-15.701-4.71 c4.105-19.123,10.197-39.424,18.185-60.262c5.658,11.802,11.844,23.646,18.577,35.447c1.57,2.756,4.454,4.301,7.415,4.301 c1.434,0,2.884-0.358,4.224-1.118c4.096-2.33,5.521-7.543,3.183-11.639c-9.207-16.128-17.391-32.418-24.516-48.58 c7.467-17.007,16.128-34.21,25.975-51.268c9.796-16.973,20.378-33.058,31.42-48.085c18.423-2.022,37.598-3.123,57.259-3.123 c19.686,0,38.886,1.101,57.327,3.132c11.017,15.036,21.572,31.112,31.369,48.068c9.796,16.964,18.458,34.116,25.967,51.106 c-7.561,17.101-16.162,34.295-25.975,51.302C334.891,324.164,324.318,340.25,313.267,355.277z M204.8,358.4 c0,4.796-1.997,9.122-5.197,12.22c-0.043,0.034-0.094,0.043-0.137,0.077c-0.051,0.034-0.068,0.094-0.119,0.137 c-3.046,2.85-7.117,4.634-11.614,4.634c-9.404,0-17.067-7.654-17.067-17.067c0-9.412,7.663-17.067,17.067-17.067 C197.146,341.333,204.8,348.988,204.8,358.4z M336.486,352.171c7.979-11.614,15.676-23.774,22.98-36.429 c7.313-12.672,13.943-25.472,20.062-38.263c8.021,20.779,14.208,41.079,18.347,60.279 C379.23,343.774,358.571,348.663,336.486,352.171z M392.533,477.867c-9.404,0-17.067-7.654-17.067-17.067 c0-9.412,7.663-17.067,17.067-17.067c9.412,0,17.067,7.654,17.067,17.067C409.6,470.212,401.946,477.867,392.533,477.867z M414.242,331.972c-5.376-24.192-13.815-49.877-24.977-76.075c10.991-25.899,19.354-51.516,24.738-75.955 c49.314,18.91,80.93,46.234,80.93,76.058C494.933,285.773,463.428,313.062,414.242,331.972z"></path> </g> </g> </g></svg>', // Example: Atom icon
            // Add more mappings as needed
            'default': '<svg fill="#ffffff" height="200px" width="200px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 463 463" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M151.245,222.446C148.054,237.039,135.036,248,119.5,248c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c23.774,0,43.522-17.557,46.966-40.386c14.556-1.574,27.993-8.06,38.395-18.677c2.899-2.959,2.85-7.708-0.109-10.606 c-2.958-2.897-7.707-2.851-10.606,0.108C184.947,202.829,172.643,208,159.5,208c-26.743,0-48.5-21.757-48.5-48.5 c0-4.143-3.358-7.5-7.5-7.5s-7.5,3.357-7.5,7.5C96,191.715,120.119,218.384,151.245,222.446z"></path> <path d="M183,287.5c0-4.143-3.358-7.5-7.5-7.5c-35.014,0-63.5,28.486-63.5,63.5c0,0.362,0.013,0.725,0.019,1.088 C109.23,344.212,106.39,344,103.5,344c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5 c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.611-16.462-49.437-39.731-58.867c-0.178-1.699-0.269-3.418-0.269-5.133 c0-26.743,21.757-48.5,48.5-48.5C179.642,295,183,291.643,183,287.5z"></path> <path d="M439,223.5c0-17.075-6.82-33.256-18.875-45.156c1.909-6.108,2.875-12.426,2.875-18.844 c0-30.874-22.152-56.659-51.394-62.329C373.841,91.6,375,85.628,375,79.5c0-19.557-11.883-36.387-28.806-43.661 C317.999,13.383,287.162,0,263.5,0c-13.153,0-24.817,6.468-32,16.384C224.317,6.468,212.653,0,199.5,0 c-23.662,0-54.499,13.383-82.694,35.839C99.883,43.113,88,59.943,88,79.5c0,6.128,1.159,12.1,3.394,17.671 C62.152,102.841,40,128.626,40,159.5c0,6.418,0.965,12.735,2.875,18.844C30.82,190.244,24,206.425,24,223.5 c0,13.348,4.149,25.741,11.213,35.975C27.872,270.087,24,282.466,24,295.5c0,23.088,12.587,44.242,32.516,55.396 C56.173,353.748,56,356.626,56,359.5c0,31.144,20.315,58.679,49.79,68.063C118.611,449.505,141.965,463,167.5,463 c27.995,0,52.269-16.181,64-39.674c11.731,23.493,36.005,39.674,64,39.674c25.535,0,48.889-13.495,61.71-35.437 c29.475-9.385,49.79-36.92,49.79-68.063c0-2.874-0.173-5.752-0.516-8.604C426.413,339.742,439,318.588,439,295.5 c0-13.034-3.872-25.413-11.213-36.025C434.851,249.241,439,236.848,439,223.5z M167.5,448c-21.029,0-40.191-11.594-50.009-30.256 c-0.973-1.849-2.671-3.208-4.688-3.751C88.19,407.369,71,384.961,71,359.5c0-3.81,0.384-7.626,1.141-11.344 c0.702-3.447-1.087-6.92-4.302-8.35C50.32,332.018,39,314.626,39,295.5c0-8.699,2.256-17.014,6.561-24.379 C56.757,280.992,71.436,287,87.5,287c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5C60.757,272,39,250.243,39,223.5 c0-14.396,6.352-27.964,17.428-37.221c2.5-2.09,3.365-5.555,2.14-8.574C56.2,171.869,55,165.744,55,159.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-33.642-26.302-61.243-59.421-63.355C104.577,91.127,103,85.421,103,79.5c0-13.369,8.116-24.875,19.678-29.859 c0.447-0.133,0.885-0.307,1.308-0.527C127.568,47.752,131.447,47,135.5,47c12.557,0,23.767,7.021,29.256,18.325 c1.81,3.727,6.298,5.281,10.023,3.47c3.726-1.809,5.28-6.296,3.47-10.022c-6.266-12.903-18.125-22.177-31.782-25.462 C165.609,21.631,184.454,15,199.5,15c13.509,0,24.5,10.99,24.5,24.5v97.051c-6.739-5.346-15.25-8.551-24.5-8.551 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c13.509,0,24.5,10.99,24.5,24.5v180.279c-9.325-12.031-22.471-21.111-37.935-25.266 c-3.999-1.071-8.114,1.297-9.189,5.297c-1.075,4.001,1.297,8.115,5.297,9.189C206.8,343.616,224,366.027,224,391.5 C224,422.654,198.654,448,167.5,448z M395.161,339.807c-3.215,1.43-5.004,4.902-4.302,8.35c0.757,3.718,1.141,7.534,1.141,11.344 c0,25.461-17.19,47.869-41.803,54.493c-2.017,0.543-3.716,1.902-4.688,3.751C335.691,436.406,316.529,448,295.5,448 c-31.154,0-56.5-25.346-56.5-56.5c0-2.109-0.098-4.2-0.281-6.271c0.178-0.641,0.281-1.314,0.281-2.012V135.5 c0-13.51,10.991-24.5,24.5-24.5c4.142,0,7.5-3.357,7.5-7.5s-3.358-7.5-7.5-7.5c-9.25,0-17.761,3.205-24.5,8.551V39.5 c0-13.51,10.991-24.5,24.5-24.5c15.046,0,33.891,6.631,53.033,18.311c-13.657,3.284-25.516,12.559-31.782,25.462 c-1.81,3.727-0.256,8.214,3.47,10.022c3.726,1.81,8.213,0.257,10.023-3.47C303.733,54.021,314.943,47,327.5,47 c4.053,0,7.933,0.752,11.514,2.114c0.422,0.22,0.86,0.393,1.305,0.526C351.883,54.624,360,66.13,360,79.5 c0,5.921-1.577,11.627-4.579,16.645C322.302,98.257,296,125.858,296,159.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5 c0-26.743,21.757-48.5,48.5-48.5s48.5,21.757,48.5,48.5c0,6.244-1.2,12.369-3.567,18.205c-1.225,3.02-0.36,6.484,2.14,8.574 C417.648,195.536,424,209.104,424,223.5c0,26.743-21.757,48.5-48.5,48.5c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5 c16.064,0,30.743-6.008,41.939-15.879c4.306,7.365,6.561,15.68,6.561,24.379C424,314.626,412.68,332.018,395.161,339.807z"></path> <path d="M359.5,240c-15.536,0-28.554-10.961-31.745-25.554C358.881,210.384,383,183.715,383,151.5c0-4.143-3.358-7.5-7.5-7.5 s-7.5,3.357-7.5,7.5c0,26.743-21.757,48.5-48.5,48.5c-13.143,0-25.447-5.171-34.646-14.561c-2.898-2.958-7.647-3.007-10.606-0.108 s-3.008,7.647-0.109,10.606c10.402,10.617,23.839,17.103,38.395,18.677C315.978,237.443,335.726,255,359.5,255 c4.142,0,7.5-3.357,7.5-7.5S363.642,240,359.5,240z"></path> <path d="M335.5,328c-2.89,0-5.73,0.212-8.519,0.588c0.006-0.363,0.019-0.726,0.019-1.088c0-35.014-28.486-63.5-63.5-63.5 c-4.142,0-7.5,3.357-7.5,7.5s3.358,7.5,7.5,7.5c26.743,0,48.5,21.757,48.5,48.5c0,1.714-0.091,3.434-0.269,5.133 C288.462,342.063,272,364.889,272,391.5c0,4.143,3.358,7.5,7.5,7.5s7.5-3.357,7.5-7.5c0-26.743,21.757-48.5,48.5-48.5 c4.142,0,7.5-3.357,7.5-7.5S339.642,328,335.5,328z"></path> </g> </g></svg>' // Fallback icon (e.g., book/brain)
        };
        // errorModalIcon ref not strictly needed if only ever error icon

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
        this.contextMenuTargetChapter = null; // Stores the name of the chapter targeted by right-click
        this.activeRenameInput = null; // Track the currently active input for blur/escape handling

        

        // --- Bind Methods ---
        this._updateLoadingState = this._updateLoadingState.bind(this); // Bind this!
        this._loadAndRenderMaterials = this._loadAndRenderMaterials.bind(this);
        this._loadDataForMaterial = this._loadDataForMaterial.bind(this);
        this._loadReviewActivityData = this._loadReviewActivityData.bind(this);
        // ... other binds ...
        this._handleMaterialSwitch = this._handleMaterialSwitch.bind(this);
        this._handleSessionButtonClick = this._handleSessionButtonClick.bind(this);
        this._handleChapterGridClick = this._handleChapterGridClick.bind(this);
        this._handleSelectChaptersClick = this._handleSelectChaptersClick.bind(this); // Added previously
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
    }

    /**
     * Initializes the Chapter Folders view.
     * Attaches event listeners and loads initial data.
     */
    async initialize() {
        if (!this.container || !this.materialSwitcher || !this.heatmapGrid || !this.reviewScheduleCanvas || !this.reviewStatusElement || !this.sessionButton || !this.selectChaptersButton || !this.chapterGrid || !this.heatmapTooltipElement|| !this.reviewActivityGrid || !this.contextMenu|| !this.confirmationModalOverlay || !this.errorModalOverlay) {
            console.error("ChapterFoldersView: Missing required DOM elements.");
            this._showError("Failed to initialize management interface.");
            if(this.reviewStatusElement) { // Try to show error in status area
                 this.reviewStatusElement.textContent = 'Error initializing graph.';
                 this.reviewStatusElement.style.display = 'block';
                 this.reviewStatusElement.style.color = '#d9534f'; // Error color
                 this.reviewScheduleCanvas.style.display = 'none'; // Hide canvas
            }
            return;
        }
         // Ensure Chart.js is loaded
         if (typeof Chart === 'undefined') {
             console.error("Chart.js library not found. Make sure it's included in the HTML.");
             this._showError("Charting library failed to load.");
             if(this.reviewScheduleContainer) this.reviewScheduleContainer.innerHTML = 'Charting library failed to load.';
             return;
         }


        this._attachEventListeners();
        // --- >> Load Materials and Set Initial State << ---
        try {
            // Use the loading state object
            this._updateLoadingState('materials', true);
            await this._loadAndRenderMaterials();
            this._updateLoadingState('materials', false);

            if (this.currentMaterial) {
                // Set loading states for parts loaded by _loadDataForMaterial
                this._updateLoadingState('chapters', true);
                this._updateLoadingState('timeline', true);
                const loadDataPromise = this._loadDataForMaterial(this.currentMaterial); // Don't await here if activity loads in parallel

                // Load non-material specific data in parallel potentially
                this._updateLoadingState('activity', true);
                const loadActivityPromise = this._loadReviewActivityData();

                // Wait for parallel loads to finish
                await Promise.all([loadDataPromise, loadActivityPromise]);

            } else {
                 this._showError("No study materials found.", false);
                 // Clear UI elements
                 this.heatmapGrid.innerHTML = ''; this.chapterGrid.innerHTML = ''; /* etc */
            }
        } catch(error) {
             console.error("Error during initialization:", error);
             this._showError("Failed to initialize the application.");
        } finally {
             // Ensure all loading states are false in case of error above
             this._updateLoadingState('materials', false);
             this._updateLoadingState('chapters', false);
             this._updateLoadingState('timeline', false);
             this._updateLoadingState('activity', false);
        }
        // --- Set Initial Button State ---
        this.sessionButton.textContent = 'Start Studying'; // Set initial text
        this.isSelectionMode = false;
        this._toggleSelectionModeUI(false); // Ensure initial UI state is correct
        // ------------------------------
        // --------------------------
        console.log("Chapter Folders View Initialized");
    }

    /**
     * Fetches materials, renders stacked/expanding icons, sets default.
     * @private
     */
    async _loadAndRenderMaterials() {
        console.log("Loading materials for stacking icon switcher...");
        this._updateLoadingState('materials', true);

        try {
            this.availableMaterials = await apiClient.getMaterials();
            console.log("Available materials fetched:", this.availableMaterials);

            if (!this.materialSwitcher) { /* ... error handling ... */ return; }
            if (!this.availableMaterials || this.availableMaterials.length === 0) { /* ... empty handling ... */ return; }

            // Determine if multiple materials exist for styling hint
            this.materialSwitcher.classList.toggle('has-multiple', this.availableMaterials.length > 1);
             // --- Set CSS variable for total count ---
            this.materialSwitcher.style.setProperty('--n', this.availableMaterials.length);

            this.currentMaterial = this.availableMaterials[0].material;
            console.log(`Default material set to: ${this.currentMaterial}`);

            this.materialSwitcher.innerHTML = '';
            let nonActiveIndex = 0; // Counter for positioning non-active items

            this.materialSwitcher.innerHTML = '';
            this.availableMaterials.forEach((matData, index) => {
                const tab = document.createElement('button');
                tab.classList.add('material-tab');
                tab.dataset.material = matData.material;
                tab.dataset.index = index; // Store 0-based index

                const iconSvg = this.materialIcons[matData.material] || this.materialIcons['default'];
                tab.innerHTML = iconSvg;
                tab.title = matData.material;
                tab.setAttribute('aria-label', `Select material: ${matData.material}`);

                this.materialSwitcher.appendChild(tab);
            });

            this._updateActiveMaterialTab(); // Initial setup of active/inactive styles & positions

        } catch (error) { /* ... error handling ... */ }
        finally { this._updateLoadingState('materials', false); }
    }
    

    /**
     * Attaches event listeners to interactive elements.
     * @private
     */
    _attachEventListeners() {
        // ... (keep existing listeners for materialSwitcher, sessionButton, chapterGrid)
         // Material Tabs
          // --- MODIFY Material Switcher Listener ---
        // Listen on the CONTAINER for clicks
        this.materialSwitcher?.addEventListener('click', this._handleMaterialSwitch);
        // --- END Modification ---

        // --- MODIFY Listeners for the two buttons ---
        // Main study/focus button
        this.sessionButton.addEventListener('click', this._handleSessionButtonClick);
        // New "Select Chapters" icon button
        this.selectChaptersButton.addEventListener('click', this._handleSelectChaptersClick);
        // -------------------------------------------

        // Chapter Grid (using event delegation)
        this.chapterGrid.addEventListener('click', this._handleChapterGridClick);
        // --- NEW: Right Click (Context Menu) ---
        this.chapterGrid.addEventListener('contextmenu', this._handleContextMenu);
        // --- NEW: Context Menu Item Clicks ---
        this.contextMenu.addEventListener('click', this._handleContextMenuClick);

        // Hide Context Menu Listeners
        document.addEventListener('click', (event) => {
            // Hide context menu if click is outside of it
            if (this.contextMenu && !this.contextMenu.contains(event.target)) {
                 this._hideContextMenu();
            }
            // Hide rename input if click is outside the active input
            if (this.activeRenameInput && !this.activeRenameInput.contains(event.target)) {
                 // Find the associated card etc. to cancel properly
                 const card = this.activeRenameInput.closest('.chapter-card');
                 if (card) {
                     this._cancelRename(card); // Pass the card element
                 }
            }
        }, true); // Use capture phase to catch clicks early
        window.addEventListener('scroll', this._hideContextMenu, true);
        window.addEventListener('resize', this._hideContextMenu);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this._hideContextMenu();
                // Also cancel rename if active
                if (this.activeRenameInput) {
                     const card = this.activeRenameInput.closest('.chapter-card');
                     if (card) {
                        this._cancelRename(card);
                     }
                }
            }
        });

        // --- NEW: Event listeners for Modal close actions ---
        this.errorModalActions.addEventListener('click', (event) => {
             if (event.target.matches('[data-action="close"]')) {
                 this._hideModal('errorModal');
             }
         });
         // Confirmation modal buttons are handled dynamically in _showModal
    }

        // --- Modal Helper Methods ---

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
        } else {
            console.error("Unknown modal ID:", modalId);
            return;
        }

        if (!modalOverlay || !modalTitle || !modalMessage || !modalActions) {
            console.error("Modal elements not found for ID:", modalId);
            return;
        }

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


        modalOverlay.classList.add('visible');
    }

    /**
     * Hides a specific modal.
     * @param {'confirmationModal' | 'errorModal'} modalId
     * @private
     */
    _hideModal(modalId) {
        const modalOverlay = (modalId === 'confirmationModal') ? this.confirmationModalOverlay : this.errorModalOverlay;
        if (modalOverlay) {
            modalOverlay.classList.remove('visible');
            // Clean up dynamic buttons immediately? Not strictly necessary if overwritten next time.
            // if (modalId === 'confirmationModal') this.confirmModalActions.innerHTML = '';

             // If hiding confirmation, remove animation class from target card
             if (modalId === 'confirmationModal' && this.contextMenuTargetChapter) {
                const card = this.chapterGrid.querySelector(`.chapter-card[data-chapter-name="${this.contextMenuTargetChapter}"]`);
                if(card) card.classList.remove('confirming-delete');
             }
        }

    }

     /**
     * Handles the 'contextmenu' event on the chapter grid.
     * Shows the custom context menu.
     * MODIFIED: Prevents menu if right-click is on active rename input.
     * @param {MouseEvent} event
     * @private
     */
    _handleContextMenu(event) {
        const card = event.target.closest('.chapter-card');
        if (!card || !this.contextMenu) return;

        // --- NEW CHECK: Prevent context menu if renaming ---
        const renameInput = card.querySelector('.rename-input');
        // Check if the click target IS the input OR is INSIDE the input (though unlikely)
        // AND if the card is actually in the renaming state
        if (card.classList.contains('is-renaming') && renameInput && renameInput === event.target) {
             console.log("Context menu prevented: Right-click on active rename input.");
             // Allow default browser context menu for the input (copy/paste etc.)
             // So, DO NOT call event.preventDefault() here.
             return;
        }
        // --- END NEW CHECK ---

        event.preventDefault(); // Prevent default browser menu *only if not renaming input*

        const chapterName = card.dataset.chapterName;
        if (!chapterName) {
            console.warn("Could not find chapter name on the card element.");
            return;
        }

        this.contextMenuTargetChapter = chapterName;

        // ... rest of the positioning and display logic remains the same ...
        const posX = event.clientX + 2;
        const posY = event.clientY + 2;
        const menuWidth = this.contextMenu.offsetWidth;
        const menuHeight = this.contextMenu.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        this.contextMenu.style.left = `${Math.min(posX, viewportWidth - menuWidth - 10)}px`;
        this.contextMenu.style.top = `${Math.min(posY, viewportHeight - menuHeight - 10)}px`;
        this.contextMenu.style.display = 'block';
    }
    
        /**
         * Hides the custom context menu.
         * @private
         */
        _hideContextMenu() {
            if (this.contextMenu && this.contextMenu.style.display === 'block') {
                this.contextMenu.style.display = 'none';
                this.contextMenuTargetChapter = null; // Clear the target
            }
        }
    
    // --- Context Menu Handlers (Modified Actions) ---

    _handleContextMenuClick(event) {
        // ... (logic to find menuItem and chapterName remains the same) ...
         const menuItem = event.target.closest('li[data-action]');
         if (!menuItem || !this.contextMenuTargetChapter) {
             this._hideContextMenu();
             return;
         }

         const action = menuItem.dataset.action;
         const chapterName = this.contextMenuTargetChapter;

         console.log(`Context menu action '${action}' selected for chapter: '${chapterName}'`);
         this._hideContextMenu(); // Hide menu

        // Find the target card element *once*
         const targetCard = this.chapterGrid.querySelector(`.chapter-card[data-chapter-name="${chapterName}"]`);
         if (!targetCard) {
              console.error(`Could not find card element for chapter: ${chapterName}`);
              return;
         }


         switch (action) {
             case 'open':
                 // --- Open Chapter Animation ---
                 // This is complex for a full page transition.
                 // For now, just navigate directly. A simple fade on the card is possible but maybe not worth it.
                 console.log("Initiating navigation (animation deferred)...");
                 this._navigateToChapterDetails(chapterName);
                 break;
             case 'rename':
                 this._handleRenameChapter(targetCard); // Pass the card element
                 break;
             case 'delete':
                 this._handleDeleteChapter(targetCard); // Pass the card element
                 break;
             default:
                 console.warn(`Unknown context menu action: ${action}`);
         }
    }

    
        // --- Action Handlers for Context Menu Items ---
    
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

    /**
     * Handles clicks on the material switcher icons.
     * Overrides the previous handler to ensure correct logic.
     * @param {Event} event - The click event.
     * @private
     */
    async _handleMaterialSwitch(event) {
        // Use event delegation on the container
        const clickedTab = event.target.closest('.material-tab');
        if (!clickedTab) return; // Click wasn't on a tab

        const material = clickedTab.dataset.material;
        const anyLoading = Object.values(this.isLoading).some(state => state);

        if (material && material !== this.currentMaterial && !anyLoading) {
            console.log(`Switching material to: ${material}`);
            this.currentMaterial = material;

            // Update visual state of icons *before* loading data
            this._updateActiveMaterialTab();

            // Reset chapter selection state
            this.isSelectionMode = false;
            this.selectedChapters.clear();
            this._toggleSelectionModeUI(false); // Assumes this function exists
            this._hideContextMenu(); // Assumes this exists

            // Reload material-specific data
            this._updateLoadingState('chapters', true);
            this._updateLoadingState('timeline', true);
            try {
                await this._loadDataForMaterial(this.currentMaterial); // Wait for data
            } catch (error) {
                console.error(`Error loading data after material switch:`, error);
                // Handle error appropriately, maybe show message
            } finally {
                // Ensure loading states are cleared even on error
                 this._updateLoadingState('chapters', false);
                 this._updateLoadingState('timeline', false);
            }
        } else if (material === this.currentMaterial) {
            console.log("Clicked active material, no change.");
            // Optional: Maybe collapse the expanded view if clicked while expanded?
        }
    }

    /**
     * Updates active state and sets relative index '--i' for CSS transform.
     * @private
     */
    _updateActiveMaterialTab() {
        if (!this.currentMaterial || !this.materialSwitcher) return;

        const tabs = this.materialSwitcher.querySelectorAll('.material-tab');
        const totalTabs = tabs.length;
        let activeIndex = -1;

        // Find the index of the active tab
        tabs.forEach((tab, index) => {
            if (tab.dataset.material === this.currentMaterial) {
                activeIndex = index;
            }
        });

        // Fallback if active not found
        if (activeIndex === -1 && totalTabs > 0) {
            console.warn(`Active material ${this.currentMaterial} not found, defaulting to first.`);
            this.currentMaterial = tabs[0].dataset.material;
            activeIndex = 0;
        }

        // Set active class and calculate relative index '--i' for transform
        tabs.forEach((tab, index) => {
            const isActive = index === activeIndex;
            tab.classList.toggle('active', isActive);

            // Calculate the index relative to the active tab for expansion calculation
            // This index determines the position in the expanded row (0, 1, 2...)
            // The active tab will effectively be at index 'activeIndex' in this row.
            let relativeIndex = index; // Use the actual 0-based index
            tab.style.setProperty('--i', relativeIndex);
             // Also ensure --n is set (redundant if set in load, but safe)
             tab.style.setProperty('--n', totalTabs);
        });

        console.log(`Active material tab updated: ${this.currentMaterial} (Index: ${activeIndex})`);
    }

        // Make _updateLoadingState more generic or rename to _setLoading
        _setLoading(isLoading) {
            this.isLoading = isLoading; // Simple boolean for overall loading state during init/switch
            this.container?.classList.toggle('is-loading', isLoading);
            // Disable major controls during load
            this.materialSwitcher?.querySelectorAll('button').forEach(button => button.disabled = isLoading);
            if(this.sessionButton) this.sessionButton.disabled = isLoading; // sessionButton is the OLD name from V7, update if needed
            // Assuming the main "Start Studying" button from V7 is still relevant?
            // If its ID changed, update the reference and disable logic here.
    
            // Hide tooltips etc. during load
            if (isLoading) { this._hideHeatmapTooltip(); }
        }

     /**
     * Fetches chapter mastery and timeline data for the given material.
     * @param {string} material - The material to load data for.
     * @private
     */
     async _loadDataForMaterial(material) {
        console.log(`Loading material-specific data for ${material}...`);
        // Loading states (chapters, timeline) should be set *before* calling this function

        // Clear previous data visually while loading
        this.heatmapGrid.innerHTML = '<p class="loading-text">Loading mastery...</p>';
        this.chapterGrid.innerHTML = '<p class="loading-text">Loading chapters...</p>';
        this._renderTimelineGraph(null, true); // Show loading state for graph

        let chapterFetchSuccess = false;
        let timelineFetchSuccess = false;

        try {
            // Fetch in parallel
            const [chaptersResult, timelineResult] = await Promise.allSettled([
                apiClient.getChapterMastery(material),
                apiClient.getDueTimeline(material)
            ]);

            // Process Chapter Mastery Results
            if (chaptersResult.status === 'fulfilled') {
                // ... (process and render chapters/heatmap - unchanged) ...
                this.chaptersData = chaptersResult.value;
                if (!this.chaptersData || this.chaptersData.length === 0) {
                    this._showError(`No chapters found for ${material}.`, true);
                    this.heatmapGrid.innerHTML = '';
                    this.chapterGrid.innerHTML = '<p>No chapters available for this material.</p>';
                } else {
                    this.chaptersData.sort((a, b) => a.chapter.localeCompare(b.chapter));
                    this._renderHeatmap();
                    this._renderChapterGrid();
                }
                chapterFetchSuccess = true;
            } else { /* ... error handling ... */ }
            // ** Set loading state false after processing **
             this._updateLoadingState('chapters', false);


            // Process Timeline Results
            if (timelineResult.status === 'fulfilled') {
                 // ... (process and render timeline - unchanged) ...
                 const timelineData = timelineResult.value;
                 this._renderTimelineGraph(timelineData, false);
                 timelineFetchSuccess = true;
            } else { /* ... error handling ... */ }
             // ** Set loading state false after processing **
             this._updateLoadingState('timeline', false);


        } catch (error) { // Catch unexpected errors
            console.error(`Unexpected error loading data for ${material}:`, error);
            this._showError(`An unexpected error occurred loading data for ${material}.`);
             // Ensure loading states are false even if Promise.allSettled itself errors (unlikely)
             this._updateLoadingState('chapters', false);
             this._updateLoadingState('timeline', false);
        }
        // No finally block needed here as states are set within try/catch paths
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
    _renderHeatmap() {
        // ... (keep existing code, it's correct)
        this.heatmapGrid.innerHTML = ''; // Clear previous cells
        if (!this.chaptersData || !this.heatmapTooltipElement) return;

        this.chaptersData.forEach(chapter => {
            const cell = document.createElement('div');
            cell.classList.add('heatmap-cell');
            const masteryLevel = this._getMasteryLevelClass(chapter.mastery); // e.g., 'low', 'medium', 'high'
            cell.dataset.mastery = masteryLevel;
            cell.dataset.chapter = chapter.chapter; // Store chapter name for potential click interaction

                        // --- Tooltip Text for JS ---
            const tooltipText = `${chapter.chapter} (${chapter.mastery}%)`;

            // --- Add Event Listeners ---
            cell.addEventListener('mouseenter', (event) => {
                this._showHeatmapTooltip(tooltipText, event.target);
            });
            cell.addEventListener('mouseleave', () => {
                this._hideHeatmapTooltip();
            });
            // --- Click listener remains the same ---
            cell.addEventListener('click', () => {
                 if (!this.isSelectionMode) {
                     this._navigateToChapterDetails(chapter.chapter);
                 }
             });

            this.heatmapGrid.appendChild(cell);
        });
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

    /**
     * Renders the grid of chapter cards.
     * @private
     */
    _renderChapterGrid() {
       // ... (keep existing code, it's correct)
       this.chapterGrid.innerHTML = ''; // Clear previous cards
        if (!this.chaptersData) return;

        this.chaptersData.forEach(chapter => {
            const card = document.createElement('div');
            card.classList.add('chapter-card');
            card.dataset.chapterName = chapter.chapter; // Use chapter name as identifier

            const masteryLevel = this._getMasteryLevelClass(chapter.mastery);
            const masteredCount = chapter.mastery // Placeholder logic: Estimate mastered based on mastery %
                 ? Math.round((chapter.mastery / 100) * (chapter.totalCards - (chapter.buriedCards || 0)))
                 : 0;

            card.innerHTML = `
                <input type="checkbox" class="selection-checkbox" aria-label="Select Chapter: ${chapter.chapter}">
                <div class="chapter-card-header">
                    <span class="chapter-name">${chapter.chapter}</span>
                    <span class="mastery-indicator ${masteryLevel}">${chapter.mastery}%</span>
                </div>
                <div class="chapter-stats">
                    <span class="stat-item">Cards: ${chapter.totalCards || 0}</span>
                    <span class="stat-item">Buried: ${chapter.buriedCards || 0}</span>
                    <span class="stat-item">Mastered: ~${masteredCount}</span>
                </div>
            `;
            this.chapterGrid.appendChild(card);
        });
    }

     /**
      * Renders the review schedule timeline graph using Chart.js.
      * @param {object | null} timelineData - The data object {"YYYY-MM-DD": count} or null.
      * @param {boolean} [isLoading=false] - If true, show loading state.
      * @param {boolean} [isError=false] - If true, show error state.
      * @private
      */
     _renderTimelineGraph(timelineData, isLoading = false, isError = false) {
         if (!this.reviewScheduleCanvas) return;
         const ctx = this.reviewScheduleCanvas.getContext('2d');

         // Destroy previous chart instance if it exists
         if (this.chartInstance) {
             this.chartInstance.destroy();
             this.chartInstance = null;
         }

         // --- Status Message Handling ---
         const showStatus = (message, isErr = false) => {
            this.reviewStatusElement.textContent = message;
            this.reviewStatusElement.style.color = isErr ? '#d9534f' : '#a0a0c0'; // Red for error, default otherwise
            this.reviewStatusElement.style.display = 'block';
            this.reviewScheduleCanvas.style.display = 'none'; // Hide canvas when status is shown
        };
        const hideStatus = () => {
            this.reviewStatusElement.style.display = 'none';
            this.reviewScheduleCanvas.style.display = 'block'; // Show canvas
        };

        if (isLoading) {
            showStatus('Loading schedule...');
            return;
        }
        if (isError) {
            showStatus('Error loading schedule', true);
            return;
        }
        if (!timelineData || Object.keys(timelineData).length === 0) {
            showStatus('No upcoming reviews scheduled');
            return;
        }


         // Ensure canvas is present if it was removed by innerHTML changes above
         if (!document.getElementById('reviewScheduleCanvas')) {
              container.innerHTML = '<canvas id="reviewScheduleCanvas"></canvas>';
              this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas');
              if (!this.reviewScheduleCanvas) return; // Still couldn't find it
         }

         hideStatus();


         // Process data for Chart.js
         const sortedDates = Object.keys(timelineData).sort();
         const labels = sortedDates;
         const dataCounts = sortedDates.map(date => timelineData[date]);

         // Create the chart
         try {
             this.chartInstance = new Chart(ctx, {
                 type: 'bar',
                 data: {
                     labels: labels,
                     datasets: [{
                         label: 'Due Cards',
                         data: dataCounts,
                         backgroundColor: 'rgba(91, 192, 222, 0.6)', // #5bc0de with opacity
                         borderColor: 'rgba(91, 192, 222, 1)', // #5bc0de
                         borderWidth: 1,
                         borderRadius: 4, // Rounded bars
                         borderSkipped: false, // Apply radius to all corners
                     }]
                 },
                 options: {
                     responsive: true,
                     maintainAspectRatio: false, // Allow chart to fill container height
                     plugins: {
                         legend: {
                             display: false // Hide legend for a cleaner look
                         },
                         tooltip: {
                             backgroundColor: '#1a1a2e',
                             titleColor: '#e0e0e0',
                             bodyColor: '#e0e0e0',
                             displayColors: false, // Don't show the color box in tooltip
                             callbacks: {
                                 title: function(tooltipItems) {
                                     // Format date in tooltip if needed
                                     return tooltipItems[0].label;
                                 },
                                 label: function(tooltipItem) {
                                     return `Reviews: ${tooltipItem.raw}`;
                                 }
                             }
                         }
                     },
                     scales: {
                         x: {
                             grid: {
                                 color: 'rgba(160, 160, 192, 0.1)' // Lighter grid lines #a0a0c0
                             },
                             ticks: {
                                 color: '#a0a0c0', // Axis label color
                                 maxRotation: 45, // Rotate labels if they overlap
                                 minRotation: 45
                             }
                         },
                         y: {
                             beginAtZero: true,
                             grid: {
                                 color: 'rgba(160, 160, 192, 0.1)'
                             },
                             ticks: {
                                 color: '#a0a0c0',
                                 stepSize: 1, // Ensure integer steps if counts are low
                                  // Only show integers on y-axis
                                 callback: function(value) { if (Math.floor(value) === value) { return value; } }
                             }
                         }
                     }
                 }
             });
         } catch (chartError) {
              console.error("Failed to render chart:", chartError);
              this._showError("Failed to display review schedule graph.");
              container.innerHTML = '<canvas id="reviewScheduleCanvas"></canvas><p style="position:absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #d9534f;">Error displaying graph</p>';
             this.reviewScheduleCanvas = document.getElementById('reviewScheduleCanvas');
         }
     }

    // --- Other methods (_handleChapterGridClick, _handleSessionButtonClick, etc.) remain the same ---
     /**
     * Handles clicks within the chapter grid (cards or checkboxes).
     * @param {Event} event - The click event.
     * @private
     */
    _handleChapterGridClick(event) {
         // ... (Keep existing code from previous step) ...
         const card = event.target.closest('.chapter-card');
        if (!card) return; // Clicked outside a card

        const chapterName = card.dataset.chapterName || card.dataset.chapterId;
        const checkbox = card.querySelector('.selection-checkbox');

        // --- Only allow selection if in selection mode ---
        if (this.isSelectionMode) {
            let isChecked;
            // If click was directly on checkbox, wait for its state update
            if (event.target === checkbox) {
                 queueMicrotask(() => {
                     isChecked = checkbox.checked;
                     card.classList.toggle('selected', isChecked);
                     if (isChecked) { this.selectedChapters.add(chapterName); }
                     else { this.selectedChapters.delete(chapterName); }
                     this._updateSessionButtonState(); // Update count on main button
                 });
            } else {
                 // Click was on card area, toggle the checkbox state
                 isChecked = !checkbox.checked;
                 checkbox.checked = isChecked;
                 card.classList.toggle('selected', isChecked);
                 if (isChecked) { this.selectedChapters.add(chapterName); }
                 else { this.selectedChapters.delete(chapterName); }
                 this._updateSessionButtonState(); // Update count on main button
            }
             console.log("Selected chapters:", Array.from(this.selectedChapters));

        } else {
            // --- Navigation Mode Logic ---
            if (event.target !== checkbox) { // Don't navigate if click is on checkbox itself
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
     * Handles clicks on the "Select Chapters" icon button (#selectChaptersButton).
     * Toggles the chapter selection mode.
     * @private
     */
    _handleSelectChaptersClick() {
        this.isSelectionMode = !this.isSelectionMode;
        this._toggleSelectionModeUI(this.isSelectionMode);

        // If entering selection mode, clear previous selections
        if (this.isSelectionMode) {
                this.selectedChapters.clear();
                this.chapterGrid.querySelectorAll('.chapter-card.selected').forEach(card => card.classList.remove('selected'));
                this.chapterGrid.querySelectorAll('.selection-checkbox:checked').forEach(cb => cb.checked = false);
                this._updateSessionButtonState(); // Reset count on main button
        }
    }

    /**
    * Updates the UI elements based on the selection mode state.
    * @param {boolean} isEntering - True if entering selection mode, false if exiting.
    * @private
    */
    _toggleSelectionModeUI(isEntering) {
        this.isSelectionMode = isEntering; // Ensure state is consistent

        // Toggle class on main container for CSS rules (show/hide checkboxes)
        this.container.classList.toggle('selection-mode', isEntering);

        // Update main button text
        if (isEntering) {
            this.sessionButton.textContent = 'Start Focused Study'; // Text when selecting
            this._updateSessionButtonState(); // Add count immediately if re-entering with selections somehow? (Unlikely now)
        } else {
            this.sessionButton.textContent = 'Start Studying'; // Default text
            // Clear selection count if exiting selection mode
            // (Handled below by _updateSessionButtonState check)
        }

        // Update icon button active state
        this.selectChaptersButton?.classList.toggle('active', isEntering);

        // Hide tooltip if selection mode changes
        this._hideHeatmapTooltip();
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
        if(this.sessionButton) this.sessionButton.disabled = disableInteractions; // Main study button
        if(this.selectChaptersButton) this.selectChaptersButton.disabled = disableInteractions; // Select toggle

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

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const view = new ChapterFoldersView();
    view.initialize();
});