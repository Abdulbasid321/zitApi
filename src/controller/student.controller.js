const Student = require('../model/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new student and send login details via email
exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, departmentId, phone, address} = req.body;

    // Prevent duplicate emails
    if (await Student.findOne({ email })) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Generate a random password
    // const rawPassword = Math.random().toString(36).slice(-8);
    const hashPassword = await bcrypt.hash(password, 10);
    // const password = await bcrypt.hash(rawPassword, 10);

    // Create the student
    const student = await Student.create({
      fullName,
      email,
      departmentId,
      phone,
      address,
   
   // Empty array for completed levels
    });

    // Send the password to the student's email
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASS
    //   }
    // });

    // await transporter.sendMail({
    //   to: email,
    //   subject: 'Your Student Login Credentials',
    //   text: `Welcome, ${fullName}!\nYour login password is: ${rawPassword}`
    // });

    res.status(201).json({ message: 'Student created', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student login function
exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the student exists
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET_KEY || "poiuytrewqasdfghjklmnbvcxz", // You should store your secret key in an env variable
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send the token to the student
    res.json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all students (optionally filter by departmentId)
exports.getAllStudents = async (req, res) => {
  try {
    const filter = {};
    if (req.query.departmentId) {
      filter.departmentId = req.query.departmentId;
    }
    if (req.query.level) {
      filter.currentLevel = req.query.level;
    }

    const students = await Student.find(filter)
      .populate('departmentId', 'name code')
      .populate('semester', 'name level');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Promote a student to the next level (e.g., from 100 to 200)
exports.promoteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const currentLevel = parseInt(student.currentLevel);
    if (currentLevel === 200) {
      return res.status(400).json({ error: 'Student already at the highest level' });
    }

    const nextLevel = (currentLevel + 100).toString();
    student.currentLevel = nextLevel;

    // Save the updated student document
    await student.save();

    res.json({ message: `Student promoted to ${nextLevel} level`, student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get students by department ID
exports.getStudentsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const students = await Student.find({ departmentId })
      .populate('departmentId', 'name code')
      .populate('semester', 'name level');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// studentController.js

exports.getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findById(id).select('-password'); // Exclude password
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, {
      new: true, // return the updated doc
      runValidators: true, // validate the schema rules
    });

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.status(200).json({
      message: 'Student profile updated successfully',
      updatedStudent,
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};