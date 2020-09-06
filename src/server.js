const express = require('express');

const serverInstance = express();

serverInstance.get('/helloworld', async function(req, res) {
    return res.status(200).json({ hello: 'world' });
});

module.exports = serverInstance;