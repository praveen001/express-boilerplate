import User from '../models/users';

export function login(req, res, next) {
  var user = new User({
    emal: 'test@test.com'
  });
  user.save();
  res.send('User saved');
}