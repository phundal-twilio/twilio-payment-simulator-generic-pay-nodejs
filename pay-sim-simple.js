var express = require('express');
var app = express();
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const basicAuth = require('express-basic-auth');

function defaultContentTypeMiddleware (req, res, next) {
  req.headers['content-type'] = req.headers['content-type'] || 'application/json';
  next();
}

app.use(basicAuth({
  users: { foo: 'bar' },
  challenge: true
}));

app.use(defaultContentTypeMiddleware);
app.use(bodyParser.json());

// Basic Test
// curl -H "Content-Type: application/json" --data @pay.json https://foo:bar@41ccedcc4469.ngrok.io/charge

// Test to mimic post from pay connector
// curl -X 'POST' 'https://foo:bar@b89a9d561bab.ngrok.io/charge' -H 'user-agent: AHC/2.1'  -H 'authorization: Basic Zm9vOmJhcg==' -H 'content-type: ' --data @pay.json

app.post('/charge', (req, res) => {
  // Dump contents of post string
  console.log(`Endpoint called: ${req.originalUrl}`)
  console.log(`Full JSON payload: ${JSON.stringify(req.body, null, 4)}`)

  // Process card
  let token_id = uuidv4();
  let error_code = null;
  let error_message = null;

  response = {
    "charge_id" : `${token_id}`,
    "error_code" : null,
    "error_message" : null
    };
  res.json(response);
});

app.post('/tokenize', function (req, res) {
  // Dump contents of post string
  console.log(`Endpoint called: ${req.originalUrl}`)
  console.log(`Full JSON payload: ${JSON.stringify(req.body, null, 4)}`)

  // Process card
  let token_id = uuidv4();
  let error_code = null;
  let error_message = null;

  response = {
    "token_id" : `${token_id}`,
    "error_code" : null,
    "error_message" : null
    };

  res.json(response);
});


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s\n", host, port)
});
