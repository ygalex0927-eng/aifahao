-- Fix image for the hot-sale yearly product specifically
UPDATE products 
SET cover_image = 'https://images.unsplash.com/photo-1585951237230-8058735395e6?q=80&w=2070&auto=format&fit=crop'
WHERE title = 'Netflix Premium 4K 年费独享';
