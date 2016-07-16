/**
 * Created by Konstantin on 2016-07-14.
 */
angular.module("mainApp")
    .controller("signInCtrl", ["$scope", "$window", "$http", "$timeout", "URLS",
            function($scope, $window, $http, $timeout, URLS) {

        $scope.userDetails.username = null;
        $scope.userDetails.password = null;

        $scope.signInUrl = URLS.VIEW_SIGN_IN;

        $scope.showError = false;

        $scope.signInUser = function(userDetails, isValid) {
            if(isValid) {
                $http({
                    method: 'POST',
                    url: URLS.DOMAIN + URLS.SIGN_IN,
                    data: {
                        username: userDetails.username,
                        password: userDetails.password
                    }
                }).then(function(response) {
                    if(response.data.success) {
                        $window.sessionStorage.token = response.data.token;
                        $window.sessionStorage.username = userDetails.username;
                        $scope.changeView();
                    } else {
                        $scope.errorMessage.authorization = response.data.message;
                        $scope.mode.errorMessageAuthorization = true;
                        $scope.closeMessage("authorization");
                    }
                },
                function() {
                    $scope.errorMessage.authorization = "Error occurred. Please try again";
                    $scope.mode.errorMessageAuthorization = true;
                    $scope.closeMessage("authorization");
                });
            }
            else {
                $scope.showError = true;
            }

            $scope.getError = function(error) {
                if(angular.isDefined(error)) {
                    if(error.required) {
                        return "Field can't be empty"
                    }
                }
            }
        };

        $scope.signUp = function () {
            $location.path("/registration");
        };

        $scope.signOut = function () {
            $scope.authorization.status = false;
            session.destroy();
            if ($location.path().split("/")[1] == "yourway") {
                $location.path("/yourway");
            }
        };

    }]);
