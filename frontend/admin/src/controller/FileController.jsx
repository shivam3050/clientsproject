export async function handleUpload(e,progressRef, virtualParent, uploadLog) {
    e.preventDefault()
    const form = e.target.parentElement
    const file = form.querySelector("input[name='filepicker']")
    const virtualBranch = form.querySelector("input[name='branch']")
    const username = localStorage.getItem("loggedInUsername")
    const googlecloudbaseid = localStorage.getItem("googleCloudbaseId")

    if(!googlecloudbaseid){
        console.log("ggoglecloudbase are not met")
        return null
    }
    if(!username){
        console.log("username are not met")
        return null
    }
    if(!file){
        console.log("file are not met")
        return null
    }
    if(!virtualBranch){
        console.log("virtualbranch are not met")
        return null
    }
    if(!virtualParent){
        console.log("virtualpaaret are not met")
        return null
    }



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
export function handleDelete(e, item) {
    const finalDelete = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/deletefile?fileId=${item.fileid}&username=${item.username}`, {
            method: "POST",
            credentials: "include"
        })
        if (!res.ok) {
            alert("not deletd")
            return
        }
        e.target.parentElement.classList.add("fade-out")
        setTimeout(() => {
            e.target.parentElement.remove()
        }, 400)
    }
    const confirmed = window.confirm(`Are you sure to delete ${item.filename}`)
    if (!confirmed) {
        return
    }
    finalDelete()
}








export class Uploadfile {

    #retryUpload = 0
    async uploadfile(googlecloudbaseid, file, username, virtualParent, virtualBranch) {

        if (!googlecloudbaseid) {
            alert("Google cloudbase is absent.")
            return null
        }

        if (!file) {
            alert("Choose at least a file.")
            return null
        }

        if (!username) {
            alert("Username is absent.")
            return null
        }





        const responseStatus = await fetch(`${import.meta.env.VITE_BACKEND_URL}/uploadfile?parentFolderId=${googlecloudbaseid}&username=${username}&virtualParent=${encodeURIComponent(virtualParent)}&virtualBranch=${encodeURIComponent(virtualBranch)}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "x-file-name": encodeURIComponent(file.name),
                "x-file-size": file.size,
                "x-mime-type": file.type,
                "x-parent-folder-id": googlecloudbaseid,
                "Content-Type": file.type,
                "Content-Length": file.size,
                "x-username": username
            },
            body: file
        })
        if (responseStatus.status === 401) {

            if (this.#retryUpload < 2) {
                this.#retryUpload += 1
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    // ("google refresh token is also expired")

                    return null
                } else {
                    return await this.uploadfile(googlecloudbaseid, file, username, virtualParent)
                }
            }
            this.#retryUpload = 0;
            return null
        }
        if (!responseStatus.ok) {

            console.log(responseStatus.status)
            return null
        }
        if (responseStatus.status === 200) {
            const info = await responseStatus.json();
            // (info.virtualparent)
            // (info.totalSize)
            // ("Successfully uploaded");
            this.#retryUpload = 0;
            info.msg = "Uploaded Successfullyy";
            // (JSON.stringify(info))
            return info
        }
        this.#retryUpload = 0;
        return null

    }
}