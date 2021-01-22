const User = require('./../models/User');
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: '', password: '' };

  if (err.message === 'Incorrect email') {
    errors.email = 'This email is not registered.'
  }

  if (err.message === 'Incorrect password') {
    errors.password = 'This password is not correct.';
  }

  // Duplicate error code
  if (err.code === 11000) {
    errors.email = 'This email already registered.';
    return errors;
  }

  //Validation Errors
  if (err.message.includes('User validation faile')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
// Json web Token
const createToken = (id) => {
  return jwt.sign({ id }, 'jibran advani super secret', {
    expiresIn: maxAge
  });
}

exports.signup_get = (req, res) => {
  res.render('signup');
};

exports.login_get = (req, res) => {
  res.render('login');
};

exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

exports.login_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
};
