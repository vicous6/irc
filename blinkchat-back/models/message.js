import mongoose from "mongoose"

const messageSchema = mongoose.Schema({
    text: {type: String, required: true},
    author: {type: String, required: true},
    date: {type: Date, required: true},
    channelName: {type: String, required: true},
    recipient: {type: String},
    commandResult: {type: String, enum: ["success", "error"]} // only used when we need to display the result of a command
})

const Message = mongoose.model('Message', messageSchema)
export default Message