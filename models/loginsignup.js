const mongoose=require("mongoose")
const validator=require("validator")
const usersingup=new mongoose.Schema({
    name:{
        type:String,
        minlength:1,
        required:[true,"this name field is required"]
    },
    email:{
        type:String,
        required:[true,"this feild is required"],
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("please enter a valid email")
            }
        }
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now()
    },
    cartData:{
        type:Object
    }
})
const modeluser=new mongoose.model("User",usersingup)
module.exports=modeluser