import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('app.db');

// Initialize database tables
export const initDatabase = (): void => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
}

export const registerUser = (
  name: string,
  email: string,
  password: string,
  role: 'student' | 'teacher' | 'admin'
): boolean => {
  try {
    db.runSync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return true;
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<User | null> => {
  try {
    const result = db.getAllSync<User>(
      'SELECT * FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    
    if (result.length === 0) {
      console.log('No user found with email:', email);
      return null;
    }

    const user = result[0];
    
    if (user.password === password) {
      console.log('Login successful for user:', user.email);
      return user;
    } else {
      console.log('Password mismatch for user:', user.email);
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutUser = (): boolean => {
  return true;
};

export default db;