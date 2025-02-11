import React from 'react';
import Header from './components/Header';
import SubjectEdit from './components/StaffEdit';
import ScheduleEdit from './components/ScheduleEdit';
import Schedule from './schedule';
import { Route, Router, Routes } from 'react-router-dom';

export default function AdminHome() {
    return (
        <Router>
            <div>
                <Header />
                <a href="/subject/edit"><SubjectEdit /></a>
                <ScheduleEdit />

                <Routes> 
                    <Route path="/subject/edit" element={<></>} />
                    <Route path="/schedule/edit" element={<Schedule />} />
                </Routes>
            </div>
        </Router>
    )
}