import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Get current directory
const __dirname = dirname(fileURLToPath(import.meta.url));

// Configure lowdb to use JSON file for storage
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Set default data
const defaultData = { 
  users: [],
  habits: [],
  habitLogs: []
};

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = 'your-secret-key';

// Initialize database
async function initDb() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

// Authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Bearer token is required' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Register a new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    await db.read();
    
    // Check if user already exists
    const existingUser = db.data.users.find(user => user.email === email);
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Add to database
    db.data.users.push(newUser);
    await db.write();
    
    // Create token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    await db.read();
    
    // Find user
    const user = db.data.users.find(user => user.email === email);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    await db.read();
    
    const user = db.data.users.find(user => user.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data (excluding password)
    const { password, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Habit Routes

// Get all habits for a user
app.get('/api/habits', authenticate, async (req, res) => {
  try {
    await db.read();
    
    const habits = db.data.habits.filter(habit => habit.userId === req.user.id);
    
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new habit
app.post('/api/habits', authenticate, async (req, res) => {
  try {
    const { name, description, type } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }
    
    await db.read();
    
    // Create new habit
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      description: description || '',
      type,
      createdAt: new Date().toISOString(),
      userId: req.user.id
    };
    
    // Add to database
    db.data.habits.push(newHabit);
    await db.write();
    
    res.status(201).json(newHabit);
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a habit
app.put('/api/habits/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    await db.read();
    
    // Find habit index
    const habitIndex = db.data.habits.findIndex(habit => 
      habit.id === id && habit.userId === req.user.id
    );
    
    if (habitIndex === -1) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Update habit
    db.data.habits[habitIndex] = {
      ...db.data.habits[habitIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await db.write();
    
    res.json(db.data.habits[habitIndex]);
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a habit
app.delete('/api/habits/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.read();
    
    // Find habit
    const habit = db.data.habits.find(habit => 
      habit.id === id && habit.userId === req.user.id
    );
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Remove habit
    db.data.habits = db.data.habits.filter(h => h.id !== id);
    
    // Remove associated habit logs
    db.data.habitLogs = db.data.habitLogs.filter(log => log.habitId !== id);
    
    await db.write();
    
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Habit Log Routes

// Get all habit logs for a user
app.get('/api/habit-logs', authenticate, async (req, res) => {
  try {
    const { date, habitId } = req.query;
    
    await db.read();
    
    // Get user's habits
    const userHabits = db.data.habits.filter(habit => habit.userId === req.user.id);
    const userHabitIds = userHabits.map(habit => habit.id);
    
    // Filter logs
    let logs = db.data.habitLogs.filter(log => userHabitIds.includes(log.habitId));
    
    if (date) {
      logs = logs.filter(log => log.date === date);
    }
    
    if (habitId) {
      logs = logs.filter(log => log.habitId === habitId);
    }
    
    res.json(logs);
  } catch (error) {
    console.error('Get habit logs error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create or update a habit log
app.post('/api/habit-logs', authenticate, async (req, res) => {
  try {
    const { habitId, date, completed, notes } = req.body;
    
    if (!habitId || !date) {
      return res.status(400).json({ error: 'Habit ID and date are required' });
    }
    
    await db.read();
    
    // Check if the habit belongs to the user
    const habit = db.data.habits.find(h => h.id === habitId && h.userId === req.user.id);
    
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }
    
    // Check if log already exists
    const existingLogIndex = db.data.habitLogs.findIndex(
      log => log.habitId === habitId && log.date === date
    );
    
    if (existingLogIndex !== -1) {
      // Update existing log
      db.data.habitLogs[existingLogIndex] = {
        ...db.data.habitLogs[existingLogIndex],
        completed,
        notes: notes || db.data.habitLogs[existingLogIndex].notes,
        updatedAt: new Date().toISOString()
      };
      
      await db.write();
      
      return res.json(db.data.habitLogs[existingLogIndex]);
    }
    
    // Create new log
    const newLog = {
      id: crypto.randomUUID(),
      habitId,
      date,
      completed,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };
    
    // Add to database
    db.data.habitLogs.push(newLog);
    await db.write();
    
    res.status(201).json(newLog);
  } catch (error) {
    console.error('Create/update habit log error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});