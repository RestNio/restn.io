/**
 * ======= RestN.io =======
 *    Website front end.
 * ======= RestN.io =======
 */

 // Imports
 /** @typedef {import("restnio").RouteBack} RouteBack */
 /** @typedef {import("restnio").Client} Client */
 
const fs = require('fs');
function file(path) {
    return fs.readFileSync(path, 'utf8')
}


/**
 * @type RouteBack
 */
module.exports = (router, rnio) => {

    // Show simple text index.
    // router.get('/', () => 'mep');
    // router.redirect('/', '/index.html');
    const index  = file(__dirname + '/index.html');
    const _404   = file(__dirname + '/404.html');
    const robots = file(__dirname + '/robots.txt');
    router.get('/', () => index);
    router.get('/robots.txt', () => robots);
    router.on('404', () => {throw [404, _404]});

    // Expose resource files.
    router.use(rnio.serve(__dirname + '/resources/', {cache: true}));
    // Expose NPM libraries.
    router.use(rnio.serve('./other_modules/fontawesome/', {cache: true}));
    router.use(rnio.serve('./node_modules/aos/dist/', {cache: true}));
    router.use(rnio.serve('./other_modules/highlight/', {cache: true}));

}