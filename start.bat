@echo off
echo.
echo  ========================================
echo   CARS — Context-Aware Riding Score
echo  ========================================
echo.

echo [1/2] Starting FastAPI backend on port 8000...
start "CARS Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && python -m pip install --upgrade pip && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

timeout /t 4 /nobreak >nul

echo [2/2] Starting React frontend on port 5173...
start "CARS Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo  Backend:   http://localhost:8000
echo  Frontend:  http://localhost:5173
echo  API Docs:  http://localhost:8000/docs
echo.
pause
