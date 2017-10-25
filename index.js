// Include the cluster module
const cluster = require('cluster');
const config = require('./config/api.json');
const { BlackHorse } = require('./services');
const async = require('asyncawait/async');
const await = require('asyncawait/await');

if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker %d died :(', worker.id);
        cluster.fork();

    });


} else {
    // Code to run if we're in a worker process
    const express = require('express');
    const app = express();

    const uuid = require('uuid-v4');

    app.get('/links', async((req, res, next) => {
        try {
            var uid = uuid();

            console.log(`id: ${uid},req.query.url: ${req.query.url}`);
            const url = `http://${req.query.url}`;
            const dom = await(BlackHorse.Run(url));
            const links = await(BlackHorse.Ways(dom, url));
            res.statusCode = 200;
            res.send(links);

        } catch (err) {
            res.statusCode = 500;
            res.send(err);
        }
    }));

    app.get('/images', async((req, res, next) => {
        try {
            var uid = uuid();

            console.log(`id: ${uid},req.query.url: ${req.query.url}`);
            const url = `http://${req.query.url}`;
            const dom = await(BlackHorse.Run(url));
            const images = await(BlackHorse.See(dom, url));
            res.statusCode = 200;
            res.send(images);

        } catch (err) {
            res.statusCode = 500;
            res.send(err);
        }
    }));

    app.get('/', (req, res, next) => {
        res.statusCode = 200;
        res.send('<a href="extract">extract</a>');
    });

    app.listen(process.env.OPENSHIFT_NODEJS_PORT);

    console.log(`worker #${cluster.worker.id}, listening on port: ${process.env.OPENSHIFT_NODEJS_PORT}`);
}



