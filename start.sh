#!/bin/bash
echo ""
echo " ========================================"
echo "  CARS — Context-Aware Riding Score"
echo " ========================================"
echo ""

echo "[1/2] Setting up FastAPI backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
deactivate
cd ..

sleep 2

echo "[2/2] Starting React frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo " Backend:   http://localhost:8000"
echo " Frontend:  http://localhost:5173"
echo " API Docs:  http://localhost:8000/docs"
echo ""
echo " Press Ctrl+C to stop both servers"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
