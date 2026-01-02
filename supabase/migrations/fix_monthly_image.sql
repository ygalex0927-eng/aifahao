-- Fix Monthly product image (was 1522869635100, causing ORB)
-- Use a different reliable image (e.g., Cinema/Popcorn style)
UPDATE products 
SET cover_image = 'https://images.unsplash.com/photo-1517604931442-71053e3e2f28?q=80&w=2070&auto=format&fit=crop'
WHERE cover_image LIKE '%1522869635100%';
