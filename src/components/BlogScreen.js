import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './footer';
import './BlogScreen.css';

const BlogScreen = (props) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const baseUrl = "https://yoketrip.in";

  useEffect(() => {
    fetchBlogPosts();
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

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const fetchBlogPosts = async () => {
    setIsLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`${baseUrl}/api/blog/userblogs`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = response.data.data;
        setBlogPosts(data.map(post => ({
          id: post._id,
          title: post.title,
          description: post.description,
          imageUrl: post.imageUrl,
          authorName: post.user?.full_name,
          createdAt: post.createdAt
        })));
      }
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to load blog posts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select a valid image file' }));
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!image) newErrors.image = 'Image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    const token = getAuthToken();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', image);

    try {
      const response = await axios.post(`${baseUrl}/api/blog`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setTitle('');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';
        fetchBlogPosts();
        alert('Blog post created successfully!');
      }
    } catch (error) {
      console.error('Failed to add blog post:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to add blog post. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;

    try {
      const token = getAuthToken();
      await axios.delete(`${baseUrl}/api/blog/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      fetchBlogPosts();
      alert('Blog post deleted successfully!');
    } catch (error) {
      console.error('Failed to delete blog post:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Failed to delete blog post');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const navigateToDetail = (post) => {
    navigate(`/blog/${post.id}`);
  };

  return (
    <>
      <Header
        {...props}
      />
      <div className="blog-screen">
        <div className="blog-container">
          {/* Create Blog Form */}
          <div className="blog-form-card">
            <div className="blog-form-header">
              <h2>Create Blog</h2>
            </div>
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-group">
                <label htmlFor="title">Title *</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  className={errors.title ? 'error' : ''}
                  placeholder="Enter blog title"
                  maxLength={100}
                />
                {errors.title && <span className="error-text">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrors(prev => ({ ...prev, description: '' }));
                  }}
                  className={errors.description ? 'error' : ''}
                  rows="6"
                  placeholder="Enter blog description"
                  maxLength={1000}
                />
                <div className="char-count">
                  {description.length}/1000 characters
                </div>
                {errors.description && <span className="error-text">{errors.description}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="image">Image *</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={errors.image ? 'error' : ''}
                />
                <small className="file-hint">Supported formats: JPG, PNG, GIF. Max size: 5MB</small>
                {errors.image && <span className="error-text">{errors.image}</span>}
                
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImage(null);
                        setImagePreview(null);
                        setErrors(prev => ({ ...prev, image: '' }));
                        const fileInput = document.getElementById('image');
                        if (fileInput) fileInput.value = '';
                      }}
                    >
                      <i className="material-icons">close</i>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => document.getElementById('image').click()}
                  disabled={isSubmitting}
                  className="btn-secondary"
                >
                  <i className="material-icons">photo_library</i>
                  Select Image
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="material-icons">upload</i>
                      Create Blog Post
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* My Blogs Section */}
          <div className="my-blogs-section">
            <h2>My Blogs</h2>
            
            {isLoading ? (
              <div className="loading-container">
                <div className="spinner-large"></div>
                <p>Loading your blogs...</p>
              </div>
            ) : blogPosts.length === 0 ? (
              <div className="no-blogs">
                <i className="material-icons">article</i>
                <p>No blogs found. Create your first blog post!</p>
              </div>
            ) : (
              <div className="blogs-grid">
                {blogPosts.map((post) => (
                  <div key={post.id} className="blog-card">
                    <div className="blog-card-content">
                      <div 
                        className="blog-image"
                        onClick={() => navigateToDetail(post)}
                      >
                        {post.imageUrl ? (
                          <img src={post.imageUrl} alt={post.title} />
                        ) : (
                          <div className="blog-image-placeholder">
                            <i className="material-icons">image</i>
                          </div>
                        )}
                      </div>
                      <div className="blog-info">
                        <h3 
                          className="blog-title"
                          onClick={() => navigateToDetail(post)}
                        >
                          {post.title}
                        </h3>
                        <p className="blog-date">
                          <i className="material-icons">calendar_today</i>
                          Posted on: {formatDate(post.createdAt)}
                        </p>
                        {post.authorName && (
                          <p className="blog-author">
                            <i className="material-icons">person</i>
                            By: {post.authorName}
                          </p>
                        )}
                      </div>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(post.id)}
                        title="Delete blog post"
                      >
                        <i className="material-icons">delete</i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BlogScreen;