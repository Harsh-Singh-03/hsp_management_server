const mail_template = {
    forget_pass: ( user, url ) => {
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
    email_verification: ( user, url ) => {
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
    support: ( user, remarks ) => {
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
};

module.exports = mail_template;