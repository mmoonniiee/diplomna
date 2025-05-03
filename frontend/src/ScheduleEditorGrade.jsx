import React from 'react';
import axios from 'axios';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

export async function clientLoader({ params }) {
  console.log(params);

  const {data: grade_subjects} = await axios.get(`http://localhost:5000/subject/grade/${params.gradeId}`);
  const {data: grade_schedule} = await axios.get(`http://localhost:5000/schedule/grade/${params.gradeId}/term/${params.term}`);

  return {grade_subjects, grade_schedule};
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

const dayFromId = (id) => {
  switch(id) {
      case 0: return "Понеделник";
      case 1: return "Вторник";
      case 2: return "Сряда";
      case 3: return "Четвъртък";
      case 4: return "Петък";
      default: return "";
  }
}

function Drag({  }) {
  
}

function DropZones({ block_id }) {
  const first_id = (block_id + 1) * 2 - 1;
  const second_id = (block_id + 1) * 2;

  const zones = [
    { id: `week-odd-class-block-${block_id}`, style: { top: 0, left: 0, width: '33.33%', height: '100%' } }, //нечетна седмица блок
    { id: `week-both-class-first-${first_id}`, style: { top: 0, left: '33.33%', width: '33.33%', height: '33.33%' } }, //нормална седмица първи час
    { id: `week-both-class-block-${block_id}`, style: { top: '33.33%', left: '33.33%', width: '33.33%', height: '33.33%' } }, //нормална седмица блок
    { id: `week-both-class-second-${second_id}`, style: { top: '66.66%', left: '33.33%', width: '33.33%', height: '33.33%' } }, //нормална седмица втори час
    { id: `week-even-class-block-${block_id}`, style: { top: 0, left: '66.66%', width: '33.33%', height: '100%' } }, //четна седмица блок
  ];

  return (
    <>
      {zones.map(zone => (
        <div
          key={zone.id}
          ref={useDroppable({ id: zone.id }).setNodeRef}
          style={{
            ...zone.style,
            position: 'absolute',
            border: 'red',
            opacity: 0,
          }}
        />
      ))}
    </>
  );
}

function handleDragEnd(event) {
  const { active, over } = event;

  console.log(`${active.id} dropped in ${over.id}`);
}

export default function ScheduleEdit({ loaderData }) {

  const { grade_subjects, grade_schedule } = loaderData;

  return (
    <div>
        <div className='grid grid-cols-2 p-2 grid-cols-[75%_25%] gap-6 h-full mr-8'>
        <div className='flex justify-center items-center h-screen'>
          <div className='p-4 grid grid-cols-5 gap-4 bg-[rgba(253,253,253,0.2)] max-w-[70vw] max-h-[85vh] rounded-xl'>
              {Array.from({length: 5}, (_, day) => {
                  return (
                    <div className='grid grid-rows-2 gap-2 grid-rows-[7%_93%]'>
                      <div>
                          <p className='text-white text-center'>{dayFromId(day)}</p>
                      </div>
                      <div className='grid grid-rows-4 gap-4 h-full'>
                          {Array.from({length: 4}, (_, block) => {
                              return (
                                <div className='grid grid-rows-2 gap-2 bg-[rgba(253,253,253,0.2)] max-h-[15vh] rounded-2xl p-2'>
                                    <DropZones block_id={block} />
                                    {Array.from({length: 2}, (_, cls) => {
                                        const index = block * 2 + (cls % 2);
                                        return (
                                          <div key={ index } className='text-white'>
                                              {(() => {
                                                const classes = grade_schedule.filter(obj => 
                                                  obj.class_number === (index + 1) && idFromDay(obj.weekday_taught) === day);
                                                
                                                return classes.length > 1 ? 
                                                <div>
                                                  {(() => {
                                                    const odd = classes.find(obj => obj.week_taught === 'odd');
                                                    const even = classes.find(obj => obj.week_taught === 'even');
                                                    
                                                    return (
                                                      <div className='flex justify-center items-center grid grid-cols-2 gap-2 px'>
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
          <div className='mt-[15vh] h-[70vh] overflow-auto'>
            <ul>
              {grade_subjects.map((subject) => (
                <li
                key={subject.id}
                className="bg-[rgba(217,217,217,0.4)] rounded-xl text-white p-4 mb-4"
                draggable={true}>
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