const jwt = require("jsonwebtoken")

// Protect routes middleware
const authMiddleware = (req,res,next)=>{
    const token = req.query.token
    if(!token){
        return res.status(401).json({message:"Token missing"})
    }
    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded;
    } catch (error) {
    return res.status(401).json({message:"Invalid or Expired Token"})    
    }
}

module.exports = authMiddleware;