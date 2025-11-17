import { getDatabase } from './database';

export const runMigrations = async () => {
  const db = getDatabase();
  
  try {
    // Check if medications table exists
    const result = await db.getFirstAsync(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='medications'"
    ) as any;
    
    if (!result) {
      console.log('Creating medications tables...');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS medications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          dosage TEXT NOT NULL,
          frequency TEXT NOT NULL,
          times TEXT,
          notes TEXT,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );

        CREATE TABLE IF NOT EXISTS medication_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          medication_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          notes TEXT,
          FOREIGN KEY (medication_id) REFERENCES medications (id),
          FOREIGN KEY (user_id) REFERENCES users (id)
        );
      `);
      console.log('✅ Medications tables created successfully!');
    } else {
      console.log('✅ Medications tables already exist');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
};