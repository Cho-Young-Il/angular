/**
 * Created by MacintoshHD on 2016. 6. 22..
 */
var express = require('express');
var router = express.Router();

var Pool = require("pg").Pool;
var connConfig = require("../config/connConfig.js");
var connPool = new Pool(connConfig);

var Board = require("../object/board.js");

router.get("/", function(req, res, next) {
    res.render("board");
})

router.get("/list", function(req, res, next) {
    console.log("execute board list controller");

    const HOWMANY_PER_PAGE = 10;
    var pageNo = req.body.pageNo;
    var searchKeyword = req.body.searchKeyword;
    var searchType = req.body.searchType;

    if(!pageNo) pageNo = 1;
    var start = (pageNo - 1) * HOWMANY_PER_PAGE + 1;
    var end = pageNo * HOWMANY_PER_PAGE;

    var queryString = "select bno, bwriter, btitle, bcontent, "
                    + "       to_char(breg_date, 'YY/MM/DD HH12:MI:SS') as bregdate"
                    + "  from board ";

    if(searchType && searchKeyword) {
        queryString += "where " + searchType + " like '%" + searchKeyword + "%'";
    } else if(searchType && !searchKeyword) {
        queryString += "where bwriter like '%" + searchKeyword + "%'"
            + " or btitle like '%" + searchKeyword + "%'"
            + " or bcontent like '%" + searchKeyword + "%'";
    }

    queryString += " order by bno desc limit " + HOWMANY_PER_PAGE + " offset " + start;

    var jsonData = Map();
    var boardList = [];
    connPool.connect(function(err, client, release) {
        if(err) {
            release();
            console.log(err);
            next(err);
            return res.status(500).json({ success: false, data: err});
        }

        var cnt = undefined;
        var query = client.query("select count(*) cnt from board");
        query.on("row", function(row) {
            cnt = row.cnt;
        }).on("end", function() {
            var query = client.query(queryString);
            query.on("row", function(row) {
                boardList.push(row);
            }).on("end", function() {
                release();

                var lastPage = (parseInt(cnt % HOWMANY_PER_PAGE) == 0) ?
                                parseInt(cnt / HOWMANY_PER_PAGE) : parseInt(cnt / HOWMANY_PER_PAGE + 1);
                var currTab = parseInt((pageNo - 1) / HOWMANY_PER_PAGE + 1);
                var beginPage = (currTab - 1) * HOWMANY_PER_PAGE + 1;
                var endPage = (currTab * HOWMANY_PER_PAGE > lastPage) ?
                                lastPage : currTab * HOWMANY_PER_PAGE;

                jsonData.put("pageNo", pageNo);
                jsonData.put("lastPage", lastPage);
                jsonData.put("beginPage", beginPage);
                jsonData.put("endPage", endPage);
                jsonData.put("boardList", boardList);

                return res.json(jsonData);
            });
        });
    });
});

router.post("/regist", function(req, res, next) {
    console.log("execute board regist controller");
    connPool.connect(function(err, client, release) {
        if(err) {
            release();
            console.log(err);
            next(err);
            return res.status(500).json({ success: false, data: err});
        }

        var query = client.query("select nextval('seq_board')");
        var board = new Board();
        query.on("row", function(row) {
            board.setBno(row.nextval)
                .setBtitle(req.body.btitle)
                .setBcontent(req.body.bcontent)
                .setBwriter(req.body.bwriter)
                .setBpassword(req.body.bpassword)
                .setBregDate(new Date());
        }).on("end", function() {
            client.query("insert into board(bno, btitle, bcontent, bwriter, bpassword, breg_date)"
                        + "values($1, $2, $3, $4, $5, $6)", [board.getBno(), board.getBtitle(), board.getBcontent(), board.bwriter, board.bpassword, board.bregDate]);
            release();
            console.log("complete board regist");
            return res.json({success : true});
        });
    });
});



function Map() {
    var map = {};
    map.value = {};
    map.getKey = function(id) {
        return id;
    };
    map.put = function(id, value) {
        var key = map.getKey(id);
        map.value[key] = value;
    };
    map.contains = function(id) {
        var key = map.getKey(id);
        if(map.value[key]) {
            return true;
        } else {
            return false;
        }
    };
    map.get = function(id) {
        var key = map.getKey(id);
        if(map.value[key]) {
            return map.value[key];
        }
        return null;
    };
    map.remove = function(id) {
        var key = map.getKey(id);
        if(map.contains(id)){
            map.value[key] = undefined;
        }
    };

    return map;
}

module.exports = router;