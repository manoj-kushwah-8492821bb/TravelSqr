
import moment from "moment";

const HotelProperties = ({ hotelData }) => {

  return (
    <>
      {hotelData.slice(0, 7).map((item) => (
        <div className="col-12" key={item?.id}>
          <div className="border-bottom-light pb-30">
            <div className="row x-gap-20 y-gap-20">
              <div className="col-md-auto">
                {/* <div className="cardImage ratio ratio-1:1 w-250 md:w-1/1 rounded-4">
                  <div className="cardImage__content">
                    <div className="cardImage-slider rounded-4  custom_inside-slider">
                      <Swiper
                        className="mySwiper"
                        modules={[Pagination, Navigation]}
                        pagination={{
                          clickable: true,
                        }}
                        navigation={true}
                      >
                        {item?.slideImg?.map((slide, i) => (
                          <SwiperSlide key={i}>
                            <Image
                              width={250}
                              height={250}
                              className="rounded-4 col-12 js-lazy"
                              src={slide}
                              alt="image"
                            />
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>

                  <div className="cardImage__wishlist">
                    <button className="button -blue-1 bg-white size-30 rounded-full shadow-2">
                      <i className="icon-heart text-12"></i>
                    </button>
                  </div>
                </div> */}
              </div>
              {/* End .col */}

              <div className="col-md">
                <h3 className="text-18 lh-16 fw-500">
                  {item?.hotel?.name}
                  {/* <br className="lg:d-none" /> {item?.location} */}
                </h3>

                {/* <div className="row x-gap-10 y-gap-10 items-center pt-10">
                  <div className="col-auto">
                    <p className="text-14">{item?.location}</p>
                  </div>

                  <div className="col-auto">
                    <a
                      href={`https://www.google.com/maps?q=${item.hotel.latitude},${item.hotel.longitude}(${item?.hotel?.name})`}
                      data-x-click="mapFilter"
                      className="d-block text-14 text-blue-1 underline"
                    >
                      Show on map
                    </a>
                  </div>

                  <div className="col-auto">
                    <div className="size-3 rounded-full bg-light-1"></div>
                  </div>

                  <div className="col-auto">
                    <p className="text-14">2 km to city center</p>
                  </div>
                </div> */}

                {item.offers.map((offer) => {
                  return (
                    <>
                      <div className="text-14 lh-15 mt-20">
                        <div className="fw-500">
                          {offer?.room?.typeEstimated?.category?.replaceAll("_", " ")}
                        </div>
                        <div className="text-light-1">
                          {offer?.room?.typeEstimated?.beds}{" "}
                          {offer?.room?.typeEstimated?.bedType}
                        </div>
                      </div>
                      <div className="text-14 text-green-2 lh-15 mt-10">
                        <div className="fw-500">{offer?.policies?.refundable?.cancellationRefund?.replaceAll("_", " ")}  </div>
                        <div className="">
                          You will receive {offer?.policies?.cancellations[0]?.amount}, if you cancel your booking before {moment(offer?.policies?.cancellations[0]?.deadline).format("DD MMMM YYYY hh:mm")}
                        </div>
                      </div>

                      <div className="row x-gap-10 y-gap-10 pt-20">
                        <div className="text-14 lh-14">
                          {offer?.room?.description.text}
                        </div>
                      </div>
                    </>
                  );
                })}

              </div>

              {/* End .col-md */}
              <div className="col-md-auto text-right md:text-left">
                {/* <div className="row x-gap-10 y-gap-10 justify-end items-center md:justify-start">
                  <div className="col-auto">
                    <div className="text-14 lh-14 fw-500">Exceptional</div>
                    <div className="text-14 lh-14 text-light-1">
                      3,014 reviews
                    </div>
                  </div>
                  <div className="col-auto">
                    <div className="flex-center text-white fw-600 text-14 size-40 rounded-4 bg-blue-1">
                      {item?.ratings}
                    </div>
                  </div>
                </div> */}
                {item?.offers?.map((offer) => {
                  return (
                    <div className="">
                      <div className="text-14 text-light-1 mt-50 md:mt-20">
                        {offer?.guests?.adults} adult
                      </div>
                      <div className="text-18 lh-12 fw-600 mt-5">
                        {offer?.price?.currency} {offer?.price?.total}
                      </div>
                      <div className="text-14 text-light-1 mt-5">
                        {offer?.price?.variations?.changes?.map((change) => {
                          return (
                            <div className="text-14 text-light-1 mt-5">
                              {change?.startDate} To {change?.endDate}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        className="button -md w-100 -dark-1 bg-blue-1 text-white mt-24"
                      >
                        Book Now
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default HotelProperties;
