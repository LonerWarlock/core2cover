"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Assets
import Sofa from "../../assets/images/Sofa.jpeg";
import Lamp from "../../assets/images/Lamp.jpg";
import Bathroom from "../../assets/images/Bathroom.webp";
import Raw from "../../assets/images/Raw1.png";
import Raw2 from "../../assets/images/Raw2.png";
import Raw3 from "../../assets/images/Raw3.png";
import Designer1 from "../../assets/images/Designer1.png";
import Designer2 from "../../assets/images/Designer2.png";

// Components
import Footer from "./Footer";
import Navbar from "./Navbar"; // Use the actual Navbar component
import "./Home.css";

// SLIDESHOW CARD COMPONENT
const Card = ({ images, title, onClick }) => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % images.length);
        setFade(false);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="partition-card-vertical" onClick={onClick}>
      <div className="partition-img-box">
        <Image
          src={typeof images[index] === 'string' ? images[index] : images[index].src}
          alt={title}
          className={`slideshow-img ${fade ? "fade-out" : "fade-in"}`}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <h2 className="partition-title-under">{title}</h2>
    </div>
  );
};

// MAIN HOME COMPONENT
const Home = () => {
  const router = useRouter();

  return (
    <>
      {/* Calling the Navbar component directly. 
         This solves the 'handleProfileClick' error because that logic 
         lives inside the Navbar component itself.
      */}
      <Navbar />

      {/* PAGE CONTENT */}
      <div className="partition-page fade-in">
        <div className="partition-grid">
          {/* Card 1 */}
          <Card
            title="Finished Products"
            images={[Sofa, Lamp, Bathroom]}
            onClick={() => router.push("/productlisting?page=Finished%20Products&desc=Find%20the%20perfect%20product%20that%20enhances%20your%20quality%20of%20living.")}
          />

          {/* Card 2 */}
          <Card
            title="Raw Materials"
            images={[Raw, Raw2, Raw3]}
            onClick={() => router.push("/productlisting?page=Raw%20Materials&desc=Build%20better%20with%20high-grade%20interior%20raw%20materials.")}
          />

          {/* Card 3 */}
          <Card
            title="Interior & Product Designers"
            images={[
              Designer1,
              Designer2,
              "https://images.pexels.com/photos/6474344/pexels-photo-6474344.jpeg?auto=compress&cs=tinysrgb&w=800",
            ]}
            onClick={() => router.push("/designers")}
          />
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Home;