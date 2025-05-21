import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


//Layouts
import RootLayout from './components/RootLayout';

//Public Pages
import Home from './pages/Home/Home';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';
import Browse from './pages/Browse/Browse';

//Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard/Dashboard';
import Profile from './pages/Dashboard/Profile/Profile';
import AddBook from './pages/dashboard/AddBook/Addbook';
import MyBooks from './pages/dashboard/MyBooks/MyBooks';
import BookDetail from './pages/BookDetails/BookDetail';

//Admin Pages
import UserManagement from './pages/admin/UserManagement/UserManagement';
import BookInventory from './pages/admin/BookInventory/BookInventory';
import ActivityLog from './pages/admin/ActivityLogs/ActivityLog';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public Route Component (redirects authenticated users)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <Routes>
       {/* Public Routes  */}
       <Route path='/' element={<RootLayout />}>
         <Route index element={<Home />} />
         <Route path='browse' element={<Browse />} />
         <Route path='books/:id' element={<BookDetail />} />
         <Route path="signup" element={
              <PublicRoute>
                <SignUp />
              </PublicRoute>
        } />
        <Route path="signin" element={
          <PublicRoute>
            <SignIn />
          </PublicRoute>
        } />

        {/* Dashboard Routes */}
        <Route path='dashboard' element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
        <Route index element={<MyBooks />} />
        <Route path='profile' element={<Profile />} />
        <Route path="add-book" element={<AddBook />} />
        </Route>

        {/* Admin Routes */}
        <Route 
         path='admin/users' 
         element={<ProtectedRoute requiredRole={'admin'}>
          <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<UserManagement />} />
        </Route>
        <Route 
         path='admin/books' 
         element={<ProtectedRoute requiredRole={'admin'}>
          <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<BookInventory />} />
        </Route>
        <Route 
         path='admin/logs' 
         element={<ProtectedRoute requiredRole={'admin'}>
          <Dashboard />
          </ProtectedRoute>
        }>
          <Route index element={<ActivityLog />} />
        </Route>
       </Route>
      </Routes>
    </Router>
  )
}

export default App