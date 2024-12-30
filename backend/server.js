import http from 'http';
import express from 'express';
import * as db from './db_work.js';
import { resourceLimits } from 'worker_threads';

const server = http.createServer(async (req, res) => {
  //TODO: route endpoints 
  const app = express();
  app.use(express.json());    

  app.post('/school', (req, res) => {
    const {name, domain, type} = req.body;
    if(!db.isSchoolType(type)){
      throw new Error("Invalid school type");
    }
    db.addSchool(name, domain, type);
    res.sendStatus(201);
  });

  app.post('/students', (req, res) => {
    const {name, email} = req.body;
    db.addStudent(name, email);
    res.sendStatus(201);
  });

  app.post('/staff', (req, res) => {
    const {name, email} = req.body.
    db.addStaff(name, email);
    res.sendStatus(201);
  });

  app.post('/teacher', (req, res) => {
    const {id, type, chorarium} = req;
    if(!db.isTeacherType(type)) {
      throw new Error("Invalid teacher type");
    }
    db.staffIntoTeacher(id, type, chorarium);
    res.sendStatus(201);
  });

  app.post('/admin', (req, res) => {
    const email = req.body
    db.staffIntoAdmin(email);
    res.sendStatus(201);
  });

  app.post('/subject', (req, res) => {
    const {name, chorarium, semester} = req;
    if(!db.isSemesterType(semester)){
      throw new Error("Invalid semester");
    }
    db.addSubject(name, chorarium, semester);
    res.sendStatus(201);
  });

  app.post('/schedule', (req, res) => {
    //ne     
  });

  app.get('/school/:id', (req, res) => {
    //idk what they'd be getting
  });

  app.get('school/:school_id/student/:student_id', (req, res) => { 
    const result = db.getStudent(req.params.student_id, req.params.school_id);
    //TODO: format result
    res.send(result);
  });

  app.get('/admin/:id', (req, res) => {
    const result = db.getStaff(req.params.id);
    //TODO: format result
    res.send(result);
  });

  app.get('/teacher/:id', (req, res) => {
    const result = db.getTeacher(req.params.id);
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