describe 'Stylesheet', ->
	beforeEach ->
		@server = new FakeServer(host: 'localhost')
		@bind = @server.bind = sinon.stub()
		@send = @server.send = sinon.stub()

	describe 'initialize', ->
		it 'should set @el, @href, @id and @documentStyleSheet on initialize', ->
			@styleSheet = new takanaClient.Stylesheet
				server: 						@server
				documentStyleSheet: document.styleSheets[0]
				id: 								1
			expect(@styleSheet.documentStyleSheet).to.equal(document.styleSheets[0])
			expect(@styleSheet.el).to.equal(document.styleSheets[0].ownerNode)
			expect(@styleSheet.href).to.equal(document.styleSheets[0].href)
			expect(@styleSheet.id).to.equal(1)

	describe 'startListening', ->
		beforeEach ->
			@styleSheet = new takanaClient.Stylesheet
				server: 						@server
				documentStyleSheet: document.styleSheets[0]
				id: 								1
			@styleSheet.startListening()

		it 'should inform the server it is listening', ->
			expect(@send).to.have.been.calledWith("stylesheet:listen", id: 1)

		it 'should call "update" when the server calls stylesheet:update', ->
			# callback
			@styleSheet.update = sinon.spy()

			@bind.firstCall.args[1]
				url: ""
				id: 1

			expect(@styleSheet.update).to.have.been.calledOnce

	describe 'update', ->

		it "should create a new link element with it's predecessors media type"
		it 'should replace the old stylesheet with a new stylesheet linked to the server'
