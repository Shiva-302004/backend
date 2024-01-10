const express = require("express")
const router = express.Router()
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config()
const port = process.env.PORT;
router.use(cors())
const multer = require("multer")
const path = require("path")
const modelproduct = require("../models/productsmodel")
const clc = require("cli-color")
router.get("/", (req, res) => {
    res.send("hi")
})
// image storage engine
const storage = multer.diskStorage({
    destination: "./uploads/images",
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({ storage: storage })

//creating upload endpoint for images

router.post("/uploadimage", upload.single('product'), (req, res) => {
    // const img=req.params
    res.status(201).json({
        "msg": "image uploaded successfully",
        "success": true,
        "image_url": `https://localhost:8000/images/${req.file.filename}`
    })
})

router.post("/addproduct", async (req, res) => {
    
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

router.post("/removeproduct", async (req, res) => {
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
router.get("/allproducts", async (req, res) => {
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





module.exports = router;