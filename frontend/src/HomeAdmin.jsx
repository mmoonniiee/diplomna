import React from 'react';
import Header from './components/Header';
import SubjectEditor from './SubjectEditor';
//import Schedule from './schedule';

export default function AdminHome() {
    return (
        <div>
            <Header />
            <a href="/subject/edit"><SubjectEditor /></a>
            <ScheduleEdit />
        </div>
    )
}