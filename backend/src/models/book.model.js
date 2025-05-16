import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required:[true, 'Title os required'],
        trim:true,
    },
    description:{
        type:String,
        required:[true, 'Description is required'],
        trim:true,
    },
    author:{
        type:String,
        required:[true, 'Author is required'],
        trim:true
    },
    tags:[{
        type:String,
        trim:true
    }],
    coverImage:{
        url:String,
        publicId:String,
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    averageRating:{
        type:Number,
        default:0,
        min:0,
        max:5,
    },
    reviewCount:{
        type:Number,
        default:0
    }
},{
    timestamps:true
});

//Virtual for getting reviews
bookSchema.virtual('review',{
    ref:'Review',
    localField:'_id',
    foreignField:'book',
});

//Set virtuals inJSON
bookSchema.set('toJSON', {virtuals:true});
bookSchema.set('toObject', {virtuals:true});

const Book = mongoose.model('Book', bookSchema);

export default Book;