## User story title: Configure AWS infrastructure for hosting

Main Issue: https://github.com/KoenMeecham/CP3407-Project/issues/16#issue-3998960140


## Priority: 10  

Required before application deployment.  
Provides secure cloud networking for EC2 and RDS.  

## Estimation: 3 days  

Scott: 3 days  
Koen: 2 days  
Ty: 4 days  
Kenneth: 3 days  

## Assumptions:  

- We will use AWS EC2 for hosting the backend application.  
- We will configure a dedicated VPC with public and private subnets.  
- RDS will run inside the VPC.  
- Security groups will restrict access to required ports only.  

## Description:  
Set up AWS cloud infrastructure including VPC configuration, subnets, routing tables, security groups, and 
EC2 instance provisioning to provide a secure and scalable hosting environment for the FeedMe application.  

## Tasks  
Task 1, Estimation 0.5 days: Create VPC with CIDR block   
Task 2, Estimation 0.5 days: Configure public subnet and Internet Gateway    
Task 3, Estimation 0.5 days: Configure routing tables    
Task 4, Estimation 0.5 days: Create security groups.    
Task 5, Estimation 0.5 days: Launch EC2 instance and configure SSH access.    
Task 6, Estimation 0.5 days: Verify network connectivity and instance accessibility.    

## UI Design:

N/A (Infrastructure story)

## Completed:


Screenshot of routing table
<img width="1643" height="276" alt="image" src="https://github.com/user-attachments/assets/b31b2449-ab8b-4200-bb4d-e640fec18118" />

Ec2 instance
<img width="1656" height="180" alt="image" src="https://github.com/user-attachments/assets/7d17fd95-f0f1-4cf4-b1db-2d46e35aca56" />




