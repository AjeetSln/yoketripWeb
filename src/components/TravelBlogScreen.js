import AllBlogsScreen from './AllBlogsScreen';

const TravelBlogScreen = (props) => {
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  return <AllBlogsScreen {...props} />;
};

export default TravelBlogScreen;  