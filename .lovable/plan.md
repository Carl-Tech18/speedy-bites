## Phase 1: Design Overhaul (Playful & Warm)
- Update color palette to warm tones (oranges, corals, warm yellows)
- Add rounded, friendly typography and softer shadows
- Redesign auth page, home page, restaurant page, cart, and profile with the new theme

## Phase 2: Cart Fix & Persistence
- Persist cart to localStorage so items survive page refreshes
- Ensure cart shows all items with correct price totals

## Phase 3: Google Sign-In
- Add Google OAuth using Lovable Cloud managed auth
- Add Google button to auth page
- Note: Facebook is NOT supported — only Google and Apple are available

## Phase 4: Restaurant Owner Dashboard (requires DB migration)
- Create `restaurants` and `menu_items` tables
- Create `user_roles` table for owner vs buyer roles
- Build owner dashboard: add/edit restaurant info, manage menu items with prices/images
- Owners see a "My Restaurant" section in their profile

## Phase 5: ID Verification
- Create `id_verifications` table for storing uploaded ID photos
- Add ID upload flow in profile settings
- Show verification status (pending/verified) on profile
- Store ID photos in a private storage bucket

I'll start with Phases 1-3 first, then proceed to 4-5 after approval.