const bitcoin = require('bitcoinjs-lib');

function sendMoney(amount, fromKey, fromAddress, toAddress) {
    var key = bitcoin.ECPair.fromWIF(fromKey);  
    var tx = new bitcoin.TransactionBuilder();  
    tx.addInput(fromAddress, 0);
    tx.addOutput(toAddress, amount);
    tx.sign(0, key);
    console.log(tx.build().toHex());
}

function makeAddress() {
    var keyPair = bitcoin.ECPair.makeRandom();
    const address = keyPair.getAddress();
    const key = keyPair.toWIF();

    return {
        "address": address,
        "key" : key
    }
}

module.exports = {
    sendMoney,
    makeAddress
};
