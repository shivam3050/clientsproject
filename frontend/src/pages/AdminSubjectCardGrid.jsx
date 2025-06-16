import { AdminSubjectCard } from "./AdminSubjectCard";
import "./AdminSubjectCardGrid.css"

export const AdminSubjectCardGrid = () => {
   


    return (
        <div className='admin-subjectsdivgrid'>
            <ul >
                <li  ><AdminSubjectCard  virtualParent="Maths" /></li>
                <li  ><AdminSubjectCard  virtualParent="GK" /></li>
                <li  ><AdminSubjectCard  virtualParent="Current Affairs" /></li>
                <li  ><AdminSubjectCard  virtualParent="English" /></li>
                <li  ><AdminSubjectCard  virtualParent="Hindi" /></li>
                <li  ><AdminSubjectCard  virtualParent="Maths" /></li>
                <li  ><AdminSubjectCard  virtualParent="GK" /></li>
                <li  ><AdminSubjectCard  virtualParent="Current Affairs" /></li>
                <li  ><AdminSubjectCard  virtualParent="English" /></li>
                <li  ><AdminSubjectCard  virtualParent="Hindi" /></li>
                <li  ><AdminSubjectCard  virtualParent="Maths" /></li>
                <li  ><AdminSubjectCard  virtualParent="GK" /></li>
                <li  ><AdminSubjectCard  virtualParent="Current Affairs" /></li>
                <li  ><AdminSubjectCard  virtualParent="English" /></li>
                <li  ><AdminSubjectCard  virtualParent="Hindi" /></li>
            </ul>
        </div>
    );
};
