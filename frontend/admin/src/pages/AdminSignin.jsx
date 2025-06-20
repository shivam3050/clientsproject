import { useEffect, useRef } from "react"
import { useFetcher, useNavigate } from "react-router-dom"
import { AutoLogin } from "../controller/LoginController"

export const AdminSignin = () => {
    const errLog = useRef()
    const handleManualLogin = async (e) => {
        e.preventDefault()
        console.log("initailising manual login")
        errLog.current.textContent = "Loading..."
        const form = e.target.parentElement
        const username = form.querySelector("input[name='username']").value
        const password = form.querySelector("input[name='password']").value
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(
                    {
                        username: username,
                        password: password
                    }
                )
            }
        );
        if (res.status == 200) {
            console.log("you are logged iins successfully")
            const data = await res.json()
            localStorage.setItem("loggedInUsername", data.username);
            localStorage.setItem("fullname", data.fullname);
            navigate("/admindashboard")
            // const {username,fullname, accessToken} = await res.json()
            errLog.current.textContent = "";
            // window.location.href = `${import.meta.env.VITE_BACKEND_URL}/first-google-login-redirector`;

        } else {
            const error = await res.text()
            console.log(error)
            errLog.current.textContent = error;
            throw new Error(error)
        }
    }
    const autoLoginHandler = async () => {
        const Admin = new AutoLogin()
        const user = await Admin.testAccessTokenWithLoginAccess()

    
        if (!user) {

            console.log("some error occured auto login handler")
            return
        } else {
   
            localStorage.setItem("loggedInUsername", user.username);
            localStorage.setItem("fullname", user.fullname);
            navigate("/admindashboard")
            return
        }

    }
    const navigate = useNavigate()

    useEffect(() => {
        const autoLoginController = async () => {
            const result = await autoLoginHandler()
            if(!result){
               
                return
            }
            
        }
        autoLoginController()
    },[])
    return (
        <section className="signin-box">
            <label htmlFor="">Admin Login</label>
            <form action="" className="inputs" onSubmit={(e)=>{handleManualLogin(e)}}>
                <input required type="text" name="username" placeholder="Enter username" />
                <input required type="password" name="password" placeholder="Enter password" />
                <label style={{fontSize:"10px"}} ref={errLog}></label>
                <input type="submit" value="Submit" />
            </form>
        </section>
    )
}