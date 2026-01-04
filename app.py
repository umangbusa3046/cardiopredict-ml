from flask import Flask, request, jsonify, render_template
import pickle
import numpy as np

app = Flask(__name__)

# Load the trained model and scaler
# Ensure these files are in the same directory
try:
    model = pickle.load(open('cardio_model.pkl', 'rb'))
    scaler = pickle.load(open('scaler.pkl', 'rb'))
except Exception as e:
    print(f"Error loading model files: {e}")
    model = None
    scaler = None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not scaler:
        return jsonify({'error': 'Model not loaded properly.'}), 500

    try:
        data = request.json
        
        # Extract features in the exact order the model expects
        # Order: age, gender, height, weight, ap_hi, ap_lo, cholesterol, gluc, smoke, alco, active
        features = [
            float(data['age']),
            float(data['gender']),
            float(data['height']),
            float(data['weight']),
            float(data['ap_hi']),
            float(data['ap_lo']),
            float(data['cholesterol']),
            float(data['gluc']),
            int(data['smoke']),
            int(data['alco']),
            int(data['active'])
        ]

        # Reshape and Scale
        final_features = np.array([features])
        final_features_scaled = scaler.transform(final_features)

        # Predict Probability (Risk Percentage)
        prediction_prob = model.predict_proba(final_features_scaled)[0][1] # Probability of class 1
        risk_percentage = round(prediction_prob * 100, 2)

        # Categorize Risk
        if risk_percentage < 30:
            category = "Low"
            color = "#00ff88" # Green
        elif risk_percentage < 70:
            category = "Medium"
            color = "#ffdd00" # Yellow
        else:
            category = "High"
            color = "#ff0055" # Red

        return jsonify({
            'risk_score': risk_percentage,
            'category': category,
            'color': color
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == "__main__":
    app.run()