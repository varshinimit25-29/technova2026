/* ExamSphere Authentication & Role Session Simulation */

const Auth = {
  // Key names for localStorage
  KEY_USER: 'examsphere_user',
  KEY_ROLE: 'examsphere_role',
  KEY_THEME: 'examsphere_theme',

  // Initialize session or set defaults
  getSession() {
    const user = localStorage.getItem(this.KEY_USER);
    const role = localStorage.getItem(this.KEY_ROLE);
    if (user && role) {
      return { user: JSON.parse(user), role: role };
    }
    return null;
  },

  // Login simulation
  login(username, password, role) {
    let userData = {};
    if (role === 'student') {
      userData = {
        id: 'STU2024001',
        name: 'Varshini R',
        registerNumber: '312821104056',
        department: 'Computer Science & Engineering',
        semester: 6,
        avatar: 'VR'
      };
    } else if (role === 'faculty') {
      userData = {
        id: 'FAC2024045',
        name: 'Dr. Priya Sundaram',
        designation: 'Associate Professor',
        department: 'Computer Science & Engineering',
        avatar: 'PS'
      };
    } else if (role === 'coe') {
      userData = {
        id: 'COE2024001',
        name: 'Dr. K. Ramanathan',
        designation: 'Controller of Examinations',
        department: 'COE Central Office',
        avatar: 'KR'
      };
    }

    localStorage.setItem(this.KEY_USER, JSON.stringify(userData));
    localStorage.setItem(this.KEY_ROLE, role);
    return userData;
  },

  // Logout handling
  logout() {
    localStorage.removeItem(this.KEY_USER);
    localStorage.removeItem(this.KEY_ROLE);
    
    // Get relative path to index.html depending on current depth
    const path = window.location.pathname;
    if (path.includes('/student/') || path.includes('/faculty/') || path.includes('/coe/')) {
      window.location.href = '../index.html';
    } else {
      window.location.href = 'index.html';
    }
  },

  // Page protection guard
  requireAuth(requiredRole) {
    const session = this.getSession();
    if (!session) {
      this.redirectToLogin();
      return false;
    }

    if (requiredRole && session.role !== requiredRole) {
      alert(`Unauthorized Access. This portal requires ${requiredRole.toUpperCase()} permissions.`);
      this.redirectRoleDashboard(session.role);
      return false;
    }
    return session;
  },

  redirectRoleDashboard(role) {
    const isSubdir = window.location.pathname.includes('/student/') || 
                     window.location.pathname.includes('/faculty/') || 
                     window.location.pathname.includes('/coe/');
    const prefix = isSubdir ? '../' : './';

    switch (role) {
      case 'student':
        window.location.href = prefix + 'student/student-dashboard.html';
        break;
      case 'faculty':
        window.location.href = prefix + 'faculty/faculty-dashboard.html';
        break;
      case 'coe':
        window.location.href = prefix + 'coe/coe-dashboard.html';
        break;
      default:
        window.location.href = prefix + 'index.html';
    }
  },

  redirectToLogin() {
    const isSubdir = window.location.pathname.includes('/student/') || 
                     window.location.pathname.includes('/faculty/') || 
                     window.location.pathname.includes('/coe/');
    window.location.href = isSubdir ? '../index.html' : 'index.html';
  }
};
