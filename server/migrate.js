require('dotenv').config();
const db = require('./db');

const migrate = async () => {
    await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_code VARCHAR(20) UNIQUE NOT NULL,
      task_name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      target_hours DECIMAL(4,2) NOT NULL,
      color VARCHAR(10) DEFAULT '#6366f1',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS timesheet_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      entry_date DATE NOT NULL,
      hours_logged DECIMAL(4,2) NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, task_id, entry_date)
    );

    CREATE TABLE IF NOT EXISTS daily_reflections (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      reflection_date DATE NOT NULL,
      what_went_well TEXT,
      what_was_missed TEXT,
      plan_for_tomorrow TEXT,
      auto_suggestions JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, reflection_date)
    );
  `);
    console.log('✅ Tables created');
    process.exit(0);
};

migrate().catch(err => { console.error(err); process.exit(1); });