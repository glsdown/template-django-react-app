import React, { useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import { Link, useParams } from 'react-router-dom';

import ErrorMessage from '../../components/layout/ErrorMessage';
import Loader from '../../components/layout/loader/Loader';
import { useActivateUserMutation } from './authApiSlice';

// Activate an email address
const ActivateEmail = () => {
  // Get the required details from the address
  const { id, token } = useParams();

  // Get current auth and error state
  const [activateUser, { isSuccess, error, isError }] =
    useActivateUserMutation();

  // Try to activate them
  useEffect(() => {
    if (id !== null && token !== null) {
      activateUser({ id, token });
    }
  }, [activateUser, id, token]);

  // Create the message to display if successful
  const SuccessMessage = () => (
    <Alert variant="success">
      Thanks for activating your email address. You can now{' '}
      <Link to="/login">Login here</Link>.
    </Alert>
  );

  // Return the page contents
  return (
    <Container className="mt-5">
      {isError ? (
        <ErrorMessage
          formErrors={error.data}
          defaultMessage="There was an error with your registration."
        />
      ) : isSuccess ? (
        <SuccessMessage />
      ) : (
        <Loader />
      )}
    </Container>
  );
};

export default ActivateEmail;
