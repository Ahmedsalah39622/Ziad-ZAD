@echo off
setlocal
title ZAD Print Agent
color 0b

echo ==========================================
echo       ZAD Print Agent System
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

cd /d "%~dp0"

:: Check for node_modules
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing dependencies...
    where pnpm >nul 2>nul
    if %errorlevel% equ 0 (
        call pnpm install
    ) else (
        echo [WARNING] pnpm not found, using npm install instead.
        call npm install
    )
)

echo [INFO] Starting the agent...
echo [INFO] Keep this window open for the printer to work.
echo.

:: Run the agent
where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    call pnpm exec tsx print-agent.ts
) else (
    call npx tsx print-agent.ts
)

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Agent stopped unexpectedly.
    pause
)

endlocal
