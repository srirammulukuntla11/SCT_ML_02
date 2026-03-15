import pandas as pd
import numpy as np
import joblib
import os

class DataPreprocessor:
    def __init__(self):
        self.mean = None
        self.std = None
        self.is_fitted = False
        
    def preprocess(self, df, fit=False):
        """
        Preprocess the dataframe for clustering
        """
        # Make a copy to avoid modifying original
        df_processed = df.copy()
        
        # Encode Gender manually (without sklearn)
        if 'Gender' in df_processed.columns:
            # Manual encoding: Male=0, Female=1
            df_processed['Gender_Encoded'] = df_processed['Gender'].map({'Male': 0, 'Female': 1}).fillna(0)
        
        # Select features for clustering
        feature_columns = ['Age', 'Annual Income (k$)', 'Spending Score (1-100)']
        if 'Gender_Encoded' in df_processed.columns:
            feature_columns.append('Gender_Encoded')
            
        X = df_processed[feature_columns].values
        
        # Manual scaling (without sklearn)
        if fit:
            self.mean = np.mean(X, axis=0)
            self.std = np.std(X, axis=0)
            self.std[self.std == 0] = 1  # Avoid division by zero
            self.is_fitted = True
        
        # Apply scaling
        if self.is_fitted:
            X_scaled = (X - self.mean) / self.std
        else:
            # If not fitted, return original (should not happen)
            X_scaled = X
            
        return X_scaled, df_processed
    
    def save(self, filepath):
        """Save preprocessor to disk"""
        joblib.dump({
            'mean': self.mean,
            'std': self.std,
            'is_fitted': self.is_fitted
        }, filepath)
        
    def load(self, filepath):
        """Load preprocessor from disk"""
        data = joblib.load(filepath)
        self.mean = data['mean']
        self.std = data['std']
        self.is_fitted = data['is_fitted']