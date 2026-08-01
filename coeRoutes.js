const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get all exams and statistics
router.get('/exams', verifyToken, verifyRole(['coe', 'admin', 'faculty']), async (req, res) => {
    try {
        const exams = await db.query('SELECT * FROM exams ORDER BY id DESC');
        const halls = await db.query('SELECT * FROM hall');
        const schedules = await db.query(`
            SELECT es.*, e.exam_name, sub.subject_name, sub.subject_code, h.hall_name 
            FROM exam_schedule es
            JOIN exams e ON es.exam_id = e.id
            JOIN subjects sub ON es.subject_id = sub.id
            JOIN hall h ON es.hall_id = h.id
        `);

        res.json({ success: true, exams, halls, schedules });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create new exam session
router.post('/exams', verifyToken, verifyRole(['coe', 'admin']), async (req, res) => {
    try {
        const { exam_name, semester_id, start_date, end_date } = req.body;
        if (!exam_name || !semester_id || !start_date || !end_date) {
            return res.status(400).json({ success: false, message: 'All exam fields are required' });
        }

        const result = await db.run(
            'INSERT INTO exams (exam_name, semester_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [exam_name, semester_id, start_date, end_date, 'Scheduled']
        );

        res.json({ success: true, message: 'Exam created successfully', exam_id: result.lastID });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create / Add Exam Schedule
router.post('/schedule', verifyToken, verifyRole(['coe', 'admin']), async (req, res) => {
    try {
        const { exam_id, subject_id, exam_date, exam_time, hall_id } = req.body;
        if (!exam_id || !subject_id || !exam_date || !exam_time || !hall_id) {
            return res.status(400).json({ success: false, message: 'Missing exam schedule parameters' });
        }

        const result = await db.run(
            'INSERT INTO exam_schedule (exam_id, subject_id, exam_date, exam_time, hall_id) VALUES (?, ?, ?, ?, ?)',
            [exam_id, subject_id, exam_date, exam_time, hall_id]
        );

        res.json({ success: true, message: 'Schedule entry added', id: result.lastID });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Automated AI / Smart Hall Allocation algorithm
router.post('/halls/allocate', verifyToken, verifyRole(['coe', 'admin']), async (req, res) => {
    try {
        const { exam_id } = req.body;
        if (!exam_id) return res.status(400).json({ success: false, message: 'Exam ID required' });

        const students = await db.query('SELECT id, roll_number FROM students ORDER BY roll_number ASC');
        const halls = await db.query('SELECT id, hall_name, capacity FROM hall ORDER BY capacity DESC');

        if (students.length === 0 || halls.length === 0) {
            return res.status(400).json({ success: false, message: 'No students or halls available for allocation' });
        }

        // Clear existing allocations for this exam
        await db.run('DELETE FROM hall_allocation WHERE exam_id = ?', [exam_id]);

        let studentIdx = 0;
        let allocationsCount = 0;

        for (const hall of halls) {
            let seatNum = 1;
            while (seatNum <= hall.capacity && studentIdx < students.length) {
                const student = students[studentIdx];
                const seatCode = `${hall.hall_name.charAt(0).toUpperCase()}-${100 + seatNum}`;

                await db.run(
                    'INSERT INTO hall_allocation (exam_id, student_id, hall_id, seat_number, allocated_date) VALUES (?, ?, ?, ?, CURRENT_DATE)',
                    [exam_id, student.id, hall.id, seatCode]
                );

                allocationsCount++;
                seatNum++;
                studentIdx++;
            }
            if (studentIdx >= students.length) break;
        }

        res.json({
            success: true,
            message: `Smart hall allocation complete: ${allocationsCount} students assigned across available halls.`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Calculate and Publish Results for an Exam
router.post('/results/publish', verifyToken, verifyRole(['coe', 'admin']), async (req, res) => {
    try {
        const { exam_id } = req.body;
        if (!exam_id) return res.status(400).json({ success: false, message: 'Exam ID required' });

        const students = await db.query('SELECT id FROM students');

        let publishedCount = 0;

        for (const student of students) {
            const studentMarks = await db.query('SELECT marks FROM marks WHERE student_id = ?', [student.id]);
            
            if (studentMarks.length > 0) {
                const total = studentMarks.reduce((sum, item) => sum + (item.marks || 0), 0);
                const avgPercentage = parseFloat((total / studentMarks.length).toFixed(2));
                const gpa = parseFloat((avgPercentage / 25.0).toFixed(2)); // standard 4.0 scale formula
                const status = (avgPercentage >= 50.0) ? 'PASS' : 'FAIL';

                // Check existing result
                const existing = await db.get('SELECT id FROM results WHERE student_id = ? AND exam_id = ?', [student.id, exam_id]);

                if (existing) {
                    await db.run(
                        'UPDATE results SET total_marks = ?, percentage = ?, gpa = ?, status = ?, published_date = CURRENT_TIMESTAMP WHERE id = ?',
                        [total, avgPercentage, gpa, status, existing.id]
                    );
                } else {
                    await db.run(
                        'INSERT INTO results (student_id, exam_id, total_marks, percentage, gpa, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [student.id, exam_id, total, avgPercentage, gpa, status]
                    );
                }
                publishedCount++;
            }
        }

        // Update exam status to Published
        await db.run("UPDATE exams SET status = 'Published' WHERE id = ?", [exam_id]);

        res.json({
            success: true,
            message: `Results published for ${publishedCount} students successfully!`
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
