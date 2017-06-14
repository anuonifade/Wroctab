import jwt from 'jsonwebtoken';
import util from 'util';

import model from '../../models/';
import Helpers from '../../helper/Helper';

const User = model.Users;
const Documents = model.Documents;
const Roles = model.Roles;
const secret = process.env.SECRET || 'thisisasimplesecretkey';

export default {
  create(req, res) {
    return User
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then((user) => {
        if (user) {
          return res.status(409).send({ message: 'User Already Exists' });
        }
        User.roleId = req.body.roleId || 2;
        User
          .create(req.body)
          .then((newUser) => {
            const token = jwt.sign({
              data:
              { id: newUser.id,
                name: newUser.name,
                username: newUser.username,
                email: newUser.email,
                roleId: newUser.roleId }
            }, secret, {
              expiresIn: '24h' // expires in 24 hours
            });
            return res.status(201).send({
              newUser, message: 'User created successfully', token });
          })
          .catch(error => res.status(400).send({
            message: `Error creating ${req.body.name}` }));
      });
  },

  list(req, res) {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const nextOffset = offset + limit;
    const previousOffset = (offset - limit < 1) ? 0 : offset - limit;
    return User
      .findAll()
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'No User Found' });
        }
        const meta = {
          limit,
          next: util.format('?limit=%s&offset=%s', limit, nextOffset),
          offset,
          previous: util.format(
            '?limit=%s&offset=%s', limit, previousOffset),
          total_count: user.length
        };
        const result = Helpers.getPaginatedItems(user, offset, limit);
        return res.status(200).send({
          user: result, pagination: meta });
      })
      .catch(error => res.status(400).send({
        message: 'Error retrieving users' }));
  },

  retrieve(req, res) {
    if (req.params.id && isNaN(req.params.id)) {
      return res.status(400).send({
        message: 'Only integer id expected'
      });
    }
    return User
      .findById(req.params.id, {
        include: [
          {
            model: Documents,
            as: 'documents'
          }
        ]
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'User Not Found' });
        }
        return res
          .status(200)
          .send({ user });
      })
      .catch(error => res.status(400).send({
        error, message: 'Error occurred while retrieving user' }));
  },

  update(req, res) {
    if (req.params.id && isNaN(req.params.id)) {
      return res.status(400).send({
        message: 'Error updating user'
      });
    }
    Roles.findById(req.decoded.data.roleId)
    .then(() => {
      if (Helpers.isAdmin(req, res)
        || Helpers.isOwner(req, res)) {
        return User
          .find({ where: {
            id: req.params.id } })
            .then((user) => {
              if (!user) {
                return res.status(404).send({ message: 'User Not Found' });
              }
              return user
              .update({
                name: req.body.name || user.name,
                username: req.body.username || user.username,
                email: req.body.email || user.email,
                password: req.body.password || user.password,
                roleId: req.body.roleId || user.roleId
              })
                .then(updatedUser => res
                  .status(200).send({ updatedUser,
                    message: 'User updated successfully',

                  }));
            })
            .catch(error => res.status(400).send({
              error, message: 'Error updating user' }));
      }
      return (res.status(403)
         .send({ message: 'Unauthorized Access' }));
    });
  },

  destroy(req, res) {
    if (req.params.id && isNaN(req.params.id)) {
      return res.status(400).send({
        message: 'Error deleting user'
      });
    }
    Roles.findById(req.decoded.data.roleId)
    .then(() => {
      if (Helpers.isAdmin(req, res) || Helpers.isOwner(req, res)) {
        return User
          .find({
            where: {
              id: req.params.id
            }
          })
          .then((user) => {
            if (!user) {
              return res.status(404).send({ message: 'User Not Found' });
            }
            if (user.username === 'superadmin') {
              return res.status(403)
                .send({ message: 'You cannot delete the super admin' });
            }
            return user
              .destroy()
              .then(() => res.status(200).send({
                message: `${user.name} deleted successfully` }));
          })
          .catch(error => res.status(400).send({
            error, message: 'Error deleting user' }));
      }
      return (res.status(403)
         .send({ message: 'Unauthorized Access' }));
    });
  },

  findUserDocuments(req, res) {
    if (req.params.id && isNaN(req.params.id)) {
      res.status(400)
        .send({ message: 'Error occurred while retrieving user document' });
    }
    return User
      .findById(req.params.id, {
        include: [
          {
            model: Documents,
            as: 'documents'
          }
        ] })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'User Not Found' });
        }
        return res.status(200).send({ doc: user.documents, status: true });
      })
      .catch(error => res.status(400).send({
        error, message: 'Error occurred while retrieving user document' }));
  },

  getExistingUser(req, res) {
    return User
      .find({
        where: {
          $or: [
            { email: req.params.identifier
            }, {
              username: req.params.identifier
            }
          ]
        }
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'User Not Found' });
        }
        return res
          .status(200)
          .send({ user });
      })
      .catch(error => res.status(400).send({
        error, message: 'Error occurred while retrieving user' }));
  },

  getAllUsers(req, res) {
    return User
      .findAll()
      .then((user) => {
        if (!user) {
          return res.status(404).send({ message: 'No Users Found' });
        }
        return res.status(200).send({ user });
      })
      .catch(error => res.status(400).send({
        error, message: 'Error retrieving users' }));
  }
};
