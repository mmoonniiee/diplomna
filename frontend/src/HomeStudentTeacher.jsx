import {Link} from 'react-router';
import ScheduleButton from './components/ScheduleButton';

export default function HomeST({ params }) {
    return (
        <div class="flex justify-center items-center h-full w-full">
            <Link to={`/school/${params.schoolId}/schedule`}><ScheduleButton /></Link>
        </div>
    )
}