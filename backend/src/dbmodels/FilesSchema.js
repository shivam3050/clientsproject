import mongoose, {Schema} from "mongoose";

const filesSchema = new Schema(
    {
        fileid:{
            type:String,
            required:true
        },
        filename:String,
        virtualparent:String,
        virtualbranch:String,
        userid:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
        filesize:Number
    }
)
export const File = mongoose.model("File",filesSchema)