/**
 * Created by joyikr@gmail.com on 2016. 6. 22..
 */
var express = require('express');
var router = express.Router();
var bcrypt = require("bcryptjs");

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
    const PAGE_UNIT = 5;

    var pageNo = req.param("pageNo");
    var searchKeyword = req.param("searchKeyword");
    var searchType = req.param("searchType");

    if(!pageNo) pageNo = 1;
    var start = (pageNo - 1) * HOWMANY_PER_PAGE + 1;
    var end = pageNo * HOWMANY_PER_PAGE;

    var queryString = "select bno, bwriter, btitle, "
                    + "       to_char(breg_date, 'YY/MM/DD HH12:MI:SS') as bregdate"
                    + "  from board ";
    var queryCondition = "";
    if(searchType !== "anything" && searchType && searchKeyword) {
        queryCondition += "where " + searchType + " like '%" + searchKeyword + "%'";
    } else if((searchType === "anything" || !searchType) && searchKeyword) {
        queryCondition += "where bwriter like '%" + searchKeyword + "%'"
            + " or btitle like '%" + searchKeyword + "%'"
            + " or bcontent like '%" + searchKeyword + "%'";
    }
    queryString += queryCondition;
    queryString += " order by bno desc limit " + HOWMANY_PER_PAGE + " offset " + (start - 1);

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
        var query = client.query("select count(*) cnt from board " + queryCondition);
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
                var currTab = parseInt((pageNo - 1) / PAGE_UNIT + 1);
                var beginPage = (currTab - 1) * PAGE_UNIT + 1;
                var endPage = (currTab * PAGE_UNIT > lastPage) ?
                                lastPage : currTab * PAGE_UNIT;

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
        console.log(req.body.bpassword);
        query.on("row", function(row) {
            board.setBno(row.nextval)
                .setBtitle(req.body.btitle)
                .setBcontent(req.body.bcontent)
                .setBwriter(req.body.bwriter)
                .setBpassword(bcrypt.hashSync(req.body.bpassword))
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

router.get("/detail", function(req, res, next) {
    console.log("execute board detail controller");

    connPool.connect(function(err, client, release) {
        var query = client.query("select bno, btitle, bcontent, bwriter, "
            + "                   to_char(breg_date, 'YY/MM/DD HH12:MI:SS') as bregdate"
            + "               from board"
            + "              where bno = " + req.param("bno"));
        var board = new Board();
        query.on("row", function(row) {
            board.setBno(row.bno)
                .setBtitle(row.btitle)
                .setBcontent(row.bcontent)
                .setBwriter(row.bwriter)
                .setBregDate(row.bregdate);
        }).on("end", function() {
            release();
            return res.json(board);
        });
    });
});

router.post("/update", function(req, res, next) {
    console.log("execute board update controller");
    console.log(req.body.bpassword);
    connPool.connect(function(err, client, release) {
        var bno = req.body.bno;
        var pwdEqui = false;
        var query = client.query("select bpassword from board where bno = " + bno);
        query.on("row", function(row) {
            if(bcrypt.compareSync(req.body.bpassword, row.bpassword)) pwdEqui = true;
        }).on("end", function() {
            if(pwdEqui) {
                client.query("update board set btitle = $1, bcontent = $2 "
                    + "where bno = $3", [req.body.btitle, req.body.bcontent, bno]);
            }
            release();
            return res.json({success: pwdEqui});
        });
    });
});

router.post("/delete", function(req, res, next) {
    console.log("execute board delete controller");

    connPool.connect(function(err, client, release) {
        var bno = req.body.bno;
        var bpassword = req.body.bpassword;
        var pwdEqui = false;
        if(!bpassword) return res.json({success: pwdEqui});
        var query = client.query("select bpassword from board where bno = " + bno);
        query.on("row", function(row) {
            if(bcrypt.compareSync(bpassword, row.bpassword)) pwdEqui = true;
        }).on("end", function() {
            if(pwdEqui) {
                client.query("delete from board where bno= " + bno);
            }
            release();
            return res.json({success: pwdEqui});
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