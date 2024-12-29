import http from 'http';
import express from 'express';
import * as db from './db_work.js';
import { url } from 'inspector';

const server = http.createServer(async (req, res) => {
    //TODO: route endpoints 
    const app = express();
    app.use(express.json());

    app.all('/api', (req, res) => {
        if(method === "POST") {
            if(url === '/school') {
                const {name, domain, type} = req.body;
                if(!db.isSchoolType(type)){
                    throw new Error("Invalid school type");
                }
                db.addSchool(name, domain, type);
            } else if(url === '/students') {
                db.addStudent(req.name, req.email);
            } else if(url === '/staff') {
                db.addStaff(req.name, req.email);
            } else if(url === '/teacher') {
                const {email, type, chorarium} = req;
                if(!db.isTeacherType(type)) {
                    throw new Error("Invalid teacher type");
                }
                db.staffIntoTeacher(email, type, chorarium);
            } else if(url === 'admin'){
                db.staffIntoAdmin(req.email);
            } else if(url === '/subject'){
                const {name, chorarium, semester} = req;
                if(!db.isSemesterType(semester)){
                    throw new Error("Invalid semester");
                }
                db.addSubject(name, chorarium, semester);
            } else if(url === '/schedule') {
                //no
            } else {
                throw new Error("invalid request");
            }
        } 
        else if(method === 'DELETE') {
            if(url === 'school'){
                db.removeSchool(req.domain);
            } else {
                throw new Error("invalid request");
            }
        } else {
            throw new Error("invalid request");
        }
    });
});

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`);
});