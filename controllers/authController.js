// const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
// const { auth } = require('../config/config_firebase');
// const catchAsync = require('../middlewares/catchAsync');
// const jwt = require('jsonwebtoken');
// const { addUser, findUser, findUserByID } = require('../models/firebase');
// const CreateError = require('../middlewares/createError');
// const isProd = process.env.ENV === 'production';


// const generateToken = id =>
//     jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
//         expiresIn: process.env.JWT_EXPIRIES
//     });


// // const sendToken = (user, statusCode, res) => {
// //     const token = generateToken(user.id);

// //     const cookieOption = {
// //         expire: new Date(
// //             Date.now() + process.env.JWT_EXPIRIES * 24 * 60 * 60 * 1000),
// //         httpOnly: true,
// //         secure: true,
// //         sameSite: 'none'
// //     };

// //     res.cookie('jwtCookie', token, cookieOption);

// //     res.status(statusCode).json({
// //         status: 'success',
// //         token,
// //         data: {
// //             user
// //         }
// //     });
// // }

// // SỬA HÀM sendToken
// const sendToken = (user, statusCode, res) => {
//     const token = generateToken(user.id);

//     const cookieOption = {
//         httpOnly: true,
//         secure: isProd, // dev: false, prod: true (HTTPS)
//         sameSite: isProd ? 'none' : 'lax',
//         maxAge: 10 * 24 * 60 * 60 * 1000 // 10 ngày
//     };

//     res.cookie('jwtCookie', token, cookieOption);

//     res.status(statusCode).json({
//         status: 'success',
//         token,
//         data: { user }
//     });
// };

// exports.isLogin = async (req, res, next) => {
//     // console.log('cookie', req.cookies);

//     if (req.cookies.jwtCookie) {
//         try {
//             // 1) verify token
//             const decoded = await jwt.verify(req.cookies.jwtCookie, process.env.JWT_SECRET_KEY);

//             // 2) Check if user still exists
//             const currentUser = await findUserByID(decoded.id)
//             if (!currentUser) {
//                 return next();
//             }
//             // console.log(currentUser);

//             // THERE IS A LOGGED IN USER
//             res.locals.user = currentUser;
//             req.user = currentUser;
//             return next();
//         } catch (err) {
//             return next();
//         }
//     }
//     next();
// };

// // exports.logout = (req, res) => {
// //     res.cookie('jwtCookie', 'out', {
// //         expire: new Date(Date.now() - 10 * 1000), //10 is 10 seconds
// //         httpOnly: true,
// //         secure: true,
// //         sameSite: 'none'
// //     });
// //     res.status(200).json({
// //         status: 'success'
// //     });
// // }

// // SỬA logout (xóa cookie đúng cách)
// exports.logout = (req, res) => {
//     res.cookie('jwtCookie', '', {
//         httpOnly: true,
//         secure: isProd,
//         sameSite: isProd ? 'none' : 'lax',
//         expires: new Date(0)
//     });
//     res.status(200).json({ status: 'success' });
// };


// exports.login = catchAsync(async (req, res, next) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({
//             status: 'fail',
//             message: "Please provide email and password!"
//         })
//     }

//     signInWithEmailAndPassword(auth, email, password)
//         .then(async (cred) => {

//             const user = await findUser(email);
//             // console.log(user.id);

//             sendToken(user, 201, res)

//         })
//         .catch((error) => {
//             return res.status(401).json({
//                 status: 'fail',
//                 message: 'Invalid email or password'
//             })
//         });
// })

// exports.signup = catchAsync(async (req, res) => {
//     const { name, email, password } = req.body;
//     try {

//         await createUserWithEmailAndPassword(auth, email, password);

//         await addUser(name, email);

//         const user = {
//             name,
//             email
//         }

//         sendToken(user, 201, res);
//     } catch (error) {
//         const errorCode = error.code;
//         const errorMessage = error.message;

//         res.status(404).json({
//             status: 'fail',
//             errorMessage
//         });
//     }
// })

// exports.requireAuth = (req, res, next) => {
//     if (!req.user) {
//         return res.status(401).json({
//             status: 'fail',
//             message: 'Vui lòng đăng nhập'
//         });
//     }
//     next();
// };

// exports.me = (req, res) => {
//     if (!req.user) {
//         return res.status(401).json({ status: 'fail', message: 'Chưa đăng nhập' });
//     }
//     res.status(200).json({ status: 'success', data: req.user });
// };


const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = require('firebase/auth');
const { auth } = require('../config/config_firebase');
const catchAsync = require('../middlewares/catchAsync');
const jwt = require('jsonwebtoken');
const { addUser, findUser, findUserByID } = require('../models/firebase');

const isProd = process.env.ENV === 'production';

const generateToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRIES || '10d'
  });

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user.id);

  const cookieOption = {
    httpOnly: true,
    secure: isProd,                 // dev: false, prod: true (HTTPS)
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 10 * 24 * 60 * 60 * 1000 // 10 ngày
  };

  res.cookie('jwtCookie', token, cookieOption);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

exports.isLogin = async (req, res, next) => {
  if (req.cookies.jwtCookie) {
    try {
      const decoded = await jwt.verify(req.cookies.jwtCookie, process.env.JWT_SECRET_KEY);
      const currentUser = await findUserByID(decoded.id);
      if (!currentUser) return next();
      res.locals.user = currentUser;
      req.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'fail', message: 'Vui lòng đăng nhập' });
  }
  next();
};

exports.logout = (req, res) => {
  res.cookie('jwtCookie', '', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ status: 'success' });
};

exports.login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ status: 'fail', message: 'Please provide email and password!' });

    signInWithEmailAndPassword(auth, email, password)
        .then(async () => {
        const user = await findUser(email);
        if (!user) return res.status(401).json({ status: 'fail', message: 'User not found in DB' });
        sendToken(user, 200, res);
        })
        .catch(() => res.status(401).json({ status: 'fail', message: 'Invalid email or password' }));
});

exports.signup = catchAsync(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ status: 'fail', message: 'Please provide name, email, password' });
    }
    try {
        await createUserWithEmailAndPassword(auth, email, password);
        const id = await addUser(name, email); // LẤY id từ Firestore
        const user = { id, name, email };      // Trả về có id để JWT hợp lệ
        sendToken(user, 201, res);
    } catch (error) {
        res.status(400).json({ status: 'fail', message: error.message });
    }
});

exports.me = (req, res) => {
    if (!req.user) return res.status(401).json({ status: 'fail', message: 'Chưa đăng nhập' });
    res.status(200).json({ status: 'success', data: req.user });
};