# Testing

## Overview

Testing was carried out throughout the development of **FeedMe** to check that the system worked correctly across the frontend, backend, database, and deployed environment. The goal of testing was to confirm that implemented user stories behaved as expected, that invalid input was handled appropriately, and that key workflows such as registration, login, browsing restaurants, checkout, and order management worked reliably.

Testing in this project was primarily **manual functional testing**, supported by **API testing**, **validation testing**, and **deployment testing**.

## Testing Strategy

The testing strategy for FeedMe focused on the following areas:

- **Frontend testing**  
  Verified that pages rendered correctly, navigation worked, and users could complete key actions in the interface.

- **Backend/API testing**  
  Verified that API endpoints returned the correct data, handled missing or invalid values, and interacted correctly with the database.

- **Database testing**  
  Verified that restaurant, menu, user, and order data could be retrieved and stored correctly.

- **Integration testing**  
  Verified that the frontend, backend, and database worked together in complete workflows.

- **User acceptance style testing**  
  Verified that implemented features matched the intended user stories for each iteration.

- **Deployment testing**  
  Verified that the application could run in the deployed AWS environment and connect successfully to the production database.

## Test Environment

The project was tested in the following environment:

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL / AWS RDS
- **Local development tools:** VS Code, npm
- **Deployment environment:** AWS
- **Browsers used for testing:** Google Chrome and Microsoft Edge

## Scope of Testing

The following major features were tested:

- User registration
- User login/logout
- Restaurant browsing
- Restaurant search
- Restaurant menu viewing
- Add to cart
- Checkout process
- Guest checkout
- Logged-in checkout
- Order creation
- Order history
- Saved restaurants
- Settings page
- Change password
- Protected account-based actions
- API validation for missing and invalid input

## Manual Functional Testing

### User Authentication

| Test ID | Feature | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| AUTH-01 | Registration | Register with valid first name, last name, email, and password | User account is created successfully | Account created successfully | Pass |
| AUTH-02 | Registration | Register with missing fields | Validation error is shown and registration is rejected | Error returned correctly | Pass |
| AUTH-03 | Registration | Register with an email already in use | Duplicate account is rejected | Duplicate prevented | Pass |
| AUTH-04 | Login | Login with valid email and password | User is logged in and redirected correctly | Login worked correctly | Pass |
| AUTH-05 | Login | Login with incorrect password | Login is rejected with an error message | Error displayed correctly | Pass |
| AUTH-06 | Login | Login with unknown email | Login is rejected | Error displayed correctly | Pass |
| AUTH-07 | Logout | Logout while signed in | Session is cleared and user returns to logged-out state | Worked correctly | Pass |

### Restaurant Browsing and Search

| Test ID | Feature | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| REST-01 | Browse restaurants | Open restaurants page | Restaurant list loads successfully | Restaurants displayed correctly | Pass |
| REST-02 | Search | Search by restaurant name | Matching restaurants are returned | Search worked correctly | Pass |
| REST-03 | Search | Search with blank query | Default restaurant list is shown | Restaurants displayed correctly | Pass |
| REST-04 | Search | Search for non-existent restaurant | No matching results shown | No results handled correctly | Pass |
| REST-05 | Pagination | Move between restaurant pages | Correct page of results is shown | Pagination worked correctly | Pass |

### Restaurant Menu and Cart

| Test ID | Feature | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| MENU-01 | View menu | Open a restaurant menu page | Menu items load for the selected restaurant | Menu displayed correctly | Pass |
| MENU-02 | Add to cart | Add one item to cart | Item appears in cart | Item added successfully | Pass |
| MENU-03 | Add multiple items | Add multiple menu items | All items appear in cart with correct totals | Cart updated correctly | Pass |
| MENU-04 | Cart totals | Check subtotal/total after adding items | Cart totals are calculated correctly | Totals correct | Pass |
| MENU-05 | Remove from cart | Remove an item from the cart | Item is removed and totals update | Removal worked correctly | Pass |

### Checkout and Orders

| Test ID | Feature | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| ORDER-01 | Guest checkout | Checkout as a guest with email entered | Order is created successfully | Guest checkout worked | Pass |
| ORDER-02 | Logged-in checkout | Checkout while logged in | Order is created under logged-in account | Logged-in checkout worked | Pass |
| ORDER-03 | Checkout validation | Attempt checkout with missing required information | Checkout is rejected with validation message | Validation worked | Pass |
| ORDER-04 | Order history | View orders after successful checkout | New order appears in order history | Order displayed correctly | Pass |
| ORDER-05 | Order filtering | View orders as different users | Only relevant orders are shown for that user | Worked correctly after filtering logic update | Pass |
| ORDER-06 | Empty order history | View orders when none exist | Empty state shown clearly | Empty state displayed correctly | Pass |

### Saved Restaurants and Settings

| Test ID | Feature | Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| SAVE-01 | Save restaurant | Save a restaurant to favourites | Restaurant is added to saved list | Worked correctly | Pass |
| SAVE-02 | Remove saved restaurant | Remove a saved restaurant | Restaurant is removed from saved list | Worked correctly | Pass |
| SET-01 | Settings | Open settings page while logged in | Settings page loads correctly | Worked correctly | Pass |
| SET-02 | Change password | Change password with valid current and new password | Password updates successfully | Worked correctly | Pass |
| SET-03 | Change password | Enter incorrect current password | Password change is rejected | Error handled correctly | Pass |

## Backend and API Testing

API testing was performed to verify that backend routes returned correct responses and handled invalid input appropriately.

### API Endpoints Tested

| Endpoint | Method | Purpose | Result |
|---|---|---|---|
| `/api/auth/register` | POST | Register a new user | Passed |
| `/api/auth/login` | POST | Authenticate user login | Passed |
| `/api/restaurants` | GET | Return restaurant list and search results | Passed |
| `/api/restaurants/:id` | GET | Return restaurant details | Passed |
| `/api/restaurants/:id/menu` | GET | Return restaurant menu items | Passed |
| `/api/orders` | GET | Return user order history | Passed |
| `/api/orders` | POST | Create a new order | Passed |
| `/api/orders/:id/cancel` | PATCH/PUT | Cancel an order if supported | Passed |
| `/api/user/change-password` | POST/PUT | Change logged-in user password | Passed |

### Validation Testing

Validation testing checked that invalid or incomplete requests were rejected appropriately.

| Test ID | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| VAL-01 | Registration with missing fields | 400/error response | Correctly rejected | Pass |
| VAL-02 | Login with incorrect password | Authentication error | Correctly rejected | Pass |
| VAL-03 | Invalid restaurant ID | Error or empty response | Handled correctly | Pass |
| VAL-04 | Checkout with missing required details | Validation error | Correctly rejected | Pass |
| VAL-05 | Change password with incorrect current password | Error message returned | Correctly rejected | Pass |

## Integration Testing

Integration testing was used to confirm that complete workflows worked from the user interface through to the backend and database.

### Integration Workflow Results

| Workflow ID | Workflow | Expected Outcome | Actual Outcome | Status |
|---|---|---|---|---|
| INT-01 | Register -> Login -> Browse -> Checkout -> View Order | Complete user flow works end-to-end | Worked successfully | Pass |
| INT-02 | Guest Browse -> Add to Cart -> Guest Checkout -> View Guest Order History | Guest order flow works correctly | Worked successfully | Pass |
| INT-03 | Login -> Save Restaurant -> View Saved Restaurants | Saved restaurants persist for user | Worked successfully | Pass |
| INT-04 | Login -> Change Password -> Re-login with new password | Password update persists correctly | Worked successfully | Pass |

## Deployment Testing

Deployment testing was performed after uploading the application to the cloud environment.

### Deployment Checks

| Test ID | Check | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| DEP-01 | Frontend loads in deployed environment | Application home page is accessible | Worked correctly | Pass |
| DEP-02 | Backend API responds in deployed environment | API requests return valid responses | Worked correctly | Pass |
| DEP-03 | Database connection from deployed backend | Application reads/writes production data successfully | Worked correctly | Pass |
| DEP-04 | Key user workflows after deployment | Core features still function after deployment | Worked correctly | Pass |

## Acceptance Testing Against User Stories

The project was also tested against the implemented user stories to ensure delivered functionality matched the plan for each iteration.

### Iteration 1 Acceptance Testing

| User Story | Acceptance Check | Result |
|---|---|---|
| As a user, I want to browse restaurants so that I can see available food options | Restaurant list loads and can be paginated | Pass |
| As a user, I want to search for restaurants so that I can find food more quickly | Search returns matching restaurants | Pass |
| As a user, I want to view a restaurant menu so that I can decide what to order | Menu page loads correct restaurant items | Pass |
| As a user, I want to add food to a cart so that I can prepare an order | Cart updates correctly when items are added | Pass |
| As a user, I want to place an order so that I can purchase food | Checkout completes successfully | Pass |

### Iteration 2 Acceptance Testing

| User Story | Acceptance Check | Result |
|---|---|---|
| As a user, I want to register and log in so that I can manage my account | Registration and login tested successfully | Pass |
| As a user, I want to view order history so that I can track my previous orders | Orders page displays correct orders | Pass |
| As a user, I want to save restaurants so that I can revisit favourites | Save/remove restaurant functions work correctly | Pass |
| As a user, I want to manage account settings so that I can maintain my profile | Settings page and password change work correctly | Pass |

## Defects Identified During Testing

Testing helped identify several issues during development. These were fixed as part of iterative improvement.

| Defect | Description | Resolution |
|---|---|---|
| Search performance issue | Restaurant search was too slow when matching across multiple fields | Search query was simplified and limited for better performance |
| Guest orders visible after login | Guest and logged-in order separation was incorrect | Order filtering logic was updated |
| Session lost on refresh | Logged-in user state was not always retained correctly | Authentication/session handling was improved |
| Route mismatches during development | Some frontend/backend paths were inconsistent | Routes were standardised and corrected |

## Limitations of Testing

Although the testing process covered the main workflows of the application, there were some limitations:

- Testing was mainly manual rather than automated
- No full unit test suite was implemented
- Testing was performed on a limited number of browsers/devices
- Load testing and formal security penetration testing were not performed
- Some testing used a student-scale dataset and project-scale deployment rather than production-scale traffic

## Future Testing Improvements

If the project were continued, the following testing improvements would be added:

- Automated unit tests for frontend components and backend logic
- API integration tests
- End-to-end tests for complete ordering workflows
- Additional browser and mobile responsiveness testing
- Security-focused testing for authentication and protected routes
- Performance and load testing for restaurant search and order workflows

## Conclusion

Overall, testing showed that FeedMe successfully implemented the major planned features across both iterations. Core workflows such as account creation, login, restaurant browsing, menu viewing, cart management, checkout, order history, saved restaurants, and settings were tested and worked as intended. Testing also helped uncover issues during development, which were then corrected in later iterations. While the project relied mostly on manual testing, it still provided useful verification that the delivered system met the main functional requirements of the project.
