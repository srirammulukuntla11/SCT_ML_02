import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { 
  CircularProgress, 
  Paper, 
  Typography, 
  Button,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Slider
} from '@mui/material';
import { uploadFile, findOptimalK, performClustering } from '../services/api';

const steps = ['Upload Data', 'Find Optimal K', 'Configure Clustering'];

const UploadData = ({ setCurrentData, setClusteringResults }) => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState(null);
  const [optimalKData, setOptimalKData] = useState(null);
  const [selectedK, setSelectedK] = useState(5);
  const [clustering, setClustering] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      toast.info(`File selected: ${acceptedFiles[0].name}`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFile(file, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      setFileData(response.data);
      setCurrentData(response.data);
      toast.success('File uploaded successfully!');
      setActiveStep(1);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFindOptimalK = async () => {
    if (!fileData) return;

    try {
      toast.info('Analyzing optimal number of clusters...');
      const response = await findOptimalK(fileData.filepath);
      setOptimalKData(response.data);
      
      if (response.data.recommended_k) {
        setSelectedK(response.data.recommended_k);
      }
      
      toast.success('Analysis complete!');
      setActiveStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Analysis failed');
    }
  };

  const handleRunClustering = async () => {
    if (!fileData) return;

    setClustering(true);
    try {
      toast.info('Running K-means clustering...');
      const response = await performClustering(fileData.filepath, selectedK);
      
      setClusteringResults(response.data);
      toast.success('Clustering completed successfully!');
      navigate('/results');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Clustering failed');
    } finally {
      setClustering(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Paper 
            {...getRootProps()} 
            sx={{
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? '#e3f2fd' : '#f5f5f5',
              border: '2px dashed #ccc',
            }}
          >
            <input {...getInputProps()} />
            {file ? (
              <div>
                <Typography variant="h6" color="primary">
                  📄 {file.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Size: {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </div>
            ) : (
              <div>
                <Typography variant="h6" gutterBottom>
                  {isDragActive ? 'Drop the file here' : 'Drag & drop a CSV file here'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  or click to select file
                </Typography>
              </div>
            )}
          </Paper>
        );

      case 1:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Step 2: Find Optimal Number of Clusters
            </Typography>
            
            {optimalKData ? (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">
                    Recommended K = {optimalKData.recommended_k}
                  </Typography>
                  <img 
                    src={`data:image/png;base64,${optimalKData.elbow_plot}`}
                    alt="Elbow Method"
                    style={{ width: '100%', maxWidth: 600, marginTop: 20 }}
                  />
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleFindOptimalK}
                sx={{ mt: 2 }}
              >
                Analyze Data
              </Button>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Step 3: Configure and Run Clustering
            </Typography>
            
            <Typography gutterBottom>
              Number of Clusters (K): {selectedK}
            </Typography>
            
            <Slider
              value={selectedK}
              onChange={(e, val) => setSelectedK(val)}
              min={2}
              max={10}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ maxWidth: 400, mt: 2 }}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleRunClustering}
              disabled={clustering}
              sx={{ mt: 4 }}
            >
              {clustering ? <CircularProgress size={24} /> : 'Run Clustering'}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="upload-container">
      <Typography variant="h4" gutterBottom>
        Customer Segmentation Pipeline
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ my: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: 4 }}>
        {renderStepContent(activeStep)}
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {activeStep > 0 && (
            <Grid item>
              <Button onClick={() => setActiveStep(activeStep - 1)}>
                Back
              </Button>
            </Grid>
          )}
          
          {activeStep === 0 && (
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Uploading {uploadProgress}%
                  </>
                ) : (
                  'Upload File'
                )}
              </Button>
            </Grid>
          )}
        </Grid>
      </Paper>
    </div>
  );
};

export default UploadData;