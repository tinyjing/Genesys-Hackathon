// requires

var request = require('request'),
    data = require('./data');

// test API

exports.name = function(req, res) {
    res.json({
        name: 'Bob'
    });
};

// constants

var R = 6371,
    headers = {
        apikey: 'N18TFGbKpn0zaGLXDFZhPWpTcB2eyx44'
    },
    url = 'http://localhost:8888/api/v2/chats';

// custom API

var id = 0,
    users = [],
    events = [];

if (data.users) {
    data.users.forEach(function (user) {
        users.push(user);
    });
    id = data.users.length;
}

if (data.events) {
    data.events.forEach(function (evt) {
        request.post({
            headers: headers,
            url: url,
            body: JSON.stringify({
                operationName: 'RequestChat',
                nickname: 'testName',
                subject: 'testSubject'
            })
        }, function (err, _res, body) {
            var newEvt = {
                nickname: 'testName',
                subject: 'testSubject',
                hostId: evt.userId,
                chatId: JSON.parse(body).id, // needs testing
                lat: evt.lat,
                lon: evt.lon,
                sport: evt.sport, // for searching
                startDate: new Date(),
                endDate: new Date(),
                capacity: evt.capacity,
                price: evt.price
            };

            events.push(newEvt);
            getUser(newEvt.hostId).subscriptions.push(newEvt); // creater automatically watches event
            console.log("created event: " + newEvt.chatId);
        });
    });
}

exports.createUser = function (req, res) {
    users.push({
        userId: id,
        name: req.body.userName,
        lat: req.body.lat,
        lon: req.body.lon,
        subscriptions: []
    });

    res.json({
        userId: id++
    });
};

exports.createEvent = function (req, res) {
    request.post({
        headers: headers,
        url: url,
        body: JSON.stringify({
            operationName: 'RequestChat',
            nickname: req.body.nickname,
            subject: req.body.subject
        })
    }, function (err, _res, body) {
        var evt = {
            nickname: req.body.nickname,
            subject: req.body.subject,
            hostId: parseInt(req.body.userId),
            chatId: JSON.parse(body).id, // needs testing
            lat: req.body.lat,
            lon: req.body.lon,
            sport: req.body.sport, // for searching
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            capacity: req.body.capacity,
            price: req.body.price
        };

        events.push(evt);
        getUser(evt.hostId).subscriptions.push(evt); // creater automatically watches event

        res.send(evt);
    });
};

exports.watchEvent = function (req, res) {
    var userId = req.body.userId,
        evtId = req.body.chatId,
        user = getUser(userId);

    user.subscriptions.push(getEvent(evtId));

    res.send(user.subscriptions);
};

exports.getEvent = function (req, res) {
    res.json(getEvent(req.body.chatId));
}

exports.getSubscriptions = function (req, res) {
    var userId = req.body.userId,
        user = getUser(userId);
        
    res.send(user.subscriptions);
};

exports.getUser = function (req, res) {
    res.json(getUser(req.body.userId));
};

exports.getNearestEvents = function (req, res) {
    var userLocation = {
            lat: req.body.lat,
            lon: req.body.lon
        },
        max = req.body.max || 10;

    var arr = events.slice().sort(function (a, b) {
        return (getDistance(userLocation, a) > getDistance(userLocation, b))
            ? 1
            : (getDistance(userLocation, a) < getDistance(userLocation, b))
                ? -1
                : 0;
    }).slice(0, max);

    res.send(arr);
};

// chat API

// exports.sendMessage = function (req, res) {
//     request.post({
//         headers: headers,
//         url: url + '/' + req.body.chatId,
//         body: JSON.stringify({
//             operationName: 'SendMessage',
//             text: req.body.text
//         })
//     }, function (err, _res, body) {
//         res.json(body);
//     });
// };

exports.sendStartTypingNotification = function (req, res) {
    var _req = request.post({
        headers: headers,
        url : url + '/' + req.body.chatId,
        body: JSON.stringify({
            operationName: "SendStartTypingNotification"
        })
    }, function(err, _res, body) {
        res.json(body);
    });
};

exports.sendStopTypingNotification = function (req, res) {
    var _req = request.post({
        headers: headers,
        url : url + '/' + req.body.chatId,
        body: JSON.stringify({
            operationName: "SendStopTypingNotification"
        })
    }, function(err, _res, body) {
        res.json(body);
    });
};

exports.complete = function (req, res) {
    request.post({
        headers: headers,
        url: url + '/' + req.body.chatId,
        body: JSON.stringify({
            operationName: 'Complete'
        })
    }, function (err, _res, body) {
        res.json(body);
    });
};

// exports.getTranscript = function(req, res) {
//     request.get({
//         headers: headers,
//         url: url + '/' + req.body.chatId + '/messages'
//     }, function (err, _res, body) {
//         console.log(body);
//         res.json(body);
//     });
// }

// Helpers

function getUser(userId) {
    var ret;

    userId = parseInt(userId);

    users.some(function (user) {
        if (userId === user.userId) {
            ret = user;
            return true;
        }
    });

    return ret || {};
}

function getEvent(chatId) {
    var ret;

    events.some(function (evt) {
        if (chatId === evt.chatId) {
            ret = evt;
            return true;
        }
    });

    return ret || {};
}

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function getDistance(loc1, loc2) {
    var la1 = toRadians(loc1.lat),
        la2 = toRadians(loc2.lat),
        de1 = toRadians(loc1.lat - loc2.lat),
        de2 = toRadians(loc1.lon - loc2.lon),

        a = Math.sin(de1 / 2) * Math.sin(de1 / 2) +
            Math.cos(la1) * Math.cos(la2) *
            Math.sin(de2 / 2) * Math.sin(de2 / 2),
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)),
        d = R * c; // distance

    return d;
}