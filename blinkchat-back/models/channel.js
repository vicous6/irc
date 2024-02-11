import mongoose from "mongoose"

const channelSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true },
    author: {type: String, required: true},
    users: [{type: String}]
})

const Channel = mongoose.model('Channel', channelSchema)
export default Channel