import { useEffect, useState } from "react";
import { request } from "../../api/Api";
import toast from "react-hot-toast";

const count = [
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
  "Twenty",
  "Twenty-One",
  "Twenty-Two",
  "Twenty-Three",
  "Twenty-Four",
  "Twenty-Five",
  "Twenty-Six",
  "Twenty-Seven",
  "Twenty-Eight",
  "Twenty-Nine",
  "Thirty",
];

const Faq = () => {
  const [faqContent, setFaqContent] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const response = await request("flight/faq/get", {}, "get");
      if (response?.response?.succeeded) {
        setFaqContent(response?.response?.ResponseBody);
      } else {
        toast.error(response?.response?.data?.ResponseMessage);
      }
    } catch (error) {
      toast.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <section className="layout-pt-md layout-pb-md">
        <div className="container">
          <div className="row justify-center text-center">
            <div className="col-auto">
              <div className="sectionTitle -md">
                <h2 className="sectionTitle__title">
                  Frequently Asked Questions
                </h2>
              </div>
            </div>
          </div>

          <div className="row y-gap-30 justify-center pt-40 sm:pt-20">
            <div className="col-xl-8 col-lg-10">
              <div
                className="accordion -simple row y-gap-20 js-accordion"
                id="Faq1"
              >
                {(loading ? Array.from({ length: 5 }) : faqContent).map(
                  (item, index) => (
                    <div className="col-md-6 col-12" key={index}>
                      <div className="accordion__item px-20 py-20 border-light rounded-4">
                        <div
                          className="accordion__button d-flex items-center"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${count[index]}`}
                        >
                          <div className="accordion__icon size-40 flex-center bg-light-2 rounded-full mr-20">
                            <i className="icon-plus" />
                            <i className="icon-minus" />
                          </div>
                          <div className="button text-dark-1 text-start">
                            {loading ? (
                              <div className="skeleton w-75 h-20"></div>
                            ) : (
                              item.question
                            )}
                          </div>
                        </div>
                        <div
                          className="accordion-collapse collapse"
                          id={count[index]}
                          data-bs-parent="#Faq1"
                        >
                          <div className="pt-15 pl-60">
                            <p className="text-15">
                              {loading ? (
                                <div className="skeleton w-100 h-15"></div>
                              ) : (
                                item.answer
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Faq;
