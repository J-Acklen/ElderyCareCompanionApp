import * as SecureStore from 'expo-secure-store';
import { getDatabase } from './database';

const USER_KEY = 'current_user_id';

// Simple password hashing (in production, use a proper library like bcrypt)
const hashPassword = (password: string): string => {
  // This is a placeholder - in production use proper hashing
  return btoa(password);
};

export const register = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    const db = getDatabase();
    const hashedPassword = hashPassword(password);
    
    const result = await db.runAsync(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email.toLowerCase(), hashedPassword]
    );

    if (result.lastInsertRowId) {
      await SecureStore.setItemAsync(USER_KEY, result.lastInsertRowId.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const db = getDatabase();
    const hashedPassword = hashPassword(password);
    
    const user = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM users WHERE email = ? AND password = ?',
      [email.toLowerCase(), hashedPassword]
    );

    if (user?.id) {
      await SecureStore.setItemAsync(USER_KEY, user.id.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const checkAuthStatus = async (): Promise<boolean> => {
  const userId = await SecureStore.getItemAsync(USER_KEY);
  return userId !== null;
};

export const getCurrentUser = async (): Promise<any> => {
  try {
    const userId = await SecureStore.getItemAsync(USER_KEY);
    if (!userId) return null;

    const db = getDatabase();
    const user = await db.getFirstAsync(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};