# State Manager
State Manager is a web application that allows users to explore and manage information about different states. The application uses a Spring Boot backend to provide APIs and a simple frontend built with HTML, CSS, and JavaScript to interact with the data.

## Features
- View information about different states
- Fetch state data using REST APIs
- Simple and responsive UI
- Backend built with Spring Boot

## Tech Stack
- Backend: Spring Boot (Java)
- Frontend: HTML, CSS, JavaScript
- API Integration
- Live Server for frontend development

## Project Structure
state-manager
│
├── backend
│   └── src
│       └── main
│           └── java
│               └── com
│                   └── statemanager
│                       ├── StateManagerApplication.java
│                       │
│                       └── config
│                           ├── CorsConfig.java
│                           ├── SecurityConfig.java
│                           └── OpenApiConfig.java
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── api.js
│
├── README.md
├── .gitignore
└── LICENSE                        

## How to Run the Project
### Backend
1. Open the backend project in IntelliJ.
2. Run `StateManagerApplication.java`.
3. The backend server will start on `localhost`.

### Frontend
1. Open the project folder in VS Code.
2. Run Live Server.
3. Open `http://127.0.0.1:3000` in your browser.

## Future Improvements
- Add database support
- Add search and filter for states
- Improve UI design
- Deploy the application online

## Author
Developed as part of a learning project.
