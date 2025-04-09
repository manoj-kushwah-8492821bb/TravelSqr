"use client";
import { useState, useEffect } from "react";
import { getRequestToken, requestToken } from "../../../../api/Api";
import toast from "react-hot-toast";

const BookingTable = () => {

  const containerStyle = {
    zIndex: 1999,
  };
  return (
    <>
      {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        style={containerStyle}
      /> */}
      <div className="tabs -underline-2 js-tabs">

        
      </div>
    </>
  );
};

export default BookingTable;
