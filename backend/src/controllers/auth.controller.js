import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'


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

    // // Record user signup in inventory
    // await Inventory.findOneAndUpdate(
    //   { date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    //   {
    //     $inc: { newUsersThisWeek: 1 },
    //     $push: {
    //       userActivities: {
    //         activityType: 'signup',
    //         user: user._id,
    //         timestamp: new Date(),
    //       },
    //     },
    //   },
    //   { upsert: true, new: true }
    // );

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