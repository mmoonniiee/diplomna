import axios from 'axios'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Link, Outlet } from 'react-router';
import { useState } from 'react';

export async function clientLoader({ params }) {
  const {data: grades} = await axios.get(`http://localhost:5000/school/${params.schoolId}/grades`);
  const {data: teachers} = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);
  
  return {grades, teachers};
}

export default function SchheduleSidebar({ loaderData, params }) {
  const {grades, teachers} = loaderData;

  return (
    <div className='grid grid-cols-[20%_80%] h-full w-full'>
      <div className='flex justify-center items-center'>
        <TabGroup className='fixed top-[30vh] w-[18vw] flex-col'>
              <TabList class="bg-[rgba(120,172,202,1)] rounded-full space-x-2 flex justify-center text-white w-full">
                <Tab className="p-2">Класове</Tab>
                <Tab className="p-2">Учители</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                <ul>
                  {grades.map((grade) => (
                    <Link to={`/school/${params.schoolId}/admin/term/${params.term}/grade/${grade.id}`}>
                      <li 
                      key={grade.id}
                      className="bg-[rgba(217,217,217,0.4)] w-full rounded-full my-4 text-white p-2">
                        <a className='pl-4'>{grade.subgroup}</a>
                      </li>
                    </Link>  
                  ))}
                </ul>
                </TabPanel>
                <TabPanel>
                <ul>
                  {teachers.map((teacher) => (
                    <Link to={`/school/${params.schoolId}/admin/term/${params.term}/teacher/${teacher.id}`}>
                      <li
                      key={teacher.id}
                      className="bg-[rgba(217,217,217,0.4)] w-full rounded-full my-4 text-white p-2">
                        <a className='pl-4'>{teacher.name}</a>
                      </li>
                    </Link>
                  ))}
                </ul>
                </TabPanel>
              </TabPanels>
            </TabGroup> 
          </div>
          <div>
            <Outlet />
          </div>
    </div>
  )
}