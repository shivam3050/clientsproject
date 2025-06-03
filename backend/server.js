import dotenv from 'dotenv';
dotenv.config();
import mongoose from "mongoose";
import express, { json } from "express";
import cors from "cors"

import {google} from "googleapis"

const connectDB = async ()=>{
try {
        const connectionAttempt = await mongoose.connect(`${process.env.MONGODB_URI}`,
            {
                dbName: process.env.DATABASE_NAME,
                serverSelectionTimeoutMS: 5000,        
                retryWrites: true,
            }
        )
        const dbname = mongoose.connection.name;
        const db = dbname
        console.log(db)
    
} catch (error) {
    throw new Error(error)
}}

connectDB()
.then(()=>{
    console.log(`!! MongoDB connected successfully , DB : ${process.env.DATABASE_NAME}`)
    const app = express();

    const host = process.env.HOST || "0.0.0.0"
    const port = process.env.PORT || 8000
    app.use(cors())
    app.get("/",(req,res)=>{
        console.log("Request came from : "+req.hostname)
        res.send("Ok i recieved the request.")
        return
    })

    app.listen(port,host, ()=>{
        console.log(`Server is listening on the ${host}:${port}`)
        return
    })
})
.catch((error)=>{
    console.log("Server will not be started. ", error)
})

        
        


