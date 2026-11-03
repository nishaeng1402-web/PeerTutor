const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { User, AcademicRecord, Timetable } = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// CONNECT TO MONGOOSE
mongoose
  .connect('mongodb://127.0.0.1:27017/peer-study-tacker')
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch((err) => console.log('MongoDB Connection Error:', err));


// 1. UPDATE ACADEMIC MARK & CALCULATE STATUS
app.post('/api/academic/update', async (req, res) => {
  const { userId, subjectName, score } = req.body;

  let status = 'Average';

  if (score > 75) {
    status = 'Good Marks';
  } else if (score < 40) {
    status = 'Backlog';
  }

  try {
    const record = await AcademicRecord.findOneAndUpdate(
      { userId, subjectName },
      { score, status },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Record Updated',
      record
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// 2. LOG STUDY MINUTES FOR A SUBJECT
app.post('/api/timetable/log-study', async (req, res) => {
  const { userId, subjectName, minutesStudied } = req.body;

  try {
    const record = await AcademicRecord.findOneAndUpdate(
      { userId, subjectName },
      {
        $inc: {
          totalMinutesStudied: minutesStudied
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    res.json({
      message: 'Study hours logged successfully',
      record
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// 3. GET MAIN DASHBOARD DATA FOR A USER
app.get('/api/dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    const analytics = await AcademicRecord.find({ userId });

    const timetable = await Timetable.find({ userId });

    res.json({
      analytics,
      timetable
    });
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// 4. FIND PEERS WHO EXCEL WHERE USER HAS A BACKLOG
app.get('/api/p2p/find-mentors/:subjectName', async (req, res) => {
  try {
    const subject = req.params.subjectName;

    // Find users with "Good Marks" in the subject
    const mentors = await AcademicRecord.find({
      subjectName: subject,
      status: 'Good Marks'
    }).populate('userId', 'name email');

    res.json(mentors);
  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});


// START SERVER

app.get('/', (req, res) => {
  res.send('Peer Study Tracker Backend is Running!');
});

app.listen(5000, () => {
  console.log('Server active on port 5000');
});