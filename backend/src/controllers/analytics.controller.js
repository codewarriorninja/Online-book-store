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
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Aggregate user activities by day
    const userActivities = await Inventory.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo } } },
      { $unwind: '$userActivities' },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$userActivities.timestamp' } },
            type: '$userActivities.activityType'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              type: '$_id.type',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json(userActivities);
  } catch (error) {
    next(error);
  }
};