import axios from "axios";

//Create axios instance with base URL
const api = axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers:{
        'Content-Type':'application/json',
    },
    withCredentials: true, // Enable sending cookies with cross-origin requests
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
);

//Book API
export const booksApi = {
  //Get all books with optional filters
  getBooks:async (params={}) => {
    // If search parameter is provided, map it to title and author parameters
    // that the backend API expects

    const apiParams = {...params};
    if(params.search){
      apiParams.title = params.search;
      apiParams.author = params.search;
      apiParams.tag = params.search;
      // Remove the original search parameter as it's not used by the backend
      delete apiParams.search;
    }
    const response = await api.get('/books',{params:apiParams});
    return response.data;
  },

  //Get single book by ID
  getBookById:async(id) => {
    const response = await api.get(`books/${id}`);
    return response.data;
  },

  //Create new book
  createBook:async(bookData) =>{
    //Handle form data for image upload
    const formData = new FormData();

    //Add all book data to form
    Object.keys(bookData).forEach(key => {
      if (key === 'coverImage' && bookData[key] instanceof File) {
        formData.append(key, bookData[key]);
      } else if (key === 'tags' && Array.isArray(bookData[key])) {
        // Handle tags array properly - append each tag with the same key name
        bookData[key].forEach(tag => {
          formData.append('tags[]', tag);
        });
      } else if (bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });

    const response = await api.post('/books',formData,{
      headers:{
        'Content-Type':'multipart/form-data',
      },
    });
    return response.data;
  },

  //Update book
  updateBook:async(id,bookData) => {
    //Handle form data for image upload
    const formData = new FormData();

    //Add all book data to form
    Object.keys(bookData).forEach(key => {
      if (key === 'coverImage' && bookData[key] instanceof File) {
        formData.append(key, bookData[key]);
      } else if (bookData[key] !== undefined) {
        formData.append(key, bookData[key]);
      }
    });

    const response = await api.get(`/books/${id}`, formData,{
      headers:{
       'Content-Type': 'multipart/form-data', 
      },
    });
    return response.data;
  },

  //Delete book
  deleteBook:async(id) => {
    const response = await api.delete(`books/${id}`);
    return response.data;
  },

  //Get book reviews
  getBookReviews:async(id) => {
    const response = await api.get(`/books/${id}/reviews`);
    return response.data;
  },

  //Add book review
  addBookReview:async(id,reviewData) =>{
    const response = await api.post(`/books/${id}/reviews`, reviewData);
    return response.data;
  },
};

//User API
export const usersApi = {
  //Get user profile
  getProfile: async() => {
    const response = await api.get('auth/me');
    return response.data;
  },

  //Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/update', userData);
    return response.data;
  },

  // Get user's books
  getUserBooks: async () => {
    const response = await api.get('/books/mybook');
    return response.data;
  },
};

//Admin API
export const adminApi = {
  //Get all users(admin only)
  getUsers:async() => {
    const response = await api.get('/users/');
    return response.data;
  },

  // Get activity logs (admin only)
  getActivityLogs: async () => {
    const response = await api.get('/analytics/user-activity');
    return response.data;
  },
}

export default api