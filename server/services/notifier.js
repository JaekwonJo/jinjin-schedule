const nodemailer = require('nodemailer');
const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  NOTIFY_FROM,
  NOTIFY_TO
} = process.env;

let transporter = null;

function isEmailConfigured() {
  return SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && NOTIFY_FROM && NOTIFY_TO;
}

function ensureTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
}

async function sendDecisionNotification({ templateName, dayLabel, timeLabel, status, requestedBy, decidedBy }) {
  const mailer = ensureTransporter();
  const subject = `[진진영어] 수정 요청 ${status === 'approved' ? '승인' : '거절'} 안내`;
  const body = `안녕하세요 ${requestedBy}님\n\n` +
    `요청하신 시간표 변경이 ${status === 'approved' ? '승인' : '거절'}되었습니다.\n` +
    `템플릿: ${templateName}\n요일/시간: ${dayLabel} ${timeLabel}\n처리자: ${decidedBy}\n\n` +
    `학원 시스템에서 자세한 내용을 확인해 주세요.`;

  if (!mailer) {
    console.info('[Notifier] 이메일 설정이 없어 로그로 대체합니다.', { subject, body });
    return;
  }

  await mailer.sendMail({
    from: NOTIFY_FROM,
    to: NOTIFY_TO,
    subject,
    text: body
  });
}

module.exports = {
  sendDecisionNotification,
  isEmailConfigured
};
