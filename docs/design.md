
```md
# Design

## Overview
FeedMe uses a client-server architecture. The React frontend provides the user interface, while the Express backend exposes API endpoints and communicates with a MySQL database.

## Architectural Design
The system is divided into three major layers:

1. **Presentation Layer**
   - React frontend
   - Pages: Landing, Restaurants, RestaurantMenu, Orders, Login, Register, SavedRestaurants, Settings, Checkout

2. **Application Layer**
   - Express server
   - Handles routing, validation, business logic, and API responses

3. **Data Layer**
   - MySQL database
   - Stores users, restaurants, and menu items

## Component Design
### Frontend Components
- `Landing.jsx`: home page and entry point
- `Restaurants.jsx`: displays searchable list of restaurants
- `RestaurantMenu.jsx`: shows menu items for a selected restaurant
- `Cart.jsx` and `CartDropdown.jsx`: manage and display shopping cart state
- `Login.jsx` and `Register.jsx`: authentication forms
- `Settings.jsx`: account settings including password change
- `Checkout.jsx`: checkout flow
- `UserContext.jsx`: logged-in user state
- `SavedContext.jsx`: saved restaurant state

### Backend Components
- `server.js`: API routes, DB connection, static file serving
- Helper function: `parsePositiveInt()` for safer request validation

## API Design
Main endpoints include:
- `POST /api/register`
- `POST /api/login`
- `POST /api/change-password`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/menu`

## Database Design
Main entities:
- **Users**
- **Restaurants**
- **Menu_Items**

### Relationships
- One restaurant can have many menu items
- One user can register and log in to manage their account

## Interface Design
The UI was designed to be simple and familiar to food delivery users:
- top navigation for movement between pages
- restaurant cards for browsing
- menu layout for item selection
- cart dropdown for quick review
- settings page for account control

## Design Rationale
React was chosen for reusable component-based UI development. Express was chosen for lightweight REST API development. MySQL was chosen because the project data is relational and suits structured tables such as users, restaurants, and menu items.
