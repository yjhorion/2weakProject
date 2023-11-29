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
        const user = await tx.users.findFirst({
          where: { userId: +userId },
          select: { userId: true, credit: true },
        });

        await tx.$executeRaw`UPDATE Shows SET quantity = quantity-1 WHERE showId=${showId};`;

        const updatedShow = await prisma.shows.findFirst({
          where: { showId: +showId },
        });

        if (!updatedShow) {
          console.log(`없는 show`);
          throw new Error('존재하지 않는 show 입니다');
        }

        if (updatedShow.quantity <= 0) {
          console.log(`${userId} : 예매수량부족`);
          throw new Error('예매 수량이 부족합니다.');
        } else {
          await tx.$executeRaw`UPDATE users SET credit = credit - ${updatedShow.price} WHERE userId=${userId};`;
          await tx.$executeRaw`INSERT INTO reservation(UserId, ShowId) VALUES (${user.userId}, ${updatedShow.showId});`;
          // querryRaw와 executeRaw 차이점 찾아보기.
        }
        const updatedUser = await tx.users.findFirst({
          where: { userId: +userId },
        });
        if (updatedUser.credit < 0 ) {
          console.log(`${userId} : credit부족`);
          throw new Error('보유한 credit이 부족합니다.');
        } 
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 50
      }, 
    );
    return res.status(200).json({ message: '좌석 예매가 완료되었습니다.' });
  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === 'P2028'
    ) {
      console.error('PrismaClientKnownRequestError, P2028 에러발생');
    }
    next(error);
  }
});

/* show 정보 수정 */
router.post('/editShowInfo/:showId/:quantity', async (req, res, next) => {
  try{
    const { showId,  quantity } = req.params
    const show = await prisma.shows.update({
      where : { showId : +showId},
      data : {
        quantity : +quantity
      }
    })
    return res.status(201).json({ data : show.quantity })
  } catch (error) {
    next(error)
  }
})


export default router;
