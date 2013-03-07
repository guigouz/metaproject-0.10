/*global alert: true, jQuery: true, ko: true */
(function (window, $, ko) {
    "use strict";

    var metaproject = window.metaproject = {};

    metaproject.Application = function (params) {
        var self = this;

        self.debug = 0;

        if(typeof(params) === 'function') {
            self.init = params;
        }
        else {
            self.init = function () {};
            $.extend(this, params);
        }

        self.run = function (element) {
            ko.applyBindings(self, element);
            self.init.call(self);
            $(window).trigger('hashchange');
        };

    };

    /* jQuery plugs */

    $.fn.applyBindings = function (viewModel) {
        this.data('viewModel', viewModel).each(function (idx, element) {
            ko.applyBindings(viewModel, element);
        });
    };

    /* Includes and initializes another file on the element */
    $.fn.include = function (url, callback) {
        var self = this,
            params = metaproject.debug ? '?ts=' + new Date().getTime() : '';

        if (self.data('loaded') === url) {
            return this;
        }
        else {
            return this.addClass('loading').load(url + params, function () {

                self.data('loaded', url).removeClass('loading');
                //metaproject.init(self.removeClass('loading'));

                if (undefined !== callback) {
                    callback();
                }
            });
        }

    };

    /* Custom Binding handlers */

    // Includes an external file on the DOM element
    ko.bindingHandlers.include = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element),
                params = valueAccessor(),
                url = allBindingsAccessor().url;

            if (params instanceof Array) {
                $element.include(params[0], params[1]);
            }
            else {
                $element.include(params);
            }

            // If there's no url assigned to this node, activate it
            // (Otherwise it will be activated according to the hash)
            if(!url) {
                $element.children().trigger('activate', $element);
            }
        }
    };

    // Attach an url controller to this node
    // The node will receive activate and deactivate events when the url changes
    ko.bindingHandlers.url = {
        init: function(element, valueAccessor, allBindingsAccessor) {
            var $element = $(element),
                url = valueAccessor();

            $element.css({ visibility: 'hidden', position: 'absolute', height: 0, overflow: 'hidden' });

            $(window).on('hashchange', function(e) {
                var hash = window.location.hash.substr(1) || '/';

                if(hash === url) {
                    if($element.css('visibility') !== 'visible') {
                        $element.css({ visibility: 'visible', position: 'inherit', height: 'auto', overflow: 'inherit' }).children().trigger('activate', [ element, hash ]);
                    }
                }
                else {
                    if($element.css('visibility') === 'visible') {
                        $element.css({ visibility: 'hidden', position: 'absolute', height: 0, overflow: 'hidden' }).children().trigger('deactivate', [$element, hash]);
                    }
                }
            });


            // TODO dispose callback
        }
    };

})(window, jQuery, ko);
