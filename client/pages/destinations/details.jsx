import React from "react";
import dynamic from "next/dynamic";
import Seo from "../../components/common/Seo";
import DefaultHeader from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Link from "next/link";

import { request } from "../../api/Api";
import { toast } from "react-hot-toast";
import { Navigation } from "swiper";
import { BASE_URL_IMG } from "../../config";
import { Swiper, SwiperSlide } from "swiper/react";
import { useRouter } from "next/router";
import Slider from "react-slick";
import HtmlParser from "react-html-parser";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import DesctinationCard from "./DesctinationCard";

const Details = () => {
  const router = useRouter();
  const { id } = router.query;
  //console.log(id, "details page item");
  const [destData, setDestData] = React.useState({});
  const [destCitiesData, setDestCitiesData] = React.useState([]);
  const [destImage, setDestImage] = React.useState([]);
  const [showMore, setShowMore] = React.useState(false);
  const [coordinate, setCoordinate] = React.useState([]);
  const [generalData, setGeneralData] = React.useState([]);
  const [flagUrl, setFlagUrl] = React.useState("");
  const [topSights, setTopSights] = React.useState([]);
  const [swiper, setSwiper] = React.useState(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

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

  const handleNext = () => {
    if (swiper) {
      swiper.slideTo(activeIndex + 1);
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (swiper) {
      swiper.slideTo(activeIndex - 1);
      setActiveIndex(activeIndex - 1);
    }
  };

  const toggleShowMore = () => {
    setShowMore(!showMore);
  };

  const getDestinationData = async () => {
    setIsLoading(true);
    console.log("Request Body:", { destination_id: id });
    const promiseToken = await request(
      "flight/destinations/detail",
      {
        destination_id: id,
      },
      "post"
    );
    if (promiseToken?.response?.succeeded === false) {
      toast.error(promiseToken?.response?.ResponseMessage);
    } else {
      await setDestData(promiseToken?.response?.ResponseBody);
      await setDestCitiesData(
        promiseToken?.response?.ResponseBody?.nearestCities
      );
      await setDestImage(promiseToken?.response?.ResponseBody?.images);
      await setGeneralData(promiseToken?.response?.ResponseBody?.genralNew);
      await setTopSights(promiseToken?.response?.ResponseBody?.topSights);
      await setFlagUrl(
        promiseToken?.response?.ResponseBody?.genralNew?.flags?.png
      );
      await setCoordinate([
        promiseToken?.response?.ResponseBody?.general_info?.location?.lat,
        promiseToken?.response?.ResponseBody?.general_info?.location?.lon,
      ]);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  function handleImageClick(city, e) {
    e.preventDefault();
    const url = `https://maps.google.com/maps?q=${city},${destData?.name}&t=&z=10&ie=UTF8&iwloc=&output=embed`;

    // Open the URL in a new tab
    window.open(url, "_blank");
  }

  React.useEffect(() => {
    if (id) {
      getDestinationData();
    }
  }, [id]);

  // const customSliderStyles = {
  //   height: "600px",
  // };

  // const customSliderStyles2 = {
  //   height: "300px",
  // };
  const handleClickDestination = (itemId) => {
    router.push(`/destinations/details?id=${itemId}`);
  };

  return (
    <>
      <Seo pageTitle="Destination Details" />

      <div className="header-margin"></div>

      <DefaultHeader />
      {isLoading ? (
        // Display a loader while loading
        <div className="row y-gap-30 layout-pb-md layout-pt-md container mx-auto">
          <div className="col">
            <Skeleton height={"550px"} width={"100%"} />
          </div>
        </div>
      ) : (
        <>
          <section
            data-aos="fade"
            className="d-flex items-center py-15 border-top-light"
          >
            <div className="container">
              <div className="row y-gap-10 items-center justify-between">
                <div className="col-auto">
                  <div className="row x-gap-10 y-gap-5 items-center text-14 text-light-1">
                    <div className="col-auto">
                      <div>{destData?.general_info?.location?.country}</div>
                    </div>
                    <div className="col-auto">
                      <div>&gt;</div>
                    </div>
                    <div className="col-auto">
                      <div>{destData?.general_info?.location?.region}</div>
                    </div>
                    <div className="col-auto">
                      <div>&gt;</div>
                    </div>
                    <div className="col-auto">
                      <div className="text-dark-1">
                        {destData?.general_info?.location?.name}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-auto">
                  <a href="#" className="text-14 text-light-1">
                    Best of {destData?.general_info?.location?.name}
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className="layout-pb-md">
            <div className="container">
              <div className="row">
                {/* <Banner /> */}

                <div className="hotelsCard -type-1 hover-inside-slider">
                  <div className="hotelsCard__image">
                    <div className="cardImage inside-slider">
                      <Slider {...itemSettings}>
                        {destData?.images?.map((slide, i) => (
                          <div className="cardImage" key={i}>
                            <img
                              className="rounded-4 col-12 js-lazy"
                              src={BASE_URL_IMG + slide}
                              alt="image"
                            />
                          </div>
                        ))}
                      </Slider>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row y-gap-20 pt-40">
                <div className="col-auto">
                  <h2>{destData?.title}</h2>
                </div>
                <div className="col-xl-8">
                  {showMore
                    ? HtmlParser(destData?.description)
                    : HtmlParser(destData?.description?.slice(0, 1000))}

                  {/* Display only a portion of the destData?.description */}
                  {destData?.description?.length > 1000 && !showMore && (
                    <button
                      className="d-block text-14 fw-500 text-blue-1 underline mt-20"
                      onClick={toggleShowMore}
                    >
                      ... show more
                    </button>
                  )}
                  {showMore && (
                    <button
                      className="d-block text-14 fw-500 text-blue-1 underline mt-20"
                      onClick={toggleShowMore}
                    >
                      show less
                    </button>
                  )}
                </div>

                <div className="col-xl-4">
                  <iframe
                    style={{ position: "relative", zIndex: "2" }}
                    width="100%"
                    height="300"
                    frameBorder={0}
                    scrolling="no"
                    src={`https://maps.google.com/maps?q=${destData?.general_info?.location?.name}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                    loading="lazy"
                  ></iframe>
                  <style
                    dangerouslySetInnerHTML={{
                      __html:
                        ".mapouter{position:relative;height:300px;width:300px;background:#fff;}",
                    }}
                  />
                </div>
              </div>

              {/* <div className="pt-30 mt-30 border-top-light" /> */}

              {/* <div className="row y-gap-20">
            <div className="col-12">
              <h2 className="text-22 fw-500">Local weather</h2>
            </div>

            <Weather />
          </div> */}

              {/* <div className="pt-30 mt-30 border-top-light" /> */}
              <div className="row y-gap-20">
                <div className="col-12">
                  <h2 className="text-22 fw-500">General info</h2>
                </div>
                <div className="col-xl-3 col-6">
                  <div className="text-15">Time Zone</div>
                  <div className="fw-500">
                    {destData?.general_info?.location?.timezone_id}
                  </div>
                  {typeof generalData?.timezones === "object"
                    ? Object.values(generalData?.timezones).map(
                        (item, index) => (
                          <div className="text-15 text-light-1" key={index}>
                            {index === 0 ? item : ""}
                          </div>
                        )
                      )
                    : "Not Found"}
                </div>
                <div className="col-xl-3 col-6">
                  <div className="text-15">Currency</div>
                  {typeof generalData?.currencies === "object" ? (
                    <ul>
                      {Object.keys(generalData?.currencies).map(
                        (currencyCode) => (
                          <li key={currencyCode}>
                            <div className="fw-500">
                              {generalData?.currencies[currencyCode].name}
                            </div>
                            <div className="text-15 text-light-1">
                              {currencyCode} (
                              {generalData?.currencies[currencyCode].symbol})
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <div className="fw-500">Currency data not available</div>
                  )}
                </div>
                <div className="col-xl-3 col-6">
                  <div className="text-15">Languages</div>
                  <div className="fw-500">
                    {typeof generalData?.languages === "object"
                      ? Object.values(generalData?.languages).join(", ")
                      : "Languages not found"}
                  </div>
                  <div
                    className="text-15 text-light-1"
                    style={{ align: "center" }}
                  >
                    {generalData?.flag}
                  </div>
                </div>
                <div className="col-xl-2 col-6">
                  <div className="text-15">Flag</div>
                  <img width={100} src={flagUrl} />
                </div>
              </div>
              <div className="mt-30 border-top-light" />
            </div>
          </section>

          <section className="layout-pt-md layout-pb-lg">
            <div className="container">
              <div className="row y-gap-20">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">
                      Nearest Cities from {destData?.name}
                    </h2>
                    <p className=" sectionTitle__text mt-5 sm:mt-0">
                      These popular destinations have a lot to offer
                    </p>
                  </div>
                </div>
              </div>
              <div className="row y-gap-20">
                {destCitiesData?.map((item, index) => (
                  <div
                    className="col-lg-3 col-sm-6"
                    key={item?._id}
                    data-aos="fade"
                    data-aos-delay={100 * index}
                  >
                    <DesctinationCard item={item} />
                  </div>
                ))}
              </div>

              {/* <div className="pt-40 relative">
                <>
                  <Swiper
                    spaceBetween={30}
                    className="overflow-visible"
                    modules={[Navigation]}
                    navigation={{
                      nextEl: ".js-top-desti2-next_active-1",
                      prevEl: ".js-top-desti2-prev_active-1",
                    }}
                    breakpoints={{
                      540: {
                        slidesPerView: 2,
                        spaceBetween: 20,
                      },
                      768: {
                        slidesPerView: 2,
                        spaceBetween: 22,
                      },
                      1024: {
                        slidesPerView: 3,
                      },
                      1200: {
                        slidesPerView: 6,
                      },
                    }}
                  >
                    {destCitiesData?.map((item, i) => (
                      <SwiperSlide key={item?._id}>
                        <Link
                          href="#"
                          className="citiesCard -type-2"
                          data-aos="fade"
                          data-aos-delay={i * 100}
                        >
                          <div className="citiesCard__image rounded-4 ratio ratio-1:1">
                            <img
                              width={191}
                              height={191}
                              className="img-ratio rounded-4 js-lazy"
                              src={BASE_URL_IMG+item?.images[0]}
                              alt="image"
                            />
                          </div>
                          <div className="citiesCard__content mt-10">
                            <h4 className="text-18 lh-13 fw-500 text-dark-1 text-capitalize">
                              {HtmlParser(item?.name)}
                            </h4>
                            <div className="text-14 text-light-1">
                              {(item?.distance).toFixed(2)} kilometers away
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  <button className="section-slider-nav -prev flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none  js-top-desti2-prev_active-1">
                    <i className="icon icon-chevron-left text-12" />
                  </button>
                  <button className="section-slider-nav -next flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none  js-top-desti2-next_active-1">
                    <i className="icon icon-chevron-right text-12" />
                  </button>
                </>
              </div> */}
            </div>
          </section>

          <section className="layout-pt-md layout-pb-lg">
            <div className="container">
              <div className="row">
                <div className="col-auto">
                  <div className="sectionTitle -md">
                    <h2 className="sectionTitle__title">
                      Top sights in {destData?.name}
                    </h2>
                    <br />
                  </div>
                </div>
              </div>
              <div className="pt-40 relative">
                <Swiper
                  spaceBetween={30}
                  className="overflow-visible"
                  modules={[Navigation]}
                  navigation={{
                    nextEl: ".js-top-desti2-next_active",
                    prevEl: ".js-top-desti2-prev_active",
                  }}
                  breakpoints={{
                    540: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    768: {
                      slidesPerView: 2,
                      spaceBetween: 22,
                    },
                    1024: {
                      slidesPerView: 3,
                    },
                    1200: {
                      slidesPerView: 6,
                    },
                  }}
                >
                  {topSights?.map((item, index) => (
                    <SwiperSlide key={item._id}>
                      <Link
                        href="#"
                        className="citiesCard -type-2"
                        data-aos="fade"
                        data-aos-delay={100 * index}
                      >
                        <div className="citiesCard__image rounded-4 ratio ratio-1:1">
                          <img
                            width={191}
                            height={191}
                            className="img-ratio rounded-4 js-lazy"
                            src={item.images[0]}
                            alt="image"
                            onClick={(e) => handleImageClick(item.name, e)}
                          />
                        </div>
                        <div className="citiesCard__content mt-10">
                          <h4
                            className="text-14 lh-13 fw-500 text-dark-1 text-capitalize"
                            style={{ textAlign: "center" }}
                          >
                            {item.name}
                          </h4>
                          {/* <div className="text-14 text-light-1">
                      {item.properties} properties
                    </div> */}
                        </div>
                      </Link>
                    </SwiperSlide>
                  ))}
                </Swiper>
                <button
                  className="section-slider-nav -prev flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-prev_active arrow"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                  }}
                >
                  <span
                    className="icon icon-chevron-left text-12"
                    style={{ marginTop: "80px" }}
                  ></span>
                </button>
                <button
                  className="section-slider-nav -next flex-center bg-white text-dark-1 size-40 rounded-full shadow-1 sm:d-none js-top-desti2-next_active arrow"
                  style={{
                    position: "absolute",
                    top: "50%",
                    right: "10px",
                    transform: "translateY(-50%)",
                    zIndex: 10,
                  }}
                >
                  <i
                    className="icon icon-chevron-right text-12"
                    style={{ marginTop: "80px" }}
                  ></i>
                </button>
              </div>
            </div>
          </section>
        </>
      )}
      <Footer />
      {/* <style>
        {`
          .slick-slider, .slick-track, .slick-list {
            height: ${customSliderStyles.height} !important;
          }
        `}
      </style> */}
    </>
  );
};

export default dynamic(() => Promise.resolve(Details), { ssr: false });
