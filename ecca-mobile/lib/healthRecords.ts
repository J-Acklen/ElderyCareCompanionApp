import { getDatabase } from './database';

export interface HealthRecord {
  id?: number;
  user_id: number;
  type: string;
  value: string;
  notes?: string;
  recorded_at?: string;
}

export const addHealthRecord = async (
  userId: number,
  type: string,
  value: string,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO health_records (user_id, type, value, notes) VALUES (?, ?, ?, ?)',
      [userId, type, value, notes || '']
    );
    return true;
  } catch (error) {
    console.error('Error adding health record:', error);
    return false;
  }
};

export const getHealthRecords = async (userId: number): Promise<HealthRecord[]> => {
  try {
    const db = getDatabase();
    const records = await db.getAllAsync<HealthRecord>(
      'SELECT * FROM health_records WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 50',
      [userId]
    );
    return records || [];
  } catch (error) {
    console.error('Error fetching health records:', error);
    return [];
  }
};

export const deleteHealthRecord = async (id: number): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM health_records WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting health record:', error);
    return false;
  }
};