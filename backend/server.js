import http from 'http';
import express from 'express';
import passport from 'passport';
import './auth.js'
import * as db from './db.js';

const server = http.createServer(async (req, res) => {
  //TODO: route endpoints 
  const app = express();
  app.use(express.json());

  function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
  }

  function isAdmin(req, res, next) {
    req.user ? next() : res.sendStatus(401);
    //TODO: what's actually suposed to be done
  }

  //TODO: scope?
  app.get('/auth/google', 
    passport.authenticate('google',  {scope: ['email', 'profile']})
  );

  app.get('/google/callback', 
    passport.authenticate('google', {
      successRedirect: '/home',
      failureRedirect: '/failure'
    })
  );

  app.get('/failure', (req, res) => {
    res.send(`something went wrong`);
  }); 

  app.get('/home', (req, res) => {
    res.sendStatus(200); //todo?
  })

  app.post('/school', (req, res) => {
    const {name, domain, type} = req.body;
    if(!db.isSchoolType(type)){
      throw new Error("Invalid school type");
    }
    const result = db.addSchool(name, domain, type);
    res.send(result);
  });

  app.post('/school/:id/students', (req, res) => {
    const {name, email} = req.body;
    const result = db.addStudent(name, email);
    res.send(result);
  });

  app.post('/school/:id/staff', (req, res) => {
    const {name, email} = req.body;
    const result = db.addStaff(name, email);
    res.send(result);
  });

  app.post('/school/:id/teacher', (req, res) => {
    const {id, type, chorarium} = req;
    if(!db.isTeacherType(type)) {
      throw new Error("Invalid teacher type");
    }
    const result = db.staffIntoTeacher(id, type, chorarium);
    res.send(result);
  });

  app.post('/school/:id/admin', (req, res) => {
    const email = req.body
    const result = db.staffIntoAdmin(email);
    res.send(result);
  });

  app.post('/school/:id/subject', (req, res) => {
    const {name, chorarium, semester} = req.body;
    if(!db.isSemesterType(semester)){
      throw new Error("Invalid semester");
    }
    const result = db.addSubject(name, chorarium, semester, req.params.id);
    res.send(result);
  });

  //wtf is this
  app.post('/subject/:subject_id/teacher/:teacher_id/grade/:grade_id', (req, res) => {
    const result = db.subjectTeacherGrade(req.params.subject_id, req.params.grade_id, req.params.teacher_id);
    res.send(result);
  });

  app.get('/subject/grade/:id', (req, res) => {
    const result = db.getGradeSubjects(req.params.id);
    res.json(result);
  })

  app.get('/subject/teacher/:id', (req, res) => {
    const result = db.getTeacherSubjects(req.params.id);
    res.json(result);
  })

  app.get('/schedule/teacher/:id', (req, res) => {
    const result = db.getTeacherSchedule(req.params.id);
    res.json(result);
  });

  app.get('/schedule/grade/:id', (req, res) => {
    const result = db.getGradeSchedule(req.params.id);
    res.json(result);
  });

  app.get('/school/:id/teachers', (req, res) => {
    const result = db.getAllTeachers(req.params.id);
    res.json(result);
  });

  app.get('/school/:id/grades', (req, res) => {
    const result = db.getAllGrades(req.params.id);
    res.json(result);
  });

  app.post('/schedule/grade', (req, res) => {
    //todo
  })

  app.get('/school/:school_id/student/:student_id', (req, res) => { 
    const result = db.getStudent(req.params.student_id, req.params.school_id);
    //TODO: format result
    res.send(result);
  });

  app.get('/staff/:id', (req, res) => {
    const result = db.getStaff(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/teacher/:id', (req, res) => {
    const result = db.getTeacher(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/subject/:id', (req, res) => {
    const result = db.getSubject(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/teacher/:id/subject', (req, res) => {
    const result = db.getTeacherSubjects(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/grade/:id/subject', (req, res) => {
    const result = db.getGradeSubjects(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/school/:id/schedule', (req, res) => {
    const result = db.getSchedule(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.delete('/school', (req, res) => {
      db.removeSchool(req.domain);
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});