import React, { useState } from "react";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

const FAQSection = () => {
  const faqs = [
    {
      category: "Travelsquare.com Flights",
      items: [
        {
          question: "How do I find the cheapest flights on Travelsquare.com?",
          answer:
            "You can sort flights by price to see them from cheapest to most expensive. To find the cheapest flights, you also need to consider factors like when you're Travelsquare and want to travel.",
        },
        {
          question: "Can I book one-way flights on Travelsquare.com?",
          answer:
            "Yes, you can book one-way flights easily using the search filters.",
        },
        {
          question: "How far in advance can I book a flight?",
          answer:
            "You can book flights up to 11 months in advance, depending on the airline.",
        },
      ],
    },
    {
      category: "General Questions",
      items: [
        {
          question: "Do flights get cheaper closer to departure?",
          answer:
            "Not always. Prices often fluctuate based on demand and availability.",
        },
        {
          question: "What is a flexible ticket?",
          answer:
            "A flexible ticket allows changes or cancellations with minimal or no extra charges.",
        },
        {
          question: "Does Travelsquare.com charge credit card fees?",
          answer:
            "Travelsquare.com does not charge extra fees for using credit cards.",
        },
      ],
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="container" style={{ marginBottom: "40px" }}>
      <h2 className="faq-title">Frequently asked questions</h2>
      <div className="faq-wrapper">
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="faq-section">
            {section.items.map((faq, index) => {
              const faqIndex = `${sectionIndex}-${index}`;
              return (
                <div key={faqIndex} className="faq-item">
                  <button
                    className={`faq-question ${
                      openIndex === faqIndex ? "active" : ""
                    }`}
                    onClick={() => toggleFAQ(faqIndex)}
                  >
                    {faq.question}
                    <span className="faq-icon">
                      {openIndex === faqIndex ? (
                        <MdKeyboardArrowUp />
                      ) : (
                        <MdKeyboardArrowDown />
                      )}
                    </span>
                  </button>
                  {openIndex === faqIndex && (
                    <div className="faq-answer">{faq.answer}</div>
                  )}
                </div>
              );
            })}

{faqContent.map((item, index) => (
        <div className="col-12" key={index}>
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
                {item.question}
              </div>
            </div>
            {/* End accordion button */}

            <div
              className="accordion-collapse collapse"
              id={count[index]}
              data-bs-parent="#Faq1"
            >
              <div className="pt-15 pl-60">
                <p className="text-15">{item.answer}</p>
              </div>
            </div>
            {/* End accordion conent */}
          </div>
        </div>
      ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
