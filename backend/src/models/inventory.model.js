import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    totalBooks: {
      type: Number,
      default: 0,
    },
    booksByCategory: [
      {
        tag: String,
        count: Number,
      },
    ],
    newBooksThisWeek: {
      type: Number,
      default: 0,
    },
    newUsersThisWeek: {
      type: Number,
      default: 0,
    },
    userActivities: [
      {
        activityType: {
          type: String,
          enum: ['signup', 'book_added', 'book_deleted', 'review_added'],
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        book: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Book',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;