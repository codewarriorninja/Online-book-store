import { Link } from 'react-router-dom';
import { BookOpen, Search, ShoppingCart, Star, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-black py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Discover Your Next Favorite Book
              </h1>
              <p className="text-xl mb-8">
                Buy and sell books online with ease. Join our community of book lovers today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/browse" className="btn btn-secondary btn-lg">
                  Browse Books
                </Link>
                <Link to="/signup" className="btn btn-outline-light btn-lg">
                  Join Now
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/hero-books.svg" 
                alt="Books illustration" 
                className="w-full h-auto max-w-md mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/600x400?text=Books+Illustration';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Bookstore?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
                <Search className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy to Find</h3>
              <p className="text-gray-600">
                Our powerful search and filtering options make it simple to find exactly what you're looking for.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
                <ShoppingCart className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Seamless Transactions</h3>
              <p className="text-gray-600">
                Buy and sell books with just a few clicks. Our platform handles all the details for you.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Community</h3>
              <p className="text-gray-600">
                Join a thriving community of book lovers. Share reviews and recommendations with fellow readers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Books</h2>
            <Link to="/browse" className="text-primary-600 hover:text-primary-700 font-medium">
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* This would be mapped from actual data in a real implementation */}
            {[1, 2, 3, 4].map((book) => (
              <div key={book} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
                <img 
                  src={`https://placehold.co/300x400?text=Book+${book}`} 
                  alt={`Book ${book}`} 
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm ml-2">5.0 (24 reviews)</span>
                  </div>
                  <h3 className="font-semibold mb-1">Book Title {book}</h3>
                  <p className="text-gray-600 text-sm mb-2">Author Name</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-primary-600">$19.99</span>
                    <Link to={`/books/${book}`} className="text-sm text-primary-600 hover:text-primary-700">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Reading Journey?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of readers and book sellers on our platform today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup" className="btn btn-secondary btn-lg">
              Sign Up Now
            </Link>
            <Link to="/browse" className="btn btn-outline-light btn-lg">
              Browse Books
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;