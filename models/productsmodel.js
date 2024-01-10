const mongoose=require("mongoose")

const Product=new mongoose.Schema({
       id:{
        type:Number,
        // required:[true,"this feild is required"], 
       } ,
       name:{
        type:String,
        required:[true,"this feild is required"],
        minLength:7,
        maxLength:50
       },
       image:{
        type:String,
        required:[true,"thius is required"]
       },
       category:{
        type:String,
        required:[true,"thius is required"]
       },
       new_price:{
        type:Number,
        required:[true,"this is required"]
       },
       old_price:{
        type:Number,
        required:[true,"this is required"]
       },
       date:{
        type:Date,
        default:Date.now()
       },
       available:{
        type:Boolean,
        required:true,
        default:true
       }
})
const modelproduct=new mongoose.model("Product",Product)
module.exports=modelproduct