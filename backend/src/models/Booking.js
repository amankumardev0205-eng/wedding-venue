import FirestoreModel from './FirestoreModel.js';

class Booking extends FirestoreModel {
  static collectionName = 'bookings';
}

FirestoreModel.registerModel('bookings', Booking);

export default Booking;
