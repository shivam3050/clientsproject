

import { Outlet, useNavigate, useParams } from "react-router-dom";

import "./StudentSubjectDetail.css";



export const StudentSubjectDetail = () => {
  const navigate = useNavigate()
  const dynamicRoutes  = useParams(); // cons that this can only give dynamic available routes

  const virtualParent = dynamicRoutes.subject




  return (
    <div className="student-subjectsdiv-detail">
      <h2>{virtualParent} Files Dashboard</h2>



      <div className="file-list-section">
        <Outlet />
      </div>
    </div>
  );
};
