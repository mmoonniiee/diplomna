import React from "react";
import Header from "./components/Header";
import SubjectEdit from './components/StaffEdit';
import ScheduleEdit from './components/ScheduleEdit';
import ScheduleButton from './components/ScheduleButton'
import { Route, Router, Routes } from 'react-router-dom';
import Schedule from "./schedule";


export default function HomeAT() {
    return (
        <Router>
            <div>
                <Header />
                <SubjectEdit />
                <ScheduleEdit />
                <ScheduleButton />

                <Routes> 
                    <Route path="/subject/edit" element={<></>} />
                    <Route path="/schedule/edit" element={<Schedule />} />
                    <Route path="schedule" element={<></>} />
                </Routes>
            </div>
        </Router>
    )
}