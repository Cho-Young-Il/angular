/**
 * Created by joyikr@gmail.com on 2016. 6. 22..
 */
angular.module("angular01App", [])
    .controller("boardController", function($scope, $http, $location) {
        $scope.formData = {};

        $http.get("/board/list")
            .success(function(data) {
                console.log(data);
                $scope.boardList = data.value.boardList;
            })
            .error(function(err) {
                console.log("Error : " + err);
            });

        $scope.boardRegist = function() {
            $http.post("/board/regist", $scope.formData)
                .success(function() {
                    $scope.formdata = {};
                    window.location = "/board";
                })
                .error(function(err) {
                    console.log("Error : " + err);
                });
        };
    });
