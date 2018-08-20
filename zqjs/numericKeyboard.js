(function () {
    'use strict';
    angular.module('numericKeyboard', []);
    angular.module('numericKeyboard').directive('numericKeyboard', numericKeyboard);

    function numericKeyboard(numericKeyboardService) {
        return {
            restrict: 'E',
            require: '',
            scope: {
                onOpen: "&",
                onClose: "&"
            },
            templateUrl: 'templates/numericKeyboard.html',
            link: function (scope) {
                scope.numericService = numericKeyboardService;

                scope.append = function (key) {
                    scope.numericService.append(key);
                };

                scope.done = function () {
                    scope.numericService.done();
                };

                scope.clear = function () {
                    scope.numericService.clear();
                };

                scope.reset = function (key) {
                    scope.numericService.clear();
                    scope.numericService.append(key);
                };

                scope.deleteOne = function () {
                    scope.numericService.deleteOne();
                }

                scope.close = function () {
                    scope.numericService.done();
                    scope.isOpen = false;
                };

                scope.stopPropagation = function (event) {
                    event.stopPropagation();
                };

                scope.$watch('numericService.isOpened()', function () {
                    scope.isOpen = scope.numericService.isOpened();
                    if(scope.isOpen) scope.onOpen();
                    else scope.onClose();
                }, true);

                scope.$watch('numericService.getType()', function () {
                    scope.keyboardType = numericKeyboardService.getType();
                    console.log('change to : ' + scope.keyboardType);
                }, true);
            }
        };
    }
})();

(function () {
    'use stric';

    angular.module('numericKeyboard').factory('numericKeyboardService', numericKeyboardService);

    function numericKeyboardService() {
        var model = null;
        var opened = false;
        var maxLength = null;
        var getterSetter = null;
        var doneEditing = false;
        var type = 'number'; // 键盘类型 price number

        var service = {
            setModel: setModel,
            clear: clear,
            setModelValue: setModelValue,
            isDone: isDone,
            done: done,
            append: append,
            deleteOne: deleteOne,
            getModel: getModel,
            open: open,
            isOpened: isOpened,
            close: close,
            maxLength: setMaxLength,
            getterSetter: setGetterSetter,
            getType: getType,
            setType: setType
        };

        return service;

        function setModel(newModel) {
            model = newModel;
        }

        function setType(p) {
            type = p;
        }

        function getType() {
            return type;
        }

        function clear() {
            model.$viewValue = "";
            model.$render();
        }

        function setModelValue() {
            doneEditing = true;
            if (model.$viewValue === "") {
                model.$rollbackViewValue();
                return;
            }
            if (getterSetter) {
                // model.$viewValue = getterSetter(model.$viewValue);
                // model.$commitViewValue();
                // return;
            }
            model.$commitViewValue();

        }

        function isDone() {
            return doneEditing;
        }

        function done() {
            this.setModelValue();
            this.close();
        }

        function append(key) {
            if (maxLength) {
                if (model.$viewValue.length >= maxLength) {
                    return;
                }
            }
            if (/.*[\u4e00-\u9fa5]+.*$/.test(model.$viewValue) || model.$viewValue == '0') {
                model.$viewValue = key;
            } else {
                model.$viewValue += key;
            }
            model.$render();
        }

        function deleteOne() {
            var len = model.$viewValue.length;
            if (len > 0) {
                model.$viewValue = model.$viewValue.slice(0, len - 1);
                model.$render();
            }
        }

        function getModel() {
            return model.$viewValue;
        }

        function open() {
            maxLength = null;
            doneEditing = false;
            model = "";
            getterSetter = null;
            opened = true;
        }

        function isOpened() {
            return opened;
        }

        function close() {
            opened = false;
        }

        function setMaxLength(max) {
            maxLength = max;
        }

        function setGetterSetter(GS) {
            getterSetter = GS;
        }
    }
})();

(function () {
    'use strict';

    angular.module('numericKeyboard').directive('numericKeyboardInput', numericKeyboardInput);

    function numericKeyboardInput(numericKeyboardService, $timeout, $browser) {
        return {
            restrict: 'A',
            require: '^ngModel',
            scope: {
                ngBind: "=",
                getterSetter: "&",
                abondonCallback: "&"
            },
            link: function (scope, element, attrs, ctrl) {
                scope.numericService = numericKeyboardService;

                element.bind('click', function () {
                    var element_to_scroll_to = document.getElementById(element.attr("id"));
                    element_to_scroll_to.scrollIntoView({ block: "end", behavior: "smooth" });
                    element.addClass("keyboard-focus");

                    var elements = document.querySelectorAll('[numeric-keyboard-input]');
                    for (var i = 0; i < elements.length; i++) {
                        if (elements[i].id != element.attr("id")) {
                            var list = elements[i].className.split(' ');
                            if (list.indexOf('keyboard-focus') >= 0) {
                                list[list.indexOf('keyboard-focus')] = '';
                                elements[i].className = list.join(' ');
                            }
                        }
                    }
                    // ctrl.$viewValue = "";

                    scope.numericService.open();

                    if (attrs.maxLength) scope.numericService.maxLength(attrs.maxLength);

                    // 设置价格键盘 手数键盘
                    // price number
                    if (attrs.type) scope.numericService.setType(attrs.type);

                    if (angular.isDefined(scope.getterSetter)) {
                        scope.numericService.getterSetter(scope.getterSetter);
                    } else {
                        scope.numericService.getterSetter(null);
                    }

                    scope.numericService.setModel(ctrl);

                    $timeout(function () {
                        scope.$digest();
                    });

                    scope.$watch('numericService.isDone()', function (value) {
                        if (value) {
                            element.removeClass("keyboard-focus");
                            if (ctrl.$modelValue !== ctrl.$$lastCommittedViewValue) {
                                scope.abondonCallback();
                            }
                            scope.ngBind = ctrl.$viewValue;
                        }
                    }, true);

                    scope.$watch('numericService.getModel()', function () {
                        scope.ngBind = ctrl.$viewValue;
                    }, true);
                });

            }
        };
    }
})();
