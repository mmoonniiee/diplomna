import {http} from 'http';
import express from 'express';
import * as db from `.db_work`;
import { isSchoolType } from './db_work';

const server = http.createServer(async (req, res) => {
    //TODO: route endpoints 
    const app = express();
    app.use(express.json());

    app.all('/api/database', (req, res) => {
        if(method = "POST") {
            if(header = "new-school") {
                const {name, domain, type} = req.body;
                if(!db.isSchoolType(type)){
                    throw new Error("Given type is not correct");
                }
                db.addSchool(name, domain, type);
            } else if(header = "new-student") {
                db.addStudent(req.name, req.email);
            } else if(header = "new-staff") {
                db.addStaff(req.name, req.email);
            } else if(header = "new-teacher") {
                const {email, type, chorarium} = req;

            } else if(header = "new-admin"){
                db.staffIntoAdmin(req.email);
                //TODO: da se dobyrshi, ama e 2:17am
            }
            
            
            else {
                throw new Error("invalid request");
            }
        } else if(method = 'DELETE') {
            if(header = "remove-school"){
                const domain = req.body;
                db.removeSchool(domain);
            } else {
                throw new Error("invalid request");
            }
        } else {
            throw new Error("invalid request");
        }
    });
});