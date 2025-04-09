const nodemailer = require("nodemailer");
const fs = require("fs");

const env = require("dotenv");
env.config(".env");
// async function SendMail() {
exports.SendMailBulk = async (users, subject, content) => {
   try {
 
     let transporter = nodemailer.createTransport({
       host: process.env.HOST,
       port: 587,
       secure: false, // true for 465, false for other ports
       auth: {
         user: process.env.USER_EMAIL, // generated ethereal user
         pass: process.env.PASSWORD, // generated ethereal password
       },
     });
 
     let info = await transporter.sendMail({
       from: process.env.FROM, // sender address
       to: users.join(", "), // list of receivers
       subject: subject, // Subject line
       html: content, // html body
     });
     console.log("chala", info);
     return info;
   } catch (err) {
     console.log(err);
     return err;
   }
 };
exports.SendMail = async (to, subject, message, type) => {
  try {
    let messageBody = await getEmailBodyRegistrationOtp(message);
    if (type == 2) {
      messageBody = await getEmailBodyResetPasswordOtp(message);
    }
    if (type == 3) {
      messageBody = await getEmailBodyAdminForgetPassward(message);
    }

    let transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.USER_EMAIL, // generated ethereal user
        pass: process.env.PASSWORD, // generated ethereal password
      },
    });

    console.log("transporter",transporter);
    console.log("from",process.env.FROM);
    console.log("process.env.USER_EMAIL",process.env.USER_EMAIL);
    console.log("PASSWORD",process.env.PASSWORD);
    let info = await transporter.sendMail({
      from: process.env.FROM, // sender address
      to: to, // list of receivers
      subject: subject, // Subject line
      html: messageBody, // html body
    });
    console.log(info);
    return info;
  } catch (err) {
    console.log(err);
    return err;
  }
};

const getEmailBodyRegistrationOtp = (otp) => {
  let emailBody = `<tbody>
   <tr>
      <td style="direction:ltr;font-size:0px;padding:20px 0;padding-left:15px;padding-right:15px;text-align:center;">
         <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
               <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                     <div style="font-size:24px;font-weight:bold;line-height:24px;text-align:center;color:#323232;"> Registration Email </div>
                  </td>
               </tr>
               <tr>
                  <td align="left" style="font-size:0px;padding:10px 25px 0px 25px;word-break:break-word;">
                     <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">We\'re happy to have you onboard in Travel Quota.</div>
                  </td>
               </tr>
            </table>
            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top; margin:30px 0px;" width="100%">
            
               <tr>
                  <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word;">
                     <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">
                        Your Email Verification One-time Password  
                        <p >${otp}</p>
                        <br/><br/> If you get any kind of problem while using Travel Quota then feel free to contact us on <a href="mailto:support@travelqota.com" title="Travel Quota Support">support@travelquota.com</a> 
                     </div>
                  </td>
               </tr>
            </table>
         </div>
      </td>
   </tr>
   <tr>
      <td style="font-size:0px;padding:10px 25px;word-break:break-word;">
         <p style="border-top:solid 1px #DFE3E8;font-size:1;margin:0px auto;width:100%;"></p>
      </td>
   </tr>
     </tbody>`;
  return emailBody;
};

const getEmailBodyResetPasswordOtp = (otp) => {
  let emailBody = `<tbody>
    <tr>
       <td style="direction:ltr;font-size:0px;padding:20px 0;padding-left:15px;padding-right:15px;text-align:center;">
          <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                <tr>
                   <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                      <div style="font-size:24px;font-weight:bold;line-height:24px;text-align:center;color:#323232;"> Reset Password </div>
                   </td>
                </tr>
                <tr>
                   <td align="left" style="font-size:0px;padding:10px 25px 0px 25px;word-break:break-word;">
                      <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">We received a request to reset your password.</div>
                   </td>
                </tr>
                <tr>
                   <td align="left" style="font-size:0px;padding:10px 25px 0px 25px;word-break:break-word;">
                      <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">Your OTP to reset the password for this session is </div>
                   </td>
                </tr>
             </table>
             <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top; margin:30px 0px;" width="100%">
                
                <tr>
                   <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word;">
                      <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">
                         <p style="font-size: 22px; color: #000000"> ${otp}</p>
                         <br/><br/> If you get any kind of problem while using Travel Quota then feel free to contact us on <a href="mailto:support@travelquota.com" title="Travel Quota Support">support@travelquota.com</a> 
                      </div>
                   </td>
                </tr>
             </table>
          </div>
       </td>
    </tr>
    <tr>
       <td style="font-size:0px;padding:10px 25px;word-break:break-word;">
          <p style="border-top:solid 1px #DFE3E8;font-size:1;margin:0px auto;width:100%;"></p>
       </td>
    </tr>
     </tbody>`;
  return emailBody;
};

const getEmailBodyAdminForgetPassward = async (body) => {
  let baseUrl = `${process.env.BaseUrl}admin/verify-email/`;
  console.log(baseUrl);
  let emailBody = `<tbody>
     <tr>
        <td style="direction:ltr;font-size:0px;padding:20px 0;padding-left:15px;padding-right:15px;text-align:center;">
           <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                 <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px;word-break:break-word;">
                       <div style="font-size:24px;font-weight:bold;line-height:24px;text-align:center;color:#323232;"> Reset Password Email </div>
                    </td>
                 </tr>
                 <tr>
                    <td align="left" style="font-size:0px;padding:10px 25px 0px 25px;word-break:break-word;">
                       <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">We\'re happy to have you onboard in Travel Quota.</div>
                    </td>
                 </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top; margin:30px 0px;" width="100%">
              
                 <tr>
                    <td align="left" style="font-size:0px;padding:0 25px;word-break:break-word;">
                       <div style="font-size:16px;font-weight:400;line-height:24px;text-align:left;color:#637381;">
                          Click on below link to reset your password  
                          <p style="font-size:20px;text-align:center;"><a href =${baseUrl}${body}> Click Here</a></p>
                          <br/><br/> If you get any kind of problem while using Travel Quota then feel free to contact us on <a href="mailto:support@travelquota.com" title="Travel Quota Support">support@travelquota.com</a> 
                       </div>
                    </td>
                 </tr>
              </table>
           </div>
        </td>
     </tr>
     <tr>
        <td style="font-size:0px;padding:10px 25px;word-break:break-word;">
           <p style="border-top:solid 1px #DFE3E8;font-size:1;margin:0px auto;width:100%;"></p>
        </td>
     </tr>
       </tbody>`;

  return emailBody;
};






exports.SendMailBooking = async (to, subject, message, pdfPath) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    // ✅ Define email options properly
    let mailOptions = {
      from: process.env.FROM, 
      to: to, 
      subject: subject, 
      html: message,
      attachments: pdfPath
        ? [
            {
              filename: "Flight_Ticket.pdf",
              path: pdfPath,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    // ✅ Send email once
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info);

    // ✅ Optionally delete the PDF file after sending
    if (pdfPath) {
      fs.unlink(pdfPath, (err) => {
        if (err) console.error("Error deleting PDF:", err);
        else console.log("PDF deleted after email sent.");
      });
    }

    return info;
  } catch (err) {
    console.error("Error sending email: ", err);
    return err;
  }
};
