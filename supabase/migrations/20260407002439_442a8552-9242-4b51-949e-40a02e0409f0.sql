
-- Drop existing SELECT policy
DROP POLICY "Anyone can view active restaurants" ON public.owner_restaurants;

-- Create new policy: owners see their own, everyone sees active
CREATE POLICY "Users can view active or own restaurants"
ON public.owner_restaurants
FOR SELECT
USING (is_active = true OR auth.uid() = owner_id);
