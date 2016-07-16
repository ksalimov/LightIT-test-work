/**
 * Created by Konstantin on 2016-07-14.
 */
angular.module("mainApp", [])
    .constant("URLS", {
        "VIEW_SIGN_IN": "signIn/signIn.html",
        "VIEW_SIGN_UP": "signUp/signUp.html",

        "DOMAIN": "http://smktesting.herokuapp.com/",
        "SIGN_UP": "api/register/",
        "SIGN_IN": "api/login/",
        "PRODUCTS": "api/products/",
        "REVIEWS": "api/reviews/"
    })
    .controller("mainAppCtrl", ["$scope", "$window", "$http", "$timeout", "URLS",
            function($scope, $window, $http, $timeout, URLS) {

        var closeMessageTimer;
        var closeSuccessRegistrationTimer;

        /**
         * Visibility variable for all show/hide/disable states of elements in markup
         */
        $scope.mode = {
            view: "main",
            mainSubViews: "all",
            registeredView: false,
            backArrow: false,
            reviewMessage: false,
            submitReviewBtnState: false,
            selectedClass: "grey",

            successMessageRegistration: false,
            successMessageReview: false,

            errorMessageRegistration: false,
            errorMessageAuthorization: false,
            errorMessageReview: false,

            validationError: {
                authorization: false,
                registration: false,
                review: false
            }
        };

        $scope.successMessage = {
            registration: "",
            review: ""
        };

        $scope.errorMessage = {
            registration: "",
            authorization: "",
            review: ""
        };

        $scope.userDetails = {
            username: null,
            password: null
        };

        $scope.selectedProduct = {
            product: null
        };

        $scope.reviewDetails = {
            rate: 0,
            text: ""
        };

        $scope.$watch($window.sessionStorage.username, function() {
            $window.sessionStorage.username ? $scope.mode.registeredView = true : $scope.mode.registeredView = false;
        });


        /**
         * Sign up, sign in and navigation functionality
         */
        $scope.signIn = function() {
            $scope.mode.view = "signIn";
        };

        $scope.signUp = function() {
            $scope.selectedProduct.product = null;
            $scope.mode.view = "signUp";
        };

        $scope.signOut = function() {
            $window.sessionStorage.clear();
            $scope.mode.registeredView = false;
            $scope.backToMainView();
        };

        $scope.backToMainView = function() {
            $scope.mode.view = "main";
            if($scope.mode.mainSubViews == "one") {
                $scope.mode.mainSubViews = "all";
            }

            $scope.mode.errorMessageRegistration = false;
            $scope.mode.errorMessageAuthorization = false;
            $scope.mode.errorMessageReview = false;

            $scope.mode.reviewMessage = false;
            $scope.mode.submitReviewBtnState = false;
            $scope.mode.selectedClass = "grey";

            if(!$scope.selectedProduct.product) {
                $scope.selectedProduct.product = null;
            }

            $scope.reviewDetails.rate = 0;

            $scope.mode.backArrow = false;
        };

        $scope.showSuccessRegistrationMessage = function() {
            $scope.mode.successMessageRegistration = true;
            closeSuccessRegistrationTimer = $timeout(function() {
                $scope.mode.successMessageRegistration = false;
            }, 4000);
        };

        /**
         * Toggles registered and unregistered views in page head.
         */
        $scope.changeView = function() {
            if($scope.selectedProduct.product) {
                $scope.mode.view = "main";
                $scope.mode.mainSubViews = "one";
                $scope.mode.backArrow = true;
            } else {
                $scope.backToMainView();
            }
            $scope.mode.registeredView = true;
        };

        /**
         * Products functionality
         * <p>
         * Fetches products if they are not fetched before
         */
        if(!$scope.products) {
            $scope.getProducts = function() {
                $http({
                    method: "GET",
                    url: URLS.DOMAIN + URLS.PRODUCTS
                }).then(function(response) {
                    $scope.products = {
                        data: response.data
                    };
                })
            }();
        }

        /**
         * Switches to products view, where item is selected product.
         * @param item
         */
        $scope.showProductInfo = function(item) {
            var indexOfSelectedProduct = $scope.products.data.indexOf(item);
            $scope.selectedProduct.product =  $scope.products.data[indexOfSelectedProduct];
            getReviews(item.id);
        };

        /**
         * Review functionality
         * <p>
         * Gets review by id
         * @param id
         */

        function getReviews(id) {
            $http({
                method: 'GET',
                url: URLS.DOMAIN + URLS.REVIEWS + id
            }).then(function(response) {
                $scope.reviews = {
                    data: response.data
                };
                $scope.mode.mainSubViews = "one";
                $scope.mode.backArrow = true;
            })
        }

        /**
         * Transforms date from format "YYYY-MM-DD" to format "YYYY month DD" and cuts time.
         * @param item
         * @returns {string}
         */
        $scope.transformDate = function(item) {
            var monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            var dateArray = item.split("-");
            var month = monthNames[dateArray[1] - 1];
            var day = dateArray[2].split("T")[0];
            return day + " " + month + " " + dateArray[0];
        };

        /**
         * Opens or closes review box. Checks if user authorized. If not, shows error message.
         * Clears parameters when closes review box.
         */
        $scope.writeReview = function() {
            clearReviewParam();
            $timeout.cancel(closeMessageTimer);
            $scope.mode.successMessageReview = false;
            $scope.successMessageReview = "";
            $scope.mode.errorMessageReview = false;
            $scope.errorMessage.review = "";

            if($window.sessionStorage.token) {
                $scope.setRate(-1);
                $scope.showError = false;
                checkSubmitReviewBtnState();
            } else {
                $scope.errorMessage.review = "Only registered users can make reviews";
                $scope.mode.errorMessageReview = true;
                $scope.closeMessage("review");
            }
        };

        /**
         * Toggles "WRITE REVIEW" button presence and change parameters that show or hide review box.
         */
        function checkSubmitReviewBtnState() {
            if($scope.mode.submitReviewBtnState) {
                $scope.mode.selectedClass = "grey white-text";
                $scope.mode.submitReviewBtnState = false;
                $scope.mode.reviewMessage = false;
            } else {
                $scope.mode.selectedClass = "grey lighten-4 grey-text text-darken-3";
                $scope.mode.submitReviewBtnState = true;
                $scope.mode.reviewMessage = true;
            }
        }

        /**
         * Checks if review is valid and sends to the server. Shows success or error message.
         * @param reviewDetails
         * @param isValid
         */
        $scope.submitReview = function(reviewDetails, isValid) {
            $scope.mode.errorMessageReview = false;
            $scope.mode.successMessageReview = false;
            if(isValid) {

                $http({
                    method: 'POST',
                    url: URLS.DOMAIN + URLS.REVIEWS + $scope.selectedProduct.product.id,
                    headers: {
                        'Authorization': 'Token ' + $window.sessionStorage.token
                    },
                    data: {
                        "rate": $scope.reviewDetails.rate,
                        "text": $scope.reviewDetails.text
                    }
                }).then(function(response) {
                        if(response.data.success) {
                            $scope.successMessage.review = "Your review was successfully sent";
                            $scope.mode.successMessageReview = true;
                            $scope.closeMessage("review");
                            clearReviewParam();
                            checkSubmitReviewBtnState();
                            $scope.changeView();
                            getReviews($scope.selectedProduct.product.id);
                        } else {
                            $scope.errorMessage.review = response.data.message;
                            $scope.mode.errorMessageReview = true;
                            closeMessage("review");
                        }
                    },
                    function(response) {
                        if(response.status == 401) {
                            $scope.errorMessage.review = "Authorization error. Your review wasn't send.";
                        } else {
                            $scope.errorMessage.review = "Error occurred. Please try again";
                        }
                        $scope.mode.errorMessageReview = true;
                        //closeErrorMessage();
                        $scope.closeMessage("review");
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

        /**
         * "CANCEL" button handling.
         */
        $scope.cancelReview = function() {
            clearReviewParam();
            checkSubmitReviewBtnState();
        };

        /**
         * Ratings functionality
         * <p>
         * Event on mouse over the rating star. This icon and icons before become filled, other becomes empty.
         * @param item
         */
        $scope.onMouseOverIcon = function(item) {
            for(var i = 0; i <= item; i++) {
                $("#ratingStar" + i).html("star_rate");
            }
            for(var i = item + 1; i < 5; i++) {
                $("#ratingStar" + i).html("star_border");
            }
        };

        /**
         * Event on mouse leave the rating star. Icons turns back to the selected rate.
         */
        $scope.onMouseLeaveIcon = function() {
            for(var i = 0; i < 5; i++) {
                if(i < $scope.reviewDetails.rate) {
                    $("#ratingStar" + i).html("star_rate");
                } else {
                    $("#ratingStar" + i).html("star_border");
                }
            }
        };

        /**
         * Selecting rate functionality. Item is a picked rate. All stars before the rate star becomes filled,
         * others become empty.
         * @param item
         */
        $scope.setRate = function(item) {
            if($scope.reviewDetails.rate == item + 1) {
                $scope.reviewDetails.rate = 0;
                for(var i = 0; i < 5; i++) {
                    $("#ratingStar" + i).html("star_border");
                }
            } else {
                for(var i = 0; i < 5; i++) {
                    if(i <= item) {
                        $("#ratingStar" + i).html("star_rate");
                    } else {
                        $("#ratingStar" + i).html("star_border");
                    }
                }
                $scope.reviewDetails.rate = item + 1;
            }
        };

        /**
         * Closes information messages depends on identifier with delay.
         * @param identifier
         */
        $scope.closeMessage = function (identifier) {
            $timeout.cancel(closeMessageTimer);
            closeMessageTimer = $timeout(function () {
                switch (identifier) {
                    case "registration":
                        $scope.mode.successMessageRegistration = false;
                        $scope.successMessageRegistration = "";
                        $scope.mode.errorMessageRegistration = false;
                        $scope.errorMessage.registration = "";
                        break;
                    case "authorization":
                        $scope.mode.errorMessageAuthorization = false;
                        $scope.errorMessage.authorization = "";
                        break;
                    case "review":
                        $scope.mode.successMessageReview = false;
                        $scope.successMessageReview = "";
                        $scope.mode.errorMessageReview = false;
                        $scope.errorMessage.review = "";
                        break;
                }
            }, 4000);
        };

        /**
         * Clears review parameters.
         */
        function clearReviewParam() {
            $scope.mode.reviewMessage = false;
            $scope.reviewDetails.text = "";
            $scope.reviewDetails.rate = 0;
            $scope.showError = false;
        }
    }])
    .directive('passwordsMatch', [function () {
        return {
            scope: true,
            require: 'ngModel',
            link: function (scope, elem, attrs, ctrl) {
                var firstPassword = '#' + attrs.passwordsMatch;
                elem.add(firstPassword).on('keyup', function () {
                    scope.$apply(function () {
                        ctrl.$setValidity('pwmatch', elem.val() === $(firstPassword).val());
                    });
                });
            }
        }
    }]);
