const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname,  './dist/konw')));

app.get('/', function(req, res) {
  res.sendFile(__dirname, './dist/konw/index.html');
});

app.listen(process.env.PORT || 8080);