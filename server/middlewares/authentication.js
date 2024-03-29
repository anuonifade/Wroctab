import jwt from 'jsonwebtoken';
import model from '../models/';

const secret = process.env.SECRET || 'thisisasimplesecretkey';

export default {
  verifyToken(req, res, next) {
    const token = req.headers.authorization ||
      req.headers['x-access-token'];
    if (!token) {
      return res.status(401)
        .send({ message: 'Not Authorized' });
    }

    jwt.verify(token, secret, (error, decoded) => {
      if (error) {
        return res.status(401)
          .send({ message: 'Invalid Token' });
      }

      req.decoded = decoded;
      next();
    });
  },

  adminAccess(req, res, next) {
    model.Roles.findById(req.decoded.data.roleId)
      .then((foundRole) => {
        if (foundRole.title.toLowerCase() === 'administrator') {
          next();
        } else {
          return res.status(403)
            .send({ message: 'User is unauthorized for this request.' });
        }
      })
      .catch(error => res.status(400).send({
        err: error,
        message: 'Error authenticating'
      }));
  },
};
