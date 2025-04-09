import React from "react";

const travelers = [
  {
    name: "Raju Mullah",
    username: "@rajumullah",
    profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
    backgroundImage: "/img/review/1.jpg",
  },
  {
    name: "Zaire Vetrov",
    username: "@zairevetrovs",
    profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
    backgroundImage: "/img/review/2.jpg",
  },
  {
    name: "Marcus Dias",
    username: "@marcusdias",
    profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
    backgroundImage: "/img/review/3.webp",
  },
  {
    name: "Davis Schleifer",
    username: "@davisschleifer",
    profilePic: "https://randomuser.me/api/portraits/men/4.jpg",
    backgroundImage: "/img/review/4.webp",
  },
];

const BestTravelers = () => {
  return (
    <div className="best-travelers-container layout-pt-md">
      <div className="layout-pt-md layout-pb-md">
        <h2 className="title pb-5">Best Travelers Of This Month</h2>
        <div className="travelers-list pt-2">
          {travelers.map((traveler, index) => (
            <div key={index} className="traveler-card col-md-4 col-6">
              <img
                src={traveler.backgroundImage}
                alt=""
                className="background-image"
              />
              <div className="traveler-info">
                <img src={traveler.profilePic} alt="" className="profile-pic" />
                <h3 className="traveler-name">{traveler.name}</h3>
                <p className="traveler-username">{traveler.username}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BestTravelers;
