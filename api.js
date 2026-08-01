/* ExamSphere Dynamic Data & API Ready Abstraction Layer */

const API = {
  // Base path resolution for local JSON files
  getBasePath() {
    const isSubdir = window.location.pathname.includes('/student/') || 
                     window.location.pathname.includes('/faculty/') || 
                     window.location.pathname.includes('/coe/');
    return isSubdir ? '../data/' : 'data/';
  },

  // Generic async fetch with fallback
  async fetchJSON(filename, fallbackData) {
    try {
      const response = await fetch(this.getBasePath() + filename);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn(`Local fetch for ${filename} failed or restricted. Using fallback data.`, err);
      return fallbackData;
    }
  },

  // API Methods
  async getStudents() {
    const fallback = [
      { id: "STU2024001", name: "Varshini R", registerNumber: "312821104056", department: "Computer Science & Engineering", semester: 6, cgpa: 8.92, attendance: 92.5, completedExams: 18, upcomingExams: 4 },
      { id: "STU2024002", name: "Arjun Kumar", registerNumber: "31282110412", department: "Computer Science & Engineering", semester: 6, cgpa: 8.45, attendance: 88.0, completedExams: 18, upcomingExams: 4 },
      { id: "STU2024003", name: "Deepika S", registerNumber: "312821104028", department: "Information Technology", semester: 6, cgpa: 9.15, attendance: 96.0, completedExams: 18, upcomingExams: 4 }
    ];
    return await this.fetchJSON('students.json', fallback);
  },

  async getFaculty() {
    const fallback = [
      { id: "FAC2024045", name: "Dr. Priya Sundaram", designation: "Associate Professor", department: "Computer Science & Engineering", pendingSubmissions: 1, upcomingDuties: 2 }
    ];
    return await this.fetchJSON('faculty.json', fallback);
  },

  async getTimetable() {
    const fallback = [
      { id: "EX001", subjectCode: "CS8601", subjectName: "Python Programming", date: "2026-08-10", time: "10:00 AM - 01:00 PM", hall: "Hall A-102 (Main Block)", semester: 6, status: "Scheduled" },
      { id: "EX002", subjectCode: "CS8602", subjectName: "Database Management Systems", date: "2026-08-12", time: "10:00 AM - 01:00 PM", hall: "Hall B-204 (Tech Park)", semester: 6, status: "Scheduled" },
      { id: "EX003", subjectCode: "MA8401", subjectName: "Engineering Mathematics IV", date: "2026-08-14", time: "02:00 PM - 05:00 PM", hall: "Hall C-301 (Science Wing)", semester: 6, status: "Scheduled" },
      { id: "EX004", subjectCode: "CS8603", subjectName: "Artificial Intelligence & ML", date: "2026-08-17", time: "10:00 AM - 01:00 PM", hall: "Hall A-102 (Main Block)", semester: 6, status: "Scheduled" },
      { id: "EX005", subjectCode: "CS8604", subjectName: "Computer Networks & Security", date: "2026-08-19", time: "10:00 AM - 01:00 PM", hall: "Hall B-205 (Tech Park)", semester: 6, status: "Scheduled" }
    ];
    return await this.fetchJSON('timetable.json', fallback);
  },

  async getResults() {
    const fallback = {
      summary: { registerNumber: "312821104056", studentName: "Varshini R", department: "Computer Science & Engineering", semester: 5, cgpa: 8.92, sgpa: 9.10, percentage: 89.2, overallGrade: "First Class with Distinction", totalCredits: 124, status: "PASS" },
      semesters: [
        {
          sem: 5,
          sgpa: 9.10,
          subjects: [
            { code: "CS8501", name: "Theory of Computation", internal: 23, external: 68, total: 91, grade: "O", credits: 4, result: "PASS" },
            { code: "CS8502", name: "Object Oriented Analysis & Design", internal: 24, external: 65, total: 89, grade: "A+", credits: 3, result: "PASS" },
            { code: "CS8503", name: "Microprocessors & Controllers", internal: 22, external: 63, total: 85, grade: "A+", credits: 3, result: "PASS" },
            { code: "CS8504", name: "Computer Graphics & Multimedia", internal: 25, external: 70, total: 95, grade: "O", credits: 4, result: "PASS" },
            { code: "CS8511", "name": "Object Oriented Analysis Lab", internal: 25, external: 72, total: 97, grade: "O", credits: 2, result: "PASS" }
          ]
        }
      ]
    };
    return await this.fetchJSON('results.json', fallback);
  },

  async getNotifications(role) {
    const fallback = {
      student: [
        { id: 1, title: "Hall Ticket Released", message: "May/June 2026 End Semester Exam Hall Tickets are now available for download.", date: "10 mins ago", unread: true },
        { id: 2, title: "Timetable Update", message: "Python Programming (CS8601) venue updated to Main Block Hall A-102.", date: "2 hours ago", unread: true }
      ],
      faculty: [
        { id: 1, title: "Mark Submission Deadline", message: "CS8601 Python Programming internal mark entry closes in 48 hours.", date: "15 mins ago", unread: true }
      ],
      coe: [
        { id: 1, title: "Pending Marks Approval", message: "5 Department mark sheets awaiting Controller signature and publication.", date: "5 mins ago", unread: true }
      ]
    };
    const data = await this.fetchJSON('notifications.json', fallback);
    return data[role] || data['student'];
  },

  // API Mutations Mocking (Database Ready)
  async submitMarks(payload) {
    console.log("POST /api/v1/faculty/marks", payload);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Marks submitted for COE approval successfully!" }), 600));
  },

  async generateReports(params) {
    console.log("GET /api/v1/coe/reports/generate", params);
    return new Promise(resolve => setTimeout(() => resolve({ success: true, reportUrl: "#" }), 800));
  }
};
