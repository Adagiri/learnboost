const { createEmailParam, sendEmail } = require('./mails');

module.exports.sendAccountActivationEmailForUser = async ({
  email,
  name,
  code,
}) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Boost</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f7f7f7;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .message {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .code {
            font-size: 24px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="message">Hi ${name}, please use the code below to activate your account:</div>
        <div class="code">${code}</div>
    </div>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Activate your account',
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.sendAccountActivationEmailForMarketer = async ({
  email,
  token,
}) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Learn Boost</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
            color: #555;
        }
        p {
            font-size: 16px;
            margin-bottom: 10px;
        }
        .reset-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        .reset-link:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Verify your email</h1>
        <p>Hello there,</p>
        <p>Please click the link below to verify your email</p>
        <p><a class="reset-link" style="color:#fff" href="${process.env.CLIENT_ADDRESS}/verify-email/${token}">Verify Email</a></p>
        <p>This link will expire in 10 minutes for security reasons.</p>
       <p>If the button above does not work, you can also click <a href="${process.env.CLIENT_ADDRESS}/verify-email/${token}" target="_blank">here</a>.</p>
    </div>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Activate your account',
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports.sendResetPasswordEmailForUser = async (email, code) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Boost</title>
</head>
<body>
    <p>Hi there,</p>
    <p>Please use the code below to reset your password. If you didn't initiate a password reset, kindly ignore this email.</p>
    <p><strong>Reset Code:</strong> ${code}</p>
    <p>Please be aware that this link will expire in 10 minutes.</p>
    <p>Best regards,<br>Your Learn Boost Team</p>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Reset your Password',
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error from activation email');
    throw error;
  }
};

module.exports.sendResetPasswordEmailForMarketer = async (email, token) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Learn Boost</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            color: #333;
            padding: 20px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h1 {
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
            color: #555;
        }
        p {
            font-size: 16px;
            margin-bottom: 10px;
        }
        .reset-link {
            display: inline-block;
            padding: 10px 20px;
            background-color: #007BFF;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
            transition: background-color 0.3s ease;
        }
        .reset-link:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Reset Your Password</h1>
        <p>Hello there,</p>
        <p>You recently requested to reset your password for your Learn Boost account. Click the link below to reset it. If you didn't make this request, you can ignore this email.</p>
        <p><a class="reset-link" style="color:#fff" href="${process.env.CLIENT_ADDRESS}/reset-password/${token}">Reset My Password</a></p>

         <p>If the button above does not work, you can also click <a href="${process.env.CLIENT_ADDRESS}/reset-password/${token}" target="_blank">here</a>.</p>
        <p>This link will expire in 10 minutes for security reasons.</p>
        <p>If you have any questions, feel free to <a href="mailto:support@learnbooost.com.ng">contact us</a>.</p>
        <p>Thank you, <br> The Learn Boost Team</p>
    </div>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(
      null,
      email,
      'Reset your Password',
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error from activation email');
    throw error;
  }
};

module.exports.sendWelcomeEmailForUser = async ({ name, email }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Learn Boost</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .container {
            text-align: center;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .welcome-heading {
            font-size: 24px;
            color: #333;
        }

        .welcome-message {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
        }

        #name {
            font-weight: bold;
            color: #0088cc; /* You can change this color to your preference */
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="welcome-heading">Welcome to Learn Boost</h1>
        <p class="welcome-message">Hello <span id="name">${name}</span>, we're excited to have you here!</p>
    </div>

</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(null, email, 'Welcome', message);
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending welcome message to user');
    throw error;
  }
};

module.exports.sendWelcomeEmailForMarketer = async ({ name, email }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Learn Boost</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .container {
            text-align: center;
            padding: 20px;
            background-color: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .welcome-heading {
            font-size: 24px;
            color: #333;
        }

        .welcome-message {
            font-size: 18px;
            color: #555;
            margin-top: 10px;
        }

        #name {
            font-weight: bold;
            color: #0088cc; /* You can change this color to your preference */
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="welcome-heading">Welcome to Learn Boost</h1>
        <p class="welcome-message">Hello <span id="name">${name}</span>, we're excited to have you here!</p>
        <p class="welcome-message">Please note that your account will soon be approved. Only then will you be able to log into your dashboard</p>
    </div>

</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(null, email, 'Welcome', message);
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending welcome message to user');
    throw error;
  }
};

module.exports.sendErrorToDeveloper = async ({ subject, error }) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learn Boost</title>
</head>
<body>
    <p>${error}</p>
</body>
</html>`;

  try {
    const emailArgs = createEmailParam(
      null,
      'learnsmart023@gmail.com',
      subject,
      message
    );
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending welcome message to user');
  }
};

module.exports.sendNotificationEmailToAUser = async ({
  subject,
  content,
  email,
}) => {
  const message = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Learn Boost Email</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #fff;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      text-align: center;
      color: #555;
    }
    p {
      font-size: 16px;
      margin-bottom: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Important Notification</h1>
    <p>${content}</p>
    <p>If you have any questions or need assistance, please feel free to <a href="mailto:support@learnboost.com.ng">contact us</a>. We're here to help!</p>
    <p>Best regards, <br> The Learn Boost Team</p>
  </div>
</body>
</html>
`;

  try {
    const emailArgs = createEmailParam(null, email, subject, message);
    await sendEmail(emailArgs);
  } catch (error) {
    console.log(error, 'error whilst sending welcome message to user');
  }
};
