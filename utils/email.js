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

export const contactEmail =async(email,data)=>{
  
  const info = {
    name: data?.name,
    email: data?.email,
    phone: data?.phone,
    address: data?.address
  };

  const htmlText = await ejs.renderFile(
    `${__dirname}/template/htmlContact.ejs`,
    info
  );

  const mailOptions = {
        from: "sk5908774@gmail.com",
        to: email ,
        subject: "Salon requested OnBoard Beautowns",
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

const sendNotificationEmail = async (email,notification) => {
  
  const data = {
    email: email,
    notification: notification
  };
  const htmlText = await ejs.renderFile(
    `${__dirname}/template/notification.ejs`,
    data
  );

  
  const mailOptions = {   
    user: "sk5908774@gmail.com",   
    to: email,
    subject: notification?.title,
    html:htmlText
  
  };


  let transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "sk5908774@gmail.com",
      pass: "otwduudpsiaonjaz",
    },
    tls: {
      rejectUnauthorized: false
    }
  });
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
  });
};

export {sendNotificationEmail}