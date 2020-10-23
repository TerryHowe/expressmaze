var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient
var TextMaze = require('textmaze').TextMaze

var rooms = {}
MongoClient.connect('mongodb://eddie:1L1M8vWhsiK2fvD7@maze-shard-00-00.k3aki.mongodb.net:27017,maze-shard-00-01.k3aki.mongodb.net:27017,maze-shard-00-02.k3aki.mongodb.net:27017/maze?ssl=true&replicaSet=atlas-2dai9a-shard-0&authSource=admin&retryWrites=true&w=majority', function (err, db) {
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

  constructor(x, y, direction) {
    this.textmaze = new TextMaze();
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  getRoom() {
    return(rooms[this.x.toString() + "," + this.y.toString()]);
  }

  render() {
    let room = this.getRoom();
    if (typeof room === 'undefined') {
      this.header = 'no where';
      return 'nada';
    }
    this.header = this.direction + " from " + room.getKey();
    return(this.textmaze.render(room, this.direction));
  }

  getLeft() {
    let direction;
    switch (this.direction) {
    case 'N':
      direction = 'W';
      break;
    case 'E':
      direction = 'N';
      break;
    case 'S':
      direction = 'E';
      break;
    default:
      direction = 'S';
      break;
    }
    return("/maze/" + this.x + "/" + this.y + "/" + direction);
  }

  getBackward() {
    let room = this.getRoom();
    if (typeof room === 'undefined') {
      return('');
    }
    let destination = room.goBackward(this.direction)
    if (typeof destination === 'undefined') {
      return('');
    }
    return("/maze/" + destination.x + "/" + destination.y + "/" + this.direction);
  }

  getRight() {
    let direction;
    switch (this.direction) {
    case 'N':
      direction = 'E';
      break;
    case 'E':
      direction = 'S';
      break;
    case 'S':
      direction = 'W';
      break;
    default:
      direction = 'N';
      break;
    }
    return("/maze/" + this.x + "/" + this.y + "/" + direction);
  }

  getForward() {
    let room = this.getRoom();
    if (typeof room === 'undefined') {
      return('');
    }
    let destination = room.goForward(this.direction)
    if (typeof destination === 'undefined') {
      return('');
    }
    return("/maze/" + destination.x + "/" + destination.y + "/" + this.direction);
  }
}

 
router.get('/:x/:y/:direction', function(req, res, next) {
  maze = new Maze(req.params.x, req.params.y, req.params.direction);
  res.render('maze', {
    title: 'Express 3D Maze',
    params: req.params,
    nav: {
        left: maze.getLeft(),
        backward: maze.getBackward(),
        right: maze.getRight(),
        forward: maze.getForward()
    },
    textview: maze.render()
  });
});

module.exports = router;
