// import { useRef, useState , useEffect } from "react";
// import { useOutletContext, useParams } from "react-router-dom";
// import { Uploadfile } from "./AdminDashboard";
// import "./StudentSubjectDetail.css"

// async function handleUpload(googlecloudbaseid, file, username, progressRef, virtualParent, uploadLog) {

//   const svg = progressRef.current;
//   const circle = svg.children[0]

//   const totalLength = 2 * Math.PI * 34;


//   circle.style.transition = "stroke-dashoffset 0.1s ease-in";
//   let oneTenth = parseInt(`${Math.round(totalLength / 10)}`)
//   circle.style.strokeDashoffset = "0";
//   circle.style.strokeDasharray = `${oneTenth}`;

//   let i = 0

//   svg.style.display = "flex";
//   svg.style.visibility = "visible";
//   i++
//   circle.style.strokeDashoffset = `${oneTenth * i}`

//   const uploadingAnimation = setInterval(() => {

//     i++
//     circle.style.strokeDashoffset = `${oneTenth * i}`

//   }, 500);


//   try {
//     uploadLog.current.textContent = ""
//     const Uploader = new Uploadfile();
//     const res = await Uploader.uploadfile(googlecloudbaseid, file, username, virtualParent);
//     if (res) {
//       uploadLog.current.textContent = "upload successfully"
//     }
//   } catch (error) {
//     uploadLog.current.textContent = "upload failed"

//   } finally {
//     clearInterval(uploadingAnimation)
//     svg.style.display = "none";
//   }


// }

// export const StudentSubjectDetail = () => {
//   const [googlecloudbaseid, username] = useOutletContext();
//   const params = useParams();
//   const virtualParent = params.subject;
//   const fileRef = useRef();
//   const progressRef = useRef();
//   const uploadLog = useRef()
//   const [branchesList,setBranchesList] = useState(null)


//   const fileLister = async () => {
//     const virtualBranchesListString = await fetch(`http://localhost:8000/get-files-list?subject=${encodeURIComponent(virtualParent)}`,
//       {
//         method: "GET",
//         credentials: "include"
//       })

//     if(!virtualBranchesListString.ok){
//       return null
//     }
//     const fileList = await virtualBranchesListString.json()
//     return fileList
//   }


//   useEffect(() => {
//     async function virtualBranchesLister(){
//       setBranchesList(await fileLister())
//     }
//     virtualBranchesLister()

//   }, [])



//   return (
//     <div style={{ display: "flex", flexDirection: "column", padding: "10px", }} className="admin-subjectsdiv-detail">
//       <div className="upload-and-delete-section"> hiiiiiii</div>
//       <div className="uploaded-files-in-db">
//         {
//           branchesList ? (
//             branchesList.map((item)=>{
//               return <a href={`https://drive.google.com/uc?export=download&id=${item.fileid}`}>

//                 <span>{item.filename} </span> 
//                 <span> Size: </span>
//                 <span>{item.filesize}</span>
//                 </a>
//             })
//           ) : (<div>Loading Files</div>)
//         }
//       </div>

//     </div>
//   );
// };






























import { useRef, useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";

import "./StudentSubjectDetail.css";



export const StudentSubjectDetail = () => {
  const dynamicRoutes  = useParams(); // cons that this can only give dynamic available routes

  const virtualParent = dynamicRoutes.subject


  const [branchesList, setBranchesList] = useState(null);

  useEffect(() => {

    if (!virtualParent) {
      console.warn("virtualParent is not yet available.");
      return;
    }




    const virtualBranchesLister = async () => {

      const virtualBranchesListString = await fetch(
        `http://localhost:8000/get-subject-branch?virtualparent=${encodeURIComponent(virtualParent)}`,
        { method: "GET" }
      );
      if (virtualBranchesListString.ok) {
        setBranchesList(await virtualBranchesListString.json());
      }
    }
    virtualBranchesLister()

  }, [virtualParent]);

  return (
    <div className="student-subjectsdiv-detail">
      <h2>{virtualParent} Files Dashboard</h2>



      <div className="file-list-section">
        <h3>Branches</h3>
        {branchesList ? (
          
            <div className="file-grid">
              {branchesList.map((item, index) => (
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
          <p>Loading branches...</p>
        )}
      </div>
    </div>
  );
};
