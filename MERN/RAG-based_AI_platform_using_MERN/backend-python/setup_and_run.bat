@echo off

REM Go into project folder
cd backend-python

REM Create virtual environment
python -m venv venv

REM Activate virtual environment (Windows style)
call venv\Scripts\activate

REM Install dependencies
pip install -r requirements.txt

REM Copy env file
copy .env.example .env

REM Run FastAPI server
uvicorn src.main:app --reload --port 8000

pause