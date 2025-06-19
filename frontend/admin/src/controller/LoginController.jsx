export class AutoLogin {
    #googleRetryCount = 0;
    async testGoogleAccessTokenIfNotThenUpdate() {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/test-google-access-token`, {
            method: "GET",
            credentials: "include",
            mode: "cors"
        })
        if (response.status === 401) {
            const error = await response.text()
            if (this.#googleRetryCount < 2) {
                this.#googleRetryCount += 1;
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    console.log("Googele Refresh token is also expired you need to login manully")

                    return false
                } else {
                    return await this.testGoogleAccessTokenIfNotThenUpdate()
                }
            }
            return false
        }
        if (!response.ok) {
            const error = await response.text()
            return false
        } else {
            const data = await response.json();
            if (data.success && data.redirectUrl) {
                window.location.href = data.redirectUrl;

                this.#googleRetryCount = 0
                return true
            }
            else {
                this.#googleRetryCount = 0
                return false
            }
        }
    }
    #normalRetryCount = 0;
    async testAccessTokenWithLoginAccess() {

        const loggedInUser = await fetch(`${import.meta.env.VITE_BACKEND_URL}/adminautologin`, {
            method: "POST",
            credentials: "include"
        })

        if (loggedInUser.status === 401) {
            const error = await loggedInUser.text()
            console.log(error)
            if (this.#normalRetryCount < 2) {
                this.#normalRetryCount += 1;

                const flag = await refreshAccessToken()
                if (!flag) {
                    console.log("Refresh token is also expired you need to login manully")
                    return null;
                } else {
                    console.log("retyring.....")
                    return await this.testAccessTokenWithLoginAccess()
                }
            }
            return null
        }

        if (loggedInUser.status !== 200) {

            const error = await loggedInUser.text()
            console.log(error)

            this.#normalRetryCount = 0
            return null;
        } else {
            console.log("user logged in via auto login , acces token is now correct")
            const user = await loggedInUser.json()
            this.#normalRetryCount = 0
            return user;
        }

    }

}















export const refreshGoogleAccessToken = async () => {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh-google-access-token`, {
        method: "POST",
        credentials: "include"
    })
    if (response.ok) {

        return true
    } else {
        return false
    }
}
export const refreshAccessToken = async () => {
    let response;
    try {
        response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/refresh-access-token`, {
            method: "POST",
            credentials: "include",
            // body: username
        })
        if (!response.ok) {
            const eror = await response.text()
            // (eror)
            return null
        } else {
            // ("refresh access in frontend reciev ok")
            const data = await response.json()
            return data.username
        }
    } catch (error) {

        console.error(error)
        return null
    }

}


export class CreateGoogleCloudbase {
    #retryCount = 0
    status
    username;
    constructor(username) {
        if (!username) {
            throw new Error("Username is required")
        }
        this.username = username
    }
    async create() {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/creategooglecloudbase?username=${this.username}`, {
            method: "POST",
            credentials: "include"
        });
        if (response.status === 401) {
            status = response.status
            const err = await response.text()
            console.log(err)


            if (this.#retryCount < 2) {
                console.log("retrying")
                const flag = await refreshGoogleAccessToken()
                if (!flag) {
                    console.log("google refresh token also expired you need to manully login in google ")
                    return null
                } else {
                
                    const folderid = await this.create()
                    return folderid
                }
            }


            return null


        }
        if (!response.ok) {
            status = response.status
            const invalidMsg = await response.text()
            console.log(invalidMsg)

            return null
        }

        const answer = await response.json()

        if (response.status === 201) {
            status = response.status
            return answer.folderCreatedId

        } else if (response.status === 200) {
            status = response.status
            return answer.folderId

        } else {
            status = response.status
            return null
        }
    }
}