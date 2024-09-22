const express = require('express');
const router = express.Router();
const axios = require('axios');
const registry = require('./registry.json');
const fs = require('fs');

router.all('/:apiName/**', (req, res) => {
    if (registry.services[req.params.apiName]) {
        const path = req.path.split('/').slice(2, req.path.split('/').length).join('/');
        axios({
            url: registry.services[req.params.apiName].url + path,
            method: req.method,
            data: req.method === 'GET' ? {} : req.body,
            headers: {  ...req.headers, host:registry.services[req.params.apiName].url, 'content-type': req.method === 'GET'? null : req.headers['content-type'], 'content-length': req.method === 'GET'? null : req.headers['content-length'] }
        }).then((response) => {
            res.send(response.data);
        }).catch((error) => {
            res.send(error);
        })
    } else {
        res.send('API not found');
    }
});

// {
//     'content-type': null,
//     authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1heWEiLCJpYXQiOjE3MjYwNTYzNTAsImV4cCI6MTcyNjA1NjQxMH0.dGSEXm4YIwYU2HTmmgVfuDhL2-4sKyK1RgfRxbf0AsE',
//     'user-agent': 'PostmanRuntime/7.41.2',
//     accept: '*/*',
//     'postman-token': '27240393-767b-49b3-a8c3-3c32dda05071',
//     host: 'http://localhost:3002/',
//     'accept-encoding': 'gzip, deflate, br',
//     connection: 'keep-alive',
//     'content-length': '57'
//   }
  
  router.post('/register', (req, res) => {
    const registrationInfo = req.body;
    registry.services[registrationInfo.apiName] = { ...registrationInfo};

    fs.writeFile('./routes/registry.json', JSON.stringify(registry), (error) => {
        if(error){
            res.send('Could not register the API' + registrationInfo.apiName + "'\n" + error);
        } else {
            res.send('API registered successfully' + registrationInfo.apiName + "'");
        }
    });
})

module.exports = router;