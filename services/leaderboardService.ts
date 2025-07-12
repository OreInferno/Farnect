
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { LeaderboardEntry, ScoreSubmission } from '../types.ts';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("Supabase environment variables not set. Leaderboard functionality will be disabled.");
}

// Helper to format time
const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
};

export const getLeaderboard = async (date: string): Promise<LeaderboardEntry[]> => {
    if (!supabase) {
        console.warn("Supabase not initialized. Returning empty leaderboard.");
        return [];
    }

    console.log(`Fetching leaderboard for date: ${date}`);
    
    const { data, error } = await supabase
        .from('scores')
        .select('username, time, mistakes')
        .eq('date', date)
        .order('mistakes', { ascending: true })
        .order('time', { ascending: true })
        .limit(20);

    if (error) {
        console.error("Error fetching leaderboard:", error);
        throw new Error("Could not load leaderboard data.");
    }

    return data.map((entry, index) => ({
        rank: index + 1,
        name: entry.username,
        time: formatTime(entry.time),
        mistakes: entry.mistakes,
    }));
};

export const submitScore = async (score: ScoreSubmission) => {
    if (!supabase) {
        console.warn("Supabase not initialized. Mocking score submission as successful.");
        return { success: true };
    }

    console.log("Submitting score to Supabase:", score);
    
    const { error } = await supabase
        .from('scores')
        .insert({
            date: score.date,
            fid: score.fid,
            username: score.username,
            time: score.time,
            mistakes: score.mistakes
        });

    if (error) {
        console.error("Error submitting score:", error);
        return { success: false, error };
    }
    
    console.log("Score submitted successfully.");
    return { success: true };
};
