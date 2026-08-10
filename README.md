# Lecturer Notation System

## Project Overview
The Lecturer Notation System is a lightweight web-based application that allows students to review lecturers by submitting ratings and feedback. The project is designed as a simple Progressive Web App (PWA) that can be used on multiple devices.

## Features
- User authentication with Firebase Authentication
- Student review submission and storage in Firebase Firestore
- Lecturer rating and feedback collection
- Admin view for managing submitted reviews
- Responsive design for desktop and mobile use

## Technologies Used
- HTML, CSS, and JavaScript
- Firebase Authentication
- Firebase Firestore
- Progressive Web App (PWA) support

## Project Structure
- index.html — main page for submitting lecturer reviews
- home.html — home page for signed-in users
- login.html — login page
- signup.html — registration page
- admin.html — admin page for viewing submitted reviews
- app.js — main application logic
- firebase-config.js — Firebase configuration and initialization
- style.css — styling for the application

## How to Run
1. Open the project folder in a browser.
2. Make sure the Firebase configuration is correctly set up in firebase-config.js.
3. Start the app by opening index.html or login.html.

## Authentication Setup
The application uses Firebase Authentication for user sign-in and sign-up. To use it properly:
- Create a Firebase project
- Enable Email/Password authentication
- Replace the placeholder Firebase configuration values in firebase-config.js

## Report Summary
This system demonstrates a practical approach to digital student evaluation for lecturers. It combines web technologies with cloud-based storage to provide a simple, accessible, and modern solution for collecting student reviews and ratings efficiently.

## Future Improvements
- Add role-based access control for different user types
- Improve review editing and deletion features
- Add search and filtering options for reviews
- Enhance the user interface and overall experience
