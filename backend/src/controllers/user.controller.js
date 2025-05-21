import User from "../models/user.model.js";
import Book from "../models/book.model.js";

//Get all users (admin only)
export const getAllUsers = async (req,res,next) =>{
    try {
     console.log('Fetching all users with their books...');
     const users = await User.find().select('-password');
     
     // Get books for each user
     const usersWithBooks = await Promise.all(users.map(async (user) => {
       console.log(`Fetching books for user: ${user._id}`);
       
       // First check if there are any books for this user
       const bookCount = await Book.countDocuments({ user: user._id });
       console.log(`Found ${bookCount} books for user ${user._id}`);
       
       // Then fetch the actual books
       const books = await Book.find({ user: user._id })
         .select('title author coverImage publishedDate tags description')
         .sort({ createdAt: -1 })
         .lean();
       
       console.log('Books found:', books);
       
       const userData = {
         ...user.toObject(),
         books,
         bookCount
       };
       
       console.log('User data with books:', {
         userId: user._id,
         bookCount: books.length,
         hasBooks: books.length > 0,
         firstBook: books[0] || 'No books'
       });
       
       return userData;
     }));

     console.log('Sending response with users and their books');
     res.status(200).json(usersWithBooks);  
    } catch (error) {
        console.error('Error in getAllUsers:', error);
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
      
      //Prevent admin from changing their own role
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
      console.log('Toggle user status request:', { userId, body: req.body });
      
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

      console.log('User status updated:', { userId, newStatus: user.isActive });

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });
    } catch (error) {
        console.error('Error in toggleUserStatus:', error);
        next(error);
    }
};