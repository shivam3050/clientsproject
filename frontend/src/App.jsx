// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import StudentPage from './pages/StudentPage'
// import AdminPage from './pages/AdminPage'


// let isMenuAsideOn = false;

// function MenuLoaderButton (){  

//   const elements = document.querySelectorAll('.homepageaside');
//   elements.forEach(el => {

//     if(isMenuAsideOn){
//       // el.style.display = 'none';
//       el.children[0].style.left = '-100%';
//       isMenuAsideOn = false;
//       el.children[1].style.opacity = 0;
//     } else {
//       // el.style.display = 'flex';
//       el.children[0].style.flexDirection = 'row';
//       el.children[0].style.left = '0px';
//       el.children[0].style.top = '0px';
//       el.children[0].style.width = '100%';
//       el.children[1].style.opacity = 0.4;
//       isMenuAsideOn = true;
//     }
//     });

// }


// function App() {
//   const [isAdmin,setIsAdmin] = useState(false);

//   if(isAdmin) {
//     return (
//     <div className='homepage'>
//       <header className="header">
//         <button onClick={MenuLoaderButton}>MENU</button>

//       </header>
//       <aside className='homepageaside'>
//         <section className='aside-pure'>
//           <header>
//             <button onClick={MenuLoaderButton}>MENU</button>
//           </header>
//           <main>
//           <ul>
//             <li onClick={()=>{setIsAdmin(true);MenuLoaderButton()}}>Admin</li>
//             <li onClick={()=>{setIsAdmin(false);MenuLoaderButton()}}>Student</li>
//             <li>About</li>
//           </ul>
//           </main>
//         </section>
//         <section onClick={()=>{MenuLoaderButton()}} className='aside-overlay'>
//         aside overlay
//         </section>
//       </aside>
//       <main className="body">
//       <AdminPage/>
//       </main>
//       <footer className="footer">
//       footer
//       </footer>
//     </div>
//     )
//   } 
//   else {

//     return (
//       <div className='homepage'>
//       <header className="header">
//       <button onClick={MenuLoaderButton}>MENU</button>

//       </header>
//       <aside className='homepageaside'>
//         <section className='aside-pure'>
//           <header>
//             <button onClick={MenuLoaderButton}>MENU</button>
//           </header>
//           <main>
//           <ul>
//             <li onClick={()=>{setIsAdmin(true);MenuLoaderButton()}}>Admin</li>
//             <li onClick={()=>{setIsAdmin(false);MenuLoaderButton()}}>Student</li>
//             <li>About</li>
//           </ul>
//           </main>
//         </section>
//         <section onClick={()=>{MenuLoaderButton()}} className='aside-overlay'>
//         aside overlay
//         </section>
//       </aside>
//       <main className="body">
//       <StudentPage/>
//       </main>
//       <footer className="footer">
//       footer
//       </footer>
//     </div>
//     )
//   }
// }

// export default App





// // Step 1 Redirect to URL ,manually
// // `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`


// // Step 2 Google will fall back to /providedPathOnGoogleClients
// // and will respond a code which tells that you are successfully signed in

// // Step 3 Now fetch at this by giving that code to get access token
// // "https://oauth2.googleapis.com/token",{})

// // Step 4 Using access token you can now access drive and do anything you want
// // `https://www.googleapis.com/drive/v3/files`
































import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Adminn from './pages/Admin';
import Studentt from './pages/Student';
import AdminDashboard from "./pages/AdminDashboard";
import { AdminSubjectDetail } from "./pages/AdminSubjectDetail";
import { AdminSubjectCardGrid } from "./pages/AdminSubjectCardGrid";
import { StudentSubjectDetail } from "./pages/StudentSubjectDetail";
import { StudentSubjectBranchDetail } from "./pages/StudentSubjectBranchDetail";
import { StudentSubjectDetailBranchList } from "./pages/StudentSubjectDetailBranchList";
// import { StudentSubjectCardGrid } from "./pages/StudentSubjectCardGrid";
// import StudentPage from './pages/StudentPage'
// import AdminPage from './pages/AdminPage'







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