/**
 * ======= RestN.io =======
 * The website for the restnio.
 * ======= RestN.io =======
 */

// Imports
const RestNio = require('restnio');

// Main Router
new RestNio((router, rnio) => {
    // Serve main site
    router.use('', require('./www'));
    // Expose really simple sample API.
    router.use('/api', require('./api'));
    console.dir(rnio.routes);
}, {
    port: 5050 // Nginx sends to internal 5050
}).bind();