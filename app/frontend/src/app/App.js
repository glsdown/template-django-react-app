import React, { lazy, Suspense } from 'react';
// Here we use HashRouter, as whilst the URLs are messier, it means that the
// web address used by React isn't being passed to the backend, so we don't
// need to worry about routing
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import { Provider as AlertProvider } from 'react-alert';
import { useSelector } from 'react-redux';

import Loader from '../components/layout/loader/Loader';
import PrivateRoute from '../components/router/PrivateRoute';
import { useFetchUserByTokenQuery } from '../features/auth/authApiSlice';
import { authSelector } from '../features/auth/authSlice';

// Lazy loading - reduce the entrypoint size
const Header = lazy(() => import('../components/layout/pageStructure/Header'));
const Alerts = lazy(() => import('../features/messages/Alerts'));
const AlertTemplate = lazy(() =>
  import('react-alert-template-snackbar-material-ui'),
);
const Dashboard = lazy(() => import('../features/data/Dashboard'));
const Login = lazy(() => import('../features/auth/Login'));
const ActivateEmail = lazy(() => import('../features/auth/ActivateEmail'));
const NotFound = lazy(() => import('../components/router/NotFound'));
const Register = lazy(() => import('../features/auth/Register'));
const PasswordReset = lazy(() => import('../features/auth/PasswordReset'));

// alert Options
const AlertOptions = {
  timeout: 6000,
  position: 'top center',
};

const App = () => {
  const { isFetching } = useSelector(authSelector);

  // Check the user is authenticated
  useFetchUserByTokenQuery();

  return (
    <Suspense fallback={<Loader fullscreen />}>
      <AlertProvider template={AlertTemplate} {...AlertOptions}>
        <Router>
          <Header />
          <Alerts />
          {isFetching ? <Loader fullscreen /> : null}
          <Container>
            <Switch>
              <PrivateRoute exact path="/" component={Dashboard} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/register" component={Register} />
              <Route
                exact
                path="/activate-account/:id/:token"
                component={ActivateEmail}
              />
              <Route exact path="/reset-password" component={PasswordReset} />
              <Route component={NotFound} />
            </Switch>
          </Container>
        </Router>
      </AlertProvider>
    </Suspense>
  );
};

export default App;
