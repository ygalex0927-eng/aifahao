-- Fix image for the yearly product again, with a more reliable URL
UPDATE products 
SET cover_image = 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop'
WHERE title LIKE '%年费独享%' OR title LIKE '%年卡%';
