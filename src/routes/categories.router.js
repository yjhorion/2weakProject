import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createCategories } from '../middlewares/joi.error.definition.js';

const router = express.Router();

const checkType = { OWNER: 'OWNER', CUSTOMER: 'CUSTOMER' };
export { checkType };

/** 카테고리 등록 **/
router.post('/categories', authMiddleware, async (req, res, next) => {
  try {
    const validation = await createCategories.validateAsync(req.body);
    const { name } = validation;
    const { userId, type } = req.user;

    if (type !== checkType.OWNER) {
      return res
        .status(400)
        .json({ message: '사장님만 사용할 수 있는 API입니다.' });
    }

    const maxOrder = await prisma.Categories.findFirst({
      orderBy: { order: 'desc' },
    });
    const orderIncreased = maxOrder ? maxOrder.order + 1 : 1;

    const author = (
      await prisma.users.findFirst({
        where: { userId: userId },
      })
    ).nickname;

    await prisma.Categories.create({
      data: {
        name,
        order: Number(orderIncreased),
        UserId: Number(userId),
        author,
      },
    });
    return res.status(200).json({ message: '카테고리를 등록하였습니다.' });
  } catch (error) {
    // next(error);
  }
});

/** 카테고리 목록 조회 **/
router.get('/categories', async (req, res, next) => {
  try {
    const category = await prisma.Categories.findMany({
      where: { deletedAt: null },
      orderBy: { order: 'asc' },
      select: {
        categoryId: true,
        name: true,
        order: true,
        author: true,
      },
    });

    if (!category) {
      return res.status(400).json({ errorMessage: '데이터가 없습니다.' });
    }

    return res.status(200).json({ data: category });
  } catch (error) {
    next(error);
  }
});

/** 카테고리 정보 변경 **/
router.patch(
  '/categories/:categoryId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const validation = await createCategories.validateAsync(req.body);
      const { name, order } = validation;
      const { categoryId } = req.params;
      const { userId, type } = req.user;

      if (type !== 'OWNER') {
        return res
          .status(400)
          .json({ message: '사장님만 사용할 수 있는 API입니다.' });
      }

      const currentCategory = await prisma.Categories.findFirst({
        where: { order: Number(order), deletedAt: null },
      });

      if (currentCategory) {
        await prisma.categories.updateMany({
          where: {
            OR: [{ order: { gt: order } }, { order }],
          },
          data: { order: { increment: 1 } },
        });
      }

      const category = await prisma.Categories.findFirst({
        where: { categoryId: Number(categoryId), deletedAt: null },
      });

      if (!category) {
        return res
          .status(400)
          .json({ message: '존재하지않는 카테고리입니다.' });
      }

      if (category.UserId !== userId) {
        return res.status(401).json({ message: '수정 권한이 없습니다' });
      }

      await prisma.Categories.update({
        where: {
          categoryId: Number(categoryId),
          deletedAt: null,
        },
        data: { name, order },
      });

      return res
        .status(200)
        .json({ messge: '카테고리 정보를 수정하였습니다.' });
    } catch (error) {
      next(error);
    }
  },
);

/** 카테고리 삭제 **/
router.delete(
  '/categories/:categoryId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const { userId, type } = req.user;

      if (type !== 'OWNER') {
        return res
          .status(400)
          .json({ message: '사장님만 사용할 수 있는 API입니다.' });
      }

      const category = await prisma.Categories.findFirst({
        where: { categoryId: Number(categoryId), deletedAt: null },
      });

      if (!category) {
        return res
          .status(400)
          .json({ message: '존재하지않는 카테고리입니다.' });
      }

      if (category.UserId !== userId) {
        return res.status(401).json({ message: '수정 권한이 없습니다' });
      }

      await prisma.Categories.update({
        where: { categoryId: Number(categoryId) },
        data: {
          deletedAt: new Date(),
          Menus: {
            updateMany: {
              where: { CategoryId: Number(categoryId) },
              data: {
                deletedAt: new Date(),
              },
            },
          },
        },
      });

      return res
        .status(200)
        .json({ messge: '카테고리 정보를 삭제하였습니다.' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;
