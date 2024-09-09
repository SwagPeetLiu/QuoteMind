# reboot.ps1 (windows)
Write-Host "Starting project reboot process..."

# Remove node_modules directory
if (Test-Path -Path "node_modules") {
    Write-Host "Removing node_modules directory..."
    Remove-Item -Recurse -Force node_modules
}

# Remove package-lock.json
if (Test-Path -Path "package-lock.json") {
    Write-Host "Removing package-lock.json..."
    Remove-Item package-lock.json
}

# Install dependencies
Write-Host "Installing dependencies..."
npm install

Write-Host "Project reboot process completed."