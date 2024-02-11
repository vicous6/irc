import mongoose from "mongoose"

const userSchema = mongoose.Schema({
    username: { type: String, required: true, unique: true },
})

const Channel = mongoose.model('User', userSchema)
export default Channel