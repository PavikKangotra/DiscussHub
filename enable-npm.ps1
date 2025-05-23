# This script enables PowerShell script execution for the current user
# To run this script, right-click on it and select "Run with PowerShell"

try {
    # Get the current execution policy
    $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
    
    Write-Host "Current execution policy for CurrentUser scope: $currentPolicy"
    
    # Set the execution policy to RemoteSigned if not already
    if ($currentPolicy -ne "RemoteSigned") {
        Write-Host "Setting execution policy to RemoteSigned for CurrentUser scope..."
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Write-Host "Execution policy has been set to RemoteSigned for CurrentUser scope"
    } else {
        Write-Host "Execution policy is already set to RemoteSigned for CurrentUser scope"
    }
    
    Write-Host "`nNow you should be able to run npm commands. Try the following commands:"
    Write-Host "- cd frontend && npm install"
    Write-Host "- cd backend && npm install"
    
    Write-Host "`nPress any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 
catch {
    Write-Host "An error occurred: $($_.Exception.Message)"
    Write-Host "`nYou might need to run this script as Administrator."
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} 