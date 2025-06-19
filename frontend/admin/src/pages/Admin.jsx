import {Outlet} from "react-router-dom"

import "./Admin.css"


const Adminn = ()=>{
  
    return (
       <main className="admin-main">

        <header className="admin-main-header">
            <div className="admin-main-header-child">&nbsp;=</div>
            <div className="admin-main-header-child">C</div>
            <div className="admin-main-header-child">3</div>
            <div className="admin-main-header-child">4</div>
            <div className="admin-main-header-child">5</div>
        </header>
        <main className="admin-main-body">
            <Outlet/>
        </main>


       </main>
    )
}

export default Adminn;