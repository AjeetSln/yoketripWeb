import React from 'react';
import Header from './Header';
import Footer from './footer';

const AboutUsScreen = (props) => {
    const { 
    isLoggedIn, 
    setIsLoggedIn, 
    handleNavClick, 
    toggleDrawer, 
    handleLogout, 
    isChatRoute 
  } = props;
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

    return (
        <>
            <Header {...props} />
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
            <Footer />
        </>
    );
};

export default AboutUsScreen;