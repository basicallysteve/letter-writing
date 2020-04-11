let test = require("../index.ts");
let {sendAlertOnUserSignUp} = require("../../src/modules/alerting.ts");
let expect = require("expect");

describe("Alerting Tests", function(){
    describe("User Creation Alerts", function(){
        beforeEach(function(){
            let alertListener = sendAlertOnUserSignUp()
        })

        it("should create alert on new user", function(){
            let user = test.auth.makeUserRecord();
        })
    })
})

