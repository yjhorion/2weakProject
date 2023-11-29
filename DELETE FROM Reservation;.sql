DELETE FROM Reservation;
UPDATE Shows SET quantity = 100;
UPDATE users SET credit = 90000;

SELECT * FROM Shows;
SELECT * FROM Users;
SELECT UserId, COUNT(UserId) as 'user가 예매한 횟수' FROM Reservation
GROUP BY UserId WITH ROLLUP ORDER BY UserId;


DESC shows;
DESC reservation
DESC users
-- 외래키는 자동 인덱스처리됨.
-- -- 인덱스 사용되었는지 확인하는 쿼리
-- SHOW INDEX FROM shows;
-- SHOW INDEX FROM reservation;
-- SHOW INDEX FROM users;

--인덱스 설정하기 쿼리
-- Reservation 테이블의 userId 중복허용 인덱스걸기
-- CREATE INDEX userId ON reservation(userId);
-- -- Reservation 테이블의 showId 중복허용 인덱스걸기
-- CREATE INDEX showId ON reservation(showId);

-- Pessimistic lock(데이터를 읽거나 수정하기 전에 해당 데이터를 락으로 설정하는 방식) 을 한다고 한들 현재와 달라질까 하는 생각 -> 일단은 해본다. -> 안된다.
-- transaction 내의 쿼리문 -> 로우쿼리로 변경 및 FOR UPDATE 기능 추가


SELECT * FROM shows WHERE showId = ${showId} FOR UPDATE;
SELECT * FROM users WHERE userId = ${userId} FOR UPDATE;



