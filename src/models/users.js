import mongoose from 'mongoose';

var userSchema = new mongoose.Schema({
  email: String
});

export default mongoose.model('User', userSchema);