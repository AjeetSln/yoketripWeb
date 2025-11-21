import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './footer';
import './AllBlogsScreen.css';

const AllBlogsScreen = (props) => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(9);
  const navigate = useNavigate();
  const baseUrl = "https://yoketrip.in";

  const { isLoggedIn, setIsLoggedIn, handleNavClick, toggleDrawer, handleLogout, isChatRoute } = props;

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/blog/Allblogs`);
      
      if (response.status === 200) {
        const data = response.data;
        const blogsData = data.blogs || data.data || data;
        setBlogs(Array.isArray(blogsData) ? blogsData : []);
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get current blogs for pagination
  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;
  const currentBlogs = blogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Next page
  const nextPage = () => {
    if (currentPage < Math.ceil(blogs.length / blogsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const navigateToBlogDetail = (blog) => {
    const titleSlug = blog.title
      ? blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      : 'blog';
    navigate(`/blog/${blog._id || blog.id}/${titleSlug}`);
  };

  // Default travel images array for fallback
  const defaultTravelImages = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&h=250&fit=crop',
    'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=400&h=250&fit=crop'
  ];

  const getBlogImage = (blog, index) => {
    if (blog.imageUrl && blog.imageUrl !== 'null' && blog.imageUrl !== 'undefined') {
      return blog.imageUrl;
    }
    // Fallback to default travel images
    return defaultTravelImages[index % defaultTravelImages.length];
  };

  // Generate page numbers
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(blogs.length / blogsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <Header {...props} />
      <div className="all-blogs-screen">
        {/* Hero Section */}
        <div className="blogs-hero-section">
          <div className="container">
            <h1 className="blogs-main-title">Travel Blogs & Stories</h1>
            <p className="blogs-subtitle">
              Discover inspiring travel experiences, tips, and adventures from fellow travelers
            </p>
          </div>
        </div>

        <div className="blogs-container">
          {isLoading ? (
            <div className="blogs-loading-container">
              <div className="spinner-large"></div>
              <p>Loading travel blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="blogs-empty-state">
              <i className="material-icons">article</i>
              <p>No travel blogs found</p>
              <p className="empty-subtext">Check back later for new travel stories</p>
            </div>
          ) : (
            <>
              <div className="blogs-grid">
                {currentBlogs.map((blog, index) => (
                  <div key={blog._id || blog.id || index} className="blog-card">
                    <div className="blog-image-wrapper">
                      <img 
                        src={getBlogImage(blog, index)} 
                        alt={blog.title || 'Travel Blog'}
                        className="blog-image"
                        loading="lazy"
                      />
                      <div className="blog-overlay">
                        <div className="blog-category-tag">Travel</div>
                      </div>
                    </div>
                    
                    <div className="blog-content">
                      <div className="blog-meta">
                        <span className="blog-date">
                          <i className="material-icons">calendar_today</i>
                          {formatDate(blog.createdAt) || 'Recent'}
                        </span>
                        <span className="blog-read-time">
                          <i className="material-icons">schedule</i>
                          5 min read
                        </span>
                      </div>
                      
                      <h3 className="blog-title">{blog.title || 'Amazing Travel Experience'}</h3>
                      
                      <p className="blog-description">
                        {blog.description && blog.description.length > 100 
                          ? `${blog.description.substring(0, 100)}...` 
                          : blog.description || 'Discover this incredible travel journey filled with adventure and beautiful memories.'
                        }
                      </p>
                      
                      <div className="blog-footer">
                        <button 
                          className="read-more-btn"
                          onClick={() => navigateToBlogDetail(blog)}
                        >
                          <span>Read Story</span>
                          <i className="material-icons">arrow_forward</i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pageNumbers.length > 1 && (
                <div className="pagination-container">
                  <div className="pagination">
                    <button 
                      className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
                      onClick={prevPage}
                      disabled={currentPage === 1}
                    >
                      <i className="material-icons">chevron_left</i>
                      Previous
                    </button>
                    
                    <div className="pagination-numbers">
                      {pageNumbers.map(number => (
                        <button
                          key={number}
                          className={`pagination-number ${currentPage === number ? 'active' : ''}`}
                          onClick={() => paginate(number)}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    
                    <button 
                      className={`pagination-btn ${currentPage === pageNumbers.length ? 'disabled' : ''}`}
                      onClick={nextPage}
                      disabled={currentPage === pageNumbers.length}
                    >
                      Next
                      <i className="material-icons">chevron_right</i>
                    </button>
                  </div>
                  
                  <div className="pagination-info">
                    Showing {indexOfFirstBlog + 1}-{Math.min(indexOfLastBlog, blogs.length)} of {blogs.length} blogs
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllBlogsScreen;