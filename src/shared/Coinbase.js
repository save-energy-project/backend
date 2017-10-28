var cred = require('../../cred/coinbase.json');
var coinbase = require('coinbase');
var client   = new coinbase.Client({
    'apiKey': cred.apiKey,
    'apiSecret': cred.apiSecret
});

function getBalance(result){
    client.getAccounts({}, function(err, accounts) {
        accounts.forEach(function(acct) {
          console.log('my bal: ' + acct.balance.amount + ' for ' + acct.name);
        });
    });
}

module.exports = {
    getBalance,
};
