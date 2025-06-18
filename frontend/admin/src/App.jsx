

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css'
import Adminn from './pages/Admin';
import AdminDashboard from "./pages/AdminDashboard";
import { AdminSignin } from "./pages/AdminSignin";
import { AdminDashboardSubjectContainer } from "./pages/AdminDashboardSubjectContainer";
import { AdminSubjectDetail } from "./pages/AdminSubjectDetail";









function App() {
  return (
    <Router>
      <Routes>
       
        <Route path="/" element={(<Adminn />)} >
          <Route index element={<AdminSignin />} />
          <Route path="/admindashboard" element={<AdminDashboard />} >
            <Route index element={<AdminDashboardSubjectContainer />} />
            <Route path=":subject" element={<AdminSubjectDetail/>}/>
          </Route>
        </Route>
        
      </Routes>
    </Router >
  )

}

export default App