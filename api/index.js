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

}