const express = require("express")
const Product = require("../models/Product")
const authMiddleware = require("../middleware/auth.middleware")
const router = express.Router()


// Create Product (Admin Only)
router.post("/",authMiddleware, async(req,res)=>{
  try {
    const {name, description, price, category, stock, images} = req.body
    // only admin check(assuming user.role exists)
    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Access denied"})
    }
    const product = await Product.create({
      name,
      description,
      stock,
      images,
      price,
      category,
      createdBy:req.user.id,
    })
    res.status(201).json(product)
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})
// Get All Products
router.get("/", async(req,res)=>{
  try {
    const products = await Product.find()
    res.json(products)
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})
// Get Single Product
router.get("/:id", async(req,res)=>{
  try {
    const product = await Product.findById(req.params.id);
    if(!product)
      return res.status(404).json({message:"Product not found"})
    res.json(product)
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})

// Update Product (Admin Only)
router.put("/:id",authMiddleware , async(req,res)=>{
  try {
    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Access denied"})
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new:true, runValidators:true}
    )
    if(!product)
      return res.status(404).json({message:"product not found"})
    res.json(product)
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})

//  Delete Product (Admin Only)
router.delete("/:id", authMiddleware, async(req,res)=>{
  try {
    if(req.user.role !== "admin"){
      return res.status(403).json({message:"Access denied"})
    }
    const product = await Product.findByIdAndDelete(req.params.id)
    if(!product)
      return res.status(404).json({message:"Product not found"})
    res.json({message:"Product Deleted Successfully"})
  } catch (error) {
    res.status(500).json({message:error.message})
  }
})


module.exports = router;