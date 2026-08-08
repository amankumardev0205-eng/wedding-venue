import FirestoreModel from './FirestoreModel.js';
import Venue from './Venue.js';

class Review extends FirestoreModel {
  static collectionName = 'reviews';

  static async recalculateVenueRating(venueId) {
    if (!venueId) return;
    const reviews = await Review.find({ venue: venueId }).lean().exec();
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
      : 0;

    await Venue.findByIdAndUpdate(venueId, {
      $set: { rating: parseFloat(averageRating.toFixed(1)) },
    }, { new: true });
  }

  async save() {
    const result = await super.save();
    if (this.venue) {
      await Review.recalculateVenueRating(this.venue);
    }
    return result;
  }

  static async findByIdAndUpdate(id, update = {}, options = {}) {
    const result = await super.findByIdAndUpdate(id, update, options);
    if (result?.venue) {
      await Review.recalculateVenueRating(result.venue);
    }
    return result;
  }

  static async findByIdAndDelete(id) {
    const review = await super.findByIdAndDelete(id);
    if (review?.venue) {
      await Review.recalculateVenueRating(review.venue);
    }
    return review;
  }
}

FirestoreModel.registerModel('reviews', Review);

export default Review;
