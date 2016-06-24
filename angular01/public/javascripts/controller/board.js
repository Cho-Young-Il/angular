/**
 * Created by joyikr@gmail.com on 2016. 6. 22..
 */
angular.module("angular01App", [])
    .controller("boardController", function($scope, $http, $location) {
        $scope.formData = {};

        $scope.createTodo = function() {
            $http.post("/board/regist", $scope.formData)
                .success(function() {
                    $scope.formdata = {};
                    window.location = "/board";
                })
                .error(function(err) {
                    console.log("Error : " + err);
                })
        }
    });
