import React from "react";
import { Navigation } from "swiper";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { request } from "../../../api/Api";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { BASE_URL_IMG } from "../../../config";
import { Swiper, SwiperSlide } from "swiper/react";

const PopularRoutes = () => {
  const [destination, setDestination] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const getDestinations = async () => {
    setIsLoading(true);
    try {
      const response = await request("flight/destinations", {}, "get");
      if (response?.response?.succeeded) {
        setDestination(response?.response?.ResponseBody || []);
      } else {
        toast.error(
          response?.response?.data?.ResponseMessage ||
            "Failed to fetch destinations"
        );
      }
    } catch (error) {
      toast.error("An error occurred while fetching destinations.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    getDestinations();
  }, []);

  const handleClickDestination = (itemId) => {
    router.push(`/destinations/details?id=${itemId}`);
  };

  return (
    <div className="container mx-auto layout-pt-md layout-pb-md">
      <div className="col-auto">
        <div className="sectionTitle -md">
          <h2 className="sectionTitle__title">Popular Destinations</h2>
          <p className="sectionTitle__text mt-5 sm:mt-0">
            Book flights to a destination popular with travelers from the US
          </p>
        </div>
      </div>

      <div className="row y-gap-30 p-3 mt-5">
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
          {(isLoading ? Array.from({ length: 4 }) : destination).map(
            (item, index) => (
              <SwiperSlide key={item?.id || index}>
                <div className="rentalCard -type-2" data-aos="fade">
                  <div className="hotelsCard__image">
                    <div
                      style={{ cursor: "pointer" }}
                      className="cardImage ratio ratio-1:1"
                      onClick={() =>
                        !isLoading && handleClickDestination(item?._id)
                      }
                    >
                      <div className="cardImage__content">
                        {isLoading ? (
                          <Skeleton height={350} width={300} borderRadius={8} />
                        ) : (
                          <img
                            width={300}
                            height={350}
                            className="rounded-4 col-12"
                            src={`${BASE_URL_IMG}${item?.images?.[0]}`}
                            alt={item?.name || "Destination"}
                            priority
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className="hotelsCard__content"
                    onClick={() =>
                      !isLoading && handleClickDestination(item?._id)
                    }
                    style={{
                      cursor: "pointer",
                      textAlign: "left",
                      marginTop: "10px",
                    }}
                  >
                    <h4 className="hotelsCard__title text-dark-1 text-18 lh-16 fw-500">
                      {isLoading ? (
                        <Skeleton width={150} height={20} />
                      ) : (
                        <span>{item?.name}</span>
                      )}
                    </h4>
                    <p className="text-light-1 lh-14 text-14 mt-2">
                      {isLoading ? (
                        <Skeleton width={120} height={15} />
                      ) : (
                        item?.title
                      )}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            )
          )}
        </Swiper>
      </div>
    </div>
  );
};

export default PopularRoutes;
