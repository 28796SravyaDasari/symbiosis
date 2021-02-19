angular.module('mobionicApp.filters', [])

.filter('partition', function($cacheFactory) {
    var arrayCache = $cacheFactory('partition');
    var filter = function(arr, size) {
    if (!arr) { return; }
    var newArr = [];
    for (var i=0; i<arr.length; i+=size) {
        newArr.push(arr.slice(i, i+size));
    }
    var cachedParts;
    var arrString = JSON.stringify(arr);
    cachedParts = arrayCache.get(arrString+size);
    if (JSON.stringify(cachedParts) === JSON.stringify(newArr)) {
      return cachedParts;
    }
    arrayCache.put(arrString+size, newArr);
    return newArr;
    };
    return filter;
})

// .filter('filterRelations', function(){
//         return function(relations, members){
//             var checkForSingleRelations = [];
//             checkForSingleRelations = members.filter(function(x){return x.relationShip!=2 && x.relationShip!=3}).map(function(x){return .relationShip});
//             return ;
//             }
//     })

.filter('filterAges', function(){
    return function(ages, indx){
                switch(indx) {
                    case "My son": // if son
                    case "My daughter": // if daughter
                        ages = ages.slice(0,27)
                        break;
                    default:
                        ages = ages.slice(19,102)
                        break;
                    }
                return ages;
        }
    });
