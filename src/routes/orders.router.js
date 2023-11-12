import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createOrders } from '../middlewares/joi.error.definition.js';

const router = express.Router();

/** 메뉴 주문 **/
router.post('/orders', authMiddleware, async (req, res, next) => {
  try {
    const validation = await createOrders.validateAsync(req.body);
    const { menuId, quantity } = validation;
    const { userId, type } = req.user;

    if (type !== 'CUSTOMER') {
      return res
        .status(400)
        .json({ message: '소비자만 사용할 수 있는 API입니다.' });
    }

    const totalPrice =
      await prisma.$queryRaw`SELECT SUM(price * ${quantity}) AS totalPrice FROM Menus WHERE menuId = ${menuId}`;

    // console.log('전체금액', totalPrice); //전체금액 [ { totalPrice: 48000 } ]
    await prisma.orders.create({
      data: {
        User: {
          connect: {
            userId: Number(userId),
          },
        },
        Menu: {
          connect: {
            menuId: Number(menuId),
          },
        },
        quantity,
        totalPrice: Number(totalPrice),
        orderedAt: new Date(),
        totalPrice: totalPrice[0].totalPrice,
      },
    });
    return res.status(200).json({ message: '메뉴 주문이 완료되었습니다.' });
  } catch (error) {
    next(error);
  }
});

/** 사용자 주문 내역 조회 **/
router.get('/orders/customer', authMiddleware, async (req, res, next) => {
  try {
    const { userId, type } = req.user;

    if (type !== 'CUSTOMER') {
      return res
        .status(400)
        .json({ message: '소비자만 사용할 수 있는 API입니다.' });
    }

    const orders = await prisma.orders.findMany({
      where: { UserId: Number(userId) },
      orderBy: { orderedAt: 'desc' },
      select: {
        Menu: {
          select: {
            name: true,
            price: true,
          },
        },
        totalPrice: true,
        quantity: true,
        status: true,
        orderedAt: true,
      },
    });

    if (!orders) {
      return res.status(400).json({ message: '주문이 존재하지않습니다.' });
    }

    return res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
});

/** 사장님 주문 내역 조회 **/
router.get('/orders/owner', authMiddleware, async (req, res, next) => {
  try {
    const { type } = req.user;

    if (type !== 'OWNER') {
      return res
        .status(400)
        .json({ message: '사장님만 사용할 수 있는 API입니다.' });
    }

    const orders = await prisma.orders.findMany({
      orderBy: { orderedAt: 'desc' },
      select: {
        UserId: true,
        User: { select: { nickname: true } },
        Menu: { select: { name: true, price: true } },
        orderId: true,
        quantity: true,
        orderedAt: true,
        totalPrice: true,
        status: true,
      },
    });

    if (!orders) {
      return res.status(400).json({ message: '주문이 존재하지않습니다.' });
    }
    return res.status(200).json({ data: orders });
  } catch (error) {
    next(error);
  }
});

/** 주문 상태 변경 **/
router.patch(
  '/orders/:orderId/status',
  authMiddleware,
  async (req, res, next) => {
    try {
      const validation = await createOrders.validateAsync(req.body);
      const { orderId } = req.params;
      const { status } = validation;

      const order = await prisma.orders.findFirst({
        where: { orderId: Number(orderId) },
      });

      if (!order) {
        return res
          .status(400)
          .json({ message: '선택하신 주문내역이 없습니다.' });
      }

      await prisma.orders.update({
        where: { orderId: Number(orderId) },
        data: { status },
      });

      return res.status(200).json({ message: '주문 내역을 수정하였습니다.' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
