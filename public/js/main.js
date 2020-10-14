const socket = io();

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getUrl() {
  var url = document.getElementById("Url").value;
  document.getElementById("Url").value = "";
  socket.emit("getComments", url);
}

socket.on('receiveComments', (comments) => {
  console.log(comments);
  var iconTab = ['<i class="far fa-smile-wink"></i>', '<i class="far fa-meh-blank"></i>', '<i class="far fa-sad-tear"></i>']
  $(".container").remove();
  $("body").append('<div class="container"></div>');
  $(".search-box").css({ 'top': '40px' });
  for (i in comments) {
    var index = null;
    if (comments[i].score == "positive")
      index = 0;
    else if (comments[i].score == "neutral")
      index = 1;
    else
      index = 2;
    $(".container").append('<div class="comment">' + '<p>' + comments[i].comment + '</p>' + iconTab[index] + '</div>');
  }
});