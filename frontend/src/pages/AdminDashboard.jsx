import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import "./AdminDashboard.css"
import { useState, useRef } from 'react';

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
export const refreshAccessToken = async (username) => {
    let response;
    try {
        response = await fetch(`http://localhost:8000/refresh-access-token`, {
            method: "GET",
            credentials: "include",
            body: username
        })
    } catch (error) {
        console.log("hi")
        console.error(error)
        return null
    }
    return response.username
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
        const response = await fetch(`http://localhost:8000/creategooglecloudbase?username=${this.username}`, {
            method: "GET",
            credentials: "include"
        });
        if (response.status === 401) {
            status = response.status

            


            if (this.#retryCount < 1) {
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    return null
                }
            }


            if (this.#retryCount < 1) {
                this.#retryCount += 1
                alert("creation retrying...")
                const folderid = await create()
                return folderid
            }


            return null


        }
        if (!response.ok) {
            status = response.status
            const invalidMsg = await response.text()
            alert(invalidMsg)
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





// async function handleGoogleSignInAndCloudCreation(username) {

//     return createGoogleCloudbase(username)
// }

export const uploadfile = async (googlecloudbaseid, file, username, virtualParent) => {
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


    const formData = new FormData();
    formData.append("file", file);


    const responseStatus = await fetch(`http://localhost:8000/uploadfile?parentFolderId=${googlecloudbaseid}&username=${username}&virtualParent=${encodeURIComponent(virtualParent)}`, {
        method: "POST",
        credentials: "include",
        headers: {
            "x-file-name": encodeURIComponent(file.name),
            "x-mime-type": file.type,
            "x-parent-folder-id": googlecloudbaseid,
            "Content-Type": file.type,
            "Content-Length": file.size, // Optional; depends on browser support
            "x-username": username
        },
        body: file
    })
    if (responseStatus.status !== 200 && responseStatus.status !== 405) {
        console.log(responseStatus.status)
        return null
    }
    if (responseStatus.status === 200) {
        const info = await responseStatus.json();

        alert("Successfully uploaded");
        return info
    }

    if (responseStatus.status === 405) {
        return null
    }
    return null

}
export const refreshGoogleAccessToken = async () => {
    const response = await fetch("http://localhost:8000/refresh-google-access-token", {
        method: "POST",
        credentials: "include"
    })
    if (response.ok) {

        return true
    } else {
        return false
    }
}





const AdminDashboard = () => {
    const [file, setFile] = useState(null)
    const [googlecloudbaseid, setgooglecloudbaseid] = useState("")

    const navigate = useNavigate()
    const location = useLocation();
  const params = new URLSearchParams(location.search);
  const username = params.get("username");
  const fullname = params.get("fullname");
    const virtualparent = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }



    useEffect(() => {
        const initializeFolderCreation = async () => {

            const Manager = new CreateGoogleCloudbase(username)
            const result = await Manager.create()
            setgooglecloudbaseid(result)

        }
        initializeFolderCreation()

    }, [])



    const logoutButton = async () => {
        const response = await fetch("http://localhost:8000/usernamelogout",
            {
                method: "POST",
                credentials: "include"
            }
        )
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






    return (
        <div className="admin-dashboard-homepage">
            <aside className="admin-dashboard-aside">
                <header>
                    <button id={"menuBtnAtBody0"} onClick={AdminMenuLoaderButton}>Close</button>
                </header>
                <main>
                    <ul>
                        <li>Dashboard</li>
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
                            <h3>Welcome! <span style={{ color: "#4361ee" }}>{fullname}</span>  Folder id :  {googlecloudbaseid}</h3>
                        </div>
                        <div style={{ display: "flex" }} className="profiledetailshort">
                            <span ><h2>{username}</h2><h3 style={{ color: "#4361ee" }}>Administrator</h3></span>
                            <span style={{ display: "flex", alignItems: "center" }}><div style={{ width: "70px", height: "70px", backgroundColor: "#4361ee", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}><h3>{fullname.split(" ")[0][0] + fullname.split(" ")[1][0]}</h3></div></span>
                        </div>
                    </span>
                </header>
                <main>

                    <div className="admin-dashboard-body-top">
                        <input type="text" name="search" id="" placeholder='/search' />
                    </div>
                    <div className="admin-dashboard-body-mid">
                        <div className='subjectsdiv'>
                            <section>
                                <button onClick={() => { uploadfile(googlecloudbaseid, file, username, virtualparent.current?.value) }}>Subjects</button>
                                <input type="text" name="" ref={virtualparent} id="" />
                                <input type="file" name="" id="" onChange={handleFileChange} />
                            </section>
                            <ul style={{ display: "flex" }}>
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </ul>
                        </div>
                        <div className="admin-dashboard-body-aftersubjectsdiv">
                        </div>
                    </div>

                </main>
                <footer>

                </footer>
            </div>
        </div>
    )

};




export default AdminDashboard;