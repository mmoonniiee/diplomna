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
    <div>
      <TabGroup>
            <TabList>
              <Tab className="tab">Класове</Tab>
              <Tab className="tab">Учители</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
              <ul>
                {grades.map((grade) => (
                  <Link to={`/terms/${params.termKey}/grades/${grade.id}`}>
                    <li 
                    key={grade.id}
                    className="tab-panel">
                      <a>{grade.subgroup}</a>
                    </li>
                  </Link>  
                ))}
              </ul>
              </TabPanel>
              <TabPanel>
              <ul>
                {teachers.map((teacher) => (
                  <Link to={`/terms/${params.termKey}/teachers/${teacher.id}`}>
                    <li
                    key={teacher.id}
                    className="tab-panel">
                      <a>{teacher.name}</a>0
                    </li>
                  </Link>
                ))}
              </ul>
              </TabPanel>
            </TabPanels>
          </TabGroup> 
          <div>
            <Outlet />
          </div>
    </div>
  )
}