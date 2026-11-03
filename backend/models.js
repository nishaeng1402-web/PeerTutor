const mongoose = require('mongoose');

// User & Peer relationships
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  peers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

// Academic subject performance tracking
const AcademicRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  score: { type: Number, default: 0 },
  // Calculated automatically: Backlog if score < 40, Good if > 75
  status: { 
    type: String, 
    enum: ['Good Marks', 'Average', 'Backlog'], 
    default: 'Average' 
  },
  totalMinutesStudied: { type: Number, default: 0 } 
});

// Scheduled study blocks & completed sessions
const TimetableSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectName: { type: String, required: true },
  dayOfWeek: { type: String, required: true }, // e.g., 'Monday'
  startTime: { type: String, required: true }, // e.g., '14:00'
  endTime: { type: String, required: true },   // e.g., '16:00'
  isCompleted: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);
const AcademicRecord = mongoose.model('AcademicRecord', AcademicRecordSchema);
const Timetable = mongoose.model('Timetable', TimetableSchema);

module.exports = { User, AcademicRecord, Timetable };