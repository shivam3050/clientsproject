import { useRef, useEffect } from "react";
import "./AdminBodySignIn.css"
import { refreshAccessToken, refreshGoogleAccessToken } from "./AdminDashboard.jsx";
import { useNavigate } from "react-router-dom";

export class AutoLogin {
    #googleRetryCount = 0;
    async testGoogleAccessTokenIfNotThenUpdate() {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/test-google-access-token`, {
            method: "GET",
            credentials: "include",
            mode: "cors"
        })
        if (response.status === 401) {
            const error = await response.text()
            if (this.#googleRetryCount < 2) {
                this.#googleRetryCount += 1;
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    return false
                } else {
                    return await this.testGoogleAccessTokenIfNotThenUpdate()
                }
            }
            return false
        }
        if (!response.ok) {
            const error = await response.text()
            return false
        } else {
            const data = await response.json();
            if (data.success && data.redirectUrl) {
                window.location.href = data.redirectUrl;

                this.#googleRetryCount = 0
                return true
            }
            else {
                this.#googleRetryCount = 0
                return false
            }
        }
    }
    #normalRetryCount = 0;
    async testAccessTokenWithLoginAccess() {

        const loggedInUser = await fetch(`${import.meta.env.VITE_BACKEND_URL}/adminautologin`, {
            method: "POST",
            credentials: "include"
        })

        if (loggedInUser.status === 401) {
            const error = await loggedInUser.text()
            console.log(error)
            if (this.#normalRetryCount < 2) {
                this.#normalRetryCount += 1;

                const flag = await refreshAccessToken()
                if (!flag) {
                    return null;
                } else {
                    return await this.testAccessTokenWithLoginAccess()
                }
            }
            return null
        }

        if (loggedInUser.status !== 200) {

            const error = await loggedInUser.text()
            console.log(error)

            this.#normalRetryCount = 0
            return null;
        } else {
            const user = await loggedInUser.json()
            this.#normalRetryCount = 0
            return user;
        }

    }

}



const AdminBody = () => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const errLog = useRef(null);
    const navigate = useNavigate()




    const autoLoginHandler = async () => {
        const Admin = new AutoLogin()
        const user = await Admin.testAccessTokenWithLoginAccess()
        if (!user) {
            // await Admin.testGoogleAccessTokenIfNotThenUpdate()
            return
        } else {
            localStorage.setItem("loggedInUsername", user.username);
            localStorage.setItem("fullname", user.fullname);
            navigate("/admindashboard")
            return
        }

    }


    useEffect(() => {
        autoLoginHandler()
    }, [])


    const handleLogin = async () => {

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogin`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(
                    {
                        username: usernameRef.current.value,
                        password: passwordRef.current.value
                    }
                )
            }
        );
        if (res.status == 200) {
            const data = await res.json()
            localStorage.setItem("loggedInUsername", data.username);
            localStorage.setItem("fullname", data.fullname);
            navigate("/admindashboard")
            // const {username,fullname, accessToken} = await res.json()
            errLog.current.textContent = "";
            // window.location.href = `${import.meta.env.VITE_BACKEND_URL}/first-google-login-redirector`;

        } else {
            const error = await res.text()
            errLog.current.textContent = error;
            throw new Error(error)
        }
    }
    return (
        <div className="AdminBody">
            <h2>Login</h2>
            <h3><span>or </span></h3>
            <div className="credentialsInput">
                <button>
                    <svg width="30" height="20" viewBox="0 0 450 300" xmlns="http://www.w3.org/2000/svg">

                        <rect width="450" height="100" fill="#FF9933" />

                        <rect y="100" width="450" height="100" fill="white" />


                        <rect y="200" width="450" height="100" fill="#138808" />


                        <circle cx="225" cy="150" r="50" stroke="navy" stroke-width="2" fill="none" />

                    </svg>
                </button>
                <input type="text" name="username" ref={usernameRef} placeholder="Enter username" />
                <input type="text" name="password" ref={passwordRef} placeholder="Enter password" />
            </div>
            <div className="errLog" ref={errLog}></div>
            <div className="go">
                <button onClick={handleLogin}>Login</button>
                <button>Continue with Google</button>
            </div>

        </div>
    )
}

export default AdminBody;