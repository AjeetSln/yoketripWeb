export class TripModel {
  constructor({
    id,
    images,
    tripName,
    views,
    likes,
    budget,
    totalPeople,
    full_name,
    userid,
    profilePic,
    category,
    travellerType,
    description,
    activities,
    inclusions,
    exclusions,
    start,
    end,
    stops,
    itinerary,
    createdAt,
    duration,
    firstImage,
  }) {
    this.id = id;
    this.images = images || [];
    this.tripName = tripName || '';
    this.views = views || 0;
    this.likes = likes || 0;
    this.budget = budget || 0;
    this.totalPeople = totalPeople || 0;
    this.full_name = full_name || '';
    this.userid = userid || '';
    this.profilePic = profilePic || '';
    this.category = category || '';
    this.travellerType = travellerType || '';
    this.description = description || '';
    this.activities = activities || '';
    this.inclusions = inclusions || [];
    this.exclusions = exclusions || [];
    this.start = start || {};
    this.end = end || {};
    this.startlocation = start?.location || '';
    this.endlocation = end?.location || '';
    this.startTime = start?.dateTime || '';
    this.endTime = end?.dateTime || '';
    this.stops = stops || [];
    this.itinerary = itinerary || [];
    this.createdAt = createdAt || '';
    this.duration = duration || '';
    this.firstImage = firstImage || (images && images.length > 0 ? images[0] : null);
  }

  static fromJson(json) {
    return new TripModel({
      id: json._id || json.id,
      images: json.images || [],
      tripName: json.tripName,
      views: json.views || 0,
      likes: json.likes || 0,
      budget: json.budget || 0,
      totalPeople: json.totalPeople || 0,
      full_name: json.full_name || '',
      userid: json.userid || '',
      profilePic: json.profilePic || '',
      category: json.category || '',
      travellerType: json.travellerType || '',
      description: json.description || '',
      activities: json.activities || '',
      inclusions: json.inclusions || [],
      exclusions: json.exclusions || [],
      start: json.start || {},
      end: json.end || {},
      stops: json.stops || [],
      itinerary: json.itinerary || [],
      createdAt: json.createdAt || '',
      duration: json.duration || '',
      firstImage: json.images && json.images.length > 0 ? json.images[0] : null,
    });
  }
}