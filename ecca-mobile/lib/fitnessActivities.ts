import { getDatabase } from './database';

export interface FitnessActivity {
  id?: number;
  user_id: number;
  activity_type: string;
  duration?: number;
  distance?: number;
  calories?: number;
  notes?: string;
  recorded_at?: string;
}

export const addFitnessActivity = async (
  userId: number,
  activityType: string,
  duration?: number,
  distance?: number,
  calories?: number,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO fitness_activities (user_id, activity_type, duration, distance, calories, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, activityType, duration || null, distance || null, calories || null, notes || '']
    );
    return true;
  } catch (error) {
    console.error('Error adding fitness activity:', error);
    return false;
  }
};

export const getFitnessActivities = async (userId: number): Promise<FitnessActivity[]> => {
  try {
    const db = getDatabase();
    const activities = await db.getAllAsync<FitnessActivity>(
      'SELECT * FROM fitness_activities WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 50',
      [userId]
    );
    return activities || [];
  } catch (error) {
    console.error('Error fetching fitness activities:', error);
    return [];
  }
};

export const deleteFitnessActivity = async (id: number): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM fitness_activities WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting fitness activity:', error);
    return false;
  }
};