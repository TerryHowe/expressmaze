var express = require('express');
var router = express.Router();

router.get('/:x/:y/:direction', function(req, res, next) {
  res.render('maze', {
    title: 'Express 3D Maze',
    params: req.params,
    textview: 'blah'
  });
});

module.exports = router;
