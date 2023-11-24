import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { Prisma } from '@prisma/client';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** (메인) 공연 목록 조회 **/
router.get('/reservation', async (req, res, next) => {
  try {
    const reservation = await prisma.shows.findMany();
    if (!reservation) {
      return res.status(400).json({ message: '공연이 존재하지않습니다.' });
    }
    return res.status(200).json({ data: reservation });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/** 공연 상세 조회 **/
router.get('/reservation/:showId', async (req, res, next) => {
  try {
    const { showId } = req.params;
    const show = await prisma.shows.findFirst({
      where: { showId: +showId },
    });

    if (!show) {
      return res.status(400).json({ message: '찾는 공연이 없습니다.' });
    }

    return res.status(200).json({ data: show });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/** 공연 예매 내역 조회 **/
router.get(
  '/reservation/detail/user',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.user;

      const reservations = await prisma.reservation.findMany({
        where: { UserId: +userId },
      });

      if (reservations.length === 0) {
        return res
          .status(400)
          .json({ message: '해당 유저의 예매 정보가 없습니다.' });
      }

      //여러 예매 내역 조회
      const shows = await Promise.all(
        reservations.map(async (reservation) => {
          const show = await prisma.Shows.findFirst({
            where: { showId: reservation.ShowId },
            select: {
              showName: true,
              date: true,
              location: true,
            },
          });
          return show;
        }),
      );

      if (!shows) {
        return res
          .status(400)
          .json({ message: '해당 유저의 예매 정보가 없습니다.' });
      }

      return res.status(200).json({ data: shows });
    } catch (error) {
      next(error);
    }
  },
);

/** 공연 예매 **/
router.post('/reservation/:showId', authMiddleware, async (req, res, next) => {
  let transaction;
  try {
    const { showId } = req.params;
    const { userId } = req.user;

    transaction = await prisma.$transaction(
      async (tx) => {
        const show = await tx.shows.findFirst({
          where: { showId: +showId },
        });

        if (!show) {
          console.log(`${userId} : 공연없음`);
          return res.status(400).json({ message: '찾는 공연이 없습니다.' });
        }

        const user = await tx.users.findFirst({
          where: { userId: +userId },
        });
        //트랜잭션의 일관성은 유지가 되나, 0개 이상 구
        //트랜잭션이 0 이하일경우 참조되지않도록하는 방법
        if (show.quantity > 0) {
          // await prisma.shows.update({
          //   where: { showId: +showId },
          //   data: { quantity: { decrement: 1 } },
          // });
          await tx.$executeRaw`UPDATE Shows SET quantity = quantity-1 WHERE showId=${showId};`;
        } else {
          console.log(`${userId} : 예매수량부족`);
          throw new Error('예매 수량이 부족합니다.');
        }

        if (user.credit >= show.price) {
          // await tx.users.update({
          //   where: { userId: +userId },
          //   data: { credit: user.credit - show.price },
          // });
          await tx.$executeRaw`UPDATE users SET credit = credit - ${show.price} WHERE userId=${userId};`;
          // await tx.reservation.create({
          //   data: { UserId: user.userId, ShowId: show.showId },
          // });
          await tx.$executeRaw`INSERT INTO reservation(UserId, ShowId) VALUES (${user.userId}, ${show.showId});`;
        } else {
          console.log(`${userId} : credit부족`);
          throw new Error('보유한 credit이 부족합니다.');
        }
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      },
    );
    return res.status(200).json({ message: '좌석 예매가 완료되었습니다.' });
  } catch (error) {
    console.log(`catch로 빠진 ${error}`);
    next(error);
    if (transaction) {
      await prisma.$executeRaw`ROLLBACK`;
    }
  }
});

export default router;
