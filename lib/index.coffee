Server     = require './server.coffee'
Project    = require './project.coffee'
Stylesheet = require './stylesheet.coffee'

class Client
  constructor: (@options={}) ->
    @host    = @options.host || 'localhost:48626'
    @server  = new Server(host: @host)    
  
  run: (callback) ->
    @server.start => 
      @project = new Project(server: @server)
      callback?()

exports.Stylesheet  = Stylesheet  
exports.Server      = Server  
exports.Project     = Project 
exports.Client      = Client 

exports.run = (options) ->
  client = new Client(options)
  client.run()


