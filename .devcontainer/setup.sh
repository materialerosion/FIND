#!/bin/bash

# Install client dependencies
cd client
npm install

# Set up Python environment
cd ../server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt