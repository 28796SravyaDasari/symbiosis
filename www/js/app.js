// Mobionic: Mobile Ionic Framework

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'mobionicApp' is the name of this angular module (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('mobionicApp', [
        'ionic',
        'ion-floating-menu',
        'tabSlideBox',
        'mobionicApp.controllers',
        'mobionicApp.services',
        'mobionicApp.data',
        'mobionicApp.directives',
        'mobionicApp.filters',
        'mobionicApp.storage',
        'ngSanitize',
        'uiGmapgoogle-maps',
        'ionic.service.core',
        'ionic.service.push',
        'ngCordova',
        'mobionicApp.services1',
        'LocalStorageModule',
        'ionic-datepicker',
        'ui.select',
        'angular-jwt'])

.run(function ($ionicPlatform, $rootScope, SessionServices, ApiService, $state, $timeout) {
    $rootScope.instantQuotes = 'http://test.symboinsurance.com/api/quotes/health/instantQuotes';
    $rootScope.healthProposal = 'http://test.symboinsurance.com/api/proposals/healthProposals';
    $rootScope.insurerHealthProposals = 'http://test.symboinsurance.com/api/proposals/insurerHealthProposals';
    $rootScope.ACCESS_TOKEN = "ACCESS_TOKEN";
    $rootScope.AGENT_INFO = "AGENT_INFO";
    $rootScope.GEN_INFO = "GEN_INFO";
    $rootScope.PROPOSER_INFO = "PROPOSER_INFO";
    $rootScope.NOMINEE_INFO = "NOMINEE_INFO";
    $rootScope.CONTACT_INFO = "CONTACT_INFO";
    $rootScope.FAMILY = "FAMILY";
    $rootScope.HEALTH_PROPOSAL = "HEALTH_PROPOSAL";
    $rootScope.HAS_DESEASE = "HAS_DESEASE";
    $rootScope.FAMILY_DISEASE = "FAMILY_DISEASE";
    $rootScope.QUOTE_DETAILS = "QUOTE_DETAILS";
    $rootScope.getDbFormatDate = function(dateStr){
        var arr = dateStr.split("/");
        var dd = arr[0].length < 2 ? "0"+arr[0] : arr[0];
        var mm = arr[1].length < 2 ? "0"+arr[1] : arr[1];
        var yyyy = arr[2];
        return yyyy + "-"+ mm + "-"+ dd;
    };
    Array.prototype.contains = function contains(obj) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    };
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
        $rootScope.Name = localStorage.getItem('Name')
        $rootScope.UserType = localStorage.getItem('UserType')
        // Open any external link with InAppBrowser Plugin
        $(document).on('click', 'a[href^=http], a[href^=https]', function (e) {

            e.preventDefault();
            var $this = $(this);
            var target = $this.data('inAppBrowser') || '_blank';

            window.open($this.attr('href'), target);

        });

        // Initialize Push Notifications
        var initPushwoosh = function () {
            var pushNotification = window.plugins.pushNotification;

            if (device.platform == "Android") {
                registerPushwooshAndroid();
            }
            if (device.platform == "iPhone" || device.platform == "iOS") {
                registerPushwooshIOS();
            }
        }

        // Uncomment the following initialization when you have made the appropriate configuration for iOS - http://goo.gl/YKQL8k and for Android - http://goo.gl/SPGWDJ
        // initPushwoosh();

    });

})

.config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider, localStorageServiceProvider, jwtOptionsProvider, $httpProvider) {
    // $ionicConfigProvider
    // http://ionicframework.com/docs/api/provider/%24ionicConfigProvider/
    $ionicConfigProvider.tabs.position('bottom');
    $ionicConfigProvider.navBar.alignTitle('center');

    jwtOptionsProvider.config({
        authPrefix: '',
        tokenGetter: function(localStorageService, $rootScope) {
            var token = localStorageService.get($rootScope.ACCESS_TOKEN);
            if(token){
                return token.split('\"').join('');
            }
            return token;
        },
        whiteListedDomains: ['52.15.120.234', 'localhost']
    });

    $httpProvider.interceptors.push('jwtInterceptor');

    localStorageServiceProvider
        .setPrefix('Symbo')
        .setStorageType('sessionStorage')
        .setNotify(true, true);

    $stateProvider

    .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
    })


    .state('app.home1', {
        url: "/home1",
        views: {
            'menuContent': {
                templateUrl: "templates/home-grid-3.html",
                controller: 'HomeCtrl'
            }
        },
        cache: false
    })

     .state('app.proposal', {
        url: "/proposal",
        views: {
            'menuContent': {
                templateUrl: "templates/Proposal.html",
                controller: 'HomeCtrl'
            }
        },
        cache: false
    })
     .state('app.proposerDetails', {
        url: "/proposerDetails?id",
        views: {
            'menuContent': {
                templateUrl: "templates/proposerDetails.html",
                controller: 'ProposerDetailsCtrl'
            }
        },
        params : {
            id : null
        },
        cache: false
    })
     .state('app.nomineeDetails', {
        url: "/nomineeDetails?id",
        views: {
            'menuContent': {
                templateUrl: "templates/nomineeDetails.html",
                controller: 'NomineeDetailsCtrl'
            }
        },
        params : {
            id : null
        },
        cache: false
    })
    
    .state('app.SummaryDetails', {
        url: "/SummaryDetails",
        views: {
            'menuContent': {
                templateUrl: "templates/SummaryDetails.html",
                controller: 'SummaryDetailsCtrl'
            }
        },
        cache: false
    })
    
     .state('app.contactDetails', {
        url: "/contactDetails",
        views: {
            'menuContent': {
                templateUrl: "templates/contactDetails.html",
                controller: 'ContactDetailsCtrl'
            }
        },
        cache: false
    })
    
       .state('app.signon', {
        url: "/signon",
        views: {
            'menuContent': {
                templateUrl: "templates/signon.html",
                controller: "LoginCtrl"
            }
        }
    })

     .state('app.GenInfo', {
        url: "/GenInfo",
        views: {
            'menuContent': {
                templateUrl: "templates/GenInfo.html",
                controller : "GenInfoCtrl"
            }
        },
        cache: false
    })
    
      .state('app.dashboard', {
        url: "/dashboard",
        views: {
            'menuContent': {
                templateUrl: "templates/dashboard.html",
                controller : "DashCtrl"
            }
        },
        resolve : {
            usersList : function(Service){
                var req = {
                    myUrl : '/users',
                    myMethod : 'GET',
                    mySkipAuthorization : false,
                    myHeaders : {
                        'Content-Type': 'application/json'
                    },
                    myData : {
                    }
                };
                return Service.httpRequest(req);
            }
        }
    })
    
      .state('app.ListHealth', {
          url: "/ListHealth",
          views: {
              'menuContent': {
                  templateUrl: "templates/ListHealth.html",
                  controller : 'ListHealthCtrl'
              }
          },
          params : {
              agentData : null,
              insuranceList : null
          }
      })
      .state('app.insuranceSummary', {
          url: "/insuranceSummary?proposerId",
          views: {
              'menuContent': {
                  templateUrl: "templates/dashboard/insuranceSummary.html",
                  controller : 'InsuranceSummaryCtrl'
              }
          },
          params : {
              proposerId : null
          },
          resolve : {
              insuranceDetails : function(Service, $stateParams){
                  var req = {
                      myUrl : '/health/getByProposerId/' + $stateParams.proposerId,
                      myMethod : 'GET',
                      mySkipAuthorization : false,
                      myHeaders : {
                          'Content-Type': 'application/json'
                      },
                      myData : {
                      }
                  };
                  return Service.httpRequest(req);
              }
          }
      })

    .state('app.Medical', {
        url: "/Medical",
        views: {
            'menuContent': {
                templateUrl: "templates/Medical.html"
            }
        },
        cache: false
    })
     .state('app.signup', {
            url: "/signup",
            views: {
                'menuContent': {
                    templateUrl: "templates/singup.html",
                    controller : 'SignupCtrl'
           }
     }
})

    .state('app.familyMembers', {
        url: "/family-members",
        views: {
            'menuContent': {
                templateUrl: "templates/addMembers.html",
				controller: 'AddMemberCtrl'
            }
        },
        cache: false
    })
    .state('app.badInsurer', {
        url: "/badInsurer",
        views: {
            'menuContent': {
                templateUrl: "templates/badInsurer.html",
				controller: 'BadInsurerCtrl'
            }
        },
        cache: false
    })

    .state('app.diseases', {
        url: "/diseases",
        views: {
            'menuContent': {
                templateUrl: "templates/mapDiseases.html",
				controller: 'DiseaseCtrl'
            }
        },
        cache: false
    })

    .state('app.tellCarInfo', {
        url: "/tellCarInfo",
        views: {
            'menuContent': {
                templateUrl: "templates/tellCarInfo.html"
            }
        },
        cache: false
    })


    .state('app.quoteDetails', {
        url: '/quoteDetails',
        views: {
            'menuContent': {
                templateUrl: 'templates/quoteDetails.html',
                controller: 'QuoteCtrl'
            }
        },
        params : {
            details : null
        },
        cache: false
    })
       .state('app.product', {
           url: '/product',
           views: {
               'menuContent': {
                   templateUrl: 'templates/productDetails.html',
                   controller: 'ProductCtrl'
               }
           },
           resolve : {
               productDetails : function($http, $rootScope, localStorageService){
                   var genInfo = localStorageService.get($rootScope.GEN_INFO);
                   return $http({
                       url : $rootScope.instantQuotes,
                       method : 'POST',
                       headers : {
                       'Content-Type': 'application/json'
                       },
                       data : {
                           "pageSize": 100,
                           "pageNumber": 0,
                           "healthQuoteCriteria": {
                               "pinCode": genInfo.pinCode,
                               "stateCode": "21",
                               "members": [
                               {
                                   "relationship": "SELF",
                                   "gender": "MALE",
                                   "age": {
                                       "years": 30
                                   },
                                   "memberRefId": "000001"
                               }
                               ],
                               "minSumInsured": 300000,
                               "maxSumInsured": 350000
                           }
                       }
                   });
               }
        },
        cache: false
       })

    .state('app.empregister', {
        url: '/empregister',
        views: {
            'menuContent': {
                templateUrl: 'templates/EmpRegister.html',
                controller: 'EmployeeCtrl'
            }
        }
    })


    .state('app.leadentry', {
        url: '/leadentry',
        views: {
            'menuContent': {
                templateUrl: 'templates/leadentry.html',
                controller: 'LeadEntryCtrl'
            }
        }
    })

    .state('app.emplist', {
        url: '/emplist',
        views: {
            'menuContent': {
                templateUrl: 'templates/emplist.html',
                controller: 'TrackEmployee'
            }
        }
    })


   .state('app.searchlead', {
       url: '/searchlead',
       views: {
           'menuContent': {
               templateUrl: 'templates/searchlead.html',
               controller: 'LeadEntryCtrl'
           }
       }
   })

    .state('app.searchLeadCBS', {
        url: '/searchLeadCBS',
        views: {
            'menuContent': {
                templateUrl: 'templates/searchLeadCBS.html',
                controller: 'LeadEntryCtrl'
            }
        }
    })

    .state('app.updateLeadStatus', {
        url: '/updateLeadStatus/:MobileNo/:Name/:Panno/:LeadId',
        views: {
            'menuContent': {
                templateUrl: 'templates/updateLeadStatus.html',
                controller: 'LeadEntryCtrl'
            }
        }
    })


    .state('app.map', {
        url: "/map/:lati/:longi/:empname",
        views: {
            'menuContent': {
                templateUrl: "templates/map.html",
                controller: 'MapCtrl'
            }
        }
    })



    .state('app.settings', {
        url: "/settings",
        views: {
            'menuContent': {
                templateUrl: "templates/settings.html",
                controller: 'SettingsCtrl'
            }
        }
    });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/signon');
});
