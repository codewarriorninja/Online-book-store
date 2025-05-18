import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Home from './pages/Home/Home';
//Layouts
import RootLayout from './components/RootLayout';

//Protected r=Route Component
const ProtectedRoute = ({children, requireRole=null}) =>{
  const {isAuthenticated, user} = useSelector((state) => state.auth);

  if(!isAuthenticated){
    return <Navigate to={'/signin'} replace />
  }

  if(requireRole && user?.role !== requireRole){
    return <Navigate to={'/dashboard'} replace />
  }

  return children;
}

const App = () => {
  return (
    <Router>
      <Routes>
       {/* Public Routes  */}
       <Route path='/' element={<RootLayout />}>
         <Route index element={<Home />} />
       </Route>
      </Routes>
    </Router>
  )
}

export default App