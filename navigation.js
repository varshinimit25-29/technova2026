/* ExamSphere Reusable Navigation & Layout Component Renderer */

document.addEventListener('DOMContentLoaded', () => {
  // Preloader hide
  const preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(() => {
      preloader.style.opacity = '0';
      preloader.style.visibility = 'hidden';
    }, 400);
  }

  // Render navigation components if inside layout container
  const sidebarContainer = document.getElementById('sidebar-container');
  const navbarContainer = document.getElementById('navbar-container');

  const session = Auth.getSession();
  const currentRole = session ? session.role : 'student';
  const currentUser = session ? session.user : { name: 'User', avatar: 'U' };

  // Detect paths
  const isSubdir = window.location.pathname.includes('/student/') || 
                   window.location.pathname.includes('/faculty/') || 
                   window.location.pathname.includes('/coe/');
  const rootPrefix = isSubdir ? '../' : './';
  const currentFile = window.location.pathname.split('/').pop();

  if (sidebarContainer) {
    sidebarContainer.innerHTML = renderSidebar(currentRole, currentUser, rootPrefix, currentFile);
  }

  if (navbarContainer) {
    navbarContainer.innerHTML = renderNavbar(currentUser, rootPrefix);
    setupNavbarEvents();
  }

  // Restore saved theme
  const savedTheme = localStorage.getItem(Auth.KEY_THEME) || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
});

function renderSidebar(role, user, prefix, currentFile) {
  let navItemsHtml = '';

  if (role === 'student') {
    const studentLinks = [
      { name: 'Dashboard', icon: 'fa-gauge-high', page: 'student-dashboard.html' },
      { name: 'Exam Timetable', icon: 'fa-calendar-days', page: 'timetable.html' },
      { name: 'Hall Ticket', icon: 'fa-ticket', page: 'hallticket.html' },
      { name: 'Results', icon: 'fa-square-poll-vertical', page: 'results.html' },
      { name: 'Notifications', icon: 'fa-bell', page: '#', action: 'showNotifications' }
    ];
    navItemsHtml = generateNavLinks(studentLinks, prefix + 'student/', currentFile);

  } else if (role === 'faculty') {
    const facultyLinks = [
      { name: 'Dashboard', icon: 'fa-gauge-high', page: 'faculty-dashboard.html' },
      { name: 'Attendance', icon: 'fa-clipboard-user', page: 'faculty-dashboard.html#attendance' },
      { name: 'Marks Entry', icon: 'fa-pen-to-square', page: 'faculty-dashboard.html#marks' },
      { name: 'Exam Duties', icon: 'fa-user-shield', page: 'faculty-dashboard.html#duties' },
      { name: 'Notifications', icon: 'fa-bell', page: '#', action: 'showNotifications' }
    ];
    navItemsHtml = generateNavLinks(facultyLinks, prefix + 'faculty/', currentFile);

  } else if (role === 'coe') {
    const coeLinks = [
      { name: 'Dashboard', icon: 'fa-gauge-high', page: 'coe-dashboard.html' },
      { name: 'Workflow Pipeline', icon: 'fa-diagram-project', page: 'coe-dashboard.html#workflow' },
      { name: 'Hall Allocation', icon: 'fa-building-columns', page: 'coe-dashboard.html#allocation' },
      { name: 'Analytics & Reports', icon: 'fa-chart-pie', page: 'reports.html' },
      { name: 'Notifications', icon: 'fa-bell', page: '#', action: 'showNotifications' }
    ];
    navItemsHtml = generateNavLinks(coeLinks, prefix + 'coe/', currentFile);
  }

  const userInitials = user.avatar || (user.name ? user.name.split(' ').map(n=>n[0]).join('') : 'U');

  return `
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="sidebar-brand-icon">
          <i class="fa-solid fa-graduation-cap"></i>
        </div>
        <div>
          <div class="sidebar-brand-text">ExamSphere</div>
          <span class="sidebar-brand-tag">Smart Examination ERP</span>
        </div>
      </div>

      <div class="sidebar-nav">
        <div class="nav-section-label">Main Menu</div>
        ${navItemsHtml}
      </div>

      <div class="sidebar-footer">
        <div class="user-profile-pill">
          <div class="user-avatar-initials">${userInitials}</div>
          <div class="user-info-text">
            <div class="name">${user.name || 'User'}</div>
            <div class="role">${getRoleTitle(role)}</div>
          </div>
          <button class="icon-btn-round ms-auto no-print" onclick="Auth.logout()" title="Logout" style="width:32px; height:32px; font-size:0.8rem; background: rgba(255,255,255,0.1); border:none; color:#cbd5e1;">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
        </div>
      </div>
    </aside>
  `;
}

function generateNavLinks(links, basePath, currentFile) {
  return links.map(link => {
    const isActive = currentFile === link.page;
    const activeClass = isActive ? 'active' : '';
    const href = link.action ? 'javascript:void(0)' : (link.page.startsWith('#') || link.page.includes('#') ? link.page : basePath + link.page);
    const onclick = link.action ? `onclick="${link.action}()"` : '';
    return `
      <a href="${href}" ${onclick} class="nav-item-link ${activeClass}">
        <i class="fa-solid ${link.icon}"></i>
        <span>${link.name}</span>
      </a>
    `;
  }).join('');
}

function renderNavbar(user, prefix) {
  return `
    <header class="app-navbar no-print">
      <div class="d-flex align-items-center gap-3">
        <button class="icon-btn-round d-lg-none" id="mobile-sidebar-toggle">
          <i class="fa-solid fa-bars"></i>
        </button>
        <div class="search-box-wrap d-none d-md-block">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="global-search-input" class="search-input" placeholder="Search exams, subjects, hall ticket...">
        </div>
      </div>

      <div class="navbar-right">
        <!-- Theme Toggle -->
        <button class="icon-btn-round" id="theme-toggle-btn" title="Toggle Light/Dark Theme">
          <i class="fa-solid fa-moon" id="theme-icon"></i>
        </button>

        <!-- Notification Bell Dropdown -->
        <div class="dropdown">
          <button class="icon-btn-round" id="notif-dropdown-btn" data-bs-toggle="dropdown" aria-expanded="false" title="Notifications">
            <i class="fa-regular fa-bell"></i>
            <span class="notification-dot" id="notif-dot"></span>
          </button>
          <div class="dropdown-menu dropdown-menu-end shadow-lg p-3 dropdown-menu-custom" style="width: 360px;" aria-labelledby="notif-dropdown-btn">
            <div class="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-secondary border-opacity-25">
              <div class="d-flex align-items-center gap-2">
                <h6 class="fw-bold m-0 text-white"><i class="fa-solid fa-bell text-primary me-1"></i> Notifications</h6>
                <span class="badge bg-primary rounded-pill" id="notif-count-badge">3 New</span>
              </div>
              <button class="btn btn-link btn-sm text-info text-decoration-none p-0 fw-semibold" style="font-size:0.75rem;" onclick="markAllNotificationsRead()">
                Mark all read
              </button>
            </div>

            <!-- Enable Native Browser Notifications Action Bar -->
            <div class="p-2 mb-2 rounded bg-primary bg-opacity-10 border border-primary border-opacity-25 d-flex align-items-center justify-content-between">
              <div class="small text-white opacity-75" style="font-size: 0.75rem;">
                <i class="fa-solid fa-tower-broadcast text-info me-1"></i> Live Alerts
              </div>
              <button class="btn btn-primary btn-sm py-1 px-2 fw-bold" style="font-size: 0.7rem;" onclick="enableBrowserNotifications()">
                <i class="fa-solid fa-shield-halved me-1"></i> Enable Push
              </button>
            </div>

            <div id="dropdown-notif-list" style="max-height: 260px; overflow-y: auto;">
              <div class="p-2 text-muted small"><i class="fa-solid fa-spinner fa-spin me-2"></i>Loading updates...</div>
            </div>

            <div class="border-top border-secondary border-opacity-25 pt-2 mt-2 text-center">
              <button class="btn btn-sm btn-outline-light w-100 py-1" style="font-size:0.75rem;" onclick="sendTestNotification()">
                <i class="fa-solid fa-paper-plane me-1 text-success"></i> Trigger Live Test Notification
              </button>
            </div>
          </div>
        </div>

        <!-- Role Badge Indicator -->
        <div class="d-none d-sm-flex align-items-center gap-2 border-start border-secondary border-opacity-25 ps-3 ms-2">
          <span class="badge bg-primary text-white fw-semibold px-3 py-2 rounded-pill" style="font-size:0.8rem; box-shadow: 0 0 10px rgba(37,99,235,0.4);">
            <i class="fa-solid fa-shield-halved me-1"></i> ${getRoleTitle(Auth.getSession()?.role)}
          </span>
        </div>
      </div>
    </header>
  `;
}

function setupNavbarEvents() {
  const toggleBtn = document.getElementById('mobile-sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar) sidebar.classList.toggle('show-sidebar');
    });
  }

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Load dropdown notifications
  loadHeaderNotifications();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(Auth.KEY_THEME, newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) {
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  }
}

async function loadHeaderNotifications() {
  const container = document.getElementById('dropdown-notif-list');
  if (!container) return;
  const session = Auth.getSession();
  const notifs = await API.getNotifications(session ? session.role : 'student');
  
  if (notifs && notifs.length > 0) {
    container.innerHTML = notifs.map(n => `
      <div class="p-2 mb-2 rounded bg-dark border-start border-3 border-primary notif-item text-white" onclick="handleNotifClick('${n.title}', '${n.message}')">
        <div class="fw-bold small text-info">${n.title}</div>
        <div class="text-white-50" style="font-size: 0.78rem;">${n.message}</div>
        <div class="text-end text-muted mt-1" style="font-size: 0.7rem;"><i class="fa-regular fa-clock me-1"></i>${n.date}</div>
      </div>
    `).join('');
  } else {
    container.innerHTML = `<div class="text-center text-muted py-3 small">No new notifications</div>`;
  }
}

function handleNotifClick(title, message) {
  showToast(title, message, 'info');
}

function markAllNotificationsRead() {
  const dot = document.getElementById('notif-dot');
  const badge = document.getElementById('notif-count-badge');
  if (dot) dot.style.display = 'none';
  if (badge) {
    badge.className = 'badge bg-secondary rounded-pill';
    badge.innerText = '0 Unread';
  }
  showToast('Notifications Cleared', 'All alerts marked as read.', 'success');
}

function enableBrowserNotifications() {
  if (!('Notification' in window)) {
    showToast('Not Supported', 'Desktop notifications not supported in this browser.', 'warning');
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      new Notification('ExamSphere Notifications Enabled', {
        body: 'You will now receive live examination alerts from ExamSphere ERP!',
        icon: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
      });
      showToast('Notifications Enabled', 'Browser push notifications are now ACTIVE!', 'success');
    } else {
      showToast('Permission Denied', 'Browser notification permission was not granted.', 'danger');
    }
  });
}

function sendTestNotification() {
  const title = 'Exam Announcement';
  const msg = 'May/June 2026 End Semester Exam schedule has been updated by Controller of Examination.';
  
  // Show UI toast
  showToast(title, msg, 'info');

  // Trigger Native Desktop Notification if granted
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(`ExamSphere: ${title}`, { body: msg });
  }
}

function getRoleTitle(role) {
  switch (role) {
    case 'student': return 'Student Portal';
    case 'faculty': return 'Faculty Portal';
    case 'coe': return 'COE Controller';
    default: return 'User';
  }
}

function showNotifications() {
  const btn = document.getElementById('notif-dropdown-btn');
  if (btn) btn.click();
}
