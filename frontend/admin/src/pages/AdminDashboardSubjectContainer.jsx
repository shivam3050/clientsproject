import { useEffect, useState } from "react"
import { Outlet, useNavigate, useParams } from "react-router-dom"

export const AdminDashboardSubjectContainer = ()=>{
    const [subjects,setSubjects] = useState(null)
    const navigate = useNavigate()

    const getSubjects =async ()=>{
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-subjects-list`,{
            method:"GET"
        })
        if(!res.ok){
            const err = await res.text()
            console.log(err)
            return null
        }
        console.log("subjects list got successfully")
        return await res.json()
    }

    useEffect(()=>{
        const loadSubjectUseEffect = async()=>{
            setSubjects(await getSubjects())
        }
        loadSubjectUseEffect()
    },[])

    return (
        <section className="admin-dashboard-content">
                <div className="subjectbar">
                    {subjects ? (
                        subjects.map((item,index)=>{
                            return <div onClick={()=>{
                                const subject = encodeURIComponent(item)
                                navigate(`/admindashboard/${subject}`)
                            }} key={index}>{item}</div>
                        })
                    ):(<p>No Subjects</p>)}
                </div>
                <Outlet/>
            </section>
    )
}