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
            priority: 0,
            restrict: 'EA',
            scope: {id: '@mfId'},
            template: '<img ng-src="{{url}}">',
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
                    return '//' + mediaflow.host() + '/' + w + 'x' + h + '/' + id + '.jpg'
                }

                if (!$scope.width && !$scope.height) {
                    if ('default' in this.aliases) {
                        var config = this.aliases.default
                        $scope.width = config.width
                        $scope.height = config.height
                    }
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
    .directive('mfInterchange', function($compile) {
        return {
            priority: 1,
            restrict: 'A',
            require: 'mfImg',
            link: function($scope, $element, $attrs, imgCtrl) {
                var id = $attrs.mfId
                var versions = $attrs.mfInterchange
                var defaultAlias = 'default'
                if (typeof versions === 'string') {
                    versions = JSON.parse(versions)
                }
                var interchangeParts = []
                for (var name in versions) {
                    var config = versions[name]
                    if (name === 'default') {
                        defaultAlias = config
                    }
                    if (typeof config === 'string') {
                        config = imgCtrl.alias(config)
                    }
                    var url = imgCtrl.url(id, config)
                    interchangeParts.push('[' + url + ', (' + name + ')]')
                }

                var interchange = interchangeParts.join(',')
                var img = $element.find('img')
                img.attr('data-interchange', interchange)

                var def = imgCtrl.alias(defaultAlias)
                if (def) {
                    var defaultUrl = imgCtrl.url(id, def)
                    var fallback = angular.element('<noscript/>')
                    fallback.append('<img src="' + defaultUrl + '">')
                    $element.append(fallback)
                }
            }
        }
    })
