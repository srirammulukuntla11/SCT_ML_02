import React, { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button
} from '@mui/material';
import { Link } from 'react-router-dom';
import { healthCheck } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [serverStatus, setServerStatus] = useState('checking');

  useEffect(() => {
    const checkServer = async () => {
      try {
        await healthCheck();
        setServerStatus('online');
      } catch (error) {
        setServerStatus('offline');
        toast.error('Cannot connect to server. Please ensure backend is running.');
      }
    };

    checkServer();
  }, []);

  return (
    <div className="dashboard">
      <Typography variant="h3" gutterBottom>
        Mall Customer Segmentation
      </Typography>
      
      <Typography variant="h5" gutterBottom color="textSecondary">
        Professional K-means Clustering Web Application
      </Typography>

      <Grid container spacing={4} sx={{ mt: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                🎯 About the Project
              </Typography>
              <Typography variant="body1" paragraph>
                This application implements K-means clustering to segment mall customers 
                based on their purchase history and demographic information.
              </Typography>
              <Typography variant="body1">
                <strong>Dataset Features:</strong>
                <ul>
                  <li>CustomerID - Unique identifier</li>
                  <li>Gender - Male/Female</li>
                  <li>Age - Customer age</li>
                  <li>Annual Income (k$) - Income in thousands</li>
                  <li>Spending Score (1-100) - Spending behavior score</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                🚀 Features
              </Typography>
              <Typography variant="body1" component="div">
                <ul>
                  <li>Upload customer data (CSV format)</li>
                  <li>Automatic data preprocessing</li>
                  <li>Elbow method for optimal cluster selection</li>
                  <li>K-means clustering with customizable K</li>
                  <li>Interactive visualizations</li>
                  <li>Business insights generation</li>
                  <li>Download segmented results</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Server Status: 
              <span style={{ 
                color: serverStatus === 'online' ? 'green' : 'red',
                marginLeft: '10px'
              }}>
                {serverStatus === 'online' ? '✅ Online' : '❌ Offline'}
              </span>
            </Typography>
            
            {serverStatus === 'online' ? (
              <Button
                variant="contained"
                color="primary"
                size="large"
                component={Link}
                to="/upload"
                sx={{ mt: 2 }}
              >
                Get Started
              </Button>
            ) : (
              <Typography color="error" sx={{ mt: 2 }}>
                Please start the backend server on port 5000
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;