## User story title: Cancel Order (Before Preparation)
Other versions: Cancel order, Order cancellation, Stop order before cooking

## Priority: 20
Priority Notes:
Iteration 1 – Allow cancellation before order status = preparing
Iteration 2 – Add refund handling + notifications
Future – Partial refunds / cancellation fees

## Estimation: 2 days
Planning Poker:
Bob: 2 days (before iteration-1)
Lisa: 3 days
Jack: 2 days
Final agreed: 2 days

## Assumptions:
- Order status exists (placed, preparing, ready, delivered)
- Users are authenticated
- Orders are linked to users

## Description:
Users can cancel an order before preparation starts so they are not charged for unwanted orders.


## Tasks:
Task 1 – Add cancel button to order UI, Estimation 0.5 days
Task 2 – Validate order status before allowing cancellation, Estimation 0.5 days
Task 3 – Update order status to "cancelled" in database, Estimation 0.5 days
Task 4 – Display success/error feedback to user, Estimation 0.5 days
