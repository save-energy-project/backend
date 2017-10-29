var cred = require('../../cred/coinbase.json');
var coinbase = require('coinbase');
var client   = new coinbase.Client({
    'apiKey': cred.apiKey,
    'apiSecret': cred.apiSecret
});

function getBalance(result){
    
}

module.exports = {
    getBalance,
};
