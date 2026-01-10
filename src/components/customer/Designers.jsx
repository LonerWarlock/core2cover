"use client";

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import DesignerCard from "./DesignerCard";
import Footer from "./Footer";
import "./ProductListing.css";

const Designers = () => {
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use relative path for Next.js API
    fetch("/api/designers")
      .then(res => res.json())
      .then(data => setDesigners(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // const categories = useMemo(() => ["All", ...new Set(designers.map(d => d.category).filter(Boolean))], [designers]);
  // ... filtering logic remains ...

  return (
    <>
      <Navbar />
      <section className="products-section">
        <h2 className="products-title">Designers</h2>
        {/* ... Filters ... */}
        <div className="product-grid">
           {!loading && designers.map((d) => (
             <DesignerCard
               key={d.id}
               id={d.id}
               name={d.name}
               image={d.imageUrl} // Ensure this is a valid path or handle inside card
               category={d.category}
               description={d.description}
               designer={d.name}
               origin={d.designerLocation}
             />
           ))}
        </div>
      </section>
      <Footer />
    </>
  );
};
export default Designers;