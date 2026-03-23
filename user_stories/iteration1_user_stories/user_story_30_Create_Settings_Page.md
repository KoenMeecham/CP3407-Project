## User story title: Settings page

Other versions: Manage account settings, Update user preferences, Account management  
Priority: 30  

**Priority Notes:**  
Iteration 2 – provide users with a central place to manage their account and preferences  

**Estimation:** 1 day  

**Planning Poker:**  
Scott: 1 day  
Kenneth: 1 day  
Koen: 1 day  
Ty: 1 day  
**Final agreed:** 1 day  

**Assumptions:**
- User authentication system is already implemented  
- User data (name, email, etc.) is stored in the database  
- Basic settings (profile info, password access) are sufficient for MVP  

**Description:**  
As a user, I want to access a settings page so I can manage my account details and preferences.  

**Tasks:**  
- Task 1 – Design and create settings page UI layout — Estimation: 0.25 days  
- Task 2 – Connect settings page to user data (fetch current details) — Estimation: 0.25 days  
- Task 3 – Implement ability to update basic user info (e.g. name/email) — Estimation: 0.25 days  
- Task 4 – Add navigation and integrate settings page into app (menu/profile) — Estimation: 0.25 days  


---

## User story title: Change user password

Other versions: Update password, Reset password (logged-in), Account security update  
Priority: 31  

**Priority Notes:**  
Iteration 2 – improve account security and user control over credentials  

**Estimation:** 1 day  

**Planning Poker:**  
Scott: 1 day  
Kenneth: 1 day  
Koen: 1 day  
Ty: 1 day  
**Final agreed:** 1 day  

**Assumptions:**
- User has already created an account. 
- Backend has access to user ID/session for verification  

**Description:**  
As a user, I want to change my password so I can keep my account secure.  

**Tasks:**  
- Task 1 – Design and create change password UI (current + new password fields) — Estimation: 0.25 days  
- Task 2 – Implement backend endpoint for password update — Estimation: 0.25 days  
- Task 3 – Validate current password and enforce new password rules — Estimation: 0.25 days  
- Task 4 – Handle success/error states and user feedback — Estimation: 0.25 days  
