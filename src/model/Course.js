const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: { type: String, required: true, unique: true },
  courseTitle: { type: String, required: true },
  creditUnits: { type: Number, required: true },
  lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
  level: { type: String, required: true }, // or ObjectId if it's a model
  semester: { type: String, required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
