import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import Table from './scheduleTable.jsx'

function BoxesRender({id, onDrop}) {
    const [boxes, setBoxes] = useState();
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = (event, cellId) => {
        event.preventDefault();
        const classData = event.dataTransfer.getData('text/plain');
        
        if(boxes.length === 1) {
            const cell = event.currentTarget.getBoundingClientRect();
            const cellX = event.clientX - cell.left;
            const thirdWidth = box.width / 3;

            if(cellX < thirdWidth) {
                setBoxes([
                    {id: `odd-${id}`, 
                    stgId: `id`,
                    content: {
                        subject: `name`,
                        teachername: `teacher`
                    }},
                    {id: `even-${id}`}
                ]);
            } else if(cellx > thirdWidth*2) {
                setBoxes([
                    {id: `odd-${id}`},
                    {id: `even-${id}`, 
                    stgId: `id`,
                    content: {
                        subject: `name`,
                        teachername: `teacher`
                    }}
                ]);
            } else {
                setBoxes([
                    {id: id, 
                    stgId: `id`,
                    content: {
                        subject: `name`,
                        teachername: `teacher`
                    }}
                ])
            }
        } else {
            setBoxes(boxes.map(box => 
                cell.id === cellId ? {...cell, content: classData} : cell));
        }
        onDrop();
    }

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsDragging(true);
    } 

    const handleDragLeave = () => {
        setIsDragging(false);
    }

    return (
        <div></div>
    )
}

export default function Schedule(props) {
    const [grades, setGrades] = useState(null);
    const [gradeChosenId, setChosenGrade] = useState(0);
    const [gradeSubjects, setGradeSubjects] = useState(null);
    const [teachers, setTeachers] = useState(null);
    const [teacherChosenId, setChosenTeacher] = useState(0);
    const [teacherSubjects, setTeacherSubjects] = useState(null);

    //const term = props.term

    const getDay = (index) => {
        const days = [`mon`, `tue`, `wed`, `thu`, `fri`];
        return days[index];
    }

    const classes = Array.from({ length: 8 }, (_, rowIndex) =>
    Array.from({ length: 5 }, (_, colIndex) => ({
      id: `${getDay(colIndex)}-${rowIndex}`,
      value: ``
      }))
    );

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
                    <div className="schedule">
                        <Table /> {/*i ima i oshte*/}
                    </div>
                    <div className="subjects">
                        <ul>
                            {gradeSubjects.map((subject) => (
                                <div>
                                    <li
                                    key={subject.id}
                                    className="subject"
                                    draggable>
                                        <p>{subject.name}</p>
                                        <p>{subject.teachername}</p>
                                        <a>{subject.chorarium}</a>
                                    </li>
                                </div>
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