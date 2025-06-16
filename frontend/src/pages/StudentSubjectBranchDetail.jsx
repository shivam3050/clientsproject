import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./StudentSubjectBranchDetail.css"

const StudentSubjectBranchDetail = () => {
  const params = useParams()
  const virtualBranch = params.branch
  const virtualParent = params.subject
  const [fileslist, setFileslist] = useState()
  useEffect(() => {
    if(!virtualParent){
      return
    }
    if(!virtualBranch){
      return
    }
    const fileListerInUseEffect = async () => {
      const filesListString = await fetch(`http://localhost:8000/get-files-list?subject=${encodeURIComponent(virtualParent)}&branch=${encodeURIComponent(virtualBranch)}`, {
        method: "GET"
      })
      if (!filesListString.ok) {
        console.log("no files present")
        alert("bad response")
        return
      }
      setFileslist(await filesListString.json())
    }
    fileListerInUseEffect()



  }, [virtualBranch])
  return (
    <div className="file-list-section">
      {fileslist ? (
        fileslist.length > 0 ? (
          <div className="file-grid-student">
            {fileslist.map((item, index) => {
              const fileUrl = `https://drive.google.com/uc?export=download&id=${item.fileid}`;
              const previewUrl = `https://drive.google.com/file/d/${item.fileid}/preview`;
              const ext = item.filename.split('.').pop().toLowerCase();
              return (
              <div key={index} className="file-card-student">
                <div>
                  <strong>{decodeURIComponent(item.filename).slice(0,15)}</strong><br />
                  <span>Size: {decodeURIComponent(item.filesize)} bytes</span><br />
                </div>

          
                  <iframe className="iframe"
                      src={previewUrl}
                      width="300"
                      height="200"
                      allow="autoplay"
                    ></iframe>
  
              </div>
              )
            
            })}
          </div>
        ) : (
          <p>No files uploaded yet.</p>
        )
      ) : (
        <p>Loading files...</p>
      )}
    </div>
  );
};
export { StudentSubjectBranchDetail }
