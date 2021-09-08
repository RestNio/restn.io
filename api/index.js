/**
 * ======= RestN.io =======
 *     Simple sample API
 * ======= RestN.io =======
 */

 // Imports
 /** @typedef {import("restnio").RouteBack} RouteBack */

/**
 * @type RouteBack
 */
module.exports = (router, rnio) => {

    // Redirect to index.
    router.redirect('', '/');
    // Show simple text index.
    router.get('/', () => 'It works!');

    // Expose Examples
    router.use('/example1', require(__dirname + '/samples/example1'), true);
    router.use('/example2', require(__dirname + '/samples/example2'), true);
    router.use('/example3', require(__dirname + '/samples/example3'), true);
    router.use('/example4', require(__dirname + '/samples/example4'), true);


}