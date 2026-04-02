# User story title: Hashing Passwords

Main issue - 

## Priority: 10

Priority Notes:
Iteration 2 – Need a way to store user passwords securely and protect user accounts.

## Estimation: 2 days  
Planning Poker:  
Ty: 3 days  
Scott: 2 days  
Koen: 2 days  
Kenneth: 2 days  
Final agreed: 2 days

## Assumptions:
- The system already supports user registration and login
- Passwords are currently not stored securely or need improvement
- A standard password hashing library such as bcrypt will be used
- Users will not notice changes to the login process except improved security

## Description:
As a user, I want my password to be stored securely so that my account information is protected if the database is ever exposed.

The system will hash passwords before storing them in the database, rather than saving plain text passwords. 
During login, the system will compare the entered password against the stored hashed password using a secure verification method. This improves user security and follows standard authentication practices.

## Tasks
Tasks:  
Task 1 – Research and choose a secure password hashing method such as bcrypt, Estimation 0.25 days  
Task 2 – Update user registration logic to hash passwords before saving, Estimation 0.5 days  
Task 3 – Update login logic to verify entered passwords against hashed passwords, Estimation 0.5 days  
Task 4 – Test registration and login workflow with hashed passwords, Estimation 0.5 days  
Task 5 – Add error handling and ensure passwords are never exposed in logs or responses, Estimation 0.25 days  

# UI Design:  
No major UI changes required
Registration and login forms will remain visually the same
Any validation or error messages should remain clear and user friendly

# Completed:  
Insert screenshots of registration and login working correctly
Show code or screenshots demonstrating hashed passwords in the database instead of plain text
Include any testing evidence showing successful password verification
