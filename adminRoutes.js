const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { verifyToken, verifyRole } = require('../middleware/authMiddleware');

// Get overall system stats
router.get('/stats', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const studentCount = await db.get('SELECT COUNT(*) as count FROM students');
        const facultyCount = await db.get('SELECT COUNT(*) as count FROM faculty');
        const examCount = await db.get('SELECT COUNT(*) as count FROM exams');
        const departmentCount = await db.get('SELECT COUNT(*) as count FROM departments');

        res.json({
            success: true,
            stats: {
                users: userCount.count,
                students: studentCount.count,
                faculty: facultyCount.count,
                exams: examCount.count,
                departments: departmentCount.count
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Get user management list
router.get('/users', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const users = await db.query('SELECT id, username, role, email, created_at FROM users ORDER BY id DESC');
        const departments = await db.query('SELECT * FROM departments');
        res.json({ success: true, users, departments });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Create new user (Admin functionality)
router.post('/users', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const { username, password, role, email, name, roll_number, department_id, designation } = req.body;

        if (!username || !password || !role || !email) {
            return res.status(400).json({ success: false, message: 'Username, password, role, and email are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userResult = await db.run(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            [username, hashedPassword, role, email]
        );

        const userId = userResult.lastID;

        if (role === 'student' && name) {
            await db.run(
                'INSERT INTO students (user_id, name, roll_number, department_id, semester) VALUES (?, ?, ?, ?, 1)',
                [userId, name, roll_number || `STU-${userId}`, department_id || 1]
            );
        } else if (role === 'faculty' && name) {
            await db.run(
                'INSERT INTO faculty (user_id, name, department_id, designation) VALUES (?, ?, ?, ?)',
                [userId, name, department_id || 1, designation || 'Assistant Professor']
            );
        }

        res.json({ success: true, message: `User '${username}' created successfully as ${role}` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete User
router.delete('/users/:id', verifyToken, verifyRole(['admin']), async (req, res) => {
    try {
        const userId = req.params.id;
        await db.run('DELETE FROM users WHERE id = ?', [userId]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
