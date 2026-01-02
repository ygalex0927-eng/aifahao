-- Create tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id),
    order_id UUID NOT NULL REFERENCES public.orders(id),
    
    -- Ticket/Account Details (The product being delivered)
    account_username VARCHAR, -- Netflix Profile Name or Account Email
    account_password VARCHAR, -- Netflix Password
    
    -- Meta info
    order_create_time TIMESTAMPTZ,
    coupon_info VARCHAR,
    
    -- Validity
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    
    product_type VARCHAR, -- e.g., 'Netflix 4K'
    status VARCHAR DEFAULT 'active', -- active, expired, pending
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order_id ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own tickets" ON public.tickets
    FOR SELECT USING (auth.uid() = user_id);

-- Grant access
GRANT ALL ON public.tickets TO service_role;
GRANT SELECT ON public.tickets TO authenticated;
