angular.module('ng-mediaflow', [])
    .service('mediaflowConfigParser', function() {
        return function(config) {
            if (typeof config === 'string') {
                try {
                    config = JSON.parse(config)
                }
                catch (e) {
                    throw new Error('Bad JSON given to mediaflowConfigParser')
                }
            }
            return config
        }
    })
    .service('mediaflowConfigFormatter', function() {
        return function(config) {
            var tempConfig = {
                width: config[0],
                height: config[1]
            }
            if (config.length > 2) {
                config.slice(2).forEach(function(conf) {
                    var parts = conf.split(':')
                    tempConfig[parts[0]] = parts[1]
                })
            }
            return tempConfig
        }
    })
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
    .directive('mfImg', function(mediaflowConfigParser, mediaflowConfigFormatter) {
        return {
            priority: 0,
            restrict: 'EA',
            scope: {id: '@mfId',mfFormat:'@mfFormat'},
            template: '<img>',
            link: function($scope, $element, attrs, ctrl) {
                if (!('mfInterchange' in attrs)) {
                    var src = ctrl.url($scope.id, $scope.mfImgConfig)
                    console.log('build src', src, attrs);
                    $element.find('img').attr('src', src)
                }
            },
            controller: function($scope, $parse, $attrs, mediaflow) {
                $scope.mfFormat = $scope.mfFormat || 'jpg'
                $scope.mfImgConfig = null
                this.aliases = mediaflow.aliases()
                this.alias = function(name) {
                    return name in this.aliases ? this.aliases[name] : null
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
                    if ('original' in config) {
                        parts.push('?original=' + parseInt(config.original, 10))
                    }
                    return parts.join('')
                }

                var config = null
                if ($attrs.config)
                    config = this.alias($attrs.config) || $attrs.config
                else if ($attrs.alias)
                    config = this.alias($attrs.alias) || $attrs.alias
                // TODO Revise how formatting is handled
                if (typeof config !== 'object') {
                    config = mediaflowConfigParser(config)
                    if (config)
                        config = mediaflowConfigFormatter(config)
                }
                $scope.mfImgConfig = config


                if (!$scope.width && !$scope.height && ('default' in this.aliases)) {
                    $scope.width = this.aliases.default.width
                    $scope.height = this.aliases.default.height
                }
            }
        }
    })
    .directive('mfInterchange', function($compile, mediaflowConfigFormatter, mediaflowConfigParser) {
        return {
            priority: 1,
            restrict: 'A',
            require: 'mfImg',
            compile: function($element, $attrs) {
                return {
                    pre: function preLink($scope, $element, attrs, imgCtrl) {
                        var id = attrs.mfId
                        var versions = mediaflowConfigParser(attrs.mfInterchange)

                        var interchangeParts = [], config = null
                        for (var name in versions) {
                            config = versions[name]
                            if (typeof config === 'string')
                                config = imgCtrl.alias(config)
                            else if (Array.isArray(config))
                                config = mediaflowConfigFormatter(config)

                            config.mfFormat = attrs.mfFormat
                            interchangeParts.push('[' + imgCtrl.url(id, config) + ', (' + name + ')]')
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
