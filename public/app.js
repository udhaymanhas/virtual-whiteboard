$(document).ready(function(){
    $(this).scrollTop(0);
});

var initial = {
  scrollX:window.scrollX,
  scrollY:window.scrollY
}

var canvas = document.getElementById("canvas");
var socket = io.connect();
var canvasBound = canvas.getBoundingClientRect();

var draw = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

var cursor = {
  hold: false,
  move: false,
  cur_pos: {x:0, y:0},
  prev_pos: false
}

var name;
function setName(){
  console.log($('#name').val());
  name = $('#name').val();
  $('#name').val('')
}

canvas.onmousedown = function(e){
  cursor.hold = true;
  canvas.onmousemove = function(e){
    cursor.cur_pos.x = (e.clientX-canvasBound.left+window.scrollX-initial.scrollX) / width;
    cursor.cur_pos.y = (e.clientY-canvasBound.top+window.scrollY-initial.scrollY) / height;

    cursor.move = true;

    function collectPoints(){
      if (cursor.hold && cursor.move && cursor.prev_pos) {
        if(cursor.prev_pos.x != 0 && cursor.prev_pos.y != 0){
          updateCanvas([ cursor.cur_pos, cursor.prev_pos ]);
          socket.emit('draw', {
            name: name,
            active: true,
            points: [ cursor.cur_pos, cursor.prev_pos ]
          });
          cursor.move = false;
        }
      }
      cursor.prev_pos = {x: cursor.cur_pos.x, y: cursor.cur_pos.y};
    }
    setTimeout(collectPoints, 0);

  }
}
canvas.onmouseleave = function(e){
  cursor = {
    hold: false,
    move: false,
    cur_pos: {x:0, y:0},
    prev_pos: false
  }

  socket.emit('draw', {
    name: name,
    active:false
  });
    canvas.onmousemove = function(e){
      //do nothing
    };
}

canvas.onmouseup = function(e){
  cursor = {
    hold: false,
    move: false,
    cur_pos: {x:0, y:0},
    prev_pos: false
  }

  socket.emit('draw', {
    name: name,
    active: false
  });
  canvas.onmousemove = function(e){
    //do nothing
  };
};

socket.on('connect',function(){
  console.log('connected to server');
})


function addElement(name, points){
  div = $("<div />")
      div.attr("id", name);
      div.attr("class", 'element')
      div.css("position", 'absolute')
      div.css("left", points[0].x* width)
      div.css("top", points[0].y* height)
      div.css("z-index", 99)
      div.html(name)
      $("#display").append(div)
}

var users = [];

function updateCanvas(points){
  draw.beginPath();
  draw.lineWidth = 1;
  draw.lineJoin = "round";
  draw.lineCap = "round";
  draw.moveTo(points[0].x * width , points[0].y * height );
  draw.lineTo(points[1].x * width, points[1].y * height);
  draw.strokeStyle = 'blue';
  draw.stroke();
}


var scrollOffset = {
  x:0,
  y:0
}
if(initial.scrollX > 0 || initial.scrollY > 0){
  scrollOffset.y =  initial.scrollY
  scrollOffset.x =  initial.scrollX
}

socket.on('share', function (data) {
  var points = data.points;
  if(data.active == true){

    if(users.indexOf(data.name) == -1){
      users.push(data.name); // put new user
      addElement(data.name, points) // draw new users name
    }
    else{
      //user present and active
      var top = (points[0].y*height) + canvasBound.top + scrollOffset.y;
      var left = (points[0].x*width) + canvasBound.left + scrollOffset.x;
      $('#'+data.name).css({top: top, left: left})
    }
    updateCanvas(data.points);

  }
  else
  if(data.active == false){
    // remove name Element
    users.splice(users.indexOf(data.name),1);
    $("#"+data.name).remove();
  }

});

socket.on('history', function (points) {
  console.log('History event');
  if(points.length == 2)
    updateCanvas(points);
});
