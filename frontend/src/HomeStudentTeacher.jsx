import React from 'react';
import Header from './components/Header';
import ScheduleButton from './components/ScheduleButton';
import SchedulePage from './SchedulePage.jsx'

export default function HomeST() {
    return (
        <div>
            <Header />
            <a href="/schedule"><ScheduleButton /></a>
        </div>
    )
}