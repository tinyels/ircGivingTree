var app = angular.module('app', ['mongolabResourceHttp']).
config(function($routeProvider) {
  $routeProvider.
  when('/', {
    controller: ListCtrl,
    templateUrl: 'intro.html'
  }).
  when('/list', {
    controller: ListCtrl,
    templateUrl: 'list.html'
  }).
  when('/signup/:recipentId', {
    controller: SignUpCtrl,
    templateUrl: 'signup.html'
  }).
  when('/thanks', {
    controller: ThanksCtrl,
    templateUrl: 'thanks.html'
  }).
  otherwise({
    redirectTo: '/'
  });
});

app.constant('MONGOLAB_CONFIG', {
  API_KEY: '6yUcWaRsw1eG5lYnPY_elelU1dgPt5Je',
  DB_NAME: 'irc_giving_tree'
});

app.factory('Recipient', function($mongolabResourceHttp) {
  return $mongolabResourceHttp('recipients');
});

//want to preserve the user's info once it has been entered (//todo explicit clearing of it)
app.factory('UserService', [
  function() {
    return {
      user: {
        name: '',
        email: '',
        phone: ''
      }
    };
  }
]);

// http://stackoverflow.com/questions/17475595/how-can-i-make-a-directive-in-angularjs-to-validate-email-or-password-confirmati
app.directive('match', function($parse) { 
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {        
        return $parse(attrs.match)(scope) === ctrl.$modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('mismatch', currentValue);
      });
    }
  };
});

function ListCtrl($scope, Recipient) {
  Recipient.query({
    "donor": {
      "$exists": false
    }
  }, function(recipients) {
    $scope.groups = _.groupBy(recipients, function(r) {
      return r.code.slice(0, -1);
    });
  });
}

function ThanksCtrl($scope, $location, Recipient, UserService) {
  $scope.updateView = function() {
    Recipient.query({
      "donor.email": UserService.user.email
    }, function(recipients) {
      $scope.groups = _.groupBy(recipients, function(r) {
        return r.code.slice(0, -1);
      });
    });
  };
  $scope.removeMe = function(id) {
    if (window.confirm("Are you sure?")) {
      Recipient.getById(id,
        function(recipient) {
          delete recipient.donor;
          recipient.lastModified = GetTimeStamp();
          recipient.$saveOrUpdate().then(function() {
            $scope.updateView();
          });
        });
    }
  };
  $scope.clearUser = function() {
    UserService.user = { //todo: this should be moved into service
      name: '',
      phone: '',
      email: '',
      emailConfirmation:''
    };
    $location.path('/');
  };
  //action to perform on routing
  $scope.updateView();
}

function SignUpCtrl($scope, $location, $routeParams, Recipient, UserService) {
  $scope.emailConfirmation = UserService.user.emailConfirmation;
  Recipient.getById($routeParams.recipentId, function(recipient) {
    $scope.recipient = recipient;
    if (recipient.gender === "M"){
      $scope.desc = recipient.age > 17 ?"man":"boy";
      $scope.pronoun = "His";
    }else{
      $scope.desc = recipient.age > 17 ? "woman":"girl";
      $scope.pronoun = "Her";
    }
    if (!$scope.recipient.donor && UserService.user) {
      $scope.recipient.donor = _(UserService.user).clone();
    }
  });

  $scope.addDonor = function() {
    $scope.recipient.lastModified = GetTimeStamp();
    UserService.user = _($scope.recipient.donor).clone();
    UserService.user.emailConfirmation = $scope.emailConfirmation;
    $scope.recipient.$saveOrUpdate().then(function() {
      $location.path('/thanks'); //todo: consider thank you and printable report
    });
  };
}

function GetTimeStamp(){
  function pad(n){return n<10 ? '0'+n : n}
  var d = new Date();
  return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z';
}
