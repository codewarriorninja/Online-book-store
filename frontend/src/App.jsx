import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';


//Layouts
import RootLayout from './components/RootLayout';

//Public Pages
import Home from './pages/Home/Home';
import SignUp from './pages/SignUp/SignUp';
import SignIn from './pages/SignIn/SignIn';

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
       </Route>
      </Routes>
    </Router>
  )
}

export default App