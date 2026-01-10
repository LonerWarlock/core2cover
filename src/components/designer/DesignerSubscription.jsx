import React from "react";
import "./DesignerSubscription.css";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "₹599/month",
    desc: "Perfect for new designers starting their journey.",
    // features: [
    //   "Basic profile visibility",
    //   "Upload 3 portfolio images",
    //   "Limited client reach",
    // ],
    button: "Get Started",
  },
  {
    name: "Standard",
    price: "₹2299 /4 months",
    desc: "Ideal for freelancers wanting better visibility.",
    // features: [
    //   "Full profile visibility",
    //   "Upload 15 portfolio images",
    //   "Appear in designer search",
    //   "Client messaging",
    // ],
    button: "Choose Standard",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "₹6499 /year",
    desc: "Best for professionals looking for maximum exposure.",
    // features: [
    //   "Top placement in search",
    //   "Unlimited portfolio uploads",
    //   "Priority support",
    //   "Featured designer badge",
    // ],
    button: "Go Premium",
  },
];


const DesignerSubscription = () => {
const navigate = useNavigate();

  return (
    <div className="sub-page">
      <div className="sub-header">
        <h1 className="sub-title">Choose Your Plan</h1>
        <p className="sub-subtitle">
          Select a subscription that helps you grow as a designer.
        </p>
      </div>

      <div className="sub-grid">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`sub-card ${p.highlighted ? "sub-card-highlight" : ""}`}
          >
            <h2 className="sub-plan-name">{p.name}</h2>
            <p className="sub-price">{p.price}</p>
            <p className="sub-desc">{p.desc}</p>

            {/* <ul className="sub-features">
              {p.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul> */}

            <button className="sub-btn" onClick={() => navigate("/designer_profile_setup")}>{p.button}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignerSubscription;
