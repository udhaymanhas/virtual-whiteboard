var canvas = document.getElementById("canvas");
var socket = io.connect();

var draw = canvas.getContext("2d");
var width = 300;
var height = 300;
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
    cursor.cur_pos.x = e.clientX / width;
    cursor.cur_pos.y = e.clientY / height;
    console.log(cursor.cur_pos.x * width, cursor.cur_pos.y * height);
    cursor.move = true;
    function collectPoints(){
      if (cursor.hold && cursor.move && cursor.prev_pos) {
        if(cursor.prev_pos.x != 0 && cursor.prev_pos.y != 0){
          socket.emit('draw', {
            name: name,
            points: [ cursor.cur_pos, cursor.prev_pos ]
          });
          cursor.move = false;
        }
      }
      cursor.prev_pos = {x: cursor.cur_pos.x, y: cursor.cur_pos.y};
    }
    setTimeout(collectPoints, 10);

  }
}

canvas.onmouseup = function(e){
  cursor = {
    hold: false,
    move: false,
    cur_pos: {x:0, y:0},
    prev_pos: false
  }
    canvas.onmousemove = function(e){
      //do nothing
    };
};

socket.on('connect',function(){
  console.log('connected to server');
})


function drawElement(name, points){
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

socket.on('share', function (data) {
  var points = data.points;

  if($('#'+data.name).length == 0){
    drawElement(data.name, points)
    console.log('Drawing element');
  }
  else
  if($('#'+data.name).length == 1){
    $('#'+data.name).css({top: points[0].y* height, left: points[0].x* width})
  }
  draw.beginPath();
  draw.lineWidth = 1;
  draw.moveTo(points[0].x * width , points[0].y * height );
  draw.lineTo(points[1].x * width, points[1].y * height);
  draw.stroke();
});

console.log(draw);
