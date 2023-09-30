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
</head>
<body>
    <p>Hi ${name}, please use the code below to activate your account.</p>
    <p>${code}</p>
</body>
</html>`;

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
</head>
<body>
    <p>Hi ${name}, please use the code below to activate your account.</p>
    <p>${code}</p>
</body>
</html>`;

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
    <p>Hi, please use the code below to reset your password. However, if you did not initiate a reset password request, please ignore this mail</p>
    <p>>${code}</a></p>
    <p>Please note that link expires in 10 minutes</p>
</body>
</html>`;

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
        <p><a class="reset-link" href="https://marketers.learnbooost.com.ng/reset-password/${token}">Reset My Password</a></p>
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
    <title>Learn Boost</title>
</head>
<body>
    <p>Hi ${name}, welcome to Learn Boost</p>
</body>
</html>`;

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
    <title>Learn Boost</title>
</head>
<body>
    <p>Hi ${name}, welcome to Learn Boost</p>
</body>
</html>`;

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
    <h1>Welcome to Learn Boost!</h1>
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
