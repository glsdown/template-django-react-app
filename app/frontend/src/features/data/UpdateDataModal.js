import React, { useState, useEffect } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';

import { useUpdateDataMutation } from './dataApiSlice';
import ErrorMessage from '../../components/layout/ErrorMessage';

const UpdateDataModal = ({ showUpdate, setShowUpdate, data }) => {
  // Get from store
  const [updateData, { isLoading, isSuccess, isError, error }] =
    useUpdateDataMutation();

  // Get the data elements, and component state required
  const [form, setForm] = useState({
    name: '',
    message: '',
  });
  const [formErrors, setFormErrors] = useState({
    name: null,
    message: null,
    nonFieldErrors: null,
    detail: null,
  });

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
  }, [isError, isSuccess, error]);

  // Update the default values in the form
  useEffect(() => {
    setForm({ ...form, ...data });
  }, [data]);

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

  // Handle the update form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const { id, name, email, message } = form;
    updateData({
      id: data.id,
      name: name ? name : data.name,
      email: data.email,
      message: message ? message : data.message,
    });
  };

  // Create the update modal
  return (
    <Modal
      show={showUpdate && !isSuccess}
      onHide={() => setShowUpdate(false)}
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Update data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isError ? (
          <ErrorMessage
            formErrors
            defaultMessage="There was an error with registering. Please try again."
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
            <Form.Control type="email" value={data.email} readOnly />
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
          <Button
            variant="primary"
            type="submit"
            className="mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
};

export default UpdateDataModal;
