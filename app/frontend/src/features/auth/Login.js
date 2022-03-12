import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import {
  validPassword,
  validPasswordHelp,
  validEmail,
  validEmailHelp,
} from '../../app/helpers/validation';
import ErrorMessage from '../../components/layout/ErrorMessage';
import { useLoginUserMutation } from './authApiSlice';
import { authSelector } from './authSlice';

// Main Login Form
const Login = () => {
  // Get current state from the auth store
  const { isAuthenticated } = useSelector(authSelector);
  const [loginUser, { isLoading, isError, error }] = useLoginUserMutation();

  // Create component-level state for email and password
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: null,
    password: null,
    nonFieldErrors: null,
    detail: null,
  });

  // Update the form contents
  const setField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });

    // Check and see if errors exist, and remove them from the error object:
    if (formErrors[field])
      setFormErrors({
        ...formErrors,
        [field]: null,
      });
  };

  // Capture errors from the backend
  useEffect(() => {
    if (isError && error?.data) {
      // Extract the errors
      const newErrors = { ...error.data };

      // If an array - convert to a string
      Object.keys(error.data).forEach((key) => {
        if (Array.isArray(newErrors[key])) {
          newErrors[key] = newErrors[key].join(' ');
        }
      });

      setFormErrors({ ...formErrors, ...newErrors });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError, error]);

  // Handle the login form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = form;
    if (!validEmail.test(form.email)) {
      setFormErrors({
        ...formErrors,
        email: validEmailHelp,
      });
    } else {
      loginUser({ email, password });
    }
  };

  // If they are already authenticated, then redirect to the main homepage
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Main login form
  return (
    <Container fluid="md">
      <Card className="p-4 my-3 mx-md-3">
        <Card.Title>
          <h3>Login</h3>
        </Card.Title>
        <Card.Body className="p-0">
          <small className="text-muted">
            Don&apos;t have an account? <Link to="/register">Register</Link>.
            Or, forgot your <Link to="/reset-password">password?</Link>
          </small>
          {isError ? (
            <ErrorMessage
              formErrors={formErrors}
              defaultMessage="There was an error with logging in. Please check your username and password and try again."
            />
          ) : null}
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mt-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="email"
                value={form.email}
                autoComplete="email"
                onChange={(e) =>
                  setField('email', e.target.value.slice(0, 100).toLowerCase())
                }
                required
                isInvalid={
                  (form.email.length > 0 && !validEmail.test(form.email)) ||
                  !!formErrors.email
                }
              />
              <Form.Control.Feedback type="invalid">
                {form.email.length > 0 && !validEmail.test(form.email)
                  ? validEmailHelp
                  : formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mt-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="**********"
                value={form.password}
                autoComplete="password"
                onChange={(e) =>
                  setField('password', e.target.value.slice(0, 100))
                }
                required
                isInvalid={
                  (form.password.length > 0 &&
                    !validPassword.test(form.password)) ||
                  !!formErrors.password
                }
              />
              <Form.Control.Feedback type="invalid">
                {form.password.length > 0 && !validPassword.test(form.password)
                  ? validPasswordHelp
                  : formErrors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <div className="d-flex">
              <Button
                variant="primary"
                type="submit"
                className="mx-auto my-3 mw-25"
                disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
