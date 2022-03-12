import React from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';

const PaginationLimit = ({ pageLimit = 10, setPageLimit }) => (
  <FloatingLabel controlId="floatingSelect" label="# Items">
    <Form.Select
      aria-label="Number items"
      defaultValue={pageLimit}
      onChange={(e) => {
        setPageLimit(e.target.value);
      }}>
      <option value={5}>Show 5</option>
      <option value={10}>Show 10</option>
      <option value={20}>Show 20</option>
      <option value={50}>Show 50</option>
    </Form.Select>
  </FloatingLabel>
);

export default PaginationLimit;
