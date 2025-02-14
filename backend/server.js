import express from 'express';
import passport from 'passport';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import './auth.js'
import * as db from './db.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

console.log(process.env);

const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;
  if (token === process.env.SECRET_KEY) {
    next(); 
  } else {
    res.redirect('http://localhost:5173/'); 
  }
}

app.get('/auth/google', 
  passport.authenticate('google',  {scope: ['email', 'profile']})
);

app.get('/google/callback', 
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/'
  }), (req, res) => {
    const userPayload = { id: req.user.id, name: req.user.name, role: req.user.role};
    const token = jwt.sign(userPayload, process.env.SECRET_KEY, {expiresIn: '3h'});
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 10800000
    });
    res.redirect('/home');
  }
);

app.get('/home', (req, res) => { 
  const userRole = req.user.role;

  if(userRole === `teacher_admin`) {
    res.redirect('http://localhost:5173/home/teacheradmin');
  } else if(userRole === `school_admin`) {
    res.redirect('http://localhost:5173/home/admin');
  } else if(userRole === `teacher`) {
    res.redirect('http://localhost:5173/home/teacher');
  } else if(userRole === `student`) {
    res.redirect('http://localhost:5173/home/student');
  } else {
    res.redirect('http://localhost:5173/');
  }
});

app.get('/school/types', async (req, res) => {
  const result = await db.getSchoolTypes();
  res.json(result);
});

app.post('/school', async (req, res) => {
  const {name, domain, type} = req.body;
  if(!db.isSchoolType(type)){
    throw new Error("Invalid school type");
  }
  const result = await db.addSchool(name, domain, type);
  res.json(result);
});

app.post('/school/:id/awaiting', async (req, res) => {
  const {email, role, chorarium, teacher_type, school_id, grade_id} = req.body;
  const result = db.addAwaiting(email, role, chorarium, teacher_type, school_id, grade_id);
  res.json(result);
});

app.post('/school/:id/students', async (req, res) => {
  const {name, email} = req.body;
  const result = db.addStudent(name, email);
  res.json(result);
});

app.post('/school/:id/staff', async (req, res) => {
  const {name, email} = req.body;
  const result = db.addStaff(name, email);
  res.json(result);
});

app.post('/school/:id/teacher', async (req, res) => {
  const {id, type, chorarium} = req;
  if(!db.isTeacherType(type)) {
    throw new Error("Invalid teacher type");
  }
  const result = db.staffIntoTeacher(id, type, chorarium);
  res.json(result);
});

app.post('/school/:id/admin', async (req, res) => {
  const email = req.body
  const result = db.staffIntoAdmin(email);
  res.json(result);
});

app.post('/school/:id/subject', async (req, res) => {
  const {name, chorarium, semester} = req.body;
  if(!db.isSemesterType(semester)){
    throw new Error("Invalid semester");
  }
  const result = db.addSubject(name, chorarium, semester, req.params.id);
  res.json(result);
});

app.post('/subject/:subject_id/teacher/:teacher_id/grade/:grade_id', async (req, res) => {
  const result = db.subjectTeacherGrade(req.params.subject_id, req.params.grade_id, req.params.teacher_id);
  res.json(resullt);
});

app.get('/subject/grade/:id', async (req, res) => {
  const result = db.getGradeSubjects(req.params.id);
  res.json(result.json());
})

app.get('/subject/teacher/:id', async (req, res) => {
  const result = db.getTeacherSubjects(req.params.id);
  res.json(result.json());
})

app.get('/schedule/teacher/:id', async (req, res) => {
  const result = db.getTeacherSchedule(req.params.id);
  res.json(result.json());
});

app.get('/schedule/grade/:id', async (req, res) => {
  const result = db.getGradeSchedule(req.params.id);
  res.json(result.json());
});

app.get('/school/:id/teachers', async (req, res) => {
  const result = db.getAllTeachers(req.params.id);
  res.json(result.json());
});

app.get('/school/:id/grades', async (req, res) => {
  const result = db.getAllGrades(req.params.id);
  res.json(result.json());
});

app.get('/school/:school_id/student/:student_id', async (req, res) => { 
  const result = db.getStudent(req.params.student_id, req.params.school_id);
  res.json(result);
});

app.get('/staff/:id', async (req, res) => {
  const result = db.getStaff(req.params.id);
  res.json(result);
});

app.get('/teacher/:id', async (req, res) => {
  const result = db.getTeacher(req.params.id);
  res.json(result);
});

app.get('/subject/:id', async (req, res) => {
  const result = db.getSubject(req.params.id);
  res.json(result);
});

app.get('/teacher/:id/subject', async (req, res) => {
  const result = db.getTeacherSubjects(req.params.id);
  res.json(result);
});

app.get('/grade/:id/subject', async (req, res) => {
  const result = db.getGradeSubjects(req.params.id);
  res.json(result);
});

app.get('/grade/:id/schedule', async (req, res) => {
  const result = db.getGradeSchedule(req.params.id);
  res.json(result);
});

app.get('/teacher/:id/schedule', async (req, res) => {
  const result = db.getTeacherSchedule(req.params.id);
  res.json(result);
});

app.post('/grade/:id/schedule', async (req, res) => {
  const {sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id} = req.body;
  const result = db.insertIntoSchedule(sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id);
  res.json(result);
})

app.delete('/school/:id', async (req, res) => {
  db.removeSchool(req.params.id);
  res.send(200);
});

app.delete('/staff/:id', async (req, res) => {
  db.removeStaff(req.params.id);
  res.send(200);
});

app.delete('/student/:id', async (req, res) => {
  db.removeStudent(req.params.id).
  res.send(200);
});

app.delete('/subject/:id', async (req, res) => {
  db.removeSubject(req.params.id);
  res.send(200);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});