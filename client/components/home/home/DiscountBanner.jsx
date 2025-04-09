import React from "react";

const items = [
  {
    img: "/img/masthead/1/magnifineGlass.png",
    alt: "Search",
    title: "Search a huge selection",
    desc: "Easily compare flights, airlines, and prices – all in one place",
    style: { height: "120px", width: "120px" },
  },
  {
    img: "/img/masthead/1/money.png",
    alt: "No Fees",
    title: "Pay no hidden fees",
    desc: "Get a clear price breakdown every step of the way",
  },
  {
    img: "/img/masthead/1/ticket.png",
    alt: "Flexibility",
    title: "Get more flexibility",
    desc: "Change your travel dates with the Flexible ticket option*",
  },
];

const DiscountBanner = () => (
  <div className="layout-pt-md">
    <div className="discount-banner layout-pt-md layout-pb-md">
      <div className="banner-content container">
        {items.map(({ img, alt, title, desc, style }) => (
          <div className="banner-item" key={alt}>
            <img src={img} alt={alt} className="icon" style={style} />
            <div className="banner_heading">
              <h3 className="pb-2">{title}</h3>
              <p>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="container">
      <p className="disclaimer">
        *Flexible plane tickets are available for an additional cost on select
        airfares
      </p>
    </div>
  </div>
);

export default DiscountBanner;
