import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'

const Chas = ({boxes, onDragOver, onDragLeave, onDrop, position }) => {
    return boxes.length === 1 ? (
      <div
        onDrop={(event) => onDrop(event, boxes[0].id, position)}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        {boxes[0].content ? (
          <div>{boxes[0].content}</div>
        ) : (
          <div>Drop here</div>
        )}
      </div>
    ) : (
      <div>
        {boxes.map((box) => (
          <div
            key={box.id}
            onDrop={(event) => onDrop(event, box.id, position)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            {box.content ? (
              <div>{box.content}</div>
            ) : (
              <div>Drop here</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const Block = ({ id, onDrop }) => {
    const [firstBoxes, setFirstBoxes] = useState([{ id: `first-${id}`, content: null }]);
    const [secondBoxes, setSecondBoxes] = useState([{ id: `second-${id}`, content: null }]);
    const [isDragging, setIsDragging] = useState(false);
  
    const handleDrop = (event, boxId, position) => {
      event.preventDefault();
      event.stopPropagation();
      const itemLabel = event.dataTransfer.getData('text/plain');
      
      const box = event.currentTarget.getBoundingClientRect();
      const dropX = event.clientX - box.left;
      const dropY = event.clientY - box.top;
      const boxHeight = box.height;
      const thirdWidth = box.width / 3;
  
      const updateBoxes = (currentBoxes, existingClass) => {
        if (currentBoxes.length === 1) {
          if (dropX < thirdWidth) {
            return [
              { id: `left-${boxId}`, content: itemLabel },
              { id: `right-${boxId}`, content: existingClass }
            ];
          } else if (dropX > thirdWidth * 2) {
            return [
              { id: `left-${boxId}`, content: existingClass },
              { id: `right-${boxId}`, content: itemLabel }
            ];
          } else {
            return [{ id: boxId, content: itemLabel }];
          }
        } else {
          return currentBoxes.map(box => 
            box.id === boxId ? { ...box, content: itemLabel } : box
          );
        }
      };
  
      const isBetweenBoxes = position === 'first' ? 
        dropY > boxHeight * 0.9 : 
        dropY < boxHeight * 0.1;  
  
      if (dropX > thirdWidth && dropX < thirdWidth * 2 && isBetweenBoxes) {
        setFirstBoxes(boxes => boxes.map(box => ({ ...box, content: itemLabel })));
        setSecondBoxes(boxes => boxes.map(box => ({ ...box, content: itemLabel })));
      } else {
        if (dropX < thirdWidth || dropX > thirdWidth * 2) {
          const firstClass = firstBoxes[0].content;
          const secondClass = secondBoxes[0].content;
          setFirstBoxes(boxes => updateBoxes(boxes, firstClass));
          setSecondBoxes(boxes => updateBoxes(boxes, secondClass));
        } else {
          if (position === 'first') {
            setFirstBoxes(boxes => updateBoxes(boxes, boxes[0].content));
          } else {
            setSecondBoxes(boxes => updateBoxes(boxes, boxes[0].content));
          }
        }
      }
      
      onDrop();
    };
  
    const handleDragOver = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(true);
    };
  
    const handleDragLeave = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
    };
  
    return (
      <div>
        <div>
          <Chas
            boxes={firstBoxes}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            position="first"
          />
        </div>
        <div>
          <Chas
            boxes={secondBoxes}
            isDragging={isDragging}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            position="second"
          />
        </div>
      </div>
    );
  };

export default function Schedule(props) {
    const [grades, setGrades] = useState(null);
    const [gradeChosenId, setChosenGrade] = useState(0);
    const [gradeSubjects, setGradeSubjects] = useState(null);
    const [teachers, setTeachers] = useState(null);
    const [teacherChosenId, setChosenTeacher] = useState(0);
    const [teacherSubjects, setTeacherSubjects] = useState(null);

    const getDay = (index) => {
        const days = [`mon`, `tue`, `wed`, `thu`, `fri`];
        return days[index];
    }

    //todo: make it into classes instead of blocks
    const classes = Array.from({ length: 4 }, (_, rowIndex) =>
    Array.from({ length: 5 }, (_, colIndex) => ({
      id: `${getDay(colIndex)}-${rowIndex}`,
      value: {
        subject_name: null,
        teacher_name: null
      },
      term: props.term,
      sgtId: null
      }))
    );

    useEffect(() => {
        axios.get('http://localhost:5000/school/${props.school_id}/teachers')
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

    const handleDragOver = (event) => {
        event.preventDefault(); 
      };

    const handleDrop = (event) => {
        event.preventDefault();
        const data = event.dataTransfer.getData("text/plain");
        //update chorariums!!!!
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
                        {classes.map((row) => 
                             row.map((cls) => (
                                <Block 
                                id={cls.id}
                                onDrop={handleDrop}/>
                            )))}
                    </div>
                    <div className="subjects">
                        <ul>
                            {gradeSubjects.map((subject) => (
                                <div>
                                    <li
                                    key={subject.id}
                                    className="subject"
                                    onDrag={handleDragStart}>
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