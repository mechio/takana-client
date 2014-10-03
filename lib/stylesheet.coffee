class Stylesheet
  stylesheetReloadTimeout = 15000

  constructor: (@options) ->
    @server             = @options.server
    @documentStyleSheet = @options.documentStyleSheet
    @el                 = @documentStyleSheet.ownerNode
    @mediaType          = @el.getAttribute('media') || 'all'
    @href               = @documentStyleSheet.href
    @id                 = @options.id

  startListening: ->
    @server.send 'stylesheet:listen', id: @id
    @server.bind 'stylesheet:updated', (data) =>
      @update(data.url) if data.id == @id

  #
  # Wait for styles to be applied
  # 
  onceCSSIsLoaded: (clone, callback) ->
    callbackExecuted  = no
    timer             = null

    executeCallback = =>
      return if callbackExecuted
      clearInterval timer
      callbackExecuted = yes
      additionalWaitingTime = if /AppleWebKit/.test(navigator.userAgent) then 5 else 100
      setTimeout(callback, additionalWaitingTime)

    clone.onload = => executeCallback()

    setTimeout executeCallback, stylesheetReloadTimeout

  _hrefForUrl: (url) ->
    "http://#{@server.host}/#{url}?#{Date.now()}&href=#{encodeURIComponent(@href)}"

  update: (url) ->
    #
    # Create a new stylesheet linked to Takana Server
    #
    
    href = @_hrefForUrl(url)

    el = document.createElement("link")
    el.setAttribute("type", "text/css")
    el.setAttribute("href", href)
    el.setAttribute("media", @mediaType)
    el.setAttribute("rel", "stylesheet")

    # TODO: use stylesheet parent El
    parentTagName = if document.body.contains(@el)
      "body"
    else
      "head"

    document.getElementsByTagName(parentTagName)[0].insertBefore(el, @el)

    @onceCSSIsLoaded el, => 
      @el.remove()
      @el = el

module.exports = Stylesheet
