angular.module('ng-mediaflow', [])
    .provider('mediaflow', function() {
        this.host = null
        this.aliases = {}

        this.setHost = function(host) {
            this.host = host
            return this
        }

        this.alias = function(alias, config) {
            if (typeof alias === 'object') {
                for (var name in alias)
                    this.aliases[name] = alias[name]
            }
            else {
                this.aliases[alias] = config
            }
            return this
        }

        this.$get = function() {
            var host = this.host
            var aliases = this.aliases
            return {
                host: function() { return host },
                aliases: function() { return aliases }
            }
        }
    })
    .directive('mfImg', function() {
        return {
            restrict: 'EA',
            scope: {id: '@mfId'},
            template: '<img src="{{url}}">',
            controller: function($scope, $parse, $attrs, mediaflow) {
                $scope.host = mediaflow.host()
                this.aliases = mediaflow.aliases()
                if ($attrs.alias && $attrs.alias in this.aliases) {
                    var aliasConfig = this.aliases[$attrs.alias]
                    for (var key in aliasConfig) {
                        $scope[key] = aliasConfig[key]
                    }
                }

                this.url = function(id, config) {
                    var w = config.width || ''
                    var h = config.height || ''
                    return 'http://' + mediaflow.host() + '/' + w + 'x' + h + '/' + id + '.jpg'
                }

                $scope.url = this.url($scope.id, {
                    width: $scope.width,
                    height: $scope.height
                })

                this.alias = function(name) {
                    return this.aliases[name]
                }
            }
        }
    })
    .directive('mfInterchange', function() {
        return {
            restrict: 'A',
            require: 'mfImg',
            link: function($scope, $element, $attrs, mfImgCtrl) {
                //attr = "[/path/to/default.jpg, (default)], [/path/to/bigger-image.jpg, (large)]
                var versions = $attrs.mfInterchange
                if (typeof versions === 'string') {
                    versions = JSON.parse(versions)
                }
                var interchangeParts = []
                for (var name in versions) {
                    var config = versions[name]
                    if (typeof config === 'string') {
                        config = mfImgCtrl.alias(config)
                    }
                    var url = mfImgCtrl.url($attrs.mfId, config)
                    interchangeParts.push('[' + url + ', (' + name + ')]')
                }
                var interchange = interchangeParts.join(',')
                $element.find('img').attr('data-interchange', interchange)
            }
        }
    })
