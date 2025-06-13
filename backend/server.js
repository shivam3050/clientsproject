import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import cors from "cors";
import { URLSearchParams } from 'url';
import fetch from "node-fetch"
import { User } from './src/dbmodels/UserModel.js';
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import stream from "stream"
import fs from "fs"
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
        // console.log(await testDriveAccess.json())
        return testDriveAccess
    } catch (error) {
        console.log(error)
        return null
    }
}

async function findUserByUsername(username) {
    try {
        const user = await User.findOne({
            username: username
        })
        console.log("from function ", user.username)
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
            expiresIn: "1m"
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

async function updateRefreshTokensInDatabase(username, newRefreshToken, newGoogleRefreshToken) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $set: {
                    refreshToken: newRefreshToken,
                    googleRefreshToken: newGoogleRefreshToken
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}

async function unsetRefreshTokensInDatabase(username) {
    try {
        const user = await User.findOneAndUpdate(
            {
                username: username
            },
            {
                $unset: {
                    refreshToken: 1,
                    googleRefreshToken: 1
                }
            }
        )
        return user
    } catch (error) {
        return null
    }
}
async function pushFileInfoInDatabase(userId, fileId, fileName, virtualParent, fileSize) {
    try {
        const fileInfo = await File.create(
            {
                userid: userId,
                fileid: fileId,
                filename: fileName,
                virtualparent: virtualParent,
                filesize: fileSize
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
        const dbname = mongoose.connection.name;
        console.log(dbname)


    } catch (error) {
        throw new Error(error)
    }
}

connectDB()
    .then(() => {
        console.log(`!! MongoDB connected successfully , DB : ${process.env.DATABASE_NAME}`)
        const app = express();
        const host = process.env.HOST || "0.0.0.0"
        const port = process.env.PORT || 8000
        app.use(cors({
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            credentials: true
        }))
        app.use(express.json());
        app.use(cookieParser());
        app.use(session({
            secret: 'your-secret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,            // only true if you're using HTTPS
                httpOnly: true,
                sameSite: 'lax'           // must allow redirects
            }
        }));
        app.get("/", (req, res) => {
            console.log("Request came from : " + req.hostname)
            res.send("Ok i recieved the request.")
            return
        })


        app.post("/refresh-access-token", async (req, res) => {
            //input refresh token
            //input body username
            //output username fullname accessToken
            const refreshToken = req.cookies?.refreshToken
            // const username = req.body.username

            if (!refreshToken) {
                console.log("refresh token not found")
                return res.status(404).send("refresh token not found")
            }
            const status = verifyRefreshToken(refreshToken)
            if (!status) {
                console.log("Invalid refresh token")
                return res.status(401).send("Invalid refresh token")
            }

            let user = await findUserByUsername(status.username)
            if (!user) {
                console.log("User not found in db")
                return res.status(404).send("User not found in db")
            }
            const newRefreshToken = generateRefreshToken(user.username)

            user = await updateRefreshTokensInDatabase(user.username, newRefreshToken)
            if (!user) {
                console.log("you need to manually login")
                return res.status(501).send("you need to manually login")
            }

            const newAccessToken = generateAccessToken(user.username)
            const options = {
                httpOnly: true,
                secure: true
            }
            console.log("generated new access token")
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
            console.log("username login route called")
            // requires {username,password}
            //output username fullname accessToken
            try {
                if (mongoose.connection.readyState !== 1) {
                    res.status(501).send("Not connected to MongoDB");
                    return;
                }


                const userCount = await User.countDocuments();
                console.log("Usercount>>", userCount)
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
                    console.log("admin saved")
                } else {
                    console.log("exists an admin")
                }






                //     // List all collections in the current DB
                // const collections = await mongoose.connection.db.listCollections().toArray();
                // console.log("Collections in DB:", collections.map(c => c.name));
                // // Optionally, log all users in the 'users' collection (if it exists)
                // if (collections.some(c => c.name === 'users')) {
                //   const users = await mongoose.connection.db.collection('users').find().toArray();
                //   console.log("Users in 'users' collection:", users);
                // } else {
                //   console.log("No 'users' collection found in DB");
                // }







                // FROM BELOW IS THE MAIN CODE









                const { username, password } = req.body;
                if (!(username && password)) {
                    return res.status(400).send("Username and Password are required")
                };
                const user = await findUserByUsername(username)
                if (!user) {
                    return res.status(404).send("User not found")
                }

                if (user.password === password) {
                    console.log("password is also correct")

                    // const newAccessToken = generateAccessToken(username)
                    // const newRefreshToken = generateRefreshToken(username)

                    const options = {
                        httpOnly: true,
                        secure: true
                    }

                    req.session.tempUser = {
                        username: user.username,      // 🔸 Custom username stored here
                        fullname: user.fullname,

                    };
                    res.status(200).send("ok");
                    // res.redirect("/testapi")
                    return;



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
            const user = await unsetRefreshTokensInDatabase(decodedAccessToken.username)
            if (!user) {
                return res.status(404).send("user not found on db")
            }
            const options = {
                httpOnly: true,
                secure: true
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
            const comingAccessToken = await req.cookies?.accessToken
            const comingGoogleAccessToken = await req.cookies?.googleAccessToken
            if (!comingAccessToken) {
                res.status(404).send("Access token is not available")
                return;
            }
            if (!comingGoogleAccessToken) {
                res.status(404).send("Google access token is not available")
                return;
            }
            const decodedAccessToken = verifyAccessToken(comingAccessToken)
            // console.log(JSON.stringify(decodedAccessToken))
            if (!decodedAccessToken) {
                console.log("expired access token")
                return res.status(401).send("expired access token")
            }
            const user = await findUserByUsername(decodedAccessToken.username)
            if (!user) {
                return res.status(404).send("User not found in db")
            }

            req.session.tempUser = {
                username: user.username,      // 🔸 Custom username stored here
                fullname: user.fullname,
            };
            console.log("ok send kr dia gya adminautologin se")
            res.status(200).send("ok");
            return

        });
        app.get("/test-google-access-token", async (req, res) => {
            console.log("test google called")
            const comingGoogleAccessToken = req.cookies?.googleAccessToken
            if (!comingGoogleAccessToken) {
                console.log("google access token is not available test google access token")
                return res.status(404).send("google access token is not available test google access token")
            }
            const testDriveAccess = await verifyGoogleAccessToken(comingGoogleAccessToken)
            if (!testDriveAccess) {
                console.log("google access token has been expired")

                return res.status(401).send("google access token has been expired")
            }
            const frontendURL = process.env.FRONTEND_URL;
            const tempUser = req.session.tempUser
            console.log("test- google - access - token se bhi ok send kr dia gya")
            res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
            res.setHeader("Access-Control-Allow-Credentials", "true");

            // return res.redirect(`${frontendURL}/admindashboard?username=${encodeURIComponent(tempUser.username)}&fullname=${encodeURIComponent(tempUser.fullname)}`);
            return res.json({
                success: true,
                redirectUrl: `${frontendURL}/admindashboard?username=${tempUser.username}&fullname=${tempUser.fullname}`
            });

        })

        app.get("/first-google-login-redirector", async (req, res) => {
            const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
            // const REDIRECT_URI = 'https://clientsprojectfrontend.onrender.com/';
            const REDIRECT_URI = 'http://localhost:8000/oauth2callback';
            // let scope = ['email', 'profile'].join(' ');
            // let scope = "https://www.googleapis.com/auth/drive.metadata.readonly";
            let scope = "https://www.googleapis.com/auth/drive"

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
            console.log("triggered")
            const code = req.query.code
            if (!code) {
                return res.status(400).send("No temporary code received");
            }

            const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
            const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
            const REDIRECT_URI = 'http://localhost:8000/oauth2callback';  // must match the one used earlier

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
            // console.log("Token response:", tokenData);

            const tempUser = req.session.tempUser;
            if (!tempUser) return res.status(401).send("Session expired");

            const appAccessToken = generateAccessToken(tempUser.username);
            const appRefreshToken = generateRefreshToken(tempUser.username);

            const updatedUser = await updateRefreshTokensInDatabase(tempUser.username, appRefreshToken, newGoogleRefreshToken)
            if (!updatedUser) {
                return res.status(404).send("user not in db while updating tokens in db")
            }

            const options = {
                httpOnly: true,
                secure: true
            }
            const frontendURL = process.env.FRONTEND_URL;
            res.status(200)
                .cookie("accessToken", appAccessToken, options)
                .cookie("refreshToken", appRefreshToken, options)
                .cookie("googleAccessToken", newGoogleAccessToken, options)
                .cookie("googleRefreshToken", newGoogleRefreshToken, options)
            // .json({ access_token: tokenData.access_token })
            res.redirect(`${frontendURL}/admindashboard?username=${encodeURIComponent(tempUser.username)}&fullname=${encodeURIComponent(tempUser.fullname)}`); console.log("i sent it")
            // res.send("ok ok"||"i have changed permissions of file")
            return;
        });

        app.post("/refresh-google-access-token", async (req, res) => {
            console.log("call hua google acces token refrsher")
            const comingGoogleRefreshToken = req.cookies?.googleRefreshToken
            if (!comingGoogleRefreshToken) {
                console.log("no refrsh token sent")
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
                console.log("google refresh token expired do sign in again")
                return res.status(401).send("google refresh token expired do sign in again")
            }

            if (!response.ok) {
                console.log("again refresh token expired")
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

            const googleAccessToken = req.cookies?.googleAccessToken
            const username = req.query.username
            if (!username) {
                return res.status(501).send("No username send")
            }
            if (!googleAccessToken) {
                console.log("No google access token send")
                return res.status(401).send("No google access token send")
            }

            const FOLDER_NAME = "AdminCloudBase"
            const folderSchema = {
                name: FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
                parents: ["root"]
            }

            const query = encodeURIComponent(`name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and 'root' in parents and trashed=false`);
            let driveResponse;
            try {
                driveResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`
                    }
                });
            } catch (error) {
                console.log("expired token of fetching error")
                return res.status(401).send("expired token of fetching error")

            }

            let data = await driveResponse.json();
            if (data.files.length > 1) {
                return res.status(406).send(`'${data.files[0].id}' many folders already exists`)
            }
            if (data.files.length > 0) {
                console.log("one folder already exits")
                const folderId = data.files[0].id
                console.log(typeof folderId, " << typeof folderId")
                console.log(folderId)
                const user = await findUserByUsername(username)

                if (!user) {
                    console.log("HERE I WILL UNDO FOLDER CREATION")
                    return res.status(405).send("user not found when creating database")
                }

                return res.status(200).json({ "folderId": folderId })
            }
            let createFolder;
            try {
                createFolder = await fetch("https://www.googleapis.com/drive/v3/files", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${googleAccessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(folderSchema),
                });
            } catch (error) {
                return res.status(401).send("expired access token")
            }

            const createdData = await createFolder.json()
            console.log(typeof createdData, " << typeof folderId")
            console.log(createdData)

            return res.status(201).json({ folderCreatedId: createdData.id })


        })

        app.post("/uploadfile", async (req, res) => {  // mycode
            // const accesstoken = req.cookies?.googleAccessToken;
            // const parentfolderid = req.query?.parentFolderId;
            // const username = req.query?.username
            // const filename = req.headers['x-file-name']
            // const virtualparent = req.query?.virtualParent
            // const totalSize = parseInt(req.headers['content-length']);
            // const contentType = req.headers['x-mime-type']



            console.log("triggered")
            async function resumableUploadLinkCreator(accessToken, parentFolderId, fileName) {
                let response;
                try {
                    response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json; charset=UTF-8",
                            "X-Upload-Content-Type": req.headers['x-mime-type'],
                            "X-Upload-Content-Length": req.headers['x-file-size'],
                        },
                        body: JSON.stringify({
                            name: path.basename(fileName),
                            parents: [parentFolderId]
                        })
                    });
                    if (!response.ok) {
                        return null
                    }
                } catch (error) {
                    return null
                }



                const uploadUrl = response.headers.get("location");
                return uploadUrl;
            }



            const accesstoken = req.cookies?.googleAccessToken;
            const parentfolderid = req.query?.parentFolderId;
            const username = req.query?.username
            const filename = req.headers['x-file-name']
            const virtualparent = req.query?.virtualParent
            const totalSize = parseInt(req.headers['content-length']);
            const contentType = req.headers['x-mime-type']

            let uploadUrl;



            uploadUrl = await resumableUploadLinkCreator(accesstoken, parentfolderid, filename);
            if (!uploadUrl) {
                return res.status(401).send("google access to expired so upload url cannot be created")
            }







            const MIN_CHUNK_SIZE = 1024 * 1024 * 1; // 256KB
            let buffer = Buffer.alloc(0);
            let offset = 0;


            req.on("data", async (chunk) => {
                req.pause();

                buffer = Buffer.concat([buffer, chunk]);

                while (buffer.length >= MIN_CHUNK_SIZE) {
                    const currentChunk = buffer.slice(0, MIN_CHUNK_SIZE);
                    buffer = buffer.slice(MIN_CHUNK_SIZE);

                    const start = offset;
                    const end = offset + currentChunk.length - 1;

                    const contentRange = `bytes ${start}-${end}/${totalSize}`;
                    const t0 = process.hrtime.bigint(); // High-res time

                    const response = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Length': currentChunk.length.toString(),
                            'Content-Range': contentRange,
                            'Content-Type': contentType
                        },
                        body: currentChunk
                    });

                    const t1 = process.hrtime.bigint();
                    const durationSeconds = Number(t1 - t0) / 1e9; // seconds
                    const speedMBps = (currentChunk.length / (1024 * 1024)) / durationSeconds;

                    if (![200, 201, 308].includes(response.status)) {
                        const err = await response.text();
                        console.error("Chunk upload failed:", err);
                        return res.status(500).send("Upload failed");
                    }

                    console.log(`✅ Uploaded chunk: ${contentRange}`);
                    offset += currentChunk.length;
                    console.log(`Uploaded : ${((offset / totalSize) * 100).toFixed(2)}%  — Speed: ${speedMBps.toFixed(2)} MB/s`)
                }

                req.resume();
            });

            req.on("end", async () => {
                if (buffer.length > 0) {
                    const start = offset;
                    const end = offset + buffer.length - 1;
                    const contentRange = `bytes ${start}-${end}/${totalSize}`;

                    const response = await fetch(uploadUrl, {
                        method: 'PUT',
                        headers: {
                            'Content-Length': buffer.length.toString(),
                            'Content-Range': contentRange,
                            'Content-Type': req.headers['x-mime-type']
                        },
                        body: buffer
                    });

                    if (![200, 201, 308].includes(response.status)) {
                        const err = await response.text();
                        console.error("Final chunk upload failed:", err);
                        return res.status(500).send("Final upload failed");
                    }
                    const info = await response.json()

                    console.log(`Uploaded : ${(100).toFixed(2)}%`)
                    console.log(req.headers['x-file-name'], " uploaded successfully");
                    let user;
                    try {
                        user = await findUserByUsername(username)
                    } catch (error) {
                        console.log("THIS IS THE CASE WHICH WILL BE SOLVED LATER")
                        return res.status(404).send("uploaded in cloud but not linked in db")
                    }
                    const statusWithInfo = await pushFileInfoInDatabase(user._id, info.id, filename, virtualparent, totalSize)

                    res.status(200).json(statusWithInfo);

                }
            });

            req.on("error", (err) => {
                console.error("Stream error:", err);
                return res.status(500).send("Stream error");
            });

        });






        app.listen(port, host, () => {
            console.log(`Server is listening on the ${host}:${port}`)
            return
        })
    })
    .catch((error) => {
        console.log("Server will not be started. ", error)
    })