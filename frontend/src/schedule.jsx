import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

export default function Schedule(props) {
    const [grades, setGrades] = useState(null);
    const [gradeChosenId, setChosenGrade] = useState(0);
    const [gradeSubjects, setGradeSubjects] = useState(null);
    const [teachers, setTeachers] = useState(null);
    const [teacherChosenId, setChosenTeacher] = useState(0);
    const [teacherSubjects, setTeacherSubjects] = useState(null);


    useEffect(() => {
        axios.get('http://localhost:5000/school/${props.school_id}/grades')
        .then((response) => setTeachers(response.json()))
        .catch((error) => console.error('error fetching data:', error))
    }, []);

    useEffect(() => {
        axios.get('http://localhost:5000/school/${props.school_id}/grades')
        .then((response) => setGrades(response.json()))
        .catch((error) => console.error('error fetching data:', error))
    }, []);

    if(gradeChosenId) {
        useEffect(() => {
            axios.get('http://localhost:5000//subject/grade/${gradeChosenId}')
            .then((response) => setGradeSubjects(response.json()))
            .catch((error) => console.error('error fetching data:', error))
        })
    }

    if(teacherChosenId) {
        useEffect(() => {
            axios.get('http://localhost:5000//subject/teacher/${teacherChosenId}')
            .then((response) => setTeacherSubjects(response.json()))
            .catch((error) => console.error('error fetching data:', error))
        })
    }

    const handleDragStart = (event) => {
        event.dataTransfer.setData("text/plain");
    }

    const handleDrop = (event) => {
        event.preventDefault();
    }
    
    return (
        <div>
            <header>
            </header>
            <body>
                <div>
                    <div className="grade-teacher-lists">
                    <TabGroup>
                        <TabList>
                            <Tab>Класове</Tab>
                            <Tab>Учители</Tab>
                        </TabList>
                    <TabPanels>
                        <TabPanel>
                        <ul>
                            {grades.map((grade) => (
                                <li 
                                key={grade.id}
                                className="tab-panel"
                                onClick={() => setChosenGrade(grade.id)}>
                                    <a>{grade.subgroup}</a>
                                </li>
                            ))}
                        </ul>
                        </TabPanel>
                        <TabPanel>
                        <ul>
                            {teachers.map((teacher) => (
                                <li
                                key={teacher.id}
                                className="tab-panel"
                                onClick={() => setChosenTeacher(teacher.id)}>
                                    <a>{teacher.name}</a>0
                                </li>
                            ))}
                        </ul>
                        </TabPanel>
                    </TabPanels>
                    </TabGroup> 
                    </div>
                    <div className="schedule"></div>
                    <div className="subjects">
                        <ul>
                            {gradeSubjects.map((subject) => (
                                <li
                                key={subject.id}
                                className="subject"
                                draggable>
                                    <p>{subject.name}</p>
                                    <p>{subject.teachername}</p>
                                    <a>{subject.chorarium}</a>
                                </li>
                            ))}
                            {teacherSubjects.map((subject) => (
                                <li
                                key={subject.id}
                                className="subject"
                                draggable>
                                    <p>{subject.name}</p>
                                    <p>{subject.teachername}</p>
                                    <a>{subject.chorarium}</a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </body>
        </div>
    )
}