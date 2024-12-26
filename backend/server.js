import {http} from 'http';
import express from 'express';

const app = express();
app.use(express.json());

const server = http.createServer(async (req, res) => {
    //TOTO: route endpoints 

})