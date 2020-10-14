const express = require('express');
const app = express();
const server = app.listen(process.env.PORT || 8000)
const io = require('socket.io').listen(server);
const Sentiment = require('sentiment');
const request = require('request');
const { errorMonitor } = require('http-proxy');
const sentiment = new Sentiment();
const apiKey = "AIzaSyBkebGrpaftRVxxMyTydJeeAc4Wi5luzmM";

//https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=qUit8s9Jwa4&key=AIzaSyBkebGrpaftRVxxMyTydJeeAc4Wi5luzmM&order=relevance

function getVideoId(url) {
	var cutUrl = url.substring(url.indexOf("?v=") + 3);
	return (cutUrl);
}

function analayseAndEmit(array, socket) {
	var data = [];
	for (i in array) {
		var result = "";
		score = sentiment.analyze(array[i]).score
		if (score > 0)
			result = "positive";
		else if (score == 0)
			result = "neutral";
		else
			result = "negative";
		data.push({"comment" : array[i], "score" : result});
	}
	console.log("emitting socket message");
	return(socket.emit("receiveComments", data));
}

io.sockets.on('connection', function (socket) {
	socket.on('getComments', function(data) {
		console.log("received socket call");
		var commentsArray = [];
		var videoId = getVideoId(data);
		console.log(videoId);
		request('https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=' + videoId + '&key=' + apiKey + '&order=relevance', function (error, response, body) {
			if (error) {
				console.log(error);
			}
			console.log(response.statusCode);
			var data = JSON.parse(body);
			for (i in data.items) {
				commentsArray.push(data.items[i].snippet.topLevelComment.snippet.textOriginal);
			}
			analayseAndEmit(commentsArray, socket);
			return;
		});
	});
});
app.use(express.json());

app.use(express.static(__dirname + '/public'));

app.set('views', __dirname + 'public/views');

app.get('/', function(req, res) {
	res.status(200);
	res.sendFile(__dirname + "/public/views/index.html")
});