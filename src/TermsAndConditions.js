import React from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/footer';
import './App.css';

function TermsAndConditions({
  isLoggedIn,
  setIsLoggedIn,
  handleNavClick,
  toggleDrawer,
  handleLogout,
  isChatRoute,
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('auth_token'));
    };
    window.addEventListener('storage', checkAuth);
    checkAuth();
    return () => window.removeEventListener('storage', checkAuth);
  }, [setIsLoggedIn]);

  return (
    <>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrolled={scrolled}
        isLoggedIn={isLoggedIn}
        handleNavClick={handleNavClick}
        toggleDrawer={toggleDrawer}
        handleLogout={handleLogout}
        isChatRoute={isChatRoute}
      />
      <div className="terms-and-conditions" style={{ paddingTop: '80px' }}>
        <div className="container section-container">
          <h1 className="section-title">Terms and Conditions</h1>
          <p><strong>Effective Date:</strong> 8th June 2025</p>
          <p><strong>Last Updated:</strong> 8th June 2025</p>
          <p>
            Welcome to YokeTrip! These Terms and Conditions ("Terms") govern your use of the services
            provided by YokeTrip India Private Limited ("we," "us," or "our"), including our website, mobile
            application, and associated features or functionalities. When you access or use our services, you
            accept and agree to the terms outlined in this document. We strongly advise against using our
            services if you disagree with these terms. Our mission is to provide a secure, user-friendly, and
            enjoyable platform that fosters a thriving community of travellers, guides, and businesses.
          </p>

          <h2>1. Definitions</h2>
          <ul>
            <li><strong>User:</strong> Any individual accessing or using the YokeTrip platform.</li>
            <li><strong>Travel Guide:</strong> A person offering tour services through our platform.</li>
            <li><strong>Vendor:</strong> A business or individual listing products or services in the Travel Shop.</li>
            <li><strong>Subscription Plans:</strong> Paid tiers for accessing exclusive features on YokeTrip.</li>
            <li><strong>Commission Model:</strong> A fee structure applied to services offered on the platform.</li>
          </ul>

          <h2>2. Eligibility</h2>
          <p>To utilize our platform, you must fulfil:</p>
          <ul>
            <li><strong>Minimum Age Criteria:</strong> 18 years and above.</li>
            <li>Provide accurate and verifiable information during registration and KYC verification.</li>
            <li>Respect all rules and regulations that apply, whether local, regional, national, or international.</li>
          </ul>

          <h2>3. Responsibilities</h2>
          <p>Users must:</p>
          <ul>
            <li>Maintain the confidentiality of their login credentials and personal account information.</li>
            <li>Conduct all activities in compliance with these Terms and applicable laws.</li>
            <li>Refrain from:
              <ul>
                <li>Sharing misleading or inaccurate information.</li>
                <li>Engaging in behaviour that infringes on the rights of other users, vendors, or partners.</li>
                <li>Violating community guidelines or terms set by the platform.</li>
              </ul>
            </li>
          </ul>
          <p><strong>**Misuse or non-compliance may result in the suspension, restriction, or termination of the user account without prior notice.</strong></p>

          <h2>4. Services Offered</h2>
          <h3>Subscription Plans</h3>
          <ul>
            <li><strong>Basic Plan (₹599/year):</strong> Essential features, suitable for casual users.</li>
            <li><strong>Super Plan (₹999/year):</strong> Advanced features with additional benefits.</li>
            <li><strong>Premium Plan (₹1999/year):</strong> Comprehensive access, including exclusive perks and rewards.</li>
          </ul>
          <h3>Commission Models</h3>
          <ul>
            <li><strong>Tour Guide Services:</strong> 10% commission on bookings.</li>
            <li><strong>Eco-Tourism Activities:</strong> 10% commission on activity bookings.</li>
            <li><strong>Travel Shop Sales:</strong> 10% commission on transactions.</li>
          </ul>
          <h3>Advertising Options</h3>
          <ul>
            <li><strong>Boost User Trips:</strong> Daily promotions at an affordable minimum cost.</li>
            <li><strong>Boost Travel Shops:</strong> Monthly visibility campaigns for shop listings.</li>
            <li><strong>Boost User Guides:</strong> Monthly campaigns to highlight guide profiles and increase bookings.</li>
          </ul>
          <p><strong>**All subscriptions are billed annually and are non-refundable.</strong></p>

          <h2>5. Wallet Functionality</h2>
          <p>YokeTrip's in-app wallet allows users to manage funds conveniently:</p>
          <ul>
            <li><strong>Balance Management:</strong> Store funds for seamless transactions.</li>
            <li><strong>Rewards Collection:</strong> Earn rewards via referrals, promotions, and other platform activities.</li>
            <li><strong>Transaction Security:</strong> All wallet transactions are encrypted and secured.</li>
          </ul>
          <h3>Refund Policy for Wallet</h3>
          <ul>
            <li>Refunds for canceled bookings (paid via the platform) will be credited back to the user's wallet within three (3) business days.</li>
            <li>Subscriptions are non-refundable.</li>
          </ul>
          <h3>User Rights Regarding Wallet Data</h3>
          <ul>
            <li><strong>View Wallet Data:</strong> Access logs of transactions and balances.</li>
            <li><strong>Withdraw Data:</strong> Request a summary for personal records.</li>
            <li><strong>Delete Wallet Data:</strong> Request deletion, subject to compliance with legal or operational requirements.</li>
          </ul>
          <p><strong>**The YokeTrip wallet is not RBI-regulated; use it at your discretion and risk.</strong></p>

          <h2>6. Cancellation and Refund Policy</h2>
          <ul>
            <li><strong>Bookings:</strong>
              <ul>
                <li>The first two booking cancellations will not incur any penalty.</li>
                <li>From the third cancellation onward, a non-refundable fee of 5% of the booking amount plus applicable GST will be charged.</li>
              </ul>
            </li>
            <li><strong>Subscriptions:</strong> Subscriptions are non-refundable under any circumstances.</li>
          </ul>

          <h2>7. Modification of Services</h2>
          <ul>
            <li><strong>Subscription Plans:</strong> Users may upgrade their subscription plans. Downgrades or modifications resulting in a reduced subscription level are not allowed.</li>
            <li><strong>Bookings:</strong> Modifications to confirmed bookings are not permitted. Before completing reservations, users are recommended to thoroughly cross-check their details.</li>
          </ul>

          <h2>8. Data Privacy and Security</h2>
          <p>YokeTrip adheres to stringent privacy and data security protocols:</p>
          <ul>
            <li><strong>KYC Verification:</strong> Ensures secure and authenticated access to the platform.</li>
            <li><strong>Data Encryption:</strong> Protects all user data from unauthorized access or breaches.</li>
            <li><strong>Data Retention:</strong> As long as the account is active, user data will be available in the database. After account deletion, the data will be stored for 180 days before permanent removal, unless otherwise required by law.</li>
          </ul>
          <p>For more details, refer to our <Link to="/privacy-policy">Privacy Policy Guidelines</Link>.</p>

          <h2>9. Prohibited Activities</h2>
          <p>Users must not:</p>
          <ul>
            <li>Engage in fraudulent or illegal activities.</li>
            <li>Post harmful, offensive, or defamatory content.</li>
            <li>Perform actions that could disrupt the platform's functionality or compromise its data.</li>
          </ul>
          <p><strong>**Violations may lead to immediate suspension, legal action, or permanent account termination.</strong></p>

          <h2>10. Account Termination</h2>
          <p>We have the right to close accounts under specific circumstances, such as:</p>
          <ul>
            <li>Breaches of these Terms.</li>
            <li>Misconduct or fraudulent activities.</li>
            <li>Non-compliance with platform guidelines or applicable laws.</li>
          </ul>
          <p><strong>**Users can get in touch with our support staff to request account termination. Upon termination, remaining wallet balances (if applicable) will be reviewed and handled in line with the platform's policies.</strong></p>

          <h2>11. Modifications to these Terms and Conditions</h2>
          <p>YokeTrip reserves the right to make any necessary changes to these Terms as needed. Updates will be notified via email, in-app alerts, or website announcements. Continued use of the platform after notification constitutes acceptance of the revised Terms.</p>

          <h2>12. Contact Us</h2>
          <p>For any inquiries, please contact us at:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@yoketrip.com">info@yoketrip.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+919421124210">+91 94211 24210</a></li>
            <li><strong>Address:</strong> YokeTrip India Private Limited, 774 Ozar, Rajapur, Oni, Rajapur, Ratnagiri-416705, Maharashtra.</li>
          </ul>

          <h2>13. Acknowledgment</h2>
          <p>By engaging with our platform, you affirm that you have carefully reviewed and accepted the Terms and Conditions detailed here, ensuring a smooth and transparent experience. We're truly grateful you've chosen YokeTrip to be part of your adventures - let's make every journey unforgettable!</p>

          <p><strong>Denotions:</strong> '**' Important /or Critical pointer.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TermsAndConditions;