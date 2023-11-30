import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createSignIn,
  createSignUp,
} from '../middlewares/joi.error.definition.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const validation = await createSignUp.validateAsync(req.body);
    const { username, password } = validation;

    if (!password || !username || password.includes(username)) {
      return res
        .status(400)
        .json({ message: 'password에 username이 포함되면 안됩니다.' });
    }

    const isExistUsername = await prisma.users.findFirst({
      where: { username },
    });

    if (isExistUsername) {
      return res
        .status(400)
        .json({ message: '입력한 username 회원이 존재합니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { username, password: hashedPassword },
    });

    return res.status(200).json({ message: '회원가입 성공' });
  } catch (error) {
    next(error);
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const validation = await createSignIn.validateAsync(req.body);
    const { username, password } = validation;

    const user = await prisma.users.findFirst({ where: { username } });

    if (!user) {
      return res
        .status(400)
        .json({ error: '회원정보가 없어요. 회원가입해주세요.' });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'password를 확인해주세요.' });
    }

    const token = jwt.sign({ userId: user.userId }, 'secretKey' 
      // expiresIn: '1000y',
    );

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인 성공' });
  } catch (error) {
    next(error);
  }
});

/** 로그아웃 API **/
router.post('/sign-out', async (req, res, next) => {
  try {
    if (!req.cookies.authorization) {
      return res.status(400).json({
        message: '로그아웃 실패하셨습니다.',
      });
    }
    res.clearCookie('authorization');
    return res.status(200).json({ message: '로그아웃 성공' });
  } catch (error) {
    next(error);
  }
});

/** 사용자 조회 API **/
router.get('/user', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await prisma.users.findFirst({
      where: { userId },
      select: { username: true, credit: true },
    });

    if (!user) {
      return res.status(400).json({ message: '사용자 정보가 없습니다.' });
    }
    return res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
});

/* credit 충전 */
router.post('/editUserInfo/:credit', authMiddleware, async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { credit } = req.params;
    await prisma.users.update({
      where: { userId },
      data: {
        credit: +credit,
      },
    });
    return res.status(201).json({});
  } catch (error) {
    next(error);
  }
});

export default router;
