# ============================================================
#  InscribeMe - Script para detener todos los microservicios
#  (Cierra todas las ventanas CMD abiertas por start-all.ps1)
# ============================================================

Write-Host "⏹ Deteniendo todos los microservicios InscribeMe..." -ForegroundColor Red

# Mata todos los procesos java que sean Spring Boot
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force

Write-Host "✅ Microservicios detenidos." -ForegroundColor Green
