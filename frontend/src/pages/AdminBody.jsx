import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBodySignIn.css"
import { refreshAccessToken, refreshGoogleAccessToken } from "./AdminDashboard.jsx";

class AutoLogin {
    #googleRetryCount = 0;
    async testGoogleAccessTokenWithGoogleDriveAccess () {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/test-google-access-token`, {
            method: "GET",
            credentials: "include",
            mode: "cors"
        })
        if (response.status === 401) {
            const error = await response.text()
            alert(error + " this will be improved")
            if (this.#googleRetryCount < 2) {
                this.#googleRetryCount += 1;
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    alert("your google refresh token is also expired")
                    return false
                } else {
                    return await this.testGoogleAccessTokenWithGoogleDriveAccess()
                }
            }
            return false
        }
        if (!response.ok) {
            const error = await response.text()
            alert(error)
            return false
        } else {
            const data = await response.json();
            if (data.success && data.redirectUrl) {
                alert("yes google access token is well now redirecting to dashboard")
                window.location.href = data.redirectUrl;  // ✅ Perform browser redirect

                this.#googleRetryCount =0
                return true
            }
            else {
                this.#googleRetryCount=0
                return false
            }
        }
    }
    #normalRetryCount = 0;
    async testAccessTokenWithLoginAccess () {
        alert("auto login front trigger hua hai with retry counnt:  " + this.#normalRetryCount)
    
        const loggedInUser = await fetch(`${import.meta.env.VITE_BACKEND_URL}/adminautologin`, {
            method: "POST",
            credentials: "include"
        })
    
        if (loggedInUser.status === 401) {
            const error = await loggedInUser.text()
            alert(loggedInUser.status)
            if (this.#normalRetryCount < 2) {
                this.#normalRetryCount += 1;
    
                const flag = await refreshAccessToken()
                if (!flag) {
                    alert("refresh token has been expired you need to manually login")
                    return;
                } else {
                    alert("get new access token sucess now calling auto login again")
                    return await this.testAccessTokenWithLoginAccess()
                }
            } 
            return false
        }
    
        if (loggedInUser.status !== 200) {
    
            const error = await loggedInUser.text()
    
            alert(error)
            this.#normalRetryCount = 0
            return false;
        } else {
            this.#normalRetryCount = 0
            return true;
        }
        
    }

}



const AdminBody = () => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const errLog = useRef(null);




    const autoLoginHandler = async () => {
        const Admin = new AutoLogin()

        if(await Admin.testAccessTokenWithLoginAccess()){
            await Admin.testGoogleAccessTokenWithGoogleDriveAccess()
        } else {
            return
        }


    }

    useEffect(() => {
        alert("useeffect auto login wala call hua")
        autoLoginHandler()
    }, [])


    const handleLogin = async () => {
        alert("clicked to username login fetch")

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
            // const {username,fullname, accessToken} = await res.json()
            errLog.current.textContent = "";
            window.location.href = `${import.meta.env.VITE_BACKEND_URL}/first-google-login-redirector`;
            // localStorage.setItem('accessToken', accessToken);
            // navigate("/admindashboard",{ state: { username: username,fullname:fullname } })
        } else {
            const error = await res.text()
            // errLog.current.textContent = error;
            throw new Error(error)
        }
    }
    return (
        <div className="AdminBody">
            <h2>Login</h2>
            <h3><span>or </span><a href="" style={{ color: "green", borderBottom: "2px dotted green", cursor: "pointer" }}>register as admin</a></h3>
            <div className="credentialsInput">
                <button>Flag</button>
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