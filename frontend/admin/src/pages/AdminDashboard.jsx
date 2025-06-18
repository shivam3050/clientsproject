
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import "./AdminDashboard.css"
import { refreshAccessToken } from "../controller/LoginController";








const AdminDashboard = () => {
    const navigate = useNavigate()

const handleLogout = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogout`,
        {
            method: "POST",
            credentials: "include"
        }
    )
    if (response.status === 401) {
        refreshAccessToken()
            .then((flag) => {
                if (!flag) { 
                    // navigate("/")
                    console.log("cannot logout access toke expired login again and then logout")
                    return
                 }
                else {
                    fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogout`,
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    ).then(() => {
                        localStorage.removeItem("loggedInUsername");
                        localStorage.removeItem("fullname");
                        console.log("logout successfullyy")
                        navigate("/");
                        return
                    })
                }
            })


    }
    if (response.status != 200) {
        const responseText = await response.text()
        console.log(responseText)
        return;
    } else {
        const msg = await response.text()
        console.log(msg,"logout successfully in one go")
        navigate("/")

        return;
    }

}



    return (
        <main className="admin-dashboard-main">
            <h1 className="admin-dashboard-titlebar">
                Admin DashBoard <button onClick={handleLogout}>Logout</button>
            </h1>
            <Outlet />
        </main>
    )

};




export default AdminDashboard;