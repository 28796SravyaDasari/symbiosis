var app = angular.module('mobionicApp.services', []);

app.factory('SessionServices', ['$http', function ($http) {

    var urlBase = '/api/customers';
    var dataFactory = {};
    var SessionServices = {}
    var url = 'https://app.sbismart.com/bo/ContactManagerApi/'

    SessionServices.isLoggedIn = function () {
        if (localStorage.getItem('loginid') == undefined || localStorage.getItem('loginid') == null) {
            return false
        } else {
            return true
        }
    }

    SessionServices.logout = function () {
        localStorage.clear();
    }

    SessionServices.doLogin = function (user) {
        return $http.post(url + 'Login', user)
    }

    return SessionServices

}])

app.factory('ApiService', ['$http', function ($http) {

    var ServiceData = {}
    var url = 'https://app.sbismart.com/bo/ContactManagerApi/'
    //var urlHL = 'http://172.22.2.40/api/HomeLoan'

    ServiceData.leadEntry = function (lead) {
        lead.EntryBy = 'test'
        return $http.post(url + 'HLMobileLeadInsert', lead)
    }

    ServiceData.getLocation = function () {
        return $http.post(url + 'HLLocation')
    }

    ServiceData.getLeadDetail = function (searchVal, searchType) {
        return $http.post(url + 'HomeLoanSearch', { Details: searchVal, type: searchType, userId: localStorage.getItem('loginid') })
    }

    ServiceData.searchHomeLoanDetailsFromCBS = function (searchVal, flag) {
        return $http.post(url + 'CallHomeloanAPI', { Flag: flag, Value: searchVal, Output: 'json' })
    }

    ServiceData.searchApplicationDetailsFromCBS = function (searchVal) {
        return $http.post(url + 'CallHomeloanAPI', { Flag: 'GetDetailsByAppId', Value: searchVal, Output: 'json' })
    }

    ServiceData.loadASEDetails = function () {
        return $http.post(url + 'LoadASE', { type: 'FillAseDetails', userid: localStorage.getItem('loginid') })
    }

    ServiceData.loadAQMDetails = function () {
        return $http.post(url + 'LoadASE', { type: 'FillAQM', userid: localStorage.getItem('loginid') })
    }

    ServiceData.pushToASE = function (data) {
        return $http.post(url + 'ASMUpdate', data)
    }

    ServiceData.pushToAQM = function (data) {
        return $http.post(url + 'ASMUpdate', data)
    }

    ServiceData.FetchDocs = function (contactno) {
        return $http.post(url + 'FetchDocs', { ContactNo: contactno })
    }

    ServiceData.loadEmpList = function (flag) {
        return $http.post(url + 'HomeLoanMaster', { Flag: flag, LoginId: localStorage.getItem('loginid') })
    }

    ServiceData.updateLocation = function (flag, lati, longi, loginid) {
        return $http.post(url + 'HomeLoanMaster', { Flag: flag, Lati: lati, Longi: longi, LoginId: localStorage.getItem('loginid') })
    }

    return ServiceData

}])

app.factory('ShowAlertPopup', function ($ionicPopup) {
    var alertData = {}
    alertData.ShowPopup = function (title, content) {
        $ionicPopup.alert({
            title: title,
            content: content
        }).then(function (res) {

        });
    }
    return alertData;
})

app.factory('Spinner', function ($ionicLoading) {
    var spinner = {}
    spinner.show = function (content, duration) {
        $ionicLoading.show({
            template: content,
            content: content,
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0,
            duration: duration
        });
    }

    spinner.hide = function () {
        $ionicLoading.hide();
    }

    return spinner;
})



app.factory('ValidationService', function ($ionicPopup) {
    var validity = {}
    validity.isPanValid = function (panno) {
        var panVal = panno;
        var regpan = /^([a-zA-Z]){5}([0-9]){4}([a-zA-Z]){1}?$/;
        if (regpan.test(panVal)) {
            return true;
        } else {
            return false;
        }
    }

    validity.isEmailValid = function (emailid) {
        var x = emailid;
        var atpos = x.indexOf('@');
        var dotpos = x.lastIndexOf('.');
        if (atpos < 1 || dotpos < atpos + 2 || dotpos + 2 >= x.length) {
            return false;
        } else {
            return true;
        }
    }

    return validity;
})
;