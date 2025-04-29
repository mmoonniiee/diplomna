import {Link} from 'react-router';
import ScheduleEdit from './components/ScheduleEdit';
import SubjectEdit from './components/SubjectEdit';

export default function AdminHome({params}) {
    return (
        <div class="flex justify-center items-center h-screen w-screen">
            <div class="flex gap-5">
                <Link to={`/school/${params.schoolId}/admin/subjects/edit`}><SubjectEdit /></Link>
                <Link to={`/school/${params.schoolId}/admin/term/second`}><ScheduleEdit /></Link>
            </div>
        </div>
    )
}