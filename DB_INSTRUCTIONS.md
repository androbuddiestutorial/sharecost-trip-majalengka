# Database Update Instructions  
  
Please run the following SQL commands in your Supabase SQL Editor to add the required columns for the meeting point pricing feature:  
  
`sql  
ALTER TABLE meeting_points ADD COLUMN price INT8 DEFAULT 0;  
ALTER TABLE bookings ADD COLUMN meeting_point_price INT8 DEFAULT 0;  
` 
