const { useState, useEffect } = React;
const { useNavigate } = ReactRouterDOM;

const GuideRegistrationPage = () => {
  const navigate = useNavigate();
  const [workLocation, setWorkLocation] = useState('');
  const [price, setPrice] = useState('');
  const [priceType, setPriceType] = useState('per day');
  const [languages, setLanguages] = useState([]);
  const [availability, setAvailability] = useState(Array(7).fill(false));
  const [about, setAbout] = useState('');
  const [isCertified, setIsCertified] = useState(false);
  const [certificateFile, setCertificateFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const languageOptions = [
    'Hindi', 'English', 'Bengali', 'Marathi', 'Telugu', 'Tamil', 'Gujarati',
    'Urdu', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Maithili',
    'Sanskrit', 'Konkani', 'Manipuri', 'Dogri', 'Sindhi', 'Bodo', 'Santhali',
    'Kashmiri', 'Nepali', 'Tulu', 'Rajasthani'
  ];

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleLocationChange = async (e) => {
    const query = e.target.value;
    setWorkLocation(query);
    if (query) {
      const results = await guideServices.getLocationSuggestions(query);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!workLocation || !price || !about) {
      alert('Please fill all required fields');
      return;
    }
    if (isCertified && !certificateFile) {
      alert('Please upload your certificate');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await guideServices.getToken();
      const userId = 'user123'; // Mock user ID
      const guide = new Guide({
        userId,
        workLocation,
        price: parseFloat(price),
        priceType,
        languages,
        availability,
        about,
        isCertified,
        createdAt: new Date()
      });
      const createdGuide = await guideServices.saveGuideProfile({ guide, certificateFile, token });
      if (createdGuide) {
        navigate('/');
      }
    } catch (e) {
      alert(`Error saving profile: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}
      <h1 className="text-2xl font-bold text-purple-600 mb-4">👋 Become a Travel Guide</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">📍 Work Location</h3>
          <div className="relative">
            <input
              type="text"
              value={workLocation}
              onChange={handleLocationChange}
              placeholder="Work Location"
              className="w-full p-2 border rounded"
              required
            />
            {suggestions.length > 0 && (
              <ul className="absolute z-10 bg-white border rounded w-full mt-1 max-h-40 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => { setWorkLocation(suggestion); setSuggestions([]); }}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">💰 Pricing</h3>
          <div className="flex space-x-2">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price"
              className="flex-2 p-2 border rounded"
              required
            />
            <select
              value={priceType}
              onChange={(e) => setPriceType(e.target.value)}
              className="flex-1 p-2 border rounded"
            >
              <option value="per day">per day</option>
              <option value="per hour">per hour</option>
            </select>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">🗣️ Languages You Speak</h3>
          <div className="flex flex-wrap gap-2">
            {languageOptions.map(lang => (
              <button
                type="button"
                key={lang}
                className={`px-3 py-1 rounded ${languages.includes(lang) ? 'bg-purple-100' : 'bg-gray-200'}`}
                onClick={() => setLanguages(languages.includes(lang) ? languages.filter(l => l !== lang) : [...languages, lang])}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">📅 Availability</h3>
          <div className="flex flex-wrap gap-4">
            {days.map((day, index) => (
              <label key={day} className="flex flex-col items-center">
                {day}
                <input
                  type="checkbox"
                  checked={availability[index]}
                  onChange={() => {
                    const newAvailability = [...availability];
                    newAvailability[index] = !newAvailability[index];
                    setAvailability(newAvailability);
                  }}
                />
              </label>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">📝 About You</h3>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell us about yourself"
            className="w-full p-2 border rounded"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <h3 className="text-lg font-semibold">📄 Certification</h3>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
            />
            <span className="ml-2">I have a certification</span>
          </label>
          {isCertified && (
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCertificateFile(e.target.files[0])}
              className="mt-2"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Profile'}
        </button>
      </form>
    </div>
  );
};
export default GuideRegistrationPage;