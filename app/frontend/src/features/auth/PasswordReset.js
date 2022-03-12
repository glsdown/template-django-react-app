import QueryString from 'query-string';

import React, { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';

import {
  validPassword,
  validPasswordHelp,
  validEmail,
  validEmailHelp,
} from '../../app/helpers/validation';
import {
  useRequestNewPasswordMutation,
  useChangeNewPasswordMutation,
} from './authApiSlice';

const PasswordReset = (props) => {
  // Get the token from the query header
  const {
    location: { search },
  } = props;
  const token = QueryString.parse(search)?.token;

  // Get current auth and error state
  const [
    requestNewPassword,
    {
      isError: isRequestError,
      isLoading: isRequestLoading,
      isSuccess: isRequestSuccess,
      error: requestError,
    },
  ] = useRequestNewPasswordMutation();
  const [
    changeNewPassword,
    {
      isError: isChangeError,
      isLoading: isChangeLoading,
      isSuccess: isChangeSuccess,
      error: changeError,
    },
  ] = useChangeNewPasswordMutation();

  // Create component-level state
  const [form, setForm] = useState({
    email: '',
    password: '',
    password2: '',
  });
  const [formErrors, setFormErrors] = useState({
    email: null,
    password: null,
    password2: null,
    token: null,
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
    if (isChangeError && changeError.data) {
      // Extract the errors
      const newErrors = { ...changeError.data };

      // If an array - convert to a string
      Object.keys(changeError.data).forEach((key) => {
        if (Array.isArray(newErrors[key])) {
          newErrors[key] = newErrors[key].join(' ');
        }
      });

      setFormErrors({ ...formErrors, ...newErrors });
    } else if (isRequestError && requestError.data) {
      // Extract the errors
      const newErrors = { ...requestError.data };

      // If an array - convert to a string
      Object.keys(requestError.data).forEach((key) => {
        if (Array.isArray(newErrors[key])) {
          newErrors[key] = newErrors[key].join(' ');
        }
      });

      setFormErrors({ ...formErrors, ...newErrors });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChangeError, isRequestError, changeError, requestError]);

  // Handle the request form submission
  const handleRequestSubmit = (e) => {
    e.preventDefault();

    const { email } = form;
    if (!validEmail.test(email)) {
      setFormErrors({ ...formErrors, email: validEmailHelp });
    } else {
      requestNewPassword({ email });
    }
  };

  // Handle the change form submission
  const handleChangeSubmit = (e) => {
    e.preventDefault();

    const { password, password2 } = form;

    if (password !== password2) {
      setFormErrors({ password2: 'Passwords do not match', ...formErrors });
    } else if (!validPassword.test(password)) {
      setFormErrors({ ...formErrors, password: validPasswordHelp });
    } else {
      changeNewPassword({ password, token });
    }
  };

  // Request a password change
  const requestPasswordChangeForm = (
    <Form noValidate onSubmit={handleRequestSubmit}>
      <p>Please enter your email below to request a new password:</p>
      <Form.Group controlId="email">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="example@example.com"
          value={form.email}
          onChange={(e) => setField('email', e.target.value.slice(0, 100))}
          required
          autoComplete="email"
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
      <div className="d-flex">
        <Button
          variant="primary"
          type="submit"
          className="my-3 mx-auto mw-25"
          disabled={isRequestLoading}>
          {isRequestLoading ? 'Requesting...' : 'Request'}
        </Button>
      </div>
    </Form>
  );

  const requestPasswordChangeConfirm = (
    <p>Please check your email for a link to change your password.</p>
  );

  const requestPasswordChange = (
    <Card className="p-4 m-3 mx-md-3">
      <Card.Title>Request a New Password</Card.Title>
      <Card.Body className="p-0">
        {isRequestSuccess
          ? requestPasswordChangeConfirm
          : requestPasswordChangeForm}
      </Card.Body>
    </Card>
  );

  const changePasswordForm = (
    <Form noValidate onSubmit={handleChangeSubmit}>
      {isChangeError || formErrors.nonFieldErrors || formErrors.detail ? (
        <Alert variant="danger">
          There was an issue changing your password. Please{' '}
          <Link to="/reset-password">request a new link.</Link>
        </Alert>
      ) : null}
      <p>Please enter a new password below:</p>
      <Form.Group controlId="password">
        <Form.Label>New password</Form.Label>
        <Form.Control
          type="password"
          placeholder="******"
          value={form.password}
          onChange={(e) => setField('password', e.target.value.slice(0, 100))}
          autoComplete="new-password"
          required
          isInvalid={
            (form.password.length > 0 && !validPassword.test(form.password)) ||
            !!formErrors.password
          }
        />
        <Form.Control.Feedback type="invalid">
          {form.password.length > 0 && !validPassword.test(form.password)
            ? validPasswordHelp
            : formErrors.password}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mt-3" controlId="password2">
        <Form.Label>Confirm password</Form.Label>
        <Form.Control
          type="password"
          placeholder="******"
          value={form.password2}
          onChange={(e) => setField('password2', e.target.value.slice(0, 100))}
          autoComplete="new-password"
          required
          isInvalid={
            form.password.length > 0 &&
            form.password2.length > 0 &&
            form.password2 !== form.password
          }
        />
        <Form.Control.Feedback type="invalid">
          Passwords do not match.
        </Form.Control.Feedback>
      </Form.Group>
      <div className="d-flex">
        <Button
          variant="primary"
          type="submit"
          className="my-3 mx-auto mw-25"
          disabled={isChangeLoading}>
          {isChangeLoading ? 'Changing...' : 'Change'}
        </Button>
      </div>
    </Form>
  );

  const changePasswordConfirm = (
    <p>
      Thanks! Your password has now been changed.{' '}
      <Link to="/login">Log in</Link>
    </p>
  );

  const changePassword = (
    <Card className="p-4 my-3 mx-md-3">
      <Card.Title>Change your password</Card.Title>
      <Card.Body>
        {isChangeSuccess ? changePasswordConfirm : changePasswordForm}
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid="md">
      {search ? changePassword : requestPasswordChange}
    </Container>
  );
};

export default PasswordReset;
