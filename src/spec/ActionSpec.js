describe("Action", function() {
  var Action = require("../lib/Action");
  var currentAction;
  var Piston = require("../lib/Piston");
  var currentPiston;

  beforeEach(function() {
    var specPath = "../pistonSpecs/airbnb.json";
    currentPiston = new Piston(specPath);
    currentAction = new Action(currentPiston.specObject);
  });

  describe("can parse a spec object", function() {
    it("given a function name", function() {
      var actionName = "get_user";
      expect(currentAction.parseAction(actionName))
        .toEqual(jasmine.any(Object));
    });

    it("and extracts the relevant data from a action", function() {
      var extractedArray = [
        ["user", "first_name"],
        ["user", "picture_url"]
      ];
      var actionName = "get_user";
      expect(currentAction.extractData(currentAction.parseAction(actionName)))
        .toEqual(extractedArray);
    });

    it("creates a list of the action available in the spec", function() {
      var expectedAction = ["get_user", "login"];
      expect(currentAction.list()).toEqual(expectedAction);
    });
  });

  describe("can build a request", function() {
    it("returning a request object with default values from specObject", function() {
      expect(currentAction.parseDefaults(currentPiston.specObject))
        .toEqual(jasmine.any(Function));
    });

    it("returning an options object with values from the parsedAction when there is no option field", function() {
      var parsedAction = {
        "name": "get_user",
        "uri": "7771271",
        "baseUrl": "https://api.airbnb.com/v2/users/",
        "qs": {
          "client_id": "3092nxybyb0otqw18e8nh5nty"
        },
        "method": "GET",
        "headers": {
          "host": "api.airbnb.com",
          "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0",
          "If-None-Match": "W/\"0ec4c2f8c1695ca2328859164f9b2485",
          "Connection": "keep-alive"
        },
        "after": false,
        "extract": [
          "user.first_name",
          "user.picture_url"
        ]
      };

      expect(currentAction.createOptionsObject(parsedAction))
        .toEqual({
          "uri": "7771271",
          "baseUrl": "https://api.airbnb.com/v2/users/",
          "qs": {
            "client_id": "3092nxybyb0otqw18e8nh5nty"
          },
          "method": "GET",
          "headers": {
            "host": "api.airbnb.com",
            "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64; rv:41.0) Gecko/20100101 Firefox/41.0",
            "If-None-Match": "W/\"0ec4c2f8c1695ca2328859164f9b2485",
            "Connection": "keep-alive"
          },
        });
    });

/*    it("in a way that request module for node understands", function() {

    });*/
  });
});
