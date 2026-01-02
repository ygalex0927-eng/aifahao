-- Emergency fix: Replace the ORB-causing image (1517604931442) with a known working image (1574375927938)
-- 1517604931442 was introduced in previous migrations but is also blocked.
-- 1574375927938 is the 'Monthly' or 'Slide 2' image which is confirmed working.

UPDATE products 
SET cover_image = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop'
WHERE cover_image LIKE '%photo-1517604931442%';
