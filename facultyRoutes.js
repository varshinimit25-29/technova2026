const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get list of students and subjects for mark entry
router.get('/students', verifyToken, verifyRole(['faculty', 'admin', 'coe']), async (req, res) => {
    try {
        const studentsList = await db.query(`
            SELECT s.id as student_id, s.name, s.roll_number, s.semester, d.dept_name, d.dept_code 
            FROM students s 
            JOIN departments d ON s.department_id = d.id
            ORDER BY s.roll_number ASC
        `);

        const subjectsList = await db.query(`
            SELECT sub.id as subject_id, sub.subject_code, sub.subject_name, sub.credits, d.dept_name
            FROM subjects sub
            JOIN departments d ON sub.department_id = d.id
        `);

        res.json({ success: true, students: studentsList, subjects: subjectsList });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Submit / Update Marks (Matching Infographic section 6: "COE / Faculty Enters Marks -> Backend Stores Marks in DB")
router.post('/marks', verifyToken, verifyRole(['faculty', 'coe', 'admin']), async (req, res) => {
    try {
        const { student_id, subject_id, marks } = req.body;

        if (!student_id || !subject_id || marks === undefined || marks === '') {
            return res.status(400).json({ success: false, message: 'Student ID, Subject ID, and Marks are required' });
        }

        const markVal = parseInt(marks, 10);
        if (isNaN(markVal) || markVal < 0 || markVal > 100) {
            return res.status(400).json({ success: false, message: 'Marks must be an integer between 0 and 100' });
        }

        // Get faculty record id if user is faculty
        let facultyId = null;
        if (req.user.role === 'faculty') {
            const fac = await db.get('SELECT id FROM faculty WHERE user_id = ?', [req.user.id]);
            if (fac) facultyId = fac.id;
        }

        // Check if mark already recorded
        const existing = await db.get('SELECT id FROM marks WHERE student_id = ? AND subject_id = ?', [student_id, subject_id]);

        if (existing) {
            await db.run('UPDATE marks SET marks = ?, evaluated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [markVal, facultyId, existing.id]);
        } else {
            await db.run('INSERT INTO marks (student_id, subject_id, marks, evaluated_by) VALUES (?, ?, ?, ?)', [student_id, subject_id, markVal, facultyId]);
        }

        res.json({ success: true, message: 'Marks submitted successfully' });
    } catch (err) {
        console.error('Error saving marks:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
