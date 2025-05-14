import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

//Protect routes - verify token
export const protect = async(req,res,next) => {
    try {
     let token;
     
     //Get token from cookies
     if(req.cookies && req.cookies.jwt){
        token = req.cookies.jwt;
     }

     //check if token exists
     if(!token){
        return res.status(401).json({ message: 'Not authorized, no token' });
     }

     //Verify token
     const decoded = jwt.verify(token, process.env.JWT_SECRET);

     //Get user from token
     const user = await User.findById(decoded.id).select('-password');

     if(!user){
        return res.status(401).json({ message: 'User not found' });
     }

     if(!user.isActive){
        return res.status(401).json({ message: 'Your account has been deacivated'});
     }

     //Set user in request
     req.user = user;
     next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

//Admin middleware
export const admin = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        res.status(403).json({message:'Not authorized as an admin'})
    }
}