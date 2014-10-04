describe 'Takana.Client', ->

  describe 'start', ->
    context 'initialize configuration', ->
      beforeEach ->
        @client = new takanaClient.Client()

      it 'should set the host', ->
        expect(@client.host).to.eql('localhost:48626')

    context 'WebSocket', ->
      describe 'once connected', ->

        setupFakeWebSocket()
        beforeEach (done) ->
          @client = new takanaClient.Client()
          @client.run => done()
          @client.server.socket.send = sinon.spy()
          @client.server.socket._open()

        it 'should connect to the Takana server', ->
         expect(@client.server.socket.readyState).to.equal(WebSocket.OPEN)

        it 'should send stylesheet:resolve message', ->
          expect(@client.server.socket.send.calledOnce).to.equal(true)
          expect(@client.server.socket.send.firstCall.args[0]).to.include('stylesheet:resolve')

        it 'should create a project instance', ->
          expect(should.exist(@client.project))
