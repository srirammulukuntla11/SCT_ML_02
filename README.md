# 🛍️ Mall Customer Segmentation - K-means Clustering Web Application

![Python](https://img.shields.io/badge/Python-3.13-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Material UI](https://img.shields.io/badge/Material--UI-5.14.5-007fff)
![License](https://img.shields.io/badge/License-MIT-yellow)

A professional full-stack web application that segments mall customers using K-means clustering algorithm. The application helps businesses understand their customer base and create targeted marketing strategies based on age, income, and spending patterns.

## ✨ Features

- **📤 CSV Upload** - Drag & drop or select customer data file
- **🔍 Optimal K Selection** - Elbow method visualization to find best cluster count
- **🎯 K-means Clustering** - Segment customers into distinct groups
- **📈 Interactive Visualizations** - Scatter plots showing customer segments
- **💡 Business Insights** - Auto-generated marketing recommendations
- **📥 Export Results** - Download segmented data with cluster labels

## 🏗️ Tech Stack

### Backend
- **Python 3.13** - Core programming language
- **Flask** - REST API framework
- **Pandas/NumPy** - Data processing and manipulation
- **Matplotlib/Seaborn** - Data visualization
- **Scikit-learn** - K-means algorithm (optional fallback)
- **Joblib** - Model serialization

### Frontend
- **React 18** - UI library
- **Material-UI v5** - Professional component library
- **React Router v6** - Navigation
- **Axios** - API calls
- **React Dropzone** - File upload
- **React Toastify** - Notifications


## 📊 Dataset

The application uses the **Mall Customer Dataset** from Kaggle:

- **Source**: [Mall Customer Segmentation Data](https://www.kaggle.com/datasets/vjchoudhary7/customer-segmentation-tutorial-in-python)
- **Records**: 200 customers
- **Features**:
  - `CustomerID` - Unique identifier
  - `Gender` - Male/Female
  - `Age` - Customer age (19-70 years)
  - `Annual Income (k$)` - Income in thousand dollars (15-137k)
  - `Spending Score (1-100)` - Score based on spending behavior

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
The backend will run on http://localhost:5000

Frontend Setup
bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start React development server
npm start
The frontend will open at http://localhost:3000

🎯 How to Use
Upload Data - Drag & drop your CSV file or click to select

Analyze - Click "Analyze Data" to find optimal number of clusters

Configure - Adjust the slider to select number of clusters (K)

Run Clustering - Click "Run Clustering" to segment customers

View Results - Explore clusters, visualizations, and insights

Download - Export results with cluster assignments

📈 Sample Results
With K=5 clusters, you get segments like:

Cluster	Size	Income	Spending	Type	Strategy
0	39	High ($86.5k)	High (82.1)	💰 Premium	Loyalty programs
1	53	Medium ($41.5k)	Good (62.7)	🛍️ Average	Regular promotions
2	20	Low ($25.6k)	Low (18.6)	💵 Budget	Discounts
3	37	High ($87.2k)	Low (18.2)	🎯 Potential	Engagement campaigns
4	51	Medium ($54.8k)	Medium (48.5)	👴 Seniors	Senior discounts
🛠️ API Endpoints
Method	Endpoint	Description
GET	/api/health	Server health check
POST	/api/upload	Upload CSV file
POST	/api/analyze/optimal-k	Find optimal K value
POST	/api/analyze/cluster	Run K-means clustering
POST	/api/download/results	Download results CSV
🔧 Troubleshooting
Common Issues
Backend won't start

bash
# Check if port 5000 is in use
netstat -ano | findstr :5000
# Change port in app.py if needed
Frontend can't connect to backend

Ensure backend is running on port 5000

Check CORS is enabled (it is in app.py)



