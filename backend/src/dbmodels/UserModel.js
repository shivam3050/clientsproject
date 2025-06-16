import mongoose, {Schema} from "mongoose";

const userSchema = new Schema(
    {
        username:
        {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        password:
        {
            type: String,
            required: [true, 'Password is required'],
            trim: true, 
        },
        email:
        {
            type: String,
            trim:true
        },
        fullname:
        {
            type: String
        },
        refreshToken: {
            type: String
        },
        googleRefreshToken: {
            type: String
        },
        fileid: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "File"
        }
    }
)


export const User = mongoose.model("User", userSchema)