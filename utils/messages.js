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

module.exports.sendResetPasswordEmailForMarketer = async (email, code) => {
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


module.exports.sendWebhookErrorToDeveloper = async ({ subject, error }) => {
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
