import axios from 'axios'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { Link, Outlet } from 'react-router';

export async function clientLoader({ params }) {
  const {data: grades} = await axios.get(`http://localhost:5000/school/${params.schoolId}/grades`);
  const {data: teachers} = await axios.get(`http://localhost:5000/school/${params.schoolId}/teachers`);

  return {grades, teachers};
}  

export default function SchheduleSidebar({ loaderData, params }) {
  const {grades, teachers} = loaderData;

  return (
    <div className='grid grid-cols-2 grid-cols-[20%_80%] h-full w-full'>
      <div>
        <TabGroup >
              <TabList class="bg-[rgba(120,172,202,1)] rounded-full mt-[30vh] max-w-[50vw]">
                <Tab className='active: bg-[rgba(238, 108,77,1)] active:rounded-full'>Класове</Tab>
                <Tab className="active: bg-[rgba(238, 108,77,1)] active:rounded-full">Учители</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                <ul>
                  {grades.map((grade) => (
                    <Link to={`/school/${params.schoolId}/admin/term/${params.term}/grade/${grade.id}`}>
                      <li 
                      key={grade.id}
                      className="bg-[rgba(217,217,217,0.4)] w-full rounded-full my-4 text-white">
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
                      className="bg-[rgba(217,217,217,0.4)] w-full rounded-full my-4 text-white">
                        <a className='pl-4'>{teacher.name}</a>0
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