--조회
-- Reservation 테이블 조회
SELECT * FROM `testfront`.`Reservation` LIMIT 1000;
-- Shows 테이블 조회
SELECT * FROM `testfront`.`Shows` LIMIT 1000;



--데이터 삭제
DELETE FROM Reservation;

DELETE FROM Shows;

DELETE FROM Users;


--데이터 수정
-- Shows 테이블 수량 수정
UPDATE Shows SET quantity = 10;
