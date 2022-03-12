import React from 'react';
import { Link } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const NotFound = () => {
  return (
    <div
      className="d-flex align-items-center justify-content-center text-center p-sm-5"
      style={{ minHeight: '90vh' }}
    >
      <div className="p-md-5">
        <Row className="align-items-center">
          <Col xs={6}>
            <h1 className="display-1 text-danger text-end">404</h1>
          </Col>
          <Col xs={6}>
            <h2 className="text-start">PAGE NOT FOUND</h2>
          </Col>
        </Row>
        <Row>
          <p>
            The page you are looking for might have been removed, had its name
            changed, or be temporarily unavailable.
          </p>
        </Row>
        <Row className="justify-content-center">
          <Button as={Link} to="/" style={{ width: '100px' }}>
            Home
          </Button>
        </Row>
      </div>
    </div>
  );
};

export default NotFound;
