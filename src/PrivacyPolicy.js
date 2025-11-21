import React from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/footer';
import './App.css';

function PrivacyPolicy({
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
      <div className="privacy-policy" style={{ paddingTop: '80px' }}>
        <div className="container section-container">
          <h1 className="section-title">Privacy Policy</h1>
          <p><strong>Effective Date:</strong> 4th June 2025</p>
          <p><strong>Last Updated:</strong> 4th June 2025</p>
          <p>
            At YokeTrip India Private Limited ("we," "us," or "our"), your privacy and trust are our utmost
            priorities. How we collect, use, store, and protect your personal information when you use our
            platform is described in this privacy policy. By using YokeTrip services, you agree to the practices
            described herein. For any queries, suggestions, or discrepancies, kindly email <a href="mailto:info@yoketrip.com">info@yoketrip.com</a>.
          </p>

          <h2>1. Information We Collect</h2>
          <p>To deliver an optimized and secure travel experience, we collect the following information from our valuable users:</p>
          <h3>A. Personal Information</h3>
          <ul>
            <li><strong>KYC and Location Data:</strong> We require full KYC (Know Your Customer) verification during onboarding, including your name, date of birth, address, government-issued ID (e.g., Aadhaar, Passport), and contact details, along with your location permissions.</li>
            <li><strong>Account Details:</strong> Information like username, email, and phone number is needed for registration.</li>
          </ul>
          <h3>B. Travel Data</h3>
          <ul>
            <li>Your travel preferences, trip details, and interaction with our travel partner matching and booking services.</li>
          </ul>
          <h3>C. Financial Data</h3>
          <ul>
            <li>Payment details, billing information, and transaction history are processed through secure payment gateways.</li>
          </ul>
          <h3>D. Communications</h3>
          <ul>
            <li>Emails, feedback, and customer service interactions that help us provide better support.</li>
          </ul>

          <h2>2. How We Utilize Your Data</h2>
          <p>We use your information to provide seamless services, enhance your experience, and ensure security across our platform:</p>
          <ol>
            <li><strong>Deliver Services:</strong> Facilitate bookings, provide travel partner matches, and ensure seamless user experiences.</li>
            <li><strong>Ensure Security:</strong> Verify your identity through KYC to prevent fraud and unauthorized access.</li>
            <li><strong>Enhance Platform:</strong> Use feedback and usage trends to improve features and functionality.</li>
            <li><strong>Support Local Economies:</strong> Enable partnerships with guides, shops, and activity providers.</li>
            <li><strong>Respect Legal Obligations:</strong> Adhere to legal requests and fulfill regulatory obligations.</li>
          </ol>
          <p><strong>"Data handled with utmost Integrity and Privacy"</strong></p>

          <h2>3. Sharing Your Information</h2>
          <p>We share your data only under specific circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> To enable booking, payments, and logistics through verified partners.</li>
            <li><strong>Legal Obligations:</strong> To comply with laws, court orders, or government mandates.</li>
          </ul>
          <p><strong>"Your data, safeguarded—secure, private, and solely yours."</strong></p>

          <h2>4. Data Security</h2>
          <p>We employ advanced security measures to protect your information against unauthorized access, alteration, or loss:</p>
          <h3>Key Security Measures</h3>
          <ul>
            <li><strong>Data Encryption:</strong> All communications, sensitive data, including KYC documents, are encrypted using advanced protocols.</li>
            <li><strong>Secure Storage:</strong> Information is stored in servers with robust firewalls and continuous monitoring.</li>
            <li><strong>Two-Factor Authentication (2FA):</strong> Your account is secured with 2FA for an added layer of protection.</li>
            <li><strong>Regular Audits:</strong> We review security systems periodically to address potential vulnerabilities.</li>
            <li><strong>Limited Access:</strong> Only authorized personnel may access sensitive information, and strict confidentiality agreements bind them.</li>
          </ul>
          <p><strong>"By these Security Measures in place, we uphold the highest security standards."</strong></p>

          <h2>5. Your Privacy Rights</h2>
          <p>As a valued user, you have full control over your data. Your rights encompass the following:</p>
          <ul>
            <li><strong>Reserve:</strong> Exercise your right to view your data.</li>
            <li><strong>Modify:</strong> Update inaccurate or outdated information.</li>
            <li><strong>Deletion:</strong> Permanently delete your account and associated data, subject to legal constraints.</li>
          </ul>

          <h2>6. Cookies Consent</h2>
          <p>We use cookies to improve your experience:</p>
          <ul>
            <li><strong>Session Cookies:</strong> Ensure smooth navigation across the app.</li>
            <li><strong>Analytics Cookies:</strong> Help us understand user behaviour and improve features.</li>
          </ul>
          <p>You can control or disable cookies in your browser or device settings.</p>
          <p><strong>**Note: Disabling cookies may affect certain functionalities.</strong></p>

          <h2>7. Transparency in Identity Verification</h2>
          <p>Our platform requires full KYC verification to:</p>
          <ul>
            <li>Enhance user trust and security.</li>
            <li>Prevent fraud and misuse of services.</li>
            <li>Meet legal and regulatory standards.</li>
          </ul>
          <p><strong>**Your KYC data is securely stored and encrypted to prevent unauthorized access, and only authorized personnel can review your documents, and they do so under strict confidentiality agreements.</strong></p>

          <h2>8. Third-Party Links and Integrations</h2>
          <p>There may be links to external websites or services on our platform. These links are provided for your convenience but operate independently of YokeTrip. We encourage you to review the privacy policies of any external platforms before sharing your data.</p>

          <h2>9. Wallet Data Privacy and Security</h2>
          <p>We value the trust you place in us and are committed to safeguarding all data related to your in-app wallet. This section outlines how we handle wallet-related information:</p>
          <h3>A. What Wallet Data We Collect</h3>
          <ul>
            <li>Wallet balance details.</li>
            <li>Transaction history, including deposits, withdrawals, and rewards.</li>
            <li>Logs related to in-app transactions and activities.</li>
          </ul>
          <h3>B. How We Use Wallet Data</h3>
          <p>Your wallet data is utilized to:</p>
          <ol>
            <li>Process rewards, including those earned through referral programs or promotional activities.</li>
            <li>Enable and manage Refer & Earn programs.</li>
            <li>Provide access to paid in-app services and activities.</li>
            <li>Facilitate withdrawals securely and efficiently.</li>
          </ol>
          <h3>C. Ensuring Security Through KYC</h3>
          <p>To ensure that your wallet is secure and accessible only to you, we require KYC verification. This process helps us:</p>
          <ul>
            <li>Authenticate your identity to ensure secure access and prevent unauthorized entry.</li>
            <li>Protect against fraudulent activities or misuse of wallet funds.</li>
            <li>Ensure compliance with regulatory requirements.</li>
          </ul>
          <h3>D. Data Encryption and Security</h3>
          <p>All wallet-related data, including transaction logs and balances, is encrypted using advanced technologies. This ensures that your sensitive financial data remains secure and protected from unauthorized access or breaches.</p>
          <h3>E. Your Rights Regarding Wallet Data</h3>
          <p>As a YokeTrip user, you have full control over your wallet data. You may:</p>
          <ol>
            <li><strong>View:</strong> Access detailed logs of your wallet transactions and balances.</li>
            <li><strong>Retrieve:</strong> Request a detailed report or export your information for personal reference.</li>
            <li><strong>Delete:</strong> Permanently delete wallet information, subject to compliance with regulatory and operational requirements.</li>
          </ol>
          <p><strong>**The YokeTrip wallet is not RBI-regulated; use it at your discretion and risk.</strong></p>

          <h2>10. Updates to This Privacy Policy</h2>
          <p>We will periodically update the 'Privacy Policy' to implement stricter data protection rules. Major updates will be communicated to you via email or in-app notifications.</p>

          <h2>11. Contact Us</h2>
          <p>We're here to address any concerns or queries regarding your data and privacy:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@yoketrip.com">info@yoketrip.com</a></li>
            <li><strong>Phone:</strong> <a href="tel:+919421124210">+91 94211 24210</a></li>
            <li><strong>Registered Address:</strong> YokeTrip India Private Limited, 774 Ozar, Rajapur, Oni, Rajapur, Ratnagiri-416705, Maharashtra.</li>
          </ul>

          <h2>Your Security, Our Priority</h2>
          <p>At YokeTrip, the core of everything we do is protecting your data. Whether you're booking an activity, finding a travel partner, or shopping on our platform, your privacy is always protected. Trust us to make your journey not just memorable but also secure.</p>

          <p><strong>Denotions:</strong> '**' Important /or Critical pointer.</p>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default PrivacyPolicy;