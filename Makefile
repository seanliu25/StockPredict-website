# Makefile for setting up and running the Flask App without virtual environment

# Variables
PYTHON := python3
FLASK_APP := app.py

.PHONY: install run clean

## Install dependencies globally
install:
	@echo "Installing dependencies globally..."
	@$(PYTHON) -m pip install --upgrade pip
	@$(PYTHON) -m pip install flask pandas numpy
	@echo "Dependencies installed successfully."

## Run the Flask application
run:
	@echo "Running Flask app..."
	@$(PYTHON) $(FLASK_APP)

## Clean up cache files
clean:
	@echo "Cleaning up cache files..."
	rm -rf __pycache__
	@echo "Cleaned up cache files."
