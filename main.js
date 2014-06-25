angular.module('app', ['ng-mediaflow'])
    .config(function(mediaflowProvider) {
        mediaflowProvider
            .setHost('keymedia.rju.keyteq.no')
            .alias({
                default: {
                    width: 100,
                    height: 100
                },
                small: {
                    width: 300,
                    height: 200
                },
                large: {
                    width: 600,
                    height: 200
                }
            })
    })
