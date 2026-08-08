# WedVenue — Product Requirements Document (PRD)

## Document Information

**Product Name:** WedVenue  
**Product Type:** Full-Stack Wedding Venue Discovery & Organizer Platform  
**Primary Users:** Customers, Venue Organizers, Admins  
**Status:** Active Development  
**Database:** Firebase Firestore  
**Storage:** Firebase Storage  

---

# 1. Product Overview

## 1.1 Vision

WedVenue is a modern wedding venue discovery platform that helps couples and families discover, filter, compare, shortlist, review, and send inquiries to wedding venues.

The platform also provides venue organizers with tools to manage their venue listings and inquiries, while administrators can moderate the platform and monitor overall activity.

## 1.2 Problem Statement

Finding the right wedding venue is often difficult because users:

- Need to search across multiple platforms
- Have difficulty comparing venues
- Need to stay within a specific budget
- Have different guest capacity requirements
- Need specific amenities
- Want to check ratings and reviews
- Need an easy way to contact venue organizers
- Want to save and compare shortlisted venues

Venue organizers also face challenges such as:

- Limited online visibility
- Manual inquiry management
- Difficulty managing venue listings
- Difficulty reaching potential customers

## 1.3 Solution

WedVenue provides a centralized platform where users can:

- Discover wedding venues
- Search and filter venues
- Explore venues using a map
- View complete venue information
- Save favorite venues
- Compare multiple venues
- Read and write reviews
- Send booking inquiries

Organizers can:

- Create and manage venue listings
- Upload venue images
- Manage venue information
- Receive and respond to inquiries
- Respond to customer reviews

Admins can:

- Manage users
- Manage organizers
- Moderate venues
- Moderate reviews
- Monitor platform analytics

---

# 2. Product Goals

## 2.1 Business Goals

- Build a scalable wedding venue marketplace
- Increase online visibility for venue organizers
- Simplify venue discovery
- Create a centralized venue discovery ecosystem
- Provide a foundation for future booking functionality

## 2.2 User Goals

Users should be able to:

- Find venues quickly
- Search by location
- Filter according to their requirements
- Compare multiple venues
- Save interesting venues
- Read reviews
- Contact organizers easily

## 2.3 Organizer Goals

Organizers should be able to:

- Create venue listings
- Manage venue information
- Upload venue images
- Receive inquiries
- Respond to inquiries
- Manage their listings from one dashboard

## 2.4 Admin Goals

Admins should be able to:

- Manage platform users
- Manage organizers
- Moderate venue listings
- Moderate reviews
- Monitor platform activity

---

# 3. Target Users

## 3.1 Customers

Couples, families, and individuals searching for wedding venues.

Typical requirements include:

- Location
- Budget
- Guest capacity
- Venue type
- Amenities
- Rating
- Reviews

## 3.2 Venue Organizers

Businesses and venue owners managing:

- Banquet halls
- Wedding lawns
- Resorts
- Hotels
- Palaces
- Gardens
- Event spaces

## 3.3 Administrators

Platform administrators responsible for:

- Moderation
- User management
- Organizer management
- Venue management
- Review moderation
- Analytics

---

# 4. User Roles

WedVenue supports three primary roles.

## 4.1 Customer

Customers can:

- Register/login
- Search venues
- Filter venues
- View venue details
- Save favorites
- Compare venues
- Submit reviews
- Send inquiries
- Track inquiries

## 4.2 Organizer

Organizers can:

- Register/login
- Create venues
- Edit venues
- Delete venues
- Upload images
- Manage amenities
- Manage pricing
- View inquiries
- Respond to inquiries
- Reply to reviews

## 4.3 Admin

Admins can:

- Manage users
- Manage organizers
- Moderate venues
- Moderate reviews
- View platform analytics

---

# 5. Customer Features

# 5.1 Authentication

Users should be able to:

- Register
- Login
- Logout
- Forgot password
- Reset password
- Maintain authenticated sessions

Authentication should use:

- JWT
- Secure password hashing
- Protected routes
- Role-based authorization

---

# 5.2 Homepage

The homepage should introduce WedVenue and help users quickly start venue discovery.

## Homepage Components

### Hero Section

Should contain:

- WedVenue branding
- Clear headline
- Supporting description
- Primary call-to-action
- Venue search functionality
- Wedding-focused visual

### Statistics

Display platform highlights such as:

- Number of venues
- Number of cities
- Number of customers
- Average rating

### Featured / Explore Venues

Display attractive venue cards containing:

- Venue image
- Venue name
- City
- Rating
- Capacity
- Starting price
- Favorite button
- View Details button

### Popular Wedding Destinations

Display popular cities/destinations such as:

- Jaipur
- Delhi
- Mumbai
- Bengaluru
- Udaipur
- Goa

Each destination should contain:

- Destination image
- City name
- Venue count
- Navigation to filtered venues

### How WedVenue Works

Explain the basic user journey:

1. Discover
2. Filter
3. Compare
4. Connect

### Testimonials

Display customer reviews/testimonials to increase trust.

### Organizer CTA

Encourage venue owners to join WedVenue.

Example:

> Own a wedding venue? List your venue on WedVenue.

### Footer

Include:

- Navigation
- Venue discovery
- Organizer links
- Contact
- Privacy
- Terms
- Copyright

---

# 6. Explore Venues Page

## 6.1 Objective

The Explore Venues page is the primary venue discovery interface.

Users should be able to search, filter, compare, favorite, and view venues from one page.

## 6.2 Search

Users should be able to search by:

- Venue name
- City

## 6.3 Filters

The page should support:

### Location

- State
- City
- Nearby location

### Venue

- Venue name
- Venue type

### Budget

- Maximum price

### Capacity

- Minimum capacity
- Maximum capacity

### Rating

- Minimum rating

### Amenities

Examples:

- Parking
- Pool
- Catering
- Stage
- Sound System
- Air Conditioning
- WiFi
- Accommodation

## 6.4 Nearby Search

Users should be able to search venues near a location.

Inputs may include:

- Latitude
- Longitude
- Search radius

A current-location option should be available where supported.

## 6.5 Search Results

Results should display:

- Number of matching venues
- Venue cards
- Map
- Grid/List view options

## 6.6 Venue Card

Each card should display:

- Venue image
- Venue name
- Location
- Rating
- Capacity
- Starting price
- Amenities
- Favorite button
- Compare button
- View Details button

## 6.7 Map

The Explore page should provide a map showing venue locations.

Map requirements:

- Venue markers
- Correct venue coordinates
- Map navigation
- Venue/result relationship
- Responsive behavior

---

# 7. Venue Details Page

Each venue should have a dedicated details page.

## Information

Display:

- Venue name
- Image gallery
- Location
- Description
- Venue type
- Capacity
- Pricing
- Amenities
- Ratings
- Reviews
- Map location
- Organizer information

## Actions

Users should be able to:

- Add to Favorites
- Add to Compare
- Send Inquiry
- View reviews

---

# 8. Favorites

Users can save venues for later.

## Requirements

Users should be able to:

- Add venue to favorites
- Remove venue from favorites
- View favorite venues
- See favorite count
- Maintain favorites across sessions

## Favorites Page

Should provide:

- Saved venue cards
- Empty state
- Remove option
- View Details
- Compare functionality

---

# 9. Compare Venues

Users should be able to compare selected venues.

## Maximum

Maximum recommended selection:

**4 venues**

## Comparison Fields

Compare:

- Venue name
- Location
- Price
- Capacity
- Rating
- Venue type
- Amenities
- Facilities

## Compare Page

Should provide a clear side-by-side comparison table.

---

# 10. Reviews & Ratings

## Customers

Customers can:

- Submit reviews
- Give ratings
- Edit their reviews
- Delete their reviews
- Mark reviews as helpful where supported

## Review Information

Reviews may contain:

- Rating
- Title
- Comment
- Customer name
- Verification status
- Date

## Organizer

Organizers can:

- Reply to reviews

## Verification

Customers with accepted inquiries may receive a verified reviewer indicator.

---

# 11. Booking Inquiry System

WedVenue uses an inquiry-based booking flow.

## Customer

Customers can submit:

- Event date
- Guest count
- Event type
- Message
- Venue

## Validation

The system should verify:

- Guest count does not exceed venue capacity
- Required fields are valid
- Event date is valid
- Venue is available where availability data exists

## Inquiry Status

Possible statuses:

```text
Pending
   ↓
Accepted / Rejected