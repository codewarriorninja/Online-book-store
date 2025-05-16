import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import Inventory from '../models/inventory.model.js';

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRES_IN
    });
};

//Set cookie with jwt
const sendTokenCookie = (res, token) => {
    const cookieOptions = {
        httpOnly:true,
        sameSite:'strict',
        secure:process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie('jwt', token, cookieOptions);
}

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Record user signup in inventory
    await Inventory.findOneAndUpdate(
      { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      {
        $inc: { newUsersThisWeek: 1 },
        $push: {
          userActivities: {
            activityType: 'signup',
            user: user._id,
            timestamp: new Date(),
          },
        },
      },
      { upsert: true, new: true }
    );

    // Generate token
    const token = generateToken(user._id);
    sendTokenCookie(res, token);

    // Return user data without password
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

//Login user
export const login = async(req,res,next) => {
  try {
   const {email,password} = req.body;
   
   //Find user and include password for comparison
   const user = await User.findOne({email}).select('+password');

   //Check if user exists and compare password
   if(!user || !(await user.comparePassword(password))){
    return res.status(401).json({message:'Invalid email or password'});
   }

   //Check if a user active or not
   if(!user.isActive){
    return res.status(401).json({message:'Your account has been deactivated'});
   }

   //Generate token
   const token = generateToken(user._id);
   sendTokenCookie(res,token);

   //Return user data without password
   res.status(200).json({
    _id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    isActive:user.isActive,
   })
  } catch (error) {
    next(error);
  }
};

//Logout user
export const logout = async(req,res) => {
  res.cookie('jwt','',{
    expires:new Date(0),
    httpOnly:true,
  });
  res.status(200).json({message:'Logged out successfully'});
};

//Get current user profile
export const getCurrentUser = async(req,res)=>{
  res.status(200).json(req.user);
}

//Update user profile
export const updateProfile = async(req,res,next) =>{
  try {
    const {name, email, password} = req.body;
    const userId = req.user._id;

    //Buid update object
    const updateData = {};
    if(name) updateData.name = name;
    if(email) updateData.email = email;

    //Find and update user
    let user = await User.findById(userId);

    if(!user){
      return res.status(404).json({message:'User not found'});
    }

    //Update password if provided
    if(password){
      user.password = password;
      await user.save();
    }

    //Update other fields
    if(Object.keys(updateData).length > 0){
      user = await User.findByIdAndUpdate(userId, updateData,{
        new:true,
        runValidators:true,
      });
    }

    res.status(200).json({
      _id:user._id,
      name:user.name,
      email:user.email,
      role:user.role,
      isActive:user.isActive
    })
  } catch (error) {
    next(error);
  }
}
