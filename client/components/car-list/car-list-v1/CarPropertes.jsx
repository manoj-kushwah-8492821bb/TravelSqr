const CarPropertes = ({ carsData }) => {
  return (
    <>
      {carsData?.searchDetails?.data?.map((item) => (
        <div className="col-12" key={item?.id}>
          <div className="border-bottom-light pb-30">
            <div className="row x-gap-20 y-gap-20">
              <div className="col-md-auto">
                <div className="relative d-flex">
                  <div className="cardImage w-250 md:w-1/1 rounded-4 border-light">
                    <div className="custom_inside-slider">
                      <div className="ratio ratio-1:1">
                        <div className="cardImage__content">
                          <img
                            width={250}
                            height={250}
                            className="rounded-4 col-12 js-lazy"
                            src={item?.vehicle?.imageURL}
                            style={{ objectFit: "contain" }}
                            alt="image"
                          />
                        </div>
                      </div>
                    </div>

                    {/* End image */}
                  </div>
                  {/* End image ratio */}
                </div>
                {/* End relative */}
              </div>
              {/* End .col */}

              <div className="col-md">
                <div className="d-flex flex-column h-full justify-between">
                  <div>
                    <div className="row x-gap-5 items-center">
                      <div className="col-auto">
                        <div className="text-14 text-light-1">
                          {item?.vehicle?.category}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-18 lh-16 fw-500 mt-5">
                      <img
                        width={60}
                        className="rounded-4 js-lazy"
                        src={item?.serviceProvider?.logoUrl}
                        style={{ objectFit: "contain" }}
                        alt="image"
                      />{" "}
                      {item?.serviceProvider?.name}{" "}
                    </h3>
                  </div>
                  <div className="text-14 text-light-1">
                    {item?.vehicle?.description}
                  </div>
                  <div className="col-lg-7 mt-3">
                    <div className="row y-gap-5">
                      <div className="col-sm-6">
                        <div className="d-flex items-center">
                          <i className="icon-user-2" />
                          <div className="text-14 ml-10">
                            {item?.vehicle?.seats[0]?.count}
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex items-center">
                          <i className="icon-luggage" />
                          {item?.vehicle?.baggages.map((bags) => {
                            return (
                              <div className="text-14 ml-10">
                                {bags?.count}
                                {bags?.size && bags?.size}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="items-center">
                      <div className="text-14 fw-500">Cancellation Policy</div>
                      <div>
                        {item.cancellationRules?.map((rule) => (
                          <div className="text-14 d-flex align-items-center gap-2 text-light-1">
                            <div className="size-3 rounded-full bg-light-1" />{" "}
                            {rule?.ruleDescription}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End col-md */}

              <div className="col-md-auto text-right md:text-left">
                <div className="text-18 lh-12 fw-600 mt-70 md:mt-20">
                  {item?.quotation?.currencyCode}{" "}
                  {item?.quotation?.monetaryAmount}
                </div>
                <div className="text-14 text-light-1 mt-5">Total</div>
                <button className="button h-50 px-24 bg-dark-1 text-white mt-24">
                  Book Now
                </button>
              </div>
              {/* End col-md-auto */}
            </div>
            {/* End .row */}
          </div>
        </div>
      ))}
    </>
  );
};

export default CarPropertes;
