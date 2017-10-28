const app = require('./shared/Express');
const databaseRef = require('./shared/Firebase');
const coinbase = require('./shared/Coinbase');

app.get('/api/get_balance', function (request, result) {
    coinbase.getBalance(result);
});
