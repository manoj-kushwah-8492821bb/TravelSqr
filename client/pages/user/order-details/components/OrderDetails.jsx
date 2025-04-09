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

        <div className="border-light rounded-8 px-50 py-40 mt-40">
          <h4 className="text-20 fw-500 mb-30">Your Information</h4>
          <div className="row y-gap-10">
            <div className="col-8">
              <div className="row y-gap-10 border-light rounded-8 px-50 py-40">
                <div className="d-flex justify-between ">
                  <div className="text-15 lh-16">First name</div>
                  <div className="text-15 lh-16 fw-500 text-blue-1">System</div>
                </div>
              </div>
            </div>
            <div className="col-4">
              <div className="row y-gap-10 border-light rounded-8 px-50 py-40">
                <div className="d-flex justify-between ">
                  <div className="text-15 lh-16">First name</div>
                  <div className="text-15 lh-16 fw-500 text-blue-1">System</div>
                </div>
              </div>
            </div>
          </div>
          End .row
        </div>

      </div>
    </>
  );
};

export default BookingTable;
