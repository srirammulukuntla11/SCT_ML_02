import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Chip
} from '@mui/material';

const CustomerTable = ({ data }) => {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const columns = [
    { id: 'CustomerID', label: 'Customer ID' },
    { id: 'Gender', label: 'Gender' },
    { id: 'Age', label: 'Age' },
    { id: 'Annual Income (k$)', label: 'Income (k$)' },
    { id: 'Spending Score (1-100)', label: 'Spending Score' },
    { id: 'Cluster', label: 'Cluster' }
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getClusterColor = (cluster) => {
    const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];
    return colors[cluster % colors.length];
  };

  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>{column.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.CustomerID}</TableCell>
                  <TableCell>{row.Gender}</TableCell>
                  <TableCell>{row.Age}</TableCell>
                  <TableCell>{row['Annual Income (k$)']}</TableCell>
                  <TableCell>{row['Spending Score (1-100)']}</TableCell>
                  <TableCell>
                    <Chip
                      label={`Cluster ${row.Cluster}`}
                      sx={{ bgcolor: getClusterColor(row.Cluster), color: 'white' }}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default CustomerTable;