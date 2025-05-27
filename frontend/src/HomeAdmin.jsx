import {Link} from 'react-router';
import ScheduleEdit from './components/ScheduleEdit';
import SubjectEdit from './components/SubjectEdit';
import GradesAdd from './components/GradesAdd';

export default function AdminHome({params}) {
  return (
    <div className="flex justify-center items-center h-full w-full">
      <div className="flex gap-5">
        <Link to={`/school/${params.schoolId}/admin/grades/add`}><GradesAdd /></Link>
        <Link to={`/school/${params.schoolId}/admin/subjects/add`}><SubjectEdit /></Link>
        <Link to={`/school/${params.schoolId}/admin/term/second`}><ScheduleEdit /></Link>
      </div>
    </div>
  )
}