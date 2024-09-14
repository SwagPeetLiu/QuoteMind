#!/bin/bash

# reboot.sh

echo "Starting project reboot process..."

# Remove node_modules directory
if [ -d "node_modules" ]; then
    echo "Removing node_modules directory..."
    rm -rf node_modules
fi

# Remove package-lock.json
if [ -f "package-lock.json" ]; then
    echo "Removing package-lock.json..."
    rm package-lock.json
fi

# Install dependencies
echo "Installing dependencies..."
npm install

echo "Project reboot process completed."