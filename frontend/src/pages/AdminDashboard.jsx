import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import "./AdminDashboard.css"
import { useState, useRef } from 'react';
import { AdminSubjectCard } from './AdminSubjectCard';
import { Routes, Route } from "react-router-dom"
import { AdminSubjectDetail } from './AdminSubjectDetail';


let isMenuAsideOn = false;

function AdminMenuLoaderButton() {

    const elementAside = document.querySelector('.admin-dashboard-aside');
    const elementBody = document.querySelector('.admin-dashboard-body');
    const btn = document.getElementById('menuBtnAtBody');


    if (isMenuAsideOn) {
        elementAside.style.left = '-15%';
        isMenuAsideOn = false;
        elementBody.style.left = '0px';
        elementBody.style.width = '100%';
        btn.style.display = "block"
    } else {
        elementAside.style.left = '0px';
        elementAside.style.top = '0px';
        //   elementAside.style.zIndex = 2;
        //   elementBody.style.opacity = 0.4;
        elementBody.style.left = '15%';
        elementBody.style.width = '85%';

        isMenuAsideOn = true;
        btn.style.display = "none"
    }

}

const subjectsAndDetailsLoader = async () => {
    return;
}

export const refreshGoogleAccessToken = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh-google-access-token`, {
        method: "POST",
        credentials: "include"
    })
    if (response.ok) {

        return true
    } else {
        return false
    }
}
export const refreshAccessToken = async () => {
    let response;
    try {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh-access-token`, {
            method: "POST",
            credentials: "include",
            // body: username
        })
        if (!response.ok) {
            const eror = await response.text()
            // alert(eror)
            return null
        } else {
            // alert("refresh access in frontend reciev ok")
            const data = await response.json()
            return data.username
        }
    } catch (error) {
        // alert("refresh access token frontend function got error")
        console.error(error)
        return null
    }

}


class CreateGoogleCloudbase {
    #retryCount = 0
    status
    username;
    constructor(username) {
        if (!username) {
            throw new Error("Username is required")
        }
        this.username = username
    }
    async create() {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/creategooglecloudbase?username=${this.username}`, {
            method: "GET",
            credentials: "include"
        });
        if (response.status === 401) {
            status = response.status
            const err = await response.text()
            // alert(err)

            if (this.#retryCount < 2) {
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    return null
                } else {
                    // alert("creation retrying...")
                    const folderid = await this.create()
                    return folderid
                }
            }


            return null


        }
        if (!response.ok) {
            status = response.status
            const invalidMsg = await response.text()
            // alert(invalidMsg)
            return null
        }

        const answer = await response.json()

        if (response.status === 201) {
            status = response.status
            return answer.folderCreatedId

        } else if (response.status === 200) {
            status = response.status
            return answer.folderId

        } else {
            status = response.status
            return null
        }
    }
}





async function handleGoogleSignInAndCloudCreation(username) {

}

export class Uploadfile {

    #retryUpload = 0
    async uploadfile(googlecloudbaseid, file, username, virtualParent, virtualBranch) {
        // alert("core uploader call hua")
        if (!googlecloudbaseid) {
            alert("Google cloudbase is absent.")
            return null
        }

        if (!file) {
            alert("Choose at least a file.")
            return null
        }

        if (!username) {
            alert("Username is absent.")
            return null
        }


        // const formData = new FormData();
        // formData.append("file", file);


        const responseStatus = await fetch(`${import.meta.env.VITE_BACKEND_URL}/uploadfile?parentFolderId=${googlecloudbaseid}&username=${username}&virtualParent=${encodeURIComponent(virtualParent)}&virtualBranch=${encodeURIComponent(virtualBranch)}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "x-file-name": encodeURIComponent(file.name),
                "x-file-size": file.size,
                "x-mime-type": file.type,
                "x-parent-folder-id": googlecloudbaseid,
                "Content-Type": file.type,
                "Content-Length": file.size,
                "x-username": username
            },
            body: file
        })
        if (responseStatus.status === 401) {
            alert("retryinng")
            if (this.#retryUpload < 2) {
                this.#retryUpload += 1
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    // alert("google refresh token is also expired")

                    return null
                } else {
                    return await this.uploadfile(googlecloudbaseid, file, username, virtualParent)
                }
            }
            this.#retryUpload = 0;
            return null
        }
        if (!responseStatus.ok) {
            alert("file not uploaded")
            console.log(responseStatus.status)
            return null
        }
        if (responseStatus.status === 200) {
            const info = await responseStatus.json();
            // alert(info.virtualparent)
            // alert(info.totalSize)
            // alert("Successfully uploaded");
            this.#retryUpload = 0;
            info.msg = "Uploaded Successfullyy";
            // alert(JSON.stringify(info))
            return info
        }
        this.#retryUpload = 0;
        return null

    }
}





const AdminDashboard = () => {
    // alert("ye alert hua admin dashboard se")
    // console.log("ha log hua")

    const [googlecloudbaseid, setgooglecloudbaseid] = useState("")
    const [username, setUsername] = useState("")

    const navigate = useNavigate()
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const fullname = params.get("fullname");
    // alert(fullname)





    useEffect(() => {
        const initializeFolderCreation = async () => {
            const uname = params.get("username");
            if (!username) {
                setUsername(uname);
                return
            }
            const Cloudbase = new CreateGoogleCloudbase(username)
            setgooglecloudbaseid(await Cloudbase.create())
            // setgooglecloudbaseid(cloudbaseId)
            // alert(googlecloudbaseid+"idddd")
            return
        }
        initializeFolderCreation()
    }, [username])



    const logoutButton = async () => {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogout`,
            {
                method: "POST",
                credentials: "include"
            }
        )
        if (response.status === 401) {
            refreshGoogleAccessToken()
                .then((flag) => {
                    if(!flag){navigate("/admin");alert("sign in again and then sign out")}
                    else {fetch(`${import.meta.env.VITE_BACKEND_URL}/usernamelogout`,
                        {
                            method: "POST",
                            credentials: "include"
                        }
                    ).then(()=>{navigate("/admin");alert("sign outed")})}
                })
                

        }
        if (response.status != 200) {
            const responseText = await response.text()
            // alert(responseText)
            console.log(responseText)
            return;
        } else {
            const msg = await response.text()
            navigate("/admin")
            alert(msg)
            return;
        }

    }






    return username ? (
        <div className="admin-dashboard-homepage">
            <aside className="admin-dashboard-aside">
                <header>
                    <button id={"menuBtnAtBody0"} onClick={AdminMenuLoaderButton}>Close</button>
                </header>
                <main>
                    <ul>
                        <li><a href="/student" target="_blank" className="" rel="noopener noreferrer" onClick={()=>{AdminMenuLoaderButton();}}>Student</a></li>
                        <li>About</li>
                    </ul>
                    <button onClick={logoutButton}>Logout</button>
                </main>

            </aside>
            <div className="admin-dashboard-body">
                <header>
                    <button id={"menuBtnAtBody1"} onClick={AdminMenuLoaderButton}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </button>
                    <span className="dashboardtitle">
                        <div className="text">
                            <h1>Admin Dashboard</h1>
                            <h3>Welcome! <span style={{ color: "#4361ee" }}>{fullname}</span></h3>
                        </div>
                        <div style={{ display: "flex" }} className="profiledetailshort">
                            <span ><h2>{username}</h2><h3 style={{ color: "#4361ee" }}>Administrator</h3></span>
                            {/* <span style={{ display: "flex", alignItems: "center" }}><div style={{ width: "70px", height: "70px", backgroundColor: "#4361ee", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}><h3>{fullname.split(" ")[0][0] + fullname.split(" ")[1][0]}</h3></div></span>  */}
                        </div>
                    </span>
                </header>
                <main>

                    <div className="admin-dashboard-body-top">
                        <input type="search" name="search" id="" placeholder='/search'  />
                    </div>
                    {/* <div className="admin-dashboard-body-mid"> */}
                        <Outlet context={[googlecloudbaseid, username]} />
                        {/* <Outlet context={[googlecloudbaseid, username]} /> */}
                        {/* <div className='subjectsdiv'>
                            <section>

                            </section>
                            <ul style={{ display: "flex" }}>
                                <div><AdminSubjectCard googlecloudbaseid={googlecloudbaseid} username={username} virtualParent="Maths" /></div>
                                <div><AdminSubjectCard googlecloudbaseid={googlecloudbaseid} username={username} virtualParent="GK" /></div>
                                <div><AdminSubjectCard googlecloudbaseid={googlecloudbaseid} username={username} virtualParent="Current Affairs" /></div>
                                <div><AdminSubjectCard googlecloudbaseid={googlecloudbaseid} username={username} virtualParent="English" /></div>
                                <div><AdminSubjectCard googlecloudbaseid={googlecloudbaseid} username={username} virtualParent="Hindi" /></div>
                            </ul>
                        </div> */}
                        {/* <div className="admin-dashboard-body-aftersubjectsdiv">
                        </div> */}
                    {/* </div> */}

                </main>

                <footer>

                </footer>
            </div>
        </div>
    ) : (<div>Loading...</div>)

};




export default AdminDashboard;