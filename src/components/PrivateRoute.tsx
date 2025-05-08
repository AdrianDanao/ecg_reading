import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { ReactElement } from "react";

const PrivateRoute = ({ children }: { children: ReactElement }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a loading spinner or any other loading indicator
    }
    
    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;