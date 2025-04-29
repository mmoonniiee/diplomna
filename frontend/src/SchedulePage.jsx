import React from 'react';
import axios from 'axios';

export async function clientLoader() {
    const { data: schedule } = await axios.get("http://localhost:5000/schedule", {withCredentials: true});
    console.log("loaded schedule", schedule);
    return schedule;
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

export default function SchedulePage({ loaderData }) {
    const schedule = loaderData;

    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <div className='p-4 grid grid-cols-5 gap-4 bg-[rgba(253,253,253,0.2)] max-w-[70vw] max-h-[85vh] rounded-xl'>
                {Array.from({length: 5}, (_, day) => {
                    return (
                        <div className='grid grid-rows-2 gap-2 grid-rows-[7%_93%]'>
                            <div>
                                <p className='text-white text-center'>{dayFromId(day)}</p>
                            </div>
                            <div className='grid grid-rows-4 gap-4'>
                                {Array.from({length: 4}, (_, block) => {
                                    return (
                                        <div className='grid grid-rows-2 gap-2 bg-[rgba(253,253,253,0.2)] rounded-lg p-2'>
                                            {Array.from({length: 2}, (_, cls) => {
                                                const index = block * 2 + (cls % 2);
                                                return (
                                                    <div key={ index } className='rounded text-white'>
                                                        {(() => {
                                                            const classes = schedule.filter(obj => 
                                                                obj.class_number === (index + 1) && idFromDay(obj.weekday_taught) === day);
                                                            
                                                            return classes.length > 1 ? 
                                                            <div>
                                                                {(() => {
                                                                    const odd = classes.find(obj => obj.week_taught === 'odd');
                                                                    const even = classes.find(obj => obj.week_taught === 'even');
                                                                    
                                                                    return (
                                                                        <div className='flex justify-center items-center grid grid-cols-2 gap-2'>
                                                                            <div className='bg-[rgba(253,253,253,0.2)] h-full w-full  rounded'>
                                                                                <p className='overflow-hidden text-[10px]'>{odd.subject_name}</p>
                                                                            </div>
                                                                            <div className='bg-[rgba(253,253,253,0.2)] h-full w-full  rounded'>
                                                                                <p className='overflow-hidden text-[10px]'>{even.subject_name}</p>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </div> : 
                                                            classes.length === 1 ? (() => {
                                                                return classes[0].week_taught === 'odd' ? 
                                                                <div className='grid grid-cols-2'>
                                                                    <div className='bg-[rgba(253,253,253,0.2)] h-full w-full rounded'>
                                                                        <p className='overflow-hidden text-[12px]'>{classes[0]?.subject_name}</p>
                                                                    </div>
                                                                    <div></div>
                                                                </div> : 
                                                                classes[0].week_taught === 'even' ? 
                                                                <div className='grid grid-cols-2'>
                                                                    <div></div>
                                                                    <div className='bg-[rgba(253,253,253,0.2)] h-full w-full  rounded'>
                                                                        <p className='overflow-hidden text-[12px]'>{classes[0]?.subject_name}</p>
                                                                    </div>
                                                                </div> :
                                                                <div className='bg-[rgba(253,253,253,0.2)] h-full w-full rounded'>
                                                                    <p className='pl-1 overflow-hidden text-[12px]'>{classes[0]?.subject_name}</p>
                                                                </div> 
                                                            })() :
                                                            <div className='bg-[rgba(253,253,253,0.2)] h-full w-full rounded'>
                                                            </div>
                                                        })()}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}