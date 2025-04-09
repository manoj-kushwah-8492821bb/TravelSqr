// import Image from "next/image";
import { useState, useEffect } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Scrollbar } from "swiper";
// import { testimonial1 } from "../../../data/testimonialData";
import axios from "axios";
import { BASE_URL, BASE_URL_IMG } from "../../../config";
import toast from "react-hot-toast";

const Testimonial = () => {
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
      <Swiper
        scrollbar={{
          el: ".js-scrollbar",
          draggable: true,
        }}
        modules={[Scrollbar]}
      >
        {testimonial.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="row items-center x-gap-30 y-gap-20">
              <div className="col-auto">
                <img width={80} height={80} src={`${BASE_URL_IMG}${item?.profile_pic}`} alt="image" />
              </div>
              <div className="col-auto">
                <h5 className="text-16 text-white fw-500">{item?.user_name}</h5>
                {/* <div className="text-15 text-white lh-15">
                  {item.designation}
                </div> */}
              </div>
            </div>
            <p className="text-18 fw-400 text-white mt-30 sm:mt-20">
              {item?.feedback}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* start scroll pagination */}
      <div className="d-flex items-center mt-60 sm:mt-20 js-testimonials-slider-pag">
        <div className="text-white fw-500 js-current">1</div>
        <div className="slider-scrollbar -light bg-white-10 ml-20 mr-20 w-max-300  js-scrollbar" />
        <div className="text-white fw-500 js-all">{testimonial?.length}</div>
      </div>
      {/* end scroll pagination */}
    </>
  );
};

export default Testimonial;
