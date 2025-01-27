import 'dotenv/config';
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
app.use(cors());

//TODO: scope?
app.get('/auth/google', 
  passport.authenticate('google',  {scope: ['email', 'profile']})
);

app.get('/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/failure'
  }), (req, res) => {
    const userPayload = { id: req.user.id, name: req.user.name, role: req.user.role};
    const token = jwt.sign(userPayload, 'secretkey', {expiresIn: '1h'});
    res.cookie('authToken', token, {
      httpOnly: true,
      maxAge: 3600000
      //todo: add more?
    });
  }
);

app.get('/failure', (req, res) => {
  res.send(`something went wrong`);
}); 

app.get('/home', (req, res) => {
  res.sendStatus(200); //todo.
})

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
  res.send(result.json());
});

app.post('/school/:id/students', async (req, res) => {
  const {name, email} = req.body;
  const result = db.addStudent(name, email);
  res.send(result.json());
});

app.post('/school/:id/staff', async (req, res) => {
  const {name, email} = req.body;
  const result = db.addStaff(name, email);
  res.send(result.json());
});

app.post('/school/:id/teacher', async (req, res) => {
  const {id, type, chorarium} = req;
  if(!db.isTeacherType(type)) {
    throw new Error("Invalid teacher type");
  }
  const result = db.staffIntoTeacher(id, type, chorarium);
  res.send(result.json());
});

app.post('/school/:id/admin', async (req, res) => {
  const email = req.body
  const result = db.staffIntoAdmin(email);
  res.send(result.json());
});

app.post('/school/:id/subject', async (req, res) => {
  const {name, chorarium, semester} = req.body;
  if(!db.isSemesterType(semester)){
    throw new Error("Invalid semester");
  }
  const result = db.addSubject(name, chorarium, semester, req.params.id);
  res.send(result.json());
});

app.post('/subject/:subject_id/teacher/:teacher_id/grade/:grade_id', async (req, res) => {
  const result = db.subjectTeacherGrade(req.params.subject_id, req.params.grade_id, req.params.teacher_id);
  res.send(result.json());
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

app.post('/schedule/grade', async (req, res) => {
  //todo
})

app.get('/school/:school_id/student/:student_id', async (req, res) => { 
  const result = db.getStudent(req.params.student_id, req.params.school_id);
  res.send(result.json());
});

app.get('/staff/:id', async (req, res) => {
  const result = db.getStaff(req.params.id);
  res.send(result.json());
});

app.get('/teacher/:id', async (req, res) => {
  const result = db.getTeacher(req.params.id);
  res.send(result.json());
});

app.get('/subject/:id', async (req, res) => {
  const result = db.getSubject(req.params.id);
  res.send(result.json());
});

app.get('/teacher/:id/subject', async (req, res) => {
  const result = db.getTeacherSubjects(req.params.id);
  res.send(result.json());
});

app.get('/grade/:id/subject', async (req, res) => {
  const result = db.getGradeSubjects(req.params.id);
  res.send(result.json());
});

app.get('/school/:id/schedule', async (req, res) => {
  const result = db.getSchedule(req.params.id);
  res.send(result.json());
});

app.delete('/school', async (req, res) => {
    db.removeSchool(req.domain);
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});