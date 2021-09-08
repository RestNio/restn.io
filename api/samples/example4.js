/**
 * Example #4 - Permissions
 * A big pre of RestNio is the built-in permissions system.
 * With JWT tokens permissions can be granted and used.
 */

const { params } = require("restnio");

// The following 2 lines help with type-definitions in (for example) vscode.
/** @typedef {import("restnio").RouteBack} RouteBack */
/** @type RouteBack */
module.exports = (router, rnio) => {
    // Defining a route with a permission is quite easy:
    router.get('/hidden', {
        // Client requires the permission 'hidden'
        permissions: ['hidden'],
        func: () => 'Hidden Hello!'
    });
    // The above API route can only be used with the correct permission.
    // Permissions can be granted to a client object. This makes sense
    // mostly in the context of websockets. HTTP clients (webrequests)
    // usually work with either a TOKEN header or cookie token.
    // RestNio supports both options on default. 
    // Let's give the client such a token.
    router.get('/gettoken', async (params, client) => {
        // Set a HTTP cookie with the token.
        client.cookie('token', await rnio.token.grant(
        ['hidden', 'call.kasper'], {
            expiresIn: '1m'
        }));
        return 'Access granted!';
    });
    // Notice how the token is granted with an async await pattern.
    // After running the /gettoken request and setting the cookie header
    // the client can now use the /hidden request for 1 minute (then the token expires)
    // We can also set parameter based permissions like:
    router.get('/call', {
        params: {
            name: rnio.$p.string
        },
        // User needs both hidden and call.:name permission.
        permissions: ['hidden', 'call.:name'],
        func: (params) => `Calling ${params.name}`
    });
    // Now a user needs a permission based on the name used.
    // With the token from before the user can only use call with 'kasper'.
    // We can also use regex or wildcards when giving permissions:
    router.get('/getmastertoken', async (params, client) => {
        // Set a HTTP cookie with the token.
        client.cookie('token', await rnio.token.grant(
        ['hidden', 'call.*', 'song.*'], {
            expiresIn: '1m'
        }));
        return 'Master access granted!';
    });
    // This also works with url parameters:
    router.get('/yodl/:song', {
        params: {
            song: rnio.$p.string
        },
        permissions: ['song.:song.yodl'],
        func: (params) => `Yodelaaa-${params.song}-tiio`
    });
    
};