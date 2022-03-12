import React from 'react';

import ExampleDataTable from './ExampleDataTable';
import AddDataForm from './AddDataForm';

// Main data dashboard
const Dashboard = () => (
  <>
    <AddDataForm />
    <hr />
    <ExampleDataTable />
  </>
);

export default Dashboard;
