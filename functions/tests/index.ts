const test = require("firebase-functions-test")({
    databaseUrl: "",
    projectId: "letter-writing-app",
    storageBucket: "gs://letter-writing-app.appspot.com",
}, "./testAccountKey.json");

module.exports = test;