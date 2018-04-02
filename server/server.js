require('./config/server.config.js')

const PORT = process.env.PORT;
const express = require('express');
const path = require('path');

const publicPath = path.join(__dirname, `../public`)
const app = express();

app.use(express.static(publicPath));

app.get('*', function (req, res) {
    res.sendFile(path.resolve(publicPath+'/index.html'));
})

app.listen(PORT, () => {
  console.log('Server is up at:',PORT );
})
