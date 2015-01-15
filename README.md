angular-mediaflow
=================

Angular Mediaflow directives

```js
angular.module('app', ['ng-mediaflow']).config(function(mediaflowProvider) {
  mediaflowProvider
    .setHost('my.mediaflow.host.com')
    .alias({
      default: {
        width: 100,
        height: 100,
        original: 1
      },
      small: {
        width: 300,
        height: 200
      }
    })
})
```

```html
<mf-img id="{{id}}" config="small">
<mf-img id="{{id}}" config='[50,50,"original:1"]'>
```

Or using Foundation Interchange:

```html
<mf-img id="{{id}}" mf-interchange='{"small":"default", "large":"small"}'>
```

You can easily specify versions inline:

```html
<mf-img id="{{id}}" mf-interchange='{"small":[300,200], "large":[600,300]}'>
```
