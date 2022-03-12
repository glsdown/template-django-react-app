import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';

import { authSelector } from '../../features/auth/authSlice';
import Loader from '../layout/loader/Loader';

// Route protected by required authorisation
const PrivateRoute = ({ component: Component, ...rest }) => {
  // Get authenticated state from the store
  const { isAuthenticated, isFetching } = useSelector(authSelector);

  // Return the route
  return (
    <Route
      {...rest}
      render={({ props: compProps }) => {
        if (isFetching) {
          return <Loader />;
        }
        if (!isAuthenticated) {
          return <Redirect to="/login" />;
        }
        return <Component {...compProps} />;
      }}
    />
  );
};

export default PrivateRoute;
