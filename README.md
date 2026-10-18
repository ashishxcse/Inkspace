# Inkspace

Real-time collaborative online whiteboard. 

**Stack:** Django, Django REST Framework, JWT (SimpleJWT), React (Vite)

## Run backend
```
cd inkspace-backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

## Run frontend
```
cd inkspace-frontend
npm install
npm run dev
```

## Features
- Register / login with JWT
- Create and join rooms with a room code
- (In progress) real-time drawing with WebSockets
