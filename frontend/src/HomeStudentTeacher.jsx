import {Link} from 'react-router';
import ScheduleButton from './components/ScheduleButton';

export default function HomeST() {
    return (
        <div>
            <Link to="/schedule"><ScheduleButton /></Link>
        </div>
    )
}