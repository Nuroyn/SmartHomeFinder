import React from 'react';
import Logo from "../assets/images/LogoWhiteGold.svg";

const Footer = () => {
    return (



<footer className="footer">
  <div className="footer-container">

    {/* Logo */}
    <div className="footer-logo">
        <img src={Logo} alt="SmartHome Logo" />
      <h3>SmartHome</h3>
      <p>Find your dream home with ease. Trusted by thousands in Nigeria.</p>
    </div>

    {/* Links */}
    <nav className="footer-links" aria-label="Quick links">
      <h4>Quick Links</h4>
      <ul>
        <li><a href="/">Buy</a></li>
        <li><a href="/">Sell</a></li>
        <li><a href="/">Rent</a></li>
        <li><a href="/">About</a></li>
        <li><a href="/">Contact</a></li>
      </ul>
    </nav>

    {/* Contact */}
    <div className="footer-contact">
      <h4>Contact Us</h4>
      <p><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> +234 816 921 2220</p>
      <p><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5-1.207" /></svg> hello@smarthome.ng</p>
      <p><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Abuja, Nigeria.</p>
    </div>

    {/* Social */}
    <div className="footer-social">
      <h4>Follow Us</h4>
      <ul>
        <li><a href="/" aria-label="Facebook"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"/></svg></a></li>
        <li><a href="/" aria-label="Twitter"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M459.37 151.72c.32 4.55.32 9.1.32 13.65 0 138.72-105.58 298.56-298.56 298.56-59.45 0-114.68-17.22-161.14-47.11 8.45.97 16.92.97 25.39.97 49.66 0 95.3-16.91 131.48-45.34-46.42-1.29-85.61-31.45-99.14-73.56 16.29 3.23 33.58 4.84 51.29 5.16-48.39-9.68-83.87-52.26-83.87-103.23 0-.71.32-1.42.65-2.13 13.97 6.79 29.95 10.94 47.27 11.26-28.39-18.97-47.27-51.29-47.27-87.85 0-19.35 5.16-37.32 13.97-52.91 50.72 62.26 126.62 103.23 211.88 107.74-1.94-7.75-2.91-15.81-2.91-24.26 0-58.71 47.55-106.26 106.26-106.26 30.58 0 58.06 12.94 77.41 33.55 24.19-4.84 46.74-13.9 67.25-26.26-7.75 24.19-24.19 44.52-45.68 57.46 21.28-2.59 41.35-8.39 60.03-16.91-14.2 21.28-31.78 39.9-52.26 55.03z"/></svg></a></li>
        <li><a href="/" aria-label="Instagram"><svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.5 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1-26.2 26.2-34.4 58-36.2 93.9-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9 26.2 26.2 58 34.4 93.9 36.2 37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg></a></li>
      </ul>
    </div>

    {/* Download */}
    <div className="footer-download">
      <h4>Get the App</h4>
      <div className="download-buttons">
        <a href="/" className="download-button" aria-label="Download on the App Store">
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" />
        </a>
        <a href="/" className="download-button" aria-label="Get it on Google Play">
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Google Play" style={{height: '60px'}} />
        </a>
      </div>
    </div>

  </div>

  <div className="footer-bottom">
    <p>© {new Date().getFullYear()} SmartHome. All rights reserved. | <a href="/">Privacy Policy</a> | <a href="/">Terms of Service</a></p>
  </div>
        </footer>
    );
};

export default Footer;
