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
            scope: {id: '@mfId',mfFormat:'@mfFormat'},
            template: '<img ng-src="{{url}}">',
            controller: function($scope, $parse, $attrs, mediaflow) {
                $scope.host = mediaflow.host()
                $scope.mfFormat = $scope.mfFormat || 'jpg'
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
                    var mfFormat = config.mfFormat || 'jpg'
                    if (!w || !h) return null
                    return '//' + mediaflow.host() + '/' + w + 'x' + h + '/' + id + '.'+mfFormat
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
                    height: $scope.height,
                    mfFormat: $scope.mfFormat
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
            compile: function($element, $attrs) {
                return {
                    pre: function postLink($scope, $element, attrs, imgCtrl) {
                        var id = attrs.mfId
                        var format = attrs.mfFormat;
                        var versions = attrs.mfInterchange
                        if (typeof versions === 'string') {
                            try {
                                versions = JSON.parse(versions)
                            }
                            catch (e) {
                                throw new Error('Bad JSON given to <mf-img>')
                            }
                        }
                        var interchangeParts = []
                        for (var name in versions) {
                            var config = versions[name]
                            if (typeof config === 'string') {
                                config = imgCtrl.alias(config)
                                config.mfFormat = format;
                            }
                            else if (Array.isArray(config)) {
                                config = {
                                    width: config[0],
                                    height: config[0],
                                    mfFormat: format
                                }
                            }
                            var url = imgCtrl.url(id, config)
                            interchangeParts.push('[' + url + ', (' + name + ')]')
                        }

                        var interchange = interchangeParts.join(',')
                        var img = $element.find('img')
                        img.attr('data-interchange', interchange)

                        $compile($element.contents())($scope)
                    }
                }
            }
        }
    })
