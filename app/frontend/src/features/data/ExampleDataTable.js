import React, { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';

import { useGetDataQuery, useDeleteDataMutation } from './dataApiSlice';
import Loader from '../../components/layout/loader/Loader';
import Pagination from '../../components/layout/Pagination';
import PaginationLimit from '../../components/layout/PaginationLimit';
import UpdateDataModal from './UpdateDataModal';

// Table to display data for the user
const ExampleDataTable = () => {
  // Local state
  const [dataResult, setDataResult] = useState([]);
  const [pagination, setPagination] = useState({});
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateData, setUpdateData] = useState({});
  const [pageLimit, setPageLimit] = useState(10);
  const [pageNumber, setPageNumber] = useState(1);

  // Get the details from redux-toolkit
  const { data = {}, isFetching } = useGetDataQuery({
    limit: pageLimit,
    page: pageNumber,
  });
  const [deleteData] = useDeleteDataMutation();

  // Update the data on refresh from the useGetDataQuery to handle paginated
  // responses
  useEffect(() => {
    if (data?.results) {
      setDataResult(data.results);
      setPagination(data.pagination);
    }
  }, [data]);

  // When the limit changes, set the page back to 1
  useEffect(() => {
    setPageNumber(1);
  }, [pageLimit]);

  // Handle delete function
  const handleDelete = (d) => deleteData(d.id);

  // Handle update function
  const handleUpdate = (d) => {
    setUpdateData(d);
    setShowUpdate(true);
  };

  // Main data table
  const dataTable = (
    <Table striped>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Comments</th>
          <th aria-label="Delete" />
          <th aria-label="Update" />
        </tr>
      </thead>
      <tbody>
        {dataResult.map((d) => (
          <tr key={d.id} aria-label={`Details of data ${d.id}`}>
            <td>{d.id}</td>
            <td>{d.name}</td>
            <td>{d.email}</td>
            <td>{d.message}</td>
            <td>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleDelete(d)}>
                Delete
              </Button>
            </td>
            <td>
              <Button
                variant="success"
                size="sm"
                onClick={() => handleUpdate(d)}>
                Update
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  // Return requred result
  return (
    <div>
      <h2>Example Data</h2>
      <Row>
        <Col sm={8}>
          {pagination?.totalPages > 1 ? (
            <Pagination
              activePage={pageNumber}
              setActivePage={setPageNumber}
              maxValue={pagination?.totalPages}
            />
          ) : null}
        </Col>
        <Col sm={4}>
          <PaginationLimit pageLimit={pageLimit} setPageLimit={setPageLimit} />
        </Col>
      </Row>
      <UpdateDataModal
        showUpdate={showUpdate}
        setShowUpdate={setShowUpdate}
        data={updateData}
      />
      {isFetching ? <Loader /> : dataTable}
    </div>
  );
};

export default ExampleDataTable;
