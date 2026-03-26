import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import StandardScaler
import pickle
import os

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH  = os.path.join(BASE_DIR, "data", "gamerdate_interactions.csv")
MODEL_PATH = os.path.join(BASE_DIR, "ml", "model.pkl")

def train():
    print("Loading interaction data...")
    df = pd.read_csv(DATA_PATH)

    # ── Features the model learns from ──
    feature_cols = [
        "shared_games",
        "shared_genres",
        "platform_match",
        "playstyle_match",
        "playtime_match",
        "age_diff",
        "compatibility_score",
    ]

    X = df[feature_cols].values
    y = df["is_match"].values

    # Scale features — important for Logistic Regression
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train / test split
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42, stratify=y
    )

    print(" Training Logistic Regression model...")
    model = LogisticRegression(
        max_iter=1000,
        class_weight="balanced",  # handles imbalanced match/no-match ratio
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    print(f"\nAccuracy: {accuracy_score(y_test, y_pred) * 100:.1f}%")
    print("\n Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["No Match", "Match"]))

    # Save model + scaler together as a bundle
    bundle = {"model": model, "scaler": scaler, "feature_cols": feature_cols}
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(bundle, f)

    print(f"\n Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train()
