const express = require('express');
const router = express.Router();

// GET /plans — list all plans
router.get('/', function (req, res) {
  const plans = req.db.getAllPlans();
  res.render('plans/index', { title: 'My Plans', plans });
});

// GET /plans/new — show create plan form
router.get('/new', function (req, res) {
  res.render('plans/new', { title: 'Add Plan' });
});

// POST /plans — create a plan
router.post('/', function (req, res) {
  const { title, description } = req.body;

  if (!title || !title.trim()) {
    return res.redirect('/plans/new');
  }

  const id = req.db.createPlan(title.trim(), (description || '').trim());
  res.redirect('/plans/' + id);
});

// GET /plans/:id — plan detail with its tasks
router.get('/:id', function (req, res) {
  const plan = req.db.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  const tasks = req.db.getTasksByPlanId(plan.id);
  res.render('plans/detail', { title: plan.title, plan, tasks });
});

// GET /plans/:id/edit — edit plan form
router.get('/:id/edit', function (req, res) {
  const plan = req.db.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  res.render('plans/edit', { title: 'Edit Plan', plan });
});

// POST /plans/:id — update a plan
router.post('/:id', function (req, res) {
  const { title, description } = req.body;
  const plan = req.db.getPlanById(req.params.id);
  if (!plan) {
    return res.status(404).render('404', { title: 'Not Found' });
  }

  if (!title || !title.trim()) {
    return res.redirect('/plans/' + plan.id + '/edit');
  }

  req.db.updatePlan(plan.id, title.trim(), (description || '').trim());
  res.redirect('/plans/' + plan.id);
});

// POST /plans/:id/delete — delete a plan (and its tasks via CASCADE)
router.post('/:id/delete', function (req, res) {
  req.db.deletePlan(req.params.id);
  res.redirect('/plans');
});

module.exports = router;
