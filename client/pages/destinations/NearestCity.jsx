import React from "react";
import Slider from "react-slick";
import HtmlParser from "react-html-parser";
import { BASE_URL_IMG } from "../../config";

function NearestCity(props) {
  var itemSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    nextArrow: <ArrowSlick type="next" />,
    prevArrow: <ArrowSlick type="prev" />,
  };

  function ArrowSlick(props) {
    let className =
      props.type === "next"
        ? "slick_arrow-between slick_arrow -next arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-next"
        : "slick_arrow-between slick_arrow -prev arrow-md flex-center button -blue-1 bg-white shadow-1 size-30 rounded-full sm:d-none js-prev";
    className += " arrow";
    const char =
      props.type === "next" ? (
        <>
          <i className="icon icon-chevron-right text-12"></i>
        </>
      ) : (
        <>
          <span className="icon icon-chevron-left text-12"></span>
        </>
      );
    return (
      <button className={className} onClick={props.onClick}>
        {char}
      </button>
    );
  }
  const customSliderStyles = {
    height: "100px !important",
  };
  //const [destCitiesData, setDestCitiesData] = React.useState([]);
  return (
    <>
      <section className="layout-pt-md layout-pb-lg">
        <div className="container">
          <div className="row y-gap-20">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Nearest Cities from {props?.name}
                </h2>
                <p className=" sectionTitle__text mt-5 sm:mt-0">
                  These popular destinations have a lot to offer
                </p>
              </div>
            </div>
          </div>
          <div className="row y-gap-20">
            {props?.destCitiesData?.map((item, index) => (
              <div
                className="col-lg-3 col-sm-6"
                key={item?._id}
                data-aos="fade"
                data-aos-delay={100 * index}
              >
                <div className="hotelsCard -type-1 hover-inside-slider">
                  <div className="hotelsCard__image">
                    <div className="cardImage inside-slider">
                      <Slider {...itemSettings}>
                        {item?.images?.map((slide, i) => (
                          <div
                            className="cardImage ratio ratio-1:1"
                            onClick={() => handleClickDestination(item?._id)}
                            key={i}
                          >
                            <div className="cardImage__content">
                              <img
                                width={300}
                                height={300}
                                className="rounded-4 col-12 js-lazy"
                                src={BASE_URL_IMG + item?.images[0]}
                                alt="image"
                              />
                            </div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>
                  <div
                    className="hotelsCard__content mt-10"
                    onClick={() => handleClickDestination(item?._id)}
                    style={{ cursor: "pointer" }}
                  >
                    <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
                      <span>{HtmlParser(item?.name)}</span>
                    </h4>
                    <p className="text-light-1 lh-14 text-14 mt-5">
                      {(item?.distance).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

    </>
  );
}

export default NearestCity;
