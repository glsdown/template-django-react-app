import React, { useEffect, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

import { useAddDataMutation } from './dataApiSlice';
import { validEmail, validEmailHelp } from '../../app/helpers/validation';
import ErrorMessage from '../../components/layout/ErrorMessage';

// Form to add new data for the user
const AddDataForm = () => {
  // Component level state
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({
    name: null,
    email: null,
    message: null,
    nonFieldErrors: null,
    detail: null,
  });

  const [addData, { isLoading, isSuccess, isError, error }] =
    useAddDataMutation();

  // Capture errors from the backend
  useEffect(() => {
    if (isError && error?.data) {
      // Extract the errors
      const newErrors = { ...error.data, ...newErrors };

      // If an array - convert to a string
      Object.keys(error.data).forEach((key) => {
        if (Array.isArray(newErrors[key])) {
          newErrors[key] = newErrors[key].join(' ');
        }
      });

      setFormErrors({ ...formErrors, ...newErrors });
    } else if (isSuccess) {
      // Clear the form if no errors received
      setForm({ name: '', email: '', message: '' });
    }
  }, [isSuccess, isError, error]);

  // Update the form contents
  const setField = (field, value) => {
    setForm({
      ...form,
      [field]: value,
    });

    // Check and see if errors exist, and remove them from the error object:
    if (!!formErrors[field])
      setFormErrors({
        ...formErrors,
        [field]: null,
      });
  };

  // Function to handle the submit of the add data form
  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, message } = form;

    if (!validEmail.test(email)) {
      setFormErrors({ ...formErrors, email: validEmailHelp });
    } else {
      // Add the data
      addData({
        name,
        email,
        message,
      });
    }
  };

  // Main data addition form
  return (
    <div>
      <Card className="p-2 m-3">
        <Card.Title>Add Data Form</Card.Title>
        <Card.Body>
          {isError ? (
            <ErrorMessage
              formErrors
              defaultMessage="There was an error adding the data. Please check the details and try again."
            />
          ) : null}
          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group controlId="name">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Joe Bloggs"
                value={form.name}
                onChange={(e) => setField('name', e.target.value.slice(0, 100))}
                required
                isInvalid={!!formErrors.name}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="example@example.com"
                value={form.email}
                onChange={(e) =>
                  setField('email', e.target.value.slice(0, 100))
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
            <Form.Group controlId="message">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={form.message}
                onChange={(e) =>
                  setField('message', e.target.value.slice(0, 500))
                }
                isInvalid={!!formErrors.message}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.message}
              </Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-2">
              Submit
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AddDataForm;
