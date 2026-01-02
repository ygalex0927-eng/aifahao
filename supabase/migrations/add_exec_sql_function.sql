-- Function to execute dynamic SQL
-- WARNING: This is extremely dangerous and should only be used by super admins
CREATE OR REPLACE FUNCTION public.exec_sql(sql_query text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result jsonb;
BEGIN
    -- We can't easily return rows from arbitrary SQL in plpgsql without knowing schema,
    -- but we can execute it.
    -- For SELECTs, it's harder to return dynamic JSON without LOOP or converting.
    -- Let's try to just execute.
    
    EXECUTE sql_query;
    
    RETURN jsonb_build_object('status', 'success');
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;
