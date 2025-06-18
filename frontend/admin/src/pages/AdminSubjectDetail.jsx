import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { handleDelete, handleUpload } from "../controller/FileController"

export const AdminSubjectDetail = () => {
    const params = useParams()
    const subject = params.subject
    const [files, setFiles] = useState(null)

    const progressRef = useRef();
    const uploadLog = useRef();

    const getFiles = async (subject) => {
        if (!subject) {
            console.log("no subject provided")
            return null
        }
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/get-files-list-admin?subject=${subject}`, {
            method: "GET"
        })
        if (!res.ok) {
            const err = await res.text()
            console.log(err)
            return null
        }
        return await res.json()
    }




    useEffect(() => {
        const useEffectFilesController = async () => {

            if (!subject) {
                console.log("no subject provided to useffetct")
                return
            }
         
            const recievedfiles = await getFiles(subject)
            if(!recievedfiles){
                return
            }
            setFiles(recievedfiles)

        }
        useEffectFilesController()
    },[subject])
    return (
        subject ? (
            <div className="subject-container">
                <section className="upload-section">
                    <form action="" className="upload-form" onSubmit={(e) => {
                        handleUpload(e, progressRef, subject, uploadLog)
                    }}>
                        <div className="label">
                            {subject}
                        </div>
                        <input type="file" name="filepicker" id="" />
                        <div className="file-branch-section">
                            <div>
                                <input type="radio" name="branch"  value="Notes" checked />Notes
                            </div>
                            <div>
                                <input type="radio" name="branch"  value="Books" />Books
                            </div>
                            <div>
                                <input type="radio" name="branch"  value="Previous Year Papers" />Previous Year Papers
                            </div>
                            <div>
                                <input type="radio" name="branch"  value="Short Tricks" />Short Tricks
                            </div>
                            <div>
                                <input type="radio" name="branch"  value="Custom Notes" />Custom Notes
                            </div>
                        </div>

                        <div>
                            <input type="submit" style={{ color: "black" }} value="Upload" />
                        </div>
                    </form>
                    <div className="loading-svg-container">
                        <div ref={uploadLog} className="upload-log"></div>

                        <svg ref={progressRef} width="80" height="80" style={{ display: "none" }}>
                            <circle
                                cx="40"
                                cy="40"
                                r="34"
                                fill="none"
                                stroke="blue"
                                strokeWidth="6"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </section>
                <section className="list-files-section">
                    {files ? (
                        files.map((item, index) => {
                            return (<div className="file-card-admin" key={index}>
                                <div>
                                {decodeURIComponent(item.filename).slice(0,12)}

                                </div>
                                <div>
                                    {decodeURIComponent(item.filesize).slice(0,8)} bytes
                                </div>
                                <div>
                                    <button style={{color:"white",backgroundColor:"red",borderRadius:"2px"}} onClick={(e)=>{handleDelete(e,item)}}>Delete</button>
                                </div>
                                </div>)
                        })
                    ) : (<p>No files recievd</p>)}
                </section>
            </div>
        ) : (<p>No subject is passed</p>)
    )
}