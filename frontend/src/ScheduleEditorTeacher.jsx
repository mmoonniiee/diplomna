import React from 'react';
import { useNavigate, useLoaderData } from 'react-router';
import axios from 'axios';
import { DndContext, DragOverlay, useDraggable, useDroppable, pointerWithin } from '@dnd-kit/core';
import { toast } from 'sonner';
import { useState } from 'react';

export async function clientLoader({ params }) {
  const {data: teacher_subjects} = await axios.get(`http://localhost:5000/subject/teacher/${params.teacherId}`);
  const {data: teacher_schedule} = await axios.get(`http://localhost:5000/schedule/edit/teacher/${params.teacherId}/term/${params.term}`);
  const {data: schedule_see} = await axios.get(`http://localhost:5000/teacher/${params.teacherId}/schedulesee`);

  return {teacher_subjects, teacher_schedule, schedule_see};
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

const dayFromIdBg = (id) => {
  switch(id) {
      case 0: return "Понеделник";
      case 1: return "Вторник";
      case 2: return "Сряда";
      case 3: return "Четвъртък";
      case 4: return "Петък";
      default: return "";
  }
}

const dayFromIdEng = (id) => {
  switch(id) {
      case 0: return "monday";
      case 1: return "tuesday";
      case 2: return "wednesday";
      case 3: return "thursday";
      case 4: return "friday";
      default: return "";
  }
}

const startTimeFirst = (num) => {
  switch(num) {
    case 1: return '8:00:00';
    case 2: return '8:40:00';
    case 3: return '9:30:00';
    case 4: return '10:10:00';
    case 5: return '11:10:00';
    case 6: return '11:50:00';
    case 7: return '12:40:00';
    case 8: return '13:20:00';
    default: return '';
  }
}

const endTimeFirst = (num) => {
  switch(num) {
    case 1: return '8:40:00';
    case 2: return '9:20:00';
    case 3: return '10:10:00';
    case 4: return '10:50:00';
    case 5: return '11:50:00';
    case 6: return '12:30:00';
    case 7: return '13:20:00';
    case 8: return '14:00:00';
    default: return '';
  }
}

const startTimeSecond = (num) => {
  switch(num) {
    case 1: return '13:00:00';
    case 2: return '13:40:00';
    case 3: return '14:30:00';
    case 4: return '15:10:00';
    case 5: return '16:10:00';
    case 6: return '16:50:00';
    case 7: return '17:40:00';
    case 8: return '18:20:00';
    default: return '';
  }
}

const endTimeSecond = (num) =>{
  switch(num) {
    case 1: return '13:40:00';
    case 2: return '14:20:00';
    case 3: return '15:10:00';
    case 4: return '15:50:00';
    case 5: return '16:50:00';
    case 6: return '17:30:00';
    case 7: return '18:20:00';
    case 8: return '19:00:00';
  }
}

function DraggableSubject({ id, name, chorarium }) {
  const { teacher_schedule } = useLoaderData();

  const classes_both = teacher_schedule.filter(cls => cls.subject_taught === id && cls.week_taught === 'both');
  const classes_uneven = teacher_schedule.filter(cls => cls.subject_taught === id && (cls.week_taught === 'odd' || cls.week_taught === 'even'));

  const subject_chorarium = classes_both.length + classes_uneven.length / 2;

  const isDraggable = subject_chorarium < chorarium;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: { name, chorarium, subject_chorarium },
  });

  return (
    <li
      ref={isDraggable ? setNodeRef : null}
      {...(isDraggable ? listeners : {})}
      {...(isDraggable ? attributes : {})}
      className={`rounded-xl text-white p-4 mb-4 ${isDraggable ? 'cursor-grab bg-[rgba(217,217,217,0.4)]' : 'cursor-not-allowed bg-[rgba(217,217,217,0.2)]'}`}
      style={{
        transform: isDraggable && transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
      }}
    >
      <p>{name}</p>
      <p>{subject_chorarium}/{chorarium}</p>
    </li>
  );
}


function SubjectOverlay ({ name }) {
  return (
    <div className='rounded-xl max-w-[10vw] text-white text-[12px] p-4 bg-[rgba(104,115,133,0.8)]'>
      <p>{name}</p>
    </div>
  )
}

function DropZones({ block_id, day_id }) {
  const first_id = block_id * 2 - 1;
  const second_id = block_id * 2;

  const zones = [
    { id: `week-odd-day-${dayFromIdEng(day_id)}-class-block-${block_id}`, style: { top: 0, left: 0, width: '33.33%', height: '100%', backgroundColor: 'red'} }, //нечетна седмица блок
    { id: `week-both-day-${dayFromIdEng(day_id)}-class-first-${first_id}`, style: { top: 0, left: '33.33%', width: '33.33%', height: '33.33%', backgroundColor: 'pink' } }, //нормална седмица първи час
    { id: `week-both-day-${dayFromIdEng(day_id)}-class-block-${block_id}`, style: { top: '33.33%', left: '33.33%', width: '33.33%', height: '33.33%', backgroundColor: 'yellow' } }, //нормална седмица блок
    { id: `week-both-day-${dayFromIdEng(day_id)}-class-second-${second_id}`, style: { top: '66.66%', left: '33.33%', width: '33.33%', height: '33.33%', backgroundColor: 'green' } }, //нормална седмица втори час
    { id: `week-even-day-${dayFromIdEng(day_id)}-class-block-${block_id}`, style: { top: 0, left: '66.66%', width: '33.33%', height: '100%', backgroundColor: 'blue' } }, //четна седмица блок
  ];

  const droppables = zones.map(zone => ({
    ...zone,
    ...useDroppable({ id: zone.id }),
  }));

  return (
    <>
      {droppables.map(({ id, style, setNodeRef }) => (
        <div
          key={id}
          ref={setNodeRef}
          style={{
            ...style,
            position: 'absolute',
            opacity: 0.1,
            pointerEvents: 'auto',
            zIndex: style.left === '33.33%' ? 10 : 1,
          }}
        />
      ))}
    </>
  );
}

async function handleDragEnd(event, params) {
  const { active, over } = event;

  if(!over) return;

  const split = over.id.split(`-`);

  const {data: teacher_shift} = await axios.get(`http://localhost:5000/teacher/${params.teacherId}/term/${params.term}/shift`);

  if(split[1] === 'both' && (active.chorarium - active.subject_chorarium < 2)) {
    toast(<div className='bg-[rgba(4,15,33,1)]'><p className='text-[rgba(238,108,77,1)]'>Недостатъчно хорариум за предмета!</p></div>);
    return;
  }

  const first_params = {
    week_taught: split[1],
    weekday_taught: split[3],
    class_number: split[6] * 2 - 1,
    start_time: teacher_shift === 'first' ? startTimeFirst(split[6] * 2 - 1) : startTimeSecond(split[6] * 2 - 1),
    end_time: teacher_shift === 'first' ? endTimeFirst(split[6] * 2 - 1) : endTimeSecond(split[6] * 2 - 1),
    term: params.term
  }
  
  const second_params = {
    week_taught: split[1],
    weekday_taught: split[3],
    class_number: split[6] * 2,
    start_time: teacher_shift === 'first' ? startTimeFirst(split[6] * 2) : startTimeSecond(split[6] * 2),
    end_time: teacher_shift === 'first' ? endTimeFirst(split[6] * 2) : endTimeSecond(split[6] * 2),
    term: params.term,
  }

  const cls_params = {
    week_taught: split[1],
    weekday_taught: split[3],
    class_number: split[6],
    start_time: teacher_shift === 'first' ? startTimeFirst(+split[6]) : startTimeSecond(+split[6]),
    end_time: teacher_shift === 'first' ? endTimeFirst(+split[6]) : endTimeSecond(+split[6]),
    term: params.term,
  }

  if(split[5] === 'block') {
    const {data: t_first} = await axios.get(`http://localhost:5000/teacher/check/${active.id}`, { params: first_params });
    const {data: t_second} = await axios.get(`http://localhost:5000/teacher/check/${active.id}`, { params: second_params });

    const {data: g_first} = await axios.get(`http://localhost:5000/grade/check/${active.id}`, {params: first_params});
    const {data: g_second} = await axios.get(`http://localhost:5000/grade/check/${active.id}`, {params: second_params});

    var t_check = t_first && t_second;
    var g_check = g_first && g_second;
  } else {
    var {data: t_check} = await axios.get(`http://localhost:5000/teacher/check/${active.id}`, { params: cls_params });
    var {data: g_check} = await axios.get(`http://localhost:5000/grade/check/${active.id}`, { params: cls_params });
  }

  if(!t_check) {
    toast(<div className='bg-[rgba(4,15,33,1)]'><p className='text-[rgba(238,108,77,1)]'>Преподавателят вече има учебен час по даденото време!</p></div>);
    return;
  }

  if(!g_check) {
    if(split[5] === 'block'){
      await axios.delete(`http://localhost:5000/class/${active.id}`, { params: first_params });
      await axios.delete(`http://localhost:5000/class/${active.id}`, { params: second_params });
    } else {
      await axios.delete(`http://localhost:5000/class/${active.id}`, { params: cls_params });
    }
  }

  if(split[5] === 'block'){
    await axios.post(`http://localhost:5000/school/${params.schoolId}/schedule/${active.id}`, { params: first_params });
    await axios.post(`http://localhost:5000/school/${params.schoolId}/schedule/${active.id}`, { params: second_params });
  } else {
    await axios.post(`http://localhost:5000/school/${params.schoolId}/schedule/${active.id}`, { params: cls_params });
  }
}

export default function ScheduleEdit({ loaderData, params }) {
  const { teacher_subjects, teacher_schedule, schedule_see } = loaderData;

  const [activeName, setActiveName] = useState(null);
  const [visibility, setVisibility] = useState(schedule_see);
  const navigate = useNavigate();

  const handleChange = async () => {
    setVisibility(!visibility);
    await axios.post(`http://localhost:5000/teacher/${params.teacherId}/visibility/${!visibility}`);
  }

  return (
    <div className='h-full w-full'>
      <DndContext
      collisionDetection={pointerWithin}
      onDragStart={event => { 
        const name = event.active.data.current?.name;
        setActiveName(name || null);}}
        onDragEnd={async event => {
          await handleDragEnd(event, params);
          setActiveName(null);
          navigate('.');}}>
        <div className='grid p-2 grid-cols-[75%_25%] gap-6 h-full mr-8'>
          <div className='flex justify-center items-center h-full'>
            <div className='p-4 grid grid-cols-5 gap-4 bg-[rgba(253,253,253,0.2)] max-w-[70vw] max-h-[85vh] rounded-xl'>
                {Array.from({length: 5}, (_, day) => {
                    return (
                      <div className='grid gap-2 grid-rows-[7%_93%]'>
                        <div>
                            <p className='text-white text-center'>{dayFromIdBg(day)}</p>
                        </div>
                        <div className='grid grid-rows-4 gap-4 h-full'>
                            {Array.from({length: 4}, (_, block) => {
                                return (
                                  <div className='relative grid grid-rows-2 gap-2 bg-[rgba(253,253,253,0.2)] max-h-[15vh] rounded-2xl p-2'>
                                      <DropZones block_id={block + 1} day_id={day}/>
                                      {Array.from({length: 2}, (_, cls) => {
                                          const index = block * 2 + (cls % 2);
                                          return (
                                            <div key={ index } className='text-white'>
                                                {(() => {
                                                  const classes = teacher_schedule.filter(obj => 
                                                    obj.class_number === (index + 1) && idFromDay(obj.weekday_taught) === day);
                                                  
                                                  return classes.length > 1 ? 
                                                  <div>
                                                    {(() => {
                                                      const odd = classes.find(obj => obj.week_taught === 'odd');
                                                      const even = classes.find(obj => obj.week_taught === 'even');
                                                      
                                                      return (
                                                        <div className='justify-center items-center grid grid-cols-2 gap-2 px'>
                                                            <div className='bg-[rgba(253,253,253,0.2)] h-full w-full max-w-[20vw] max-h-[6vh] aspect-[3/2] rounded-2xl p-1'>
                                                              <p className='overflow-hidden text-[10px] line-clamp-2'>{odd.subject_name}</p>
                                                            </div>
                                                            <div className='bg-[rgba(253,253,253,0.2)] h-full w-full max-w-[20vw] max-h-[6vh] aspect-[3/2] rounded-2xl p-1'>
                                                              <p className='overflow-hidden text-[10px] line-clamp-2'>{even.subject_name}</p>
                                                            </div>
                                                          </div>
                                                        )
                                                    })()}
                                                  </div> : 
                                                  classes.length === 1 ? (() => {
                                                    return classes[0].week_taught === 'odd' ? 
                                                    <div className='grid grid-cols-2'>
                                                      <div className='bg-[rgba(253,253,253,0.2)] h-full w-full max-w-[20vw] max-h-[6vh] aspect-[3/2] rounded-2xl p-1'>
                                                        <p className='overflow-hidden text-[10px] line-clamp-2'>{classes[0]?.subject_name}</p>
                                                      </div>
                                                      <div></div>
                                                    </div> : 
                                                    classes[0].week_taught === 'even' ? 
                                                    <div className='grid grid-cols-2'>
                                                      <div></div>
                                                      <div className='bg-[rgba(253,253,253,0.2)] max-w-[20vw] aspect-[3/2] max-h-[6vh] w-full h-full rounded-2xl p-1'>
                                                        <p className='overflow-hidden text-[10px] line-clamp-2'>{classes[0]?.subject_name}</p>
                                                      </div>
                                                    </div> :
                                                    <div className='bg-[rgba(253,253,253,0.2)] h-full w-full max-w-[20vw] aspect-[3/1] rounded-2xl'>
                                                      <p className='pl-2 pt-[2px] overflow-hidden text-[11px] line-clamp-2'>{classes[0]?.subject_name}</p>
                                                    </div> 
                                                  })() :
                                                  <div className='bg-[rgba(253,253,253,0.2)] h-full w-full max-w-[20vw] aspect-[3/1] rounded-2xl p-2'>
                                                  </div>
                                                })()}
                                            </div>
                                        )})}
                                  </div>
                              )})}
                          </div>
                      </div>
                    )
                })}
            </div>
          </div>
          <div className='grid grid-rows-[20%_80%] justify-center items-center'>
            <div className="flex flex-col space-y-4 mt-10 items-center justify-center">
              <p className='text-white text-center'>Има ли учителят достъп до програмата:</p>
              <label className="relative inline-block w-12 h-6 cursor-pointer">
                <input type="checkbox" className="sr-only" checked={visibility} onClick={handleChange}/>
                <div
                  className={`w-full h-full rounded-full transition-colors duration-300 ${
                    visibility ? 'bg-[rgba(238,108,77,1)]' : 'bg-[rgba(217,217,217,0.4)]'
                  }`}
                ></div>
                <div
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    visibility ? 'translate-x-6' : ''
                  }`}
                ></div>
              </label>
            </div>
            <div className='h-[60vh] overflow-auto'>
              <ul>
                {teacher_subjects.map((subject) => (
                  <DraggableSubject
                    key={subject.subject_id}
                    id={subject.sgt_id}
                    name={subject.name}
                    chorarium={subject.chorarium}
                  />
                ))}
              </ul>
            </div>
          </div>
            <DragOverlay>
              {activeName ? <SubjectOverlay name={activeName}/> : <div></div>}
            </DragOverlay>
        </div>
      </DndContext>
    </div>
  )
}