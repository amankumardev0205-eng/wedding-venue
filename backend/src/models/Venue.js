import FirestoreModel from './FirestoreModel.js';

class Venue extends FirestoreModel {
  static collectionName = 'venues';

  constructor(data = {}) {
    super(data);
    this.unavailableDates = this.unavailableDates || [];
  }
}

FirestoreModel.registerModel('venues', Venue);

export default Venue;
