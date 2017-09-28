const http = require('http');
const url = require('url');
const query = require('querystring');
const htmlHandler = require('./htmlResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  if (request.method === 'GET') {
    switch (parsedUrl.pathname) {
      case '/':
        htmlHandler.getIndex(request, response);
        break;
      case '/style.css':
        htmlHandler.getCSS(request, response);
        break;
      case '/getUsers':
        jsonHandler.getUsers(request, response);
        break;
      case '/notReal':
        jsonHandler.notFound(request, response);
        break;
      default:
        jsonHandler.notFound(request, response);
    }
  } else if (request.method === 'HEAD') {
    switch (parsedUrl.pathname) {
      case '/getUsers':
        jsonHandler.getUsersMeta(request, response);
        break;
      default:
        jsonHandler.notFoundMeta(request, response);
        break;
    }
  } else if (request.method === 'POST') {
    const res = response;

    const body = [];

    request.on('error', (err) => {
      console.dir(err);
      res.statusCode = 400;
      res.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      const bodyParams = query.parse(bodyString);


      switch (parsedUrl.pathname) {
        case '/updateUsers':
          jsonHandler.updateUsers(request, response, bodyParams);
          break;
        case '/addUser':
          jsonHandler.addUser(request, response, bodyParams);
          break;
        default:
          jsonHandler.notFound(request, response);
          break;
      }
    });
  } else {
    jsonHandler.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port);

console.log(`Listening on 127.0.0.1: ${port}`);
