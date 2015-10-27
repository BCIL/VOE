var _ = require('underscore');
 
console.log('-------each');
_.each([1,2,3], console.log);
 
console.log('-------map');
_.map([1,2,3], function(num){ console.log( num*3 );});
 
console.log('-------reduce');
var sum = _.reduce([1,2,3], function(memo, num) { 
      return memo+num;
        }, 0);
console.log(sum);
 
console.log('-------find : display first value');
var even = _.find([1,2,3,4,5,6], function(num){ 
      return num % 2 ==0;
        });
console.log(even);
 
console.log('-------filter');
even = _.filter([1,2,3,4,5,6], function(num){ 
      return num % 2 ==0;
        });
console.log(even);
 
 
console.log('-------reject');
odds = _.reject([1,2,3,4,5,6], function(num){ 
      return num % 2 ==0;
        });
console.log(odds);
 
 
console.log('-------every');
var result = _.every([true, 1, null, 'yes'], _.identity);
console.log(result);
 
console.log('-------some');
result = _.some([true, 1, null, 'yes'], _.identity);
console.log(result);
 
console.log('-------contains');
result = _.contains([1,2,3], 3);
console.log(result);
 
console.log('-------invoke');
result = _.invoke([[5,1,7], [3,2,1]], 'sort');
console.log(result);
 
console.log('-------pluck');
var dowon = [{name: 'dowon', age:22}, {name: 'haha', age:37}, {name: 'youngsik', age:99}];
result = _.pluck(dowon, 'name');
console.log(result);
 
console.log('-------max');
dowon = [{name: 'dowon', age:22}, {name: 'haha', age:37}, {name: 'youngsik', age:99}];
result = _.max(dowon, function(dw){ return dw.age});
console.log(result);
 
console.log('-------min');
dowon = [10,3,4,5,1000];
result = _.min(dowon);
console.log(result);
 
console.log('-------groupBy');
result = _.groupBy([1.3, 2.1, 2.4, 1.9], function(num){ return Math.floor(num);});
console.log(result);
 
console.log('-------countBy');
result = _.countBy([1,2,3,4,5], function(num){ return num%2==0? 'even':'odd';});
console.log(result);
 
console.log('-------toArray');
result = (function(){ return _.toArray(arguments).slice(1); })(1,2,3,4);
console.log(result);
 
console.log('-------size');
result = _.size({one:1, hi:33, name:'dowon'});
console.log(result);
