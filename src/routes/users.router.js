import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createSignIn, createSignUp } from '../middlewares/joi.error.definition.js';

const router = express.Router();

/** 회원가입 API **/
router.post('/sign-up', async (req, res) => {
  try {
    const validation = await createSignUp.validateAsync(req.body);
    const { nickname, password, type } = validation;

    const isExistNickname = await prisma.users.findFirst({
      where: { nickname },
    });

    if (isExistNickname) {
      return res.status(400).json({ message: '입력한 nickname 회원이 존재합니다.' });
    }

    const hasedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.users.create({
      data: { nickname, password: hasedPassword, type },
    });

    return res.status(200).json({ message: '회원가입에 성공하였습니다.' });
  } catch (error) {
    //에러 미들웨어를 만들었는데 이게 끝인가...뭔가 더 활용하는 방법이 있을듯 ..next()는 오류가 떴음
    return res.status(400).json({ error: error.message });
  }
});

/** 로그인 API **/
router.post('/sign-in', async (req, res, next) => {
  try {
    const validation = await createSignIn.validateAsync(req.body);
    const { nickname, password } = validation;

    const user = await prisma.users.findFirst({ where: { nickname } });

    if (!user) {
      return res.status(400).json({ message: '회원정보가 없어요. 회원가입해주세요.' });
    } else if (!(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'password를 확인해주세요.' });
    }
    //user가 있다면 user의 userId를 jwt로 바꾸고 쿠키로 Bearer형식으로 클라이언트한테 응답을 보내준다.
    const token = jwt.sign({ userId: user.userId }, 'secretKey', { expiresIn: '30s' });

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(200).json({ message: '로그인에 성공하였습니다.' });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
});

export default router;
