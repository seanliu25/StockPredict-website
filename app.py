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
    merged = pd.merge(predicted, actual, on='Date', suffixes=('_pred', '_actual'))
    mape = np.mean(np.abs((merged['Close_actual'] - merged['Close_pred']) / merged['Close_actual'])) * 100
    accuracy = 100 - mape
    return accuracy

def calculate_residuals(predicted, actual):
    merged = pd.merge(predicted, actual, on='Date', suffixes=('_pred', '_actual'))
    residuals = merged['Close_actual'] - merged['Close_pred']
    return merged['Date'].tolist(), residuals.tolist()

@app.route('/api/data', methods=['GET'])
def get_data():
    stock = request.args.get('stock', 'amazon')

    predicted_data = load_data(stock, "predicted")[['Date', 'Predicted_Close']].rename(columns={'Predicted_Close': 'Close'})
    actual_data = load_data(stock, "actual")

    prediction_start_date = predicted_data['Date'].iloc[0]
    filtered_actual_data = actual_data[actual_data['Date'] >= prediction_start_date][['Date', 'Close']]

    accuracy = calculate_accuracy(predicted_data, filtered_actual_data)
    dates, residuals = calculate_residuals(predicted_data, filtered_actual_data)

    response = {
        'predicted': predicted_data.to_dict(orient='records'),
        'actual': filtered_actual_data.to_dict(orient='records'),
        'residuals': {'dates': dates, 'values': residuals},
        'accuracy': round(accuracy, 2)
    }

    return jsonify(response)

@app.route('/')
def serve_index():
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)
