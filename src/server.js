const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname + '/dist/konw'));

app.post('/*', function(req, res) {
  res.sendFile(__dirname, './dist/konw/index.html');
});

app.listen(process.env.PORT || 8080);