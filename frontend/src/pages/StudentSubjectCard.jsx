import "./StudentSubjectCard.css"
import { useNavigate } from "react-router-dom"

const StudentSubjectCard = (props) => {
    

    const navigate = useNavigate()
    const handleClick = () => {
     
        navigate(`/student/${props.virtualParent}?virtualParent=${encodeURIComponent(props.virtualParent)}`);
    };

    return <div className="student-subject-card" onClick={handleClick}>
        <div className="student-subject-card-header">

            <h3>{props.virtualParent}</h3>

        </div>
        <div className="student-subject-card-body">
        </div>
    </div>
}
export { StudentSubjectCard }