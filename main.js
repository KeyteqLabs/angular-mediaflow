angular.module('app', ['ng-mediaflow', 'mm.foundation'])
    .config(function(mediaflowProvider) {
        mediaflowProvider
            .setHost('keyteq.cdn.keymedia.no')
            .alias({
                tiny: {
                    width: 100,
                    height: 100
                },
                small: {
                    width: 300,
                    height: 200
                },
                default: {
                    width: 600,
                    height: 200
                }
            })
    })
