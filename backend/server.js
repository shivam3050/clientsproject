import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { URLSearchParams } from 'url';
import fetch from "node-fetch"
import { User } from './src/dbmodels/UserModel.js';
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { PassThrough } from "stream"
import path from "path"
import { File } from './src/dbmodels/FilesSchema.js';


function verifyAccessToken(accessToken) {
    try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        return user
    } catch (error) {
        return null
    }
}
function verifyRefreshToken(refreshToken) {
    try {
        const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        return user
    } catch (error) {
        return null
    }
}
async function verifyGoogleAccessToken(googleAccessToken) {
    try {
        const testDriveAccess = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
            headers: {
                Authorization: `Bearer ${googleAccessToken}`
            }
        });
        if (!testDriveAccess.ok) {
            return null;
        }
        return testDriveAccess
    } catch (error) {
        return null
    }
}

async function findUserByUsername(username) {
    try {
        const user = await User.findOne({
            username: username
        })
        return user
    } catch (error) {
        return null
    }
}
function generateAccessToken(username) {
    const accessToken = jwt.sign(
        {
            username: username
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: "5h"
        }
    );
    return accessToken
}
function generateRefreshToken(username) {
    const refreshToken = jwt.sign(
        {
            username: username
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: "7d"
        }
    );
    return refreshToken
}

async function updateRefreshTokenInDatabase(username, newRefreshToken) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $set: {
                    refreshToken: newRefreshToken,
                    // googleRefreshToken: newGoogleRefreshToken
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}
async function updateGoogleRefreshTokenInDatabase(username, newGoogleRefreshToken) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $set: {
                    // refreshToken: newRefreshToken,
                    googleRefreshToken: newGoogleRefreshToken
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}

async function unsetRefreshTokenInDatabase(username) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $unset: {
                    refreshToken: 1,
                    // googleRefreshToken: 1
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}
async function unsetGoogleRefreshTokenInDatabase(username) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $unset: {
                    // refreshToken: 1,
                    googleRefreshToken: 1
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}
async function pushFileInfoInDatabase(userId, username, fileId, fileName, virtualParent, virtualBranch, fileSize) {
    try {
        const fileInfo = await File.insertOne(
            {
                userid: userId,
                username: username,
                fileid: fileId,
                filename: fileName,
                virtualparent: virtualParent,
                virtualbranch: virtualBranch,
                filesize: fileSize
            }
        )
        return fileInfo
    } catch (error) {
        return null
    }
}
async function popFileInfoInDatabase(fileId) {
    try {
        const fileInfo = await File.deleteOne(
            {

                fileid: fileId
            }
        )
        return fileInfo
    } catch (error) {
        return null
    }
}



// import {google} from "googleapis"

const connectDB = async () => {
    try {
        const connectionAttempt = await mongoose.connect(`${process.env.MONGODB_URI}`,
            {
                dbName: process.env.DATABASE_NAME,
                serverSelectionTimeoutMS: 5000,
                retryWrites: true,
            }
        )
        if (!connectionAttempt) {
            throw new Error()
        }

        const dbname = mongoose.connection.name;
        console.log("MongoDb Connected Successfully : ", dbname)

    } catch (error) {
        throw new Error(error)
    }
}

connectDB()
    .then(() => {
        const app = express();
        const host = process.env.HOST
        const port = process.env.PORT
        app.use(cors({
            origin: process.env.FRONTEND_URL,
            credentials: true
        }))
        app.use(express.json());
        app.use(cookieParser());

        app.get("/", (req, res) => {
            res.send("New Client connected : ", req.headers.host)
            return
        })


        app.post("/refresh-access-token", async (req, res) => {

            const refreshToken = req.cookies?.refreshToken

            if (!refreshToken) {
                return res.status(404).send("refresh token not found")
            }
            const status = verifyRefreshToken(refreshToken)
            if (!status) {
                return res.status(401).send("Invalid refresh token")
            }

            let user = await findUserByUsername(status.username)
            if (!user) {
                return res.status(404).send("User not found in db")
            }
            const newRefreshToken = generateRefreshToken(user.username)

            user = await updateRefreshTokenInDatabase(user.username, newRefreshToken)
            if (!user) {
                return res.status(501).send("you need to manually login")
            }

            const newAccessToken = generateAccessToken(user.username)
            const options = {
                httpOnly: true,
                secure: true
            }
            return res
                .status(200)
                .cookie("accessToken", newAccessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json({
                    username: user.username,
                    fullname: user.fullname,
                    accessToken: newAccessToken
                })

        })


        app.post("/usernamelogin", async (req, res) => {


            try {
                if (mongoose.connection.readyState !== 1) {
                    res.status(501).send("Not connected to MongoDB");
                    return;
                }


                const userCount = await User.countDocuments();
                if (userCount === 0) {
                    if (!(process.env.ADMIN_CHOSEN_USERNAME && process.env.ADMIN_CHOSEN_PASSWORD && process.env.ADMIN_CHOSEN_EMAIL && process.env.ADMIN_CHOSEN_FULL_NAME)) {
                        res.status(404).send("Missing admin credentials in .env");
                        return;
                    }
                    const admin = new User(
                        {
                            username: process.env.ADMIN_CHOSEN_USERNAME,
                            password: process.env.ADMIN_CHOSEN_PASSWORD,
                            email: process.env.ADMIN_CHOSEN_EMAIL,
                            fullname: process.env.ADMIN_FULL_NAME
                        }
                    );
                    await admin.save()
                } else {
                }













                // FROM BELOW IS THE MAIN CODE









                const { username, password } = req.body;
                if (!(username && password)) {
                    return res.status(400).send("Username and Password are required")
                };
                const user = await findUserByUsername(username)
                if (!user) {
                    console.log(username, "userrrnaame")
                    console.log("reeeerrr")
                    return res.status(404).send("User not found")
                }

                if (user.password === password) {
                    const newAccessToken = generateAccessToken(username)
                    const newRefreshToken = generateRefreshToken(username)
                    const updatedUser = await updateRefreshTokenInDatabase(user.username, newRefreshToken)
                    if (!updatedUser) {
                        return res.status(500).send("internal server err cannot update refresh token")
                    }

                    const options = {
                        httpOnly: true,
                        secure: true,
                        sameSite: "Lax",
                        path: "/"  ,                   // optional but recommended
                        maxAge: 7 * 24 * 60 * 60 * 1000

                    }


                    const frontendURL = process.env.FRONTEND_URL;
                    res.status(200)
                        .cookie("accessToken", newAccessToken, options)
                        .cookie("refreshToken", newRefreshToken, options)
                        .json({ username: updatedUser.username, fullname: updatedUser.fullname })
                    return

                } else {
                    return res.status(401).send("Invalid credentials")
                }

            } catch (error) {
                return res.status(500).send("internal server error")
            }
        })


        app.post("/usernamelogout", async (req, res) => {
            //require access token
            const comingAccessToken = await req.cookies?.accessToken
            if (!comingAccessToken) {
                res.status(404).send("Access token not available")
                return;
            }
            const decodedAccessToken = verifyAccessToken(comingAccessToken)
            if (!decodedAccessToken) {
                return res.status(401).send("expired access token")
            }
            const user = await unsetRefreshTokenInDatabase(decodedAccessToken.username)
            if (!user) {
                return res.status(404).send("user not found on db")
            }
            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "Lax",
                path: "/"  ,                  
                maxAge: 7 * 24 * 60 * 60 * 1000

            }
            return res
                .status(200)
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .clearCookie("googleRefreshToken", options)
                .clearCookie("googleAccessToken", options)
                .json({
                    username: user.username,
                    msg: "logout successfully"
                })


        })


        app.post("/adminautologin", async (req, res) => {
            // console.log("all tokens", req.cookies) shivam1
            const comingAccessToken = await req.cookies?.accessToken
            // const comingGoogleAccessToken = await req.cookies?.googleAccessToken
            if (!comingAccessToken) {
                res.status(404).send("Access token is not available")
                return;
            }
            // if (!comingGoogleAccessToken) {
            //     res.status(404).send("Google access token is not available")
            //     return;
            // }
            const decodedAccessToken = verifyAccessToken(comingAccessToken)
            if (!decodedAccessToken) {
                return res.status(401).send("expired access token")
            }
            const user = await findUserByUsername(decodedAccessToken.username)
            if (!user) {
                return res.status(404).send("User not found in db")
            }

            const newAccessToken = generateAccessToken(user.username)
            const newRefreshToken = generateRefreshToken(user.username)
            const updatedUser = await updateRefreshTokenInDatabase(user.username, newRefreshToken)
            if (!updatedUser) {
                return res.status(500).send("internal server err cannot update refresh token")
            }

            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "Lax",
                path: "/"  ,                   // optional but recommended
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
            const frontendURL = process.env.FRONTEND_URL;
            res.status(200)
                .cookie("accessToken", newAccessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json({ username: updatedUser.username, fullname: updatedUser.fullname })
            console.log("yes you are logged out",updatedUser.username)
            return

        });
        app.get("/test-google-access-token", async (req, res) => {
            const comingGoogleAccessToken = req.cookies?.googleAccessToken
            if (!comingGoogleAccessToken) {
                return res.status(404).send("404google access token is not available test google access token")
            }
            const testDriveAccess = await verifyGoogleAccessToken(comingGoogleAccessToken)
            if (!testDriveAccess) {
                return res.status(401).send("401google access token has been expired")
            }
            const frontendURL = process.env.FRONTEND_URL;
            // res.setHeader("Access-Control-Allow-Origin", process.env.FRONTENT_URL);
            // res.setHeader("Access-Control-Allow-Credentials", "true");

            // return res.redirect(`${frontendURL}/admindashboard?username=${encodeURIComponent(tempUser.username)}&fullname=${encodeURIComponent(tempUser.fullname)}`);
            return res.status(200).send("CORR200 GOOGLE ACCESS TOEK tok is CORRECT")

        })

        app.get("/first-google-login-redirector", async (req, res) => {
            console.log("first google login trigger hua triger hua")
            const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            // const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
            // const REDIRECT_URI = 'https://clientsprojectfrontend.onrender.com/';
            const REDIRECT_URI = `${process.env.BACKEND_URL}/oauth2callback`;
            // let scope = ['email', 'profile'].join(' ');
            // let scope = "https://www.googleapis.com/auth/drive.metadata.readonly";
            let scope = "https://www.googleapis.com/auth/drive.file"

            const params = new URLSearchParams({
                client_id: CLIENT_ID,
                redirect_uri: REDIRECT_URI,
                response_type: 'code',
                scope,
                access_type: 'offline',
                prompt: 'consent',
            });
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;


            res.redirect(authUrl);
            return;

        })

        app.get("/oauth2callback", async (req, res) => {   // google call backs the code to this path
            console.log("oauth2callback triger hua")
            const code = req.query.code
            if (!code) {
                return res.status(400).send("No temporary code received");
            }

            const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
            const REDIRECT_URI = `${process.env.BACKEND_URL}/oauth2callback`;  // must match the one used earlier

            // Exchange code for access token
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {  // THIS GIVES ACCESS FROM GOOGLE
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    code,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                }),
            });

            const tokenData = await tokenResponse.json();
            const newGoogleAccessToken = tokenData.access_token
            const newGoogleRefreshToken = tokenData.refresh_token


            // const appAccessToken = generateAccessToken(tempUser.username);
            // const appRefreshToken = generateRefreshToken(tempUser.username);
            const username = process.env.ADMIN_CHOSEN_USERNAME
            const updatedUser = await updateGoogleRefreshTokenInDatabase(username, newGoogleRefreshToken)
            if (!updatedUser) {
                return res.status(404).send("user not in db while updating tokens in db")
            }

            const options = {
                httpOnly: true,
                secure: true,
                sameSite: "Lax",
                path: "/"  ,                   // optional but recommended
                maxAge: 7 * 24 * 60 * 60 * 1000

            }

            res.status(200)
                // .cookie("accessToken", appAccessToken, options)
                // .cookie("refreshToken", appRefreshToken, options)
                .cookie("googleAccessToken", newGoogleAccessToken, options)
                .cookie("googleRefreshToken", newGoogleRefreshToken, options)
                .redirect(`${process.env.FRONTEND_URL}/admindashboard`)
            // .json({ access_token: tokenData.access_token })
            // res.send("ok ok"||"i have changed permissions of file")
            return;
        });

        app.post("/refresh-google-access-token", async (req, res) => {
            const comingGoogleRefreshToken = req.cookies?.googleRefreshToken
            if (!comingGoogleRefreshToken) {
                return res.status(404).send("No refresh token available")
            }
            let response;
            try {
                response = await fetch("https://oauth2.googleapis.com/token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        client_id: CLIENT_ID,
                        client_secret: CLIENT_SECRET,
                        refresh_token: comingGoogleRefreshToken,
                        grant_type: "refresh_token"
                    }),
                });

            } catch (error) {
                return res.status(401).send("google refresh token expired do sign in again")
            }

            if (!response.ok) {
                return res.status(401).send("google refresh token expired ")
            }
            const data = await response.json();
            return res
                .status(200)
                .cookie("googleAccessToken", data.access_token)
                .cookie("googleRefreshToken", data.refresh_token)
                .json({ newGoogleAccessToken: data.access_token, newGoogleRefreshToken: data.refresh_token || comingGoogleRefreshToken })

        })

        app.get("/creategooglecloudbase", async (req, res) => {
            // const googleAccessToken = req.cookies?.googleAccessToken
            // const username = req.query?.username

            const googleAccessToken = req.cookies.googleAccessToken
            const username = req.query.username
            if (!username) {
                return res.status(404).send("No username send")
            }
            if (!googleAccessToken) {
                return res.status(404).send("No google access token send")
            }

            const FOLDER_NAME = "AdminCloudBase"
            const folderSchema = {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
                parents: ["root"]
            }

            const query = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`);

            try {
                const driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`
                    }
                });
                if (!driveResponse.ok) {
                    return res.status(401).send("expired token of fetching error")
                }
                const data = await driveResponse.json();
                if (data.files.length > 1) {
                    return res.status(406).send(`'${data.files[0].id}' many folders already exists`)
                }
                if (data.files.length > 0) {
                    const folderId = data.files[0].id
                    const user = await findUserByUsername(username)
                    if (!user) {
                        return res.status(405).send("user not found when creating database")
                    }
                    return res.status(200).json({ "folderId": folderId })
                }

            } catch (error) {
                return res.status(501).send("expired token of fetching error")

            }
            try {
                const createFolder = await fetch("https://www.googleapis.com/drive/v3/files", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(folderSchema),
                });
                const createdData = await createFolder.json()
                return res.status(201).json({ folderCreatedId: createdData.id })
            } catch (error) {
                return res.status(401).send("expired access token")
            }

        })

        // app.post("/uploadfilemy", async (req, res) => {  // mycode
        //     // const accesstoken = req.cookies?.googleAccessToken;
        //     // const parentfolderid = req.query?.parentFolderId;
        //     // const username = req.query?.username
        //     // const filename = req.headers['x-file-name']
        //     // const virtualparent = req.query?.virtualParent
        //     // const totalSize = parseInt(req.headers['content-length']);
        //     // const contentType = req.headers['x-mime-type']




        //     async function resumableUploadLinkCreator(accessToken, parentFolderId, fileName) {
        //         // let response;
        //         try {
        //             const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
        //                 method: "POST",
        //                 headers: {
        //                     "Authorization": `Bearer ${accessToken}`,
        //                     "Content-Type": "application/json; charset=UTF-8",
        //                     "X-Upload-Content-Type": req.headers['x-mime-type'],
        //                     "X-Upload-Content-Length": req.headers['x-file-size'],
        //                 }
        //                 ,
        //                 body: JSON.stringify({
        //                     name: path.basename(fileName),
        //                     parents: [parentFolderId]
        //                 })
        //             });
        //             if (!response.ok) {
        //                 return null
        //             }
        //             const uploadUrl = response.headers.get("location");
        //             return uploadUrl;
        //         } catch (error) {
        //             return null
        //         }
        //     }


        //     const accesstoken = req.cookies?.googleAccessToken;
        //     const parentfolderid = req.query?.parentFolderId;
        //     const username = req.query?.username
        //     const filename = req.headers['x-file-name']
        //     const virtualparent = req.query?.virtualParent
        //     const totalSize = parseInt(req.headers['content-length']);
        //     const contentType = req.headers['x-mime-type']
        //     const fileSize = parseInt(req.headers['x-file-size']);


        //     const uploadUrl = await resumableUploadLinkCreator(accesstoken, parentfolderid, filename);

        //     if (!uploadUrl) {
        //         return res.status(401).send("google access to expired so upload url cannot be created")
        //     }


        //     const MIN_CHUNK_SIZE = 1024 * 1293; // min 256kb   ,  1 = 1 byte
        //     let buffer = Buffer.alloc(0);
        //     let offset = 0;

        //     let i = 0

        //     let j = 0
        //     req.on("data", async (chunk) => {
        //         await new Promise(resolve => setTimeout(resolve, 4000));
        //         i++

        //         req.pause();

        //         buffer = Buffer.concat([buffer, chunk]);

        //         if (buffer.length >= MIN_CHUNK_SIZE) {
        //             const completedChunkToSend = buffer.slice(0, MIN_CHUNK_SIZE);
        //             const remainingBuffer = buffer.slice(MIN_CHUNK_SIZE);
        //             buffer = remainingBuffer

        //             const start = offset;
        //             const end = offset + completedChunkToSend.length - 1;

        //             const contentRange = `bytes ${start}-${end}/${totalSize}`;
        //             const t0 = process.hrtime.bigint(); // High-res time

        //             const response = await fetch(uploadUrl, {
        //                 method: 'PUT',
        //                 headers: {
        //                     'Content-Length': completedChunkToSend.length.toString(),
        //                     'Content-Range': contentRange,
        //                     'Content-Type': contentType
        //                 },
        //                 body: completedChunkToSend
        //             });

        //             const t1 = process.hrtime.bigint();
        //             const durationSeconds = Number(t1 - t0) / 1e9; // seconds
        //             const speedMBps = (completedChunkToSend.length / (1024 * 1024)) / durationSeconds;

        //             if (!response.ok) {
        //                 const err = await response.text();
        //                 return res.status(500).send("Some rrr ocured in");
        //             }

        //             offset += completedChunkToSend.length;


        //         }

        //         req.resume();
        //     });

        //     req.on("end", async () => {
        //         j++
        //         res.send("")
        //         if (buffer.length > 0) {
        //             const start = offset;
        //             const end = offset + buffer.length - 1;
        //             const contentRange = `bytes ${start}-${end}/${totalSize}`;

        //             const response = await fetch(uploadUrl, {
        //                 method: 'PUT',
        //                 headers: {
        //                     'Content-Length': buffer.length.toString(),
        //                     'Content-Range': contentRange,
        //                     'Content-Type': req.headers['x-mime-type']
        //                 },
        //                 body: buffer
        //             });

        //             if (!response.ok) {
        //                 const err = await response.text();
        //                 console.error("Final chunk upload failed:", err);
        //                 return res.status(500).send("Final upload failed");
        //             }
        //             const info = await response.json()


        //             try {
        //                 const user = await findUserByUsername(username)
        //                 if (!user) {
        //                     return res.status(404).send("user not exists after uploading file")
        //                 }

        //                 const statusWithInfo = await pushFileInfoInDatabase(

        //                     user._id,
        //                     info.id,
        //                     filename,
        //                     virtualparent,
        //                     totalSize
        //                 )
        //                 res.status(200).json(statusWithInfo);

        //             } catch (error) {
        //                 return res.status(404).send("uploaded in cloud but not linked in db")
        //             }

        //         }
        //     });

        //     req.on("error", (err) => {
        //         console.error("Stream error:", err);
        //         return res.status(500).send("Stream error");
        //     });

        // });



        app.post("/uploadfile", async (req, res) => {
            // process.stdin._read()

            // Extract headers and query params
            const accessToken = req.cookies?.googleAccessToken;
            const parentFolderId = req.query?.parentFolderId;
            const username = req.query?.username;
            const fileName = req.headers['x-file-name'];
            const virtualParent = req.query.virtualParent;
            const virtualBranch = req.query.virtualBranch;


            if (!accessToken) {
                return res.status(404).send("No acess token present")
            }

            if (!(parentFolderId && username && fileName && virtualParent && virtualBranch)) {
                return res.status(404).send("no other credentials present")
            }

            const fileSize = parseInt(req.headers['x-file-size']); // File size from client
            const contentType = req.headers['x-mime-type'];



            async function resumableUploadLinkCreator(accessToken, parentFolderId, fileName) {
                try {
                    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json; charset=UTF-8",
                            "X-Upload-Content-Type": contentType,
                            "X-Upload-Content-Length": fileSize.toString(),
                        },
                        body: JSON.stringify({
                            name: path.basename(fileName),
                            parents: [parentFolderId]
                        })
                    });
                    if (!response.ok) {
                        console.error("Failed to create upload URL:", await response.text());
                        return null;
                    }
                    return response.headers.get("location");
                } catch (error) {
                    console.error("Error creating upload URL:", error);
                    return null;
                }
            }

            async function checkUploadedRange(uploadUrl, accessToken) {
                try {
                    const response = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Range': `bytes */${fileSize}`
                        }
                    });
                    if (response.status === 308) {
                        const range = response.headers.get('Range'); // e.g., "bytes=0-524287"
                        return range ? parseInt(range.split('-')[1]) + 1 : 0;
                    }
                    return 0;
                } catch (error) {
                    console.error("Error checking range:", error);
                    return 0;
                }
            }

            const uploadUrl = await resumableUploadLinkCreator(accessToken, parentFolderId, fileName);
            if (!uploadUrl) {
                return res.status(401).send("Google access token expired or some other issue");
            }

            let offset = await checkUploadedRange(uploadUrl, accessToken);


            const MIN_CHUNK_SIZE = 8 * 1024 * 1024; // 8mb
            const uploadStream = new PassThrough();
            req.pipe(uploadStream);

            let buffer = Buffer.alloc(0);
            let chunkCounter = 0;

            uploadStream.on("data", async (chunk) => {
                uploadStream.pause();
                buffer = Buffer.concat([buffer, chunk]);

                while (buffer.length >= MIN_CHUNK_SIZE) {
                    const chunkToSend = buffer.slice(0, MIN_CHUNK_SIZE);
                    buffer = buffer.slice(MIN_CHUNK_SIZE);

                    const start = offset;
                    const end = offset + chunkToSend.length - 1;
                    const contentRange = `bytes ${start}-${end}/${fileSize}`;

                    try {
                        const t0 = process.hrtime.bigint();
                        const response = await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Length': chunkToSend.length.toString(),
                                'Content-Range': contentRange,
                                'Content-Type': contentType
                            },
                            body: chunkToSend
                        });

                        const t1 = process.hrtime.bigint();
                        const durationSeconds = Number(t1 - t0) / 1e9;
                        const speedMBps = (chunkToSend.length / (1024 * 1024)) / durationSeconds;

                        if (!response.ok && response.status !== 308) {
                            console.error(`Chunk ${chunkCounter} failed:`, await response.text());
                            return res.status(500).send("Chunk upload failed");
                        }

                        // res.write(`${((offset + chunkToSend.length) / fileSize * 100).toFixed(2)}%`)
                        offset += chunkToSend.length;
                        chunkCounter++;
                    } catch (error) {
                        console.error(`Chunk ${chunkCounter} error:`, error);
                        return res.status(500).send("Chunk upload error");
                    }
                }

                uploadStream.resume(); // Resume stream for next chunk
            });

            uploadStream.on("end", async () => {
                // Handle final chunk if any
                if (buffer.length > 0) {
                    const start = offset;
                    const end = offset + buffer.length - 1;
                    const contentRange = `bytes ${start}-${end}/${fileSize}`;

                    try {
                        const response = await fetch(uploadUrl, {
                            method: 'PUT',
                            headers: {
                                'Content-Length': buffer.length.toString(),
                                'Content-Range': contentRange,
                                'Content-Type': contentType
                            },
                            body: buffer
                        });

                        if (!response.ok) {
                            console.error("Final chunk failed:", await response.text());
                            return res.status(500).send("Final chunk upload failed");
                        }

                        const info = await response.json();

                        // Save to database
                        try {
                            const user = await findUserByUsername(username);
                            if (!user) {
                                return res.status(404).send("User not found after upload");
                            }

                            const statusWithInfo = await pushFileInfoInDatabase(
                                user._id,
                                username,
                                info.id,
                                fileName,
                                virtualParent,
                                virtualBranch,
                                fileSize
                            );
                            res.status(200).json(statusWithInfo);
                        } catch (error) {
                            console.error("Database error:", error);
                            res.status(500).send("Uploaded to cloud but failed to link in DB");
                        }
                    } catch (error) {
                        console.error("Final chunk error:", error);
                        res.status(500).send("Final chunk upload error");
                    }
                } else {

                    res.status(200).send("Upload completed");
                }
            });

            uploadStream.on("error", (err) => {
                console.log("Stream error:", err);
                res.status(500).send("Stream error");
            });

            req.on("error", (err) => {
                console.error("Request error:", err);
                res.status(500).send("Request error");
            });
        });

        app.post("/deletefile", async (req, res) => {
            // console.log("all cookies", req.cookies)
            // const username = "shivam1"
            const comingGoogleAccessToken = req.cookies.googleAccessToken
            // console.log(comingGoogleAccessToken)
            const fileId = req.query.fileId
            const username = req.query.username
            if (!comingGoogleAccessToken) {
                console.log("cannot delete file access token is not available")
                return res.status(404).send("cannot delete file access token is not available")
            }
            if (!fileId) {
                console.log("file id is not available")
                return res.status(404).send("file id is not available")
            }
            const flag = verifyGoogleAccessToken(comingGoogleAccessToken)
            if (!flag) {
                return res.status(401).send("google access token expired")
            }


            const driveDeletionStatus = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${comingGoogleAccessToken}`
                }
            })

            if (!driveDeletionStatus.ok) {
                const err = await driveDeletionStatus.json()
                if (err.error.code === 404) {
                    const statusInDb = await popFileInfoInDatabase(fileId, username)
                    if (!statusInDb) {
                        console.log("cannot pop file from db due to some error but deleted in drive successfuly")
                        return res.status(403).send("cannot pop file from db due to some error but deleted in drive successfuly")
                    }
                    res.status(200).send("File deleted successfully")
                    return
                }
                console.log("file not deleted incorrect file id or access token just expired")
                console.log(err)
                return res.status(402).send("file not deleted incorrect file id or access token just expired")
            }
            const statusInDb = await popFileInfoInDatabase(fileId)
            if (!statusInDb) {
                console.log("cannot pop file from db due to some error but deleted in drive successfuly")
                return res.status(403).send("cannot pop file from db due to some error but deleted in drive successfuly")
            }
            res.status(200).send("File deleted successfully")
            return
        })



        app.get("/get-files-list", async (req, res) => {
            console.log("files route hit")


            const virtualparent = req.query.subject
            const virtualbranch = req.query.branch

            if (!virtualparent) {
                console.log("p not f")
                return res.status(404).send("virtualparent not found")
            }
            if (!virtualbranch) {
                console.log("b not f")
                return res.status(404).send("virtualbranch not found")
            }



            const username = process.env.ADMIN_CHOSEN_USERNAME
            const newUser = await findUserByUsername(username)
            if (!newUser) {
                return res.status(404).send("user not found")
            }
            const filesList = await File.find({
                userid: newUser._id,
                virtualparent: virtualparent,
                virtualbranch: virtualbranch
            });
            if (!filesList.length) {
                return res.status(404).send("no files found")
            }
            // console.log(filesList)
            return res.status(200).json(filesList)

        })
        app.get("/get-files-list-admin", async (req, res) => {
            console.log("files route hit")

            const virtualparent = req.query.subject


            if (!virtualparent) {
                console.log("p not f")
                return res.status(404).send("virtualparent not found")
            }




            const username = process.env.ADMIN_CHOSEN_USERNAME
            const user = await findUserByUsername(username)
            if (!user) {
                return res.status(404).send("User not found")
            }
            const newUser = await findUserByUsername(user.username)
            if (!newUser) {
                return res.status(404).send("user not found")
            }
            const filesList = await File.find({
                userid: newUser._id,
                virtualparent: virtualparent

            });
            if (!filesList.length) {
                return res.status(404).send("no files found")
            }
            // console.log(filesList)
            return res.status(200).json(filesList)

        })

        app.get("/get-subjects-list", async (req, res) => {
            console.log("subject route hit")

            const username = process.env.ADMIN_CHOSEN_USERNAME
            const user = await findUserByUsername(username)
            if (!user) {
                res.status(404).send("user not found")
            }
            const folders = await File.distinct("virtualparent", {
                userid: user._id,
                virtualparent: { $nin: [null, ""] }
            });
            if (!folders.length) {
                return res.status(404).send("no folders available")
            }
            return res.status(200).send(folders)

        })

        app.get("/get-subject-branch", async (req, res) => {
            // const virtualbranch = req.query.virtualbranch
            const virtualparent = req.query.virtualparent

            const username = process.env.ADMIN_CHOSEN_USERNAME
            const user = await findUserByUsername(username)
            if (!user) {
                res.status(404).send("user not found")
            }
            const virtualbranches = await File.distinct("virtualbranch", {
                userid: user._id,
                virtualparent: virtualparent,
            });
            if (!virtualbranches.length) {
                return res.status(404).send("no folders available")
            }
            return res.status(200).send(virtualbranches)

        })



        app.listen(port, host, () => {
            console.log(`Server is running on Host -- ${host}  Port -- ${port}`)
            return
        })
    })
    .catch((error) => {
        console.log(error)
    })















