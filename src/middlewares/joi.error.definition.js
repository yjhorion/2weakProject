import joi from 'joi';

// const checkPassword = function (value, options) {
//   const nickname = options.context;
//   console.log('닉넴', nickname);
//   console.log('옵션', options); // context가 있는데 왜 못받아오지?
//   console.log('옵션안의 콘텍스트', options[context]); //여기만 내려와도 undefined가 되어버림
//   console.log('옵션안의 콘텍스트 안의 닉넴', options.context.nickname);
//   if (value.includes(nickname)) {
//     return console.log('나왔다!!');
//     // return helpers.error('any.custom');
//   }
//   return value;
// };

const createSignUp = joi.object({
  nickname: joi.string().alphanum().min(3).max(15).messages({
    'string.min': 'nickname를 3글자 이상으로 작성해주세요.',
    'string.max': 'nickname을 15글자 이하으로 작성해주세요.',
    'string.empty': 'nickname을 입력해주세요.',
  }),
  password: joi
    .string()
    .alphanum()
    .min(8)
    .max(20)
    // .custom(checkPassword, 'any.custom') //1. 방법1 (계속 password에 nicckname이 포함되면 안된다고만 나옴)
    // .disallow(joi.ref('nickname')) //2. 방법2 (동일해야만 인식함)
    .messages({
      'string.min': 'password를 8글자 이상으로 작성해주세요.',
      'string.max': 'password를 20글자 이하으로 작성해주세요.',
      'string.empty': 'password를 입력해주세요.',
      'any.custom': '비번이랑 닉넴이랑 안맞아요',
      'any.invalid': 'password에 nickname이 포함되면 안됩니다.',
    }),
  type: joi.string().valid('OWNER', 'CUSTOMER').messages({
    'any.only': 'CUSTOMER와 OWNER 중 선택하여 입력해주세요.',
  }),
});

const createSignIn = joi.object({
  nickname: joi.string().alphanum().min(3).max(15).messages({
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

export { createSignUp, createSignIn, createMenus, createCategories };
