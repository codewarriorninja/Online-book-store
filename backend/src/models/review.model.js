import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    rating:{
        type:Number,
        required:[true, 'Ratingis is required'],
        min:1,
        max:5
    },
    comment:{
        type:String,
        required:[true, 'Comment is required'],
        trime:true
    },
    book:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Book',
     required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true
});

//Prevent duplicate reviews from the same user for the same book
reviewSchema.index({book:1, user: 1}, {unique:true});

//Static method to calcu;ate averate rating for a book
reviewSchema.statics.calculateAverageRating = async function(bookId){
    const stats = await this.aggregate([
        {$math:{book:bookId}},
        {
            $group:{
                _id:'$book',
                averageRating: {$avg: '$rating'},
                reviewCount:{$sum:1},
            },
        },
    ]);

    if(stats.length > 0){
        await mongoose.model('Book').findByIdAndUpdate(bookId,{
            averageRating: stats[0].averageRating.toFixed(1),
            reviewCount: stats[0].reviewCount,
        });
    }else{
        await mongoose.model('Book').findByIdAndUpdate(bookId, {
            averageRating:0,
            reviewCount:0,
        });
    }
};

//Call calculateAverageRating after save
reviewSchema.post('save', function(){
    this.constructor.calculateAverageRating(this.book);
});

//Call calculateAverageRating after remove
reviewSchema.post('remove', function(){
    this.constructor.calculateAverageRating(this.book);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;