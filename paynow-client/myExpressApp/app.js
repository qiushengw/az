const auth = require("./auth");
const axios = require('axios');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const { data } = require("jquery");

const calApi = async function(jsonData, subscriptionKey) {
    const authResponse = await auth.getToken(auth.tokenRequest);
    console.log(authResponse);

    const options = {
        headers: {
            Authorization: `Bearer ${authResponse.accessToken}`,
            "Cache-Control": "no-cache",
            "x-smbcapac-messageid": "11111",
            "x-smbcapac-country": "SG",
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": subscriptionKey
        }
    };

    console.log('request made to web API at: ' + new Date().toString());

    try {
        const response = await axios.default.post(auth.apiConfig.uri, jsonData, options)
            .catch(function(error) {
                console.log("ziqing is coming1: " + JSON.stringify(error.response.data));
                console.log("ziqing is coming2: " + error.response.status); //400
                return error;
            });
        return response;
    } catch (error) {
        console.log("error is coming: " + JSON.stringify(error));
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

    calApi(inputData, request.body.subscriptionKey).then(apiResponse => {

        if (apiResponse.status == 200 || apiResponse.status == 201) {
            response.render('display', { title: 'test', result: apiResponse.data });
        } else {
            // console.log("wang ziqing33" + JSON.stringify(apiResponse.response));
            response.render('error', { status: apiResponse.response.status, message: apiResponse.response.data.message });

        }

    }).catch(e => {
        var stringdata = JSON.stringify(e);
        console.log("======>" + e);
        response.status(e.status || 500);
        response.render('error', { error: e, message: stringdata });
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