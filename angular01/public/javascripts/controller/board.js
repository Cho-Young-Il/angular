/**
 * Created by joyikr@gmail.com on 2016. 6. 22..
 */

angular.module("angular01App", []).run(['$rootScope', function($rootScope) {
    $rootScope.range = function(min, max, step) {
        // parameters validation for method overloading
        if (max == undefined) {
            max = min;
            min = 0;
        }
        step = Math.abs(step) || 1;
        if (min > max) {
            step = -step;
        }
        // building the array
        var output = [];
        for (var value=min; value<max; value+=step) {
            output.push(value);
        }
        // returning the generated array
        return output;
    };
}]).controller("boardController", function($scope, $http, $location) {
    $scope.formData = {};


    $scope.getList = function() {
        $http.get("/board/list", {
            params: {
                pageNo: $scope.pageNo,
                searchType : $scope.searchType,
                searchKeyword : $scope.searchKeyword
            }
        }).success(function(data) {
            console.log(data);
            $scope.boardList = data.value.boardList;
            $scope.pageNo = data.value.pageNo;
            $scope.beginPage = data.value.beginPage;
            $scope.lastPage = data.value.lastPage;
            $scope.endPage = data.value.endPage;
        })
        .error(function(err) {
            console.log("Error : " + err);
        });
    };
    $scope.getList();
    $scope.showFirstPage = function() {
        $scope.pageNo = 1;
        $scope.getList();
    };
    $scope.showPreviousPage = function() {
        $scope.pageNo = $scope.pageNo - 1;
        $scope.getList();
    };
    $scope.pageChange = function(event) {
        $scope.pageNo = $(event.target).attr("pageNo");
        $scope.getList();
    };
    $scope.showNextPage = function() {
        $scope.pageNo = $scope.pageNo + 1;
        $scope.getList();
    };
    $scope.showLastPage = function() {
        $scope.pageNo = $scope.lastPage;
        $scope.getList();
    };

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