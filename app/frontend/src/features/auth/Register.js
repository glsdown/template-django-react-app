import React, { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';

import {
  validPassword,
  validPasswordHelp,
  validEmail,
  validEmailHelp,
  titleOptions,
} from '../../app/helpers/validation';
import ErrorMessage from '../../components/layout/ErrorMessage';
import { useRegisterUserMutation } from './authApiSlice';
import { authSelector } from './authSlice';

// Main registration form for new users
const Register = () => {
  // Component level state management
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
    title: '',
    firstName: '',
    lastName: '',
    jobTitle: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: null,
    password: null,
    password2: null,
    title: null,
    firstName: null,
    lastName: null,
    jobTitle: null,
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

  // Get the auth state from the store
  const { isAuthenticated } = useSelector(authSelector);
  const [registerUser, { isLoading, isSuccess, isError, error }] =
    useRegisterUserMutation();

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

  // Function to handle registration form submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const { email, password, password2, title, firstName, lastName, jobTitle } =
      form;

    // Validate form
    const currentErrors = { ...formErrors };

    if (password !== password2) {
      currentErrors.password2 = 'Passwords do not match';
    }
    if (!validEmail.test(email)) {
      currentErrors.email = validEmailHelp;
    }
    if (!validPassword.test(password)) {
      currentErrors.password = validPasswordHelp;
    }
    if (title.length === 0) {
      currentErrors.title = 'This field must be provided';
    }
    if (firstName.length === 0) {
      currentErrors.firstName = 'This field must be provided';
    }
    if (lastName.length === 0) {
      currentErrors.lastName = 'This field must be provided';
    }
    if (jobTitle.length === 0) {
      currentErrors.jobTitle = 'This field must be provided';
    }

    setFormErrors(currentErrors);

    if (Object.values(currentErrors).every((o) => o === null)) {
      // Submit form
      const newUser = {
        email,
        password,
        title,
        firstName,
        lastName,
        jobTitle,
      };
      registerUser(newUser);
    }
  };

  // If already authenticated, redirect to the main page
  if (isAuthenticated) {
    return <Redirect to="/" />;
  }

  // Create the success message
  const SuccessMessage = () => (
    <Alert variant="success">
      Your registration is successful. Please check your email for a
      verification request.
    </Alert>
  );

  if (isSuccess) {
    return (
      <Container fluid="md">
        <Card className="p-4 my-3 mx-md-3">
          <Card.Title>Register for an account</Card.Title>
          <Card.Body>
            <small>
              Already have an account? <Link to="/login">Login</Link>
            </small>
            <hr />
            <SuccessMessage />
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Registration form
  return (
    <Container fluid="md">
      <Card className="p-4 my-3 mx-md-3">
        <Card.Title>Register for an account</Card.Title>
        <Card.Body className="p-0">
          <small>
            Already have an account? <Link to="/login">Login</Link>
          </small>
          <hr />
          <p>
            Please fill in <strong>all</strong> fields in the form below.
          </p>
          <Form noValidate onSubmit={handleSubmit}>
            {isError ? (
              <ErrorMessage
                formErrors={formErrors}
                defaultMessage="There was an error with registering. Please try again."
              />
            ) : null}
            <Form.Group controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@example.com"
                value={form.email}
                maxLength={100}
                onChange={(e) =>
                  setField('email', e.target.value.slice(0, 100).toLowerCase())
                }
                autoComplete="email"
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
              <Form.Text className="text-muted">
                This will be your username.
              </Form.Text>
            </Form.Group>
            <hr />
            <Row>
              <Col sm={2}>
                <Form.Group controlId="title">
                  <Form.Label>Title</Form.Label>
                  <Form.Select
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                    required
                    isInvalid={!!formErrors.title}>
                    {titleOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.title}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={5}>
                <Form.Group controlId="firstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Jane"
                    value={form.firstName}
                    onChange={(e) =>
                      setField('firstName', e.target.value.slice(0, 100))
                    }
                    autoComplete="given-name"
                    required
                    isInvalid={
                      form.firstName.length > 150 || !!formErrors.firstName
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {form.firstName.length > 150
                      ? 'Must be less than 150 characters'
                      : formErrors.firstName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={5}>
                <Form.Group controlId="lastName">
                  <Form.Label>Surname</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Bloggs"
                    value={form.lastName}
                    onChange={(e) =>
                      setField('lastName', e.target.value.slice(0, 100))
                    }
                    autoComplete="family-name"
                    required
                    isInvalid={
                      form.lastName.length > 150 || !!formErrors.lastName
                    }
                  />
                  <Form.Control.Feedback type="invalid">
                    {form.lastName.length > 150
                      ? 'Must be less than 150 characters'
                      : formErrors.lastName}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <hr />
            <Form.Group controlId="jobTitle">
              <Form.Label>Job Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Data Analyst"
                value={form.jobTitle}
                onChange={(e) =>
                  setField('jobTitle', e.target.value.slice(0, 100))
                }
                maxLength={150}
                required
                isInvalid={form.jobTitle.length > 100 || !!formErrors.jobTitle}
              />
              <Form.Control.Feedback type="invalid">
                {form.jobTitle.length > 100
                  ? 'Must be less than 100 characters'
                  : formErrors.jobTitle}
              </Form.Control.Feedback>
            </Form.Group>
            <hr />
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="**********"
                value={form.password}
                minLength={8}
                onChange={(e) =>
                  setField('password', e.target.value.slice(0, 100))
                }
                autoComplete="new-password"
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
            <Form.Group className="mt-2" controlId="password2">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="**********"
                value={form.password2}
                onChange={(e) =>
                  setField('password2', e.target.value.slice(0, 100))
                }
                autoComplete="new-password"
                required
                isInvalid={
                  form.password.length > 0 &&
                  form.password2.length > 0 &&
                  form.password2 !== form.password
                }
              />
              <Form.Control.Feedback type="invalid">
                {form.password2 !== form.password
                  ? 'Passwords do not match'
                  : formErrors.password2}
              </Form.Control.Feedback>
            </Form.Group>
            <hr />
            <div className="d-flex align-contents-center">
              <Button
                variant="primary"
                type="submit"
                className="mx-auto my-3 mw-25"
                disabled={isLoading}>
                {isLoading ? 'Please wait' : 'Register'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Register;
