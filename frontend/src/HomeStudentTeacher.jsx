import React from 'react';
import Header from './components/Header';
import ScheduleButton from './components/ScheduleButton';
import { Route, Router, Routes } from 'react-router-dom';
import SchedulePage from './SchedulePage.jsx'

export default function HomeST() {
    return (
        <Router>
            <div>
                <Header />
                <a href="/schedule"><ScheduleButton /></a>

                <Routes>
                    <Route path="/schedule" element={SchedulePage} />
                </Routes>
            </div>
        </Router>
    )
}