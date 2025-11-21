import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../asstes/safar-sathi2.png";
import "../App.css";

const Footer = () => {
  const [downloads, setDownloads] = useState("");
  const [speed, setSpeed] = useState(null);

  // Fetch Play Store downloads
  useEffect(() => {
    fetch("https://yoketrip.in/playStore/downloads")
      .then((res) => res.json())
      .then((data) => setDownloads(data.installs))
      .catch(() => setDownloads("N/A"));
  }, []);

  // Fetch download speed from backend API
  useEffect(() => {
    const getSpeed = async () => {
      try {
        const res = await fetch("https://yoketrip.in/speed");
        const data = await res.json();
        setSpeed(data.speed);
      } catch (err) {
        console.error("Failed to fetch speed:", err);
        setSpeed("N/A");
      }
    };

    getSpeed(); // initial run
    const interval = setInterval(getSpeed, 10000); // every 10 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="footer bg-gray-800 text-white w-full">
      <div className="footer-container container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 py-8">
        {/* Logo & Social */}
        <div className="footer-logo">
          <img src={logo} alt="YokeTrip Logo" className="h-10 mb-2" />
          <div className="flex space-x-4 mt-2">
            <a href="https://www.facebook.com/share/19yegzVA94/" className="text-white hover:text-orange-300">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="https://www.instagram.com/yoketrip?igsh=cXdsaTM3dGx5Zjg5" className="text-white hover:text-orange-300">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://x.com/yoketrip?t=1fmgglYKlPqq8QqwI9mGxQ&s=09" className="text-white hover:text-orange-300">
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        {/* Links */}
        <div className="footer-links">
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <Link to="/" className="block text-sm hover:text-orange-300">Home</Link>
          <Link to="/explore" className="block text-sm hover:text-orange-300">Trips</Link>
          <a href="#download" className="block text-sm hover:text-orange-300">Download</a>
          <a href="#contact" className="block text-sm hover:text-orange-300">Contact</a>
          <Link to="/terms-and-conditions" className="block text-sm hover:text-orange-300">Terms</Link>
          <Link to="/privacy-policy" className="block text-sm hover:text-orange-300">Privacy</Link>
        </div>

        {/* Contact */}
        <div className="footer-contact">
          <h3 className="font-semibold mb-2">Contact Info</h3>
          <p><a href="mailto:info@yoketrip.com" className="hover:text-orange-300">info@yoketrip.com</a></p>
          <p><a href="tel:+919421124210" className="hover:text-orange-300">+91 94211 24210</a></p>
          <p>Ratnagiri, India, Maharashtra</p>
        </div>

        {/* Downloads + Speed */}
        <div className="download-stats">
          <h3 className="font-semibold mb-2">App Stats</h3>
          <p><span className="text-orange-300">{downloads || "Loading..."} downloads</span></p>
          <p><span className="text-orange-300">{speed ? `${speed} Mbps` : "Testing..."}</span></p>
        </div>
      </div>

      <div className="footer-bottom text-center py-4 border-t border-gray-700">
        <p className="text-sm">© {new Date().getFullYear()} YokeTrip. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;