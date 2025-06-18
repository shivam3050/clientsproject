import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

export const AdminSubjectDetail = ()=>{
    const params = useParams()
    const subject = params.subject
    const [files,setFiles] = useState(null)

    const getFiles = async(subject)=>{
        if(!subject){
            console.log("no subject provided")
            return null
        }
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-files-list-admin?subject=${subject}`,{
            method:"GET"
        })
        if(!res.ok){
            const err = await res.text()
            console.log(err)
            return null
        }
        return await res.json()
    }

    useEffect(()=>{
        const useEffectFilesController = async ()=>{

            if(!subject){
                console.log("no subject provided to useffetct")
                return
            }
            
            setFiles(await getFiles(subject))

        }
        useEffectFilesController()
    })
    return (
        subject?(
            <div className="subject-container">
                    <section className="upload-section">
                        <form action="" className="upload-form">
                            <div className="label">
                                {subject}
                            </div>
                            <input type="file" name="filepicker" id="" />
                            <div className="file-branch-section">
                                <div>
                                    <input type="radio" name="" id="" value="Notes"/>Notes
                                </div>
                                <div>
                                    <input type="radio" name="" id="" value="Previous Year Papers"/>Previous Year Papers
                                </div>
                            </div>

                            <div>
                                <input type="submit" style={{color:"black"}} value="Upload" />
                            </div>
                        </form>
                        <div className="loading-svg-container">
                            <svg height="100" width="100" fill="white">
                                <circle cx="50" cy="50" r="40" />
                            </svg>
                        </div>
                    </section>
                    <section className="list-files-section">
                        {files?(
                            files.map((item,index)=>{
                                return(<div key={index}>{decodeURIComponent(item.filename)}</div>)
                            })
                        ):(<p>No files recievd</p>)}
                    </section>
                </div>
        ):(<p>No subject is passed</p>)
    )
}