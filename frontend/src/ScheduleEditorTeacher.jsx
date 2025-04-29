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

  return {teacher_subjects, teacher_schedule};
}

export default function ScheduleEdit({ loaderData }) {

  const { teacher_subjects, teacher_schedule } = loaderData;

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
      <div className='flex justify-center items-center h-screen'>
          <div className='p-4 grid grid-cols-5 grid-rows-8 gap-4 bg-[rgba(217,217,217,0.4)] max-w-[70vw] rounded-lg'>
            {Array.from({length : 40}, (_, i) => {
                const cls = teacher_schedule.filter(obj => 
                (obj.class_number - 1) * 5 + idFromDay(obj.weekday_taught) === i);
                
              return (
                <div className='bg-[rgba(217,217,217,0.4)] max-w-[20vw] aspect-[3/1] rounded flex items-center overflow-hidden'>
                    {cls.length > 1 ? (
                      (() => {
                        const odd = cls.find(obj => obj.week_taught === 'odd');
                        const even = cls.find(obj => obj.week_taught === 'even');

                        return (
                          <div className="flex justify-center items-center grid grid-cols-2 gap-2">
                            <div className='h-full py-0 px-1 justify-center bg-[rgba(217,217,217,0.4)] rounded'>
                              <p className='text-white flex items-center pl-[10px] overflow-hidden text-[10px]'>{odd.subject_name}</p>
                            </div>
                            <div className='py-0 px-1 bg-[rgba(217,217,217,0.4)] rounded'>
                              <p className='text-white flex items-center pl-[10px] overflow-hidden text-[10px]'>{even.subject_name}</p>
                            </div>
                          </div>
                        );
                    })()
                    ) : <p className='text-white flex items-center pl-[10px] text-[12px]'>{cls[0]?.subject_name}</p> }
                  </div>
                )
              })}
            </div>
        </div>
        <div>
          <ul>
            {teacher_subjects.map((subject) => (
              <li
              key={subject.id}
              className="bg-[rgba(217,217,217,0.4)] p-6 rounded-xl"
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