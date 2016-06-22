-- Board Sequence
CREATE SEQUENCE seq_board;

-- Board
CREATE TABLE "board"
(
	"bno"       integer      NOT NULL, -- 일련번호
	"bwriter"   varchar(50)  NOT NULL, -- 작성자
	"bpassword" varchar(100) NOT NULL, -- 비밀번호
	"btitle"    varchar(255) NOT NULL, -- 제목
	"bcontent"  text         NOT NULL, -- 내용
	"breg_date" timestamp    NOT NULL  -- 등록일
);

-- Board
COMMENT ON TABLE "board" IS 'Board';

-- 일련번호
COMMENT ON COLUMN "board"."bno" IS '일련번호';

-- 작성자
COMMENT ON COLUMN "board"."bwriter" IS '작성자';

-- 비밀번호
COMMENT ON COLUMN "board"."bpassword" IS '비밀번호';

-- 제목
COMMENT ON COLUMN "board"."btitle" IS '제목';

-- 내용
COMMENT ON COLUMN "board"."bcontent" IS '내용';

-- 등록일
COMMENT ON COLUMN "board"."breg_date" IS '등록일';

-- Board 기본키
CREATE UNIQUE INDEX "PK_TABLE"
	ON "board"
	( -- Board
		"bno" ASC -- 일련번호
	)
;
-- Board
ALTER TABLE "board"
	ADD CONSTRAINT "PK_TABLE"
		 -- Board 기본키
	PRIMARY KEY 
	USING INDEX "PK_TABLE";

-- Board 기본키
COMMENT ON CONSTRAINT "PK_TABLE" ON "board" IS 'Board 기본키';