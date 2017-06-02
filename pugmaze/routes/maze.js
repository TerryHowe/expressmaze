var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var TextMaze = require('textmaze').TextMaze

var rooms = {}
MongoClient.connect('mongodb://billy:bob@ds161001.mlab.com:61001/maze', function (err, db) {
  if (err) throw err
  db.collection('rooms').find().toArray(function (err, result) {
    if (err) throw err
    result.forEach(function(room) {
      Object.keys(room.passages).forEach(function(key) {
        room.passages[key] = result[room.passages[key]];
      });
    });
    result.forEach(r => {
      r.getBackwardDirection = function(direction) {
        switch (direction) {
        case 'N':
          return('S');
        case 'E':
          return('W');
        case 'S':
          return('N');
        default:
          return('E');
        }
      };
      r.getLeftDirection = function(direction) {
        switch (direction) {
        case 'N':
          return('W');
        case 'E':
          return('N');
        case 'S':
          return('E');
        default:
          return('S');
        }
      };
      r.getRightDirection = function(direction) {
        switch (direction) {
        case 'N':
          return('E');
        case 'E':
          return('S');
        case 'S':
          return('W');
        default:
          return('N');
        }
      };
      r.goForward = function(direction) {
        return(this.passages[direction]);
      };
      r.goBackward = function(direction) {
        return(this.passages[this.getBackwardDirection(direction)]);
      };
      r.goLeft = function(direction) {
        return(this.passages[this.getLeftDirection(direction)]);
      };
      r.goRight = function(direction) {
        return(this.passages[this.getRightDirection(direction)]);
      };
      r.toString = function() {
        return(this.x.toString() + "," + this.y.toString());
      };
      r.getKey = function() {
        return(this.x.toString() + "," + this.y.toString());
      };
      rooms[r.x.toString() + "," + r.y.toString()] = r;
    });
  })
})

class Maze {

  constructor() {
    this.textmaze = new TextMaze();
  }

  getRoom(x, y) {
    return(rooms[x.toString() + "," + y.toString()]);
  }

  render(x, y, direction) {
    let room = this.getRoom(x, y);
    if (typeof room === 'undefined') {
      this.header = 'no where';
      return 'nada';
    }
    this.header = direction + " from " + room.getKey();
    return(this.textmaze.render(room, direction));
  }

  handleKeyDown(e) {
    switch (e.key) {
    case 'w':
      this.goForward();
      this.view = this.render();
      break;
    case 'a':
      this.goLeft();
      this.view = this.render();
      break;
    case 's':
      this.goBackward();
      this.view = this.render();
      break;
    case 'd':
      this.goRight();
      this.view = this.render();
      break;
    default:
      return;
    }
    return;
  }

  goForward() {
    let room = this.getRoom();
    if (typeof room === 'undefined') {
      return;
    }
    let destination = room.goForward(this.direction)
    if (typeof destination === 'undefined') {
      return;
    }
    this.x = destination.x;
    this.y = destination.y;
  }

  goBackward() {
    let room = this.getRoom();
    if (typeof room === 'undefined') {
      return;
    }
    let destination = room.goBackward(this.direction)
    if (typeof destination === 'undefined') {
      return;
    }
    this.x = destination.x;
    this.y = destination.y;
  }

  goLeft() {
    switch (this.direction) {
    case 'N':
      this.direction = 'W';
      break;
    case 'E':
      this.direction = 'N';
      break;
    case 'S':
      this.direction = 'E';
      break;
    default:
      this.direction = 'S';
      break;
    }
  }

  goRight() {
    switch (this.direction) {
    case 'N':
      this.direction = 'E';
      break;
    case 'E':
      this.direction = 'S';
      break;
    case 'S':
      this.direction = 'W';
      break;
    default:
      this.direction = 'N';
      break;
    }
  }
}
 
router.get('/:x/:y/:direction', function(req, res, next) {
  res.render('maze', {
    title: 'Express 3D Maze',
    params: req.params,
    textview: new Maze().render(req.params.x, req.params.y, req.params.direction)
  });
});

module.exports = router;
