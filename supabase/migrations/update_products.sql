-- Update all products to be Netflix related and add a Yearly plan
TRUNCATE products CASCADE;

INSERT INTO products (title, description, price, original_price, category, tag, specifications, stock, delivery_method, cover_image) VALUES
('Netflix 4K 1个月拼车（土耳其区）', '享受Netflix 4K超高清画质，支持4人同时在线观看，土耳其区内容更丰富', 38.00, 68.00, 'hot-sale', '月卡', '{"region": "土耳其", "quality": "4K", "duration": "1个月", "max_users": 4}', 50, 'automatic', 'https://images.unsplash.com/photo-1522869635100-8f47562584a5?q=80&w=2070&auto=format&fit=crop'),
('Netflix Premium 4K 季卡车位', 'Netflix Premium账号季卡拼车，更优惠的价格享受高品质内容', 98.00, 158.00, 'hot-sale', '季卡', '{"region": "全球", "quality": "4K", "duration": "3个月", "max_users": 4}', 30, 'automatic', 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=2069&auto=format&fit=crop'),
('Netflix Premium 4K 半年卡车位', '半年付更省心，长期稳定车位，自动续费保障', 178.00, 298.00, 'hot-sale', '半年卡', '{"region": "全球", "quality": "4K", "duration": "6个月", "max_users": 4}', 20, 'automatic', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop'),
('Netflix Premium 4K 年费独享', '尊享个人独占账号，隐私安全有保障，全年畅看', 324.00, 498.00, 'hot-sale', '年卡', '{"region": "全球", "quality": "4K", "duration": "12个月", "max_users": 1}', 15, 'automatic', 'https://images.unsplash.com/photo-1593784653056-443460f5884e?q=80&w=2070&auto=format&fit=crop');
