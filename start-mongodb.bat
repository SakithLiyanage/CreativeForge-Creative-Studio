@echo off
echo Starting MongoDB...
echo.

REM Try to start MongoDB service
net start MongoDB

REM If service doesn't exist, try manual start
if errorlevel 1 (
    echo MongoDB service not found, trying manual start...
    echo.
    
    REM Create data directory if it doesn't exist
    if not exist ".\mongodb-data" mkdir ".\mongodb-data"
    
    REM Try to start MongoDB manually
    echo Starting MongoDB manually...
    mongod --dbpath=".\mongodb-data" --port=27017
)

pause
