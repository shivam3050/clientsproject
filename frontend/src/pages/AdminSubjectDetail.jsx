
import { useRef, useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { Uploadfile } from "./AdminDashboard";
import "./AdminSubjectDetail.css";

async function handleUpload(googlecloudbaseid, file, username, progressRef, virtualParent, virtualBranchForm, uploadLog) {
  const formData = new FormData(virtualBranchForm)
  const virtualBranch = formData.get("branch")


  const svg = progressRef.current;
  const circle = svg.children[0]

  const totalLength = 2 * Math.PI * 34;


  circle.style.transition = "stroke-dashoffset 0.1s ease-in";
  let oneTenth = parseInt(`${Math.round(totalLength / 10)}`)
  circle.style.strokeDashoffset = "0";
  circle.style.strokeDasharray = `${oneTenth}`;

  let i = 0

  svg.style.display = "flex";
  svg.style.visibility = "visible";
  i++
  circle.style.strokeDashoffset = `${oneTenth * i}`

  const uploadingAnimation = setInterval(() => {

    i++
    circle.style.strokeDashoffset = `${oneTenth * i}`

  }, 500);


  try {
    uploadLog.current.textContent = ""
    const Uploader = new Uploadfile();
    const res = await Uploader.uploadfile(googlecloudbaseid, file, username, virtualParent, virtualBranch);
    if (res) {
      uploadLog.current.textContent = "Upload successfully"
    }
  } catch (error) {
    uploadLog.current.textContent = "Upload Failed"

  } finally {
    clearInterval(uploadingAnimation)
    svg.style.display = "none";
  }


}

export const AdminSubjectDetail = () => {
  const [googlecloudbaseid, username] = useOutletContext();
  const params = useParams();
  const virtualParent = params.subject;
  const virtualBranchObject = useRef()
  const tester = useRef()
  const fileRef = useRef();
  const progressRef = useRef();
  const uploadLog = useRef();
  const [fileslist, setFileslist] = useState(null);

  useEffect(() => {


    if (!virtualParent) {
    
      return;
    }



    const fileListerInUseEffect = async () => {
      const fileListString = await fetch(
        `http://localhost:8000/get-files-list?subject=${encodeURIComponent(virtualParent)}`,
        { method: "GET", credentials: "include" }
      );
      if (fileListString.ok) {
        setFileslist(await fileListString.json());
      }
    }
    fileListerInUseEffect()

  }, [virtualParent]);

  return (
    <div className="admin-subjectsdiv-detail">
      <h2>{virtualParent} Files Dashboard</h2>

      <div >
        <section className="upload-section">
          <input type="file" ref={fileRef} />

          <form id="branch-selector-form" ref={virtualBranchObject}>
            <div><input  type="radio" name="branch" id="" value="Notes" defaultChecked /> Notes <br /></div>
            <div><input  type="radio" name="branch" id="" value="Previous Year Papers" /> Previous Year Papers <br /></div>
            <div><input  type="radio" name="branch" id="" value="Custom Notes" /> Custom Notes <br /></div>
            <div><input  type="radio" name="branch" id="" value="Short Tricks" /> Short Tricks <br /></div>
          </form>

          <button
            onClick={() => {
              if (fileRef.current.files.length > 0) {
                handleUpload(
                  googlecloudbaseid,
                  fileRef.current.files[0],
                  username,
                  progressRef,
                  virtualParent,
                  virtualBranchObject.current,
                  uploadLog,

                );
              }
            }}
          >
            Upload
          </button>

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
        </section>
        <section>



        </section>
      </div>

      <div className="file-list-section">
        <h3>Uploaded Files</h3>
        {fileslist ? (
          fileslist.length > 0 ? (
            <div className="file-grid">
              {fileslist.map((item, index) => (
                <a
                  key={index}
                  href={`https://drive.google.com/uc?export=download&id=${item.fileid}`}
                  className="file-card"
                >
                  <strong>{item.filename}</strong><br />
                  <span>&nbsp;Size: {item.filesize} bytes</span>
                </a>
              ))}
            </div>
          ) : (
            <p>No files uploaded yet.</p>
          )
        ) : (
          <p>Loading files...</p>
        )}
      </div>
    </div>
  );
};
