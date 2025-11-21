import React from 'react';
import ExploreScreen from './Explore';

const FindTravelPartnerScreen = (props) => {
  return (
    <>
      {/* Simple meta tags without Helmet */}
      <head>
        <title>Find Travel Partners | YokeTrip - Connect with Verified Travel Buddies</title>
        <meta name="description" content="Find verified travel partners and companions for your trips. Connect with like-minded travelers for safe and memorable journeys with YokeTrip." />
        <meta name="keywords" content="travel partners, find travel buddies, verified travelers, travel companions, YokeTrip" />
      </head>
      <ExploreScreen {...props} />
    </>
  );
};

export default FindTravelPartnerScreen;