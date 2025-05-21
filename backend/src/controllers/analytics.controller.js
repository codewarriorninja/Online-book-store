import Inventory from '../models/inventory.model.js';
import Book from '../models/book.model.js';
import User from '../models/user.model.js';
import Review from '../models/review.model.js';

// Get dashboard analytics data
export const getDashboardStats = async (req, res, next) => {
  try {
    // Get today's date at midnight
    const today = new Date(new Date().setHours(0, 0, 0, 0));
    
    // Get date 7 days ago
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Get inventory data for the last 7 days
    const inventoryData = await Inventory.findOne({
      date: { $gte: lastWeek }
    }).sort({ date: -1 });
    
    // If no inventory data exists, create default response
    const stats = inventoryData || {
      totalBooks: 0,
      booksByCategory: [],
      newBooksThisWeek: 0,
      newUsersThisWeek: 0,
      userActivities: []
    };
    
    // Get total counts
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalReviews = await Review.countDocuments();
    
    // Get recent activities
    const recentActivities = await Inventory.aggregate([
      { $match: { date: { $gte: lastWeek } } },
      { $unwind: '$userActivities' },
      { $sort: { 'userActivities.timestamp': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: 'userActivities.user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: 'userActivities.book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $project: {
          _id: 0,
          activityType: '$userActivities.activityType',
          timestamp: '$userActivities.timestamp',
          user: { $arrayElemAt: ['$userDetails.name', 0] },
          book: { $arrayElemAt: ['$bookDetails.title', 0] }
        }
      }
    ]);
    
    // Get top rated books
    const topRatedBooks = await Book.find()
      .sort({ averageRating: -1 })
      .limit(5)
      .select('title author averageRating reviewCount');
    
    // Prepare response
    const dashboardData = {
      counts: {
        totalBooks,
        totalUsers,
        totalReviews,
        newBooksThisWeek: stats.newBooksThisWeek || 0,
        newUsersThisWeek: stats.newUsersThisWeek || 0
      },
      booksByCategory: stats.booksByCategory || [],
      recentActivities,
      topRatedBooks
    };
    
    res.status(200).json(dashboardData);
  } catch (error) {
    next(error);
  }
};

// Get user activity statistics
export const getUserActivityStats = async (req, res, next) => {
  try {
    const { period, actionType } = req.query;
    
    // Calculate date range based on period
    let startDate = new Date();
    switch(period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to 7 days
    }

    // Build match stage for aggregation
    const matchStage = {
      date: { $gte: startDate }
    };

    // Add activity type filter if specified
    if (actionType) {
      matchStage['userActivities.activityType'] = {
        $regex: new RegExp(actionType, 'i')
      };
    }

    // Aggregate user activities
    const userActivities = await Inventory.aggregate([
      { $match: matchStage },
      { $unwind: '$userActivities' },
      {
        $lookup: {
          from: 'users',
          localField: 'userActivities.user',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $lookup: {
          from: 'books',
          localField: 'userActivities.book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $project: {
          _id: '$userActivities._id',
          activityType: '$userActivities.activityType',
          timestamp: '$userActivities.timestamp',
          user: { $arrayElemAt: ['$userDetails', 0] },
          book: { $arrayElemAt: ['$bookDetails', 0] }
        }
      },
      { $sort: { timestamp: -1 } }
    ]);

    // Format the response
    const formattedActivities = userActivities.map(activity => ({
      _id: activity._id,
      actionType: activity.activityType,
      description: getActivityDescription(activity),
      user: activity.user ? {
        name: activity.user.name,
        email: activity.user.email
      } : null,
      book: activity.book ? {
        title: activity.book.title,
        id: activity.book._id
      } : null,
      createdAt: activity.timestamp
    }));

    res.status(200).json(formattedActivities);
  } catch (error) {
    next(error);
  }
};

// Helper function to generate activity descriptions
const getActivityDescription = (activity) => {
  const userName = activity.user?.name || 'A user';
  const bookTitle = activity.book?.title || 'a book';

  switch(activity.activityType) {
    case 'signup':
      return `${userName} created an account`;
    case 'book_added':
      return `${userName} added a new book: ${bookTitle}`;
    case 'book_deleted':
      return `${userName} deleted the book: ${bookTitle}`;
    case 'review_added':
      return `${userName} added a review for: ${bookTitle}`;
    default:
      return `${userName} performed an action`;
  }
};