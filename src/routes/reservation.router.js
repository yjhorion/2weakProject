import express from 'express';
import { prisma } from '../utils/prisma/index.js';
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

      console.log('유저의 예매내역', reservations);
      if (reservations.length === 0) {
        return res
          .status(400)
          .json({ message: '해당 유저의 예매 정보가 없습니다.' });
      }

      // const shows = await prisma.Shows.findMany({
      //   where: { showId: +reservations.ShowId },
      //   select: {
      //     showName: true,
      //     date: true,
      //     location: true,
      //   },
      // });
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

    const show = await prisma.shows.findFirst({
      where: { showId: +showId },
    });

    if (!show) {
      return res.status(400).json({ message: '찾는 공연이 없습니다.' });
    }

    const user = await prisma.users.findFirst({
      where: { userId: +userId },
    });

    transaction = await prisma.$transaction(async (tx) => {
      await tx.reservation.create({
        data: { UserId: user.userId, ShowId: show.showId },
      });

      //예매한다면, show의 quantity 하나 줄이기
      if (show.quantity > 0) {
        await tx.shows.update({
          where: { showId: +showId },
          data: { quantity: --show.quantity },
        });
      } else {
        return res.status(400).json({ message: '예매 수량이 부족합니다.' });
      }
      //계속해서 user의 credit도 줄어들기
      if (user.credit > show.price) {
        await tx.users.update({
          where: { userId: +userId },
          data: { credit: user.credit - show.price },
        });
      } else {
        return res.status(400).json({ message: '보유한 credit이 부족합니다.' });
      }

      return res.status(200).json({ message: '좌석 예매가 완료되었습니다.' });
    });
  } catch (error) {
    console.log(error);

    if (transaction) {
      await prisma.$executeRaw`ROLLBACK`;
    }
    next(error);
  }
});

export default router;
