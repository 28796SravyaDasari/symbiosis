angular.module('mobionicApp.directives', [])
.directive('firstcap', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, modelCtrl) {
            var capitalize = function(inputValue) {
                if (inputValue === undefined) return '';
                var capitalized = inputValue.substr(0,1).toUpperCase() + inputValue.substr(1,inputValue.length);
                if (capitalized !== inputValue) {
                    modelCtrl.$setViewValue(capitalized);
                    modelCtrl.$render();
                }
                return capitalized;
            };
            modelCtrl.$parsers.push(capitalize);
            capitalize(scope[attrs.ngModel]); // capitalize initial value
        }
    };
})
.directive('onlyAlpha', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue === undefined) return '';
                var transformedInput = inputValue.replace(/[0-9]/g, '');
                if (transformedInput !== inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };
})
.directive('onlyDigits', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue === undefined || inputValue === null) return '';
                var transformedInput;
                transformedInput = inputValue.toString().replace(/[^0-9]/g, '');
                if(attrs && attrs.ngMaxlength){
                    transformedInput = transformedInput.substr(0,attrs.ngMaxlength);
                }
                if (transformedInput !== inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };
})
.directive('decimal', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, modelCtrl) {
            modelCtrl.$parsers.push(function (inputValue) {
                if (inputValue === undefined || inputValue === null) return '';
                var transformedInput;
                transformedInput = inputValue.toString().replace(/[^0-9.]/g, '');
                if(transformedInput.split('\.').length > 2) {
                    console.log(transformedInput);
                    transformedInput = transformedInput.substring(0, transformedInput.length - 1);
                }
                if(attrs && attrs.ngMaxlength){
                    transformedInput = transformedInput.substr(0,attrs.ngMaxlength);
                }
                if (transformedInput !== inputValue) {
                    modelCtrl.$setViewValue(transformedInput);
                    modelCtrl.$render();
                }
                return transformedInput;
            });
        }
    };
});
