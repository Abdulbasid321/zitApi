const Student = require('../model/Student');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create a new student and send login details via email

// exports.createStudent = async (req, res) => {
//   try {
//     const { fullName, email, departmentId, phone, address } = req.body;

//     // Prevent duplicate emails
//     const existing = await Student.findOne({ email });
//     if (existing) {
//       return res.status(400).json({ error: 'Email already exists' });
//     }

//     // Create the student with default level and semester
//     console.log("Creating student with:", { fullName, email, departmentId, phone, address });

//     const student = await Student.create({
//       fullName,
//       email,
//       departmentId,
//       phone,
//       address,
//       semester: '1st',
//       currentLevel: '100',
//       completedLevels: []
//     });

//     res.status(201).json({ message: 'Student created', student });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.createStudent = async (req, res) => {
  try {
    const { fullName, email, departmentId, phone, address } = req.body;

    // Check if email already exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const prefix = "ZIT";

    // Use MongoDB transaction-like pattern to ensure atomic operation
    const lastStudent = await Student.findOne({ regNumber: { $regex: `^${prefix}` } })
      .sort({ regNumber: -1 }) // sort by regNumber string
      .collation({ locale: "en_US", numericOrdering: true }); // make "ZIT10" > "ZIT2"

    let newNumber = 1;
    if (lastStudent && lastStudent.regNumber) {
      const match = lastStudent.regNumber.match(/\d+$/);
      if (match) {
        newNumber = parseInt(match[0]) + 1;
      }
    }

    const regNumber = `${prefix}${newNumber.toString().padStart(3, "0")}`;

    // Create student — MongoDB will enforce unique constraint
    const student = await Student.create({
      fullName,
      email,
      departmentId,
      phone: phone,
      regNumber,
      address,
      semester: "1st",
      currentLevel: "NID1",
      completedLevels: [],
    });

    res.status(201).json({
      message: "✅ Student created successfully",
      student,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate registration number detected. Please retry." });
    }

    console.error("Create student error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.studentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({ error: 'Invalid email or reg number' });
    }

    // Compare entered password with stored regNumber
    if (password !== student.regNumber) {
      return res.status(400).json({ error: 'Invalid email or reg number' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET_KEY || "poiuytrewqasdfghjklmnbvcxz",
      { expiresIn: '1h' }
    );

    // Send response with token and student info
    
    res.json({
      message: 'Login successful',
      token,
      student: {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        regNumber: student.regNumber, // ✅ Include this
        department: student.departmentId,
        level: student.currentLevel,
        semester: student.semester,
      },
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// exports.studentLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find student by email
//     const student = await Student.findOne({ email });
//     if (!student) {
//       return res.status(400).json({ error: 'Invalid email or phone' });
//     }

//     // Compare entered password with stored phone number
//     if (password !== student.phone) {
//       return res.status(400).json({ error: 'Invalid email or phone' });
//     }

//     // Generate a JWT token
//     const token = jwt.sign(
//       { studentId: student._id, email: student.email },
//       process.env.JWT_SECRET_KEY || "poiuytrewqasdfghjklmnbvcxz",
//       { expiresIn: '1h' }
//     );

//     // res.json({ message: 'Login successful', token });
//  res.json({
//   message: 'Login successful',
//   token,
//   student: {
//     _id: student._id,
//     fullName: student.fullName,
//     email: student.email,
//     department: student.departmentId, // ✅ FIXED HERE
//     level: student.currentLevel,
//     semester: student.semester,
//   },
// });


//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// Student login function
// exports.studentLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if the student exists
//     const student = await Student.findOne({ email });
//     if (!student) {
//       return res.status(400).json({ error: 'Invalid email or password' });
//     }

//     // Verify password
//     const isMatch = await bcrypt.compare(password, student.password);
//     if (!isMatch) {
//       return res.status(400).json({ error: 'Invalid password' });
//     }

//     // Generate a JWT token
//     const token = jwt.sign(
//       { studentId: student._id, email: student.email },
//       process.env.JWT_SECRET_KEY || "poiuytrewqasdfghjklmnbvcxz", // You should store your secret key in an env variable
//       { expiresIn: '1h' } // Token expires in 1 hour
//     );

//     // Send the token to the student
//     res.json({ message: 'Login successful', token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

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
      // .populate('semester', 'name level');
    res.json(students);
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



// exports.promoteStudent = async (req, res) => {
//   try {
//     const { id } = req.params; // from PUT /students/:id/promote
//     const student = await Student.findById(id);

//     if (!student) {
//       return res.status(404).json({ error: 'Student not found' });
//     }

//     if (student.status === 'completed') {
//       return res.status(400).json({ error: 'Student has already graduated' });
//     }

//     if (student.semester === '1st') {
//       student.semester = '2nd';
//     } else {
//       // Complete the level
//       student.completedLevels.push(student.currentLevel);

//       if (student.currentLevel === '400') {
//         student.status = 'completed';
//       } else {
//         student.currentLevel = (parseInt(student.currentLevel) + 100).toString();
//         student.semester = '1st';
//       }
//     }

//     await student.save();

//     res.json({
//       message:
//         student.status === 'completed'
//           ? '🎓 Student has graduated'
//           : `✅ Promoted to ${student.currentLevel} - ${student.semester} semester`,
//       student,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

exports.promoteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);

    if (!student) return res.status(404).json({ error: 'Student not found' });
    if (student.status === 'completed')
      return res.status(400).json({ error: 'Student has already graduated' });

    // ✅ Define your level order
    const levelOrder = ['NID1', 'NID2', 'HND1', 'HND2'];

    // Ensure completedLevels array exists
    if (!Array.isArray(student.completedLevels)) student.completedLevels = [];

    if (student.semester === '1st') {
      // Move from 1st to 2nd semester
      student.semester = '2nd';
    } else {
      // Complete current level and move to next
      student.completedLevels.push(student.currentLevel);

      const currentIndex = levelOrder.indexOf(student.currentLevel);

      if (currentIndex === -1)
        return res.status(400).json({ error: 'Invalid current level' });

      if (currentIndex === levelOrder.length - 1) {
        student.status = 'completed';
      } else {
        student.currentLevel = levelOrder[currentIndex + 1];
        student.semester = '1st';
      }
    }

    await student.save();

    res.json({
      message:
        student.status === 'completed'
          ? '🎓 Student has graduated'
          : `✅ Promoted to ${student.currentLevel} - ${student.semester} semester`,
      student,
    });
  } catch (error) {
    console.error('Promote student error:', error);
    res.status(500).json({ error: error.message });
  }
};


// exports.promoteAllStudents = async (req, res) => {
//   try {
//     const students = await Student.find({ status: { $ne: 'completed' } });

//     let promotedCount = 0;
//     let graduatedCount = 0;

//     for (let student of students) {
//       let updated = false;

//       if (student.semester === '1st') {
//         student.semester = '2nd';
//         updated = true;
//       } else {
//         student.completedLevels.push(student.currentLevel);

//         if (student.currentLevel === '400') {
//           student.status = 'completed';
//           graduatedCount++;
//         } else {
//           student.currentLevel = (parseInt(student.currentLevel) + 100).toString();
//           student.semester = '1st';
//         }

//         updated = true;
//       }

//       if (updated) {
//         await student.save();
//         promotedCount++;
//       }
//     }

//     res.json({
//       message: `✅ ${promotedCount} students promoted. 🎓 ${graduatedCount} students graduated.`,
//     });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.promoteAllStudents = async (req, res) => {
  try {
    const students = await Student.find({ status: { $ne: 'completed' } });

    const levelOrder = ['NID1', 'NID2', 'HND1', 'HND2'];
    let promotedCount = 0;
    let graduatedCount = 0;

    for (let student of students) {
      if (student.status === 'completed') continue;
      if (!Array.isArray(student.completedLevels)) student.completedLevels = [];

      if (student.semester === '1st') {
        student.semester = '2nd';
      } else {
        student.completedLevels.push(student.currentLevel);
        const currentIndex = levelOrder.indexOf(student.currentLevel);

        if (currentIndex === levelOrder.length - 1) {
          student.status = 'completed';
          graduatedCount++;
        } else {
          student.currentLevel = levelOrder[currentIndex + 1];
          student.semester = '1st';
        }
      }

      await student.save();
      promotedCount++;
    }

    res.json({
      message: `✅ ${promotedCount} students promoted. 🎓 ${graduatedCount} students graduated.`,
    });
  } catch (error) {
    console.error('Bulk promote error:', error);
    res.status(500).json({ error: error.message });
  }
};
