




import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Adminn from './pages/Admin';
import Studentt from './pages/Student';
import AdminDashboard from "./pages/AdminDashboard";
import { AdminSubjectDetail } from "./pages/AdminSubjectDetail";
import { AdminSubjectCardGrid } from "./pages/AdminSubjectCardGrid";
import { StudentSubjectDetail } from "./pages/StudentSubjectDetail";
import { StudentSubjectBranchDetail } from "./pages/StudentSubjectBranchDetail";
import { StudentSubjectDetailBranchList } from "./pages/StudentSubjectDetailBranchList";








function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={(<Studentt />)} >
          <Route index element={<div></div>} />
          <Route path=":subject" element={<StudentSubjectDetail />} />
        </Route>


        <Route path="/admin" element={(<Adminn />)} />

        <Route path="/admindashboard" element={<AdminDashboard />}>
          <Route index element={<AdminSubjectCardGrid />} />
          <Route path=":subject" element={<AdminSubjectDetail />} />
        </Route>


        <Route path="/student" element={(<Studentt />)} >
          <Route index element={<div ></div>} />
          <Route path=":subject" element={<StudentSubjectDetail />} >  {/*   /student/:x iska matlab hota hai ki ye route ye /student/:x  yha per { x:<providing route> } this can be nested also */}
            <Route index element={<StudentSubjectDetailBranchList />} />  {/*   /student/:x iska matlab hota hai ki ye route ye /student/:x  yha per { x:<providing route> } this can be nested also */}
            <Route path=":branch" element={<StudentSubjectBranchDetail/>}/>
          </Route>
        </Route>
      </Routes>
    </Router >
  )

}

export default App