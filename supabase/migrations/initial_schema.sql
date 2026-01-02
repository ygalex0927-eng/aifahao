-- Drop existing tables to ensure clean state
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS account_credentials CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(11) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    nickname VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    wechat_openid VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_wechat_openid ON users(wechat_openid);

-- Create products table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('hot-sale', 'solo', 'short-term')),
    tag VARCHAR(20),
    specifications JSONB,
    stock INTEGER DEFAULT 0,
    delivery_method VARCHAR(20) DEFAULT 'automatic',
    cover_image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Create orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'refunded')),
    contact_phone VARCHAR(11) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Create payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('wechat', 'alipay')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
    transaction_id VARCHAR(100),
    payment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_transaction_id ON payments(transaction_id);

-- Create account_credentials table
CREATE TABLE account_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    platform VARCHAR(50) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    additional_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expired_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_credentials_order_id ON account_credentials(order_id);
CREATE INDEX idx_credentials_platform ON account_credentials(platform);
CREATE INDEX idx_credentials_is_active ON account_credentials(is_active);

-- Initial Data
INSERT INTO products (title, description, price, original_price, category, tag, specifications, stock, delivery_method, cover_image) VALUES
('Netflix 4K 1个月拼车（土耳其区）', '享受Netflix 4K超高清画质，支持4人同时在线观看，土耳其区内容更丰富', 38.00, 68.00, 'hot-sale', '月卡', '{"region": "土耳其", "quality": "4K", "duration": "1个月", "max_users": 4}', 50, 'automatic', 'https://cdn.example.com/netflix-4k.jpg'),
('Netflix Premium 4K 季卡车位', 'Netflix Premium账号季卡拼车，更优惠的价格享受高品质内容', 98.00, 158.00, 'hot-sale', '季卡', '{"region": "全球", "quality": "4K", "duration": "3个月", "max_users": 4}', 30, 'automatic', 'https://cdn.example.com/netflix-premium.jpg'),
('Netflix 基础版 7天体验（单人）', '低成本体验Netflix内容，适合首次尝试的用户', 10.00, 25.00, 'short-term', '短期', '{"region": "全球", "quality": "HD", "duration": "7天", "max_users": 1}', 100, 'automatic', 'https://cdn.example.com/netflix-basic.jpg'),
('HBO Max 5人车车位（半年付）', 'HBO Max平台拼车账号，独享热门美剧和电影内容', 178.00, 298.00, 'hot-sale', '半年卡', '{"region": "美国", "quality": "4K", "duration": "6个月", "max_users": 5}', 20, 'manual', 'https://cdn.example.com/hbo-max.jpg'),
('Disney+ 独享账号（年付）', 'Disney+个人独享账号，包含迪士尼、漫威、星战等独家内容', 324.00, 498.00, 'solo', '年卡', '{"region": "全球", "quality": "4K", "duration": "12个月", "max_users": 1}', 15, 'manual', 'https://cdn.example.com/disney-plus.jpg');

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_credentials ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = payments.order_id 
        AND orders.user_id = auth.uid()
    ));

CREATE POLICY "Users can view own credentials" ON account_credentials
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = account_credentials.order_id 
        AND orders.user_id = auth.uid()
    ));

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON account_credentials TO authenticated;
GRANT SELECT ON products TO anon, authenticated;
GRANT INSERT ON users TO anon, authenticated;
