class FakeWebSocket
  @SOCKET = null
  OPEN: 1

  constructor: (@options) ->
    @constructor.SOCKET = @
    @host = @options.host
    
  send: ->
  # 
  # For tests
  #
  _open: -> 
    @onopen()

  _message: (event) ->
    @onmessage(event)

  readyState: @OPEN

class FakeServer

setupFakeWebSocket = ->
  beforeEach ->
    @websocket = WebSocket
    window.WebSocket = FakeWebSocket

  afterEach ->
    WebSocket = @websocket
