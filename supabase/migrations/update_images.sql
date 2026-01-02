-- Update cover images for products
UPDATE products 
SET cover_image = CASE 
    WHEN tag = '月卡' THEN 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop'
    WHEN tag = '季卡' THEN 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop'
    WHEN tag = '半年卡' THEN 'https://images.unsplash.com/photo-1522869635100-8f47562584a5?q=80&w=2070&auto=format&fit=crop'
    WHEN tag = '年卡' THEN 'https://images.unsplash.com/photo-1593784653056-443460f5884e?q=80&w=2070&auto=format&fit=crop'
    ELSE cover_image
END;
