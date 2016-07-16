/**
 * Created by Konstantin on 2016-07-14.
 */
angular.module("mainApp")
    .controller("signUpCtrl", ["$scope", "$window","$http", "URLS", function($scope, $window, $http, URLS) {

        $scope.userDetails.username = null;
        $scope.userDetails.password = null;

        $scope.signUpUrl = URLS.VIEW_SIGN_UP;

        $scope.showError = false;

        $scope.registerUser = function(userDetails, isValid) {

            if(isValid) {
                $http({
                    method: 'POST',
                    url: URLS.DOMAIN + URLS.SIGN_UP,
                    data: {
                        username: userDetails.username,
                        password: userDetails.password
                    }
                }).then(function(response) {
                    if(response.data.success) {
                        $window.sessionStorage.token = response.data.token;
                        $window.sessionStorage.username = userDetails.username;
                        $scope.showSuccessRegistrationMessage();
                        $scope.changeView();
                    } else {
                        $scope.errorMessage.registration = response.data.message;
                        $scope.mode.errorMessageRegistration = true;
                        $scope.closeMessage("registration");
                    }
                },
                function() {
                    $scope.errorMessage.registration = "Error occurred. Please try again";
                    $scope.mode.errorMessageRegistration = true;
                    $scope.closeMessage("registration");
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
                    if(error.email) {
                        return "Type email correctly"
                    }
                    if(error.pwmatch) {
                        return "Password mismatches"
                    }
                }
            }
        };
    }]);