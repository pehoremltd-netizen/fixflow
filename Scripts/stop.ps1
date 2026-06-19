Write-Host "[FixFlow] Stopping servers..."

Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" | Where-Object {
  $_.CommandLine -match "tsx.*src/index\.ts" -or $_.CommandLine -match "next.*dev"
} | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Write-Host "[FixFlow] Stopped."
