import { getDatabase } from './database';

export interface Medication {
  id?: number;
  user_id: number;
  name: string;
  dosage: string;
  frequency: string;
  times?: string;
  notes?: string;
  active?: number;
  created_at?: string;
}

export interface MedicationLog {
  id?: number;
  medication_id: number;
  user_id: number;
  taken_at?: string;
  notes?: string;
}

// Add a new medication
export const addMedication = async (
  userId: number,
  name: string,
  dosage: string,
  frequency: string,
  times?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO medications (user_id, name, dosage, frequency, times, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, dosage, frequency, times || '', notes || '']
    );
    return true;
  } catch (error) {
    console.error('Error adding medication:', error);
    return false;
  }
};

// Get all active medications for a user
export const getMedications = async (userId: number): Promise<Medication[]> => {
  try {
    const db = getDatabase();
    const medications = await db.getAllAsync<Medication>(
      'SELECT * FROM medications WHERE user_id = ? AND active = 1 ORDER BY name ASC',
      [userId]
    );
    return medications || [];
  } catch (error) {
    console.error('Error fetching medications:', error);
    return [];
  }
};

// Mark medication as inactive (soft delete)
export const deactivateMedication = async (id: number): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync('UPDATE medications SET active = 0 WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deactivating medication:', error);
    return false;
  }
};

// Log that a medication was taken
export const logMedicationTaken = async (
  medicationId: number,
  userId: number,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO medication_logs (medication_id, user_id, notes) VALUES (?, ?, ?)',
      [medicationId, userId, notes || '']
    );
    return true;
  } catch (error) {
    console.error('Error logging medication:', error);
    return false;
  }
};

// Get medication logs for a specific medication
export const getMedicationLogs = async (medicationId: number): Promise<MedicationLog[]> => {
  try {
    const db = getDatabase();
    const logs = await db.getAllAsync<MedicationLog>(
      'SELECT * FROM medication_logs WHERE medication_id = ? ORDER BY taken_at DESC LIMIT 50',
      [medicationId]
    );
    return logs || [];
  } catch (error) {
    console.error('Error fetching medication logs:', error);
    return [];
  }
};

// Get today's medication logs for a user
export const getTodaysMedicationLogs = async (userId: number): Promise<MedicationLog[]> => {
  try {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    
    const logs = await db.getAllAsync<MedicationLog>(
      "SELECT * FROM medication_logs WHERE user_id = ? AND DATE(taken_at) = ? ORDER BY taken_at DESC",
      [userId, today]
    );
    return logs || [];
  } catch (error) {
    console.error('Error fetching today medication logs:', error);
    return [];
  }
};