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
    console.log("execute board list controller");
    res.render('board');
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

module.exports = router;