MicroEvent = require 'microevent'

class Server
  constructor: (@options) ->
    @host = @options.host

  start: (callback) ->
    @socket = new WebSocket("ws://#{@options.host}/browser?project_name=default")

    @socket.onopen = callback

    @socket.onerror = (e) ->
      console.error("Takana: socket error:", e)

    @socket.onmessage = (event) =>
      message = JSON.parse(event.data)
      @trigger(message.event, message.data)

  send: (event, data)->
    if @socket.readyState == WebSocket.OPEN
      @socket.send JSON.stringify(event: event, data: data)

MicroEvent.mixin(Server)

module.exports = Server