param(
  [Parameter(Position = 0)]
  [ValidateSet("local", "vercel", "seed")]
  [string]$Command = "local"
)

$Root = Join-Path $PSScriptRoot ".."

switch ($Command) {
  "local" {
    Write-Host "[FixFlow] Starting backend on http://localhost:4000 ..."
    $backend = Start-Process -FilePath "npx" -ArgumentList "tsx", "src/index.ts" -WorkingDirectory (Join-Path $Root "backend") -NoNewWindow -PassThru

    Start-Sleep -Seconds 3

    Write-Host "[FixFlow] Starting frontend on http://localhost:3000 ..."
    $frontend = Start-Process -FilePath "npx" -ArgumentList "next", "dev" -WorkingDirectory (Join-Path $Root "Frontend") -NoNewWindow -PassThru

    Write-Host ""
    Write-Host "[FixFlow] Running! Press Ctrl+C to stop both servers."
    Write-Host "  Frontend: http://localhost:3000"
    Write-Host "  Backend:  http://localhost:4000"
    Write-Host ""

    try {
      while ($true) { Start-Sleep -Seconds 1 }
    } finally {
      if ($backend -and !$backend.HasExited) { $backend.Kill() }
      if ($frontend -and !$frontend.HasExited) { $frontend.Kill() }
      Write-Host "[FixFlow] Stopped."
    }
  }

  "vercel" {
    Write-Host "[FixFlow] Deploying frontend to Vercel..."
    Set-Location (Join-Path $Root "Frontend")
    npx vercel --prod
    Set-Location $Root
  }

  "seed" {
    Write-Host "[FixFlow] Seeding database..."
    Set-Location (Join-Path $Root "backend")
    npx tsx src/seed.ts
    Set-Location $Root
  }
}
