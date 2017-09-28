const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));

let digest = etag.digest('hex');

const respondJSON = (request, response, status, body) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(body));
  response.end();
};

const respondJSONMeta = (request, response, status) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.end();
};

const getUsers = (request, response) => {
  const responseJSON = {
    name: 'Success',
    message: users,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');
  return respondJSON(request, response, 200, responseJSON);
};

const addUser = (request, response, body) => {
  console.dir(body);

  const responseJSON = {
    name: 'INCOMPLETE FORM',
    message: 'Name and Age are both required',
  };

  if (!body.name || !body.age) {
    responseJSON.id = 'missingParams';
    console.log('missingParams');
  } else {
    users[body.name] = body;
    responseJSON.name = body.name;
    responseJSON.message = body.age;
    console.log(`Added:${body.name}`);
    console.dir(users);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');


  return respondJSON(request, response, 200, responseJSON);
};

const updateUsers = (request, response, body) => {
  const updatingUser = {
    name: body.name,
    age: body.age,
    createdAt: Date.now(),
  };

  users[updatingUser.name] = updatingUser;

  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');

  return respondJSON(request, response, 201, updatingUser);
};

const getUsersMeta = (request, response) => respondJSONMeta(request, response, 304);

const notFound = (request, response) => {
  const responseJSON = {
    name: '404',
    message: 'Not Found',
    id: 'notFound',
  };
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  etag = crypto.createHash('sha1').update(JSON.stringify(users));
  digest = etag.digest('hex');

  return respondJSON(request, response, 404, responseJSON);
};

const notFoundMeta = (request, response) => respondJSONMeta(request, response, 304);

module.exports = {
  respondJSON,
  respondJSONMeta,
  getUsers,
  updateUsers,
  addUser,
  getUsersMeta,
  notFound,
  notFoundMeta,
};
