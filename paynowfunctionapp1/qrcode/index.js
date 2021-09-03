const customerOwnAccounts = '[{ "customerId":"CUST-000001","proxyValue": ["201721448W", "201721008W"] },{ "customerId":"CUST-000002","proxyValue": ["201721448V", "201721008V"]}]';


module.exports = function(context, req) {
    var reqProxyType = req.body.proxyType;
    var reqProxyValue = req.body.proxyValue;
    var reqAmount = parseFloat(req.body.amount);
    var reqReferenceText = req.body.referenceText;
    var reqQrcodeSize = req.body.qrcodeSize;
    var reqExpiryDate = req.body.expiryDate;

    //validation here
    var requestId = req.headers['request-id'];
    var requestEmail = req.headers['request-email'];
    var accounts = JSON.parse(customerOwnAccounts);

    var isFound = false;
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].customerId == requestId &&
            accounts[i].proxyValue.includes(reqProxyValue)) {
            isFound = true;
        }
    }

    if (!isFound) {
        context.res = {
            headers: {
                "Content-Type": "application/json"
            },

            status: 400,
            body: {
                "statusCode": 400,
                "message": requestId + "[" + requestEmail + "] not yet register this UEN"
            }
        };

        context.done();
    }

    var QRCode = require('qrcode')
    const PaynowQR = require('./paynowqr');
    //Create a PaynowQR object
    let qrcode = new PaynowQR({
        uen: reqProxyValue, //Required: UEN of company
        amount: reqAmount, //Specify amount of money to pay.
        editable: false, //Whether or not to allow editing of payment amount. Defaults to false if amount is specified
        expiry: reqExpiryDate, //Set an expiry date for the Paynow QR code (YYYYMMDD). If ommitted, defaults to 5 years from now.
        refNumber: reqReferenceText, //Reference number for Paynow Transaction. Useful if you need to track payments for recouncilation.
        company: 'QiushengWangTest' //Company name to embed in the QR code. Optional.               
    });

    //Outputs the qrcode to a UTF-8 string format, which can be passed to a QR code generation script to generate the paynow QR
    let QRstring = qrcode.output();
    console.log(QRstring);


    QRCode.toDataURL(QRstring, { type: 'png' },
        function(err, url) {
            context.res = {
                headers: {
                    "Content-Type": "application/json"
                },

                status: 200,
                body: {
                    "amount": reqAmount,
                    "disclaimer": "the SMBC disclaimer of the QR code",
                    "qrCodeData": url
                }
            };

            context.done();
        }
    );


}