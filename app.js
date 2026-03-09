
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

var BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
var ALL_ISSUES_URL = BASE_URL + '/issues';

// State
var allIssues = [];

// DOM elements
var issuesGrid = document.getElementById('issuesGrid');
var loadingSpinner = document.getElementById('loadingSpinner');
var issueCount = document.getElementById('issueCount');

// Fetch all issues on load
loadAllIssues();

// Load all issues
function loadAllIssues() {
    showLoading();
    fetch(ALL_ISSUES_URL)
        .then(function (response) {
            return response.json();
        })
        .then(function (result) {
            allIssues = result.data;
            hideLoading();
            displayIssues(allIssues);
        })
        .catch(function (error) {
            console.error('Error fetching issues:', error);
            hideLoading();
            issuesGrid.innerHTML = '<p style="color: #dc2626; text-align: center; grid-column: 1/-1;">Failed to load issues. Please try again.</p>';
        });
}

// Display issues in the grid
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

// Get label CSS class
function getLabelClass(label) {
    var text = label.toLowerCase().replace(/\s+/g, '-');
    if (text === 'bug') return 'bug';
    if (text === 'enhancement') return 'enhancement';
    if (text === 'documentation') return 'documentation';
    if (text === 'help-wanted') return 'help-wanted';
    if (text === 'good-first-issue') return 'good-first-issue';
    return 'enhancement';
}

// Create a single issue card
function createIssueCard(issue) {
    var card = document.createElement('div');
    card.className = 'issue-card ' + issue.status;

    // Format date
    var date = new Date(issue.createdAt);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var formattedDate = month + '/' + day + '/' + year;

    // Status icon
    var statusIcon = issue.status === 'open' ? 'assets/Open-Status.png' : 'assets/Closed- Status .png';

    // Priority class
    var priorityClass = issue.priority.toLowerCase();

    // Build labels
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

// Title case helper
function toTitleCase(str) {
    return str.replace(/\b\w/g, function (char) {
        return char.toUpperCase();
    });
}

// Loading helpers
function showLoading() {
    loadingSpinner.classList.add('show');
    issuesGrid.style.display = 'none';
}

function hideLoading() {
    loadingSpinner.classList.remove('show');
    issuesGrid.style.display = 'grid';
}