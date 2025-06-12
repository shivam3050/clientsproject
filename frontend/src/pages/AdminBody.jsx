import { useRef,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminBodySignIn.css"

const AdminBody = ()=>{
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const errLog = useRef(null);
    const navigate = useNavigate();

    const autoLogin = async (navigate)=>{

        const loggedInUser = await fetch("http://localhost:8000/adminautologin",{
            method:"POST",
            credentials: "include"
        })
        if (loggedInUser.status !== 200){
            const error = await loggedInUser.text()
            console.log(error)
            console.log("some error occured in fetch")
            return;
        }
        const {username, fullname, _ } = await loggedInUser.json()
        console.log("everything is ok ",username)
        navigate("/admindashboard",{ state: { username: username,fullname:fullname } })
        
        return;
    }

    useEffect(()=>{
    //   autoLogin(navigate)
    },[])


    const handleLogin = async ()=>{
        console.log("clicked to username login fetch")

        const res = await fetch(`http://localhost:8000/usernamelogin`,
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                credentials: "include",
                body:JSON.stringify(
                    {
                        username:usernameRef.current.value,
                        password:passwordRef.current.value
                    }
                )
            }
        );
        if(res.status==200){
            // const {username,fullname, accessToken} = await res.json()
            errLog.current.textContent = "";
            window.location.href = "http://localhost:8000/testapi";
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
            <h3><span>or </span><a href="" style={{color:"green",borderBottom: "2px dotted green",cursor:"pointer"}}>register as admin</a></h3>
            <div className="credentialsInput">
                <button>Flag</button>
                <input type="text" name="username" ref={usernameRef}  placeholder="Enter username"/>
                <input type="text" name="password" ref={passwordRef}  placeholder="Enter password"/>
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