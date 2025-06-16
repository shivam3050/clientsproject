import { useEffect, useState } from "react";
import "./StudentBody.css"
import { Outlet } from "react-router-dom";
import { StudentSubjectCard } from "./StudentSubjectCard";

const StudentBody = () => {
    const [folders, setFolders] = useState(null)


    useEffect(() => {
        const fetchSubFoldersFunc = async () => {
            const subjects = await fetch(`http://localhost:8000/get-subjects-list`, {
                method: "GET"
            })
            if (!subjects) {
                return null
            }
            setFolders(await subjects.json())
        }
        fetchSubFoldersFunc()

    }, [])
    return (
        <div className="StudentBody">
        
                <div className='student-subjectsdivgrid'>
                    <ul >
                        {folders ? (
                            folders.map((item,index) => {
                                return <li><StudentSubjectCard key={index} virtualParent={item}/></li>
                            })
                        ) : (null)}
                        
                    </ul>
                </div>
               <Outlet />
       
        </div>
    )
}
export default StudentBody;