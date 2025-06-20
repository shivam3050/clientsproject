import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { handleDelete, handleUpload } from "../controller/FileController"
import { handleBackToDashboardComeBack } from "./AdminDashboard"

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
    // function openFullscreen(element) {
    //     if (element.requestFullscreen) {
    //         element.requestFullscreen();
    //     } else if (element.webkitRequestFullscreen) {
    //         element.webkitRequestFullscreen();
    //     } else if (element.msRequestFullscreen) {
    //         element.msRequestFullscreen();
    //     } else {
    //     }
    // }





    useEffect(() => {
        const useEffectFilesController = async () => {

            handleBackToDashboardComeBack()
            if (files) {
                return
            }
            if (subject === "create-new-subject") {
                return
            }

            if (!subject) {
                console.log("no subject provided to useffetct")
                return
            }

            const recievedfiles = await getFiles(subject)
            if (!recievedfiles) {
                console.log("no files present")
                return
            }
            setFiles(recievedfiles)

        }
        useEffectFilesController()
    })
    return (
        subject ? (
            <div className="subject-container">
                <section className="upload-section">
                    <form action="" className="upload-form" onSubmit={(e) => {
                        handleUpload(e, progressRef, subject, uploadLog)
                    }}>
                        <div className="label">
                            {
                                (subject === "create-new-subject") ? (
                                    <input type="text" required name="subject" placeholder="Enter new subject name" />
                                ) : (<h2 style={{fontStyle:"oblique"}}>{subject}</h2>)
                            }
                        </div>
                        <input type="file" name="filepicker" />
                        <div className="file-branch-section">
                            <div>
                                <input type="radio" name="branch" value="Notes" />Notes
                            </div>
                            <div>
                                <input type="radio" name="branch" value="Books" />Books
                            </div>
                            <div>
                                <input type="radio" name="branch" value="Previous Year Papers" />Previous Year Papers
                            </div>
                            <div>
                                <input type="radio" name="branch" value="Short Tricks" />Short Tricks
                            </div>
                            <div>
                                <input type="radio" name="branch" value="Custom Notes" defaultChecked />Custom Notes
                            </div>
                        </div>

                        <div>
                            <input type="submit" value="Upload" />
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
                            return (
                            <div className="file-card-admin" key={index} onClick={(e) => {
                                const ifram = e.currentTarget.querySelector("iframe")
                                window.goFullscreen(ifram);
                                }}>
                                <div>
                                    {decodeURIComponent(item.filename).slice(0, 12)}

                                </div>
                                <div id="iframeContainer" >
                                    <iframe src={`https://drive.google.com/file/d/${item.fileid}/preview`}
                                        allow="fullscreen"
                                        height="210px" width="280px"
                                        
                                        frameBorder="0" ></iframe>
                                </div>
                                <div>
                                    <button style={{ color: "white", backgroundColor: "red" }} onClick={(e) => { e.stopPropagation();handleDelete(e, item) }}>Delete</button>
                                </div>
                            </div>)
                        })
                    ) : (<p>No files recievd</p>)}
                </section>
            </div>
        ) : (<p>No subject is passed</p>)
    )
}