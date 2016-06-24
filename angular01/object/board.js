var Board = function() {
    this.setBno = function(bno) {
        this.bno = bno;
        return this;
    };
    this.getBno = function() {
        return this.bno;
    };
    this.setBwriter = function(bwriter) {
        this.bwriter = bwriter;
        return this;
    };
    this.getBwriter = function() {
        return this.bwriter;
    };
    this.setBpassword = function(bpassword) {
        this.bpassword = bpassword;
        return this;
    };
    this.getBpassword = function() {
        return this.bpassword;
    };
    this.setBtitle = function(btitle) {
        this.btitle = btitle;
        return this;
    };
    this.getBtitle = function() {
        return this.btitle;
    };
    this.setBcontent = function(bcontent) {
        this.bcontent = bcontent;
        return this;
    };
    this.getBcontent = function() {
        return this.bcontent;
    };
    this.setBregDate = function(bregDate) {
        this.bregDate = bregDate;
        return this;
    };
    this.getBregDate = function() {
        return this.bregDate;
    }
    this.info = function() {
        console.log("bno : " + this.bno + ", bwriter : " + this.bwriter
                + ", bpassword : " + this.bpassword + ", btitle : " + this.btitle
                + ", bcontent : " + this.bcontent + ", bregDate : " + this.bregDate);
    }
};

module.exports = Board;