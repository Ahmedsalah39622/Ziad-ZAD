@echo off
setlocal
title ZAD Setup Autostart
color 0a

echo ==========================================
echo    Setting up ZAD Print Agent Autostart
echo ==========================================
echo.

:: Get current directory
set "CURRENT_DIR=%~dp0"
set "BAT_FILE=%CURRENT_DIR%start-agent.bat"
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "SHORTCUT_NAME=%STARTUP_FOLDER%\ZAD_Print_Agent.lnk"

if not exist "%BAT_FILE%" (
    echo [ERROR] start-agent.bat not found in this folder!
    pause
    exit /b
)

echo [INFO] Creating startup shortcut...
powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_NAME%'); $Shortcut.TargetPath = '%BAT_FILE%'; $Shortcut.WorkingDirectory = '%CURRENT_DIR%'; $Shortcut.Save()"

if %errorlevel% equ 0 (
    echo [SUCCESS] Done! The agent will now start automatically when Windows starts.
    echo [INFO] Shortcut created in: %STARTUP_FOLDER%
) else (
    echo [ERROR] Failed to create shortcut.
)

echo.
pause
endlocal
