angular.module('mobionicApp.controllers', ['mobionicApp.services'])

.controller('LoginCtrl', function($scope, $state, Service, localStorageService, $rootScope){
    var keys = localStorageService.keys();
    keys.forEach(function(k,v){
        localStorageService.remove(k);
    });

    $scope.userDetails = {
        username : 'symbo.admin',
        password : 'Admin@123'
    };

    $scope.login = function(){

        var loginDetails = angular.copy($scope.userDetails);
        var req = {
            myUrl : '/auth/login',
            myMethod : 'POST',
            mySkipAuthorization : true,
            myHeaders : {
                'Content-Type': 'application/json'
            },
            myData : {
                username : loginDetails.username,
                password : loginDetails.password
            }
        };
        Service.httpRequest(req).then(function(res){
            localStorageService.set($rootScope.ACCESS_TOKEN,res.data.access_token);
            localStorageService.set($rootScope.AGENT_INFO,res.data.userDetails);
            $state.go('app.GenInfo');
        }, function(err){
            console.error(err);
        });
    };
})

// Get info Controller
.controller('GenInfoCtrl', function($rootScope, $scope, $state, Service, localStorageService){
    $scope.toInsureList = ['Myself', 'My Family', 'Myself and My Family'];
    $scope.ageList = ['Select'];
    for(i=18;i<=100;i++){
        $scope.ageList.push(i+ " Years");
    }

    $scope.genInfo = {
        toInsure : 'Myself',
        pinCode : '',
        gender : 'M',
        age : 'Select',
        email : '',
        phone : ''
    };
    $scope.genInfoError = {
        pinCode : {
            hasError : false,
            message : ''
        },
        age : {
            hasError : false,
            message : ''
        },
        email : {
            hasError : false,
            message : ''
        },
        phone : {
            hasError : false,
            message : ''
        }
    };
    var REG_VALID_EMAIL = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    $scope.validate = function(){
        var info = angular.copy($scope.genInfo);
        if(!info.pinCode || info.pinCode.length !== 6){
            $scope.genInfoError.pinCode.hasError = true;
            $scope.genInfoError.pinCode.message = "Please enter valid pin code";
            return false;
        }else{
            $scope.genInfoError.pinCode.hasError = false;
            $scope.genInfoError.pinCode.message = "";
        }
        if(!info.age || info.age === "Select"){
            $scope.genInfoError.age.hasError = true;
            $scope.genInfoError.age.message = "Please select your age";
            return false;
        }else{
            $scope.genInfoError.age.hasError = false;
            $scope.genInfoError.age.message = "";
        }
        if(!info.email || !REG_VALID_EMAIL.test(info.email)){
            $scope.genInfoError.email.hasError = true;
            $scope.genInfoError.email.message = "Please enter your valid email";
            return false;
        }else{
            $scope.genInfoError.email.hasError = false;
            $scope.genInfoError.email.message = "";
        }
        if(!info.phone || info.phone.toString().length !== 10){
            $scope.genInfoError.phone.hasError = true;
            $scope.genInfoError.phone.message = "Please enter your valid phone";
            return false;
        }else{
            $scope.genInfoError.phone.hasError = false;
            $scope.genInfoError.phone.message = "";
        }
        return true;
    };
    if(localStorageService.get($rootScope.GEN_INFO)){
        $scope.genInfo = localStorageService.get($rootScope.GEN_INFO);
    }
    $scope.next = function(){
        if(!$scope.validate()){
            return;
        }
        localStorageService.set($rootScope.GEN_INFO, $scope.genInfo);
        $state.go('app.home1');
    };

})

.controller('ListHealthCtrl', function($scope, $state, $stateParams){
    $scope.agentData = $stateParams.agentData;
    $scope.insuranceList = $stateParams.insuranceList;
})
.controller('InsuranceSummaryCtrl', function($scope, $state, $stateParams, insuranceDetails){
    $scope.insuranceDetails = insuranceDetails.data;
    $scope.plan = JSON.parse($scope.insuranceDetails.plan);
})

    .controller('DashCtrl', function($rootScope, $scope, $state, Service, localStorageService, usersList){
        $scope.currentDate = new Date();
        $scope.minDate = new Date(1930, 1, 1);
        $scope.maxDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
        $scope.isListRefreshed = false;
        $scope.insuranceList = [];
        var users = usersList.data;
        $scope.agents = [{
            "name" : "Select",
            "value" : "Select"
        }];
        for(var i = 0; i < users.length; i++){
            $scope.agents.push({
                "name" : users[i].username,
                "value" : users[i].user_id
            });
        }
        $scope.filterData = {
            agent : $scope.agents[0],
            from_date : '',
            to_date : '',
        };
        $scope.datePickerFromCallback = function (val) {
            if (val) { 
                var date = new Date(val);
                $scope.filterData.from_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            }
        };
        $scope.datePickerToCallback = function (val) {
            if (val) { 
                var date = new Date(val);
                $scope.filterData.to_date = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
            }
        };
        $scope.goToPolicies = function(){
            $state.go('app.ListHealth', {"agentData" : $scope.filterData, "insuranceList" : $scope.insuranceList});
        };
        $scope.getInsuranceData = function(){
            var filterData = angular.copy($scope.filterData);
            $scope.isListRefreshed = false;
            var req = {
                myUrl : '/health/getByUserId?user_id=' + filterData.agent.value + "&from_date=" + $rootScope.getDbFormatDate(filterData.from_date) + "&to_date=" + $rootScope.getDbFormatDate(filterData.to_date),
                myMethod : 'GET',
                mySkipAuthorization : false,
                myHeaders : {
                    'Content-Type': 'application/json'
                },
                myData : {
                }
            };
            Service.httpRequest(req).then(function(res){
                $scope.insuranceList = res.data;
                $scope.isListRefreshed = true;
            }, function(err){
                $scope.isListRefreshed = true;
                console.error(err);
            });
        };
})

// Home Controller
.controller('HomeCtrl', function ($scope, $state, SessionServices, ShowAlertPopup, localStorageService, $rootScope) {
    var genInfo = localStorageService.get($rootScope.GEN_INFO);

    $scope.next = function(ans){
        localStorageService.set($rootScope.HAS_DESEASE,ans);
        if(genInfo.toInsure === 'Myself'){
            var mySelf = {
                relationship : 'Self',
                age : genInfo.age,
                pincode : genInfo.pinCode
            };
            localStorageService.set($rootScope.FAMILY, [mySelf]);
            if(ans){
                $state.go('app.diseases');
            }else{
                $state.go('app.product');
            }
            return;
        }
        if(ans){
            $state.go('app.familyMembers');
        }else{
            $state.go('app.product');
        }
        return;
    };

})
/*.controller('ProductCtrl', function ($scope,$rootScope , $state, $ionicLoading, productDetails, localStorageService) {

    $scope.productList = productDetails.data.content;
   
    $scope.proposerDetails = localStorageService.get($rootScope.GEN_INFO);
    console.log($scope.proposerDetails);
//    
// $ionicModal.fromTemplateUrl('templates/custom.html', {
//    scope: $scope
//  }).then(function(modal) {
//    $scope.modal = modal;
//  });
    
    $ionicModal.fromTemplateUrl('templates/custom.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalCust = modal;
    });



    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modalCust.hide();
    };

    // Open the login modal
    $scope.openPop = function () {
        $scope.modalCust.show();
    };
    

    $scope.goToQuoteDetails = function(id){
        $state.go('app.quoteDetails', {}, {reload: true}, {details : $scope.productList[id]});
    };

})*/

// Nominee Details Controller
.controller('NomineeDetailsCtrl', function ($rootScope, $scope, $state, SessionServices, ShowAlertPopup, localStorageService, $stateParams) {
    $scope.quoteData=localStorageService.get($rootScope.QUOTE_DETAILS);
    var index = null;
    $scope.detailsFor = null;
    $scope.members = localStorageService.get($rootScope.FAMILY);
    index = $stateParams.id;
    $scope.detailsFor = $scope.members[index].name;
    $scope.pageTitle = "Nominee Details - " + $scope.detailsFor;
    $scope.relationshipList = ['Select', 'Aunt', 'Brother', 'Daughter', 'Father', 'Mother', 'Nephew', 'Niece', 'Others', 'Sister', 'Son', 'Spouse', 'Uncle'];
    $scope.nomineeDetails = {
        firstName : '',
        lastName : '',
        relationship : 'Select'
    };
     $scope.genInfoError = {
        firstName : {
            hasError : false,
            message : ''
        },
        lastName : {
            hasError : false,
            message : ''
        },
        relationship : {
            hasError : false,
            message : ''
        }
    };
    
         $scope.validate = function(){
        var info = angular.copy($scope.nomineeDetails);
        if(!info.firstName || info.firstName.match(/^([a-zA-Z ]){2,30}$/)===null){
            $scope.genInfoError.firstName.hasError = true;
            $scope.genInfoError.firstName.message = "Please enter valid First Name";
            return false;
        }else{
            $scope.genInfoError.firstName.hasError = false;
            $scope.genInfoError.firstName.message = "";
        }
        if(!info.lastName || info.lastName.match(/^([a-zA-Z ]){2,30}$/)===null){
            $scope.genInfoError.lastName.hasError = true;
            $scope.genInfoError.lastName.message = "Please enter valid Last Name";
            return false;
        }else{
            $scope.genInfoError.lastName.hasError = false;
            $scope.genInfoError.lastName.message = "";
        }
        if(!info.relationship || info.relationship === "Select"){
            $scope.genInfoError.relationship.hasError = true;
            $scope.genInfoError.relationship.message = "Please select your Occupation";
            return false;
        }else{
            $scope.genInfoError.relationship.hasError = false;
            $scope.genInfoError.relationship.message = "";
        }   
        
        return true;
    };
    
    
    $scope.nomineeDetailsList = localStorageService.get($rootScope.NOMINEE_INFO);
    if(!$scope.nomineeDetailsList){
        $scope.nomineeDetailsList = [];
    }else{
        if($scope.nomineeDetailsList.length > index){
            $scope.nomineeDetails = $scope.nomineeDetailsList[index];
        }
    }
    $scope.next = function(){
        if(!$scope.validate()){
            return;
        }
        if($scope.nomineeDetailsList.length === 0){
            $scope.nomineeDetailsList.push($scope.nomineeDetails);
        }else{
            $scope.nomineeDetailsList[index] = $scope.nomineeDetails;
        }
        localStorageService.set($rootScope.NOMINEE_INFO, $scope.nomineeDetailsList);
        if(index < $scope.members.length - 1){
            $state.go('app.nomineeDetails', {id : parseInt($stateParams.id) + 1});
        }else{
            $state.go('app.contactDetails');
        }
    };
    /*$scope.next = function(){
        localStorageService.set($rootScope.NOMINEE_INFO, $scope.nomineeDetails);
    };*/
})

// Contact Details Controller
.controller('ContactDetailsCtrl', function ($rootScope, $scope, $state, SessionServices, ShowAlertPopup, localStorageService) {
  $scope.quoteData=localStorageService.get($rootScope.QUOTE_DETAILS);
    $scope.pageTitle = "Contact Details";
    $scope.contactDetails = {
        houseNumber : '',
        locality : '',
        landmark : ''
    };
    
     $scope.genInfoError = {
        houseNumber : {
            hasError : false,
            message : ''
        },
        locality : {
            hasError : false,
            message : ''
        },
        landmark : {
            hasError : false,
            message : ''
        }
    };
    
     $scope.validate = function(){
        var info = angular.copy($scope.contactDetails);
        if(!info.houseNumber){
            $scope.genInfoError.houseNumber.hasError = true;
            $scope.genInfoError.houseNumber.message = "Please enter valid House Number";
            return false;
        }else{
            $scope.genInfoError.houseNumber.hasError = false;
            $scope.genInfoError.houseNumber.message = "";
        }
        if(!info.locality){
            $scope.genInfoError.locality.hasError = true;
            $scope.genInfoError.locality.message = "lease enter valid Locality";
            return false;
        }else{
            $scope.genInfoError.locality.hasError = false;
            $scope.genInfoError.locality.message = "";
        }
        if(!info.landmark){
            $scope.genInfoError.landmark.hasError = true;
            $scope.genInfoError.landmark.message = "Please enter valid Landmark";
            return false;
        }else{
            $scope.genInfoError.landmark.hasError = false;
            $scope.genInfoError.landmark.message = "";
        }   
        
        return true;
    };
    
    if(localStorageService.get($rootScope.CONTACT_INFO)){
        $scope.contactDetails = localStorageService.get($rootScope.CONTACT_INFO);
    }
    $scope.next = function(){
         if(!$scope.validate()){
            return;
        }
        localStorageService.set($rootScope.CONTACT_INFO, $scope.contactDetails);
        $state.go('app.SummaryDetails');
    };
})

// Proposer Details Controller
.controller('ProposerDetailsCtrl', function ($rootScope, $scope, $state, SessionServices, ShowAlertPopup, localStorageService, $stateParams) {
    $rootScope.occupationList = ['Select', 'Media / Sports / Armed forces', 'Government employees', 'Professionals (CA, Doctor, lawyer)', 'Private (Sales and marketing)', 'Private (other than Sales / marketing)', 'Self employed / self business', 'Others'];
    var index = null;
    $scope.detailsFor = null;
      $scope.quoteData=localStorageService.get($rootScope.QUOTE_DETAILS);
 
    $scope.members = localStorageService.get($rootScope.FAMILY);
    index = $stateParams.id;
    $scope.detailsFor = $scope.members[index].relationship;
    $scope.pageTitle = "Proposal Details - " + $scope.detailsFor;
    $scope.proposerDetails = {
        firstName : '',
        lastName : '',
        dob : '',
        height : '',
        weight : '',
        occupation : 'Select'
    };
    $scope.genInfoError = {
        firstName : {
            hasError : false,
            message : ''
        },
        lastName : {
            hasError : false,
            message : ''
        },
        dob : {
            hasError : false,
            message : ''
        },
        occupation : {
            hasError : false,
            message : ''
        }, height : {
            hasError : false,
            message : ''
        },weight : {
            hasError : false,
            message : ''
        }
    };
    
    
     $scope.validate = function(){
        var info = angular.copy($scope.proposerDetails);
        if(!info.firstName || info.firstName.match(/^([a-zA-Z ]){2,30}$/)===null){
            $scope.genInfoError.firstName.hasError = true;
            $scope.genInfoError.firstName.message = "Please enter valid First Name";
            return false;
        }else{
            $scope.genInfoError.firstName.hasError = false;
            $scope.genInfoError.firstName.message = "";
        }
        if(!info.lastName || info.lastName.match(/^([a-zA-Z ]){2,30}$/)===null){
            $scope.genInfoError.lastName.hasError = true;
            $scope.genInfoError.lastName.message = "Please enter valid Last Name";
            return false;
        }else{
            $scope.genInfoError.lastName.hasError = false;
            $scope.genInfoError.lastName.message = "";
        }
        if(!info.dob){
            $scope.genInfoError.dob.hasError = true;
            $scope.genInfoError.dob.message = "Please select your Date of Birth";
            return false;
        }else{
            $scope.genInfoError.dob.hasError = false;
            $scope.genInfoError.dob.message = "";
        }
        if(!info.occupation || info.occupation === "Select"){
            $scope.genInfoError.occupation.hasError = true;
            $scope.genInfoError.occupation.message = "Please select your Occupation";
            return false;
        }else{
            $scope.genInfoError.occupation.hasError = false;
            $scope.genInfoError.occupation.message = "";
        }   
         if(!info.height){
            $scope.genInfoError.height.hasError = true;
            $scope.genInfoError.height.message = "Please enter your Height";
            return false;
        }else{
            $scope.genInfoError.height.hasError = false;
            $scope.genInfoError.height.message = "";
        }
          if(!info.weight){
            $scope.genInfoError.weight.hasError = true;
            $scope.genInfoError.weight.message = "Please enter your Weight";
            return false;
        }else{
            $scope.genInfoError.weight.hasError = false;
            $scope.genInfoError.weight.message = "";
        }
          if($scope.calcbmi(info.weight,info.height)<15){
            $scope.genInfoError.weight.hasError = true;
            $scope.genInfoError.weight.message = "BMI Could not be Less than 15";
              $scope.genInfoError.height.hasError = true;
            $scope.genInfoError.height.message = "";
            return false;
        }else{
            $scope.genInfoError.weight.hasError = false;
            $scope.genInfoError.weight.message = "";
            $scope.genInfoError.height.hasError = false;
            $scope.genInfoError.height.message = "";
        }
             if($scope.calcbmi(info.weight,info.height)>35){
            $scope.genInfoError.weight.hasError = true;
            $scope.genInfoError.weight.message = "BMI Could not be Greater than 35";
              $scope.genInfoError.height.hasError = true;
            $scope.genInfoError.height.message = "";
            return false;
        }else{
            $scope.genInfoError.weight.hasError = false;
            $scope.genInfoError.weight.message = "";
            $scope.genInfoError.height.hasError = false;
            $scope.genInfoError.height.message = "";
        }
         
        return true;
    };
    
    $scope.calcbmi=function(weight,height){
        
        var heightcm=height;
        var weightkg= weight;
        
        var BMI=(weightkg/heightcm/heightcm)*10000;
        console.log(BMI);
        return BMI;
        
        
    };
    
    $scope.currentDate = new Date();
    $scope.minDate = new Date(1930, 1, 1);
    $scope.maxDate = new Date(new Date());

    $scope.datePickerCallback = function (val) {
        if (val) { 
            var date = new Date(val);
            $scope.proposerDetails.dob = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear();
        }
    };
    $scope.proposerDetailsList = localStorageService.get($rootScope.PROPOSER_INFO);
    if(!$scope.proposerDetailsList){
        $scope.proposerDetailsList = [];
    }else{
        if($scope.proposerDetailsList.length > index){
            $scope.proposerDetails = $scope.proposerDetailsList[index];
        }
    }
    $scope.next = function(){
         if(!$scope.validate()){
            return;
        }
        if($scope.proposerDetailsList.length === 0){
            $scope.proposerDetailsList.push($scope.proposerDetails);
        }else{
            $scope.proposerDetailsList[index] = $scope.proposerDetails;
        }
        $scope.members[index].name = $scope.proposerDetails.firstName;
        localStorageService.set($rootScope.FAMILY, $scope.members);
        localStorageService.set($rootScope.PROPOSER_INFO, $scope.proposerDetailsList);
        if(index < $scope.members.length - 1){
            $state.go('app.proposerDetails', {id : parseInt($stateParams.id) + 1});
        }else{
            $state.go('app.nomineeDetails', {id : 0});
        }
    };
})
.controller('ProductCtrl', function ($scope,$rootScope , $state, $ionicLoading, productDetails, localStorageService, $ionicModal, $http, $ionicPopup, $filter) {


    $scope.filterDetails = {
        sumInsured : 'Select',
        peopleIncluded : 'All',
        insurers : []
    };

    $scope.showSelected = function(){
        var tempList = $filter('filter')($scope.filterDetails.insurers, {value: true});
        $scope.displayList = [];
        tempList.forEach(function(v, k){
            $scope.displayList.push(v.name);
        });
    };

//    JSON.stringify(content[0].providerName)
     $scope.openhospilist = function(content){
         if(content.length<1){
             return; 
         }
         $ionicPopup.alert({
             title: 'Cashless Hospitals',
             content: JSON.stringify(content[0].providerName)
        }).then(function (res) {
        });
     };
    $scope.proposerDetails = localStorageService.get($rootScope.GEN_INFO);

    $scope.productList = productDetails.data.content;
    $scope.insuranceProviderList = [];
    for(var i = 0; i < $scope.productList.length; i++){
        if(!$scope.insuranceProviderList.contains($scope.productList[i].insuranceProviderId)){
            $scope.insuranceProviderList.push($scope.productList[i].insuranceProviderId);
            $scope.filterDetails.insurers.push({
                name : $scope.productList[i].insuranceProviderId,
                value : true
            });
        }
    }
    $scope.displayList = $scope.insuranceProviderList;
    $scope.goToQuoteDetails = function(id){
        $state.go('app.quoteDetails', {details : $scope.productList[id]});
    };
    
     
    $ionicModal.fromTemplateUrl('templates/custom.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modalCust = modal;
    });



    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modalCust.hide();
    };
        // Open the login modal
    $scope.openPop = function () {
        $scope.modalCust.show();
    };
    
    $scope.filterData = function(){
        if($scope.filterDetails.sumInsured === 'Select'){
            $scope.closeLogin();
            return;
        }
        $http({
            url : $rootScope.instantQuotes,
            method : 'POST',
            headers : {
                'Content-Type': 'application/json'
            },
            data : {
                "pageSize": 100,
                "pageNumber": 0,
                "healthQuoteCriteria": {
                    "pinCode": $scope.proposerDetails.pinCode,
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
                    "minSumInsured": parseInt($scope.filterDetails.sumInsured.toString().split("-")[0].split("\,").join("")),
                    "maxSumInsured": parseInt($scope.filterDetails.sumInsured.toString().split("-")[1].split(",").join(""))
                }
            }
        }).then(function(res){
            $scope.productList = res.data.content;
            $scope.insuranceProviderList = [];
            $scope.filterDetails.insurers = [];
            $scope.filterDetails.sumInsured = 'Select';
            for(var i = 0; i < $scope.productList.length; i++){
                if(!$scope.insuranceProviderList.contains($scope.productList[i].insuranceProviderId)){
                    $scope.insuranceProviderList.push($scope.productList[i].insuranceProviderId);
                    $scope.filterDetails.insurers.push({
                        name : $scope.productList[i].insuranceProviderId,
                        value : true
                    });
                }
            }
            $scope.displayList = $scope.insuranceProviderList;
            $scope.closeLogin();
        }, function(err){
            console.error(err);
        });
    };

})

.controller("QuoteCtrl", ['$rootScope', "$scope", "$stateParams", "$q", "$location", "$window", '$timeout', "$http", "$state", "localStorageService",
        function ($rootScope, $scope, $stateParams, $q, $location, $window, $timeout, $http, $state, localStorageService) {
            
            var genInfo = localStorageService.get($rootScope.GEN_INFO);

            $scope.loadQuote=function(){
                
                $scope.quoteDetails = $stateParams.details ? $stateParams.details : {};
                localStorageService.set($rootScope.QUOTE_DETAILS, $scope.quoteDetails);
                $scope.myActiveSlide = 1;
                 $scope.tabs = [
                    { "text": "Coverage" },
                    { "text": "Exclusions" },
                    { "text": "Renewal Benifits" },
                    { "text": "Important Terms" },

                ];

            };
        
           $scope.openpdf = function(content) {
               
               console.log(content.plan.planDocuments[0].documentURL);
             window.open(content.plan.planDocuments[0].documentURL,'_system');
           };
            
            $scope.buyNow = function(){
                var data = {
                    "planId": $scope.quoteDetails.plan.id,
                    "planName": $scope.quoteDetails.plan.planName,
                    "planCode": $scope.quoteDetails.plan.planCode,
                    "planType": $scope.quoteDetails.plan.planType,
                    "productCode": $scope.quoteDetails.plan.productCode,
                    "insuranceProviderId": $scope.quoteDetails.plan.insuranceProviderId,
                    "tenure": $scope.quoteDetails.tenure,
                    "sumInsured":$scope.quoteDetails.sumInsured,
                    "totalCost": $scope.quoteDetails.totalAmount,
                    "pinCode": genInfo.pinCode,
                    "coveredMembers": $scope.quoteDetails.coveredMembers,
                    "insurerRefDetails": $scope.quoteDetails.plan.insurerRefDetails,
                    "proposerDetail": {
                        "member": {
                            "age": {
                                "years": parseInt(genInfo.age)
                            },
                            "gender": genInfo.gender === 'M' ? 'MALE' : 'FEMALE',
                            "contactDetail": {
                                "mobile": genInfo.phone,
                                "email": genInfo.email,
                                "addresses": [{
                                    "addressType": "COMMUNICATION",
                                    "pinCode": genInfo.pinCode
                                }]
                            }
                        }
                    }
                };
                $http({
                    "url" : $rootScope.healthProposal,
                    "method" : "POST",
                    "headers" : {
                        'Content-Type': 'application/json'
                    },
                    "data" : data
                }).then(function(res){
                    localStorageService.set($rootScope.HEALTH_PROPOSAL, res.data);
                    $state.go('app.proposerDetails', {id : 0});
                },function(err){
                    console.error(err);
                });
            };

            /*$scope.onSlideMove = function (data) {
                console.log  ("You have selected " + data.index + " tab");
            };*/
        }
])

.controller('AddMemberCtrl', function($scope, $rootScope, localStorageService, $state){

    $scope.members = [];

    $scope.hasDesease = localStorageService.get($rootScope.HAS_DESEASE);

    $scope.relationshipList = ["Select", "My spouse", "My son", "My daughter", "My father", "My mother"];
    
    var ages = ['< 3 months', '3 months - 1 year', '1 year'];

    for (var i = 2; i <= 100; i++){
            ages.push(i + ' years');
        }

    $scope.agesList = ages;

    $scope.addMemberCard = function(){
        $scope.members.push({
            relationship : $scope.relationshipList[0],
            age : "Select",
            pincode : '',
            relationshipList : ["Select", "My spouse", "My son", "My daughter", "My father", "My mother"]
        });
    };

    var count = 0;

    var members = localStorageService.get($rootScope.FAMILY);
    if(members && members.length > 0){
        for(var a=0; a < members.length; a++){
            if(members[a].relationship !== 'Self'){
                $scope.addMemberCard();
                $scope.members[count].relationship = members[a].relationship;
                $scope.members[count].age = members[a].age;
                $scope.members[count].pincode = members[a].pincode;
                count ++;
            }
        }
    }else{
        $scope.addMemberCard();
    }


    $scope.relationChange = function(index){

        var fatherFlag = false;
        var motherFlag = false;
        var spouseFlag = false;
        var relationshipList = ["Select", "My spouse", "My son", "My daughter", "My father", "My mother"];
        for(var i = 0; i < $scope.members.length ; i++){
            if($scope.members[i].relationship.trim() === "My spouse"){
                spouseFlag = true;
            }
            if($scope.members[i].relationship.trim() === "My mother"){
                motherFlag = true;
            }
            if($scope.members[i].relationship.trim() === "My father"){
                fatherFlag = true;
            }
        }
        var count = 0;
        for(var j = 0; j < $scope.relationshipList.length; j++){
            if(spouseFlag === true && $scope.relationshipList[j] === "My spouse"){
                relationshipList.splice(j, 1);
                count ++ ;
            }
            if(motherFlag === true && $scope.relationshipList[j] === "My mother"){
                relationshipList.splice(j-count, 1);
                count ++ ;

            }
            if(fatherFlag === true && $scope.relationshipList[j] === "My father"){
                relationshipList.splice(j-count, 1);
                count ++ ;
            }
        }
        $scope.members[index].relationshipList = relationshipList;
    };

    $scope.removeMemberCard = function(index){
        $scope.members.splice(index, 1);
    };
    var genInfo = localStorageService.get($rootScope.GEN_INFO);
    $scope.next = function(){
        var arr = [];
        if(genInfo.toInsure !== 'My Family'){
            arr.push({
                relationship : "Self",
                age : genInfo.age ,
                pincode : genInfo.pinCode
            });
        }
        var foundSelf = false;
        for(var i = 0; i < $scope.members.length; i++){
            if($scope.members[i].relationship !== 'Select'){
                arr.push({
                    relationship : $scope.members[i].relationship,
                    age : $scope.members[i].age,
                    pincode : $scope.members[i].pincode
                });
            }
            if($scope.members[i].relationship === 'Self'){
                foundSelf = true;
            }
        }
        if(foundSelf){
            $scope.members.splice(0,1);
        }
        localStorageService.set($rootScope.FAMILY, arr);
        if($scope.hasDesease){
            $state.go('app.diseases');
        }else{
            $state.go('app.product');
        }
    };

    })
.controller('SignupCtrl', function($rootScope, $scope, Service, $state, localStorageService){

    var keys = localStorageService.keys();
    keys.forEach(function(k,v){
        localStorageService.remove(k);
    });
    
    $scope.userDetails = {
        email : '',
        phone : '',
        Username : '',
        password : '',
        confirmPassword : ''
    };
    
     $scope.genInfoError = {
        email : {
            hasError : false,
            message : ''
        },
        phone : {
            hasError : false,
            message : ''
        },
        Username : {
            hasError : false,
            message : ''
        },
        password : {
            hasError : false,
            message : ''
        }, confirmPassword : {
            hasError : false,
            message : ''
        }
    };
    var REG_VALID_EMAIL = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
       $scope.validate = function(){
        var info = angular.copy($scope.userDetails);
               if(!info.email || !REG_VALID_EMAIL.test(info.email)){
            $scope.genInfoError.email.hasError = true;
            $scope.genInfoError.email.message = "Please enter your valid email";
            return false;
        }else{
            $scope.genInfoError.email.hasError = false;
            $scope.genInfoError.email.message = "";
        }
     if(!info.phone || info.phone.toString().length !== 10){
            $scope.genInfoError.phone.hasError = true;
            $scope.genInfoError.phone.message = "Please enter your valid phone";
            return false;
        }else{
            $scope.genInfoError.phone.hasError = false;
            $scope.genInfoError.phone.message = "";
        }
        if(!info.username){
            $scope.genInfoError.Username.hasError = true;
            $scope.genInfoError.Username.message = "Please enter valid username";
            return false;
        }else{
            $scope.genInfoError.Username.hasError = false;
            $scope.genInfoError.Username.message = "";
        }
            if(info.username.length<8){
            $scope.genInfoError.Username.hasError = true;
            $scope.genInfoError.Username.message = "username must be atleast 8 characters";
            return false;
        }else{
            $scope.genInfoError.Username.hasError = false;
            $scope.genInfoError.Username.message = "";
        }
              if(!info.password||info.password.length<8){
            $scope.genInfoError.password.hasError = true;
            $scope.genInfoError.password.message = "Please enter a password with atleast 8 characters";
            return false;
        }else{
            $scope.genInfoError.password.hasError = false;
            $scope.genInfoError.password.message = "";
        }
              if(!info.confirmPassword||info.confirmPassword!=info.password){
            $scope.genInfoError.confirmPassword.hasError = true;
            $scope.genInfoError.confirmPassword.message = "passwords did not match";
            return false;
        }else{
            $scope.genInfoError.confirmPassword.hasError = false;
            $scope.genInfoError.confirmPassword.message = "";
        }
    
       
        return true;
    };
    
    $scope.signup = function(){
         if(!$scope.validate()){
            return;
        }
        var userDetails = angular.copy($scope.userDetails);
        if(userDetails.password !== userDetails.confirmPassword){
            alert("Password did not match");
            return;
        }
        var req = {
            myUrl : '/auth/signup',
            myMethod : 'POST',
            mySkipAuthorization : true,
            myHeaders : {
                'Content-Type': 'application/json'
            },
            myData : {
                email : userDetails.email,
                phone : userDetails.phone,
                username : userDetails.username,
                password : userDetails.password
            }
        };
        Service.httpRequest(req).then(function(res){
            //$state.go('app.GenInfo');
            var emailOtp = res.data.email_otp;
            var finalReq = {
                myUrl : '/auth/verifyAndSignup',
                myMethod : 'POST',
                mySkipAuthorization : true,
                myHeaders : {
                    'Content-Type': 'application/json'
                },
                myData : {
                    username : userDetails.username,
                    email_otp : emailOtp
                }
            };
            Service.httpRequest(finalReq).then(function(result){
                $state.go('app.signon');
            }, function(err){
                console.error(err);
                if(err && err.data && err.data.error){
                    alert(err.data.error);
                }
            });
        }, function(err){
            console.error(err);
            if(err && err.data && err.data.error){
                alert(err.data.error);
            }
        });
    };
})

.controller('DiseaseCtrl', function($scope, $rootScope, $http, $ionicPopup, $ionicPush, $ionicUser, $ionicPlatform, $ionicLoading, $state, localStorageService){
    $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path);
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    };
$scope.proposerDetails = localStorageService.get($rootScope.GEN_INFO);
    $scope.members = [
    ];
    $scope.relationshipList = ['Self'];
    $scope.ddata = ["Select","Other", "Diabetes Type I (Insulin Dependent)", "High / Low Blood Pressure (hypertension)", "Heart Diseases", "Asthma", "Stroke / Paralysis", "Tuberculosis", "Thyroid disorder", "Stomach or Intestine ulcers", "Kidney Failure", "Liver Failure", "Hernia", "Slipped disc", "Joint replacement / diseases", "HIV / AIDS / STD", "Arthritis", "Congenital disorders", "Diabetes II", "Cancer - Benign / Malignant", "Hepatitis ", "Anaemia", "Multiple Sclerosis", "Jaundice", "Brain & Spinal cord disorders", "Parkinson’s / Alzheimer’s / Epilepsy", "Mental Illness / Psychiatric diseases"];
    var badDisease = ['Heart Diseases', 'Stroke / Paralysis', 'Kidney Failure', 'Liver Failure', 'HIV / AIDS / STD', 'Brain & Spinal cord disorders', 'Parkinson’s / Alzheimer’s / Epilepsy', 'Mental Illness / Psychiatric diseases'];
    var members = localStorageService.get($rootScope.FAMILY);
    if(members){
        for(var i = 0; i < members.length ; i++){
            $scope.members.push({
                insurer: members[i].relationship, 
                age: members[i].age, 
                diseases: 'Select'
            });
            $scope.relationshipList.push(members[i].relationship);
            if(members[i].relationship === 'My mother' || members[i].relationship === 'My father'){
                $scope.members[i].pinCode = members[i].pincode;
            }
        }
    }
    $scope.addMemberCard = function(){
        $scope.members.push({
            insurer : 'Self',
            age : 10,
            diseases : 'Select'
        });
    };
    $scope.removeMemberCard = function(index){
        $scope.members.splice(index, 1);
    };

    var genInfo = localStorageService.get($rootScope.GEN_INFO);
    $scope.next = function(){
        var foundBadInsurer = false;
        var badFamily = [];
        localStorageService.set($rootScope.FAMILY_DISEASE,$scope.members);
        for(var i = 0; i < $scope.members.length; i++){
            if($scope.members[i].insurer === 'Self' && badDisease.contains($scope.members[i].diseases)){
                foundBadInsurer = true;
                break;
            }
            if($scope.members[i].insurer !== 'Self' && badDisease.contains($scope.members[i].diseases) && !badFamily.contains($scope.members[i].insurer)){
                badFamily.push($scope.members[i].insurer);
            }
        }
        if(foundBadInsurer){
            $state.go('app.badInsurer');
            return;
        }else{
            var family = localStorageService.get($rootScope.FAMILY);
            if(family){
                family.forEach(function(v, k){
                    if(badFamily.contains(v.relationship)){
                        family.splice(k, 1);
                    }
                });
                localStorageService.set($rootScope.FAMILY, family);
            }
        }
        if(genInfo.toInsure === 'Myself'){
            var arr = [{
                relationship : "Self",
                age : genInfo.age ,
                pincode : genInfo.pinCode
            }];
            localStorageService.set($rootScope.FAMILY, arr);
        }
        $state.go('app.product');
    };
})
.controller('BadInsurerCtrl', function ($scope, $rootScope,localStorageService,$state) {
        $scope.goToGenInfo = function(){
        localStorageService.remove($rootScope.GEN_INFO);
        localStorageService.remove($rootScope.PROPOSER_INFO);
        localStorageService.remove($rootScope.NOMINEE_INFO);
        localStorageService.remove($rootScope.CONTACT_INFO);
        localStorageService.remove($rootScope.FAMILY);
        localStorageService.remove($rootScope.HAS_DESEASE);
        localStorageService.remove($rootScope.FAMILY_DISEASE);
        localStorageService.remove($rootScope.QUOTE_DETAILS);
        $state.go('app.GenInfo');
    };
})

.controller('EmployeeCtrl', function ($scope, $rootScope, $http, $ionicPopup, $ionicPush, $ionicUser, $ionicPlatform, $ionicLoading) {
    
     $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path);
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }

    /*Entry*/
    $scope.submitMyForm = function () {
        //alert("Form submitted");
    }

    $scope.myCustomValidator = function (text) {
        return true;
    }

    $scope.anotherCustomValidator = function (text) {
        if (text === "rainbow") {
            return true;
        } else return "type in 'rainbow'";
    }

    $scope.passwordValidator = function (password) {

        if (!password) {
            return;
        } else if (password.length < 6) {
            return "Password must be at least " + 6 + " characters long";
        } else if (!password.match(/[A-Z]/)) {
            return "Password must have at least one capital letter";
        } else if (!password.match(/[0-9]/)) {
            return "Password must have at least one number";
        }

        return true;
    }
    /*Entry*/


    $scope.showAlert = function () {
        $ionicPopup.alert({
            title: 'Success',
            content: 'Employee saved successfully.'
        }).then(function (res) { });
    }

    $scope.showErrorAlert = function () {
        $ionicPopup.alert({
            title: 'Failure',
            content: 'All Fields are compulsory. Please select all fields.'
        }).then(function (res) {

        });
    }
    $scope.showDBAlert = function () {
        $ionicPopup.alert({
            title: 'Failure',
            content: 'Something went wrong call administrator'
        }).then(function (res) {

        });
    }


    $scope.registerUserForPush = function (emp) {

        $ionicLoading.show({
            template: 'Registering User on Server.',
            content: 'Loading..',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0,
            duration: 10000
        });

        Ionic.io();
        var jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4NDgyYzg3NC0wMmE3LTQ5ZTgtYTY1OS0xMmYwMWY5NGYyYjIifQ.CNWUfzTdZNkJFySgdTY5R9qnLqN7X_wwOnYgHHZk0_o';
        var req = {
            method: 'POST',
            url: 'https://api.ionic.io/auth/users',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwt
            },
            data: {
                "app_id": "cb3e8c61",
                "email": emp.EmailId,
                "password": emp.EmpName,
                "username": emp.EmpCode,
                "name": emp.EmpName
            }
        };

        // Make the API call
        $http(req).success(function (resp) {
            $ionicLoading.hide()

            $ionicLoading.show({
                template: 'Authenticating User.',
                content: 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
                duration: 10000
            });
            var authProvider = 'basic';
            var authSettings = {
                'remember': true
            };

            var loginDetails = {
                email: req.data.email,
                password: req.data.password
            };

            Ionic.Auth.login('basic', authSettings, loginDetails)
                .then(authSuccess, function (err) {
                    console.log(err)
                });
            //alert('ionic push success')
            console.log("Ionic Push: Push success", resp);

        }).error(function (resp) {
            alert(resp)
        });

        function authSuccess() {
            $ionicLoading.hide();

            $ionicLoading.show({
                template: 'Authorization Success.',
                content: 'Loading..',
                animation: 'fade-in',
                showBackdrop: true,
                maxWidth: 200,
                showDelay: 0,
                duration: 10000
            });

            console.log("Ionic Login Success, now get the user id and put it in signupform");
            var ionic_user = Ionic.User.current();
            ionic_user.save();

            /*register for push*/
            $ionicPush.init({
                "debug": true,
                'canRunActionsOnWake': true,
                'canPlaySound': true,
                "onNotification": function (notification) {
                    var payload = notification.payload;

                },
                "onRegister": function (data) {
                    $ionicPush.saveToken(data.token);
                    $rootScope.DevToken = data.token;
                    //alert(data.token);
                    //alert('rootscope ' + $rootScope.DevToken);
                    emp.AndroidToken = $rootScope.DevToken;
                    $ionicLoading.hide();
                    $scope.registerEmployee(emp);
                }

            });
            $ionicPush.register();

        }
    }

    $scope.registerEmployee = function (emp) {

        $ionicLoading.show({
            template: 'Registering User in Database.',
            content: 'Loading..',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0,
            duration: 10000
        });

        $scope.imei = device.uuid;

        emp.DeviceToken = $scope.imei;

        emp.AndroidToken = $rootScope.DevToken;

        if (emp.EmpCode == undefined || emp.EmpName == undefined || emp.MobileNo == undefined || emp.EmailId == undefined || emp.Pincode == undefined || emp.EmpCode == '' || emp.EmpName == '' || emp.MobileNo == '' || emp.EmailId == '' || emp.Pincode == '') {
            $scope.showErrorAlert();
        } else {
            $http.post("https://app.sbismart.com/bo/ContactManagerApi/EmployeeEntry", emp).success(function (data, status) {

                if (data.Msg == 'Data Saved Successfully !') {
                    $ionicPopup.alert({
                        title: 'Status',
                        content: data.Msg
                    }).then(function (res) {

                    });
                    localStorage.setItem('DeviceToken', emp.DeviceToken);
                }

                $ionicPopup.alert({
                    title: 'Status',
                    content: data.Msg
                }).then(function (res) {

                });
                $ionicLoading.hide();
                emp.EmpCode = '';
                emp.EmpName = '';
                emp.EmailId = '';
                emp.Pincode = '';
                emp.MobileNo = '';
                $state.go('app.login')


            })
        }
    }



})

// Map Controller
.controller('MapCtrl', function ($scope, MapData, $stateParams) {
 $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path)
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }
    var data = {};

    data.map = {
        zoom: 12,
        center: {
            latitude: $stateParams.lati,
            longitude: $stateParams.longi
        },
        markers: [
        {
            id: 1,
            icon: 'img/marker.png',
            latitude: $stateParams.lati,
            longitude: $stateParams.longi,
            title: 'Last location of ' + $stateParams.empname
        }]
    }
    $scope.map = data.map

})

//TrackEmployee Controller
.controller('TrackEmployee', function ($scope, MapData, ApiService) {
 $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path)
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }
    $scope.loadEmployeeList = function () {
        var flag = (localStorage.getItem('UserType') == 'ASM' ? 'loadASE' : 'loadASM')
        ApiService.loadEmpList(flag).then(function (response) {
            $scope.EmployeeData = response.data

        }, function (error) {
            console.log(error)
        });
    }

})

//LeadEntry Controller    
.controller('LeadEntryCtrl', function ($scope, ApiService, ShowAlertPopup, ValidationService, $stateParams, Spinner, $rootScope, $ionicPopup, $http, $state) {
     $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path)
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }
    $scope.makeLeadEntry = function (lead) {
        ApiService.leadEntry(lead).then(function (response) {
            ShowAlertPopup.ShowPopup('Success', response.data[0].Status);
            lead = null
        }, function (error) {
            console.log(error)
        });
    }

    $scope.loadLocation = function () {
        ApiService.getLocation().then(function (response) {
            $scope.locationData = response.data

        }, function (error) {
            console.log(error)
        });
    }

    $scope.isValidPan = function (panno) {
        if (!ValidationService.isPanValid(panno)) {
            ShowAlertPopup.ShowPopup('Error', 'Please enter valid Pan Number. Ex. ABCDE1234F');
            $scope.isAllFieldsValid = false
        } else $scope.isAllFieldsValid = true
    }

    $scope.isValidEmail = function (emailid) {
        if (!ValidationService.isEmailValid(emailid)) {
            ShowAlertPopup.ShowPopup('Error', 'Please enter valid Email Id');
            $scope.isAllFieldsValid = false
        } else $scope.isAllFieldsValid = true
    }

    $scope.searchLeadDetail = function (searchVal, searchType) {
        Spinner.show('Getting lead details..', 30000)
        ApiService.getLeadDetail(searchVal, searchType).then(function (response) {
            if (response.data['LeadID'] == null && response.data['MobileNo'] == null && response.data['PanCard'] == null && response.data['LoanAmount'] == null) {
                ShowAlertPopup.ShowPopup('Error', 'Invalid ' + searchType);
                $scope.leadDetails = ''
                Spinner.hide()
                return;
            }
            $scope.leadDetails = response.data
            Spinner.hide()
        }, function (error) {
            console.log(error)
            Spinner.hide()
        });
    }

    $scope.searchApplicatioIDCBS = function (searchVal, searchType) {
        if (!ValidationService.isPanValid(searchVal)) {
            ShowAlertPopup.ShowPopup('Error', 'Please enter valid Pan Number. Ex. ABCDE1234F');
        } else {
            Spinner.show('Getting lead details..', 30000)
            ApiService.searchHomeLoanDetailsFromCBS(searchVal, searchType).then(function (response) {
                $scope.leadDetailsCBS = JSON.parse(response.data)['soapenv:Envelope']['soapenv:Body']['p33:SSLWebServiceResponse']['application']
                if ($scope.leadDetailsCBS == undefined) { $scope.notFound = true; } else { $scope.notFound = false; }
                Spinner.hide()
            }, function (error) {
                ShowAlertPopup.ShowPopup('Error', 'Something went wrong please try again later.');
            });
        }
    }

    $scope.searchLoanDetByAppId = function (applicationID) {
        Spinner.show('Getting lead details..', 30000)
        ApiService.searchApplicationDetailsFromCBS(applicationID).then(function (response) {
            $scope.applicationDetails = JSON.parse(response.data)['soapenv:Envelope']['soapenv:Body']['p33:SSLStatusResponse']
            ShowAlertPopup.ShowPopup(
                '<b>Request ID: </b>' + $scope.applicationDetails.ReqID,
                '<b>Loan A\c No: </b>' + $scope.applicationDetails.Loan_Acc_No + '<br>' +
                '<b>ResDateTime: </b>' + $scope.applicationDetails.ResDateTime + '<br>' +
                '<b>Status:</b> ' + $scope.applicationDetails.Status
            )

            Spinner.hide()
        }, function (error) {
            ShowAlertPopup.ShowPopup('Error', 'Something went wrong please try again later.');
        });
    }

    $scope.getASEData = function () {
        ApiService.loadASEDetails().then(function (response) {
            $scope.ASEData = response.data
            $scope.getAQMata();
        }, function (error) {
            console.log(error)
        });
    }

    $scope.getAQMata = function () {
        ApiService.loadAQMDetails().then(function (response) {
            $scope.AQMData = response.data
        }, function (error) {
            console.log(error)
        });
    }

    $scope.pushToASEFunc = function (choice) {

        for (i = 0; i < $scope.ASEData.length; i++) {
            if (choice.ASE == $scope.ASEData[i].ASECode)
                $scope.ASECodeName = $scope.ASEData[i].ASEName
        }
        if (choice.Remark == '' || choice.Remark == null || choice.Remark == undefined) {
            choice.Remark = 'no remark'
        }

        var data = {
            ASECode: choice.ASE, ASEName: $scope.ASECodeName, PanCard: $stateParams.Panno, ASMRemark: choice.Remark, Mobileno: $stateParams.MobileNo,
            Type: choice.doc, PushTo_LOS: '', PushBackTo_Sourcing: choice.ASE, LeadID: $stateParams.LeadId
        };

        ApiService.pushToASE(data).then(function (response) {
            var result = response.data
            alert(JSON.stringify(result))
        }, function (error) {

        });

    }

    $scope.pushToAQMFunc = function (choice) {

        if (choice.Remark == '' || choice.Remark == null || choice.Remark == undefined) {
            choice.Remark = 'no remark'
        }

        for (i = 0; i < $scope.ASEData.length; i++) {
            if (choice.ASE == $scope.ASEData[i].ASECode)
                $scope.ASECodeName = $scope.ASEData[i].ASEName
        }

        var data = {
            ASECode: choice.ASE, ASEName: $scope.ASECodeName, PanCard: $stateParams.Panno, ASMRemark: choice.Remark, Mobileno: $stateParams.MobileNo,
            Type: choice.doc, PushTo_LOS: choice.AQM, PushBackTo_Sourcing: '', LeadID: $stateParams.LeadId
        };

        ApiService.pushToAQM(data).then(function (response) {
            var result = response.data
            alert(JSON.stringify(result))
        }, function (error) {

        });

    }

    $scope.loadDetails = function () {
        $scope.ClientName = $stateParams.Name
        $scope.ContactNo = $stateParams.MobileNo

    }

    $scope.askForUpdateLead = function (datatoUpdate) {

        var confirmPopup = $ionicPopup.confirm({
            title: 'Updtae Lead',
            template: 'Are you sure you want update the Lead'
        });
        confirmPopup.then(function (res) {
            if (res) {
                $state.go('app.updateLeadStatus', {
                    'MobileNo': datatoUpdate.MobileNo,
                    'Name': datatoUpdate.Name,
                    'Panno': datatoUpdate.PanCard,
                    'LeadId': datatoUpdate.LeadID
                })
            } else {
                console.log('You are not sure');
            }
        });


    }

    $scope.checkDocStats = function (doc) {
        $scope.pushToASE = (doc == 'Partial Completed')
        $scope.pushToAQM = (doc == 'Completed')
    }

})

.controller("SummaryDetailsCtrl", function ($rootScope, $scope, $stateParams, $q, $location, $window, $timeout, $http, $state, Service, localStorageService) {
            $scope.quoteData = localStorageService.get($rootScope.QUOTE_DETAILS);
            $scope.healthProposal = localStorageService.get($rootScope.HEALTH_PROPOSAL);
            $scope.familyInfo = localStorageService.get($rootScope.FAMILY);
            $scope.genInfo = localStorageService.get($rootScope.GEN_INFO);
            $scope.proposerInfo = localStorageService.get($rootScope.PROPOSER_INFO);
            $scope.nomineeInfo = localStorageService.get($rootScope.NOMINEE_INFO);
            $scope.contactInfo = localStorageService.get($rootScope.CONTACT_INFO);
            $scope.diseaseInfo = localStorageService.get($rootScope.FAMILY_DISEASE);

//    $scope.genInfo = localStorageService.get($rootScope.GEN_INFO);
//            console.log($scope.genInfo);
            $scope.tabs = [
                { "text": "Proposer Detail" },
                { "text": "Insured Member" },
                { "text": "Nomineed Detail" }

            ];

            $scope.buyNow = function(){
                /*$http({
                    url : $rootScope.insurerHealthProposals,
                    method : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        "proposalId": $scope.healthProposal.id
                    }
                    
                }).then(function(res){*/
                var res = {
                    data : {
                    }
                };
                    var genInfo = angular.copy($scope.genInfo);
                    var quoteData = angular.copy($scope.quoteData);
                    var proposerInfo = angular.copy($scope.proposerInfo);
                    var nomineeInfo = angular.copy($scope.nomineeInfo);
                    var contactInfo = angular.copy($scope.contactInfo);
                    var diseaseInfo = angular.copy($scope.diseaseInfo);
                    var familyInfo = angular.copy($scope.familyInfo);
                    var to_insure; 
                    if(genInfo.toInsure === 'Myself'){
                        to_insure = "MYSELF";
                    }else if(genInfo.toInsure === 'My Family'){
                        to_insure = "FAMILY";
                    }else{
                        to_insure = "MYSELF_FAMILY";
                    }
                    var propRequest = {
                        myUrl : '/health/createInsurance',
                        myMethod : 'POST',
                        mySkipAuthorization : false,
                        myHeaders : {
                            'Content-Type': 'application/json'
                        },
                        myData : {
                            "proposer_details" : {
                                "email" : genInfo.email,
                                "phone" : genInfo.phone,
                                "first_name" : proposerInfo[0].firstName,
                                "last_name" : proposerInfo[0].lastName,
                                "pin_code" : genInfo.pinCode,
                                "gender" : genInfo.gender,
                                "age" : parseInt(genInfo.age),
                                "dob" : $rootScope.getDbFormatDate(proposerInfo[0].dob),
                                "house_number" : contactInfo.houseNumber,
                                "locality" : contactInfo.locality,
                                "landmark" : contactInfo.landmark,
                                "city" : "Mumbai",
                                "state" : "Maharasthra",
                                "diseases" : ["Myocardial infarction, Leukemia"],
                                "occupation" : "Teacher",
                                "height" : 180,
                                "weight" : 86,
                                "nominee_first_name" : "Ross",
                                "nominee_last_name" : "Geller",
                                "any_illness" : true,
                                "any_medication" : true,
                                "is_hospitalised" : false,
                                "illness_description" : "I am very ill",
                                "medication_description" : "doctor gave me shit",
                                "hospitalised_description" : "None"
                            },
                            "dependent_details" : [],
                            "insurance_details" : {
                                "to_insure" : to_insure,
                                "plan_id" : quoteData.plan.id,
                                "planName" : quoteData.plan.planName,
                                "plan" : quoteData.plan,
                                "insuranceProviderId" : quoteData.plan.insuranceProviderId,
                                "insuranceProviderName" : quoteData.plan.insuranceProviderName,
                                "sumInsured" : quoteData.sumInsured,
                                "amount" : quoteData.totalAmount.amount,
                                "totalAmount" : quoteData.totalAmount,
                                "coveredMembers" : quoteData.coveredMembers,
                                "providers" : quoteData.providers,
                                "responseStatus" : res.data.responseStatus,
                                "responseDescription" : res.data.responseDescription,
                                "extProposalRefId" : res.data.extProposalRefId,
                                "paymentAdvice" : res.data.paymentAdvice,
                            }
                        }
                    };
                    for(var i = 0; i < proposerInfo.length; i++){
                        var dob = new Date($rootScope.getDbFormatDate(proposerInfo[i].dob));
                        var age = new Date().getTime() - dob.getTime();
                        age = age / (1000 * 60 * 60 * 24 * 356);
                        var relationShip = familyInfo[i].relationship;
                        if(relationShip === 'Self'){
                            relationShip = "MYSELF"
                        }else{
                            relationShip = relationShip.split(" ")[1].toUpperCase();
                        }
                        propRequest.myData.dependent_details.push({
                            "age" : parseInt(age),
                            "relation_type" : relationShip,
                            "first_name" : proposerInfo[i].firstName,
                            "last_name" : proposerInfo[i].lastName,
                            "pin_code" : proposerInfo[i].pincode,
                            "gender" : proposerInfo[i].gender,
                            "diseases" : proposerInfo[i].diseases,
                            "occupation" : proposerInfo[i].occupation,
                            "height" : proposerInfo[i].height,
                            "weight" : proposerInfo[i].weight,
                            "nominee_first_name" : nomineeInfo[i].firstName,
                            "nominee_last_name" : nomineeInfo[i].lastName,
                            "nominee_relation_type" : nomineeInfo[i].relationship
                        });
                    }
                    Service.httpRequest(propRequest).then(function(result){
                        console.log(result);
                    }, function(err){
                        console.error(err);
                    });
                    /*$http({
                        url : res.data.paymentAdvice.paymentRequestURL,
                        method : 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: res.data.requestParams

                    }).then(function(res){
                        console.log(res);
                    }, function(err){
                        console.error(err);
                    });
                    console.log(res);*/
                /*}, function(err){
                    console.error(err);
                });*/
            };
            
//            var genInfo = localStorageService.get($rootScope.GEN_INFO);

            /*$scope.onSlideMove = function (data) {
                console.log  ("You have selected " + data.index + " tab");
            };*/
        })


// Geolocation Controller
.controller('GeolocationCtrl', function ($scope, $ionicLoading) {
 $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path)
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }
    $scope.map = {
        center: {
            latitude: 45,
            longitude: -73
        },
        marker: {},
        zoom: 5
    };

    $scope.loading = $ionicLoading.show({

        //The text to display in the loading indicator
        template: '<i class="icon ion-loading-c"></i> Getting current location',

        //Will a dark overlay or backdrop cover the entire view
        showBackdrop: false,

        // The delay in showing the indicator
        showDelay: 10
    });

    var options = { enableHighAccuracy: true };
    navigator.geolocation.getCurrentPosition(function (position) {

        $scope.map = {
            center: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            marker: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            },
            zoom: 12
        };

        $ionicLoading.hide();

    }, function (error) {
        alert('Unable to get location: ' + error.message);
        $ionicLoading.hide();
    }, options);


})

// Seetings Controller
.controller('SettingsCtrl', function ($scope) {
 $scope.redirect = function (path) {
        //if (SessionServices.isLoggedIn())
            $state.go(path)
        //else
        //    ShowAlertPopup.ShowPopup('Error', 'Please login to use this service.');
    }
})

.controller('AppCtrl', function ($state, $scope, $rootScope, localStorageService) {
    $scope.redirect = function (path) {
        $state.go(path)
    }
    $scope.agentDetails = localStorageService.get($rootScope.AGENT_INFO);
    $scope.goToGenInfo = function(){
        localStorageService.remove($rootScope.GEN_INFO);
        localStorageService.remove($rootScope.PROPOSER_INFO);
        localStorageService.remove($rootScope.NOMINEE_INFO);
        localStorageService.remove($rootScope.CONTACT_INFO);
        localStorageService.remove($rootScope.FAMILY);
        localStorageService.remove($rootScope.HAS_DESEASE);
        localStorageService.remove($rootScope.FAMILY_DISEASE);
        localStorageService.remove($rootScope.QUOTE_DETAILS);
        $state.go('app.GenInfo');
    };
})

