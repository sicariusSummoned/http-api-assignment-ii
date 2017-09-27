const crypto = require('crypto');

const users = {};

let etag = crypto.createHash('sha1').update(JSON.stringify(users));

let digest = etag.digest('hex');

const respondJSON = (request, response, status, object) => {
  const headers = {
    'Content-Type': 'application/json',
    etag: digest,
  };
  response.writeHead(status, headers);
  response.write(JSON.stringify(object));
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
    serverUsers: users,
  };

  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

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
  }else{
    users[body.name] = body;
    responseJSON.name = body.name;
    responseJSON.message = body.age;
    console.log(`Added:${body.name}`);
    console.dir(users);
  }

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

const getUsersMeta = (request, response) => {

};

const notFound = (request, response) => {
  const responseJson = {
    name: '404',
    message: 'Not Found',
    id: 'notFound',
  };
  if (request.headers['if-none-match'] === digest) {
    return respondJSONMeta(request, response, 304);
  }

  return respondJSON(request, response, 404, responseJson);
};

const notFoundMeta = (request, response) => {

};

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
