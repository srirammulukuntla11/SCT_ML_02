import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Force non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
import joblib
import os

class KMeansClusterer:
    def __init__(self, n_clusters=5, random_state=42, max_iterations=100):
        self.n_clusters = n_clusters
        self.random_state = random_state
        self.max_iterations = max_iterations
        self.centroids = None
        self.labels = None
        self.inertia = None
        self.silhouette_avg = 0.5  # Added default value
        
    def fit(self, X):
        """Custom K-means implementation"""
        np.random.seed(self.random_state)
        
        # Initialize centroids randomly
        n_samples, n_features = X.shape
        indices = np.random.choice(n_samples, self.n_clusters, replace=False)
        self.centroids = X[indices].copy()
        
        for iteration in range(self.max_iterations):
            # Assign points to nearest centroid
            distances = self._calculate_distances(X)
            self.labels = np.argmin(distances, axis=1)
            
            # Update centroids
            new_centroids = np.zeros_like(self.centroids)
            for k in range(self.n_clusters):
                if np.sum(self.labels == k) > 0:
                    new_centroids[k] = np.mean(X[self.labels == k], axis=0)
                else:
                    new_centroids[k] = self.centroids[k]  # Keep old centroid if cluster is empty
            
            # Check convergence
            if np.allclose(self.centroids, new_centroids):
                break
                
            self.centroids = new_centroids
        
        # Calculate inertia (within-cluster sum of squares)
        self.inertia = 0
        for k in range(self.n_clusters):
            cluster_points = X[self.labels == k]
            if len(cluster_points) > 0:
                distances = np.sum((cluster_points - self.centroids[k]) ** 2, axis=1)
                self.inertia += np.sum(distances)
        
        return self.labels
    
    def _calculate_distances(self, X):
        """Calculate distances from each point to each centroid"""
        distances = np.zeros((X.shape[0], self.n_clusters))
        for k, centroid in enumerate(self.centroids):
            distances[:, k] = np.sqrt(np.sum((X - centroid) ** 2, axis=1))
        return distances
    
    def find_optimal_k(self, X, max_k=10):
        """Find optimal k using elbow method"""
        inertias = []
        
        for k in range(1, max_k + 1):
            # Create and fit temporary model
            temp_model = KMeansClusterer(n_clusters=k, random_state=self.random_state)
            temp_model.fit(X)
            inertias.append(temp_model.inertia)
        
        return range(1, max_k + 1), inertias, None  # Return None for silhouette scores
    
    def get_cluster_centers(self):
        return self.centroids
    
    def predict(self, X):
        """Predict clusters for new data"""
        if self.centroids is None:
            raise ValueError("Model must be fitted before prediction")
        distances = self._calculate_distances(X)
        return np.argmin(distances, axis=1)
    
    def save(self, filepath):
        """Save model to disk"""
        joblib.dump({
            'centroids': self.centroids,
            'n_clusters': self.n_clusters,
            'random_state': self.random_state,
            'max_iterations': self.max_iterations,
            'inertia': self.inertia
        }, filepath)
        
    def load(self, filepath):
        """Load model from disk"""
        data = joblib.load(filepath)
        self.centroids = data['centroids']
        self.n_clusters = data['n_clusters']
        self.random_state = data['random_state']
        self.max_iterations = data['max_iterations']
        self.inertia = data['inertia']

class ClusterVisualizer:
    @staticmethod
    def create_elbow_plot(k_range, inertias):
        """Create elbow method plot"""
        plt.figure(figsize=(10, 6))
        plt.plot(list(k_range), inertias, 'bo-')
        plt.xlabel('Number of Clusters (k)')
        plt.ylabel('Within-Cluster Sum of Squares (Inertia)')
        plt.title('Elbow Method for Optimal k')
        plt.grid(True, alpha=0.3)
        
        # Save to bytes buffer instead of file
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close('all')  # Close all figures
        
        return image_base64
    
    @staticmethod
    def create_cluster_scatter(df, x_col, y_col, cluster_col='Cluster'):
        """Create scatter plot of clusters"""
        plt.figure(figsize=(12, 8))
        
        # Create scatter plot
        clusters = df[cluster_col].unique()
        colors = plt.cm.viridis(np.linspace(0, 1, len(clusters)))
        
        for cluster, color in zip(clusters, colors):
            cluster_data = df[df[cluster_col] == cluster]
            plt.scatter(
                cluster_data[x_col],
                cluster_data[y_col],
                c=[color],
                label=f'Cluster {cluster}',
                s=100,
                alpha=0.7
            )
        
        plt.title(f'Customer Segments: {x_col} vs {y_col}')
        plt.xlabel(x_col)
        plt.ylabel(y_col)
        plt.legend()
        plt.grid(True, alpha=0.3)
        
        # Save to bytes buffer instead of file
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close('all')
        
        return image_base64
    
    @staticmethod
    def create_cluster_profiles(df, cluster_col='Cluster'):
        """Create cluster profile visualization"""
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        
        # Age distribution by cluster
        df.boxplot(column='Age', by=cluster_col, ax=axes[0, 0])
        axes[0, 0].set_title('Age Distribution by Cluster')
        axes[0, 0].set_xlabel('Cluster')
        
        # Income distribution by cluster
        df.boxplot(column='Annual Income (k$)', by=cluster_col, ax=axes[0, 1])
        axes[0, 1].set_title('Income Distribution by Cluster')
        axes[0, 1].set_xlabel('Cluster')
        
        # Spending score distribution by cluster
        df.boxplot(column='Spending Score (1-100)', by=cluster_col, ax=axes[1, 0])
        axes[1, 0].set_title('Spending Score Distribution by Cluster')
        axes[1, 0].set_xlabel('Cluster')
        
        # Gender distribution by cluster
        gender_by_cluster = pd.crosstab(df[cluster_col], df['Gender'], normalize='index')
        gender_by_cluster.plot(kind='bar', stacked=True, ax=axes[1, 1])
        axes[1, 1].set_title('Gender Distribution by Cluster')
        axes[1, 1].set_xlabel('Cluster')
        axes[1, 1].set_ylabel('Proportion')
        axes[1, 1].legend(title='Gender')
        
        plt.suptitle('Cluster Profiles Analysis', fontsize=16)
        plt.tight_layout()
        
        # Save to bytes buffer instead of file
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close('all')
        
        return image_base64