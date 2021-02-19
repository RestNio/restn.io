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
    // router.get('/', () => 'mep');
    router.redirect('/', '/index.html');

    // Expose resource files.
    router.use(rnio.serve(__dirname + '/resources/', {cache: true}));
    // Expose NPM libraries.
    router.use(rnio.serve('./other_modules/fontawesome/', {cache: true}));
    router.use(rnio.serve('./node_modules/aos/dist/', {cache: true}));
    router.use(rnio.serve('./other_modules/highlight/', {cache: true}));

}