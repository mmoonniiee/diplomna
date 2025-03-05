import {Link} from 'react-router';
import ScheduleEdit from './components/ScheduleEdit';
import SubjectEdit from './components/SubjectEdit';

export default function AdminHome({params}) {
    return (
        <div>
            <Link to={`/school/${params.schoolId}/admin/subjects/edit`}><SubjectEdit /></Link>
            <Link to={`/school/${params.schoolId}/schedule/edit`}><ScheduleEdit /></Link>
        </div>
    )
}