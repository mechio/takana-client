Stylesheet = require './stylesheet.coffee'

class Project
  constructor: (@options) ->
    @server               = @options.server
    @documentStyleSheets  = []
    @styleSheets          = {}

    StyleSheetList.prototype.forEach = Array.prototype.forEach

    document.styleSheets.forEach (documentStyleSheet) =>
      if (!!documentStyleSheet.href && (documentStyleSheet.href.match(/^http\:\/\/.*\.css.*/) || documentStyleSheet.href.match(/^file\:\/\/.*/)))
        @documentStyleSheets.push documentStyleSheet

    @server.bind "stylesheet:resolved", (event) => 
      @documentStyleSheets.forEach (documentStyleSheet) =>
        if event.href == documentStyleSheet.href

          stylesheet = new Stylesheet(
            server:             @server
            documentStyleSheet: documentStyleSheet, 
            id:                 event.id
          )
          
          @styleSheets[event.id] = stylesheet

          stylesheet.startListening()

    @documentStyleSheets.forEach (styleSheet) => 
      @server.send "stylesheet:resolve", href: styleSheet.href
    

module.exports = Project