const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get Student Dashboard Summary & Results (Matching Infographic section 5 API Request Flow)
router.get('/results', verifyToken, verifyRole(['student', 'admin', 'coe']), async (req, res) => {
    try {
        let studentId = req.query.student_id;
        
        if (!studentId && req.user.role === 'student') {
            const studentRow = await db.get('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
            if (studentRow) studentId = studentRow.id;
        }

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Student ID required or profile missing' });
        }

        // Fetch marks & subject info
        const marksList = await db.query(`
            SELECT m.id, m.marks, s.subject_code, s.subject_name, s.credits, d.dept_name
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            JOIN departments d ON s.department_id = d.id
            WHERE m.student_id = ?
        `, [studentId]);

        // Fetch result summary
        const resultsSummary = await db.query(`
            SELECT r.*, e.exam_name 
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            WHERE r.student_id = ?
        `, [studentId]);

        res.json({
            success: true,
            student_id: studentId,
            marks: marksList,
            results: resultsSummary
        });
    } catch (err) {
        console.error('Error fetching student results:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch student results' });
    }
});

// Get Exam Schedule / Timetable for Student
router.get('/schedule', verifyToken, verifyRole(['student', 'admin', 'coe']), async (req, res) => {
    try {
        const schedule = await db.query(`
            SELECT es.id, e.exam_name, sub.subject_code, sub.subject_name, es.exam_date, es.exam_time, h.hall_name, h.location
            FROM exam_schedule es
            JOIN exams e ON es.exam_id = e.id
            JOIN subjects sub ON es.subject_id = sub.id
            JOIN hall h ON es.hall_id = h.id
            ORDER BY es.exam_date ASC, es.exam_time ASC
        `);

        res.json({ success: true, schedule });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get Hall Ticket details
router.get('/hall-ticket', verifyToken, verifyRole(['student', 'admin', 'coe']), async (req, res) => {
    try {
        let studentId = req.query.student_id;
        if (!studentId && req.user.role === 'student') {
            const s = await db.get('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
            if (s) studentId = s.id;
        }

        const student = await db.get(`
            SELECT s.*, d.dept_code, d.dept_name, u.email 
            FROM students s 
            JOIN departments d ON s.department_id = d.id 
            JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `, [studentId || 1]);

        const allocations = await db.query(`
            SELECT ha.seat_number, ha.allocated_date, e.exam_name, sub.subject_code, sub.subject_name, es.exam_date, es.exam_time, h.hall_name, h.location
            FROM hall_allocation ha
            JOIN exams e ON ha.exam_id = e.id
            JOIN hall h ON ha.hall_id = h.id
            JOIN exam_schedule es ON es.exam_id = e.id AND es.hall_id = h.id
            JOIN subjects sub ON es.subject_id = sub.id
            WHERE ha.student_id = ?
        `, [studentId || 1]);

        res.json({
            success: true,
            student,
            allocations
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
