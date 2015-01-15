angular.module('ng-mediaflow', [])
    .provider('mediaflow', function() {
        this.host = null
        this.port = null
        this.aliases = {}

        this.setHost = function(host, port) {
            this.host = host
            this.port = port
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
            var port = this.port
            var aliases = this.aliases
            return {
                host: function() { return host },
                port: function() { return port },
                aliases: function() { return aliases }
            }
        }
    })
    .directive('mfImg', function() {
        return {
            priority: 0,
            restrict: 'EA',
            scope: {id: '@mfId',mfFormat:'@mfFormat'},
            template: '<img>',
            link: function($scope, $element, attrs, ctrl) {
                if (!('mfInterchange' in attrs)) {
                    var src = ctrl.url($scope.id, {
                        width: $scope.width,
                        height: $scope.height,
                        mfFormat: $scope.mfFormat
                    })
                    $element.find('img').attr('src', src)
                }
            },
            controller: function($scope, $parse, $attrs, mediaflow) {
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
                    var port = mediaflow.port()
                    var host = mediaflow.host()
                    var parts = [
                        '//', host, (port ? ':'+port : ''),
                        '/', w, 'x', h, '/', id, '.', mfFormat
                    ]
                    return parts.join('')
                }

                if (!$scope.width && !$scope.height && ('default' in this.aliases)) {
                    $scope.width = this.aliases.default.width
                    $scope.height = this.aliases.default.height
                }

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
                    pre: function preLink($scope, $element, attrs, imgCtrl) {
                        var id = attrs.mfId
                        var format = attrs.mfFormat
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
                                config.mfFormat = format
                            }
                            else if (Array.isArray(config)) {
                                var tempConfig = {
                                    width: config[0],
                                    height: config[1],
                                    mfFormat: format
                                }
                                config = tempConfig
                            }
                            var url = imgCtrl.url(id, config)
                            interchangeParts.push('[' + url + ', (' + name + ')]')
                        }

                        var attributeName = 'interchange'
                        if (attrs.mfInterchangePrefix)
                            attributeName = attrs.mfInterchangePrefix  + attributeName

                        $element.find('img').attr(attributeName, interchangeParts.join(','))

                        $compile($element.contents())($scope)
                        if (attributeName.match(/^data-/)) {
                            $(document).foundation('interchange', 'reflow')
                        }
                    }
                }
            }
        }
    })
