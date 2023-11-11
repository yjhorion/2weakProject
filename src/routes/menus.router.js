import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import { createMenus } from '../middlewares/joi.error.definition.js';

const router = express.Router();

/** 메뉴 등록 **/
router.post(
  '/categories/:categoryId/menus',
  authMiddleware,
  async (req, res, next) => {
    try {
      const validation = await createMenus.validateAsync(req.body);
      const { name, description, image, price, order } = validation;
      const { categoryId } = req.params;
      const { userId } = req.user;

      const user = await prisma.Users.findFirst({
        where: { userId: Number(userId) },
      });

      if (user.type !== 'OWNER') {
        return res
          .status(400)
          .json({ message: '사장님만 사용할 수 있는 API입니다.' });
      }

      const category = await prisma.categories.findFirst({
        where: { categoryId: Number(categoryId), deletedAt: null },
      });

      if (!category) {
        return res
          .status(400)
          .json({ message: '존재하지 않는 카테고리입니다.' });
      }

      const maxOrder = await prisma.menus.findFirst({
        orderBy: { order: 'desc' },
      });

      const orderIncreased = maxOrder ? maxOrder.order + 1 : 1;

      await prisma.menus.create({
        data: {
          CategoryId: Number(categoryId),
          UserId: Number(userId),
          name,
          description,
          image,
          price,
          order: Number(orderIncreased),
        },
      });

      return res.status(200).json({ message: '메뉴를 등록하였습니다.' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

/** 카테고리별 메뉴 조회 **/
router.get('/categories/:categoryId/menus', async (req, res, next) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.categories.findFirst({
      where: { categoryId: Number(categoryId), deletedAt: null },
    });

    const menu = await prisma.menus.findMany({
      select: {
        menuId: true,
        name: true,
        image: true,
        price: true,
        order: true,
        status: true,
      },
      where: {
        CategoryId: Number(categoryId),
        deletedAt: null,
        Category: { deletedAt: null },
      },
      orderBy: { order: 'asc' },
    });

    if (!category) {
      return res.status(400).json({ error: '존재하지 않은 카테고리입니다.' });
    } else if (!menu) {
      return res.status(400).json({ error: '존재하지 않은 메뉴입니다.' });
    }

    return res.status(200).json({ data: menu });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 메뉴 상세 조회 **/
router.get('/categories/:categoryId/menus/:menuId', async (req, res, next) => {
  try {
    const { categoryId, menuId } = req.params;

    const category = await prisma.categories.findFirst({
      where: { categoryId: Number(categoryId), deletedAt: null },
    });

    const menu = await prisma.menus.findFirst({
      where: {
        CategoryId: Number(categoryId),
        menuId: Number(menuId),
        Category: {
          deletedAt: null,
        },
        deletedAt: null,
      },
      select: {
        CategoryId: true,
        name: true,
        description: true,
        image: true,
        price: true,
        order: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!category) {
      return res.status(400).json({ error: '존재하지 않은 카테고리입니다.' });
    } else if (!menu) {
      return res.status(400).json({ error: '존재하지 않은 메뉴입니다.' });
    }

    return res.status(200).json({ data: menu });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/** 메뉴 수정 **/
router.patch(
  '/categories/:categoryId/menus/:menuId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const validation = await createMenus.validateAsync(req.body);
      const { name, description, price, order, status } = validation;
      const { categoryId, menuId } = req.params;
      const { userId } = req.user;

      const user = await prisma.Users.findFirst({
        where: { userId: Number(userId) },
      });

      if (user.type !== 'OWNER') {
        return res
          .status(400)
          .json({ message: '사장님만 사용할 수 있는 API입니다.' });
      }

      const category = await prisma.categories.findFirst({
        where: { categoryId: Number(categoryId), deletedAt: null },
      });

      const menu = await prisma.menus.findFirst({
        where: {
          CategoryId: Number(categoryId),
          menuId: Number(menuId),
          Category: {
            deletedAt: null,
          },
          deletedAt: null,
        },
      });

      if (!category) {
        return res.status(400).json({ error: '존재하지 않은 카테고리입니다.' });
      } else if (!menu) {
        return res.status(400).json({ error: '존재하지 않은 메뉴입니다.' });
      }

      const currentMenu = await prisma.menus.findFirst({
        where: { order: Number(order), deletedAt: null },
      });

      if (currentMenu) {
        await prisma.menus.updateMany({
          where: {
            CategoryId: +categoryId,
            OR: [{ order: { gt: order } }, { order }],
          },
          data: { order: { increment: 1 } },
        });
      }

      await prisma.menus.update({
        data: { name, description, price, order, status },
        where: { CategoryId: Number(categoryId), menuId: Number(menuId) },
      });

      return res.status(200).json({ message: '메뉴를 수정하였습니다.' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

/** 메뉴 삭제 **/
router.delete(
  '/categories/:categoryId/menus/:menuId',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { categoryId, menuId } = req.params;
      const { userId } = req.user;

      const user = await prisma.Users.findFirst({
        where: { userId: Number(userId) },
      });

      if (user.type !== 'OWNER') {
        return res
          .status(400)
          .json({ message: '사장님만 사용할 수 있는 API입니다.' });
      }

      //경로매개변수 오기재시 잡아주기 위함.
      const category = await prisma.categories.findFirst({
        where: { categoryId: Number(categoryId), deletedAt: null },
      });

      const menu = await prisma.menus.findFirst({
        where: {
          CategoryId: Number(categoryId),
          menuId: Number(menuId),
          Category: {
            deletedAt: null,
          },
          deletedAt: null,
        },
      });

      if (!category) {
        return res.status(400).json({ error: '존재하지 않은 카테고리입니다.' });
      } else if (!menu) {
        return res.status(400).json({ error: '존재하지 않은 메뉴입니다.' });
      }

      await prisma.menus.update({
        where: { CategoryId: Number(categoryId), menuId: Number(menuId) },
        data: { deletedAt: new Date() },
      });

      return res.status(200).json({ message: '메뉴를 삭제하였습니다.' });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  },
);

export default router;
