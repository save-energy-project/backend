const app = require('./shared/Express');
const firebase = require('./shared/Firebase');
const databaseRef = firebase.databaseRef;
const defaultAuth = firebase.defaultAuth;
const bitcoin = require('./shared/Bitcoin');

const btcToUsd = 5782.24;
const etherToUsd = 305.99;
const lcToUsd = 54.83;

//bitcoin.sendMoney(2000, '13kvMrLfVHurj2s3SrGebt2Csy2um3Fbt1', '16q6q184YDaTCeCCqh1uEXDAcM4nxrgrR2');

app.post('/api/donate', function (request, result) {
    const projectId = request.query['project_id'];
    const amount = request.query['amount'];
    const user = request.query['user'];
    const btc = amount / btcToUsd;
    if (projectId && amount && user) {
        donate(btc, projectId, user, result);
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
    
});

app.get('/api/get_test_user', function (request, result) {
    const user = '-KxcBQXpMt7RL_GjciJW';
    databaseRef.child(`users/${user}`)
    .once('value')
    .then(function(snapshot) {
        if (snapshot.val()) {
            const testUser = snapshot.val();
            testUser['user'] = user;
            delete testUser['address'];
            result.status(200).send(testUser);
        } else {
            result.sendStatus(500);
        }
    });
});

app.get('/api/get_ownership', function (request, result) {
    const projectId = request.query['project_id'];
    const user = request.query['user'];
    if (!projectId || !user) {
        result.send(400);
        return;
    }

    databaseRef.child(`projects/${projectId}/pledges/${user}`)
    .once('value')
    .then(function(snapshot) {
        if (snapshot.val()) {
            result.status(200).send({
                "ownership" : snapshot.val()['amount']
            });
        } else {
            result.status(200).send({
                "ownership" : 0
            });
        }
    });
});

app.get('/api/get_projects', function (request, result) {
    databaseRef.child('projects').once('value').then(function(snapshot) {
        if (snapshot.val()) {
            const val = snapshot.val();
            const projects = [];
            for (id in val) {
                const project = val[id];
                delete project['account'];
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
            var project = snapshot.val();
            delete project['account'];
            project['progress'] = project['current'] / project['goal'];
            result.status(200).send();
        } else {
            result.sendStatus(400);
        }
    }).catch(function(error) {
        result.sendStatus(500);
        console.log(error);
    });
});

function donate(amount, projectId, user, result) {
    databaseRef.child(`projects/${projectId}`).once('value').then(function(snapshot) {
        if (snapshot.val()) {
            const current = snapshot.val()['current'];
            const goal = snapshot.val()['goal'];
            const amtRemaining = goal - current;
            const donationAmt = (amtRemaining < amount) ? amtRemaining : amount;

            databaseRef.child(`projects/${projectId}/current`).set(donationAmt + current);
            databaseRef.child(`projects/${projectId}/pledges/${user}`)
            .once('value')
            .then(function(snapshot) {
                var amountPledged = 0;
                if (snapshot.val()) {
                    amountPledged = snapshot.val()['amount'];
                }
                
                databaseRef.child(`projects/${projectId}/pledges/${user}/amount`)
                .set(amountPledged + amount);

                if (result) {
                    result.status(200).send({
                        "current": (donationAmt + current),
                        "goal": goal,
                        "total_pledged": (amount + amountPledged)
                    });
                }
            });
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
