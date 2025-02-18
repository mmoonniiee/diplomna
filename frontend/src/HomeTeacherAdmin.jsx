import React from "react";
import Header from "./components/Header";
import SubjectEditor from './SubjectEditor';
import ScheduleButton from './components/ScheduleButton'
import Schedule from "./schedule";


export default function HomeAT() {
    return (
        <div>
            <Header />
            <SubjectEditor />
            <ScheduleEdit />
            <ScheduleButton />
        </div>
    )
}