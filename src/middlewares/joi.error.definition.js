import joi from 'joi';

const createSignUp = joi.object({
  username: joi.string().alphanum().min(3).max(15).messages({
    'string.min': 'nickname를 3글자 이상으로 작성해주세요.',
    'string.max': 'nickname을 15글자 이하으로 작성해주세요.',
    'string.empty': 'nickname을 입력해주세요.',
  }),
  password: joi.string().alphanum().min(8).max(20).messages({
    'string.min': 'password를 8글자 이상으로 작성해주세요.',
    'string.max': 'password를 20글자 이하으로 작성해주세요.',
    'string.empty': 'password를 입력해주세요.',
    'any.custom': '비번이랑 닉넴이랑 안맞아요',
    'any.invalid': 'password에 nickname이 포함되면 안됩니다.',
  }),
});

const createSignIn = joi.object({
  username: joi.string().alphanum().min(3).max(15).messages({
    'string.min': 'nickname를 3글자 이상으로 작성해주세요.',
    'string.max': 'nickname을 15글자 이하으로 작성해주세요.',
    'string.empty': 'nickname을 입력해주세요.',
  }),
  password: joi.string().alphanum().min(8).max(20).messages({
    'string.min': 'password를 8글자 이상으로 작성해주세요.',
    'string.max': 'password를 20글자 이하으로 작성해주세요.',
    'string.empty': 'password를 입력해주세요.',
  }),
});

<<<<<<< HEAD
export { createSignUp, createSignIn };
=======
const createMenus = joi.object({
  name: joi.string().messages({
    'string.empty': 'name을 적어주세요.',
    'string.base': 'name에는 문자만 적어주세요.',
  }),
  order: joi.number().messages({
    'string.empty': 'order를 적어주세요.',
    'string.base': 'order에는 숫자만 적어주세요.',
    'number.base': 'order에는 숫자만 적어주세요.',
  }),
  description: joi.string().messages({
    'string.empty': 'description을 적어주세요.',
    'string.base': 'description에는 문자만 적어주세요.',
  }),
  image: joi.string().messages({
    'string.empty': 'imageUrl을 적어주세요.',
    'string.base': 'imageUrl에는 문자만 적어주세요.',
  }),
  price: joi.number().min(1).messages({
    'number.min': '메뉴 가격은 0보다 작을 수 없습니다.',
    'number.base': 'price에는 숫자만 적어주세요.',
    'string.base': 'price에는 숫자만 적어주세요.',
    'string.empty': 'price를 적어주세요.',
  }),
  status: joi.string().valid('FOR_SALE', 'SOLD_OUT').messages({
    'any.only': "'FOR_SALE', 'SOLD_OUT' 둘 중 하나만 작성해주세요.",
  }),
});

const createCategories = joi.object({
  name: joi.string().messages({
    'string.base': 'name에는 문자만 입력해주세요.',
    'string.empty': 'name을 적어주세요.',
  }),
  order: joi.number(),
});

const createOrders = joi.object({
  menuId: joi.number(),
  quantity: joi.number().messages({
    'string.base': 'quantity 숫자만 입력해주세요.',
    'string.empty': 'quantity 적어주세요.',
  }),
  status: joi.string().valid('PENDING', 'ACCEPTED', 'CANCEL').messages({
    'any.only':
      '주문대기: PENDING, 접수완료: ACCEPTED, 주문취소: CANCEL 입니다. 세가지 중 하나만 적어주세요',
  }),
});

export {
  createSignUp,
  createSignIn,
  createMenus,
  createCategories,
  createOrders,
};
>>>>>>> 6db91f577553823053ffd5bae39150518afcaca5
