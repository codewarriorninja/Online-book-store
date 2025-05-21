import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { Loader2, AlertCircle, User, Search, UserX, UserCheck } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const queryClient = useQueryClient();

  // Fetch all users (admin only)
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: adminApi.getUsers,
  });

  // Update user status mutation
  const updateUserMutation = useMutation({
    mutationFn: (userData) => {
      console.log('Attempting to update user with data:', userData);
      return adminApi.updateUser(userData.id, userData);
    },
    onSuccess: (data) => {
      console.log('User update successful:', data);
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      setSelectedUser(null);
    },
    onError: (error) => {
      console.error('Error updating user:', error);
    }
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fetch user with book count when selecting a user
  const handleUserSelect = async (user) => {
    try {
      console.log('Selected user:', user);
      // Fetch the user's details including book count
      const userData = await adminApi.getUsers();
      console.log('All users data:', userData);
      
      const selectedUserWithBooks = userData.find(u => u._id === user._id);
      console.log('Found user with books:', {
        userId: selectedUserWithBooks?._id,
        bookCount: selectedUserWithBooks?.bookCount,
        books: selectedUserWithBooks?.books,
        hasBooks: selectedUserWithBooks?.books?.length > 0
      });
      
      if (selectedUserWithBooks) {
        setSelectedUser(selectedUserWithBooks);
      } else {
        console.warn('User not found in fetched data');
        setSelectedUser(user);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setSelectedUser(user);
    }
  };

  const handleStatusChange = (userId, isActive) => {
    console.log('handleStatusChange called with:', { userId, isActive });
    updateUserMutation.mutate({ 
      id: userId, 
      isActive: isActive 
    });
  };

  // Filter users based on search term
  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        <span className="ml-2 text-lg">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="ml-3 text-red-700">Error loading users. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      
      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      {/* Users table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers?.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} onClick={() => handleUserSelect(user)} className="cursor-pointer hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {user.isActive ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(user._id, false);
                        }}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        <UserX className="h-5 w-5 inline" />
                        <span className="ml-1">Deactivate</span>
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(user._id, true);
                        }}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <UserCheck className="h-5 w-5 inline" />
                        <span className="ml-1">Activate</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* User details modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-xl font-medium">{selectedUser.name}</p>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Role</p>
                  <p className="font-medium capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined</p>
                  <p className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Books</p>
                  <p className="font-medium">{selectedUser.bookCount || 0}</p>
                </div>
              </div>

              {/* Books Section */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-900 mb-3">User's Books</h4>
                {selectedUser.books && selectedUser.books.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedUser.books.map((book) => (
                      <div key={book._id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-16 h-20 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No cover</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{book.title || 'Untitled'}</h5>
                          <p className="text-sm text-gray-500">By {book.author || 'Unknown Author'}</p>
                          {book.publishedDate && (
                            <p className="text-sm text-gray-500">
                              Published: {new Date(book.publishedDate).toLocaleDateString()}
                            </p>
                          )}
                          {book.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {book.description}
                            </p>
                          )}
                          {book.tags && book.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {book.tags.map((tag, index) => (
                                <span 
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No books found for this user.</p>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Actions</p>
                <div className="flex space-x-2">
                  {selectedUser.isActive ? (
                    <button
                      onClick={() => handleStatusChange(selectedUser._id, false)}
                      className="flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                    >
                      <UserX className="h-4 w-4 mr-2" />
                      Deactivate User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(selectedUser._id, true)}
                      className="flex items-center px-4 py-2 border border-green-300 text-green-700 rounded-md hover:bg-green-50"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Activate User
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;