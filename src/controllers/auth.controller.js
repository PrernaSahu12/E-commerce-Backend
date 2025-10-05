const User = require("../models/User");
const jwt = require("jsonwebtoken");

// generate JWT

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// register

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ msg: "User already exist" });

    const user = await User.create({ name, email, password });

    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
// Login
exports.login = async (req,res)=>{
    const {email, password} = req.body

    try {
        const user = await User.findOne({email})
        if(!user) return  res.status(400).json({msg:"Invalid credentials"})

            const isMatch = await user.matchPassword(password)
            if(!isMatch)  return res.status(400).json({msg:"Invalid Credentials"})

                const token = generateToken(user)
                res.status(200).json({
                    token,
                    user:{id:user._id,
                        name:user.name,
                        email:user.email,
                        role:user.role
                    }
                })
    } catch (err) {
        res.status(500).json({msg:"Server Error", error:err.message})
    }
}