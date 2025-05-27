import {Link} from 'react-router';
import SubjectEdit from './components/SubjectEdit.jsx';
import ScheduleEdit from './components/ScheduleEdit.jsx'
import GradesAdd from './components/GradesAdd.jsx';
import ScheduleButton from './components/ScheduleButton.jsx';

export default function HomeAT({params}) {
  return (
    <div class="flex justify-center items-center h-full w-full space-x-6">
      <Link to={`/school/${params.schoolId}/admin/grades/add`}><GradesAdd /></Link>
      <Link to={`/school/${params.schoolId}/admin/subjects/add`}><SubjectEdit /></Link>
      <Link to={`/school/${params.schoolId}/admin/term/second`}><ScheduleEdit /></Link>
      <Link to={`/school/${params.schoolId}/schedule`}><ScheduleButton /></Link>
    </div>
  )
}