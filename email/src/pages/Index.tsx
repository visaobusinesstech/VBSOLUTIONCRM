
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to login when accessing root path
  return <Navigate to="/login" replace />;
};

export default Index;
