import Image from "next/image";
import { useState, useEffect } from "react";
import Slider from "react-slick";
import axios from "axios";
import { BASE_URL, BASE_URL_IMG } from "../../config";
import toast from "react-hot-toast";
//import { testimonial1 } from "../../data/testimonialData";

const Testimonial = () => {
  var settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },

      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 520,
        settings: {
          slidesToShow: 1,
          dots: true,
        },
      },
    ],
  };
  const [testimonial,setTestimonial] = useState([]);
  const getTestimonial = async() => {
    try {
      const testimonial = await axios.get(
        BASE_URL + "admin/feedback/get_without_token",
        {},
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (testimonial?.data?.succeeded === true) {
        setTestimonial(testimonial?.data?.ResponseBody);
        //setIsLoading(false);
      } else {
        toast.error(testimonial?.data?.ResponseMessage);
      }
    } catch (err) {
      //console.log(err);
    }
  }
  useEffect(()=>{
    getTestimonial();
  },[])
  return (
    <>
      <Slider {...settings}>
        {testimonial.map((item) => (
          <div
            className="testimonials -type-1 bg-white rounded-4 pt-40 pb-30 px-40"
            key={item._id}
            data-aos="fade"
            data-aos-delay="200"
          >
            {/* <h4 className="text-16 fw-500 text-blue-1 mb-20">{item?.meta}</h4> */}
            <p className="testimonials__text lh-18 fw-500 text-dark-1">
              {item?.feedback}
            </p>
            <div className="pt-20 mt-28 border-top-light">
              <div className="row x-gap-20 y-gap-20 items-center">
                <div className="col-auto">
                  <img
                    width={60}
                    height={60}
                    src={`${BASE_URL_IMG}${item?.profile_pic}`}
                    alt="image"
                    className="size-60"
                  />
                </div>
                <div className="col-auto">
                  <div className="text-15 fw-500 lh-14">{item?.user_name}</div>
                  {/* <div className="text-14 lh-14 text-light-1 mt-5">
                    {item?.designation}
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
};

export default Testimonial;
