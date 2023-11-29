import joi from 'joi';

const createSignUp = joi.object({
  username: joi.string().alphanum().min(3).max(15).messages({
    'string.min': 'nickname를 3글자 이상으로 작성해주세요.',
    'string.max': 'nickname을 15글자 이하으로 작성해주세요.',
    'string.empty': 'nickname을 입력해주세요.',
    'string.alphanum': 'nickname에는 영어와 숫자만 작성해주세요.',
  }),
  password: joi.string().alphanum().min(6).max(20).messages({
    'string.min': 'password를 6글자 이상으로 작성해주세요.',
    'string.max': 'password를 20글자 이하으로 작성해주세요.',
    'string.empty': 'password를 입력해주세요.',
    'any.invalid': 'password에 nickname이 포함되면 안됩니다.',
    'string.alphanum': 'password에는 영어와 숫자만 작성해주세요.',
  }),
});

const createSignIn = joi.object({
  username: joi.string().alphanum().min(3).max(15).messages({
    'string.min': 'nickname를 3글자 이상으로 작성해주세요.',
    'string.max': 'nickname을 15글자 이하으로 작성해주세요.',
    'string.empty': 'nickname을 입력해주세요.',
    'string.alphanum': 'nickname에는 영어와 숫자만 작성해주세요.',
  }),
  password: joi.string().alphanum().min(6).max(20).messages({
    'string.min': 'password를 6글자 이상으로 작성해주세요.',
    'string.max': 'password를 20글자 이하으로 작성해주세요.',
    'string.empty': 'password를 입력해주세요.',
    'string.alphanum': 'password에는 영어와 숫자만 작성해주세요.',
  }),
});

export { createSignUp, createSignIn };
