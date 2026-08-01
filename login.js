/* ExamSphere Login System Script */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const roleSelect = document.getElementById('role-select');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('login-btn');
  const loginAlert = document.getElementById('login-alert');

  // Quick Demo Autofill Presets
  const btnStudentPreset = document.getElementById('preset-student');
  const btnFacultyPreset = document.getElementById('preset-faculty');
  const btnCoePreset = document.getElementById('preset-coe');

  if (btnStudentPreset) {
    btnStudentPreset.addEventListener('click', () => {
      roleSelect.value = 'student';
      usernameInput.value = 'STU2024001';
      passwordInput.value = 'password123';
      showLoginAlert('Student credentials auto-filled!', 'info');
    });
  }

  if (btnFacultyPreset) {
    btnFacultyPreset.addEventListener('click', () => {
      roleSelect.value = 'faculty';
      usernameInput.value = 'FAC2024045';
      passwordInput.value = 'password123';
      showLoginAlert('Faculty credentials auto-filled!', 'info');
    });
  }

  if (btnCoePreset) {
    btnCoePreset.addEventListener('click', () => {
      roleSelect.value = 'coe';
      usernameInput.value = 'COE2024001';
      passwordInput.value = 'password123';
      showLoginAlert('COE Controller credentials auto-filled!', 'info');
    });
  }

  // Handle Form Submit
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const username = usernameInput.value.trim();
      const password = passwordInput.value.trim();
      const role = roleSelect.value;

      // Validation
      if (!username) {
        showLoginAlert('Please enter your register number or username.', 'danger');
        usernameInput.focus();
        return;
      }

      if (!password) {
        showLoginAlert('Please enter your password.', 'danger');
        passwordInput.focus();
        return;
      }

      if (!role) {
        showLoginAlert('Please select your user role.', 'danger');
        roleSelect.focus();
        return;
      }

      // UI Loading state
      loginBtn.disabled = true;
      loginBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Authenticating...`;

      setTimeout(() => {
        // Authenticate & Save Session
        const user = Auth.login(username, password, role);

        showLoginAlert(`Welcome back, ${user.name}! Redirecting...`, 'success');

        setTimeout(() => {
          Auth.redirectRoleDashboard(role);
        }, 600);
      }, 800);
    });
  }

  function showLoginAlert(msg, type) {
    if (!loginAlert) return;
    loginAlert.className = `alert alert-${type} alert-dismissible fade show small rounded-3 py-2 px-3 mb-3`;
    loginAlert.innerHTML = `
      <i class="fa-solid ${type === 'danger' ? 'fa-circle-exclamation' : (type === 'success' ? 'fa-circle-check' : 'fa-circle-info')} me-2"></i>
      ${msg}
    `;
    loginAlert.classList.remove('d-none');
  }
});
