import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { downloadResults } from '../services/api';
import { toast } from 'react-toastify';
import CustomerTable from './CustomerTable';

const ClusteringResults = ({ results, currentData }) => {
  const [tabValue, setTabValue] = useState(0);
  const [downloading, setDownloading] = useState(false);

  if (!results) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No results to display</Typography>
        <Typography variant="body2" color="textSecondary">
          Please run clustering first
        </Typography>
      </Paper>
    );
  }

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await downloadResults(
        currentData?.filepath,
        results.clustered_data
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customer_segments.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Results downloaded successfully!');
    } catch (error) {
      toast.error('Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="results-container">
      <Typography variant="h4" gutterBottom>
        Clustering Results
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4">
                {results.cluster_stats.reduce((acc, curr) => acc + curr.size, 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Number of Segments
              </Typography>
              <Typography variant="h4">
                {results.cluster_stats.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Silhouette Score
              </Typography>
              <Typography variant="h4">
                {results.model_metrics.silhouette_score?.toFixed(3) || 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              disabled={downloading}
              sx={{ mr: 2 }}
            >
              {downloading ? 'Downloading...' : '📥 Download Results'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={(e, val) => setTabValue(val)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="📊 Segment Profiles" />
              <Tab label="👥 Customer Data" />
            </Tabs>

            <Box sx={{ p: 3 }}>
              {tabValue === 0 && (
                <div>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Cluster</TableCell>
                          <TableCell align="right">Size</TableCell>
                          <TableCell align="right">Percentage</TableCell>
                          <TableCell align="right">Avg Age</TableCell>
                          <TableCell align="right">Avg Income (k$)</TableCell>
                          <TableCell align="right">Avg Spending</TableCell>
                          <TableCell align="right">Male/Female</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {results.cluster_stats.map((stat) => (
                          <TableRow key={stat.cluster}>
                            <TableCell>Cluster {stat.cluster}</TableCell>
                            <TableCell align="right">{stat.size}</TableCell>
                            <TableCell align="right">{stat.percentage.toFixed(1)}%</TableCell>
                            <TableCell align="right">{stat.avg_age.toFixed(1)}</TableCell>
                            <TableCell align="right">{stat.avg_income.toFixed(1)}</TableCell>
                            <TableCell align="right">{stat.avg_spending.toFixed(1)}</TableCell>
                            <TableCell align="right">{stat.gender_male}/{stat.gender_female}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Visualizations
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Income vs Spending Score
                        </Typography>
                        <img
                          src={`data:image/png;base64,${results.visualizations.income_spending}`}
                          alt="Income vs Spending"
                          style={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Age vs Spending Score
                        </Typography>
                        <img
                          src={`data:image/png;base64,${results.visualizations.age_spending}`}
                          alt="Age vs Spending"
                          style={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Cluster Profiles
                        </Typography>
                        <img
                          src={`data:image/png;base64,${results.visualizations.cluster_profiles}`}
                          alt="Cluster Profiles"
                          style={{ width: '100%' }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                    Business Insights
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {results.insights.map((insight, index) => (
                      <Grid item xs={12} key={index}>
                        <Card sx={{ bgcolor: '#f8f9fa' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {insight.title}
                            </Typography>
                            <Typography variant="body1">
                              {insight.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </div>
              )}

              {tabValue === 1 && (
                <CustomerTable data={results.clustered_data} />
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default ClusteringResults;