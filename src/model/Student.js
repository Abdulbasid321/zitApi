// // models/Student.js
// const mongoose = require('mongoose');

// const studentSchema = new mongoose.Schema({
//   fullName: String,
//   email: { type: String, required: true, unique: true },
//   phone: String,
//   address: String,
//   password: String,
//   departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
//   semester: { type: String }, // Optional: if you want to keep the active semester
//   currentLevel: { type: String, default: "100" },
//   completedLevels: [{ type: String }],
// }, { timestamps: true });

// module.exports = mongoose.model('Student', studentSchema);


const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
