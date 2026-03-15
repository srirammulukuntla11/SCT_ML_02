from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
import os
import json
from werkzeug.utils import secure_filename

from config import Config
from model.preprocessing import DataPreprocessor
from model.clustering import KMeansClusterer, ClusterVisualizer

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize global objects
preprocessor = DataPreprocessor()
clusterer = None
current_data = None

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in {'csv'}

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'Server is running'})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload CSV file endpoint"""
    global current_data
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Read and validate the data
        try:
            df = pd.read_csv(filepath)
            
            # Define expected columns and their possible variations
            column_mappings = {
                'CustomerID': ['CustomerID', 'CustomerId', 'Customer ID', 'id', 'ID'],
                'Gender': ['Gender', 'gender', 'Sex', 'sex'],
                'Age': ['Age', 'age', 'AGE'],
                'Annual Income (k$)': ['Annual Income (k$)', 'Annual Income', 'Income', 'AnnualIncome', 'income'],
                'Spending Score (1-100)': ['Spending Score (1-100)', 'Spending Score', 'Spend Score', 'Score', 'spending_score']
            }
            
            # Check which columns are present
            found_columns = {}
            missing_columns = []
            
            for expected, variations in column_mappings.items():
                found = False
                for var in variations:
                    if var in df.columns:
                        found_columns[expected] = var
                        found = True
                        break
                if not found:
                    missing_columns.append(expected)
            
            if missing_columns:
                return jsonify({
                    'error': f'Missing required columns: {missing_columns}. Found columns: {list(df.columns)}'
                }), 400
            
            # Rename columns to standard names
            df = df.rename(columns={v: k for k, v in found_columns.items()})
            
            # Store data summary
            current_data = {
                'filepath': filepath,
                'shape': df.shape,
                'columns': df.columns.tolist(),
                'preview': df.head(10).to_dict('records')
            }
            
            # Basic statistics
            stats = {
                'total_customers': len(df),
                'gender_distribution': df['Gender'].value_counts().to_dict(),
                'avg_age': float(df['Age'].mean()),
                'avg_income': float(df['Annual Income (k$)'].mean()),
                'avg_spending': float(df['Spending Score (1-100)'].mean())
            }
            
            return jsonify({
                'message': 'File uploaded successfully',
                'filename': filename,
                'statistics': stats,
                'preview': df.head(10).to_dict('records')
            })
            
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    
    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/api/analyze/optimal-k', methods=['POST'])
def find_optimal_k():
    """Find optimal number of clusters"""
    global preprocessor, current_data
    
    try:
        data = request.get_json()
        filepath = data.get('filepath', current_data['filepath'] if current_data else None)
        max_k = data.get('max_k', 10)
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'No valid data file found'}), 400
        
        # Load and preprocess data
        df = pd.read_csv(filepath)
        X_scaled, _ = preprocessor.preprocess(df, fit=True)
        
        # Find optimal k
        clusterer_temp = KMeansClusterer()
        k_range, inertias, sil_scores = clusterer_temp.find_optimal_k(X_scaled, max_k)
        
        # Create elbow plot
        visualizer = ClusterVisualizer()
        elbow_plot = visualizer.create_elbow_plot(k_range, inertias)
        
        # Calculate recommended k (elbow point)
        if len(inertias) > 2:
            # Find where the rate of decrease slows down
            diffs = np.diff(inertias)
            diffs2 = np.diff(diffs)
            recommended_k = np.argmin(diffs2) + 2
        else:
            recommended_k = 5
        
        return jsonify({
            'k_values': list(k_range),
            'inertias': inertias,
            'silhouette_scores': [0] * len(k_range) if sil_scores is None else sil_scores,
            'elbow_plot': elbow_plot,
            'recommended_k': int(recommended_k)
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze/cluster', methods=['POST'])
def perform_clustering():
    """Perform K-means clustering"""
    global preprocessor, clusterer, current_data
    
    try:
        data = request.get_json()
        filepath = data.get('filepath', current_data['filepath'] if current_data else None)
        n_clusters = data.get('n_clusters', 5)
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'No valid data file found'}), 400
        
        # Load data
        df = pd.read_csv(filepath)
        
        # Preprocess data
        X_scaled, df_processed = preprocessor.preprocess(df, fit=True)
        
        # Perform clustering
        clusterer = KMeansClusterer(n_clusters=n_clusters)
        labels = clusterer.fit(X_scaled)
        
        # Add cluster labels to dataframe
        df['Cluster'] = labels
        
        # Generate visualizations
        visualizer = ClusterVisualizer()
        
        # Create scatter plots
        scatter_income_spending = visualizer.create_cluster_scatter(
            df, 'Annual Income (k$)', 'Spending Score (1-100)'
        )
        
        scatter_age_spending = visualizer.create_cluster_scatter(
            df, 'Age', 'Spending Score (1-100)'
        )
        
        scatter_age_income = visualizer.create_cluster_scatter(
            df, 'Age', 'Annual Income (k$)'
        )
        
        # Create cluster profiles
        cluster_profiles = visualizer.create_cluster_profiles(df)
        
        # Calculate cluster statistics
        cluster_stats = []
        for i in range(n_clusters):
            cluster_data = df[df['Cluster'] == i]
            stats = {
                'cluster': int(i),
                'size': int(len(cluster_data)),
                'percentage': float(len(cluster_data) / len(df) * 100),
                'avg_age': float(cluster_data['Age'].mean()) if len(cluster_data) > 0 else 0,
                'avg_income': float(cluster_data['Annual Income (k$)'].mean()) if len(cluster_data) > 0 else 0,
                'avg_spending': float(cluster_data['Spending Score (1-100)'].mean()) if len(cluster_data) > 0 else 0,
                'gender_male': int((cluster_data['Gender'] == 'Male').sum()) if len(cluster_data) > 0 else 0,
                'gender_female': int((cluster_data['Gender'] == 'Female').sum()) if len(cluster_data) > 0 else 0
            }
            cluster_stats.append(stats)
        
        # Generate business insights
        insights = generate_insights(cluster_stats)
        
        # Safely get metrics
        inertia = getattr(clusterer, 'inertia', 0)
        silhouette = getattr(clusterer, 'silhouette_avg', 0.5)
        
        return jsonify({
            'cluster_stats': cluster_stats,
            'visualizations': {
                'income_spending': scatter_income_spending,
                'age_spending': scatter_age_spending,
                'age_income': scatter_age_income,
                'cluster_profiles': cluster_profiles
            },
            'insights': insights,
            'model_metrics': {
                'inertia': inertia,
                'silhouette_score': silhouette
            },
            'clustered_data': df.head(50).to_dict('records')
        })
        
    except Exception as e:
        import traceback
        print("="*50)
        print("ERROR in clustering:")
        traceback.print_exc()
        print("="*50)
        return jsonify({'error': str(e), 'details': traceback.format_exc()}), 500

def generate_insights(cluster_stats):
    """Generate business insights from cluster statistics"""
    insights = []
    
    # Sort clusters by spending score
    sorted_by_spending = sorted(cluster_stats, key=lambda x: x['avg_spending'], reverse=True)
    
    if sorted_by_spending:
        # High spenders
        high_spenders = sorted_by_spending[0]
        insights.append({
            'type': 'high_spenders',
            'title': '💰 Premium Customers',
            'description': f"Cluster {high_spenders['cluster']} has the highest spending score "
                          f"({high_spenders['avg_spending']:.1f}) with average income "
                          f"${high_spenders['avg_income']:.1f}k. Target with loyalty programs."
        })
        
        # Low spenders with high income (potential)
        potential = [c for c in cluster_stats if c['avg_income'] > 60 and c['avg_spending'] < 50]
        if potential:
            for p in potential:
                insights.append({
                    'type': 'potential',
                    'title': '🎯 High Potential Customers',
                    'description': f"Cluster {p['cluster']} has high income (${p['avg_income']:.1f}k) "
                                  f"but low spending ({p['avg_spending']:.1f}). Target with engagement campaigns."
                })
        
        # Budget conscious
        budget = [c for c in cluster_stats if c['avg_income'] < 40 and c['avg_spending'] < 40]
        if budget:
            for b in budget:
                insights.append({
                    'type': 'budget',
                    'title': '💵 Budget Conscious',
                    'description': f"Cluster {b['cluster']} has limited income and spending. "
                                  f"Focus on value propositions and discounts."
                })
    
    return insights

@app.route('/api/download/results', methods=['POST'])
def download_results():
    """Download clustering results as CSV"""
    try:
        data = request.get_json()
        filepath = data.get('filepath')
        clustered_data = data.get('clustered_data')
        
        if clustered_data:
            # Convert to dataframe
            df = pd.DataFrame(clustered_data)
        elif filepath and os.path.exists(filepath):
            df = pd.read_csv(filepath)
            if 'Cluster' in df.columns:
                # Already has clusters
                pass
            else:
                return jsonify({'error': 'No cluster data available'}), 400
        else:
            return jsonify({'error': 'No data to download'}), 400
        
        # Save to temporary file
        output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'clustered_results.csv')
        df.to_csv(output_path, index=False)
        
        return send_file(
            output_path,
            mimetype='text/csv',
            as_attachment=True,
            download_name='customer_segments.csv'
        )
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)