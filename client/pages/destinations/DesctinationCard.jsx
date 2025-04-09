import React from "react";
import Slider from "react-slick";
import { useRouter } from "next/router";
import HtmlParser from "react-html-parser";
import { BASE_URL_IMG } from "../../config";

const DesctinationCard = ({ item }) => {
  const router = useRouter();

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
        <i
          className="icon icon-chevron-right text-12"
          style={{ marginTop: "80px" }}
        ></i>
      ) : (
        <span
          className="icon icon-chevron-left text-12"
          style={{ marginTop: "80px" }}
        ></span>
      );

    return (
      <button
        className={className}
        onClick={props.onClick}
        style={{
          position: "absolute",
          top: "50%",
          [props.type === "next" ? "right" : "left"]: "10%",
          transform: "translateY(-50%)",
        }}
      >
        {char}
      </button>
    );
  }
  const handleClickDestination = (itemId) => {
    router.push(`/destinations/details?id=${itemId}`);
  };

  return (
    <div
      className="hotelsCard -type-1 hover-inside-slider"
      style={{ cursor: "pointer" }}
    >
      {/* image slides */}
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
                    src={BASE_URL_IMG + slide}
                    alt="image"
                  />
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* content */}
      <div
        className="hotelsCard__content mt-10"
        onClick={() => handleClickDestination(item?._id)}
        style={{ cursor: "pointer" }}
      >
        <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
          <span>{HtmlParser(item?.name)}</span>
        </h4>
        <p className="text-light-1 lh-14 text-14 mt-5">{item?.title}</p>
      </div>
    </div>
  );
};

export default DesctinationCard;
