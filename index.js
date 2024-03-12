const express=require("express");
const clc=require("cli-color");
const dotenv=require("dotenv")
const jwt=require("jsonwebtoken")
const db=require("./databaseconn/dbconn")
dotenv.config()
const port=process.env.PORT;
const secret_key=process.env.JWT_SECRET_KEY;
const app=express();
const path=require("path")
const bodyParser=require("body-parser")
const multer = require("multer")
const cors=require("cors")
const modelproduct = require("./models/productsmodel")
const modeluser=require("./models/loginsignup")
const bcryptjs=require("bcryptjs")
// const app=require("../routes/app")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({limit:'50mb',extended:true,parameterLimit:1000000}))
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({extended:false}))
// app.use(app)
app.get("/", (req, res) => {
    res.send("hi")
})

app.use("/images",express.static('uploads/images'))

// image storage engine
const storage = multer.diskStorage({
    destination: "./uploads/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })

//creating upload endpoint for images
console.log(__dirname+'/uploads/images')
// app.use("/images",express.static(__dirname+'/uploads/images/'))
app.post("/uploadimage", upload.single('product'), (req, res) => {
    // const img=req.params
    res.status(201).json({
        "msg": "image uploaded successfully",
        "success": true,
        "image_url": `${process.env.SERVER}/images/${req.file.filename}`
    })
})

app.post("/addproduct", async (req, res) => {
    
        const { name, new_price, old_price, image, category, available } = req.body
        let idd = await modelproduct.find({})
        let id;
        if (idd.length > 0) {
            let lastproductarray = idd.slice(-1);
            let lastproduct = lastproductarray[0]
            id = lastproduct.id + 1
        } else {
            id = 1;
        }
    try{
        if(name.length>=7){  
        const product = new modelproduct({ id: id, name, new_price, old_price, image, category, available })
        const new_product = await product.save()
        console.log(new_product)
        res.status(201).json({
            success: "true",
            msg: "new product added",
            data: new_product,
            name: name
        })}
        else{
            res.status(401).json({
                msg:"name should me greater than 7"
            })
        }
    }catch(err){
        res.status(401).json({
            msg:err
        })
    }
    
        
    
}
)

//creating api for deleting product

app.post("/removeproduct", async (req, res) => {
    try {
        const { id, name } = req.body
        if (id) {
            const data = await modelproduct.findOneAndDelete({ id })
            if (data) {
                console.log(clc.bgBlue.red("removed"))
                res.status(200).json({
                    success: true,
                    msg: "item deleted succefully",
                    desc: data,
                    namefromdata: data.name,
                    namefromuser: name
                })
            } else {
                res.status(401).json({
                    msg: "some error occured",
                    desc: "product not found",
                    success: 0
                })
            }
        } else {
            res.status(400).json({
                msg: "request not received ",
                desc: 'plese provide an id'
            })
        }
    }
    catch (err) {
        res.status(401).json({
            msg: "some error occured while delteting the product",
            desc: err
        })
    }
})
//creating api for geting all product
app.get("/allproducts", async (req, res) => {
    try {

        const data = await modelproduct.find()
        if (data.length >= 1) {
            res.status(201).json(
                data
            )
        } else {
            res.status(201).json({
                msg: "there is nothing to show",
                dsec: "please add some product to get it"
            })
        }
    } catch (err) {
        res.status(401).json({
            msg: err,
            desc: "some error occured"
        })
    }
})

//creating the user

app.post("/signup",async(req,res)=>{
    try{
        const {email,name,password}=req.body
        const data=await modeluser.findOne({email})
        if(data){
            res.status(401).json({
                success:"false",
                msg:"user already exist",
                desc:"please try with another email"
            })
        }else{
            let cart={}
            for(let i=0;i<300;i++){
                cart[i]=0;
            }
            const hashedpassword=await bcryptjs.hash(password,10)
            const newuser=new modeluser({name,email,password:hashedpassword,cartData:cart})
            const userdata=await newuser.save()
            const payload={user:
                {
                    id:userdata._id,
                }
            }
            const auth_token=await jwt.sign(payload,secret_key)
            res.json({
                success:"true",
                data:userdata,
                token:auth_token,
                msg:"new user created successfully"
            })
        }
    }catch(err){
        res.status(400).json({
            msg:err,
            desc:"cant run the try block of singnup"
        })
    }
})
app.post("/login",async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await modeluser.findOne({email})
        if(!user){
            res.status(400).json({
                success:false,
                msg:"invalid credentials"
            })
        }else{
            const isMatch=await bcryptjs.compare(password,user.password)
            if(isMatch==false){
                res.status(201).json({
                    msg:"enter valid password",
                    success:false
                })
            }else{
                const payload={
                    user:{
                        id:user._id
                    }
                }
                const token = await jwt.sign(payload,secret_key)
                res.status(201).json({
                    success:true,
                    token:token,
                    data:user
                })
            }
        }
    }catch(err){
        res.status(400).json({
            msg:err,
            desc:"cant run the try block of singnup"
        })
    }
})
///creating endpoint for new collections
app.get("/newcollections",async(req,res)=>{
    try{
        const data=await modelproduct.find({})
        const datanew=await data.slice(1).slice(-8)
        res.status(200).json(datanew)
    }catch(err){
        res.status(400).json({msg:err})
    }
})
app.get("/popularinwomencollections",async(req,res)=>{
    try{
        const data=await modelproduct.find({category:"women"})
        const datanew=await data.slice(0,5)
        res.status(200).json(datanew)
    }catch(err){
        res.status(400).json({msg:err})
    }
})
app.get("/popularinmencollections",async(req,res)=>{
    try{
        const data=await modelproduct.find({category:"men"})
        const datanew=await data.slice(0,5)
        res.status(200).json(datanew)
    }catch(err){
        res.status(400).json({msg:err})
    }
})
app.get("/popularinchildrencollections",async(req,res)=>{
    try{
        const data=await modelproduct.find({category:"kid"})
        const datanew=await data.slice(0,5)
        res.status(200).json(datanew)
    }catch(err){
        res.status(400).json({msg:err})
    }
})
//middleware for add to cart
const fetchUser=async(req,res,next)=>{
    const token=req.header('auth-token')
    if(!token){
        res.status(401).json({msg:"please authenticate"})
    }else{
        try{
            const data= jwt.verify(token,secret_key)
            req.user= data.user
            next()
        }
        catch(err){
            res.status(400).json({msg:"error while running try block of middle ware"})
        }
    }
}

//endpoint for add to cart
app.post("/addtocart",fetchUser,async(req,res)=>{
    console.log(req.body,req.user.id);
    let userData=await modeluser.findOne({_id:req.user.id})
    userData.cartData[req.body.itemId]+=1
    const neww=await modeluser.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
    res.json({msg:"added"})
})
//endpoint to remove data from cart
app.post("/removefromcart",fetchUser,async(req,res)=>{
    let userData=await modeluser.findOne({_id:req.user.id})
    // console.log(userData)
    if(userData.cartData[req.body.itemId]>0){
    userData.cartData[req.body.itemId]-=1
    const neww=await modeluser.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData})
        // console.log(neww)
    res.json({msg:"removed"})
    }else{
        res.json({msg:"no item present"})
    }
})
app.get("/getcart",fetchUser,async(req,res)=>{
    let userData=await modeluser.findOne({_id:req.user.id})
    console.log(userData)
    res.json(userData.cartData)
})
db().then(
app.listen(port,()=>{
    console.log(clc.bgGreen.blue(`app started at port ${port}`))
})
).catch(
    (err)=>{
        console.log(clc.red.bgRed("err in running app",err))
    }
)