const Database = require('better-sqlite3');

const createTodosTableSQL = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )`;


function createDatabaseManager(dbPath) {
  const database = new Database(dbPath);
  console.log('Database manager created for:', dbPath);
  database.pragma('foreign_keys = ON');
  database.exec(createTodosTableSQL);

  function ensureConnected() {
    if (!database.open) {
      throw new Error('Database connection is not open');
    }
  }
  return {
    dbHelpers: {

      clearDatabase: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          database.prepare('DELETE FROM todos').run();
        } else {
          console.warn('clearDatabase called outside of test environment. FIXME!');
        }
      },

      seedTestData: () => {
        if (process.env.NODE_ENV === 'test') {
          ensureConnected();
          const insert = database.prepare('INSERT INTO todos (task, completed) VALUES (?, ?)');
          const testData = [
            { task: 'Test task 1', completed: 0 },
            { task: 'Test task 2', completed: 1 },
            { task: 'Test task 3', completed: 0 },
          ];
          const insertMany = database.transaction((todos) => {
            for (const todo of todos) insert.run(todo.task, todo.completed);
          });
          insertMany(testData);
          console.log('Seeding test data into database');
        } else {
          console.warn('seedTestData called outside of test environment. FIXME!');

        }
      },

      getAllTodos: () => {
        return database.prepare('SELECT * FROM todos ORDER BY id DESC').all();
      },

      getTodoById: (id) => {
        return database.prepare('SELECT * FROM todos WHERE id = ?').get(id);
      },

      createTodo: (task) => {
        const info = database.prepare('INSERT INTO todos (task) VALUES (?)').run(task);
        return info.lastInsertRowid;
      },

      updateTodo: (id, task, completed) => {
        const info = database.prepare('UPDATE todos SET task = ?, completed = ? WHERE id = ?')
          .run(task, completed ? 1 : 0, id);
        return info.changes;
      },

      deleteTodo: (id) => {
        const info = database.prepare('DELETE FROM todos WHERE id = ?').run(id);
        return info.changes;
      },

      toggleTodo: (id) => {
        const info = database.prepare('UPDATE todos SET completed = NOT completed WHERE id = ?').run(id);
        return info.changes;
      },
      getTotalTodos: () => {
        return database.prepare('SELECT COUNT(*) AS c FROM todos').get().c;
      },

      getCompletedTodos: () => {
        return database.prepare('SELECT COUNT(*) AS c FROM todos WHERE completed > 0').get().c;
      },
    }
  };
}


module.exports = {
  createDatabaseManager,
};
