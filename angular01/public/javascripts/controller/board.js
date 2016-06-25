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
    $scope.readonly = true;

    $scope.getList = function() {
        $http.get("/board/list", {
            params: {
                pageNo: $scope.pageNo,
                searchType : $scope.searchType,
                searchKeyword : $scope.searchKeyword
            }
        }).success(function(data) {
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
        $scope.pageNo = parseInt($scope.pageNo) - 1;
        $scope.getList();
    };
    $scope.pageChange = function(event) {
        $scope.pageNo = $(event.target).attr("pageNo");
        $scope.getList();
    };
    $scope.showNextPage = function() {
        $scope.pageNo = parseInt($scope.pageNo) + 1;
        $scope.getList();
    };
    $scope.showLastPage = function() {
        $scope.pageNo = $scope.lastPage;
        $scope.getList();
    };
    $scope.searchTypeChange = function(searchType) {
        $scope.searchType = searchType;
        angular.element("#searchType").html(searchType);
    };
    $scope.searchWithKeyword = function() {
        $scope.searchKeyword = angular.element("#searchKeyword").val();
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


    $scope.boardDetail = function(bno) {
        $http.get("/board/detail", {
            params: {
                bno: bno
            }
        }).success(function(data) {
            $scope.detailBoardBno = data.bno;
            $scope.detailBoardBtitle = data.btitle;
            $scope.detailBoardBcontent = data.bcontent;
            $scope.detailBoardBwriter = data.bwriter;
            $scope.detailBoardBregDate = data.bregDate;
        })
        .error(function(err) {
            console.log("Error : " + err);
        });
    };
    $scope.detail = function(event) {
        var bno = $(event.target).attr("bno");
        $scope.readonly = true;
        $scope.formData = {};
        angular.element("#editBtn").css("display", "inline");
        angular.element("#modifyBtn").css("display", "none");
        angular.element("#deleteBtn").css("display", "none");
        angular.element("#boardPwdDiv").css("display", "none");
        $scope.boardDetail(bno);
    };

    $scope.editBoard = function() {
        $scope.readonly = false;
        angular.element("#editBtn").css("display", "none");
        angular.element("#modifyBtn").css("display", "inline");
        angular.element("#deleteBtn").css("display", "inline");
        angular.element("#boardPwdDiv").css("display", "block");
    };

    $scope.modifyBoard = function() {
        $scope.formData.bno = $scope.detailBoardBno;
        $scope.formData.btitle = $scope.detailBoardBtitle;
        $scope.formData.bcontent = $scope.detailBoardBcontent;
        $http.post("/board/update", $scope.formData)
            .success(function(data) {
                $scope.formdata = {};
                angular.element("#detailCloseBtn").trigger("click");
                if(data.success) {
                    alert("Board Update Success");
                    $scope.getList();
                } else {
                    alert("Board Update Fail\nCheck Password");
                }
            })
            .error(function(err) {
                console.log("Error : " + err);
            });
    };

    $scope.deleteBoard = function() {
        $scope.formData.bno = $scope.detailBoardBno;
        $http.post("/board/delete", $scope.formData)
            .success(function(data) {
                $scope.formdata = {};
                angular.element("#detailCloseBtn").trigger("click");
                if(data.success) {
                    alert("Board Delete Success");
                    $scope.getList();
                } else {
                    alert("Board Delete Fail\nCheck Password");
                }
            })
            .error(function(err) {
                console.log("Error : " + err);
            });
    };
});