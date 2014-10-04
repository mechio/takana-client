## Takana Browser Client

[![Build Status](https://travis-ci.org/mechio/takana-client.svg?branch=master&style=flat)](https://travis-ci.org/mechio/takana-client)
[![npm version](https://badge.fury.io/js/takana-client.svg)](http://badge.fury.io/js/takana-client)
[![Dependency Status](https://david-dm.org/mechio/takana-client.svg?theme=shields.io)](https://david-dm.org/mechio/takana-client)
[![devDependency Status](https://david-dm.org/mechio/takana-client/dev-status.svg?theme=shields.io)](https://david-dm.org/mechio/takana-client#info=devDependencies)

This is the browser client for [takana](http://usetakana.com). It needs to be included inside your `<head>` tag of any page that you want to live update:

```html
<script type="text/javascript" src="http://localhost:48626/takana.js"></script>
<script type="text/javascript">
  takanaClient.run({
    host: 'localhost:48626' // optional, defaults to localhost:48626
  });
</script>
```

For more information about takana, please refer to the [takana repository](https://github.com/mechio/takana).
