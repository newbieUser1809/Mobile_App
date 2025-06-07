import * as SQLite from 'expo-sqlite';


export interface User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'admin';
}

export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string;
  userId: number;
  createdAt?: string;
}


// Open database
const db = SQLite.openDatabaseSync('app.db');

// Initialize database
export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin'))
      );
      
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        dueDate TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt TEXT DEFAULT (datetime('now', 'localtime')),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('Database initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Validate that a string is a valid role
const isValidRole = (role: string): role is User['role'] => {
  return ['student', 'teacher', 'admin'].includes(role);
};

// User operations (your existing code)
export const addUser = (user: User): number => {
  try {
    const result = db.runSync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [user.name, user.email, user.password, user.role]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const getUserByEmail = (email: string): User | null => {
  try {
    const result = db.getAllSync<{
      id: number;
      name: string;
      email: string;
      password: string;
      role: string;
    }>('SELECT * FROM users WHERE email = ?', [email]);

    if (result.length === 0) return null;

    const user = result[0];

    if (!isValidRole(user.role)) {
      console.error('Invalid role found in DB:', user.role);
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const getAllUsers = (): User[] => {
  try {
    const result = db.getAllSync<User>('SELECT * FROM users', []);
    return result;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Task operations
// Update the addTask function
// In your database.ts file, update the addTask function
export const addTask = (task: Omit<Task, 'id' | 'createdAt'>): number => {
  try {
    if (!task.userId) {
      throw new Error('User ID is required');
    }
    
    const result = db.runSync(
      'INSERT INTO tasks (title, description, dueDate, userId) VALUES (?, ?, ?, ?)',
      [
        task.title,
        task.description,
        task.dueDate,
        task.userId // Make sure this is included
      ]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};



export const getTaskById = (id: number): Task | null => {
  try {
    const result = db.getAllSync<Task>('SELECT * FROM tasks WHERE id = ?', [id]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error fetching task:', error);
    return null;
  }
};

export const getAllTasks = (userId?: number): Task[] => {
  try {
    let query = 'SELECT * FROM tasks';
    const params = [];
    
    if (userId !== undefined) {
      query += ' WHERE userId = ?';
      params.push(userId);
    }
    
    query += ' ORDER BY dueDate ASC';
    
    return db.getAllSync<Task>(query, params);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

// Update the updateTask function
export const updateTask = (task: {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  userId: number;
}): boolean => {
  try {
    const result = db.runSync(
      'UPDATE tasks SET title = ?, description = ?, dueDate = ?, userId = ? WHERE id = ?',
      [
        task.title,
        task.description,
        task.dueDate,
        task.userId,
        task.id
      ]
    );
    return result.changes > 0;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = (id: number): boolean => {
  try {
    const result = db.runSync('DELETE FROM tasks WHERE id = ?', [id]);
    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};



export default db;