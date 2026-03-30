## User story title: Provision and configure Amazon RDS database  

Main Issue: https://github.com/KoenMeecham/CP3407-Project/issues/17#issue-3998972078

## Priority: 10

Required before backend integration.  
Enables cloud-hosted relational persistence for Iteration-1 MVP.   

## Estimation: 3 days

Scott: 3 days  
Koen: 2 days  
Ty: 4 days  
Kenneth: 3 days  

## Assumptions:
- We will use Amazon RDS (MySQL engine).  
- We will configure security groups to allow application access only.  
- We will deploy schema using SQL scripts.  
- Restaurants and menu CSV data will be imported into RDS.  

## Description:  
Provision and configure an Amazon RDS relational database instance to host the FeedMe application schema, 
including table creation, constraints, and initial data import to support Iteration-1 functionality.  

## Tasks    
Task 1, Estimation 0.5 days: Create RDS instance    
Task 2, Estimation 0.5 days: Configure database credentials and network access    
Task 3, Estimation 1 day: Deploy schema    
Task 4, Estimation 0.5 days: Import restaurant and menu CSV datasets    
Task 5, Estimation 0.5 days: Test connectivity from backend and verify CRUD operations    

## UI Design:


## Completed:

RDS database 
<img width="1625" height="197" alt="image" src="https://github.com/user-attachments/assets/2cbfb298-4c47-4694-9fd7-302adc220f83" />
