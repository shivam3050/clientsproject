import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const StudentSubjectDetailBranchList = (props) => {

        const navigate = useNavigate()
        const params = useParams()

      const virtualParent = params.subject
    
    
      const [branchesList, setBranchesList] = useState(null);
    
      useEffect(() => {
    
        if (!virtualParent) {
          
          return;
        }
    
    
    
    
        const virtualBranchesLister = async () => {
    
          const virtualBranchesListString = await fetch(
            `${import.meta.env.VITE_BACKEND_URL}/get-subject-branch?virtualparent=${encodeURIComponent(virtualParent)}`,
            { method: "GET" }
          );
          if (virtualBranchesListString.ok) {
            setBranchesList(await virtualBranchesListString.json());
          }
        }
        virtualBranchesLister()
    
      }, [virtualParent]);



    return (
        <div className="brancheslist">
            <h3>Branches</h3>
            {branchesList ? (

                <div className="file-grid">
                    {branchesList.map((item, _) => (
                        <div className="file-card" onClick={() => { navigate(`/student/${encodeURIComponent(virtualParent)}/${encodeURIComponent(item)}`) }}>
                            {item}
                        </div>
                    ))}
                </div>

            ) : (
                <p>Loading branches...</p>
            )}
        </div>
    )
}


export {StudentSubjectDetailBranchList}