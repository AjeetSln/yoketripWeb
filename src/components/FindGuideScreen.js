import GuideListingScreen from './GuideListingScreen';

const FindGuideScreen = (props) => {
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  return <GuideListingScreen {...props} />;
};

export default FindGuideScreen;  