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
  let transaction_id = req.body.transaction_id;
  let firstFour = req.body.cardnumber.substr(0,4) || '4111';
  let curexp = req.body.expiry_year + req.body.expiry_month;
  let description = JSON.parse(req.body.description) || JSON.parse("{}");

  const thisYear = new Date().getFullYear();
  const thisMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
  let twoDigitYear = thisYear.toString().substr(2,4);
  let twoDigitMonth = ("0" + (thisMonth + 1)).slice(-2);
  let minExpiry = twoDigitYear + twoDigitMonth.toString();

  console.log(`Endpoint called: ${req.originalUrl}`)
  console.log(`Full JSON payload: ${JSON.stringify(req.body, null, 4)}`)
  console.log(`Description Field (parsed): ${JSON.stringify(description, null, 4)}\n`)

  // Process card
  let response = {};
  let charge_id = '';
  let error_code = null;
  let error_message = null;
  if ( firstFour === '5555' ) { // if mastercard, go ahead
    if (minExpiry <= curexp) { // check expiry year/month
      charge_id = uuidv4(); //good to go, process
    } else { // Expiry not valid
      error_code = 'expired001';
      error_message = 'Expired card.'
    }
  } else { // Not mastercard, no other cards supported
    charge_id = "failed"
    error_code = 'invalid001';
    error_message = 'Card number not accepted.'
  }

  // Respond with appropriate transaction ID or error message

  if ( error_code === null ) { // If there are no errors, let's send back the transaction ID
    response =
    {
      "charge_id" : `${charge_id}`,
      "error_code" : null,
      "error_message" : null
    };
  } else { // There are errors, let's provide the error codes
    response = {
      "charge_id" : null,
      "error_code" : `${error_code}`,
      "error_message" : `${error_message}`
    };
  }
  res.json(response);
});

app.post('/tokenize', function (req, res) {
  let transaction_id = req.body.transaction_id;
  let firstFour = req.body.cardnumber.substr(0,4) || '4111';
  let curexp = req.body.expiry_year + req.body.expiry_month;
  let description = JSON.parse(req.body.description) || JSON.parse("{}");

  const thisYear = new Date().getFullYear();
  const thisMonth = ("0" + (new Date().getMonth() + 1)).slice(-2);
  let twoDigitYear = thisYear.toString().substr(2,4);
  let twoDigitMonth = ("0" + (thisMonth + 1)).slice(-2);
  let minExpiry = twoDigitYear + twoDigitMonth.toString();

  console.log(`Endpoint called: ${req.originalUrl}`)
  console.log(`Full JSON payload: ${JSON.stringify(req.body, null, 4)}`)
  console.log(`Description Field (parsed): ${JSON.stringify(description, null, 4)}\n`)


  // Process card
  let response = {};
  let token_id = '';
  let error_code = null;
  let error_message = null;
  if ( firstFour === '5555' ) {
    if (minExpiry <= curexp) {
      token_id = uuidv4();
    } else {
      error_code = 'expired001';
      error_message = 'Expired card.'
    }
  } else {
    token_id = "failed"
    error_code = 'invalid001';
    error_message = 'Card number not accepted.'
  };

  if ( error_code === null ){
    response = {
      "token_id" : `${token_id}`,
      "error_code" : null,
      "error_message" : null
      };
  } else {
    response = {
      "token_id" : null,
      "error_code" : `${error_code}`,
      "error_message" : `${error_message}`
      };
  }
  res.json(response);
});


var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("App listening at http://%s:%s\n", host, port)
});
