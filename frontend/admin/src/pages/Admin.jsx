import {Outlet} from "react-router-dom"

import "./Admin.css"
// setInterval(()=>{
//     window.confirm(`window.outerWidth = ${window.outerWidth} , window.innerwidth = ${window.innerWidth} \n window.outerHeight = ${window.outerHeight} window.innerHeight = ${window.innerHeight}`)
// },2000)


const Adminn = ()=>{
  
    return (
       <main className="admin-main">

        <header className="admin-main-header">
            <div className="admin-main-header-child">&nbsp;=</div>
            <div className="admin-main-header-child">S</div>
            <div className="admin-main-header-child">h</div>
            <div className="admin-main-header-child">i</div>
            <div className="admin-main-header-child">v</div>
            <div className="admin-main-header-child">a</div>
            <div className="admin-main-header-child">m</div>
        </header>
        <main className="admin-main-body">
            <Outlet/>
        </main>


       </main>
    )
}

export default Adminn;