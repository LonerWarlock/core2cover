"use client";

import React, { useEffect, useState } from "react";
import "./DesignerInfo.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useRouter, useSearchParams } from "next/navigation";
// import { FaArrowLeft, FaStar, FaUser, FaExternalLinkAlt } from "react-icons/fa";
import { LuMapPin } from "react-icons/lu";
import { hireDesigner } from "../../api/designer";
import Image from "next/image";
import { FaArrowLeft } from "react-icons/fa";

const DesignerInfo = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const designerId = searchParams.get("id");

  const [designer, setDesigner] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Hire Form State
  const [hireForm] = useState({ fullName: "", mobile: "", email: "", location: "", budget: "", workType: "", timelineDate: "", description: "" });

  useEffect(() => {
    if (!designerId) return;
    queueMicrotask(() => setLoading(true));
    // Fetch data in parallel
    Promise.all([
        fetch(`/api/designer/${designerId}/info`),
        fetch(`/api/designer/${designerId}/ratings`)
    ]).then(async ([infoRes]) => {
        if(infoRes.ok) {
            const info = await infoRes.json();
            setDesigner(info);
            // set active image
            setActiveImage(info.image || null);
        }
    }).finally(() => setLoading(false));
  }, [designerId]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    if(!userId) return alert("Please login first");
    
    try {
        await hireDesigner(designerId, { ...hireForm, userId });
        alert("Request sent!");
        setShowForm(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch(err) {
        alert("Failed to send request");
    }
  };

  if (loading || !designer) return (<><Navbar /><p style={{padding:40}}>Loading...</p></>);

  return (
    <>
      <Navbar />
      <div className="designer-info-page"> {/* CHANGED */}
        <button className="back-btn" onClick={() => router.back()}>
          <FaArrowLeft /> Back
        </button>

        <div className="designer-info-layout">
           <div className="designer-text">
             <Image src={designer.image || "/assets/images/sample.jpg"} className="designer-photo" alt={designer.name} />
             <h1>{designer.name}</h1>
             <p><LuMapPin /> {designer.location}</p>
             <button className="hire-btn" onClick={() => setShowForm(true)}>Hire This Designer</button>
           </div>
           
           <div className="designer-main-image">
             {activeImage && <Image src={activeImage} alt={designer.name} width={500} height={500} />}
           </div>
        </div>

        {/* ... Portfolio and Reviews sections ... */}
        
        {showForm && (
            <div className="modal-overlay" onClick={() => setShowForm(false)}>
                <div className="modal-box" onClick={e => e.stopPropagation()}>
                    <h2>Hire Designer</h2>
                    <form onSubmit={handleHireSubmit}>
                        {/* ... Input fields ... */}
                        <button type="submit">Send Request</button>
                    </form>
                </div>
            </div>
        )}
      </div>
      <Footer />
    </>
  );
};
export default DesignerInfo;