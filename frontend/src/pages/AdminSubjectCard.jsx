import "./AdminSubjectCard.css"
import { useNavigate } from "react-router-dom"

const AdminSubjectCard = (props) => {
    // const [googlecloudbaseid, username] = useOutletContext();
    const navigate = useNavigate()
    const handleClick = () => {
        navigate(`/admindashboard/${props.virtualParent}`);
    };

    return <div className="admin-subject-card" onClick={handleClick}>
        <div className="admin-subject-card-header">

            <h3>{props.virtualParent}</h3>

        </div>
        <div className="admin-subject-card-body">
        </div>
    </div>
}
export { AdminSubjectCard }