import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { booksApi } from "../../services/api"
import { Search, Filter, Star, Loader2 } from 'lucide-react';

const Browse = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category:'',
        minPrice:'',
        maxPrice:'',
        sortBy:'newest',
    });

    //Fetch books with React Query
    const {data, isLoading, error} = useQuery({
        queryKey:['books',searchTerm,filters],
        queryFn:() => booksApi.getBooks({
            search:searchTerm,
            ...filters
        })
    });

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (e) => {
        const {name, value} = e.target;
        setFilters(prev => ({
            ...prev,
            [name]:value,
        }));
    };

    const handleClearFilter = () =>{
        setSearchTerm('');
        setFilters({
            category:'',
            minPrice:'',
            maxPrice:'',
            sortBy:'newest'
        });
    };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Browse Books</h1>
        {/* Search and filters */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400"/>
                        </div>
                        <input
                         type="text"
                         placeholder="Search book by title, author, or ISBN....."
                         className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                         value={searchTerm}
                         onChange={handleSearchChange}
                        />
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
            <select name="category" value={filters.category} onChange={handleFilterChange} className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]">
              <option value="">All Categories</option>
              <option value="fiction">Fiction</option>
              <option value="non-fiction">Non-Fiction</option>
              <option value="science">Science</option>
              <option value="history">History</option>
              <option value="biography">Biography</option>
              <option value="business">Business</option>
              <option value="technology">Technology</option>  
            </select>
            <select
             name="sortBy"
             value={filters.sortBy}
             onChange={handleFilterChange}
             className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
             >
             <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="title_asc">Title: A-Z</option>
              <option value="title_desc">Title: Z-A</option>
            </select>
            <button
             onClick={handleClearFilter}
             className="px-4 py-2 bg-[#0284c7] hover:bg-[#075985] focus:outline-none text-white rounded-md cursor-pointer"
             >
                Clear Filters
            </button>
            </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="minPrice" className="text-sm font-medium text-gray-700">
                    Min Price
                    </label>
                    <input
                    type="number"
                    id="minPrice"
                    name="minPrice"
                    min={'0'}
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
                    />
                </div>
                <div className="flex items-center gap-2">
            <label htmlFor="maxPrice" className="text-sm font-medium text-gray-700">
              Max Price:
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              min="0"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0ea5e9] focus:border-[#0ea5e9]"
            />
           </div>
            </div>
        </div>
        {/* Books Grid */}
        {isLoading ? (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 text-[#0284c7] animate-spin" />
                <span className="ml-2 text-lg">Loading books....</span>
            </div>
        ):error ? (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-800">Error loading books. Please Try again later.</p>
            </div>
        ):(
            <>
             <div className="mb-4">
                <p className="text-gray-600">
                    {data?.length || 0} books found
                </p>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data?.length > 0 ? (
                    data.map((book) => (
                        <div key={book._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                            <img
                             src={book.coverImage?.url || `https://placehold.co/300x400?text=${encodeURIComponent(book.title)}`}
                             alt={book.title}
                             className="w-full h-56 object-cover"
                            />
                            <div className="p-4">
                                {book.averageRating && (
                                    <div className="flex items-center mb-2">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star className={`h-4 w-4 ${i < Math.random(book.averageRating) ? 'fill-current' : ''}`}/>
                                            ))}
                                        </div>
                                        <span className="text-gray-600 text-sm ml-2">
                                        {book.averageRating.toFixed(1)} ({book.reviewCount || 0} reviews)
                                        </span>
                                    </div>
                                )}
                                <h3 className="font-semibold mb-1">{book.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-[#0284c7]">${book.price.toFixed(2)}</span>
                                    <Link className="text-sm text-[#0284c7] hover:text-[#0369a1]">
                                     View Details
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ):(
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500 text-lg">No books found Matching Your criteria.</p>
                        <button
                         onClick={handleClearFilter}
                         className="mt-4 px-4 py-2 text-[#0284c7] hover:text-[#075985]"
                        >Clear filters
                        </button>
                    </div>
                )}
             </div>
            </>
        )}
    </div>
  )
}

export default Browse