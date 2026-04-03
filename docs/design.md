# Design

## Overview
FeedMe uses a client-server architecture. The React frontend provides the user interface, while the Express backend exposes API endpoints and communicates with a MySQL database.

The system is deployed using **Amazon Web Services (AWS)**:
- Backend hosted on an EC2 instance
- Database hosted on Amazon RDS (MySQL)

The project is structured into separate **client** and **server** directories inside `Feedme_website/`.

---

## Architectural Design

The system is divided into four layers:

### 1. Presentation Layer (Client)
**Location:** `Feedme_website/client/src/`

- Built with React and Vite
- Handles UI rendering and user interaction
- Communicates with backend via REST APIs

---

### 2. Application Layer (Server)
**Location:** `Feedme_website/server/`

- Express.js server
- Handles routing, validation, authentication, and business logic
- Runs on AWS EC2

---

### 3. Data Layer
- MySQL database hosted on AWS RDS
- Stores users, restaurants, menu items, and orders

---

### 4. Infrastructure Layer
- AWS EC2 (backend hosting)
- AWS RDS (database hosting)
- Nginx (reverse proxy)
- Cloudflare (DNS + HTTPS)

---

## Screenshot of EC2

<img width="2605" height="1457" alt="Screenshot 2026-04-03 123102" src="https://github.com/user-attachments/assets/5be3db55-7e76-4a20-811b-9f41d418ccb3" />

---

## Screenshot of RDS

<img width="2511" height="1456" alt="Screenshot 2026-04-03 123230" src="https://github.com/user-attachments/assets/90ba8545-8ca4-4e1f-a4ff-5688c996a589" />

---

## Project Structure

```bash
Feedme_website/
├── client/     # React frontend
└── server/     # Express backend
