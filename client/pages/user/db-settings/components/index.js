import React, { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "react-tabs";
import PasswordInfo from "./PasswordInfo";
import PersonalInfo from "./PersonalInfo";
import Rewards from "./Rewards";
import BookingTable from "../../db-booking/components/BookingTable";

const Index = () => {
  const [conTab, setcpontab] = useState("personal information");
  const tabs = [
    {
      label: "Bookings",
      content: <BookingTable />,
    },
    {
      label: "Personal Information",
      content: <PersonalInfo />,
    },
    // {
    //   label: "Location Information",
    //   content: <LocationInfo />,
    // },
    {
      label: "Change Password",
      content: <PasswordInfo />,
    },
    {
      label: "Rewards",
      content: <Rewards />,
    },
  ];
  const changeTab = (tab) => {
    setcpontab(tab.target.value.toLowerCase());
  };

  const [tabIndex, setTabIndex] = useState(0);
  return (
    <>
      {/* <div className="row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32">
        <div className="col-12">
          <h1 className="text-30 lh-14 fw-600">Settings</h1>
          <div className="text-15 text-light-1">
            Click to change {conTab}
          </div>
        </div>
      </div> */}

      <div className="py-30 px-30 rounded-4 bg-white shadow-3">
        <Tabs
          className="tabs -underline-2 js-tabs"
          selectedIndex={tabIndex}
          onSelect={(index) => setTabIndex(index)}
        >
          <TabList className="tabs__controls row x-gap-40 y-gap-10 lg:x-gap-20">
            {tabs.map((tab, index) => (
              <Tab key={index} className="col-auto">
                <button
                  value={tab.label}
                  onClick={changeTab}
                  className="tabs__button text-18 lg:text-16 text-light-1 fw-500 pb-5 lg:pb-0 js-tabs-button"
                >
                  {tab.label}
                </button>
              </Tab>
            ))}
          </TabList>

          <div className="tabs__content pt-30 js-tabs-content">
            {tabs.map((tab, index) => (
              <TabPanel
                key={index}
                className={`-tab-item-${index + 1} ${
                  tabIndex === index ? "is-tab-el-active" : ""
                }`}
              >
                {tab.content}
              </TabPanel>
            ))}
          </div>
        </Tabs>
      </div>
    </>
  );
};

export default Index;
