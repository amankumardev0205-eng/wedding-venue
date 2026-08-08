import FirestoreModel from './FirestoreModel.js';

class Inquiry extends FirestoreModel {
  static collectionName = 'inquiries';
}

FirestoreModel.registerModel('inquiries', Inquiry);

export default Inquiry;
