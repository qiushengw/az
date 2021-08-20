const auth = require("./auth");
const axios = require('axios');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const calApi = async function(jsonData) {
    const authResponse = await auth.getToken(auth.tokenRequest);
    console.log(authResponse);

    const options = {
        headers: {
            Authorization: `Bearer ${authResponse.accessToken}`,
            "x-smbcapac-messageid": "11111",
            "x-smbcapac-country": "SG",
            "Content-Type": "application/json"
        }
    };

    console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.default.post(auth.apiConfig.uri, jsonData, options);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error)
        return error;
    }
};



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.post('/qrcode', (request, response) => {

    console.log("req.body.proxyType" + request.body.proxyValue);
    var inputData = {
        "proxyType": "UEN",
        "proxyValue": request.body.proxyValue,
        "amount": request.body.amount,
        "referenceText": request.body.referenceText,
        "qrcodeSize": 40,
        "expiryDate": request.body.expiryDate
    }

    calApi(inputData).then(data => {
        response.render('display', { title: 'test', result: data });
    }).catch(e => {
        //handle error case here when your promise fails
        console.log(e)
    })
})

app.use('/', indexRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});
module.exports = app;