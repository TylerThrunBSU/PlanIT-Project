const express = require('express');
const router = express.Router();

// GET /tasks — list all tasks with optional filters
router.get('/', function (req, res) {
  const { status, category, sort, plan_id } = req.query;

  const tasks = req.db.getAllTasks({
    status: status || 'all',
    category: category || 'all',
    plan_id: plan_id || null,
    sort: sort || 'due_date',
  });

  const categories = req.db.getCategories();
  const plans = req.db.getAllPlans();

  res.render('tasks/index', {
    title: 'My Tasks',
    tasks,
    categories,
    plans,
    filters: { status: status || 'all', category: category || 'all', sort: sort || 'due_date' },
  });
});

// GET /tasks/new — show create task form
router.get('/new', function (req, res) {
  const plans = req.db.getAllPlans();
  const preselectedPlanId = req.query.plan_id || '';

  res.render('tasks/new', {
    title: 'Add New Task',
    plans,
    preselectedPlanId,
  });
});

// POST /tasks — create a task
router.post('/', function (req, res) {
  const { plan_id, title, notes, category, status, due_date } = req.body;

  if (!title || !title.trim() || !plan_id) {
    const plans = req.db.getAllPlans();
    return res.render('tasks/new', {
      title: 'Add New Task',
      plans,
      preselectedPlanId: plan_id || '',
      error: 'Task title and plan are required.',
    });
  }

  const id = req.db.createTask(
    parseInt(plan_id),
    title.trim(),
    (notes || '').trim(),
    (category || '').trim(),
    status || 'not_started',
    due_date || null
  );
  res.redirect('/tasks/' + id);
});

// GET /tasks/:id — task detail
router.get('/:id', function (req, res) {
  const task = req.db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  res.render('tasks/detail', { title: task.title, task });
});

// GET /tasks/:id/edit — edit task form
router.get('/:id/edit', function (req, res) {
  const task = req.db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  const plans = req.db.getAllPlans();
  res.render('tasks/edit', { title: 'Edit Task', task, plans });
});

// POST /tasks/:id — update a task
router.post('/:id', function (req, res) {
  const task = req.db.getTaskById(req.params.id);
  if (!task) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  const { title, notes, category, status, due_date, plan_id } = req.body;

  if (!title || !title.trim() || !plan_id) {
    return res.redirect('/tasks/' + task.id + '/edit');
  }

  req.db.updateTask(task.id, {
    title: title.trim(),
    notes: (notes || '').trim(),
    category: (category || '').trim(),
    status: status || task.status,
    due_date: due_date || null,
    plan_id: parseInt(plan_id),
  });

  res.redirect('/tasks/' + task.id);
});

// POST /tasks/:id/status — quick status update (from list page buttons)
router.post('/:id/status', function (req, res) {
  const { status } = req.body;
  const validStatuses = ['not_started', 'in_progress', 'completed'];

  if (validStatuses.includes(status)) {
    req.db.updateTaskStatus(req.params.id, status);
  }

  // Redirect back to wherever they came from
  const referer = req.get('Referer') || '/tasks';
  res.redirect(referer);
});

// POST /tasks/:id/delete — delete a task
router.post('/:id/delete', function (req, res) {
  req.db.deleteTask(req.params.id);

  // If they came from a plan detail page, go back there
  const referer = req.get('Referer') || '/tasks';
  if (referer.includes('/plans/')) {
    return res.redirect(referer);
  }
  res.redirect('/tasks');
});

module.exports = router;
