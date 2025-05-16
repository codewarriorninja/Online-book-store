import User from "../models/user.model.js";

//Get all users (admin only)
export const getAllUsers = async (req,res,next) =>{
    try {
     const users = await User.find().select('-password');
     res.status(200).json(users);  
    } catch (error) {
        next(error);
    }
}

//Get user by ID (admin only)
export const getUserById = async(req,res,next) =>{
    try {
      const user = await User.findById(req.params.id).select('-password'); 
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}

//Update user role (admin only)
export const updateUserRole = async(req,res,next) =>{
    try {
      const {role} = req.body;
      const userId = req.params.id;
      
      //Prevent admin from changin their own role
      if(userId === req.user._id.toString()){
        return res.status(400).json({message:'You cannot change your own role'});
      }

      const user = await User.findByIdAndUpdate(
        userId,
        {role},
        {new:true, runValidators:true}
      ).select('-password');

      if(!user){
        return res.status(404).json({message:'User not found'});
      }
      
      res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

//Deactivate/activate user account(admin only)
export const toggleUserStatus = async(req,res,next) =>{
    try {
      const userId = req.params.id;
      
      // Prevent admin from deactivating their own account
      if (userId === req.user._id.toString()) {
        return res.status(400).json({ message: 'You cannot deactivate your own account' });
      }

      const user = await User.findById(userId);

      if(!user){
        return res.status(404).json({message:'User not found'});
      }

      //Toggle isActive status
      user.isActive = !user.isActive;
      await user.save();

      res.status(200).json({
        _id:user._id,
        name:user.name,
        email:user.email,
        role:user.role,
        isActive:user.isActive
      });
    } catch (error) {
        next(error);
    }
};