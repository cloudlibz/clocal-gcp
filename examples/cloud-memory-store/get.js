var request = require('request');

var options = {
  method: 'GET',
  url:
    'http://localhost:7070/v1beta1/projects/testProject/locations/us-east-1/instances/redisTest123',
  headers: {
    'Cache-Control': 'no-cache',
  },
};

request(options, function(error, response, body) {
  if (error) throw new Error(error);

  console.log(body);
});
