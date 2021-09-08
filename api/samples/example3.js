/**
 * Example #3 - Params & Objects
 * Note that the main setup has been left out.
 * This router can actually be imported in another 
 * (such as the route router) using for example:
 * router.use('/example3', require(__dirname + '/samples/example3'), true);
 */

// The following 2 lines help with type-definitions in (for example) vscode.
/** @typedef {import("restnio").RouteBack} RouteBack */
/** @type RouteBack */
module.exports = (router, rnio) => {
    // The router accepts all query or post or json parameters.
    // They can be used in the javascript sense.
    router.get('/hello', (params) => `Hello ${params.name}`);
    // The function can return quite a lot. A string is send as regular HTML.
    // On default a promise is only send after completion and an object is send as JSON.
    router.get('/object', () => ({type:'test', working: true}));
    // Currently we have seen mostly the short notation.
    // Route definitions can also be given with object instructions.
    // This makes defining parameters easier.
    router.get('/test', {
        func: () => {
            return 'it works!'
        }
    });
    // Let's get creative with parameters. We can force them to be here:
    router.get('/hi', {
        params: {
            name: {
                required: true
            }
        },
        func: (params) => `Hi ${params.name}`
    });
    // We can specify the type and perform checks on it:
    router.get('/times10', {
        params: {
            number: {
                required: true,
                // Type refers to the javascript 'instanceof' type.
                type: 'number',
                // Check is an array of functions that can be used to check the parameter.
                // If a check fails, the function is not executed.
                checks: [
                    (num) => num < 10
                ]
            }
        },
        func: (params) => `Your answer is ${params.number * 10}`
    });
    // We can also do formatting:
    router.get('/touppercase', {
        params: {
            text: {
                required: true,
                type: 'string',
                // Similar to checks, formatters are executed before
                // the function runs and done in order.
                formatters: [
                    (str) => str.toUpperCase(),
                    (str) => `${str} is awesome!`
                ]
            }
        },
        func: (params) => `Your text: ${params.text}`
    });
    // Most of these functions have been built in. We can specify checks like:
    router.get('/search', {
        params: {
            query: {
                required: true,
                type: 'string',
                // restnio reference. $p is short for parameters.
                // $c for checks and $f for formatters.
                checks: [rnio.$p.$c.str.min(3)],
                formatters: [rnio.$p.$f.str.toUpperCase()]
            }
        },
        func: (params) => `No results for ${params.query}!`
    });
    // Or sometimes you just need any required string and date.
    router.get('/congratulate', {
        params: {
            name: rnio.$p.string,
            birthday: rnio.$p.date
        },
        func: (params) => `Congratz! ${params.name} just turned ${diffYears(params.birthday, new Date())}!`
    });
};

// Helper function
function diffYears(dateold, datenew) {
    let ynew = datenew.getFullYear();
    let mnew = datenew.getMonth();
    let dnew = datenew.getDate();
    let yold = dateold.getFullYear();
    let mold = dateold.getMonth();
    let dold = dateold.getDate();
    let diff = ynew - yold;
    if (mold > mnew) diff--;
    else {
        if (mold == mnew) {
            if (dold > dnew) diff--;
        }
    }
    return diff;
}