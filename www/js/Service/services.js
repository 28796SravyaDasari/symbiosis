var app = angular.module('mobionicApp.services1', []);
app.service('Service', function($http, $rootScope){
    var urlPrefix = 'http://52.15.120.234:3000/api';
    //var urlPrefix = 'http://localhost:4000/api';
    this.httpRequest = function(req) {
        return $http({
            url: urlPrefix + req.myUrl,
            method: req.myMethod,
            skipAuthorization: req.mySkipAuthorization,
            headers: req.myHeaders,
            data : req.myData
        });
    };
})
.filter('insuranceFilter', function($filter){
    return function(list, arrayFilter, element){
        if(arrayFilter){
            return $filter("filter")(list, function(listItem){
                return arrayFilter.indexOf(listItem[element]) != -1;
            });
        }
    };
});
