class Guide {
  constructor({
    id = '',
    userId = '',
    fullName = '',
    hide = false,
    profilePic = null,
    workLocation = '',
    price = 0.0,
    priceType = 'per day',
    languages = [],
    availability = Array(7).fill(false),
    about = '',
    isCertified = false,
    certificateUrl = null,
    rating = 0.0,
    reviewCount = 0,
    createdAt = new Date(),
    approval = 'pending'
  }) {
    this.id = id;
    this.userId = userId;
    this.fullName = fullName;
    this.hide = hide;
    this.profilePic = profilePic;
    this.workLocation = workLocation;
    this.price = price;
    this.priceType = priceType;
    this.languages = languages;
    this.availability = availability;
    this.about = about;
    this.isCertified = isCertified;
    this.certificateUrl = certificateUrl;
    this.rating = rating;
    this.reviewCount = reviewCount;
    this.createdAt = createdAt;
    this.approval = approval;
  }

  static fromMap(map) {
    try {
      let userId, fullName, profilePic;
      if (typeof map.userId === 'object' && map.userId) {
        userId = map.userId._id || '';
        fullName = map.userId.full_name || 'Unknown';
        profilePic = map.userId.profilePic || null;
      } else {
        userId = map.userId || '';
        fullName = map.fullName || 'Unknown';
        profilePic = map.profilePic || null;
      }

      return new Guide({
        id: map._id || map.id || '',
        userId,
        fullName,
        hide: map.hide || false,
        profilePic,
        workLocation: map.workLocation || '',
        price: parseFloat(map.price) || 0.0,
        priceType: map.priceType || 'per day',
        languages: Array.isArray(map.languages) ? map.languages : [],
        availability: Array.isArray(map.availability) ? map.availability : Array(7).fill(false),
        about: map.about || '',
        isCertified: map.isCertified || false,
        certificateUrl: map.certificateUrl || null,
        rating: parseFloat(map.rating) || 0.0,
        reviewCount: parseInt(map.reviewCount) || 0,
        createdAt: map.createdAt ? new Date(map.createdAt) : new Date(),
        approval: map.approval || 'pending'
      });
    } catch (e) {
      console.error('Error parsing Guide from map:', e);
      throw e;
    }
  }

  toMap() {
    return {
      _id: this.id,
      userId: this.userId,
      fullName: this.fullName,
      hide: this.hide,
      profilePic: this.profilePic,
      workLocation: this.workLocation,
      price: this.price,
      priceType: this.priceType,
      languages: this.languages,
      availability: this.availability,
      about: this.about,
      isCertified: this.isCertified,
      certificateUrl: this.certificateUrl,
      rating: this.rating,
      reviewCount: this.reviewCount,
      createdAt: this.createdAt.toISOString(),
      approval: this.approval
    };
  }

  copyWith(updates) {
    return new Guide({ ...this, ...updates });
  }
}