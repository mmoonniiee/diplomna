import SubjectEdit from './components/SubjectEdit.jsx';
import ScheduleEdit from './components/ScheduleEdit.jsx'
import Schedule from "./schedule";

export default function HomeAT({params}) {
    return (
        <div>
            <Link to={`/school/${params.schoolId}/admin/subjects/edit`}><SubjectEdit /></Link>
            <Link to={`/school/${params.schoolId}/schedule/edit`}><ScheduleEdit /></Link>
            <Link to="/schedule"><ScheduleButton /></Link>
        </div>
    )
}