@echo off
echo GaiaScript Installer
echo ====================

:: Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is required but not installed.
    echo Please install Node.js from https://nodejs.org
    exit /b 1
)

:: Create installation directory
set INSTALL_DIR=%USERPROFILE%\.gaiascript
echo Installing to: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

:: Copy files
copy gaia "%INSTALL_DIR%\" /Y
copy pkg.gaia "%INSTALL_DIR%\" /Y
copy main.gaia "%INSTALL_DIR%\" /Y
copy README.md "%INSTALL_DIR%\" /Y
xcopy /E /I /Y docs "%INSTALL_DIR%\docs"

:: Create wrapper script
echo @echo off > "%INSTALL_DIR%\gaia.bat"
echo node "%INSTALL_DIR%\gaia" %%* >> "%INSTALL_DIR%\gaia.bat"

:: Add to PATH
setx PATH "%PATH%;%INSTALL_DIR%" /M

echo.
echo GaiaScript installed successfully!
echo Restart your command prompt, then run 'gaia --help' to get started
echo Or try 'gaia run main.gaia' to run the default example