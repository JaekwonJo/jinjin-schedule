const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const warnIfFallback = (key, fallback) => {
  console.warn(`⚠️  환경 변수 ${key}가 설정되지 않아 기본값(${fallback})을 사용합니다. 운영 배포 전에는 반드시 변경하세요.`);
};

const requiredEnv = (key, fallback = null, { allowEmpty = false } = {}) => {
  const value = process.env[key];
  if (value && value.trim() !== '') {
    return value;
  }
  if (fallback !== null) {
    warnIfFallback(key, fallback);
    return fallback;
  }
  if (allowEmpty) {
    return '';
  }
  throw new Error(`환경 변수 ${key}가 설정되어 있지 않아요. .env 파일을 확인해 주세요.`);
};

const JWT_SECRET = requiredEnv('JWT_SECRET', 'dev-secret-change-me');

const PASSWORD_SALT_ROUNDS = Number(process.env.PASSWORD_SALT_ROUNDS || '10');
if (!Number.isFinite(PASSWORD_SALT_ROUNDS) || PASSWORD_SALT_ROUNDS < 4) {
  throw new Error('PASSWORD_SALT_ROUNDS 값이 너무 작거나 잘못되었습니다. 최소 4 이상으로 설정해 주세요.');
}

const SUPERADMIN_USERNAME = requiredEnv('SUPERADMIN_USERNAME', 'admin');
const SUPERADMIN_PASSWORD = requiredEnv('SUPERADMIN_PASSWORD', 'admin1234');
const SUPERADMIN_DISPLAY_NAME = process.env.SUPERADMIN_DISPLAY_NAME || '최고 관리자';

module.exports = {
  JWT_SECRET,
  PASSWORD_SALT_ROUNDS,
  SUPERADMIN_USERNAME,
  SUPERADMIN_PASSWORD,
  SUPERADMIN_DISPLAY_NAME
};
