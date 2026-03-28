const express = require('express');
const router = express.Router();

// GET landing page
router.get('/', function (req, res) {
  res.render('index', { title: 'Welcome to PlanIT' });
});

// GET dashboard
router.get('/dashboard', function (req, res) {
  const stats = req.db.getTaskStats();
  const overdue = req.db.getOverdueTasks();
  const upcoming = req.db.getUpcomingTasks(5);

  res.render('dashboard', {
    title: 'Dashboard',
    stats,
    overdue,
    upcoming,
  });
});

module.exports = router;
