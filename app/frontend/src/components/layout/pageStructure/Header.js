import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import { authSelector } from '../../../features/auth/authSlice';
import { useLogoutUserMutation } from '../../../features/auth/authApiSlice';
import splitApiSlice from '../../../app/splitApiSlice';

const Header = () => {
  const dispatch = useDispatch();

  // Get the auth details from the store
  const { user, isFetching, isAuthenticated } = useSelector(authSelector);
  const [logoutUser] = useLogoutUserMutation();

  // Create function to handle logout
  const handleLogout = () => {
    // Log out the user
    logoutUser();
    // Remove all data from store
    dispatch(splitApiSlice.util.resetApiState());
  };

  // Links to display for a logged in user
  const authLinks = (
    <>
      <Navbar.Text>{user ? `Welcome ${user.email}!` : null}</Navbar.Text>
      <Nav>
        <Nav.Item>
          <Button
            variant="outline-light"
            size="sm"
            onClick={handleLogout}
            className="mx-2">
            Logout
          </Button>
        </Nav.Item>
      </Nav>
    </>
  );

  // Links to display for a non-authenticated user
  const guestLinks = (
    <Nav>
      <Nav.Item>
        <Nav.Link as={Link} to="/register">
          Register
        </Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link as={Link} to="/login">
          Login
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );

  return (
    <Navbar bg="primary" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Test Django/React App
        </Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
          {isFetching ? null : isAuthenticated ? authLinks : guestLinks}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
