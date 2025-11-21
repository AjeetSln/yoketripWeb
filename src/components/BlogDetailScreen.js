import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';
import Footer from './footer';
import './BlogScreen.css';

const BlogDetailScreen = (props) => {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [showSocialOptions, setShowSocialOptions] = useState(false);
  const baseUrl = "https://yoketrip.in";

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${baseUrl}/api/blog/blogs/${id}`);
      
      if (response.data) {
        let blogData;
        
        if (response.data._id) {
          blogData = response.data;
        }
        else if (response.data.data && response.data.data._id) {
          blogData = response.data.data;
        }
        else if (response.data.success && response.data.data) {
          blogData = response.data.data;
        }
        else {
          blogData = response.data;
        }
        
        if (blogData && blogData._id) {
          setBlogPost({
            id: blogData._id,
            title: blogData.title,
            description: blogData.description,
            content: blogData.content || blogData.description,
            imageUrl: blogData.imageUrl,
            authorName: blogData.user?.full_name || blogData.authorName,
            createdAt: blogData.createdAt
          });
        } else {
          throw new Error('Invalid blog data structure');
        }
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Blog post not found.');
      } else if (error.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError('Failed to load blog post. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const options = { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
      };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to clean and format the blog content
  const formatBlogContent = (content) => {
    if (!content) return '';
    
    // Remove unwanted characters and fix common issues
    let cleanedContent = content
      .replace(/3m³a/g, '') // Remove 3m³a
      .replace(/at an afi/g, '') // Remove at an afi
      .replace(/bbc/g, '') // Remove bbc
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    return cleanedContent;
  };

  // Function to render formatted content with proper structure
  const renderFormattedContent = (content) => {
    const formattedContent = formatBlogContent(content);
    
    // Split into paragraphs and process each one
    const paragraphs = formattedContent.split('. ').filter(para => para.length > 10);
    
    return (
      <div className="blog-content-formatted">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="content-paragraph">
            {paragraph.trim()}.
          </p>
        ))}
        
        {/* Add engaging elements */}
        <div className="content-highlights">
          <div className="highlight-card">
            <h4>🏔️ About Spiti Valley</h4>
            <p>Spiti Valley is a cold desert mountain valley located high in the Himalayas in the north-eastern part of the Indian state of Himachal Pradesh.</p>
          </div>
          
          <div className="highlight-card">
            <h4>📍 Must Visit Places</h4>
            <ul>
              <li>Key Monastery - Ancient Tibetan Buddhist monastery</li>
              <li>Kaza - Main town and hub of Spiti</li>
              <li>Hikkim - World's highest post office</li>
              <li>Chandratal Lake - Beautiful crescent-shaped lake</li>
              <li>Kibber - One of the highest inhabited villages</li>
            </ul>
          </div>
          
          <div className="highlight-card">
            <h4>🌤️ Best Time to Visit</h4>
            <p><strong>Summer (May-October):</strong> Pleasant weather, all roads open<br/>
            <strong>Winter (Nov-April):</strong> Extreme cold, snow adventures</p>
          </div>
        </div>
      </div>
    );
  };

  const handleShareBlog = async () => {
    if (!blogPost) return;

    setIsSharing(true);
    try {
      const blogTitleSlug = blogPost.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);

      const finalUrl = `${window.location.origin}/blog/${id}/${blogTitleSlug}`;

      const shareData = {
        title: `YokeTrip - ${blogPost.title}`,
        text: `${blogPost.description.substring(0, 80)}...`,
        url: finalUrl,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        setShowSocialOptions(true);
      }
    } catch (error) {
      try {
        const blogTitleSlug = blogPost.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);
        const finalUrl = `${window.location.origin}/blog/${id}/${blogTitleSlug}`;
        await navigator.clipboard.writeText(finalUrl);
        alert('Blog link copied to clipboard!');
      } catch {
        alert('Failed to share blog. Please copy the URL manually.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Social Media Specific Share Functions
  const handleSocialShare = (platform) => {
    if (!blogPost) return;

    const blogTitleSlug = blogPost.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 60);

    const finalUrl = `${window.location.origin}/blog/${id}/${blogTitleSlug}`;
    const title = `🏔️ ${blogPost.title} - YokeTrip`;
    const description = 'Discover the magical Spiti Valley with YokeTrip!';
    
    const message = `${title}\n\n${description}\n\n🔗 ${finalUrl}`;

    const encodedMessage = encodeURIComponent(message);
    const encodedUrl = encodeURIComponent(finalUrl);

    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodedMessage}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedMessage}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      setShowSocialOptions(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!blogPost) return;
    
    try {
      const blogTitleSlug = blogPost.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 60);
      
      const finalUrl = `${window.location.origin}/blog/${id}/${blogTitleSlug}`;
      await navigator.clipboard.writeText(finalUrl);
      alert('Blog link copied to clipboard!');
      setShowSocialOptions(false);
    } catch (error) {
      alert('Failed to copy link. Please try again.');
    }
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <>
        <Header {...props} />
        <div className="blog-detail-screen">
          <div className="blog-detail-container">
            <div className="loading-container">
              <div className="spinner-large"></div>
              <p>Loading amazing travel story...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !blogPost) {
    return (
      <>
        <Header {...props} />
        <div className="blog-detail-screen">
          <div className="blog-detail-container">
            <div className="error-state">
              <i className="material-icons">travel_explore</i>
              <h2>Journey Not Found</h2>
              <p>{error || 'The travel story you\'re looking for has wandered off the map.'}</p>
              <div className="error-actions">
                <button 
                  onClick={handleGoBack}
                  className="btn-primary"
                >
                  <i className="material-icons">arrow_back</i>
                  Back to Safety
                </button>
                <button 
                  onClick={() => navigate('/travel-blog')}
                  className="btn-secondary"
                >
                  Explore More Stories
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header {...props} />
      <div className="blog-detail-screen">
        <div className="blog-detail-container">
          <article className="blog-detail-article">
            
            {/* Blog Header with Back Button */}
            <header className="blog-detail-header">
              <button 
                onClick={handleGoBack}
                className="back-button"
                aria-label="Go back"
              >
                <i className="material-icons">arrow_back</i>
                <span>Back to Stories</span>
              </button>
              
            </header>

            {/* Blog Hero Section */}
            <div className="blog-hero-section">
              {/* Blog Image - Responsive */}
              {blogPost.imageUrl && (
                <div className="blog-hero-image">
                  <img 
                    src={blogPost.imageUrl} 
                    alt={blogPost.title}
                    loading="eager"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="image-fallback">
                    <i className="material-icons">landscape</i>
                    <span>Mountain Landscape</span>
                  </div>
                </div>
              )}

              {/* Blog Title */}
              <h1 className="blog-hero-title">
                <span className="title-icon">🏔️</span>
                {blogPost.title}
              </h1>

              {/* Blog Meta Information */}
              <div className="blog-hero-meta">
                <div className="meta-items">
                  <div className="meta-item">
                    <i className="material-icons">person</i>
                    <span>{blogPost.authorName || 'Travel Explorer'}</span>
                  </div>
                  <div className="meta-item">
                    <i className="material-icons">calendar_today</i>
                    <span>{formatDate(blogPost.createdAt)}</span>
                  </div>
                  <div className="meta-item">
                    <i className="material-icons">schedule</i>
                    <span>7 min read</span>
                  </div>
                  <div className="meta-item">
                    <i className="material-icons">local_offer</i>
                    <span>Himalayas, Adventure</span>
                  </div>
                </div>
                
                {/* Share Button */}
                <button 
                  onClick={handleShareBlog}
                  className="share-button"
                  disabled={isSharing}
                  aria-label="Share this blog"
                >
                  <i className="material-icons">
                    {isSharing ? 'share' : 'ios_share'}
                  </i>
                  <span>{isSharing ? 'Sharing...' : 'Share Journey'}</span>
                </button>
              </div>
            </div>

            {/* Blog Content */}
            <div className="blog-content-section">
              <div className="blog-content">
                {/* Introduction */}
                <div className="content-intro">
                  <p className="intro-text">
                    {blogPost.description || 'Discover the hidden gem of the Himalayas - Spiti Valley, a land of breathtaking landscapes and ancient cultures.'}
                  </p>
                </div>

                {/* Main Content */}
                <div className="main-content">
                  {renderFormattedContent(blogPost.content || blogPost.description)}
                </div>

                {/* Travel Experience Section */}
                <div className="travel-experience">
                  <h3>🌟 My Spiti Experience</h3>
                  <div className="experience-grid">
                    <div className="experience-item">
                      <span className="exp-icon">🏔️</span>
                      <div className="exp-content">
                        <h4>Mountain Majesty</h4>
                        <p>Breathtaking views of snow-capped peaks and pristine valleys</p>
                      </div>
                    </div>
                    <div className="experience-item">
                      <span className="exp-icon">🏮</span>
                      <div className="exp-content">
                        <h4>Cultural Richness</h4>
                        <p>Ancient monasteries and warm local hospitality</p>
                      </div>
                    </div>
                    <div className="experience-item">
                      <span className="exp-icon">🚗</span>
                      <div className="exp-content">
                        <h4>Adventure Roads</h4>
                        <p>Thrilling mountain drives and high-altitude trekking</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Travel Tips Section */}
                <div className="travel-tips-section">
                  <h3>💡 Travel Tips for Spiti Valley</h3>
                  <div className="tips-grid">
                    <div className="tip-item">
                      <i className="material-icons">ac_unit</i>
                      <p><strong>Pack Warm:</strong> Temperatures can drop significantly, even in summer</p>
                    </div>
                    <div className="tip-item">
                      <i className="material-icons">local_hospital</i>
                      <p><strong>Health First:</strong> Carry necessary medications and stay hydrated</p>
                    </div>
                    <div className="tip-item">
                      <i className="material-icons">photo_camera</i>
                      <p><strong>Capture Memories:</strong> Don't forget your camera for stunning landscapes</p>
                    </div>
                    <div className="tip-item">
                      <i className="material-icons">people</i>
                      <p><strong>Respect Culture:</strong> Be mindful of local customs and traditions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Section */}
            <div className="blog-cta-section">
              <h3>✨ Inspired by this  Journey?</h3>
              <p>Share this amazing travel story with fellow adventure seekers!</p>
              <div className="cta-buttons">
                <button 
                  onClick={handleShareBlog}
                  className="btn-primary large"
                  disabled={isSharing}
                >
                  <i className="material-icons">share</i>
                  {isSharing ? 'Sharing Adventure...' : 'Share This Journey'}
                </button>
                <button 
                  onClick={() => navigate('/travel-blog')}
                  className="btn-secondary large"
                >
                  <i className="material-icons">explore</i>
                  Discover More Adventures
                </button>
              </div>
            </div>

          </article>
        </div>
      </div>

      {/* Social Media Share Modal */}
      {showSocialOptions && (
        <div className="social-share-modal">
          <div className="social-share-overlay" onClick={() => setShowSocialOptions(false)}></div>
          <div className="social-share-content">
            <div className="share-modal-header">
              <h3>🌄 Share this  Adventure</h3>
              <p>Inspire others to explore the magical Spiti Valley</p>
            </div>
            
            <div className="social-share-grid">
              <button onClick={() => handleSocialShare('whatsapp')} className="social-btn whatsapp">
                <span className="social-icon">💬</span>
                <span>WhatsApp</span>
              </button>
              <button onClick={() => handleSocialShare('facebook')} className="social-btn facebook">
                <span className="social-icon">📘</span>
                <span>Facebook</span>
              </button>
              <button onClick={() => handleSocialShare('twitter')} className="social-btn twitter">
                <span className="social-icon">🐦</span>
                <span>Twitter</span>
              </button>
              <button onClick={() => handleSocialShare('linkedin')} className="social-btn linkedin">
                <span className="social-icon">💼</span>
                <span>LinkedIn</span>
              </button>
              <button onClick={() => handleSocialShare('telegram')} className="social-btn telegram">
                <span className="social-icon">📨</span>
                <span>Telegram</span>
              </button>
            </div>

            <div className="copy-link-section">
              <button onClick={handleCopyLink} className="copy-link-btn">
                <i className="material-icons">link</i>
                Copy Adventure Link
              </button>
            </div>

            <button 
              onClick={() => setShowSocialOptions(false)}
              className="close-social-modal"
            >
              Continue Reading
            </button>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default BlogDetailScreen;