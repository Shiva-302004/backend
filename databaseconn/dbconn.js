const mongoose=require("mongoose")
const clc=require("cli-color")
const dotenv=require("dotenv")
dotenv.config()
const user=process.env.USER_OF_MONGO
const password=process.env.PASSWORD_OF_MONGO
const uri = `mongodb+srv://${user}:${password}@atlascluster.gw1or1c.mongodb.net/shopping-app?retryWrites=true&w=majority`;

const db=async()=>{
    try{
       await mongoose.connect(uri)
       console.log(clc.bgGreen.blue("database connected"))
    }catch(err){
        console.log(clc.bgRed.red(err))
    }
}
module.exports=db