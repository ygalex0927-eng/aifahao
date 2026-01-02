-- Fix images for hot-sale products (Half-year and Yearly) which are currently missing
UPDATE products 
SET cover_image = CASE 
    WHEN tag = '半年卡' THEN 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop'
    WHEN tag = '年卡' THEN 'https://images.unsplash.com/photo-1585951237230-8058735395e6?q=80&w=2070&auto=format&fit=crop'
    ELSE cover_image
END
WHERE category = 'hot-sale';
