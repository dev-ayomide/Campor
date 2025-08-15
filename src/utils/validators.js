import { RUN_EMAIL_REGEX } from './constants';

export function isValidEmail(email) {
  return RUN_EMAIL_REGEX.test(email);
}

export function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 6;
}
