const app = require('./shared/Express');
const firebase = require('./shared/Firebase');
const databaseRef = firebase.databaseRef;
const defaultAuth = firebase.defaultAuth;
const coinbase = require('./shared/Coinbase');

const btcToUsd = 5782.24;
const etherToUsd = 305.99;
const lcToUsd = 54.83;

app.post('/api/donate', function (request, result) {
    const projectId = request.query['project_id'];
    const amount = request.query['amount'];
    const btc = amount / btcToUsd;
    if (projectId && amount) {
        donate(btc, projectId, result);
    }
});

app.post('/api/create_user', function (request, result) {
    const fname = request.query['fname'];
    const lname = request.query['lname'];
    const address = request.query['address'];
    
    const user = {
        "balance" : 0.0,
        "name"  : `${fname} ${lname}`,
        "address" : address
     }

    databaseRef.child('users').push(user);
    result.status(200).send(user);
});

app.get('/api/get_balance', function (request, result) {
    coinbase.getBalance(result);
});

app.get('/api/get_projects', function (request, result) {
    databaseRef.child('projects').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            const val = snapshot.val();
            const projects = [];
            for (id in val) {
                const project = val[id];
                project['project_id'] = id;
                projects.push(project);
            }
            result.status(200).send(projects);
        } else {
            result.sendStatus(400);
        }
    }).catch(function(error) {
        result.sendStatus(500);
        console.log(error);
    });
});

app.get('/api/get_project', function (request, result) {
    const projectId = request.query['project_id'];
    if (!projectId) {
        result.sendStatus(400);
        return;
    } 

    databaseRef.child(`projects/${projectId}`).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            result.status(200).send(snapshot.val());
        } else {
            result.sendStatus(400);
        }
    }).catch(function(error) {
        result.sendStatus(500);
        console.log(error);
    });
});

function donate(amount, projectId, result) {
    databaseRef.child(`projects/${projectId}`).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            const current = snapshot.val()['current'];
            const goal = snapshot.val()['goal'];
            const amtRemaining = goal - current;
            const donationAmt = (amtRemaining < amount) ? amtRemaining : amount;
            databaseRef.child(`projects/${projectId}/current`).set(donationAmt + current);
            if (result) {
                result.status(200).send({
                    "current": (donationAmt + current),
                    "goal": goal
                });
            }
        } else {
            if (result) {
                result.sendStatus(400);
            }
        }
    });
}

function addProjects(projects) {
    for (index in projects) {
        addProject(projects[index]);
    }
}

function addProject(project) {
    databaseRef.child('projects').push(project);
}
