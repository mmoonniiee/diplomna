import React from 'react';
import Header from './components/Header';
import StaffEdit from './components/StaffEdit';
import SubjectEdit from './components/StaffEdit';
import ScheduleEdit from './components/ScheduleEdit';
import { Route, Router, Routes } from 'react-router-dom';

export default function AdminHome() {
    return (
        <Router>
            <div>
                <Header />
                <StaffEdit />
                <SubjectEdit />
                <ScheduleEdit />

                <Routes> 
                    <Route path="/staff/edit" element={<></>} />
                    <Route path="/subject/edit" element={<></>} />
                    <Route path="/schedule/edit" element={<Schedule />} />
                </Routes>
            </div>
        </Router>
    )
}