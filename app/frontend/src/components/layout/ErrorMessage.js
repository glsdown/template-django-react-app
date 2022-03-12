import React from 'react';
import Alert from 'react-bootstrap/Alert';

const ErrorMessage = ({
  formErrors = {},
  defaultMessage = 'There has been an error.',
}) => {
  let message = '';
  if (formErrors.nonFieldErrors) {
    if (Array.isArray(formErrors.nonFieldErrors)) {
      message = formErrors.nonFieldErrors.join(' ');
    } else {
      message = formErrors.nonFieldErrors;
    }
  } else if (formErrors.detail) {
    if (Array.isArray(formErrors.detail)) {
      message = formErrors.detail.join(' ');
    } else {
      message = formErrors.detail;
    }
  } else {
    message = defaultMessage;
  }

  return <Alert variant="warning">{message}</Alert>;
};

export default ErrorMessage;
