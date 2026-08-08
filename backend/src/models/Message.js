import FirestoreModel from './FirestoreModel.js';

class Message extends FirestoreModel {
  static collectionName = 'messages';
}

FirestoreModel.registerModel('messages', Message);

export default Message;
