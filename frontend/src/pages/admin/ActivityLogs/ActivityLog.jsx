import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { Loader2, AlertCircle, Clock, Filter, Search, User, BookOpen, Star } from 'lucide-react';

const ActivityLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    actionType: '',
    period: '7days',
  });

  // Fetch activity logs
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ['activityLogs', filters],
    queryFn: () => adminApi.getActivityLogs(filters),
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter logs based on search term
  const filteredLogs = logs?.filter(log => 
    log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get icon for action type
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'signup':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'book_added':
      case 'book_deleted':
        return <BookOpen className="h-5 w-5 text-green-500" />;
      case 'review_added':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
        <span className="ml-2 text-lg">Loading activity logs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p className="ml-3 text-red-700">Error loading activity logs. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Activity Logs</h2>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by user or description..."
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            name="actionType"
            value={filters.actionType}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Actions</option>
            <option value="user">User Actions</option>
            <option value="book">Book Actions</option>
            <option value="admin">Admin Actions</option>
          </select>
          
          <select
            name="period"
            value={filters.period}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>
      
      {/* Activity logs */}
      <div className="space-y-4">
        {filteredLogs?.length > 0 ? (
          filteredLogs.map((log) => (
            <div key={log._id} className="bg-white p-4 rounded-md shadow-sm border border-gray-200">
              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  {getActionIcon(log.actionType)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{log.description}</p>
                      <p className="text-sm text-gray-500">
                        {log.user?.name} ({log.user?.email})
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                  {log.details && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                      <pre className="whitespace-pre-wrap font-mono text-xs">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details, null, 2) 
                          : log.details}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-md shadow-sm border border-gray-200">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No activity logs found</h3>
            <p className="text-gray-500">Try changing your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;