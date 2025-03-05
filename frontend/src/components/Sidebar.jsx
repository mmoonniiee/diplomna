import axios from "axios";
import { Link, Outlet } from 'react-router';

export async function clientLoader({ params }) {
  const subjects = await axios.get(`http://localhost:5000/school/${params.schoolId}/subject`);
  console.log("subjects", subjects);
  return subjects;
}

export default function SidebarSubject({ loaderData, params }) {
  console.log("loader data", loaderData);
  const subjects = loaderData.data;

  return (
    <div>
      <div>
        <Link to="/school/1/admin/subjects/add"> <button>Добавяне на предмет</button></Link>
        <ul>
          {subjects.map(subject => 
            <li><Link to={`/school/${params.schoolId}/admin/subjects/${subject.id}/edit`}>{subject.name}</Link></li>)}
        </ul>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}