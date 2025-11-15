import { getDatabase } from './database';

export interface CalendarEvent {
  id?: number;
  user_id: number;
  title: string;
  event_date: string; // Format: YYYY-MM-DD
  time?: string;
  notes?: string;
  created_at?: string;
}

export const addCalendarEvent = async (
  userId: number,
  title: string,
  eventDate: string,
  time?: string,
  notes?: string
): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO calendar_events (user_id, title, event_date, time, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, title, eventDate, time || '', notes || '']
    );
    return true;
  } catch (error) {
    console.error('Error adding calendar event:', error);
    return false;
  }
};

export const getCalendarEvents = async (userId: number): Promise<CalendarEvent[]> => {
  try {
    const db = getDatabase();
    const events = await db.getAllAsync<CalendarEvent>(
      'SELECT * FROM calendar_events WHERE user_id = ? ORDER BY event_date ASC',
      [userId]
    );
    return events || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
};

export const getCalendarEventsByMonth = async (
  userId: number,
  year: number,
  month: number
): Promise<CalendarEvent[]> => {
  try {
    const db = getDatabase();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;
    
    const events = await db.getAllAsync<CalendarEvent>(
      'SELECT * FROM calendar_events WHERE user_id = ? AND event_date BETWEEN ? AND ? ORDER BY event_date ASC',
      [userId, startDate, endDate]
    );
    return events || [];
  } catch (error) {
    console.error('Error fetching calendar events by month:', error);
    return [];
  }
};

export const deleteCalendarEvent = async (id: number): Promise<boolean> => {
  try {
    const db = getDatabase();
    await db.runAsync('DELETE FROM calendar_events WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
};

export const getUpcomingEvents = async (userId: number, limit: number = 10): Promise<CalendarEvent[]> => {
  try {
    const db = getDatabase();
    const today = new Date().toISOString().split('T')[0];
    
    const events = await db.getAllAsync<CalendarEvent>(
      'SELECT * FROM calendar_events WHERE user_id = ? AND event_date >= ? ORDER BY event_date ASC LIMIT ?',
      [userId, today, limit]
    );
    return events || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
};