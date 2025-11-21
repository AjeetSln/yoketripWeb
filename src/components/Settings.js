import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header'; // Adjust path if needed

// Helper Components
function MenuTile({ title, icon, trailing, onClick }) {
  return (
    <div
      className="flex items-center p-4 mx-2 my-2 bg-white rounded-2xl shadow-md cursor-pointer transition-all duration-300 transform hover:scale-[1.03] hover:shadow-lg"
      onClick={onClick}
    >
      <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full">
        <i className="material-icons text-2xl text-blue-600">{icon}</i>
      </div>
      <span className="ml-4 text-lg font-semibold text-gray-900 flex-grow">{title}</span>
      {trailing ? trailing : <i className="material-icons text-lg text-gray-400">arrow_forward_ios</i>}
    </div>
  );
}

function InfoDialog({ title, children, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-3xl">
          <h2 className="text-2xl font-bold text-blue-600">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-colors">
            <i className="material-icons">close</i>
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-700">
          {children}
        </div>
      </div>
    </div>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    try {
      const response = await axios.post('https://yoketrip.in/api/contact', formData);
      if (response.status === 201) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to send message. Please try again.');
      }
    } catch (error) {
      setStatus('Error: Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
        <textarea
          name="message"
          id="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        ></textarea>
      </div>
      <div className="text-center">
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="inline-flex justify-center py-3 px-8 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 transition-all"
        >
          {loading ? 'Sending...' : 'Submit'}
        </button>
      </div>
      {status && <p className="mt-4 text-center text-sm text-gray-600">{status}</p>}
    </div>
  );
}

// Content Components
const SectionTitle = ({ children }) => <h3 className="text-xl font-bold text-blue-600 mt-8 mb-4">{children}</h3>;
const SubSection = ({ title, points }) => (
  <div className="mt-6">
    <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
    <ul className="list-none mt-3 space-y-3">
      {points.map((point, index) => (
        <li key={index} className="flex items-start">
          <span className="text-blue-500 mr-3">✓</span>
          <p className="flex-1 text-sm text-gray-700">{point}</p>
        </li>
      ))}
    </ul>
  </div>
);
const BulletPoints = ({ points }) => (
  <ul className="list-none mt-3 space-y-3">
    {points.map((point, index) => (
      <li key={index} className="flex items-start">
        <span className="text-gray-500 mr-3">•</span>
        <p className="flex-1 text-sm text-gray-700">{point}</p>
      </li>
    ))}
  </ul>
);

function AboutUsContent() {
  return (
    <div className="text-sm space-y-6 text-justify">
      <SectionTitle>What is YokeTrip?</SectionTitle>
      <p>YokeTrip is India’s first travel ecosystem focused on building real connections between travellers. We’re not just a travel app; we’re a movement to make travel safer, affordable, and meaningful. Founded in 2025, YokeTrip India Private Limited was born from a deep passion for exploration and a commitment to making travel accessible, sustainable, and impactful.</p>
      <p>In today’s world, solo travellers feel isolated, and group travellers often struggle to find the right companions. The charm of real local experiences gets lost behind filters and generic packages. With KYC-verified users and encrypted transactions, we ensure safety at every step of your journey. Whether you’re looking for companionship, purpose, or peace, YokeTrip holds it all together.</p>

      <SectionTitle>Categories We’re Serving</SectionTitle>
      <SubSection title="Connect & Explore" points={['Find Your Travel Partner: Travel solo without ever feeling alone. Discover companions who share your interests and destinations for a memorable journey.']} />
      <SubSection title="Explore & Discover" points={['Travel Blogs: Explore a world of tips, experiences, and adventures shared by real travellers. Dive into stories that inspire and guide your next trip.', 'Local Guides: Discover the world with the help of experienced local guides and unearth hidden treasures and immerse yourself in authentic experiences.']} />
      <SubSection title="Smart Travel Solutions" points={['Expense Tracker: Efficiently handle and allocate travel expenses with seamless tracking, eliminating financial stress and enjoying peace of mind.', 'Travel Marketplace: Discover a curated selection of travel essentials in one place. From practical gear to unique finds, prepare for your journey with ease.']} />
      <SubSection title="Meaningful Journeys" points={['Eco-Tourism Hub: Embark on journeys that respect and protect the environment. Choose eco-friendly trips that leave a positive impact on the planet.', 'Volunteer Experiences: Transform your travels into acts of kindness. Support local communities while exploring new horizons.']} />

      <SectionTitle>Our Vision</SectionTitle>
      <p>At YokeTrip, we envision a world where:</p>
      <BulletPoints points={['Travel feels safe: Verified users and secure transactions make every journey worry-free.', 'Travel has an impact: Eco-Tourism, Responsible Tourism, and Volunteer options ensure meaningful exploration.', 'Travel builds connections: Where friendships and stories last beyond the trip.']} />
      <p className="italic text-center mt-4 text-gray-500">“Transforming each trip into a Memorable Tale.”</p>

      <SectionTitle>What Makes YokeTrip Unique?</SectionTitle>
      <p>We aim to build India’s most trusted travel community, one that empowers people to explore, connect, and grow. We created YokeTrip to address real problems like:</p>
      <BulletPoints points={['Unsafe experiences for solo travellers.', 'Limited access to cost-effective and genuine travel experiences.', 'Neglected local guides and artisans.', 'Concerns over digital security.', 'Disconnected travel planning.', 'Hassle of managing travel finances.']} />
      <p>YokeTrip solves this by creating an integrated platform where you can:</p>
      <BulletPoints points={['Find like-minded travel partners who align with your passions and destinations.', 'Explore eco-tourism options where nature is respected, not consumed.', 'Connect with local guides offering authentic, personalized experiences.', 'Manage your travel funds and rewards using our secure in-app wallet.', 'Volunteer on your trip to give back to the places you visit.', 'Shop from artisans and vendors through our Travel Shop.', 'Share and discover travel stories, blogs, and tips from real explorers.']} />
      <p>With YokeTrip, we make travel:</p>
      <BulletPoints points={['Safe: Verified users, KYC checks, and secure wallet transactions.', 'Budget-Friendly: Offering transparent pricing and economical plans.', 'Meaningful: Support local businesses and give back through volunteering.', 'Authentic: Real guides, real connections, and real experiences.']} />
      <p>We prioritize building connections between individuals rather than simply offering pre-packaged solutions. Whether you’re a solo traveller seeking a buddy, a responsible tourist giving back, or an artisan waiting for recognition, YokeTrip is your travel family.</p>

      <SectionTitle>Our Goals</SectionTitle>
      <SubSection title="Short-Term Goals" points={['Onboard verified travellers across India.', 'Enable safe travel partnerships.', 'Create livelihood opportunities for local guides and artisans.', 'Launch eco-tour packages with sustainability standards.', 'Reward users through our in-app wallet system.']} />
      <SubSection title="Long-Term Goals" points={['Build India’s largest verified travel community.', 'Empowering village artisans and guides through sustainable tourism.', 'Expand into South Asia and global travel networks.', 'Partner with NGOs to make volunteer tourism mainstream.']} />

      <SectionTitle>How We Keep It Safe</SectionTitle>
      <BulletPoints points={['KYC Verification: Every user undergoes thorough identity verification for secure matches.', 'Encrypted Transactions: Your wallet funds and data are safeguarded with advanced encryption.', 'Data Privacy: We retain user data responsibly and give you full control to view, modify, or delete it.']} />

      <SectionTitle>Get Started With YokeTrip</SectionTitle>
      <p>We’re redefining travel by turning it into an experience that’s impactful, ethical, and inclusive. Whether it’s a solo trip, group adventure, or volunteering journey, YokeTrip ensures a seamless and unforgettable experience.</p>
      <p>If you’ve ever dreamed of:</p>
      <BulletPoints points={['Finding a verified travel buddy.', 'Traveling safely as a solo female explorer.', 'Supporting nature through eco-tourism.', 'Giving back through volunteering.', 'Shopping from artisans with a purpose.']} />
      <p>So, join us and begin your adventure with us today!</p>
      <p>With some simple and easy steps, you can onboard with us:</p>
      <BulletPoints points={['Download the app.', 'Complete your profile.', 'Explore the categories.', 'Match. Plan. Travel. Repeat.']} />
      <p className="italic text-center mt-4 text-gray-500">“Your journey starts here. Not alone.”</p>

      <SectionTitle>Ready to Yoke with the World?</SectionTitle>
      <BulletPoints points={['Visit: www.YokeTrip.com', 'Instagram/Facebook: @YokeTrip', 'Support: info@yoketrip.com']} />
      <p className="italic text-center mt-4 text-gray-500">“Your Journey - Your Partner ~ Experience a new era of travel with you!!!”</p>
    </div>
  );
}

function PrivacyPolicyContent() {
  return (
    <div className="text-sm space-y-6 text-justify">
      <p className="font-semibold">Effective Date: 4th August 2025<br />Last Updated: 4th August 2025</p>
      <p>At YokeTrip India Private Limited (“we,” “us,” or “our”), your privacy and trust are our utmost priorities. How we collect, use, store, and protect your personal information when you use our platform is described in this privacy policy. By using YokeTrip services, you agree to the practices described herein. For any queries, suggestions, or discrepancies, kindly email info@yoketrip.com.</p>

      <SectionTitle>1. Information We Collect</SectionTitle>
      <SubSection title="A. Personal Information" points={["KYC and Location Data: We require full KYC (Know Your Customer) verification during onboarding, including your name, date of birth, address, government-issued ID (e.g., Aadhaar, Passport), and contact details, along with your location permissions.", "Account Details: Information like username, email, and phone number is needed for registration."]} />
      <SubSection title="B. Travel Data" points={["Your travel preferences, trip details, and interaction with our travel partner matching and booking services."]} />
      <SubSection title="C. Financial Data" points={["Payment details, billing information, and transaction history are processed through secure payment gateways."]} />
      <SubSection title="D. Communications" points={["Emails, feedback, and customer service interactions that help us provide better support."]} />

      <SectionTitle>2. How We Utilize Your Data</SectionTitle>
      <p>We use your information to provide seamless services, enhance your experience, and ensure security across our platform.</p>
      <BulletPoints points={["Deliver Services: Facilitate bookings, provide travel partner matches, and ensure seamless user experiences.", "Ensure Security: Verify your identity through KYC to prevent fraud and unauthorized access.", "Enhance Platform: Use feedback and usage trends to improve features and functionality.", "Support Local Economies: Enable partnerships with guides, shops, and activity providers.", "Respect Legal Obligations: Adhere to legal requests and fulfill regulatory obligations."]} />
      <p className="italic text-center mt-4 text-gray-500">“Data handled with utmost Integrity and Privacy”</p>

      <SectionTitle>3. Sharing Your Information</SectionTitle>
      <p>We share your data only under specific circumstances:</p>
      <BulletPoints points={["Service Providers: To enable booking, payments, and logistics through verified partners.", "Legal Obligations: To comply with laws, court orders, or government mandates."]} />
      <p className="italic text-center mt-4 text-gray-500">“Your data, safeguarded—secure, private, and solely yours.”</p>

      <SectionTitle>4. Data Security</SectionTitle>
      <p>We employ advanced security measures to protect your information against unauthorized access, alteration, or loss:</p>
      <SubSection title="Key Security Measures" points={["Data Encryption: All communications, sensitive data, including KYC documents, are encrypted using advanced protocols.", "Secure Storage: Information is stored in servers with robust firewalls and continuous monitoring.", "Two-Factor Authentication (2FA): Your account is secured with 2FA for an added layer of protection.", "Regular Audits: We review security systems periodically to address potential vulnerabilities.", "Limited Access: Only authorized personnel may access sensitive information, and strict confidentiality agreements bind them."]} />
      <p className="italic text-center mt-4 text-gray-500">“By these Security Measures in place, we uphold the highest security standards.”</p>

      <SectionTitle>5. Your Privacy Rights</SectionTitle>
      <p>As a valued user, you have full control over your data. Your rights encompass the following:</p>
      <BulletPoints points={["Reserve: Exercise your right to view your data.", "Modify: Update inaccurate or outdated information.", "Deletion: Permanently delete your account and associated data, subject to legal constraints."]} />

      <SectionTitle>6. Cookies Consent</SectionTitle>
      <p>We use cookies to improve your experience:</p>
      <BulletPoints points={["Session Cookies: Ensure smooth navigation across the app.", "Analytics Cookies: Help us understand user behaviour and improve features."]} />
      <p>You can control or disable cookies in your browser or device settings. <strong>Note: Disabling cookies may affect certain functionalities.</strong></p>

      <SectionTitle>7. Transparency in Identity Verification</SectionTitle>
      <p>Our platform requires full KYC verification to:</p>
      <BulletPoints points={["Enhance user trust and security.", "Prevent fraud and misuse of services.", "Meet legal and regulatory standards."]} />
      <p><strong>Your KYC data is securely stored and encrypted to prevent unauthorized access, and only authorized personnel can review your documents, and they do so under strict confidentiality agreements.</strong></p>

      <SectionTitle>8. Third-Party Links and Integrations</SectionTitle>
      <p>There may be links to external websites or services on our platform. These links are provided for your convenience but operate independently of YokeTrip. We encourage you to review the privacy policies of any external platforms before sharing your data.</p>

      <SectionTitle>9. Wallet Data Privacy and Security</SectionTitle>
      <p>We value the trust you place in us and are committed to safeguarding all data related to your in-app wallet. This section outlines how we handle wallet-related information:</p>
      <SubSection title="A. What Wallet Data We Collect" points={["Wallet balance details.", "Transaction history, including deposits, withdrawals, and rewards.", "Logs related to in-app transactions and activities."]} />
      <SubSection title="B. How We Use Wallet Data" points={["Process rewards, including those earned through referral programs or promotional activities.", "Enable and manage Refer & Earn programs.", "Provide access to paid in-app services and activities.", "Facilitate withdrawals securely and efficiently."]} />
      <SubSection title="C. Ensuring Security Through KYC" points={["Authenticate your identity to ensure secure access and prevent unauthorized entry.", "Protect against fraudulent activities or misuse of wallet funds.", "Ensure compliance with regulatory requirements."]} />
      <SubSection title="D. Data Encryption and Security" points={["All wallet-related data, including transaction logs and balances, is encrypted using advanced technologies. This ensures that your sensitive financial data remains secure and protected from unauthorized access or breaches."]} />
      <SubSection title="E. Your Rights Regarding Wallet Data" points={["View: Access detailed logs of your wallet transactions and balances.", "Retrieve: Request a detailed report or export your information for personal reference.", "Delete: Permanently delete wallet information, subject to compliance with regulatory and operational requirements."]} />
      <p><strong>The YokeTrip wallet is not RBI-regulated; use it at your discretion and risk.</strong></p>

      <SectionTitle>10. Updates to This Privacy Policy</SectionTitle>
      <p>We will periodically update the 'Privacy Policy' to implement stricter data protection rules. Major updates will be communicated to you via email or in-app notifications.</p>

      <SectionTitle>11. Contact Us</SectionTitle>
      <p>We’re here to address any concerns or queries regarding your data and privacy:</p>
      <BulletPoints points={['Email: info@yoketrip.com.', 'Phone: +919421124210.', 'Registered Address: YokeTrip India Private Limited, 774 Ozar, Rajapur, Oni, Rajapur, Ratnagiri- 416705, Maharashtra.']} />
      <p className="text-base font-bold text-gray-900 mt-6">Your Security, Our Priority.</p>
      <p>At YokeTrip, the core of everything we do is protecting your data. Whether you’re booking an activity, finding a travel partner, or shopping on our platform, your privacy is always protected. Trust us to make your journey not just memorable but also secure.</p>
      <p>Denotions- ** Important /or Critical pointer.</p>
    </div>
  );
}

function TermsAndConditionsContent() {
  return (
    <div className="text-sm space-y-6 text-justify">
      <p className="font-semibold">Effective Date: 4th August 2025<br />Last Updated: 4th August 2025</p>
      <p>By using this app, you agree to our Terms and Conditions. These terms govern your use of the YokeTrip application. You agree to comply with all applicable laws and regulations. We reserve the right to modify these terms at any time.</p>

      <SectionTitle>1. User Responsibilities</SectionTitle>
      <p>Use the platform and its services in compliance with these Terms and applicable laws.</p>
      <p>Refrain from:</p>
      <BulletPoints points={['Sharing misleading or inaccurate information.', 'Engaging in behaviour that infringes on the rights of other users, vendors, or partners.', 'Violating community guidelines or terms set by the platform.']} />
      <p className="font-bold mt-2">**Misuse or non-compliance may result in the suspension, restriction, or termination of the user account without prior notice.</p>

      <SectionTitle>2. Services Offered</SectionTitle>
      <SubSection title="A. Subscription Plans" points={['Basic Plan (₹599/year): Essential features, suitable for casual users.', 'Super Plan (₹999/year): Advanced features with additional benefits.', 'Premium Plan (₹1999/year): Comprehensive access, including exclusive perks and rewards.']} />
      <SubSection title="B. Commission Models" points={['Tour Guide Services: 10% commission on bookings.', 'Eco-Tourism Activities: 10% commission on activity bookings.', 'Travel Shop Sales: 10% commission on transactions.']} />
      <SubSection title="C. Advertising Options" points={['Vendors and users can leverage our advertising solutions to boost visibility.', 'Boost User Trips: Daily promotions at an affordable minimum cost.', 'Boost Travel Shops: Monthly visibility campaigns for shop listings.', 'Boost User Guides: Monthly campaigns to highlight guide profiles and increase bookings.']} />
      <p className="font-bold mt-2">**All subscriptions are billed annually and are non-refundable.</p>

      <SectionTitle>3. Wallet Functionality</SectionTitle>
      <SubSection title="A. Wallet Features" points={["Balance Management: Store funds for seamless transactions.", "Rewards Collection: Earn rewards via referrals, promotions, and other platform activities.", "Transaction Security: All wallet transactions are encrypted and secured."]} />
      <SubSection title="B. Refund Policy for Wallet" points={["Refunds for canceled bookings (paid via the platform) will be credited back to the user’s wallet within three (3) business days.", "Subscriptions are non-refundable."]} />
      <SubSection title="C. User Rights Regarding Wallet Data" points={["View Wallet Data: Access logs of transactions and balances.", "Withdraw Data: Request a summary for personal records.", "Delete Wallet Data: Request deletion, subject to compliance with legal or operational requirements."]} />
      <p className="font-bold mt-2">**The YokeTrip wallet is not RBI-regulated; use it at your discretion and risk.</p>

      <SectionTitle>4. Cancellation and Refund Policy</SectionTitle>
      <SubSection title="A. Bookings" points={["The first two booking cancellations will not incur any penalty.", "From the third cancellation onward, a non-refundable fee of 5% of the booking amount plus applicable GST will be charged."]} />
      <p>Subscriptions: Subscriptions are non-refundable under any circumstances.</p>

      <SectionTitle>5. Modification of Services</SectionTitle>
      <BulletPoints points={["Subscription Plans: Users may upgrade their subscription plans. Downgrades or modifications resulting in a reduced subscription level are not allowed.", "Bookings: Modifications to confirmed bookings are not permitted. Before completing reservations, users are recommended to thoroughly cross-check their details."]} />

      <SectionTitle>6. Data Privacy and Security</SectionTitle>
      <BulletPoints points={["KYC Verification: Ensures secure and authenticated access to the platform.", "Data Encryption: Protects all user data from unauthorized access or breaches.", "Data Retention: As long as the account is active, user data will be available in the database. After account deletion, the data will be stored for 180 days before permanent removal, unless otherwise required by law."]} />
      <p>For more details, refer to our Privacy Policy Guidelines.</p>

      <SectionTitle>7. Prohibited Activities</SectionTitle>
      <BulletPoints points={["Engage in fraudulent or illegal activities.", "Post harmful, offensive, or defamatory content.", "Avoid any actions that could disrupt the platform’s functionality or compromise its data."]} />
      <p className="font-bold mt-2">**Violations may lead to immediate suspension, legal action, or permanent account termination.</p>

      <SectionTitle>8. Account Termination</SectionTitle>
      <BulletPoints points={["Breaches of these Terms.", "Misconduct or fraudulent activities.", "Non-compliance with platform guidelines or applicable laws."]} />
      <p className="font-bold mt-2">**Users can get in touch with our support staff to request account termination. Upon termination, remaining wallet balances (if applicable) will be reviewed and handled in line with the platform’s policies.</p>

      <SectionTitle>9. Modifications to these Terms and Conditions</SectionTitle>
      <p>YokeTrip reserves the right to make any necessary changes to these Terms as needed. Updates will be notified via email, in-app alerts, or website announcements. Continued use of the platform after notification constitutes acceptance of the revised Terms.</p>

      <SectionTitle>10. Contact Us</SectionTitle>
      <p>We’re here to address any concerns or queries regarding your data and privacy:</p>
      <BulletPoints points={[
        'Email: info@yoketrip.com.',
        <a key="phone" href="tel:+919421124210" className="text-blue-500 hover:underline">Phone: +919421124210.</a>,
        'Registered Address: YokeTrip India Private Limited, 774 Ozar, Rajapur, Oni, Rajapur, Ratnagiri-416705, Maharashtra.'
      ]} />

      <SectionTitle>11. Acknowledgment</SectionTitle>
      <p>By engaging with our platform, you affirm that you have carefully reviewed and accepted the Terms and Conditions detailed here, ensuring a smooth and transparent experience. We’re truly grateful you’ve chosen YokeTrip to be part of your adventures - let’s make every journey unforgettable!</p>
      <p>Denotions- ** Important /or Critical pointer.</p>
    </div>
  );
}

// Main Settings Component
export default function Settings(props) {
  const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
  const [activeDialog, setActiveDialog] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  const handleShare = async (platform) => {
    const shareText = `🌍 Join YokeTrip! Connect with verified travel buddies and explore authentic adventures. 📲 Download: https://play.google.com/store/apps/details?id=com.yoketrip_india.app`;
    const encodedText = encodeURIComponent(shareText);
    let url = '';

    switch (platform) {
      case 'WhatsApp': url = `https://wa.me/?text=${encodedText}`; break;
      case 'Facebook': url = `https://www.facebook.com/sharer/sharer.php?u=https://yoketrip.com&quote=${encodedText}`; break;
      case 'Twitter': url = `https://twitter.com/intent/tweet?text=${encodedText}`; break;
      default: break;
    }

    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (navigator.share) {
      try {
        await navigator.share({ title: 'YokeTrip', text: shareText });
      } catch (error) {
        alert('Failed to share. Please try again.');
      }
    } else {
      alert('Sharing not supported on this browser.');
    }
  };

  const makeEmergencyCall = () => {
    window.location.href = 'tel:112';
  };

  return (
    <>
      <Header
 {...props}
      />
      <div className="bg-gray-100 min-h-screen pt-16">
        <main className="p-4 md:p-6 max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg p-4">
            <MenuTile title="SOS" icon="emergency" onClick={makeEmergencyCall} />
            <MenuTile title="About Us" icon="info_outline" onClick={() => setActiveDialog('about')} />
            <MenuTile title="Contact Us" icon="contact_mail" onClick={() => setActiveDialog('contact')} />
            <MenuTile title="Privacy Policy" icon="privacy_tip" onClick={() => setActiveDialog('privacy')} />
            <MenuTile title="Terms and Conditions" icon="description" onClick={() => setActiveDialog('terms')} />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-3xl shadow-lg p-6 mt-6">
            <div className="flex items-center mb-4">
              <i className="material-icons text-blue-600 text-3xl">share</i>
              <h2 className="ml-3 text-xl font-bold text-gray-900">Share YokeTrip</h2>
            </div>
            <p className="text-gray-600 mb-6">Join YokeTrip for safe, eco-friendly, and unforgettable travel experiences!</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => handleShare('Facebook')}
                className="flex items-center justify-center py-3 px-4 bg-blue-800 text-white font-semibold rounded-lg hover:bg-blue-900 transition-all"
              >
                <i className="material-icons mr-2">facebook</i> Facebook
              </button>
              <button
                onClick={() => handleShare('Twitter')}
                className="flex items-center justify-center py-3 px-4 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-600 transition-all"
              >
                X
              </button>
              <button
                onClick={() => handleShare('WhatsApp')}
                className="flex items-center justify-center py-3 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-all"
              >
                <i className="material-icons mr-2">message</i> WhatsApp
              </button>
            </div>
          </div>
        </main>

        <InfoDialog title="About Us" isOpen={activeDialog === 'about'} onClose={() => setActiveDialog(null)}>
          <AboutUsContent />
        </InfoDialog>
        <InfoDialog title="Contact Us" isOpen={activeDialog === 'contact'} onClose={() => setActiveDialog(null)}>
          <ContactForm />
        </InfoDialog>
        <InfoDialog title="Privacy Policy" isOpen={activeDialog === 'privacy'} onClose={() => setActiveDialog(null)}>
          <PrivacyPolicyContent />
        </InfoDialog>
        <InfoDialog title="Terms and Conditions" isOpen={activeDialog === 'terms'} onClose={() => setActiveDialog(null)}>
          <TermsAndConditionsContent />
        </InfoDialog>
      </div>
    </>
  );
}
