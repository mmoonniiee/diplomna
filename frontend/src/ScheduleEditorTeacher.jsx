import React, { useRef } from 'react';
import axios from 'axios';

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

export async function clientLoader({ params }) {

  const {data: teacher_subjects} = await axios.get(`http://localhost:5000/subject/teacher/${params.teacher_id}`);
  const {data: teacher_schedule} = await axios.get(`http://localhost:5000/schedule/teacher/${params.teacher_id}`);

  const teacherSchedule = Array.from({ length: 5 }).map(() => 
    Array.from({ length: 8 }).map(() => null));

  teacherSchedule = teacher_schedule.map(cls => {
    for(let i = 0; i < 5; i++) {
      for(let j = 0; i < 8; i++) {
        if(idFromDay(cls.weekday_taught) === i && cls.class_number === j) {
          teacherSchedule[i][j] = {...cls.subject_taught, ...cls.week_taught, ...cls.weekday_taught, 
            ...cls.class_number, ...cls.term, ...cls.subject_name, ...cls.teacher_name}
        }
      }
    }
  });

  return {teacher_subjects, teacherSchedule};
}

const checkTeacherSchedule = (sgt_id, start_time, end_time) => {

}

export default function ScheduleEdit({ loaderData }) {

  const { teacher_subjects, teacherSchedule } = loaderData;

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
        <div class="schedule">
          {teacherSchedule.map(cls => {
            if(cls) {
              <div className={cls.week_taught === "both" ? 
              "both-weeks" : cls.week_taught === "odd" ? 
              "odd-week" : cls.week_taught === "even" ? "even-week" : ""}
              id={`${cls.class_number}-${idFromDay(cls.weekday_taught)}`}>
                <p className='schedule-subject'>{cls.subject_name}</p>
                <p className='schedule-teacher'>{cls.teacher_name}</p>
              </div>
            } else {
                <div></div>
            }
          })}
        </div>
        <div>
          <ul>
            {teacher_subjects.map((subject) => (
              <li
              key={subject.id}
              className="subject"
              onDrag={handleDragStart}>
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