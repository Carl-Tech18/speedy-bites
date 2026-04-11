
-- Add restaurant_id to orders table
ALTER TABLE public.orders ADD COLUMN restaurant_id uuid REFERENCES public.owner_restaurants(id) ON DELETE SET NULL;

-- Allow owners to view orders for their restaurants
CREATE POLICY "Owners can view their restaurant orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.owner_restaurants
    WHERE owner_restaurants.id = orders.restaurant_id
    AND owner_restaurants.owner_id = auth.uid()
  )
);

-- Allow owners to update order status
CREATE POLICY "Owners can update their restaurant order status"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.owner_restaurants
    WHERE owner_restaurants.id = orders.restaurant_id
    AND owner_restaurants.owner_id = auth.uid()
  )
);
