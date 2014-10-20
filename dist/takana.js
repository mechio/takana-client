!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var n;"undefined"!=typeof window?n=window:"undefined"!=typeof global?n=global:"undefined"!=typeof self&&(n=self),n.takanaClient=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Client, Project, Server, Stylesheet;

Server = require('./server.coffee');

Project = require('./project.coffee');

Stylesheet = require('./stylesheet.coffee');

Client = (function() {
  function Client(options) {
    this.options = options != null ? options : {};
    this.host = this.options.host || 'localhost:48626';
    this.server = new Server({
      host: this.host
    });
  }

  Client.prototype.run = function(callback) {
    return this.server.start((function(_this) {
      return function() {
        _this.project = new Project({
          server: _this.server
        });
        return typeof callback === "function" ? callback() : void 0;
      };
    })(this));
  };

  return Client;

})();

exports.Stylesheet = Stylesheet;

exports.Server = Server;

exports.Project = Project;

exports.Client = Client;

exports.run = function(options) {
  var client;
  client = new Client(options);
  return client.run();
};



},{"./project.coffee":2,"./server.coffee":3,"./stylesheet.coffee":4}],2:[function(require,module,exports){
var Project, Stylesheet;

Stylesheet = require('./stylesheet.coffee');

Project = (function() {
  function Project(options) {
    this.options = options;
    this.server = this.options.server;
    this.documentStyleSheets = [];
    this.styleSheets = {};
    StyleSheetList.prototype.forEach = Array.prototype.forEach;
    document.styleSheets.forEach((function(_this) {
      return function(documentStyleSheet) {
        if (!!documentStyleSheet.href && (documentStyleSheet.href.match(/^http\:\/\/.*\.css.*/) || documentStyleSheet.href.match(/^file\:\/\/.*/))) {
          return _this.documentStyleSheets.push(documentStyleSheet);
        }
      };
    })(this));
    this.server.bind("stylesheet:resolved", (function(_this) {
      return function(event) {
        return _this.documentStyleSheets.forEach(function(documentStyleSheet) {
          var stylesheet;
          if (event.href === documentStyleSheet.href) {
            stylesheet = new Stylesheet({
              server: _this.server,
              documentStyleSheet: documentStyleSheet,
              id: event.id
            });
            _this.styleSheets[event.id] = stylesheet;
            return stylesheet.startListening();
          }
        });
      };
    })(this));
    this.documentStyleSheets.forEach((function(_this) {
      return function(styleSheet) {
        return _this.server.send("stylesheet:resolve", {
          href: styleSheet.href,
          takanaHref: styleSheet.ownerNode && styleSheet.ownerNode.getAttribute('takana-href')
        });
      };
    })(this));
  }

  return Project;

})();

module.exports = Project;



},{"./stylesheet.coffee":4}],3:[function(require,module,exports){
var MicroEvent, Server;

MicroEvent = require('microevent');

Server = (function() {
  function Server(options) {
    this.options = options;
    this.host = this.options.host;
  }

  Server.prototype.start = function(callback) {
    this.socket = new WebSocket("ws://" + this.options.host + "/browser?project_name=default");
    this.socket.onopen = callback;
    this.socket.onerror = function(e) {
      return console.error("Takana: socket error:", e);
    };
    return this.socket.onmessage = (function(_this) {
      return function(event) {
        var message;
        message = JSON.parse(event.data);
        return _this.trigger(message.event, message.data);
      };
    })(this);
  };

  Server.prototype.send = function(event, data) {
    if (this.socket.readyState === WebSocket.OPEN) {
      return this.socket.send(JSON.stringify({
        event: event,
        data: data
      }));
    }
  };

  return Server;

})();

MicroEvent.mixin(Server);

module.exports = Server;



},{"microevent":5}],4:[function(require,module,exports){
var Stylesheet;

Stylesheet = (function() {
  var stylesheetReloadTimeout;

  stylesheetReloadTimeout = 15000;

  function Stylesheet(options) {
    this.options = options;
    this.server = this.options.server;
    this.documentStyleSheet = this.options.documentStyleSheet;
    this.el = this.documentStyleSheet.ownerNode;
    this.mediaType = this.el.getAttribute('media') || 'all';
    this.href = this.documentStyleSheet.href;
    this.id = this.options.id;
  }

  Stylesheet.prototype.startListening = function() {
    this.server.send('stylesheet:listen', {
      id: this.id
    });
    return this.server.bind('stylesheet:updated', (function(_this) {
      return function(data) {
        if (data.id === _this.id) {
          return _this.update(data.url);
        }
      };
    })(this));
  };

  Stylesheet.prototype.onceCSSIsLoaded = function(clone, callback) {
    var callbackExecuted, executeCallback, timer;
    callbackExecuted = false;
    timer = null;
    executeCallback = (function(_this) {
      return function() {
        var additionalWaitingTime;
        if (callbackExecuted) {
          return;
        }
        clearInterval(timer);
        callbackExecuted = true;
        additionalWaitingTime = /AppleWebKit/.test(navigator.userAgent) ? 5 : 100;
        return setTimeout(callback, additionalWaitingTime);
      };
    })(this);
    clone.onload = (function(_this) {
      return function() {
        return executeCallback();
      };
    })(this);
    return setTimeout(executeCallback, stylesheetReloadTimeout);
  };

  Stylesheet.prototype._hrefForUrl = function(url) {
    return "http://" + this.server.host + "/" + url + "?" + (Date.now()) + "&href=" + (encodeURIComponent(this.href));
  };

  Stylesheet.prototype.update = function(url) {
    var el, href, parentTagName;
    href = this._hrefForUrl(url);
    el = document.createElement("link");
    el.setAttribute("type", "text/css");
    el.setAttribute("href", href);
    el.setAttribute("media", this.mediaType);
    el.setAttribute("rel", "stylesheet");
    parentTagName = document.body.contains(this.el) ? "body" : "head";
    document.getElementsByTagName(parentTagName)[0].insertBefore(el, this.el);
    return this.onceCSSIsLoaded(el, (function(_this) {
      return function() {
        _this.el.remove();
        return _this.el = el;
      };
    })(this));
  };

  return Stylesheet;

})();

module.exports = Stylesheet;



},{}],5:[function(require,module,exports){
/**
 * MicroEvent - to make any js object an event emitter (server or browser)
 * 
 * - pure javascript - server compatible, browser compatible
 * - dont rely on the browser doms
 * - super simple - you get it immediatly, no mistery, no magic involved
 *
 * - create a MicroEventDebug with goodies to debug
 *   - make it safer to use
*/

var MicroEvent	= function(){}
MicroEvent.prototype	= {
	bind	: function(event, fct){
		this._events = this._events || {};
		this._events[event] = this._events[event]	|| [];
		this._events[event].push(fct);
	},
	unbind	: function(event, fct){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		this._events[event].splice(this._events[event].indexOf(fct), 1);
	},
	trigger	: function(event /* , args... */){
		this._events = this._events || {};
		if( event in this._events === false  )	return;
		for(var i = 0; i < this._events[event].length; i++){
			this._events[event][i].apply(this, Array.prototype.slice.call(arguments, 1))
		}
	}
};

/**
 * mixin will delegate all MicroEvent.js function in the destination object
 *
 * - require('MicroEvent').mixin(Foobar) will make Foobar able to use MicroEvent
 *
 * @param {Object} the object which will support MicroEvent
*/
MicroEvent.mixin	= function(destObject){
	var props	= ['bind', 'unbind', 'trigger'];
	for(var i = 0; i < props.length; i ++){
		destObject.prototype[props[i]]	= MicroEvent.prototype[props[i]];
	}
}

// export in common js
if( typeof module !== "undefined" && ('exports' in module)){
	module.exports	= MicroEvent
}

},{}]},{},[1])(1)
});