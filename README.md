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
        height: 100
      },
      small: {
        width: 300,
        height: 200
      }
    })
})
```

```html
<mf-img id="{{id}}" alias="small">
```

Or using Foundation Interchange:

```html
<mf-img id="{{id}}" mf-interchange='{"small":"default", "large":"small"}'>
```

You can easily specify versions inline:

```html
<mf-img id="{{id}}" mf-interchange='{"small":[300,200], "large":[600,300]}'>
```
