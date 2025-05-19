import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { booksApi } from '../../../services/api';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload, AlertCircle } from 'lucide-react';

// Form validation schema
const bookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.coerce.number().positive('Price must be positive'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  publishedDate: z.string().optional(),
  language: z.string().optional(),
  pageCount: z.coerce.number().int().positive().optional(),
  tags: z.string().optional(),
});

const AddBook = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [coverImage, setCoverImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: '',
      author: '',
      description: '',
      category: '',
      price: '',
      isbn: '',
      publishedDate: '',
      language: 'English',
      pageCount: '',
      tags: '',
    },
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: booksApi.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBooks'] });
      reset();
      setCoverImage(null);
      setImagePreview(null);
      navigate('/dashboard');
    },
  });

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cloudinary widget
  const handleCloudinaryUpload = () => {
    setUploadingImage(true);
    // Create and open the Cloudinary widget
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.REACT_APP_CLOUDINARY_CLOUD_NAME, // Replace with your Cloudinary cloud name
        uploadPreset: 'online-bookstore', // Replace with your upload preset
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
        resourceType: 'image',
      },
      (error, result) => {
        setUploadingImage(false);
        if (!error && result && result.event === 'success') {
          setCoverImage(result.info.secure_url);
          setImagePreview(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  // Form submission handler
  const onSubmit = async (data) => {
    try {
      // Process tags - convert comma-separated string to array
      const processedTags = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];
      
      // Add cover image and tags to form data
      const bookData = {
        ...data,
        tags: processedTags, // Backend expects tags as an array
        coverImage: coverImage,
      };
      
      await createBookMutation.mutateAsync(bookData);
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Add New Book</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              {...register('title')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>
          
          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author *
            </label>
            <input
              id="author"
              type="text"
              {...register('author')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.author && (
              <p className="mt-1 text-sm text-red-600">{errors.author.message}</p>
            )}
          </div>
          
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              {...register('category')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a category</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="biography">Biography</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>
              <option value="other">Other</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              id="price"
              type="number"
              step="0.01"
              min="0"
              {...register('price')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>
          
          {/* ISBN */}
          <div>
            <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
              ISBN *
            </label>
            <input
              id="isbn"
              type="text"
              {...register('isbn')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.isbn && (
              <p className="mt-1 text-sm text-red-600">{errors.isbn.message}</p>
            )}
          </div>
          
          {/* Published Date */}
          <div>
            <label htmlFor="publishedDate" className="block text-sm font-medium text-gray-700 mb-1">
              Published Date
            </label>
            <input
              id="publishedDate"
              type="date"
              {...register('publishedDate')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.publishedDate && (
              <p className="mt-1 text-sm text-red-600">{errors.publishedDate.message}</p>
            )}
          </div>
          
          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <input
              id="language"
              type="text"
              {...register('language')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>
          
          {/* Page Count */}
          <div>
            <label htmlFor="pageCount" className="block text-sm font-medium text-gray-700 mb-1">
              Page Count
            </label>
            <input
              id="pageCount"
              type="number"
              min="1"
              {...register('pageCount')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            {errors.pageCount && (
              <p className="mt-1 text-sm text-red-600">{errors.pageCount.message}</p>
            )}
          </div>
          
          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              type="text"
              placeholder="fiction, adventure, mystery"
              {...register('tags')}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., fiction, adventure, mystery)</p>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags.message}</p>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            rows="4"
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        
        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cover Image
          </label>
          <div className="mt-1 flex items-center">
            <div className="flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Book cover preview"
                  className="h-32 w-24 object-cover rounded-md"
                />
              ) : (
                <div className="h-32 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                  <span className="text-gray-500 text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="ml-5 flex-1">
              <div className="flex space-x-2">
                <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
                  <span>Upload file</span>
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleCloudinaryUpload}
                  disabled={uploadingImage}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Cloudinary
                    </>
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                PNG, JPG, GIF up to 5MB. A good cover image can help your book stand out.
              </p>
            </div>
          </div>
        </div>
        
        {/* Error message */}
        {createBookMutation.isError && (
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="ml-3 text-red-700">
                Error creating book. Please try again.
              </p>
            </div>
          </div>
        )}
        
        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || createBookMutation.isPending}
            className="btn btn-primary bg-[#0ea5e9] hover:bg-[#0284c7] text-white px-3 py-2 rounded-md cursor-pointer"
          >
            {(isSubmitting || createBookMutation.isPending) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Add Book'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddBook;