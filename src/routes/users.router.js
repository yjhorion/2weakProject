import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  createSignIn,
  createSignUp,
} from '../middlewares/joi.error.definition.js';

const router = express.Router();

/** 회원가입 API **/
router.post('/sign-up', async (req, res, next) => {
  try {
    const validation = await createSignUp.validateAsync(req.body);
    const { nickname, password, type } = validation;

    if (password.includes(nickname)) {
      return res
        .status(400)
        .json({ mesaage: 'password에 nickname이 포함되면 안됩니다.' });
    }

    const isExistNickname = await prisma.users.findFirst({
      where: { nickname },
    });

    if (isExistNickname) {
      return res
        .status(400)
        .json({ message: '입력한 nickname 회원이 존재합니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { nickname, password: hashedPassword, type },
    });

    return res.status(200).json({ message: '회원가입에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const validation = await createSignIn.validateAsync(req.body);
    const { nickname, password } = validation;

    const user = await prisma.users.findFirst({ where: { nickname } });

    if (!user) {
      return res
        .status(400)
        .json({ message: '회원정보가 없어요. 회원가입해주세요.' });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'password를 확인해주세요.' });
    }

    const token = jwt.sign({ userId: user.userId }, 'secretKey', {
      expiresIn: '1000s',
    });

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인에 성공하였습니다.' });
  } catch (error) {
    next(error);
  }
});

export default router;
