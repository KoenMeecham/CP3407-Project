# Testing

## Testing Approach
Testing for FeedMe focused on validating core user flows and ensuring that frontend pages correctly interacted with backend API endpoints. This involved end-to-end testing across the full stack, from user input in the UI through to database responses.

Development was carried out using separate Git branches, with features tested in local environments and staging branches before being merged into the main branch. This helped reduce the risk of breaking working functionality and allowed changes to be verified before deployment.

## Feature test
The following user scenarios were tested manually to validate key user stories and ensure the system behaved as expected:

| Feature | Test Case | Expected Result | Outcome |
|---|---|---|---|
| Registration | User enters valid details | Account created successfully | Pass |
| Login | User enters valid credentials | Login succeeds and user context updates | Pass |
| Login | Invalid password entered | Error shown | Pass |
| Browse restaurants | Open restaurants page | Restaurant list loads | Pass |
| Search restaurants | Search by restaurant name | Matching restaurants shown | Pass |
| View menu | Select a restaurant | Menu items display correctly | Pass |
| Cart | Add items to cart | Cart updates with selected items | Pass |
| Checkout | Proceed to checkout | Checkout page loads with order summary | Pass |
| Settings | Change password with valid details | Password updated successfully | Pass |

These tests validate core user stories such as user authentication, browsing restaurants, managing a cart, and completing the checkout process.

## Validation Testing
Input validation was implemented on the backend to ensure correct and secure data handling. This included:
- missing registration fields
- duplicate email registration
- missing login fields
- incorrect current password during password change
- invalid restaurant IDs
- invalid page and limit query values

## API Testing
API endpoints were tested through both frontend interaction and direct request validation to ensure correct responses and data handling:

- `POST /api/register`
- `POST /api/login`
- `POST /api/change-password`
- `GET /api/restaurants`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/menu`

## Limitations
- No automated unit tests were implemented in the current version
- Checkout and payment are simulated rather than fully integrated
- Limited testing for large-scale or high-load scenarios
