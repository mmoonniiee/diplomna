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

const authenticate = (req, res, next) => {
  const token = req.cookies.authToken;
  if (token === process.env.SECRET_KEY) {
    next(); 
  } else {
    res.redirect('http://localhost:5173/'); 
  }
}

app.get('/auth/google', 
  passport.authenticate('google',  {scope: ['email', 'profile'], session: false})
);

app.get('/google/callback', 
  passport.authenticate('google', { session: false,
    failureRedirect: 'http://localhost:5173/fail'
  }), (req, res) => {
    const userPayload = { id: req.user.id, name: req.user.name, role: req.user.role, schoolId: req.user.schoolID};
    const token = jwt.sign(userPayload, process.env.SECRET_KEY, {expiresIn: '6h'});
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 6 * 60 * 60 * 1000
    });
    res.redirect('/home');
  }
);

app.get('/home', (req, res) => { 
  const decoded = jwt.decode(req.cookies.authToken);
  const userRole = decoded.role;
  const schoolId = decoded.schoolId;

  try {
    if(userRole === `teacher_admin`) {
      res.redirect(`http://localhost:5173/school/${schoolId}/home/admin/teacher`);
    } else if(userRole === `school_admin`) {
      res.redirect(`http://localhost:5173/school/${schoolId}/home/admin`);
    } else if(userRole === `teacher` || userRole === `student`) {
      res.redirect(`http://localhost:5173/school/${schoolId}/home`);
    } else {
      res.redirect(`http://localhost:5173`);
    }
  } catch(err) {
    res.redirect(`http://localhost:5173`);
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
  const result = await db.addAwaiting(email, role, chorarium, teacher_type, school_id, grade_id);
  res.json(result);
});

app.get('/shifts', async (req, res) => {
  const result = await db.getShifts();
  res.json(result);
});

app.post('/school/:id/grade', async (req, res) => {
  const {subgroup, grad_year, first_term, second_term, teacher_id} = req.body;
  const school_id = req.params.id;
  const result = await db.addGrade(subgroup, grad_year, first_term, second_term, teacher_id, school_id);
  res.json(result);
});

app.post('/school/:id/students', async (req, res) => {
  const {name, email} = req.body;
  const result = await db.addStudent(name, email);
  res.json(result);
});

app.post('/school/:id/staff', async (req, res) => {
  const {name, email} = req.body;
  const result = await db.addStaff(name, email);
  res.json(result);
});

app.post('/school/:id/teacher', async (req, res) => {
  const {id, type, chorarium} = req.body;
  if(!db.isTeacherType(type)) {
    throw new Error("Invalid teacher type");
  }
  const result = await db.staffIntoTeacher(id, type, chorarium);
  res.json(result);
});

app.get('/school/:id/teachers', async (req, res) => {
  const school_id = req.params.id;
  const result = await db.getAllTeachers(school_id);
  res.json(result);
});

app.post('/school/:id/admin', async (req, res) => {
  const email = req.body
  const result = await db.staffIntoAdmin(email);
  res.json(result);
});

app.get('/terms', async (req, res) => {
  const result = await db.getTerms();
  res.json(result);
});

app.get('/subject/:id', async (req, res) => {
  const result = await db.getSubject(req.params.id);
  res.json(result);
});

app.get('/school/:id/subject', async (req, res) => {
  const school_id = req.params.id;
  const result = await db.getSubjects(school_id);
  res.json(result);
});

app.post('/school/:id/subject', async (req, res) => {
  const {name, chorarium, term} = req.body;
  if(!(await db.isTermType(term))){
    throw new Error("Invalid term");
  }
  const result = await db.addSubject(name, chorarium, term, req.params.id);
  res.json(result);
});

app.post('/subject/:subject_id/teacher/:teacher_id/grade/:grade_id', async (req, res) => {
  const result = await db.insertSubjectTeacherGrade(req.params.subject_id, req.params.grade_id, req.params.teacher_id);
  res.json(result);
});

app.get('/subject/grade/:gradeId', async (req, res) => {
  const result = await db.getGradeSubjects(req.params.gradeId);
  res.json(result);
});

app.get('/subject/teacher/:id', async (req, res) => {
  const result = await db.getTeacherSubjects(req.params.id);
  res.json(result);
});

app.get('/schedule/teacher/:id/term/:term', async (req, res) => {
  const result = await db.getTeacherSchedule(req.params.id, req.params.term);
  res.json(result);
});

app.get('/schedule/grade/:gradeId/term/:term', async (req, res) => {
  const result = await db.getGradeSchedule(req.params.gradeId, req.params.term);
  res.json(result);
});

app.get('/schedule', async (req, res) => {
  const decoded = jwt.decode(req.cookies.authToken);
  const userID = decoded.id;
  const userRole = decoded.role;

  if(userRole.startsWith("teacher")) 
    res.redirect(`/schedule/teacher/${userID}/term/second`);
  else if(userRole === "student") {
    const gradeID = await db.getStudentGrade(userID);
    res.redirect(`/schedule/grade/${gradeID}/term/second`);
  }
})

app.get('/school/:id/teachers', async (req, res) => {
  const result = await db.getAllTeachers(req.params.id);
  res.json(result);
});

app.get('/school/:id/grades', async (req, res) => {
  const result = await db.getAllGrades(req.params.id);
  res.json(result);
});

app.get('/school/:school_id/student/:student_id', async (req, res) => { 
  const result = await db.getStudent(req.params.student_id, req.params.school_id);
  res.json(result);
});

app.get('/staff/:id', async (req, res) => {
  const result = await db.getStaff(req.params.id);
  res.json(result);
});

app.get('/teacher/:id', async (req, res) => {
  const result = await db.getTeacher(req.params.id);
  res.json(result);
});

app.get('/subject/:id', async (req, res) => {
  const result = await db.getSubject(req.params.id);
  res.json(result);
});

app.get('/teacher/:id/subject', async (req, res) => {
  const result = await db.getTeacherSubjects(req.params.id);
  res.json(result);
});

app.get('/grade/:id/subject', async (req, res) => {
  const result = await db.getGradeSubjects(req.params.id);
  res.json(result);
});

app.get('/grade/:id/schedule', async (req, res) => {
  const result = await db.getGradeSchedule(req.params.id);
  res.json(result);
});

app.get('/teacher/:id/schedule', async (req, res) => {
  const result = await db.getTeacherSchedule(req.params.id);
  res.json(result);
});

app.post('/school/:id/schedule', async (req, res) => {
  const {sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id} = req.body;
  const result = await db.insertIntoSchedule(sgt_id, week_taught, weekday_taught, class_number, start_time, end_time, term, school_id);
  res.json(result);
});

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