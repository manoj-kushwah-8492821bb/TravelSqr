import { useState } from "react";
import { toast } from "react-hot-toast";

const offers = [
  {
    img: "/img/blog/offer1.png",
    title: "Exclusive Discounts",
    text: "Save big with our limited-time offers and special discounts.",
    promoCode: "EXCLUSIVE20",
  },
  {
    img: "/img/blog/offer2.webp",
    title: "Best Flight Deals",
    text: "Find the lowest fares on top airlines and travel affordably.",
    promoCode: "FLIGHT50",
  },
  {
    img: "/img/blog/offer3.webp",
    title: "Holiday Specials",
    text: "Save big on holiday flights with exclusive deals on your next getaway!",
    promoCode: "HOLIDAY25",
  },
];

const OffersDeals = () => {
  const [copied, setCopied] = useState(false);

  const handlePromoCodeClick = (promoCode) => {
    navigator.clipboard.writeText(promoCode);
    toast.success("Promo Code copied: " + promoCode);
  };

  return (
    <div className="container layout-pt-md">
      <div className="offers-wrapper">
        {offers.map((offer, index) => (
          <div className="offer-card" key={index}>
            <img src={offer.img} alt={offer.title} className="offer-icon" />
            <h3>{offer.title}</h3>
            <p>{offer.text}</p>
            <button
              className="promo-button"
              onClick={() => handlePromoCodeClick(offer.promoCode)}
            >
              Get Promo Code
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OffersDeals;
