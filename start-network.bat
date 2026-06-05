@echo off
echo ====================================
echo PeerFetch Network Access Setup
echo ====================================
echo.

echo Step 1: Adding Windows Firewall Rule...
echo This will allow other devices to access your website
echo.

REM Add firewall rule for Node.js
netsh advfirewall firewall delete rule name="Node.js Server" >nul 2>&1
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow program="%ProgramFiles%\nodejs\node.exe" enable=yes

echo ✓ Firewall rule added successfully!
echo.

echo Step 2: Getting your IP Address...
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    goto :found
)
:found
echo Your Local IP Address is: %IP%
echo.

echo Step 3: Network Access Information
echo ====================================
echo.
echo To access from other devices on the same WiFi:
echo.
echo   1. Make sure both devices are on the SAME WiFi network
echo   2. On the other device, open a browser
echo   3. Go to: http://%IP%:3000
echo      (or try port 3001 or 3002 if 3000 doesn't work)
echo.
echo ====================================
echo.

echo Press any key to start the development server...
pause >nul

cd /d "%~dp0"
npm run dev
