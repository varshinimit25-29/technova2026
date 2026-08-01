/* ExamSphere Core Dashboard Interactive Utilities & Chart Renderers */

document.addEventListener('DOMContentLoaded', () => {
  // Animate stat counters
  initStatCounters();

  // Search input listeners
  setupTableFilters();
});

// Toast notification trigger
function showToast(title, message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-custom border-${type}`;
  toast.innerHTML = `
    <div class="stat-icon-wrapper ${type === 'success' ? 'green' : (type === 'danger' ? 'amber' : 'blue')}" style="width:36px; height:36px; font-size:1rem;">
      <i class="fa-solid ${type === 'success' ? 'fa-check' : (type === 'danger' ? 'fa-exclamation' : 'fa-info')}"></i>
    </div>
    <div>
      <div class="fw-bold small">${title}</div>
      <div class="text-muted" style="font-size:0.8rem;">${message}</div>
    </div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Animate numbers from 0 to target value
function initStatCounters() {
  const counters = document.querySelectorAll('.stat-value[data-target]');
  counters.forEach(counter => {
    const target = parseFloat(counter.getAttribute('data-target'));
    const isFloat = counter.getAttribute('data-target').includes('.');
    const duration = 1200; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      counter.innerText = isFloat ? current.toFixed(2) : Math.floor(current).toLocaleString();
    }, stepTime);
  });
}

// Setup live table filtering & search
function setupTableFilters() {
  const searchInput = document.getElementById('table-search-input') || document.getElementById('global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('.custom-table tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  const semFilter = document.getElementById('semester-filter');
  if (semFilter) {
    semFilter.addEventListener('change', (e) => {
      const selectedSem = e.target.value;
      const rows = document.querySelectorAll('.custom-table tbody tr');
      rows.forEach(row => {
        const semAttr = row.getAttribute('data-semester');
        if (!selectedSem || selectedSem === 'all' || semAttr === selectedSem) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

/* --- Student Module Functions --- */

function initStudentResultsChart(semesterData) {
  const ctx = document.getElementById('results-performance-chart');
  if (!ctx) return;

  const labels = semesterData.subjects.map(s => s.code);
  const internalMarks = semesterData.subjects.map(s => s.internal);
  const externalMarks = semesterData.subjects.map(s => s.external);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Internal (Max 25)',
          data: internalMarks,
          backgroundColor: '#3b82f6',
          borderRadius: 6
        },
        {
          label: 'External (Max 75)',
          data: externalMarks,
          backgroundColor: '#10b981',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' }
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true, max: 100 }
      }
    }
  });
}

function printHallTicket() {
  window.print();
}

function simulateDownload(docName) {
  showToast('Download Started', `Generating official PDF for ${docName}...`, 'success');
}

/* --- Faculty Module Functions --- */

function submitFacultyMarks(event) {
  if (event) event.preventDefault();
  
  const form = document.getElementById('marks-entry-form');
  if (!form) return;

  // Validate all number inputs
  const markInputs = form.querySelectorAll('.mark-input');
  let isValid = true;

  markInputs.forEach(input => {
    const val = parseFloat(input.value);
    if (isNaN(val) || val < 0 || val > 100) {
      input.classList.add('is-invalid');
      isValid = false;
    } else {
      input.classList.remove('is-invalid');
    }
  });

  if (!isValid) {
    showToast('Validation Error', 'Please ensure all marks are valid numbers between 0 and 100.', 'danger');
    return;
  }

  showToast('Submitting Marks', 'Sending mark sheet to Department Chair & COE...', 'info');

  setTimeout(() => {
    showToast('Success', 'Marks submitted for COE verification successfully!', 'success');
    const badge = document.getElementById('marks-status-badge');
    if (badge) {
      badge.className = 'badge-status warning';
      badge.innerHTML = '<i class="fa-solid fa-clock"></i> Pending COE Verification';
    }
  }, 1000);
}

function simulateExcelUpload() {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.xlsx, .xls, .csv';
  fileInput.onchange = () => {
    showToast('Excel Uploaded', `Parsed ${fileInput.files[0].name} - 60 student records populated!`, 'success');
  };
  fileInput.click();
}

/* --- COE Module Functions & Analytics --- */

function advanceWorkflowStep(currentStepId, nextStepId, stepName) {
  const currentCard = document.getElementById(currentStepId);
  const nextCard = document.getElementById(nextStepId);

  if (currentCard) {
    currentCard.classList.remove('active');
    currentCard.querySelector('.badge-status').className = 'badge-status success';
    currentCard.querySelector('.badge-status').innerHTML = '<i class="fa-solid fa-check"></i> Completed';
  }

  if (nextCard) {
    nextCard.classList.add('active');
    nextCard.querySelector('.badge-status').className = 'badge-status warning';
    nextCard.querySelector('.badge-status').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> In Progress';
  }

  showToast('Workflow Updated', `Examination pipeline advanced to stage: ${stepName}`, 'success');
}

function triggerAutoHallAllocation() {
  showToast('Algorithm Running', 'Computing optimal student seating allocation based on roll numbers...', 'info');
  setTimeout(() => {
    const bars = document.querySelectorAll('.progress-bar-fill');
    bars.forEach(bar => {
      bar.style.width = '100%';
    });
    const statuses = document.querySelectorAll('.hall-status-badge');
    statuses.forEach(s => {
      s.className = 'badge-status success hall-status-badge';
      s.innerHTML = '<i class="fa-solid fa-lock"></i> Allocated (100%)';
    });
    showToast('Allocation Complete', '12,450 students allocated across 42 exam halls without conflicts!', 'success');
  }, 1200);
}

function initCoeAnalyticsCharts() {
  // Department Pass Percentage Chart
  const deptCtx = document.getElementById('coe-dept-pass-chart');
  if (deptCtx) {
    new Chart(deptCtx, {
      type: 'doughnut',
      data: {
        labels: ['Computer Science', 'Information Tech', 'Electronics & Comm', 'Electrical & Elec', 'Mechanical'],
        datasets: [{
          data: [94.2, 91.8, 88.5, 85.4, 82.1],
          backgroundColor: ['#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right' }
        }
      }
    });
  }

  // Pass Percentage Trend Line Chart
  const trendCtx = document.getElementById('coe-pass-trend-chart');
  if (trendCtx) {
    new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: ['Nov 2024', 'Apr 2025', 'Nov 2025', 'Apr 2026'],
        datasets: [{
          label: 'Overall Pass Percentage (%)',
          data: [84.5, 87.2, 89.1, 91.4],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 6,
          pointBackgroundColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { min: 70, max: 100 }
        }
      }
    });
  }
}
