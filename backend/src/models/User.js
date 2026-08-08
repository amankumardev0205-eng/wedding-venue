import bcrypt from 'bcryptjs';
import FirestoreModel from './FirestoreModel.js';

class User extends FirestoreModel {
  static collectionName = 'users';

  async matchPassword(enteredPassword) {
    if (!this.passwordHash) {
      return false;
    }
    return await bcrypt.compare(enteredPassword, this.passwordHash);
  }

  async save() {
    if (this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(this.passwordHash, salt);
      Object.defineProperty(this, 'passwordHash', {
        value: hashed,
        enumerable: false,
        writable: true,
        configurable: true,
      });
    }
    return super.save();
  }
}

FirestoreModel.registerModel('users', User);

export default User;
