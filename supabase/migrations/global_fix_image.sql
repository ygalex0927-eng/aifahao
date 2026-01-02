-- Global fix for the problematic image URL
-- Replace https://images.unsplash.com/photo-1522869635100-8f47562584a5?q=80&w=2070&auto=format&fit=crop
-- with https://images.unsplash.com/photo-1517604931442-71053e3e2f28?q=80&w=2070&auto=format&fit=crop
-- in ALL rows where it might appear.

UPDATE products 
SET cover_image = 'https://images.unsplash.com/photo-1517604931442-71053e3e2f28?q=80&w=2070&auto=format&fit=crop'
WHERE cover_image LIKE '%photo-1522869635100%';
