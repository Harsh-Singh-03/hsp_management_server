require('dotenv/config')

const mail_template = {
    forget_pass: (user, url) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reset Your Password</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
                    table {
                        border-collapse: collapse;
                    }
                    .container {
                        width: 100%;
                        padding: 20px;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: 50px auto;
                    }
                    .header {
                        background-color: #168f9f;
                        color: #ffffff;
                        text-align: center;
                        padding: 20px 0;
                    }
                    .header img {
                        max-width: 150px;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                    }
                    .content h1 {
                        font-size: 24px;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        background-color: #168f9f;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #666666;
                    }
                    @media only screen and (max-width: 600px) {
                        .container {
                            width: 100%;
                            margin: 20px 0;
                        }
                    }
                </style>
            </head>
            <body>
                <table class="container">
                    <tr>
                        <td class="header">
                            <h2>Hospitality</h2>
                            <h1>Password Reset Request</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h1>Hello, ${user.name}</h1>
                            <p>You recently requested to reset your password for your account. Click the button below to reset it.</p>
                            <p><a href="${url}" class="button" target="_blank">Reset Your Password</a></p>
                            <p>If you did not request a password reset, please ignore this email or reply to let us know.</p>
                            <p>Thanks,<br>Hospitality</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p>&copy; ${new Date().getFullYear()} Hospitality. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    },
    email_verification: (user, url) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
                    table {
                        border-collapse: collapse;
                    }
                    .container {
                        width: 100%;
                        padding: 20px;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: 50px auto;
                    }
                    .header {
                        background-color: #168f9f;
                        color: #ffffff;
                        text-align: center;
                        padding: 20px 0;
                    }
                    .header img {
                        max-width: 150px;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                    }
                    .content h1 {
                        font-size: 24px;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        background-color: #168f9f;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #666666;
                    }
                    @media only screen and (max-width: 600px) {
                        .container {
                            width: 100%;
                            margin: 20px 0;
                        }
                    }
                </style>
            </head>
            <body>
                <table class="container">
                    <tr>
                        <td class="header">
                            <h2>Hospitality</h2>
                            <h1>Verify your email</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h1>Hello, ${user.name}</h1>
                            <p>You recently created an account in Hospitality please verify your email to continue.</p>
                            <p><a href="${url}" class="button" target="_blank">Verify</a></p>
                            <p>If you did not created an account in Hospitality, please ignore this email or reply to let us know.</p>
                            <p>Thanks,<br>Hospitality</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p>&copy; ${new Date().getFullYear()} Hospitality. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    },
    support: (user, remarks) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reply To Your Query</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f4;
                        margin: 0;
                        padding: 0;
                        -webkit-text-size-adjust: 100%;
                        -ms-text-size-adjust: 100%;
                    }
                    table {
                        border-collapse: collapse;
                    }
                    .container {
                        width: 100%;
                        padding: 20px;
                        background-color: #ffffff;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        max-width: 600px;
                        margin: 50px auto;
                    }
                    .header {
                        background-color: #168f9f;
                        color: #ffffff;
                        text-align: center;
                        padding: 20px 0;
                    }
                    .header img {
                        max-width: 150px;
                        margin-bottom: 10px;
                    }
                    .content {
                        padding: 20px;
                        color: #333333;
                    }
                    .content h1 {
                        font-size: 24px;
                    }
                    .content p {
                        font-size: 16px;
                        line-height: 1.6;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        background-color: #168f9f;
                        color: #ffffff !important;
                        text-decoration: none;
                        border-radius: 5px;
                        font-size: 16px;
                    }
                    .footer {
                        text-align: center;
                        padding: 20px;
                        font-size: 12px;
                        color: #666666;
                    }
                    @media only screen and (max-width: 600px) {
                        .container {
                            width: 100%;
                            margin: 20px 0;
                        }
                    }
                </style>
            </head>
            <body>
                <table class="container">
                    <tr>
                        <td class="header">
                            <h2>Hospitality</h2>
                            <h1>Reply To Your Query</h1>
                        </td>
                    </tr>
                    <tr>
                        <td class="content">
                            <h1>Hello, ${user.name}</h1>
                            <p>${user.query}</p>
                            <h4>Reply :</h4>
                            <p>${remarks}</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="footer">
                            <p>&copy; ${new Date().getFullYear()} Hospitality. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `;
    },
    patient_appointment: (user, appointmentDetails, doctor, text) => {
        const date = appointmentDetails?.from || appointmentDetails?.createdAt || null
        const appointmentTime = date ? date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // For AM/PM format
        }) : null;
        console.log(appointmentTime)
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Request Success</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                padding: 20px;
                background-color: #ffffff;
                max-width: 600px;
                margin: 50px auto;
              }
              .header {
                background-color: #168f9f;
                color: #ffffff;
                text-align: center;
                padding: 20px;
              }
              .content {
                padding: 20px;
                color: #333333;
              }
              .content h1 {
                font-size: 24px;
              }
              .content p {
                font-size: 16px;
                line-height: 1.6;
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666666;
              }
             .content ul li {
                font-size: 16px;
                margin-bottom: 10px;
            }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Hospitality</h2>
                <h1>Appointment Request Success</h1>
              </div>
              <div class="content">
                <h1>Hello, ${user.name}</h1>
                <p>${text}</p>
                <ul>
                  <li><strong>Ref:</strong> ${appointmentDetails?.ref}</li>
                  ${date && (
                `<li><strong>Date:</strong> ${date?.toDateString()}</li>`
            )}
                  ${appointmentTime && (
                `<li><strong>Time:</strong> ${appointmentTime}</li>`
            )}
                  <li><strong>Status:</strong> ${appointmentDetails?.status}</li>
                  ${doctor && doctor?.name && (
                `<li><strong>Doctor:</strong> Dr. ${doctor?.name}</li>`
            )}
                  <li><strong>Reason:</strong>${appointmentDetails?.reason}</li>
                </ul>
                <p><a href="${process.env.DOMAIN}/#/patient" class="button" target="_blank">Access your panel</a></p>
                <p>If you need to reschedule or cancel, please contact us.</p>
                <p>Thank you for choosing Hospitality.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Hospitality. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;
    },
    doctor_appointment: (user, appointmentDetails, patient, text) => {
        const date = appointmentDetails?.from || appointmentDetails?.createdAt || null
        const appointmentTime = date ? date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // For AM/PM format
        }) : null;

        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Scheduled</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
              }
              .container {
                width: 100%;
                padding: 20px;
                background-color: #ffffff;
                max-width: 600px;
                margin: 50px auto;
              }
              .header {
                background-color: #168f9f;
                color: #ffffff;
                text-align: center;
                padding: 20px;
              }
              .content {
                padding: 20px;
                color: #333333;
              }
              .content h1 {
                font-size: 24px;
              }
              .content p {
                font-size: 16px;
                line-height: 1.6;
              }
              .content ul li {
                font-size: 16px;
                margin-bottom: 10px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                font-size: 12px;
                color: #666666;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2>Hospitality</h2>
                <h1>New appointment appointed</h1>
              </div>
              <div class="content">
                <h1>Hello, ${user.name}</h1>
                <p>${text}</p>
                <ul>
                  <li><strong>Ref:</strong> ${appointmentDetails?.ref}</li>
                  ${date && (
                `<li><strong>Date:</strong> ${date?.toDateString()}</li>`
            )}
                  ${appointmentTime && (
                `<li><strong>Time:</strong> ${appointmentTime}</li>`
            )}
                  <li><strong>Status:</strong> ${appointmentDetails?.status}</li>
                  ${patient && patient?.name && (
                `<li><strong>Patient:</strong> Dr. ${patient?.name}</li>`
            )}
                  <li><strong>Reason:</strong>${appointmentDetails?.reason}</li>
                </ul>
                <p><a href="${process.env.DOMAIN}/#/doctor" class="button" target="_blank">Access your panel</a></p>
                <p>If you need to reschedule or cancel, please contact us.</p>
                <p>Thank you from Hospitality.</p>
              </div>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Hospitality. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;
    },


};

module.exports = mail_template;