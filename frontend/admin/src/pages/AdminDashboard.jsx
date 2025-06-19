
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"
import "./AdminDashboard.css"
import { CreateGoogleCloudbase, refreshAccessToken } from "../controller/LoginController";








export const handleBackToDashboardComeBack = () => {
    const backbtn = document.getElementById("backbutton")
    backbtn.style.display = "block"
}

const AdminDashboard = () => {
    const navigate = useNavigate()
    const [googlecloudbaseid, setGooglecloudbaseid] = useState(null)
    const username = localStorage.getItem("loggedInUsername")
    const handleBackToDashboardHide = () => {
        const backbtn = document.getElementById("backbutton")
        backbtn.style.display = "none"
        navigate("/admindashboard/")
    }
    
    useEffect(() => {
        const cloudbaseUseeffectController = async () => {
           
  
            if (googlecloudbaseid) {

                return
            }
            const Google = new CreateGoogleCloudbase(username)
            setGooglecloudbaseid(await Google.create())
            const recievedid = await Google.create()
            if (!recievedid) {
                return
            }
            localStorage.setItem("googleCloudbaseId", recievedid)
        }
        cloudbaseUseeffectController()
    }, [])

    const connectGoogleDrive = async () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/first-google-login-redirector`
    }
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
            console.log(msg, "logout successfully in one go")
            navigate("/")

            return;
        }

    }



    return (
        <main className="admin-dashboard-main">
            <div className="title">
                <h1 className="admin-dashboard-titlebar">
                    Admin DashBoard
                </h1>
                <div>
                    <div>
                        {(googlecloudbaseid) ? (<span style={{ color: "blue" }}>Connected to drive!!</span>) : (<button onClick={connectGoogleDrive} style={{ color: "white", backgroundColor: "red" }}>connect drive</button>)}

                    </div>
                    <button id="backbutton" onClick={() => { handleBackToDashboardHide() }}>🔙</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>
            <Outlet />
        </main>
    )

};




export default AdminDashboard;