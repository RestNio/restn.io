/**
 * ======= RestN.io =======
 *    Website front end.
 * ======= RestN.io =======
 */

 // Imports
 /** @typedef {import("restnio").RouteBack} RouteBack */

/**
 * @type RouteBack
 */
module.exports = (router, rnio) => {

    // Show simple text index.
    router.get('/', () => 'mep');
    // Expose resource files.
    router.use(rnio.serve(__dirname + '/resources/', {cache: true}));

}