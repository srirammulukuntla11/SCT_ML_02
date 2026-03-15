# Mall Customer Segmentation

A web application that segments mall customers using K-means clustering based on age, income, and spending score.

## Features
- Upload customer data (CSV)
- Find optimal number of clusters using Elbow method
- Run K-means clustering
- View results with visualizations
- Download segmented data

## Tech Stack
- **Backend**: Python, Flask, Pandas, NumPy, Matplotlib
- **Frontend**: React, Material-UI, Axios

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python app.py
Frontend
bash
cd frontend
npm install
npm start
Usage
Open http://localhost:3000

Upload Mall_Customers.csv

Click "Analyze Data" to find optimal K

Select number of clusters and click "Run Clustering"

View results and download

Dataset
Download from: Mall Customer Dataset
