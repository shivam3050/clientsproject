import { useEffect, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"

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
        if(subjects){
            return
        }
        const loadSubjectUseEffect = async()=>{
            setSubjects(await getSubjects())
        }
        loadSubjectUseEffect()
        
    },[])

    return (
        <section className="admin-dashboard-content">
                <div className="subjectbar">
                    <div onClick={()=>{
                                
                                navigate(`/admindashboard/create-new-subject`)
                                console.log(`passed create-new-subject`)
                            }} style={{cursor:"pointer"}}>
                                <pre style={{fontSize:"280%"}}>+ </pre>
                                subject
                    </div>

                    {subjects ? (
                        subjects.map((item,index)=>{
                            return <div onClick={()=>{
                                const subject = encodeURIComponent(item)
                                navigate(`/admindashboard/${subject}`)
                                console.log(`passed ${subject}`)
                            }} key={index}>{item}</div>
                        })
                    ):(null)}
                </div>
                <Outlet/>
            </section>
    )
}