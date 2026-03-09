
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}
var BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
var ALL_ISSUES_URL = BASE_URL + '/issues';
var SINGLE_ISSUE_URL = BASE_URL + '/issue/';
var SEARCH_URL = BASE_URL + '/issues/search?q=';
var allIssues = [];
var currentTab = 'all';
var issuesGrid = document.getElementById('issuesGrid');
var loadingSpinner = document.getElementById('loadingSpinner');
var issueCount = document.getElementById('issueCount');
var modalOverlay = document.getElementById('modalOverlay');
var modalBody = document.getElementById('modalBody');
var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');

loadAllIssues();

searchBtn.addEventListener('click', function () {
    var query = searchInput.value.trim();
    if (query !== '') {
        searchIssues(query);
    } else {
        filterAndDisplay();
    }
});

searchInput.addEventListener('keyup', function (e) {
    if (e.key === 'Enter') {
        var query = searchInput.value.trim();
        if (query !== '') {
            searchIssues(query);
        } else {
            filterAndDisplay();
        }
    }
});
searchInput.addEventListener('input', function () {
    var query = searchInput.value.trim();
    if (query === '') {
        filterAndDisplay();
    }
});
function loadAllIssues() {
    showLoading();
    fetch(ALL_ISSUES_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            allIssues = result.data;
            hideLoading();
            filterAndDisplay();
        })
        .catch(function (error) {
            console.error('Error fetching issues:', error);
            hideLoading();
            issuesGrid.innerHTML = '<p style="color: #dc2626; text-align: center; grid-column: 1/-1;">Failed to load issues. Please try again.</p>';
        });
}

function displayIssues(issues) {
    issuesGrid.innerHTML = '';
    issueCount.textContent = issues.length + ' Issues';

    if (issues.length === 0) {
        issuesGrid.innerHTML = '<p style="color: #6b7280; text-align: center; grid-column: 1/-1; padding: 40px;">No issues found.</p>';
        return;
    }

    for (var i = 0; i < issues.length; i++) {
        var card = createIssueCard(issues[i]);
        issuesGrid.appendChild(card);
    }
}

function getLabelClass(label) {
    var text = label.toLowerCase().replace(/\s+/g, '-');
    if (text === 'bug') return 'bug';
    if (text === 'enhancement') return 'enhancement';
    if (text === 'documentation') return 'documentation';
    if (text === 'help-wanted') return 'help-wanted';
    if (text === 'good-first-issue') return 'good-first-issue';
    return 'enhancement';
}

function createIssueCard(issue) {
    var card = document.createElement('div');
    card.className = 'issue-card ' + issue.status;
    card.onclick = function () {
        openModal(issue.id);
    };

    var date = new Date(issue.createdAt);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var formattedDate = month + '/' + day + '/' + year;

    var statusIcon = issue.status === 'open' ? 'assets/Open-Status.png' : 'assets/Closed- Status .png';


    var priorityClass = issue.priority.toLowerCase();

    var labelsHTML = '';
    if (issue.labels && issue.labels.length > 0) {
        labelsHTML = '<div class="card-labels">';
        for (var j = 0; j < issue.labels.length; j++) {
            var labelClass = getLabelClass(issue.labels[j]);
            labelsHTML += '<span class="label-tag ' + labelClass + '"><span class="label-icon"></span> ' + issue.labels[j].toUpperCase() + '</span>';
        }
        labelsHTML += '</div>';
    }

    card.innerHTML =
        '<div class="card-header">' +
        '<img src="' + statusIcon + '" alt="' + issue.status + '" class="card-status-icon">' +
        '<span class="card-priority-badge ' + priorityClass + '">' + issue.priority.toUpperCase() + '</span>' +
        '</div>' +
        '<h3 class="card-title">' + toTitleCase(issue.title) + '</h3>' +
        '<p class="card-description">' + issue.description + '</p>' +
        labelsHTML +
        '<div class="card-footer">' +
        '<div class="card-id-author">#' + issue.id + ' by ' + issue.author + '</div>' +
        '<div class="card-date">' + formattedDate + '</div>' +
        '</div>';

    return card;
}

function toTitleCase(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}
function openModal(issueId) {
    modalOverlay.classList.add('show');
    modalBody.innerHTML = '<div class="loading-spinner show" style="display:flex;"><div class="spinner"></div><p>Loading details...</p></div>';

    fetch(SINGLE_ISSUE_URL + issueId)
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            var issue = result.data;

            var date = new Date(issue.createdAt);
            var day = date.getDate();
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            var formattedDate = (day < 10 ? '0' + day : day) + '/' + (month < 10 ? '0' + month : month) + '/' + year;
            var statusText = issue.status === 'open' ? 'Opened' : 'Closed';
            var statusClass = issue.status;

            var labelsHTML = '';
            if (issue.labels && issue.labels.length > 0) {
                labelsHTML = '<div class="modal-labels">';
                for (var j = 0; j < issue.labels.length; j++) {
                    var labelClass = getLabelClass(issue.labels[j]);
                    labelsHTML += '<span class="modal-label-tag ' + labelClass + '"><span class="modal-label-icon"></span> ' + issue.labels[j].toUpperCase() + '</span>';
                }
                labelsHTML += '</div>';
            }

            var priorityClass = issue.priority.toLowerCase();

            modalBody.innerHTML =
                '<h2>' + issue.title + '</h2>' +
                '<div class="modal-status-row">' +
                '<span class="modal-status-badge ' + statusClass + '">' + statusText + '</span>' +
                '<span class="modal-status-dot">•</span>' +
                '<span>' + statusText + ' by ' + issue.author + '</span>' +
                '<span class="modal-status-dot">•</span>' +
                '<span>' + formattedDate + '</span>' +
                '</div>' +
                labelsHTML +
                '<p class="modal-description">' + issue.description + '</p>' +
                '<div class="modal-info-box">' +
                '<div class="modal-info-item">' +
                '<span class="info-label">Assignee:</span>' +
                '<span class="info-value">' + (issue.assignee || 'Unassigned') + '</span>' +
                '</div>' +
                '<div class="modal-info-item">' +
                '<span class="info-label">Priority:</span>' +
                '<span class="card-priority-badge ' + priorityClass + '">' + issue.priority.toUpperCase() + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="modal-close-btn">' +
                '<button onclick="closeModalBtn()">Close</button>' +
                '</div>';
        })
        .catch(function (error) {
            console.error('Error fetching issue details:', error);
            modalBody.innerHTML = '<p style="color: #dc2626;">Failed to load issue details.</p>';
        });
}

function closeModal(event) {
    if (event.target === modalOverlay) {
        modalOverlay.classList.remove('show');
    }
}

function closeModalBtn() {
    modalOverlay.classList.remove('show');
}


function showLoading() {
    loadingSpinner.classList.add('show');
    issuesGrid.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
    issuesGrid.style.display = 'grid';
}
