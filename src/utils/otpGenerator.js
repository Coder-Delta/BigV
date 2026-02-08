import crypto from 'crypto';

/**
 * Generates a random OTP (One-Time Password) of specified length.
 * @param {number} length - The length of the OTP to be generated. Default is 6.
 * @returns {string} - The generated OTP as a string. **/

export const generateOTP = (length = 6) => {
  
  if (length < 4 || length > 8) {
    throw new Error('OTP length must be between 4 and 8');
  }
  const otp = crypto.randomInt(0, 10 ** length).toString().padStart(length, '0');
  return otp;
};