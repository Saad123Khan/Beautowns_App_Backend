import nodemailer from "nodemailer";
import ejs from "ejs";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const email =async(email,OTP)=>{
  
  const data = {
    email: email,
    otp:OTP
  };
  const htmlText = await ejs.renderFile(
    `${__dirname}/template/html.ejs`,
    data
  );

  const mailOptions = {
        from: "sk5908774@gmail.com",
        to: email ,
        subject: "Otp Send By Beautowns",
        html: htmlText
    }
    
    let transport = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "sk5908774@gmail.com",
          pass: "otwduudpsiaonjaz",
        },
      });
      transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log(info?.response);
        }
      });
}
