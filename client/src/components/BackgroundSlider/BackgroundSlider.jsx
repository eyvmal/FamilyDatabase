import React, { useState, useEffect } from "react";
import "./BackgroundSlider.css";
import img1 from "./pictures/img1.jpeg";
import img2 from "./pictures/img2.jpeg";
import img3 from "./pictures/img3.jpeg";

const images = [img1, img2, img3];

const BackgroundSlider = ({ children }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); // 10

    return () => clearInterval(interval); // Clear the interval when the component is unmounted
  }, []);

  return (
    <div className="container">
      {images.map((img, index) => (
        <div
          key={index}
          className={`pic ${currentImageIndex === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      {children}
    </div>
  );
};

export default BackgroundSlider;
