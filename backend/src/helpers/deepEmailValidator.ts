import validate from 'deep-email-validator';

async function verifyEmail(emailAddress: string) {
  const result = await validate({
    email: emailAddress,
    validateRegex: true,
    validateMx: true,
    validateTypo: true,
    validateDisposable: true,
    validateSMTP: false,
  });

  return result;
}

export default verifyEmail
