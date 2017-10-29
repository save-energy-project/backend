var admin = require('firebase-admin');
var serviceAccount = require(
    '../../cred/investenergy-7f4af-firebase-adminsdk-pmd2r-d7283f15bb.json'
);

const defaultApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://investenergy-7f4af.firebaseio.com'
});

const defaultAuth = defaultApp.auth();
const database = defaultApp.database();
const databaseRef = database.ref();

module.exports = {
    databaseRef,
    defaultAuth
}
