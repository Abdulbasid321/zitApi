const express = require('express');
const router = express.Router();
const studentController = require('../controller/student.controller');

// Create a new student
router.post('/create', studentController.createStudent);

// Get all students (optional filter by department or level)
router.get('/all', studentController.getAllStudents);

// studentRoutes.js or wherever you define routes
router.get('/:id', studentController.getStudentById);


// Promote a student to the next level
router.post('/promote/:studentId', studentController.promoteStudent);

// Get all departments
router.get('/departments', studentController.getAllDepartments);

// Get students by department
router.get('/department/:departmentId', studentController.getStudentsByDepartment);

// Student login route
router.post('/login', studentController.studentLogin);

router.put('/:id', studentController.updateStudent);

module.exports = router;
