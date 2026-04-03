# User story title: Cancel Order (Before Preparation)
Other versions: Cancel order, Order cancellation, Stop order before cooking

Main Issue - https://github.com/KoenMeecham/CP3407-Project/issues/29#issue-4118026093


## Priority: 20
Priority Notes:
Iteration 2 – Allow cancellation before order status = preparing

## Estimation: 2 days
Planning Poker:
Scott: 2 days 
Kenneth: 3 days
Koen: 2 days
Ty: 2 days
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



# UI Design:


<img width="796" height="513" alt="image" src="https://github.com/user-attachments/assets/45bc89fd-0b68-4bea-97d3-3212f134bf9b" />

# Completed:
