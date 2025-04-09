import React from "react";
import Link from "next/link";
import { destinations6 } from "../../../data/desinations";
import { PiAirplaneTiltLight, PiAirplaneTakeoff } from "react-icons/pi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import "swiper/swiper-bundle.min.css";

const Locations = () => {
  return (
    <div className="container layout-pt-md">
      <div className="row justify-content-between align-items-end mb-4">
        <div className="">
          <div className="d-flex align-items-center mb-3">
            <PiAirplaneTiltLight className="text-primary me-2" size={24} />
            <span className="text-primary fw-medium">Featured Flights</span>
          </div>
          <div className="sectionTitle">
            <h2 className="fw-bold text-dark">Top flights from US</h2>
            <p
              className="text-lg text-gray-600"
              style={{ marginTop: "10px", marginBottom: "20px" }}
            >
              Discover amazing destinations you can reach from the United
              States. Start planning your next adventure today.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4 p-3">
        <Swiper
          modules={[Navigation]}
          spaceBetween={30}
          loop={true}
          navigation={{ nextEl: ".js-next", prevEl: ".js-prev" }}
          breakpoints={{
            500: { slidesPerView: 2, spaceBetween: 20 },
            768: { slidesPerView: 2, spaceBetween: 22 },
            1024: { slidesPerView: 3 },
            1200: { slidesPerView: 4 },
          }}
        >
          {destinations6.map((item) => (
            <SwiperSlide key={item.id}>
              <div
                className="card border-0 rounded-3 overflow-hidden"
                style={{ height: "auto" }}
              >
                <div className="text-decoration-none d-flex flex-column">
                  <div className="position-relative">
                    <img
                      src={item.image}
                      alt={item.location}
                      className="card-img-top w-100"
                      style={{ height: "30vh", objectFit: "cover" }}
                    />
                  </div>
                  <div className="d-flex mt-3 flex-column">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h3 className="h5 fw-semibold text-dark">
                          US to {item.location}
                        </h3>
                        <p className="text-sm text-gray-600">{item.country}</p>
                      </div>
                      <span
                        className="badge text-primary rounded-pill px-3 py-1 text-sm font-medium"
                        style={{ backgroundColor: "rgb(237, 239, 241)" }}
                      >
                        {item.price}
                      </span>
                    </div>

                    <div className="mt-2 d-flex justify-content-between align-items-center text-muted">
                      <div className="d-flex align-items-center">
                        <span className="me-2">
                          <PiAirplaneTakeoff />
                        </span>
                        <span className="text-sm">Direct flight</span>
                      </div>
                      <span className="text-sm">{item.flightTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Locations;
