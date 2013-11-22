var app = angular.module('app', ['mongolabResourceHttp']).
config(function($routeProvider) {
  $routeProvider.
  when('/', {
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

//todo:clearUserCtrl

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
      email: ''
    };
    $location.path('/');
  };
  //action to perform on routing
  $scope.updateView();
}

function SignUpCtrl($scope, $location, $routeParams, Recipient, UserService) {
  Recipient.getById($routeParams.recipentId, function(recipient) {
    $scope.recipient = recipient;
    if (!$scope.recipient.donor && UserService.user) {
      $scope.recipient.donor = _(UserService.user).clone();
    }
  });

  $scope.addDonor = function() {
    UserService.user = _($scope.recipient.donor).clone();
    $scope.recipient.$saveOrUpdate().then(function() {
      $location.path('/thanks'); //todo: consider thank you and printable report
    });
  };
}