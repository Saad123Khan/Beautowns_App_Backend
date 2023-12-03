
import otpGenerator from "otp-generator";

export const generateRandomCode = (username) => {
  
  let OTP = otpGenerator.generate(8, {
    digits: true,
    upperCaseAlphabets: true,
    lowerCaseAlphabets: true,
    specialChars: true,
  });

    const formattedUsername = username.toLowerCase().replace(/\s/g, ''); // Convert to lowercase and remove spaces
    return `${formattedUsername}${OTP}`;
  };