const express = require('express');
const helmet = require('helmet');
const app = express();
const routes = require('./routes');
const PORT = 3000;



app.use(express.json());
app.use(helmet());
app.use((req,res,next) =>{
    req.time = new Date(Date.now()).toString();
    console.log(req.method,req.hostname, req.path, req.time);
    next();
});
app.use('/', routes);

app.listen(PORT, () => {
    console.log(`API Gateway is running on port ${PORT}`);
})