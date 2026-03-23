@echo off
REM Script pour résoudre le problème des migrations Laravel

echo ========================================
echo Résolution du problème de migrations
echo ========================================
echo.

REM Vérifier l'état des migrations
echo [1/4] Vérification de l'état des migrations...
php artisan migrate:status
echo.

REM Vérifier la connexion à la base de données
echo [2/4] Vérification de la connexion à la base de données...
php artisan tinker --execute="echo 'Connexion OK'" > nul 2>&1
if %errorlevel% equ 0 (
    echo Connexion à la base de données: OK
) else (
    echo Connexion à la base de données: ÉCHOUÉE - Vérifiez le fichier .env
)
echo.

REM Exécuter les migrations
echo [3/4] Exécution des migrations...
php artisan migrate --verbose
echo.

REM Vérifier à nouveau l'état
echo [4/4] Vérification finale de l'état des migrations...
php artisan migrate:status
echo.

echo ========================================
echo Migrations completées!
echo ========================================
pause
