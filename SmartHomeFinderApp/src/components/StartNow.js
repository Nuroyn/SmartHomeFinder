import React from "react";
import "../styles/globalStyles.css";
import Avata from '../assets/images/Start-now-avarta.svg';




const StartNow = () => {
  return (
    <div className="section">
        <div className="container">
            <div className="start-now-content">
                <div className="image-and-heading-container">
                    <img
                    src={Avata}
                    alt="Start Now"
                    className="start-now-image"
                    />
                    <div className="start-now-heading-paragraph">
                        <h3>Ready to find your dream home?</h3>
                        <p>Get started today with Smart Home Finder and experience a seamless home buying journey with expert guidance every step of the way.</p>
                    </div>
                    
                </div>
                    <div className="start-now-button-container">
                        <button className="start-now-button">Start now</button>
                    </div>
                
            </div>  

        </div>

    </div>
    ); }
export default StartNow;
      