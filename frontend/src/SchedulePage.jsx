import React from 'react';
import axios from 'axios';

export async function clientLoader() {
    const {data : schedule } = axios.get("http://localhost:5000/schedule", {withCredentials: true});
    return schedule;
}

export default function SchedulePage({ loaderData }) {
    const loaded_schedule = loaderData;
    const schedule = Array.from({length: 40}, (_, i) => loaded_schedule || null);

    return (
        <div>
            <div className='grid grid-cols-10 grid-rows-8 bg-[rgba(217,217,217,0.4)] border-red'>
                <div className='bg-red-500'>
                    {schedule.map((cls, index) => 
                        <div key={index} className='bg-red-500 w-[50px] h-[50px]'>
                        {cls ? <p>{cls.subject_name}</p> : null}
                </div>)}
                </div>
            </div>
        </div>
    )
}