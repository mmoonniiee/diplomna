import React, { useState, useRef } from 'react';
import axios from 'axios';


export async function clientLoader({ params }) {
  const grades = await axios.get(`http://localhost:5000/school/${params.schoolId}/grades`);
  const teachers = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);

  const grade_subjects = null;
  const grade_schedule = null;
  const gradeSchedule = Array.from({ length: 5 }).map(() => 
    Array.from({ length: 8 }).map(() => null));
  const teacher_subjects = null;
  const teacher_schedule = null;
  const teacherSchedule = Array.from({ length: 5 }).map(() => 
    Array.from({ length: 8 }).map(() => null));

  if(params.grade_id) {
    grade_subjects = await axios.get(`http://localhost:5000/subject/grade/${params.grade_id}`);
    grade_schedule = await axios.get(`http://localhost:5000/schedule/grade/${params.grade_id}`);
  }
  if(params.teacher_id) {
    teacher_subjects = await axios.get(`http://localhost:5000/subject/teacher/${params.teacher_id}`);
    teacher_schedule = await axios.get(`http://localhost:5000/schedule/grade/${params.teacher_id}`);

  }

  return {grades, teachers, grade_subjects, teacher_subjects, gradeSchedule, teacherSchedule};
}

const checkTeacherSchedule = (sgt_id, start_time, end_time) => {

}

const idFromDay = (day) => {
  switch(day){
    case "monday": return 0;
    case "tuesday": return 1;
    case "wednesday": return 2;
    case "thursday": return 3;
    case "friday": return 4;
    default: return "none";
  }
}

export default function ScheduleEdit({ loaderData }) {

  const {grades, teachers, grade_subjects, teacher_subjects, gradeSchedule, teacherSchedule} = loaderData;

  const gridRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const gridRect = gridRef.current.getBoundingClientRect();

    const dropX = e.clientX - gridRect.left;
    const colWidth = gridRect.width / 10;
    const column = Math.floor(dropX / colWidth) + 1; 
    const offsetX = dropX % colWidth; 

    const isBetween = offsetX > (2 / 3) * colWidth || offsetX < (1 / 3) * colWidth;
    const span = isBetween && column % 2 === 1 && column < 10 ? 2 : 1;
  }

  return (
    <div>
      <div>
        <div>
          
        </div>
        <div class="schedule">
          {gradeSchedule.map(cls => {
            if(cls) {
              <div className={cls.week_taught === "both" ? 
              "both-weeks" : cls.week_taught === "odd" ? 
              "odd-week" : cls.week_taught === "even" ? "even-week" : ""}
              id={`${cls.class_number}-${idFromDay(cls.weekday_taught)}`}>
                <p className='schedule-subject'>{cls.subject_name}</p>
                <p className='schedule-teacher'>{cls.teacher_name}</p>
              </div>
            }
          })}
        </div>
        <div>
          {gradeSubjects ? {/**/} : {/**/}}
          <ul>
            {gradeSubjects.map((subject) => (
              <li
              key={subject.id}
              className="subject"
              onDrag={handleDragStart}>
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
    </div>
  )
}