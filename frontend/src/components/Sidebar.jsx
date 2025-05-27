import axios from "axios";
import { Link, Outlet } from 'react-router';

export async function clientLoader({ params }) {
  const subjects = await axios.get(`http://localhost:5000/school/${params.schoolId}/subject`);
  return subjects;
}

export default function SidebarSubject({ loaderData, params }) {
  const subjects = loaderData.data;

  return (
    <div className="grid grid-cols-[30%_70%] h-full w-full justify-center items-center">
      <div className="max-h-[70vh] overflow-auto flex flex-col items-center">
        <Link to={`/school/${params.schoolId}/admin/subjects/add`}> 
          <button className="bg-[rgba(238,108,77,1)] text-white p-2 rounded-lg mb-4 justify-center">Добавяне на предмет</button>
        </Link>
        <ul>
          {subjects.map(subject => 
            <li className="rounded-xl text-white hover:text-white p-4 mb-4 bg-[rgba(217,217,217,0.4)]">
              <Link to={`/school/${params.schoolId}/admin/subjects/${subject.id}/edit`}>{subject.name}</Link>
            </li>)}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}