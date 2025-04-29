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

export default function SchedulePage({ loaderData }) {
    const schedule = loaderData;

    return (
        <div className='flex justify-center items-center h-screen w-screen'>
            <div className='p-4 grid grid-cols-5 grid-rows-8 gap-4 bg-[rgba(217,217,217,0.4)] max-w-[70vw] max-h-[85vh] rounded-xl'>
                {Array.from({length : 40}, (_, i) => {
                    const cls = schedule.filter(obj => 
                        (obj.class_number - 1) * 5 + idFromDay(obj.weekday_taught) === i);
                    
                    return (
                        <div className='bg-[rgba(217,217,217,0.4)] max-w-[20vw] aspect-[3/1] rounded-full flex items-center overflow-hidden'>
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
    )
}