from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
import numpy as np

app = Flask(__name__, static_folder='static')

# Define the data file paths for each stock
data_files = {
    "amazon": {
        "predicted": './data/predicted/predictions_with_dates_amazon.csv',
        "actual": './data/actual/yfinance_2020-2024_day_amazon.csv'
    },
    "nvidia": {
        "predicted": './data/predicted/predictions_with_dates_nvidia.csv',
        "actual": './data/actual/yfinance_2020-2024_day_nvidia.csv'
    },
    "visa": {
        "predicted": './data/predicted/predictions_with_dates_visa.csv',
        "actual": './data/actual/yfinance_2020-2024_day_visa.csv'
    }
}

def load_data(stock, data_type):
    file_path = data_files[stock][data_type]
    data = pd.read_csv(file_path)
    data['Date'] = pd.to_datetime(data['Date']).dt.strftime('%Y-%m-%d')
    return data

def calculate_accuracy(predicted, actual):
    # Merge on 'Date' to ensure we compare matching dates only
    merged = pd.merge(predicted, actual, on='Date', suffixes=('_pred', '_actual'))
    # Calculate Mean Absolute Percentage Error (MAPE)
    mape = np.mean(np.abs((merged['Close_actual'] - merged['Close_pred']) / merged['Close_actual'])) * 100
    accuracy = 100 - mape  # Accuracy as a percentage
    return accuracy

@app.route('/api/data', methods=['GET'])
def get_data():
    stock = request.args.get('stock', 'amazon')

    # Load predicted and actual data
    predicted_data = load_data(stock, "predicted")[['Date', 'Predicted_Close']].rename(columns={'Predicted_Close': 'Close'})
    actual_data = load_data(stock, "actual")

    # Get prediction start date and filter actual data
    prediction_start_date = predicted_data['Date'].iloc[0]
    filtered_actual_data = actual_data[actual_data['Date'] >= prediction_start_date][['Date', 'Close']]

    # Calculate accuracy
    accuracy = calculate_accuracy(predicted_data, filtered_actual_data)

    # Convert data to dictionary for JSON response
    response = {
        'predicted': predicted_data.to_dict(orient='records'),
        'actual': filtered_actual_data.to_dict(orient='records'),
        'accuracy': round(accuracy, 2)  # Round to two decimal places
    }

    return jsonify(response)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
