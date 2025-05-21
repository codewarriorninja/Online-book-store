import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { booksApi } from '../../services/api';
import { Star, User, Calendar, Tag, ArrowLeft, Loader2, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';


// Review form validation schema
const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5),
  comment: z.string().min(3, 'Comment must be at least 3 characters'),
});


const BookDetail = () => {
  const {id} = useParams();
  const {user, isAuthenticated} = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('details');

  // Fetch book details
  const { data: book, isLoading: isLoadingBook, error: bookError } = useQuery({
    queryKey: ['book', id],
    queryFn: () => booksApi.getBookById(id),
  });

  // Fetch book reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['bookReviews', id],
    queryFn: () => booksApi.getBookReviews(id),
    enabled: !!id,
  });

  // Extract reviews array from the response
  const reviews = reviewsData?.reviews || [];
  
    // Review form
    const {
      register,
      handleSubmit,
      reset,
      setValue,
      watch,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(reviewSchema),
      defaultValues: {
        rating: 0,
        comment: '',
      },
    });

    // Watch the rating value
    const currentRating = watch('rating');

    //Add review mutation
    const addReviewMutation = useMutation({
      mutationFn:(reviewData) => booksApi.addBookReview(id, reviewData),
      onSuccess: () => {
        //Invalidate both quries to refresh the data
        queryClient.invalidateQueries(['book', id]);
        queryClient.invalidateQueries(['bookReviews', id]);
        
        //Force refetch the reviews to ensure the new review is displayed
        queryClient.refetchQueries(['bookReviews', id]);
        toast.success('Review added successfully');
        reset();

        //Switch to review tab to show the newly added review
        setActiveTab('reviews');
      },
      onError:(error) => {
        toast.error(error.response?.data?.message || 'Failed to add review');
      },
    });

    const handleReviewSubmit = (data) => {
      if(!isAuthenticated){
        toast.error('You Must be logged in to leave a review');
        return;
      }

    // Prevent book creators from reviewing their own books
    if (isBookCreator) {
      toast.error('You cannot review your own book');
      return;
    }
    //Check if the user already reviewed this book
    const hasAlreadyReviewed = Array.isArray(reviews) && 
    reviews.some(review => review.user && user && review.user._id === user._id);
    if(hasAlreadyReviewed){
      toast.error('You have already reviewed this book');
      return;
    }
    addReviewMutation.mutate(data);
    };

    const handleRatingClick = (rating) => {
      setValue('rating', rating);
    };
     // Check if user is the book creator
  const isBookCreator = book?.createdBy?._id === user?._id;
   if(isLoadingBook){
    return (
      <div className='flex items-center justify-center py-20'>
        <Loader2 className='h-8 w-8 text-[#0284c7] animate-spin'/>
        <span className='ml-2 text-lg'>Loading book details.......</span>
      </div>
    );
   }

   if(bookError){
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='bg-red-50 p-4 rounded-md'>
          <p className='text-red-500'>Error loading book details. Please try again later.</p>
          <Link className='mt-4 inline-flex items-center text-[#0284c7] hover:text-[#0369a1]'>
           <ArrowLeft className='h-4 w-4 mr-1'/>
          </Link>
        </div>
      </div>
    )
   }
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <Link to={'/browse'} className='mt-4 inline-flex items-center text-[#0284c7] hover:text-[#0369a1] mb-6'>
       <ArrowLeft className="h-4 w-4 mr-1" /> Back to Browse
      </Link>
      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6'>
          {/* Book Cover */}
          <div className='md:col-span-1'>
            <img
             src={book?.coverImage?.url || `https://placehold.co/400x600?text=${encodeURIComponent(book?.title || 'Book Cover')}`}
             alt={book?.title}
             className='w-full h-auto rounded-lg shadow-md'
            />
            {book?.createdBy && (
              <div className='mt-4 p-4 bg-gray-50 rounded-md'>
                <h3 className='text-lg font-semibold mb-2'>Book Creator</h3>
                <p className='flex items-center text-gray-600 mb-2'>
                  <User className='h-4 w-4 mr-2'/>
                  {book?.createdBy?.name}
                </p>
                <p className='flex items-center text-gray-600 mb-2'>
                  <span className='inline-block w-4 mr-2'>📧</span>
                  {book?.createdBy?.email}
                </p>
                <p className="text-gray-600 mb-4">
                  Member since {book?.createdBy?.createdAt ? new Date(book.createdBy.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </p>
                {book.createdBy._id !== user?._id && (
                  <button className="w-full btn btn-primary cursor-pointer bg-[#0ea5e9] hover:bg-[#0284c7] py-1 rounded-md text-white">
                    Contact Creator
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Book details */}
          <div className='md:col-span-2'>
            <h1 className='text-3xl font-bold mb-2'>{book?.title}</h1>
            <p className='text-xl text-gray-600 mb-4'>by {book?.author}</p>
            
            {book?.averageRating && (
              <div className='flex  items-center mb-4'>
                <div className='flex text-yellow-400'>
                  {[...Array(5)].map((_,i) => (
                    <Star 
                     key={i}
                     className={`h-5 w-5 ${i < Math.round(book.averageRating) ? 'fill-current': ''}`}
                    />
                  ))}
                </div>
                <span className='text-gray-600 ml-2'>{book.averageRating.toFixed(1)} ({book.reviewCount || 0} reviews)</span>
              </div>
            )}
            
            <div className='flex items-center space-x-4 mb-6'>
              <span className='text-2xl font-bold text-[#0284c7]'>${book?.price?.toFixed(2)}</span>
            </div>
            <div className='flex flex-wrap gap-2 mb-6'>
              <div className='flex items-center text-gray-600'>
                <Calendar className='h-4 w-4 mr-1'/>
                <span>Published: {
                  book?.publishedDate 
                  ? new Date(book.publishedDate).getFullYear() > new Date().getFullYear()
                  ? 'Not specified'
                  : new Date(book.publishedDate).toLocaleDateString()
                  :book?.publishedYear || 'Not specified'
                }</span>
              </div>
              <div className='flex items-center text-gray-600'>
                <Tag className='h-4 w-4 mr-1'/>
                <span>Category: {book?.category || 'Not specified'}</span>
              </div>
            </div>
            <div className='flex items-center text-gray-600 mb-6'>
              <Tag className='h-4 w-4 mr-1'/>
              <span>Tags: #{book?.tags.join(', ')}</span>
            </div>
            {/* <div className='mb-6'>
              <button>Buy Now</button>
              <button>Add to cart</button>
            </div> */}
            {/* Tabs */}

            <div className='border-b border-gray-200 mb-6'>
              <nav className='-mb-px flex space-x-8'>
                <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'details' ? 'border-[#0284c7]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                   Description
                </button>
                <button 
                 onClick={() => setActiveTab('reviews')}
                 className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${activeTab === 'reviews' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent  text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                  Reviews ({book?.reviewCount || 0})
                </button>
              </nav>
            </div>
            {/* Tab content */}
            {activeTab === 'details' ? (
              <div>
                <h3 className='text-lg font-semibold mb-2'>Description</h3>
                <p className='text-gray-700 whitespace-pre-line'>{book?.description}</p>

                {book?.isbn && (
                  <div className='mt-4'>
                    <h3 className='text-lg font-semibold mb-2'>Book Details</h3>
                    <ul className='space-y-2 text-gray-700'>
                      <li><span className='font-medium'>ISBN:</span>{book.isbn}</li>
                      <li><span className='font-medium'>Language:</span>{book.language || 'English'}</li>
                      <li><span className='font-medium'>PageCount:</span> {book.pageCount || 'Not specified'}</li>
                    </ul>
                  </div>
                )}
              </div>
            ):(
              <div>
                <h3 className='text-lg font-semibold mb-4'>Customer Reviews</h3>
                {isAuthenticated && (
                  <div className='mb-8 p-4 bg-gray-50 rounded-md'>
                    <h4 className='text-md font-medium mb-2'>Write a Review</h4>
                    <form onSubmit={handleSubmit(handleReviewSubmit)}>
                      <div className='mb-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>Rating</label>
                        <div className='flex'>
                          {[1,2,3,4,5].map((star) => (
                            <button
                            key={star}
                            type='button'
                            onClick={() => handleRatingClick(star)}
                            className='p-1'
                             >
                              <Star className={`h-6 w-6 cursor-pointer ${star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}/>
                            </button>
                          ))}
                        </div>
                        {errors.rating && (
                          <p className='mt-1 text-sm text-red-600'>{errors.rating.message}</p>
                        )}
                      </div>
                      <div className='mb-4'>
                        <label htmlFor='comment' className='block text-sm font-medium text-gray-700 mb-1'>
                          Your Review
                        </label>
                        <textarea
                        id='comment'
                        rows={'3'}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#0ea5e9] focus:border-[#0ea5e9]'
                        placeholder='Share Your thoughts about this book....'
                        {...register('comment')}
                        ></textarea>
                        {errors.comment && (
                          <p className='text-sm text-red-600'>{errors.comment.message}</p>
                        )}
                      </div>
                      <button
                       type='submit'
                       disabled = {addReviewMutation.isLoading}
                       className='text-white bg-[#0ea5e9] px-2 py-1 rounded-md cursor-pointer'
                      >
                        {addReviewMutation.isLoading ? (
                          <>
                           <Loader2 className='h-4 w-4 mr-1 animate-spin'/>
                           Submitting.....
                          </>
                        ):(
                          'Submit Review'
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {isLoadingReviews ? (
                  <div className='flex justify-center items-center py-8'>
                    <Loader2 className='h-6 w-6 text-[#0284c7] animate-spin'/>
                    <span className='ml-2'>Loading reviews....</span>
                  </div>
                ):reviews?.length > 0 ? (
                  <div className='space-y-6'>
                    {reviews.map((review) => (
                      <div key={review._id} className='border-b border-gray-200 pb-6'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <div className='flex items-center space-x-2'>
                              <div className='flex text-yellow-400'>
                                {[...Array(5)].map((_,i) => (
                                  <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'fill-current' : ''}`}
                                  />
                                ))}
                              </div>
                              <h4 className='text-sm font-medium text-gray-900'>{review.user.name}</h4>
                            </div>
                            <p className='text-xs text-gray-500 mt-1'>{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <p className='mt-2 text-sm text-gray-700'>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ):(
                  <div className='py-6 text-center'>
                    <MessageSquare className='h-12 w-12 text-gray-300 mx-auto mb-2'/>
                    <p className='text-gray-500'>No Reviews yet. Be the first to review this book!</p>
                    {isAuthenticated && (
                      <p className='mt-2 text-sm text-gray-500'>
                        <Link to={'/signin'} className='text-[#0284c7] hover:text-[#0369a1]'>
                         Sign in
                        </Link>{' '}
                        to leave a review
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail