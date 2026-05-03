@echo off
chcp 65001 >nul
echo ========================================
echo   Supabase Webhook Deployment
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\bin" (
    echo Installing dependencies...
    npm install
)

echo.
echo Step 1: Logging in to Supabase...
echo ----------------------------------------
set "SUPA_TOKEN=%SUPABASE_ACCESS_TOKEN%"
if "%SUPA_TOKEN%"=="" (
    set /p SUPA_TOKEN=Enter Supabase Access Token (starts with sbp_): 
)
if "%SUPA_TOKEN%"=="" (
    echo Missing access token.
    goto :error
)
npx supabase login --token %SUPA_TOKEN%
if %errorlevel% neq 0 (
    echo Login failed!
    goto :error
)
echo Login successful!

echo.
echo Step 2: Linking project (xcnkegvtqwtaodvogbij)...
echo ----------------------------------------
npx supabase link --project-ref xcnkegvtqwtaodvogbij
if %errorlevel% neq 0 (
    echo Project link failed!
    goto :error
)
echo Project linked successfully!

echo.
echo Step 3: Deploying Edge Function...
echo ----------------------------------------
npx supabase functions deploy lemon-squeezy-webhook
if %errorlevel% neq 0 (
    echo Function deployment failed!
    goto :error
)
echo Function deployed successfully!

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Webhook URL:
echo https://xcnkegvtqwtaodvogbij.supabase.co/functions/v1/lemon-squeezy-webhook
echo.
echo Next Steps:
echo 1. Set your Lemon Squeezy Signing Secret:
echo    npx supabase secrets set LEMON_SQUEEZY_SIGNING_SECRET=your_secret_here
echo.
echo 2. Apply database migration:
echo    npx supabase db push
echo.
echo 3. Go to Lemon Squeezy Dashboard and add the webhook URL
echo.
pause
goto :end

:error
echo.
echo Deployment failed! Check errors above.
pause
exit /b 1

:end
