var Promise = require("bluebird");
var request = require("request");
var colors  = require("colors");

function Action(specObject) {
  this.specObject = specObject;
  // this.defaults = this.parseDefaults();
  this.cookieJar = request.jar();
}

Action.prototype.list = function() {
  var data = this.specObject.action;
  var names = [];
  for (var key in data) {
    names[key] = data[key].name;
  }
  return names;
};

Action.prototype.parseAction = function(actionName) {
  var data = this.specObject.action;

  for (var key in data) {
    if (data[key].name === actionName) {
      return data[key];
    }
  }
};

Action.prototype.buildRequest = function(parsedAction) {
  var requestPromisified = Promise.promisify(request);
  var options = this.createOptionsObject(parsedAction);
  var extractedData = this.extractData(parsedAction);
  var self = this;
  var data;

  var isArgument = function(string) {
    return string[0] === '<' && string[string.length - 1] === '>';
  };
  return function(param) {

    // if (arguments !== undefined) {
    //   var args = Array.prototype.slice.call(arguments);
    //   // console.log(args);

    //   // console.log(extractedArguments);
    //   function insertArguments(options) {
    //     var extractedArguments = parsedAction.arguments.map(function(value) {
    //       return value.split(".");
    //     });
    //     extractedArguments.forEach(function(innerArray) {
    //       innerArray.reduce(function(previous, current) {
    //         previous[current] = previous.hasOwnProperty(current) ?
    //       }, options);
    //     })
    //   }

    // }


    // if (arguments !== undefined) {
    //   for (var key in parsedAction) {
    //     console.log(parsedAction[key]);
    //     if (key === 'pathParam') {
    //       options.uri += arguments[parsedAction[key][1]];
    //     } else if (isArgument(parsedAction[key])) {
    //       console.log(parsedAction[key]);
    //       options[key] = arguments[parsedAction[key][1]];
    //     }
    //   }
    // }

    if (param !== undefined) {
      var fullUri = options.uri + param;
      options.uri = fullUri;
    }

    // console.log(request(options));
    requestPromisified(options)
      .then(function(response) {
        // console.log(response.body);
        // console.log("This is the status code of the response", response.statusCode);
        // console.log("This is the content-type of the response", response.headers["content-type"]);
        data = JSON.parse(response.body);
      })
      .then(function() {
        var processedResponse = self.processResponse(data, extractedData);
        console.log(processedResponse.toString().yellow);
      })
      .catch(function(error) {
        throw error;
      });
  };
};

Action.prototype.createOptionsObject = function(parsedAction) {

  // var options = parseDefaults();
  var options = {};

/*  if (parsedAction.options !== undefined) {
    return parsedAction.options
  }*/

  var excludedOptions = ['name', 'after', 'extract', 'arguments'];
  for (var key in parsedAction) {
    if (excludedOptions.indexOf(key) === -1) {
      options[key] = parsedAction[key];
    }
  }
  options.jar = this.cookieJar;

  return options;
};
// Action.prototype.processArguments = function(string) {
//   return this.isArgument(parsedAction[key]) ? arguments[parsedAction[key][1]] : parsedAction[key];
// };
// Action.prototype.isArgument = function(string) {
//   return string[0] === '<' && string[string.length - 1] === '>';
// };

Action.prototype.parseDefaults = function() {

  var defaultsObject = {};
  if (this.specObject.defaults !== undefined) {
    defaultsObject = this.specObject.defaults;
  }

  return defaultsObject;
};

Action.prototype.extractData = function(parsedAction) {
  var fieldsToExtract = parsedAction.extract;
  // console.log("fields to extract: ", fieldsToExtract);
  if (fieldsToExtract !== undefined) {
    return fieldsToExtract.map(function(value) {
      return value.split(".");
    });
  }
};

Action.prototype.processResponse = function(response, extractedData) {
  var result;
  if (typeof extractedData === 'undefined') {
    return response;
  }

  var isArray = function(a) {
    return (!!a) && (a.constructor === Array);
  };
  var isObject = function(a) {
    return (!!a) && (a.constructor === Object);
  };

  function processObject(object, fieldsToExtract) {
    return fieldsToExtract.map(function(innerArray) {
      return innerArray.reduce(function(previous, current) {
        if (isArray(previous)) {
          current = [current.split()];
          previous = processArray(previous, current);
        } else {
          previous = previous[current];
        }
        return previous;
      }, object);
    });
  }

  function processArray(array, fieldsToExtract) {
    return array.map(function(innerObject) {
      return processObject(innerObject, fieldsToExtract);
    })
  }

  if (isArray(response)) {
    result = processArray(response, extractedData);
  } else if (isObject(response)) {
    result = processObject(response, extractedData);
  }

  return result;
};

module.exports = Action;
