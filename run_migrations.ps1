# Script PowerShell pour exécuter les migrations Laravel

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Exécution des migrations Laravel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'emplacement
$projectPath = Get-Location
Write-Host "[1/5] Répertoire actuel: $projectPath" -ForegroundColor Yellow

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Erreur: Le fichier 'artisan' n'a pas été trouvé!" -ForegroundColor Red
    Write-Host "Assurez-vous d'être dans le dossier C:\Users\hp\Desktop\euro_school_2" -ForegroundColor Red
    Read-Host "Appuyez sur Entrée pour quitter"
    exit 1
}

Write-Host "✅ Fichier artisan trouvé" -ForegroundColor Green
Write-Host ""

# Afficher le statut des migrations
Write-Host "[2/5] Vérification du statut des migrations..." -ForegroundColor Yellow
php artisan migrate:status
Write-Host ""

# Exécuter les migrations
Write-Host "[3/5] Exécution des migrations..." -ForegroundColor Yellow
php artisan migrate --verbose

Write-Host ""

# Vérifier la création des tables
Write-Host "[4/5] Vérification finale des tables..." -ForegroundColor Yellow
php artisan migrate:status

Write-Host ""

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Opération terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Les tables 'payments' et 'invoices' doivent maintenant exister." -ForegroundColor Green
Write-Host "Vous pouvez accéder à:" -ForegroundColor Cyan
Write-Host "  - http://localhost:5173/admin/payments" -ForegroundColor White
Write-Host "  - http://localhost:5173/admin/invoices" -ForegroundColor White
Write-Host ""

Read-Host "Appuyez sur Entrée pour quitter"
