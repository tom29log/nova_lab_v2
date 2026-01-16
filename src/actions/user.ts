'use server';

import { createClient } from '@supabase/supabase-js';

// Use Service Role Key for backend operations to bypass RLS
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getUserPoints(clerkId: string) {
    if (!clerkId) return 0;

    const { data } = await supabase
        .from('users')
        .select('points')
        .eq('clerk_id', clerkId)
        .single();

    return data?.points || 0;
}

export async function updateUserPoints(clerkId: string, email: string, amountChange: number) {
    if (!clerkId) return;

    // First check if user exists
    const { data: user } = await supabase
        .from('users')
        .select('points')
        .eq('clerk_id', clerkId)
        .single();

    if (user) {
        // Update existing
        const newPoints = (user.points || 0) + amountChange;
        await supabase
            .from('users')
            .update({ points: newPoints, email }) // Update email too mostly for sync
            .eq('clerk_id', clerkId);
    } else {
        // Create new user record if receiving points (or using 0 points)
        // Ensure not negative
        const points = Math.max(0, amountChange);
        await supabase
            .from('users')
            .insert([{ clerk_id: clerkId, email, points }]);
    }
}
