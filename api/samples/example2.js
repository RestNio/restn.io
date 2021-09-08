/**
* Example #2 - Basic get requests & project setup
*/
module.exports = (router, rnio) => {
    // Register the index route with a simple get request.
    // We can simply use a very short hand notation for something basic. 
    router.get('/', () => 'Hello World');
    // Or use a fuller notation that for instance uses a required string query parameter:
    router.get('/hello', {
        params: {
            name: rnio.params.string
        },
        func: (params) => {
            return `Hello ${params.name}!`;
        }
    });
    // Of course we can use all HTTP functions like POST or PUT.
    router.post('/post', () => 'registered');
    // In this case only a POST request registers. We can also do eveyrthing:
    router.all('/all', () => 'Works either way');
    // On default requests are exposed to websocket connections automatically.
    // If you don't need or want this you can turn off websockets entirely in the options
    // Or specify a http only route like this:
    router.httpGet('/httponly', () => 'No Websocket');
    // We can also specify a websocket only route:
    router.ws('/ws', () => 'Yes Websocket');
// After the router we can specify some options to the server.
// This includes stuff like the port, turning on/off certain features and proxy options.
};