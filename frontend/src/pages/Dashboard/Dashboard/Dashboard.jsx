import { Outlet, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { BookOpen, PlusCircle, User, Settings, LogOut, Activity } from 'lucide-react';

const Dashboard = () => {
  const {user} = useSelector((state) => state.auth);
  const isAdmin = user?.role === 'admin';

  return (
    <div className='max-w-7xl mx-auto px-4 lg:px-8 py-8'>
      <h1 className='text-3xl font-bold mb-8'>Dashboard</h1>
      <div className='flex flex-col md:flex-row gap-8'>
        {/* Sidebar */}
        <div className='md:w-64 flex-shrink-0'>
          <div className='bg-white rounded-lg shadow-md p-4'>
            <div className='flex items-center space-x-3 p-3 mb-4'>
              <div className='h-10 w-10 rounded-full bg-[#e0f2fe] flex items-center justify-center'>
                <User className='h-6 w-6 text-[#0284c7]'/>
              </div>
              <div>
                <p className='font-medium'>{user?.name}</p>
                <p className='text-sm text-gray-500'>{user?.email}</p>
              </div>
            </div>
            <nav className='space-y-1'>
              <NavLink
              to={'/dashboard'}
              end
              className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${ isActive
                ? 'bg-[#e0f2fe] text-[#0284c7]'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
              >
                <BookOpen className='mr-3 h-5 w-5'/>
                My Books
              </NavLink>
              <NavLink
              to={'/dashboard/add-book'}
              className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${ 
                isActive
                ? 'bg-[#e0f2fe] text-[#0284c7]'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              >
                <PlusCircle className='mr-3 h-5 w-5'/>
                Add New Book
              </NavLink>
              <NavLink
              to={'/dashboard/profile'}
              className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive
                ? 'bg-[#e0f2fe] text-[#0284c7]'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
              >
                <Settings className='mr-3 h-5 w-5'/>
                Profile Settings
              </NavLink>
              {isAdmin && (
                <>
                 <div className='pt-2 pb-1'>
                  <p className='px-3 text-xs font-semibold text-gray-500 uppercase tracking-wide'>
                    Admin
                  </p>
                 </div>
                 <NavLink to={'/admin/users'} className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                  ? 'bg-[#e0f2fe] text-[#0284c7]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'

                 }`}>
                  <User className='mr-3 h-5 w-5'/>
                  User Management
                 </NavLink>
                 <NavLink to={'/admin/books'} className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                  ? 'bg-[#e0f2fe] text-[#0284c7]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                 }`}>
                  <BookOpen className='mr-3 h-5 w-5'/>
                  Book Inventory
                 </NavLink>
                 <NavLink
                 to={'/admin/logs'}
                 className={({isActive}) => `flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActive
                  ? 'bg-[#e0f2fe] text-[#0284c7]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                 >
                  <Activity className='mr-3 h-5 w-5'/>
                  Activity Logs
                 </NavLink>
                </>
              )}
            </nav>
          </div>
        </div>
        {/* Main content */}
        <div className='flex-1'>
          <div className='bg-white rounded-lg shadow-md p-6'>
            <Outlet/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard