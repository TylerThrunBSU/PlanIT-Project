const Database = require('better-sqlite3');

const createPlansTableSQL = `
  CREATE TABLE IF NOT EXISTS plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    archived INTEGER DEFAULT 0
  )`;

const createTasksTableSQL = `
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    notes TEXT DEFAULT '',
    category TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'not_started',
    due_date TEXT DEFAULT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    archived INTEGER DEFAULT 0,
    FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
  )`;

function createDatabaseManager(dbPath) {
  const database = new Database(dbPath);
  console.log('Database manager created for:', dbPath);
  database.pragma('foreign_keys = ON');
  database.exec(createPlansTableSQL);
  database.exec(createTasksTableSQL);

  function ensureConnected() {
    if (!database.open) {
      throw new Error('Database connection is not open');
    }
  }

  return {
    dbHelpers: {

      // ── Test helpers ──────────────────────────────────────────

      clearDatabase: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          database.prepare('DELETE FROM tasks').run();
          database.prepare('DELETE FROM plans').run();
        } else {
          console.warn('clearDatabase called outside of test environment. FIXME!');
        }
      },

      seedTestData: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          const insertPlan = database.prepare(
            'INSERT INTO plans (title, description) VALUES (?, ?)'
          );
          const insertTask = database.prepare(
            'INSERT INTO tasks (plan_id, title, notes, category, status, due_date) VALUES (?, ?, ?, ?, ?, ?)'
          );

          const seed = database.transaction(() => {
            insertPlan.run('CS 408 Final Project', 'Full-stack web application development');
            insertPlan.run('Spring 2026 Classes', 'Academic coursework and assignments');
            insertPlan.run('Personal Goals', 'Health and fitness objectives');

            insertTask.run(1, 'Set up Go backend', 'Initialize project structure', 'School', 'not_started', '2026-02-19');
            insertTask.run(1, 'Deploy to AWS EC2', 'Configure instance and deploy', 'School', 'not_started', '2026-01-18');
            insertTask.run(2, 'Math 310 Assignment 3', 'Complete problem set', 'School', 'in_progress', '2026-02-28');
            insertTask.run(3, 'Go to gym 3x this week', '', 'Health', 'in_progress', '2026-03-01');
            insertTask.run(3, 'Meal prep for next week', 'Prepare healthy lunches and dinners', 'Personal', 'not_started', '2026-03-02');
          });
          seed();
          console.log('Seeded test data into database');
        } else {
          console.warn('seedTestData called outside of test environment. FIXME!');
        }
      },

      // ── Plan CRUD ─────────────────────────────────────────────

      getAllPlans: () => {
        return database.prepare(`
          SELECT p.*,
            (SELECT COUNT(*) FROM tasks WHERE plan_id = p.id AND archived = 0) AS task_count
          FROM plans p
          WHERE p.archived = 0
          ORDER BY p.created_at DESC
        `).all();
      },

      getPlanById: (id) => {
        return database.prepare('SELECT * FROM plans WHERE id = ?').get(id);
      },

      createPlan: (title, description) => {
        const info = database.prepare(
          'INSERT INTO plans (title, description) VALUES (?, ?)'
        ).run(title, description || '');
        return info.lastInsertRowid;
      },

      updatePlan: (id, title, description) => {
        const info = database.prepare(
          'UPDATE plans SET title = ?, description = ? WHERE id = ?'
        ).run(title, description || '', id);
        return info.changes;
      },

      deletePlan: (id) => {
        // CASCADE will delete associated tasks
        const info = database.prepare('DELETE FROM plans WHERE id = ?').run(id);
        return info.changes;
      },

      archivePlan: (id) => {
        const info = database.prepare('UPDATE plans SET archived = 1 WHERE id = ?').run(id);
        return info.changes;
      },

      // ── Task CRUD ─────────────────────────────────────────────

      getAllTasks: ({ status, category, plan_id, sort } = {}) => {
        let sql = `
          SELECT t.*, p.title AS plan_title
          FROM tasks t
          LEFT JOIN plans p ON t.plan_id = p.id
          WHERE t.archived = 0
        `;
        const params = [];

        if (status && status !== 'all') {
          sql += ' AND t.status = ?';
          params.push(status);
        }
        if (category && category !== 'all') {
          sql += ' AND t.category = ?';
          params.push(category);
        }
        if (plan_id) {
          sql += ' AND t.plan_id = ?';
          params.push(plan_id);
        }

        switch (sort) {
          case 'status':
            sql += ' ORDER BY t.status ASC, t.due_date ASC';
            break;
          case 'created':
            sql += ' ORDER BY t.created_at DESC';
            break;
          case 'due_date':
          default:
            sql += ' ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC';
            break;
        }

        return database.prepare(sql).all(...params);
      },

      getTaskById: (id) => {
        return database.prepare(`
          SELECT t.*, p.title AS plan_title
          FROM tasks t
          LEFT JOIN plans p ON t.plan_id = p.id
          WHERE t.id = ?
        `).get(id);
      },

      getTasksByPlanId: (planId) => {
        return database.prepare(`
          SELECT * FROM tasks
          WHERE plan_id = ? AND archived = 0
          ORDER BY due_date IS NULL, due_date ASC
        `).all(planId);
      },

      createTask: (plan_id, title, notes, category, status, due_date) => {
        const info = database.prepare(`
          INSERT INTO tasks (plan_id, title, notes, category, status, due_date)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(
          plan_id,
          title,
          notes || '',
          category || '',
          status || 'not_started',
          due_date || null
        );
        return info.lastInsertRowid;
      },

      updateTask: (id, { title, notes, category, status, due_date, plan_id }) => {
        const info = database.prepare(`
          UPDATE tasks
          SET title = ?, notes = ?, category = ?, status = ?, due_date = ?, plan_id = ?
          WHERE id = ?
        `).run(title, notes || '', category || '', status, due_date || null, plan_id, id);
        return info.changes;
      },

      updateTaskStatus: (id, status) => {
        const info = database.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id);
        return info.changes;
      },

      deleteTask: (id) => {
        const info = database.prepare('DELETE FROM tasks WHERE id = ?').run(id);
        return info.changes;
      },

      archiveTask: (id) => {
        const info = database.prepare('UPDATE tasks SET archived = 1 WHERE id = ?').run(id);
        return info.changes;
      },

      // ── Dashboard / stats ─────────────────────────────────────

      getTaskStats: () => {
        return database.prepare(`
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
            SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
            SUM(CASE WHEN status = 'not_started' THEN 1 ELSE 0 END) AS not_started
          FROM tasks
          WHERE archived = 0
        `).get();
      },

      getOverdueTasks: () => {
        return database.prepare(`
          SELECT t.*, p.title AS plan_title
          FROM tasks t
          LEFT JOIN plans p ON t.plan_id = p.id
          WHERE t.archived = 0
            AND t.status != 'completed'
            AND t.due_date IS NOT NULL
            AND t.due_date < date('now')
          ORDER BY t.due_date ASC
        `).all();
      },

      getUpcomingTasks: (limit = 5) => {
        return database.prepare(`
          SELECT t.*, p.title AS plan_title
          FROM tasks t
          LEFT JOIN plans p ON t.plan_id = p.id
          WHERE t.archived = 0
            AND t.status != 'completed'
            AND t.due_date IS NOT NULL
            AND t.due_date >= date('now')
          ORDER BY t.due_date ASC
          LIMIT ?
        `).all(limit);
      },

      getCategories: () => {
        return database.prepare(`
          SELECT DISTINCT category FROM tasks
          WHERE category != '' AND archived = 0
          ORDER BY category ASC
        `).all().map(r => r.category);
      },
    }
  };
}

module.exports = {
  createDatabaseManager,
};
