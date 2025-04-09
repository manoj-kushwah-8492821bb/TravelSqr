import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CurrencyChange } from "../../features/CurrencySlice";
import Image from "next/image";

const CurrenctyMegaMenu = ({ textClass }) => {
  const dispatch = useDispatch();
  let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);
  const [click, setClick] = useState(false);
  const handleCurrency = () => setClick((prevState) => !prevState);

  const currencyContent = [
    {
      id: 1,
      name: "United States Dollar",
      currency: "USD",
      symbol: "$",
      country: "United States",
      flag:"/img/general/01United-States.png",
      status:true,
    },
    {
      id: 2,
      name: "Australian Dollar",
      currency: "AUD",
      symbol: "$",
      country: "Australia",
      flag:"/img/general/02Australia.png",
      status:true,
    },
    {
      id: 3,
      name: "Brazilian Real",
      currency: "BRL",
      symbol: "R$",
      country: "Brazil",
      flag:"/img/general/03Brazi.png",
      status:true,
    },
    {
      id: 4,
      name: "Bulgarian Lev",
      currency: "BGN",
      symbol: "лв.",
      country: "Bulgaria",
      flag:"/img/general/04Bulgaria.png",
      status:true,
    },
    {
      id: 5,
      name: "Canadian Dollar",
      currency: "CAD",
      symbol: "$",
      country: "Canada",
      flag:"/img/general/05Canada.png",
      status:true,
    },
    {
      id: 6,
      name: "Bangladeshi Taka",
      currency: "BDT",
      symbol: "৳",
      country: "Bangladesh",
      flag:"/img/general/06Bangladesh.png",
      status:true,
    },
    {
      id: 7,
      name: "Azerbaijan Manat",
      currency: "AZN",
      symbol: "₼",
      country: "Azerbaijan",
      flag:"/img/general/07Azerbaijan.png",
      status:true,
    },
    {
      id: 8,
      name: "Colombian Peso",
      currency: "COP",
      symbol: "$",
      country: "Colombia",
      flag:"/img/general/08Colombia.png",
      status:true,
    },
    {
      id: 9,
      name: "Omani Rial",
      currency: "OMR",
      symbol: "﷼",
      country: "Oman",
      flag:"/img/general/09Oman.png",
      status:true,
    },
    {
      id: 10,
      name: "Indian Rupee",
      currency: "INR",
      symbol: "₹",
      country: "India",
      flag:"/img/general/10India.png",
      status:true,
    },
    {
      id: 11,
      name: "Iranian Rial",
      currency: "IRR",
      symbol: "﷼",
      country: "Iran",
      flag:"/img/general/11Iran.png",
      status:true,
    },
    {
      id: 12,
      name: "Japanese Yen",
      currency: "JPY",
      symbol: "¥",
      country: "Japan",
      flag:"/img/general/12Japan.png",
      status:true,
    },
    {
      id: 13,
      name: "Jersey Pound",
      currency: "JEP",
      symbol: "£",
      country: "Jersey",
      flag:"/img/general/13Jersey.png",
      status:true,
    },
    {
      id: 14,
      name: "South Korean Won",
      currency: "KRW",
      symbol: "₩",
      country: "South Korea",
      flag:"/img/general/14South-Korea.png",
      status:true,
    },
    {
      id: 15,
      name: "Lebanese Pound",
      currency: "LBP",
      symbol: "£",
      country: "Lebanon",
      flag:"/img/general/15Lebanon.png",
      status:true,
    },
    {
      id: 16,
      name: "Liberian Dollar",
      currency: "LRD",
      symbol: "$",
      country: "Liberia",
      flag:"/img/general/16Liberia.png",
      status:true,
    },
    {
      id: 17,
      name: "Malaysian Ringgit",
      currency: "MYR",
      symbol: "RM",
      country: "Malaysia",
      flag:"/img/general/17Malaysia.png",
      status:true,
    },
    {
      id: 18,
      name: "Mexican Peso",
      currency: "MXN",
      symbol: "$",
      country: "Mexico",
      flag:"/img/general/18Mexico.png",
      status:true,
    },
    {
      id: 19,
      name: "Namibian Dollar",
      currency: "NAD",
      symbol: "N$",
      country: "Namibia",
      flag:"/img/general/19Namibia.png",
      status:true,
    },
    {
      id: 20,
      name: "Nepalese Rupee",
      currency: "NPR",
      symbol: "₨",
      country: "Nepal",
      flag:"/img/general/20Nepal.png",
      status:true,
    },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState(currencyData);

  const handleItemClick = (item) => {
    setSelectedCurrency(item);
    setClick(false);
  };

  useEffect(()=>{
    dispatch(CurrencyChange(selectedCurrency));
  },[selectedCurrency])

  return (
    <>
      {/* Start currencty dropdown wrapper */}
      <div className="col-auto">
        <button
          className={`d-flex items-center text-14 ${textClass}`}
          onClick={handleCurrency}
        >
          <Image
            width={20}
            height={20}
            src={selectedCurrency.flag}
            alt="image"
            className="rounded-full mr-10"
          />
          <span className="js-currencyMenu-mainTitle">
            {`${selectedCurrency.name} - ${selectedCurrency.currency} (${selectedCurrency.symbol})`}
          </span>
          <i className="icon-chevron-sm-down text-7 ml-10" />
        </button>
      </div>
      {/* End currencty dropdown wrapper */}

      <div
        className={`currencyMenu js-currencyMenu ${click ? "" : "is-hidden"}`}
      >
        <div className="currencyMenu__bg" onClick={handleCurrency}></div>
        <div className="currencyMenu__content bg-white rounded-4">
          <div className="d-flex items-center justify-between px-30 py-20 sm:px-15 border-bottom-light">
            <div className="text-20 fw-500 lh-15">Select your currency</div>
            {/* End Title */}

            <button className="pointer" onClick={handleCurrency}>
              <i className="icon-close" />
            </button>
            {/* End colse button */}
          </div>
          {/* End flex wrapper */}
          <ul className="modalGrid px-30 py-30 sm:px-15 sm:py-15">
            {currencyContent.map((item) => (
              <li
                className={`modalGrid__item js-item ${
                  selectedCurrency.currency === item.currency ? "active" : ""
                }`}
                key={item.id}
                onClick={() => handleItemClick(item)}
              >
                <div className="py-10 px-15 sm:px-5 sm:py-5">
                  <div className="text-15 lh-15 fw-500 text-dark-1">
                    {item.name}
                  </div>
                  <div className="text-14 lh-15 mt-5">
                    <span className="js-title">{item.currency}</span>-{" "}
                    {item.symbol}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default CurrenctyMegaMenu;
