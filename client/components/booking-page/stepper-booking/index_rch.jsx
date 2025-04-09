import React, { useState, useEffect, useMemo } from "react";
import CustomerInfo from "../CustomerInfo";
import PaymentInfo from "../PaymentInfo";
import OrderSubmittedInfo from "../OrderSubmittedInfo";
import { useSelector } from "react-redux";
import { request, getRequestToken, requestToken } from "../../../api/Api";
import moment from "moment";
import { Alert, Row, Col } from "reactstrap";
import "dotenv/config";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionItem,
} from "reactstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import countryList from "react-select-country-list";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Spinner } from "reactstrap";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { useRouter } from "next/router";
import validator from "validator";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Index = (props) => {
  let searchResult = useSelector((state) => state?.flightSearch);
  let paymentResult = useSelector((state) => state?.PaymentSlice?.paymentData);
  let currencyResult = useSelector(
    (state) => state?.CurrencySlice?.currencyData
  );
  let airLineList = useSelector((state) => state?.SidebarData?.airlines);
  let typeArray = { CHILD: "Child", ADULT: "Adult", HELD_INFANT: "Infant" };

  const router = useRouter();
  var namePattern = /^[A-Za-z]+(?:\s[A-Za-z]+)?(?:\s[A-Za-z]+)*$/;
  const [mainError, setMainError] = useState("");
  const [loading, setLoading] = useState(false);
  const [phoneCode, setPhoneCode] = useState(null);
  const [errorPhoneCode, setErrorPhoneCode] = useState("");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOpenRes, setPaymentOpenRes] = useState({
    booking_id: "",
    paymentIntentId: "",
    paymentIntentClientSecret: "",
  });
  const togglePayment = () => {
    setPaymentOpen(!paymentOpen);
  };

  //const submitData = typeof window !== "undefined" ? localStorage.getItem('submitData'):''
  const initialValues = {
    email: '',
    mobile: '',
  };
  const validationSchema = Yup.object({
    email: Yup.string()
      .required("Email is required")
      .matches(
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        "Entered email is invalid"
      ),
    mobile: Yup.string()
      .required("Mobile number is required")
      .matches(/^[^0][0-9]{4,14}$/, "Invalid mobile number")
      .min(5, "Invalid mobile number")
      .max(15, "Invalid mobile number"),
  });
  const onSubmit = async (values, { resetForm }) => {
    //localStorage.setItem("submitData", JSON.stringify({email:values.email,mobile:values.mobile,phoneCode:phoneCode === null ? 1 : phoneCode}));
    let status = 1;
    passCount.map((item, index) => {
      if (item.complete == false) {
        status = 0;
      }
    });
    if (status == 0) {
      setMainError(
        `Hey, we'll need ${
          passCount.length - countUser
        } passenger details to continue.`
      );
    } else {
      setMainError("");
      setLoading(true);
      //console.log(data);
      if (data.length > 0) {
        let travellerData = [];
        data.map((item, index) => {
          let mid = {
            id: index + 1,
            dateOfBirth: moment(item.dateOfBirth).format("YYYY-MM-DD"),
            name: { firstName: item.firstname, lastName: item.lastname },
            gender: item.gender,
            contact: {
              emailAddress: values.email,
              phones: [
                {
                  deviceType: "MOBILE",
                  countryCallingCode: phoneCode === null ? 1 : phoneCode,
                  number: values.mobile,
                },
              ],
            },
            documents: [
              {
                documentType: "PASSPORT",
                birthPlace: item.nationality.value,
                issuanceLocation: item.issueCountry.value,
                issuanceDate: moment(item.issuanceDate).format("YYYY-MM-DD"),
                number: item.number,
                expiryDate: moment(item.expiryDate).format("YYYY-MM-DD"),
                issuanceCountry: item.issueCountry.value,
                validityCountry: item.issueCountry.value,
                nationality: item.nationality.value,
                holder: true,
              },
            ],
          };
          travellerData.push(mid);
        });
        let sendData = {
          priceData: paymentResult,
          travellerData: travellerData,
          payment_method: "card",
        };
        const promiseToken = await requestToken(
          `flight/flight-order-create`,
          sendData,
          "post",
          localStorage.getItem("userToken")
        );
        if (promiseToken.error) {
          //console.log("sasd",(promiseToken?.error?.response?.data?.response?.body?.errors[0]));
          toast.error("Something went wrong. Please try again.");
          //setPaymentOpenRes({...paymentOpenRes,booking_id: '',paymentIntentId: '',paymentIntentClientSecret:''})
          //setPaymentOpen(true)
          setLoading(false);
        } else {
          router.push(
            {
              pathname: "/paymentconfirm",
              query: {
                grandtotal: promiseToken.response.ResponseBody.totalAmount,
                currency: promiseToken.response.ResponseBody.currency,
                clientsecret:
                  promiseToken.response.ResponseBody.paymentIntentClientSecret,
                booking_id: promiseToken.response.ResponseBody.booking_id,
                paymentintentid:
                  promiseToken.response.ResponseBody.paymentIntentId,
              },
            },
            "/paymentconfirm"
          );
          // router.push({
          //   pathname: '/paymentconfirm',
          //   query: { grandtotal:promiseToken.response.ResponseBody.totalAmount,currency:promiseToken.response.ResponseBody.currency,clientsecret:promiseToken.response.ResponseBody.paymentIntentClientSecret,booking_id:promiseToken.response.ResponseBody.booking_id,paymentintentid:promiseToken.response.ResponseBody.paymentIntentId }
          // }, '/paymentconfirm')
        }
      } else {
        setLoading(false);
      }
    }
  };
  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    onSubmit,
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema,
  });

  const [value, setValue] = useState("");
  const [valueIssue, setValueIssue] = useState("");

  const options = useMemo(() => countryList().getData(), []);

  const changeHandler = (value) => {
    setValue(value);
  };
  const changeHandlerIssue = (value) => {
    setValueIssue(value);
  };

  const [countUser, setCountUser] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState([]);
  const [travelData, setTravelData] = useState(paymentResult?.travelerPricings);
  const [aiportName, setAiportName] = useState([]);
  const [logo, setLogo] = useState([]);
  const [currency, setCurrency] = useState(paymentResult?.price?.currency);
  const [symbol, setSymbol] = useState(paymentResult?.price?.symbol);
  const [count, setCount] = useState({
    adult: 0,
    adultPrice: 0,
    adultTax: 0,
    childPrice: 0,
    childPrice: 0,
    childTax: 0,
    infantPrice: 0,
    infantPrice: 0,
    infantTax: 0,
  });
  const [passCount, setPassCount] = useState([]);
  const [total, setTotal] = useState({ taf: 0, tt: 0, cf: 0, gt: 0 });
  const [open, setOpen] = useState(0);
  const toggle = (id) => {
    if (open === id) {
      setOpen();
    } else {
      setOpen(id);
    }
  };
  const changeCode = (phone) => {
    //console.log(phone);
    if (phone == "") {
      setPhoneCode(phone);
      setErrorPhoneCode("Phone Code Field is Required");
    } else {
      setPhoneCode(phone);
      setErrorPhoneCode("");
    }
  };
  //console.log(paymentResult.itineraries);
  //console.log(searchResult?.flightSearch?.dictionaries?.carriers);
  // const [currentStep, setCurrentStep] = useState(0);
  // const steps = [
  //   {
  //     title: "Personal Details",
  //     stepNo: "1",
  //     stepBar: (
  //       <>
  //         <div className="col d-none d-sm-block">
  //           <div className="w-full h-1 bg-border"></div>
  //         </div>
  //       </>
  //     ),
  //     content: <CustomerInfo />,
  //   },
  //   {
  //     title: "Payment Details",
  //     stepNo: "2",
  //     stepBar: (
  //       <>
  //         <div className="col d-none d-sm-block">
  //           <div className="w-full h-1 bg-border"></div>
  //         </div>
  //       </>
  //     ),
  //     content: <PaymentInfo />,
  //   },
  //   {
  //     title: "Final Step",
  //     stepNo: "3",
  //     stepBar: "",
  //     content: <OrderSubmittedInfo />,
  //   },
  // ];

  // const renderStep = () => {
  //   const { content } = steps[currentStep];
  //   return <>{content}</>;
  // };

  // const nextStep = () => {
  //   if (currentStep < steps.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  // const previousStep = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  const TimeDifference = (duration) => {
    const str = duration;
    const hoursMatch = str.match(/(\d+)H/);
    const minutesMatch = str.match(/(\d+)M/);
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
    return `${hours}h ${minutes}m`;
  };
  const TimeDifferenceLayOver = (start, end) => {
    const departureTime = new Date(start);
    const arrivalTime = new Date(end);
    const timeDifference = arrivalTime - departureTime;
    const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
    const minutesDifference = Math.floor(
      (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
    );

    let time = `${hoursDifference}h ${minutesDifference}m`;
    return time;
  };
  useEffect(() => {
    if (airLineList) {
      Object.keys(airLineList).map((key) => {
        getData(key);
      });
    }
  }, [airLineList]);

  useEffect(() => {
    //console.log("sachin",paymentResult.itineraries);
    paymentResult?.itineraries?.map((element) => {
      element?.segments?.forEach((innerElement) => {
        getAirport(innerElement?.arrival?.iataCode);
        getAirport(innerElement?.departure?.iataCode);
      });
    });
    let adult = 0;
    let infant = 0;
    let child = 0;
    let adultPrice = 0;
    let infantPrice = 0;
    let childPrice = 0;
    let adultTax = 0;
    let infantTax = 0;
    let childTax = 0;

    paymentResult?.travelerPricings?.map((item, index) => {
      let number = 0;
      if (item.travelerType == "ADULT") {
        adult++;
        number = adult;
        //adultPrice = Number(adultPrice) + Number(item.price.base)
        adultPrice = Number(item.price.base);
        adultTax =
          Number(adultTax) + Number(item.price.total) - Number(item.price.base);
      }
      if (item.travelerType == "CHILD") {
        child++;
        number = child;
        //childPrice = Number(childPrice) + Number(item.price.base)
        childPrice = Number(item.price.base);
        childTax =
          Number(childTax) + Number(item.price.total) - Number(item.price.base);
      }
      if (item.travelerType == "HELD_INFANT") {
        infant++;
        number = infant;
        //infantPrice = Number(infantPrice) + Number(item.price.base)
        infantPrice = Number(item.price.base);
        infantTax =
          Number(infantTax) +
          Number(item.price.total) -
          Number(item.price.base);
      }

      setPassCount((prevPassCount) => [
        ...prevPassCount,
        { index, type: item.travelerType, complete: false, number: number },
      ]);
      //setCount({...count,adult:adult,adultPrice:adultPrice,adultTax:adultTax,child:child,childPrice:childPrice,childTax:childTax,infant:infant,infantPrice:infantPrice,infantTax:infantTax});
    });
    setCount({
      ...count,
      adult: adult,
      adultPrice: adultPrice,
      adultTax: adultTax,
      child: child,
      childPrice: childPrice,
      childTax: childTax,
      infant: infant,
      infantPrice: infantPrice,
      infantTax: infantTax,
    });
    //setPassCount(Number(adult)+Number(child)+Number(infant));
    let taf = 0;
    let tt = 0;

    if (infant != 0) {
      taf =
        taf + Number(Number(infantPrice) * Number(infant)) + Number(infantTax);
      tt = Number(infantTax);
    }
    if (child != 0) {
      taf = taf + Number(Number(childPrice) * Number(child)) + Number(childTax);
      tt = Number(childTax);
    }
    if (adult != 0) {
      taf = taf + Number(Number(adultPrice) * Number(adult)) + Number(adultTax);
      tt = Number(adultTax);
    }
    taf = taf.toFixed(2);
    tt = tt.toFixed(2);
    let cf = (1.32 * Number(taf)) / 100;
    cf = cf.toFixed(2);
    let gt = Number(taf) + Number(cf);
    gt = gt.toFixed(2);
    setTotal({ ...total, taf: taf, tt: tt, cf: cf, gt: gt });
    //setTravelData(paymentResult?.travelerPricings);
    for (let i = 0; i < Number(adult) + Number(child) + Number(infant); i++) {
      setData((prevData) => [
        ...prevData,
        {
          firstname: "",
          lastname: "",
          dateOfBirth: null,
          number: "",
          issuanceDate: null,
          expiryDate: null,
          issueCountry: "",
          nationality: "",
          gender: "",
        },
      ]);
      setError((prevError) => [
        ...prevError,
        {
          firstname: "",
          lastname: "",
          dateOfBirth: null,
          number: "",
          issuanceDate: null,
          expiryDate: null,
          issueCountry: "",
          nationality: "",
          gender: "",
          errorInd: "",
        },
      ]);
    }
  }, [paymentResult]);

  async function getAirport(key) {
    const promise = await getRequestToken(
      `flight/airports?code=${key}`,
      {},
      "get"
    );
    if (promise.error) {
      //toast.error(promise.error.response.data.ResponseMessage);
    } else {
      const results = promise?.response?.ResponseBody?.docs.filter(
        (obj) => obj.code == key
      );
      setAiportName((aiportName) => [
        ...aiportName,
        { key, name: results[0]?.name },
      ]);
    }
  }

  function capitalizeFLetter(string) {
    // Check if string is null or blank
    if (!string || string.trim() === "") {
      return ""; // or any other default value or handle accordingly
    }

    let lower = string.toLowerCase();
    let arr = lower.split(" ");
    let data = "";

    arr.forEach((element, index) => {
      if (index === 0) {
        data = element[0].toUpperCase() + element.slice(1);
      } else {
        data = data + " " + element[0].toUpperCase() + element.slice(1);
      }
    });

    return data;
  }

  const getData = async (key) => {
    const promise = await request(`flight/airlines?code=${key}`, {}, "get");
    if (promise.error) {
      //return null; // Return a default value or handle the error as needed
    } else {
      // let response = {key:promise.response.ResponseBody[0].logo}
      // setLogo(logo=>[...logo,response]);
      if (promise.response.ResponseBody[0].logo == "") {
        const logoData = "/img/flightIcons/1.png";
        setLogo((prevLogo) => [...prevLogo, { key, logo: logoData }]);
      } else {
        const logoData = promise.response.ResponseBody[0].logo;
        setLogo((prevLogo) => [...prevLogo, { key, logo: logoData }]);
      }
    }
  };
  const findLogo = (key) => {
    let data = logo.filter((element) => element.key === key);
    //console.log(data[0]?.logo);
    if (data[0]?.logo) {
      return data[0]?.logo;
    }
  };
  function searchAirport(code) {
    let data = aiportName.filter((element) => element.key == code);
    if (data[0]?.name) {
      return data[0]?.name;
    }
  }

  const changeFirstName = (e, index) => {
    let dataArray = [...data];
    let errorArray = [...error];

    dataArray[index].firstname = e.target.value;

    if (e.target.value.length < 2) {
      errorArray[index].firstname = "First name must be at least 2 characters";
    } else if (!namePattern.test(e.target.value)) {
      errorArray[index].firstname =
        "Only alphabet are allowed with single space between words";
    } else {
      errorArray[index].firstname = "";
    }

    setData(dataArray);
    setError(errorArray);
  };

  const changeLastName = (e, index) => {
    let dataArray = [...data];
    let errorArray = [...error];

    dataArray[index].lastname = e.target.value;
    if (e.target.value.length < 2) {
      errorArray[index].lastname = "Last name must be at least 2 characters";
    } else if (!namePattern.test(e.target.value)) {
      errorArray[index].lastname =
        "Only alphabet are allowed with single space between words";
    } else {
      errorArray[index].lastname = "";
    }

    setData(dataArray);
    setError(errorArray);
  };

  function isAge(birthdate, start, end) {
    const birthDateObject = new Date(birthdate);
    const currentDate = new Date();

    // Calculate the difference in milliseconds
    const timeDiff = currentDate - birthDateObject;

    // Calculate the difference in years
    const yearsDiff = timeDiff / (1000 * 60 * 60 * 24 * 365.25);
    return yearsDiff > start && yearsDiff <= end;
  }

  const changeDOB = (date, index, type) => {
    let dataArray = [...data];
    let errorArray = [...error];

    dataArray[index].dateOfBirth = date;

    if (date === "") {
      errorArray[index].dateOfBirth = "Date of Birth is required";
    } else {
      //console.log(date,0,2);
      if (type === "Infant") {
        if (!isAge(date, 0, 2)) {
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else if (type === "Child") {
        if (!isAge(date, 2, 12)) {
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else if (type === "Adult") {
        if (!isAge(date, 12, 200)) {
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else {
        errorArray[index].dateOfBirth = "";
      }
    }

    setData(dataArray);
    setError(errorArray);
  };

  const changeExpiryDate = (date, index) => {
    let dataArray = [...data];
    let errorArray = [...error];

    dataArray[index].expiryDate = date;
    if (date === "") {
      errorArray[index].expiryDate = "Passport expiry date is required";
    } else {
      errorArray[index].expiryDate = "";
    }

    setData(dataArray);
    setError(errorArray);
  };

  const changeIssuanceDate = (date, index) => {
    let dataArray = [...data];
    let errorArray = [...error];

    dataArray[index].issuanceDate = date;
    dataArray[index].expiryDate = null;
    if (date === "") {
      errorArray[index].issuanceDate = "Passport issuing date is required";
    } else {
      errorArray[index].issuanceDate = "";
    }

    setData(dataArray);
    setError(errorArray);
  };

  const changeNumber = (e, index) => {
    //var namePatternPass = /^[A-Za-z0-9]+$/;
    let dataArray = [...data];
    let errorArray = [...error];
    const valuesArray = dataArray.map((obj) => {
      if (obj.number != "") {
        return `${obj.issueCountry.value}${obj.number}`;
      }
    });
    dataArray[index].number = e.target.value;
    //console.log(dataArray[index]?.issueCountry.value);
    //console.log(valuesArray);console.log(`${dataArray[index].issueCountry.value}${e.target.value}`);
    if (dataArray[index]?.issueCountry.value != undefined) {
      const mid = validator.isPassportNumber(
        e.target.value,
        dataArray[index]?.issueCountry.value
      );

      if (mid) {
        errorArray[index].number = "";
      } else {
        errorArray[index].number = "Passport number is not valid";
      }
    } else {
      errorArray[index].number = "First select passport issuing country";
    }
    if (
      valuesArray.includes(
        `${dataArray[index].issueCountry.value}${e.target.value}`
      )
    ) {
      errorArray[index].number = "Passport is not unique";
    }
    // if (e.target.value.length < 7 || e.target.value.length > 9) {
    //   errorArray[index].number =
    //     "Passport number must be in between 7 to 9 charaters long";
    // } else if (!namePatternPass.test(e.target.value)) {
    //   errorArray[index].number = "Only alphanumeric value are allowed";
    // } else {
    //   errorArray[index].number = "";
    // }

    setData(dataArray);
    setError(errorArray);
  };

  const changeNationality = (val, index) => {
    setValue(val);
    let dataArray = [...data];
    let errorArray = [...error];
    dataArray[index].nationality = val;
    if (val == "") {
      errorArray[index].nationality = "Passenger nationality is required";
    } else {
      errorArray[index].nationality = "";
    }
    setData(dataArray);
  };

  const changeIssueCountry = (val, index) => {
    setValueIssue(val);
    let dataArray = [...data];
    let errorArray = [...error];
    dataArray[index].issueCountry = val;
    if (val == "") {
      errorArray[index].issueCountry = "Passport issuing country is required";
    } else {
      errorArray[index].issueCountry = "";
      errorArray[index].number = "";
      dataArray[index].number = "";
    }
    setData(dataArray);
    setError(errorArray);
  };

  const changeGender = (e, index) => {
    let dataArray = [...data];
    let errorArray = [...error];
    dataArray[index].gender = e.target.value;
    if (e.target.value == "") {
      errorArray[index].gender = "Gender is required";
    } else {
      errorArray[index].gender = "";
    }
    setData(dataArray);
  };

  // function isUnique(arr, propertyName) {
  //   return arr.every((item, index, array) => {
  //     return array.findIndex((obj) => obj['issueCountry']['value']+obj[propertyName] === item['issueCountry']['value']+item[propertyName]) === index;
  //   });
  // }

  const isUnique = (arr, key, value) => {
    const count = arr.reduce(
      (acc, obj) => (obj[key] === value ? acc + 1 : acc),
      0
    );
    return count <= 1;
  };

  const save = (e, index, type) => {
    let dataArray = [...data];
    let errorArray = [...error];
    let passCountArray = [...passCount];

    let status = 1;
    if (dataArray[index].firstname.length < 2) {
      status = 0;
      errorArray[index].firstname = "First name must be at least 2 characters";
    } else if (!namePattern.test(dataArray[index].firstname)) {
      status = 0;
      errorArray[index].firstname =
        "Only alphabet are allowed with single space between words";
    } else {
      errorArray[index].firstname = "";
    }
    if (dataArray[index].lastname.length < 2) {
      status = 0;
      errorArray[index].lastname = "Last name must be at least 2 characters";
    } else if (!namePattern.test(dataArray[index].lastname)) {
      status = 0;
      errorArray[index].lastname =
        "Only alphabet are allowed with single space between words";
    } else {
      errorArray[index].lastname = "";
    }
    if (dataArray[index].dateOfBirth == null) {
      status = 0;
      errorArray[index].dateOfBirth = "Date of birth is required";
    } else {
      if (type === "Infant") {
        if (!isAge(dataArray[index].dateOfBirth, 0, 2)) {
          status = 0;
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else if (type === "Child") {
        if (!isAge(dataArray[index].dateOfBirth, 2, 12)) {
          status = 0;
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else if (type === "Adult") {
        if (!isAge(dataArray[index].dateOfBirth, 12, 200)) {
          status = 0;
          errorArray[index].dateOfBirth = "Invalid date";
        } else {
          errorArray[index].dateOfBirth = "";
        }
      } else {
        errorArray[index].dateOfBirth = "";
      }
      //errorArray[index].dateOfBirth = "";
    }

    // var namePatternPass = /^[A-Za-z0-9]+$/;
    // if (dataArray[index].number.length < 7 || dataArray[index].number.length > 9) {
    //   errorArray[index].number =
    //     "Passport number must be in between 7 to 9 charaters long";
    // } else if (!namePatternPass.test(dataArray[index].number)) {
    //   errorArray[index].number = "Only alphanumeric value are allowed";
    // } else {
    //   errorArray[index].number = "";
    // }

    if (dataArray[index].issuanceDate == null) {
      status = 0;
      errorArray[index].issuanceDate = "Passport issuing date is required";
    } else {
      errorArray[index].issuanceDate = "";
    }
    if (dataArray[index].expiryDate == null) {
      status = 0;
      errorArray[index].expiryDate = "Passport expiry date is required";
    } else {
      errorArray[index].expiryDate = "";
    }
    if (dataArray[index].nationality == "") {
      status = 0;
      errorArray[index].nationality = "Passenger nationality is required";
    } else {
      errorArray[index].nationality = "";
    }
    if (dataArray[index].issueCountry == "") {
      status = 0;
      errorArray[index].issueCountry = "Passport issuing country is required";
    } else {
      errorArray[index].issueCountry = "";
    }
    if (dataArray[index]?.issueCountry.value != undefined) {
      const mid = validator.isPassportNumber(
        dataArray[index].number,
        dataArray[index]?.issueCountry.value
      );
      if (mid) {
        errorArray[index].number = "";
      } else {
        status = 0;
        errorArray[index].number = "Passport number is not valid";
      }
      if (isUnique(dataArray, "number", dataArray[index].number) === false) {
        status = 0;
        errorArray[index].number = "Passport is not unique";
      }
    } else {
      status = 0;
      errorArray[index].number = "First select passport issuing country";
    }
    if (dataArray[index].gender == "") {
      status = 0;
      errorArray[index].gender = "Gender is required";
    } else {
      errorArray[index].gender = "";
    }

    if (status != 0) {
      errorArray[index].errorInd = "";
      passCountArray[index].complete = true;
      toggle(index);
    } else {
      errorArray[index].errorInd = "Please fill the all details of passenger";
      passCountArray[index].complete = false;
    }

    const count = passCountArray.reduce((accumulator, currentObject) => {
      if (currentObject.complete === true) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

    setCountUser(count);

    if (passCountArray.some((obj) => obj.complete === false) === false) {
      setMainError("");
    }

    setData(dataArray);
    //localStorage.setItem("data", JSON.stringify(dataArray));
    setError(errorArray);
    setPassCount(passCountArray);
  };
  const CustomInput = ({ value, onClick }) => (
    <input
      readOnly
      value={value}
      onClick={onClick}
      style={{ cursor: "pointer", textAlign: "center" }}
    />
  );
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      const message = "Are you sure you want to leave?";
      event.returnValue = message; // Standard for most browsers
      return message; // For some older browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (
      paymentResult?.travelerPricings?.length === 0 ||
      paymentResult?.travelerPricings?.length === undefined
    ) {
      router.push("/");
    }
  }, []);

  const countUserComplete = (arr) => {
    const searchValue = true;
    const count = arr.reduce((accumulator, currentObject) => {
      if (currentObject.complete === searchValue) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);
  };
  const changePhone = (e) => {
    let phoneNumber = `${phoneCode}${e.target.value}`;
    if (phoneCode == null) {
      phoneNumber = `1${e.target.value}`;
    } else {
      phoneNumber = `${phoneCode}${e.target.value}`;
    }
    const isPhoneNumberValid = validator.isMobilePhone(phoneNumber);
    console.log(`Is valid phone number: ${isPhoneNumberValid}shivi`); // Should print true
    //console.log(phoneNumber,'ashi');
  };
  function isValidURL(url) {
    var urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
    return urlRegex.test(url);
  }
  useEffect(()=>{
    
  },[]);
  return (
    <>
      <>
        <style
          type="text/css"
          id="s736-0"
          dangerouslySetInnerHTML={{
            __html:
              'hr{display:block}[hidden],template{display:none}a{background-color:rgba(0,0,0,0);-webkit-text-decoration-skip:objects}a:active,a:hover{outline-width:0}b,strong{font-weight:inherit;font-weight:bolder}dfn{font-style:italic}h1{font-size:2em;margin:.67em 0}mark{background-color:#ff0;color:#000}sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline;top:-.5em}img{border-style:none}svg:not(:root){overflow:hidden}hr{-webkit-box-sizing:content-box;box-sizing:content-box;height:0;overflow:visible}button,input,select{font:inherit;margin:0}button,input{overflow:visible}button,select{text-transform:none}[type=reset],[type=submit],button,html [type=button]{-webkit-appearance:button}[type=number]::-webkit-inner-spin-button,[type=number]::-webkit-outer-spin-button{height:auto}::-webkit-input-placeholder{color:inherit;opacity:.54}::-webkit-scrollbar{width:1px;height:6px}::-webkit-scrollbar,::-webkit-scrollbar-thumb{background-color:rgba(0,0,0,0);border-radius:20px}::-webkit-scrollbar-track{background-color:rgba(0,0,0,0);border-radius:20px}.button{padding:.5em;color:#000;-webkit-transition:all .3s;transition:all .3s;border-radius:.25rem;outline:none;cursor:pointer;border:1px solid}.button--large{font-size:1.2em}.button--small{font-size:.83333em}.button--bold{font-weight:700}.button--block{display:block;width:100%}.button--upper{text-transform:uppercase}.button--default{background-color:#00b9f5;border-color:#00b9f5}.button--default:active,.button--default:hover{background:#29cbff}.button--success{background-color:green;border-color:green}.button--success:active,.button--success:hover{background:#00b300}.pure-checkbox input[type=checkbox],.pure-checkbox input[type=radio]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}.pure-checkbox input[type=checkbox]:focus+label:before,.pure-checkbox input[type=checkbox]:hover+label:before,.pure-checkbox input[type=radio]:focus+label:before,.pure-checkbox input[type=radio]:hover+label:before{border-color:#00b9f5;background-color:#fff}.pure-checkbox input[type=checkbox]:active+label:before,.pure-checkbox input[type=radio]:active+label:before{-webkit-transition-duration:0s;transition-duration:0s}.pure-checkbox input[type=checkbox]+label,.pure-checkbox input[type=radio]+label{position:relative;padding-left:2.5em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;color:#1b252e;font-size:15px;padding-top:4px}.pure-checkbox input[type=checkbox]+label:before,.pure-checkbox input[type=radio]+label:before{-webkit-box-sizing:content-box;box-sizing:content-box;content:"";color:#fff;position:absolute;top:50%;left:0;width:16px;height:16px;margin-top:-9px;border-radius:2px;border:1px solid #506d85;text-align:center;-webkit-transition:all .4s ease;transition:all .4s ease}.pure-checkbox input[type=checkbox]+label:after,.pure-checkbox input[type=radio]+label:after{-webkit-box-sizing:content-box;box-sizing:content-box;content:"";background-color:#00b9f5;position:absolute;top:50%;left:4px;width:10px;height:10px;margin-top:-5px;-webkit-transform:scale(0);-ms-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;-ms-transform-origin:50%;transform-origin:50%;-webkit-transition:-webkit-transform .2s ease-out;transition:-webkit-transform .2s ease-out;transition:transform .2s ease-out;transition:transform .2s ease-out,-webkit-transform .2s ease-out}.pure-checkbox input[type=checkbox]:disabled+label:before,.pure-checkbox input[type=radio]:disabled+label:before{border-color:#ccc}.pure-checkbox input[type=checkbox]:disabled:focus+label:before,.pure-checkbox input[type=checkbox]:disabled:hover+label:before,.pure-checkbox input[type=radio]:disabled:focus+label:before,.pure-checkbox input[type=radio]:disabled:hover+label:before{background-color:inherit}.pure-checkbox input[type=checkbox]:disabled:checked+label:before,.pure-checkbox input[type=radio]:disabled:checked+label:before{background-color:#ccc}.pure-checkbox input[type=checkbox]+label:after{background-color:rgba(0,0,0,0);top:50%;left:5px;width:10px;height:4px;margin-top:-3px;border-color:#fff;border-style:solid;border-width:0 0 2px 2px;-o-border-image:none;border-image:none;-webkit-transform:rotate(-45deg) scale(0);-ms-transform:rotate(-45deg) scale(0);transform:rotate(-45deg) scale(0)}.pure-checkbox input[type=checkbox]:checked+label:after{content:"";-webkit-transition:-webkit-transform .2s ease-out;transition:-webkit-transform .2s ease-out;transition:transform .2s ease-out;transition:transform .2s ease-out,-webkit-transform .2s ease-out}.pure-checkbox input[type=radio]:checked+label:before{background-color:#fff}.pure-checkbox input[type=radio]:checked+label:after{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}.pure-checkbox input[type=radio]+label:after,.pure-checkbox input[type=radio]+label:before{border-radius:50%}.pure-checkbox input[type=checkbox]:checked+label:before{background:#00b9f5;border:1px solid #00b9f5}.pure-checkbox input[type=checkbox]:checked+label:after{-webkit-transform:rotate(-45deg) scale(1);-ms-transform:rotate(-45deg) scale(1);transform:rotate(-45deg) scale(1)}@-webkit-keyframes borderscale{50%{-webkit-box-shadow:0 0 0 2px #00b9f5;box-shadow:0 0 0 2px #00b9f5}}@keyframes borderscale{50%{-webkit-box-shadow:0 0 0 2px #00b9f5;box-shadow:0 0 0 2px #00b9f5}}.Mobile-datepicker{background:#fff}.calendar{width:100%;border-collapse:separate;border-spacing:0 5px;padding-bottom:10px}.calendar__month{padding:20px;text-align:center;color:#000;font-weight:600;font-size:16px}.calendar__nameofdays td{width:46px;height:46px;text-align:center;font-size:10px}.calendar__day{width:49px;height:49px}.calendar__day,.report_calendar_day{text-align:center;background:#fff;font-size:14px;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box;padding-top:4px}.report_calendar_day{width:auto;height:7.5vh}.calendar__nameofday{font-size:11px}.calendar__dayFromOtherMonth{visibility:hidden}.calendar__activeDay{background-color:#00b9f5;color:#fff;font-weight:600;border-radius:50%;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;padding-top:0}.calendar__activeDay span{color:#fff}.calendar__activeDay .fareText,.calendar__dateRangeEnd .fareText,.calendar__dateRangeStart .fareText{color:#fff!important}.calendar__disabledDay{color:rgba(16,16,16,.54)}.calendar__disabledDay>.fareContainer{display:none}.calendar__dayInDateRange{background-color:#f5f9fe;border-color:#f5f9fe;border-radius:0}.autoWidth{width:auto}.calendar__dateRangeEnd,.calendar__dateRangeStart{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}.calendar__dateRangeEnd,.calendar__dateRangeStart,.report_calendar{background-color:#00b9f5;color:#fff;font-weight:600;border-radius:50%;padding-top:0}.calendar__holiday:after{content:" ";background-color:#15b06d;width:4px;height:4px;position:absolute;right:8px;top:8px;border-radius:50%;border:1px solid #fff}.row{-webkit-box-sizing:border-box;box-sizing:border-box;display:-ms-flexbox;display:flex;-ms-flex:0 1 auto;flex:0 1 auto;box-orient:horizontal;box-direction:normal;-ms-flex-direction:row;flex-direction:row;-ms-flex-wrap:wrap;flex-wrap:wrap;margin:0 -.5rem}.col-xs,.col-xs-1,.col-xs-2,.col-xs-3,.col-xs-4,.col-xs-5,.col-xs-6,.col-xs-7,.col-xs-8,.col-xs-9,.col-xs-10,.col-xs-11,.col-xs-12{-webkit-box-sizing:border-box;box-sizing:border-box;-ms-flex:0 0 auto;flex:0 0 auto;padding:0 .5rem}.col-xs{-ms-flex-positive:1;flex-grow:1;-ms-flex-preferred-size:0;flex-basis:0;max-width:100%}.col-xs-1{-ms-flex-preferred-size:8.33333333%;flex-basis:8.33333333%;max-width:8.33333333%}.col-xs-2{-ms-flex-preferred-size:16.66666667%;flex-basis:16.66666667%;max-width:16.66666667%}.col-xs-3{-ms-flex-preferred-size:25%;flex-basis:25%;max-width:25%}.col-xs-4{-ms-flex-preferred-size:33.33333333%;flex-basis:33.33333333%;max-width:33.33333333%}.col-xs-5{-ms-flex-preferred-size:41.66666667%;flex-basis:41.66666667%;max-width:41.66666667%}.col-xs-6{-ms-flex-preferred-size:50%;flex-basis:50%;max-width:50%}.col-xs-7{-ms-flex-preferred-size:58.33333333%;flex-basis:58.33333333%;max-width:58.33333333%}.col-xs-8{-ms-flex-preferred-size:66.66666667%;flex-basis:66.66666667%;max-width:66.66666667%}.col-xs-9{-ms-flex-preferred-size:75%;flex-basis:75%;max-width:75%}.col-xs-10{-ms-flex-preferred-size:83.33333333%;flex-basis:83.33333333%;max-width:83.33333333%}.col-xs-11{-ms-flex-preferred-size:91.66666667%;flex-basis:91.66666667%;max-width:91.66666667%}.col-xs-12{-ms-flex-preferred-size:100%;flex-basis:100%;max-width:100%}.start-xs{-ms-flex-pack:start;justify-content:flex-start;text-align:start}.center-xs{-ms-flex-pack:center;justify-content:center;text-align:center}.end-xs{-ms-flex-pack:end;justify-content:flex-end;text-align:end}.middle-xs{-ms-flex-align:center;align-items:center}.fontSize16{font-size:16px}input[type=radio]{-webkit-appearance:none;width:14.5px;height:14.5px;border:1px solid #adadad;border-radius:50%;outline:none;margin-right:7px;margin-bottom:-2px}input[type=radio]:before{content:"";display:block;width:7px;height:7px;margin:18% auto;border-radius:50%}input[type=radio]:checked:before{background:#00b9f5}input[type=radio]:checked{border:1px solid #00b9f5}.btn_active{background-color:#00b9f5;border-color:#00b9f5;color:#fff}.btn{border:1px solid #00b9f5;color:#00aced}.overflowYScroll{overflow-y:scroll;overflow-x:hidden}.primary_color{color:#00b9f5}.primary_alternate_color{color:#00aced}.primary_background_color{background-color:#00b9f5}.primary_border_1{border:1px solid #00b9f5}.primary_border_2{border:2px solid #00aced}.primary_border_half{border:.5px solid #00aced}.primary_active_color{color:#fff}.primary_border_bottom_1{border:1px solid #00b9f5}.track.track-1{background-color:#00b9f5!important}.slider .thumb{border:.6px solid #01b8f8!important}.cbx:checked+.slide{background-color:#000000;border:1px solid #000000}.cbx:focus+.slide{-webkit-box-shadow:0 0 1px #000000;box-shadow:0 0 1px #000000}.cbx:checked+.slide:before{-webkit-transform:translateX(26px);-ms-transform:translateX(26px);transform:translateX(26px);background-color:#fff;border-color:#000000}.scrollHidden{overflow:hidden!important;position:fixed;width:100%;height:100%}.pointer{cursor:pointer}',
          }}
        />
        <style
          type="text/css"
          id="s731-0"
          dangerouslySetInnerHTML={{
            __html:
              '@font-face{font-family:Open Sans;font-style:normal;font-weight:400;src:local("Open Sans"),local("OpenSans"),url(https://themes.googleusercontent.com/static/fonts/opensans/v6/cJZKeOuBrn4kERxqtaUH3T8E0i7KZn-EPnyo3HZu7kw.woff) format("woff")}@font-face{font-family:SanFrancisco Display Regular;font-weight:300;src:url(https://travel-assets-akamai.paytm.com/travel/mweb/assets/bcec8bf6fcf5fd05c8c90757410d00f5.otf) format("opentype")}@font-face{font-family:SanFrancisco Display Semibold;font-weight:300;src:url(https://travel-assets-akamai.paytm.com/travel/mweb/assets/ba789e34d8a6d44eb69b4286b3c59565.otf) format("opentype")}@font-face{font-family:SanFrancisco Display Bold;font-weight:600;src:url(https://travel-assets-akamai.paytm.com/travel/mweb/assets/e20ccd6628fff524b25855d6f1c41618.otf) format("opentype")}@font-face{font-family:SanFrancisco Display Medium;font-weight:400;src:url(https://travel-assets-akamai.paytm.com/travel/mweb/assets/bcec8bf6fcf5fd05c8c90757410d00f5.otf) format("opentype")}@font-face{font-family:SanFrancisco Display Light;font-weight:200;src:url(https://travel-assets-akamai.paytm.com/travel/mweb/assets/a2fe88213c3ba873e4b1cf386b8a84ad.otf) format("opentype")}@font-face{font-family:Roboto;font-style:normal;font-weight:400;src:local("Roboto"),local("Roboto-Regular"),url(https://fonts.gstatic.com/s/roboto/v15/oMMgfZMQthOryQo9n22dcuvvDin1pK8aKteLpeZ5c0A.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2212,U+2215,U+e0ff,U+effd,U+f000}@font-face{font-family:Roboto;font-style:normal;font-weight:500;src:local("Roboto Medium"),local("Roboto-Medium"),url(https://fonts.gstatic.com/s/roboto/v15/RxZJdnzeo3R5zSexge8UUZBw1xU1rKptJj_0jans920.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2212,U+2215,U+e0ff,U+effd,U+f000}@font-face{font-family:paytmMobile;src:url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/e001fd7f.eot);src:url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/ff90c34c.ttf) format("truetype"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/6f60973e.woff) format("woff"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/2f4da924.svg) format("svg");font-weight:400;font-style:normal}body,html{text-rendering:optimizeLegibility!important;-webkit-font-smoothing:antialiased!important;-webkit-tap-highlight-color:transparent;font-family:sans-serif;-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;-ms-touch-action:manipulation;touch-action:manipulation;-ms-scroll-chaining:none;overscroll-behavior:none}@media only screen and (-webkit-min-device-pixel-ratio:1.25),only screen and (-webkit-min-device-pixel-ratio:2.0833333333333335),only screen and (min-device-pixel-ratio:1.25),only screen and (min-resolution:1.25dppx),only screen and (min-resolution:200dpi){-webkit-font-smoothing:subpixel-antialiased}body{font-family:OpenSans,sans-serif;background-color:#fff;line-height:1.5;margin:0;padding:0;font-size:22.4px;font-size:1.4rem;-webkit-box-sizing:border-box;box-sizing:border-box;scroll-behavior:smooth;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2SFq8,body{width:100%;height:100%}._2SFq8{overflow:hidden!important;position:fixed}a,button{-ms-touch-action:manipulation;touch-action:manipulation}',
          }}
        />
        <style
          type="text/css"
          id="s738-0"
          dangerouslySetInnerHTML={{
            __html:
              '@font-face{font-family:PAYTM-Flights-MWEB;src:url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/17aa0e18.eot);src:url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/17aa0e18.eot#iefix) format("embedded-opentype"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/1513e4e7.woff2) format("woff2"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/e48a2ac7.ttf) format("truetype"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/1f0fc505.woff) format("woff"),url(//travel-assets-akamai.paytm.com/travel/mweb-flights/assets/9cd79511.svg#PAYTM-Flights-MWEB) format("svg");font-weight:400;font-style:normal;font-display:block}i{font-family:PAYTM-Flights-MWEB!important;speak:never;font-style:normal;font-weight:400;-webkit-font-feature-settings:normal;font-feature-settings:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.intFlight .path1:before{content:"";color:#000000}.intFlight .path2:before{content:"";margin-left:-1em;color:#012a72}.intFlight .path3:before{content:"";margin-left:-1em;color:#000000}.Baggage .path1:before{content:"";color:#b4def3}.Baggage .path2:before{content:"";margin-left:-1em;color:#d0f3fc}.Baggage .path3:before{content:"";margin-left:-1em;color:#012a72}.Account:before{content:""}.accountProfile:before{content:"";color:#000000}.add:before{content:""}.addWallet .path1:before{content:"";color:#fff}.addWallet .path2:before{content:"";margin-left:-1em;color:#012a72}.addWallet .path3:before{content:"";margin-left:-1em;color:#012a72}.addWallet .path4:before{content:"";margin-left:-1em;color:#000000}.addWallet .path5:before{content:"";margin-left:-1em;color:#000000}.addWallet .path6:before{content:"";margin-left:-1em;color:#000000}.Adult .path1:before{content:"";color:#101010}.Adult .path2:before{content:"";margin-left:-1em;color:#101010}.Adult .path3:before{content:"";margin-left:-1em;color:#fff}.Adult .path4:before{content:"";margin-left:-1em;color:#101010}.Adult .path5:before{content:"";margin-left:-1em;color:#101010}.Adult .path6:before{content:"";margin-left:-1em;color:#101010}.Adult .path7:before{content:"";margin-left:-1em;color:#101010}.Adult .path8:before{content:"";margin-left:-1em;color:#101010}.Adult .path9:before{content:"";margin-left:-1em;color:#101010}.Adult .path10:before{content:"";margin-left:-1em;color:#fff}.Adult .path11:before{content:"";margin-left:-1em;color:#101010}.Adult .path12:before{content:"";margin-left:-1em;color:#101010}.Adult .path13:before{content:"";margin-left:-1em;color:#101010}.Adult .path14:before{content:"";margin-left:-1em;color:#101010}.Adult .path15:before{content:"";margin-left:-1em;color:#101010}.airline_policy:before{content:"";color:#7e7e7e}.arrowSmall:before{content:"";color:#bfbfbf}.Back:before{content:""}.bag:before{content:""}.bagFlight .path1:before{content:"";color:#fff}.bagFlight .path2:before{content:"";margin-left:-1.1669921875em;color:#fff}.bagFlight .path3:before{content:"";margin-left:-1.1669921875em;color:#fff}.bagFlight .path4:before{content:"";margin-left:-1.1669921875em;color:#fff}.bagFlight .path5:before{content:"";margin-left:-1.1669921875em;color:#012a72}.bagFlight .path6:before{content:"";margin-left:-1.1669921875em;color:#000000}.baggageAddOn:before{content:""}.baggageAllowance:before{content:""}.bin:before{content:""}.blueTick:before{content:"";color:#000000}.bookingFormArrow:before{content:""}.bus .path1:before{content:"";color:#fff}.bus .path2:before{content:"";margin-left:-1em;color:#000000}.bus .path3:before{content:"";margin-left:-1em;color:#012a72}.calendar .path1:before{content:"";color:#101010}.calendar .path2:before{content:"";margin-left:-1em;color:#101010}.calendar .path3:before{content:"";margin-left:-1em;color:#101010}.calendar .path4:before{content:"";margin-left:-1em;color:#101010}.calendar .path5:before{content:"";margin-left:-1em;color:#fff}.calendar .path6:before{content:"";margin-left:-1em;color:#101010}.calendar .path7:before{content:"";margin-left:-1em;color:#101010}.cancelAction .path1:before{content:"";color:#fff}.cancelAction .path2:before{content:"";margin-left:-1em;color:#012a72}.cancelAction .path3:before{content:"";margin-left:-1em;color:#000000}.cancelAction .path4:before{content:"";margin-left:-1em;color:#000000}.cancellationFee:before{content:""}.cancelled .path1:before{content:"";color:#fd5154}.cancelled .path2:before{content:"";margin-left:-1em;color:#fff}.cancellogo:before{content:""}.cashback .path1:before{content:"";color:#101010}.cashback .path2:before{content:"";margin-left:-1em;color:#fff}.cashback .path3:before{content:"";margin-left:-1em;color:#fff}.cashback .path4:before{content:"";margin-left:-1em;color:#fff}.cashback .path5:before{content:"";margin-left:-1em;color:#fff}.cashback .path6:before{content:"";margin-left:-1em;color:#fff}.cashback .path7:before{content:"";margin-left:-1em;color:#fff}.cashback .path8:before{content:"";margin-left:-1em;color:#fff}.cashback .path9:before{content:"";margin-left:-1em;color:#fff}.cashBackImg .path1:before{content:"";color:#012a72}.cashBackImg .path2:before{content:"";margin-left:-.7890625em;color:none}.cashBackImg .path3:before{content:"";margin-left:-.7890625em;color:#000000}.cashBackImg .path4:before{content:"";margin-left:-.7890625em;color:none}.cashBackImg .path5:before{content:"";margin-left:-.7890625em;color:#fff}.cashbackImg1 .path1:before{content:"";color:#c4f1ff}.cashbackImg1 .path2:before{content:"";margin-left:-1.59375em;color:#c5d9fb}.cashbackImg1 .path3:before{content:"";margin-left:-1.59375em;color:#c4f1ff}.cashbackImg1 .path4:before{content:"";margin-left:-1.59375em;color:#c4f1ff}.cashbackImg2 .path1:before{content:"";color:#21c17a}.cashbackImg2 .path2:before{content:"";margin-left:-1.4345703125em;color:#bef8ce}.cashbackImg2 .path3:before{content:"";margin-left:-1.4345703125em;color:#21c17a}.cashbackImg2 .path4:before{content:"";margin-left:-1.4345703125em;color:#21c17a}.cashbackImg2 .path5:before{content:"";margin-left:-1.4345703125em;color:#21c17a}.cashbackStatus:before{content:"";color:#20bf7a}.chat:before{content:""}.check:before{content:"";color:#21c179}.checkin_baggage:before{content:"";color:#cacaca}.child:before{content:"";color:#cacaca}.clock:before{content:""}.close:before{content:"";color:#27b7ea}.closeCircle:before{content:""}.closeFill:before{content:"";color:#cacaca}.closeicon:before{content:"";color:#00b8f8}.closeNoFill:before{content:"";color:#7e7e7e}.contacts:before{content:""}.crossIcon:before{content:"";color:#555}.cutlery:before{content:""}.delete:before{content:""}.dismiss:before{content:""}.downloadAction .path1:before{content:"";color:#002e6d}.downloadAction .path2:before{content:"";margin-left:-1.142578125em;color:#00b7f3}.edit_black:before{content:""}.edit:before{content:""}.editPen:before{content:"";color:#000000}.email:before{content:""}.error:before{content:"";color:#fd5154}.failed:before{content:"";color:#fd5154}.filter:before{content:""}.flight .path1:before{content:"";color:#fff}.flight .path2:before{content:"";margin-left:-1em;color:#0cc8f4}.flight .path3:before{content:"";margin-left:-1em;color:#07448e}.flightBlack:before{content:"";color:#4a4a4a}.flightImg .path1:before{content:"";color:#1fb7ec}.flightImg .path2:before{content:"";margin-left:-2.0009765625em;color:#000;opacity:.5}.flightImg .path3:before{content:"";margin-left:-2.0009765625em;color:#000;opacity:.5}.flightImg .path4:before{content:"";margin-left:-2.0009765625em;color:#ffc98f}.flightImg .path5:before{content:"";margin-left:-2.0009765625em;color:#ffc98f}.flightImg .path6:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path7:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path8:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path9:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path10:before{content:"";margin-left:-2.0009765625em;color:#1f7fd1}.flightImg .path11:before{content:"";margin-left:-2.0009765625em;color:#004690}.flightImg .path12:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path13:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path14:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path15:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path16:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path17:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path18:before{content:"";margin-left:-2.0009765625em;color:#1f7fd1}.flightImg .path19:before{content:"";margin-left:-2.0009765625em;color:#004690}.flightImg .path20:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path21:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path22:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path23:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path24:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path25:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path26:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path27:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path28:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path29:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path30:before{content:"";margin-left:-2.0009765625em;color:#000}.flightImg .path31:before{content:"";margin-left:-2.0009765625em;color:#000}.Flights:before{content:"";color:#fff}.flightSeat:before{content:"";color:#7e7e7e}.flightWhite:before{content:"";color:#fff}.fork:before{content:""}.formarrow:before{content:""}.formflight:before{content:""}.Frame:before{content:""}.greenTick .path1:before{content:"";color:#21c179}.greenTick .path2:before{content:"";margin-left:-1em;color:#fff}.Help--Support:before{content:""}.hold_transition:before{content:"";color:#fff}.infants:before{content:""}.initiate:before{content:"";color:#fff}.leftRightarrow:before{content:"";color:#cacaca}.lrArrowBlack:before{content:""}.Meals .path1:before{content:"";color:#d0f3fc}.Meals .path2:before{content:"";margin-left:-1em;color:#012a72}.men:before{content:""}.minus:before{content:"";color:#000000}.MobileRecharge .path1:before{content:"";color:#fff}.MobileRecharge .path2:before{content:"";margin-left:-1em;color:#012a72}.MobileRecharge .path3:before{content:"";margin-left:-1em;color:#000000}.morning:before{content:""}.night:before{content:""}.offers:before{content:""}.oneway:before{content:""}.paytm_postpaid .path1:before{content:"";color:#101010;opacity:.22}.paytm_postpaid .path2:before{content:"";margin-left:-1em;color:#000000}.paytm_postpaid .path3:before{content:"";margin-left:-1em;color:#000000}.paytm_postpaid .path4:before{content:"";margin-left:-1em;color:none}.paytm_postpaid .path5:before{content:"";margin-left:-1em;color:none}.paytm_postpaid .path6:before{content:"";margin-left:-1em;color:#fff}.paytmTrust:before{content:"";color:#828282}.popupclose:before{content:"";color:#7e7e7e}.refundotes .path1:before{content:"";color:#c9f5ff}.refundotes .path2:before{content:"";margin-left:-1em;color:#2f62ad}.refundotes .path3:before{content:"";margin-left:-1em;color:#aae0f7}.refundotes .path4:before{content:"";margin-left:-1em;color:#aae0f7}.refundotes .path5:before{content:"";margin-left:-1em;color:#2f62ad}.refundotes .path6:before{content:"";margin-left:-1em;color:#2f62ad}.remove:before{content:""}.rescheduleAction .path1:before{content:"";color:#152c6c}.rescheduleAction .path2:before{content:"";margin-left:-1em;color:#00b7f3}.rescheduleAction .path3:before{content:"";margin-left:-1em;color:#00b7f3}.rescheduleFee:before{content:""}.resendAction .path1:before{content:"";color:#152c6c}.resendAction .path2:before{content:"";margin-left:-1.3330078125em;color:#00b7f3}.roundtrip:before{content:""}.rupeesGrey:before{content:"";color:#7e7e7e}.search:before{content:""}.seat-slected:before{content:"";color:#cedeef}.Seat .path1:before{content:"";color:#d0f3fc}.Seat .path2:before{content:"";margin-left:-1em;color:#012a72}.seatBooked:before{content:"";color:#000000}.seatNew .path1:before{content:"";color:#d0f3fc}.seatNew .path2:before{content:"";margin-left:-1em;color:#012a72}.seatSelected:before{content:""}.seatUnslected:before{content:"";color:#cedeef}.security:before{content:""}.setting:before{content:""}.shield .path1:before{content:"";color:#fff}.shield .path2:before{content:"";margin-left:-1em;color:#000000}.shield .path3:before{content:"";margin-left:-1em;color:#012a72}.success_filled .path1:before{content:"";color:#21c179}.success_filled .path2:before{content:"";margin-left:-1em;color:#fff}.success_transition:before{content:"";color:#21c179}.Success .path1:before{content:"";color:#21c179}.Success .path2:before{content:"";margin-left:-1em;color:#fff}.successOutline:before{content:"";color:#21c179}.SummaryTrustLogo_3X:before{content:""}.sun:before{content:""}.tick:before{content:""}.Train .path1:before{content:"";color:#fff}.Train .path2:before{content:"";margin-left:-1em;color:#0cc8f4}.Train .path3:before{content:"";margin-left:-1em;color:#07448e}.vaccine:before{content:""}.whiteTick:before{content:"";color:#fff}',
          }}
        />
        <style
          type="text/css"
          id="s730-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1-VZb{margin:0 auto;display:block}[class*=icon],[class^=icon]{font-family:paytmMobile;speak:none;font-style:normal;font-weight:400;-webkit-font-feature-settings:normal;font-feature-settings:normal;font-variant:normal;text-transform:none;line-height:1;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}.fullScreen{overflow:auto;top:0;left:0;bottom:0;right:0;position:fixed;background:#fff;z-index:100}.ripple{position:relative;overflow:hidden}.ripple:after{content:"";position:absolute;top:50%;left:50%;width:20px;height:20px;background:rgba(0,0,0,.05);opacity:0;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.ripple:active:after{-webkit-animation:_2cwqZ 1s ease-out;animation:_2cwqZ 1s ease-out}.iconBackArrow:before{content:"\\e900"}.iconOrder .path1:before{content:"\\e90f";color:#012b72}.iconOrder .path2:before{content:"\\e910";margin-left:-1.2861328125em;color:#012b72}.iconOrder .path3:before{content:"\\e911";margin-left:-1.2861328125em;color:#00b9f6}.iconOrder .path4:before{content:"\\e912";margin-left:-1.2861328125em;color:#00b9f6}.iconSetting .path1:before{content:"\\e92f";color:#002e6e}.iconSetting .path2:before{content:"\\e930";margin-left:-1em;color:#00b9f6}.iconContactUs .path1:before{content:"\\e917";color:#012b72}.iconContactUs .path2:before{content:"\\e918";margin-left:-1em;color:#012b72}.iconContactUs .path3:before{content:"\\e919";margin-left:-1em;color:#00b9f5}.iconUserProfile:before{content:"\\e92d"}.mHeaderContainer{border-bottom:1px solid #ebebeb;-webkit-transform:translateZ(0);transform:translateZ(0);bottom:auto;right:auto}.page-enter{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0)}.page-enter.page-enter-active{-webkit-transition:all .3s ease;transition:all .3s ease}.page-enter.page-enter-active,.page-leave{-webkit-transform:translateZ(0);transform:translateZ(0)}.page-leave.page-leave-active{-webkit-transform:translate3d(0,100%,0);transform:translate3d(0,100%,0);-webkit-transition:all .3s ease;transition:all .3s ease}.pageleft-enter{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0)}.pageleft-enter.pageleft-enter-active{-webkit-transition:all .3s ease;transition:all .3s ease}.pageleft-enter.pageleft-enter-active,.pageleft-leave{-webkit-transform:translateZ(0);transform:translateZ(0)}.pageleft-leave.pageleft-leave-active{-webkit-transform:translate3d(100%,0,0);transform:translate3d(100%,0,0);-webkit-transition:all .3s ease;transition:all .3s ease}.pageright-enter{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}.pageright-enter.pageright-enter-active{-webkit-transition:all .3s ease;transition:all .3s ease}.pageright-enter.pageright-enter-active,.pageright-leave{-webkit-transform:translateZ(0);transform:translateZ(0)}.pageright-leave.pageright-leave-active{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0);-webkit-transition:all .3s ease;transition:all .3s ease}h2{font-size:15px;color:#222}body{position:relative}.iframeHolder{background:#fff;position:fixed;z-index:999}._1GZ-1{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:start;justify-content:flex-start;-ms-flex-direction:column;flex-direction:column;height:100vh;width:100%;position:fixed;top:0;background:#fff;z-index:1000}._1Z8c1{width:100%;-webkit-box-shadow:0 8px 8px rgba(16,16,16,.07);box-shadow:0 8px 8px rgba(16,16,16,.07);margin:0 0 12px}._1LJr7{height:25px;width:25px;margin:10px 0 0 16px}iframe{height:100vh;width:100%}._5cki1{position:absolute;top:55px;left:0;padding:4px 16px 20px;width:100%;-webkit-box-sizing:border-box;box-sizing:border-box}._3hmcm{background-color:#dff6ff;border-radius:8px;display:-ms-flexbox;display:flex;padding:8px 12px;-ms-flex-align:center;align-items:center;margin-top:14px}._3hmcm img{width:42px}._3hmcm ._3hAUV{display:-ms-flexbox;display:flex;font-weight:400;font-size:12px;line-height:16px;color:#101010;-ms-flex-direction:column;flex-direction:column;padding-left:10px;width:-webkit-fill-available;padding-right:10px}._3hmcm ._3Zibo{font-weight:700;font-size:12px;line-height:16px;color:#101010;display:contents}._3hmcm div:last-child{min-width:72px;background-color:#00aced;border-radius:20px;padding:12px 2px;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center}._3hmcm div:last-child a{color:#fff;border:none;font-size:12px;line-height:1.08;letter-spacing:normal;font-weight:700}._3Zibo{position:absolute;top:10px;left:40%;font-size:18px;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;-ms-flex-align:center;align-items:center}._3Zibo img{width:77px}@media only screen and (max-width:991px){._3vljH{position:absolute;right:4px;top:0;height:30px;width:30px}#app{position:relative}#oauth-iframe{width:100vw;border:none}.iframeHolder{background:#fff;position:fixed;z-index:999;height:auto;height:100vh;top:0}._3hmcm{background-color:#dff6ff;border-radius:6px;padding:8px 12px;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-align:center;align-items:center}._3hmcm,._3hmcm div:first-child{display:-ms-flexbox;display:flex}._3hmcm img{width:42px}._3hmcm ._3hAUV{display:-ms-flexbox;display:flex;font-weight:400;font-size:12px;line-height:16px;color:#101010;-ms-flex-direction:column;flex-direction:column;padding-left:10px;width:-webkit-fill-available;padding-right:10px}._3hmcm div:last-child{min-width:72px;background-color:#00aced;border-radius:6px;padding:8px 0;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center}._3hmcm div:last-child a{color:#fff;border:none;font-size:12px;line-height:1.08;letter-spacing:normal;font-weight:700}}@media only screen and (min-width:992px){body{position:relative}._31Qph{display:block;margin:-92px auto 0}h2{font-size:15px;color:#222}._3vljH{position:absolute;left:95%;top:2%;height:20px;width:20px}._2eicR{background-color:#f2f6f7;width:100%;padding:40px 76px 40px 48px;height:100%;min-width:400px;width:400px;-webkit-box-sizing:border-box;box-sizing:border-box}._2eicR h3{margin-bottom:63px}._3eg1P{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;margin-bottom:38px}.y0dr-{height:100%;position:fixed;width:100%;background:rgba(0,0,0,.7);top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%);z-index:1000}._35zbp{padding:0 0 0 28px}._1dx_m{display:-ms-flexbox;display:flex;position:fixed;top:50%;left:50%;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%);background-color:#fff;width:75%;height:70%;z-index:20;min-width:800px;max-width:800px;height:500px;border-bottom:5px solid #002970;-ms-flex-direction:row-reverse;flex-direction:row-reverse}h3{margin-bottom:63px}._1dx_m:after{content:"";position:absolute;top:99%;left:0;border-bottom:#00baf2;z-index:23;width:100%;background:#00baf2;height:1%}#app{position:relative}#oauth-iframe{width:400px;min-width:400px;padding-top:36px;-webkit-box-sizing:border-box;box-sizing:border-box;height:auto;border:none}#oauth-iframe ._2uJ6E{color:#000;right:-15px}}@media screen and (min-width:992px){.flightSeoInformationContainer{font-size:12px;padding:0;color:#828282;line-height:1.5;background:#fff;overflow:hidden}.flightSeoInformationContainer h1{margin-top:10px;margin-bottom:10px;color:#828282;font-weight:600;font-size:12px}.flightSeoInformationContainer h2{margin-top:10px;margin-bottom:10px;font-size:15px;color:#222}.flightSeoInformationContainer .firstSeoBlockFlight h2{font-size:12px;font-weight:700;color:#828282}.flightSeoInformationContainer h3{margin-top:20px;margin-bottom:10px;font-size:13px;color:#222}.flightSeoInformationContainer .flightsInfo{margin:20px 0;font-size:12px;color:#828282}.flightSeoBlock{margin:20px 0;font-size:12px}.firstSeoBlockFlight{margin-top:0;font-size:12px}}',
          }}
        />
        <style
          type="text/css"
          id="s689-0"
          dangerouslySetInnerHTML={{
            __html:
              "._36uN3{position:fixed;z-index:1000;top:0;bottom:0;left:0;right:0;background-color:#fff}._36uN3 iframe{border:none;frameborder:0;height:570px;width:99.7%}.closeLoginModal{width:50px;padding:15px;top:10px;z-index:2;line-height:25px;position:absolute;text-align:center;font-size:20px;text-decoration:none;font-weight:700;cursor:pointer;right:0;color:#101010}._3Prjr{text-align:center;margin-top:50%}._bkG0{width:45%}._16P_O{margin-top:30px;font-size:24px;font-size:1.5rem}.ZuS1U{position:absolute;top:0}",
          }}
        />
        <style
          type="text/css"
          id="s1540-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1w3nD{-webkit-animation:_1w3nD .3s cubic-bezier(.22,.61,.36,1);animation:_1w3nD .3s cubic-bezier(.22,.61,.36,1)}._2wbPF{-webkit-animation:_2wbPF .3s cubic-bezier(.22,.61,.36,1);animation:_2wbPF .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1w3nD{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1w3nD{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2wbPF{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2wbPF{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2K-ZC{-ms-flex-direction:row;flex-direction:row}._1k5MD,._2K-ZC{display:-ms-flexbox;display:flex}._1k5MD{-ms-flex-direction:column;flex-direction:column}._2GvZU{border-bottom:1px solid #cacaca}._3LKhJ{border:1px solid #cacaca}.bKodx{border-top:1px solid #cacaca}.NRRtu{font-size:12px;margin:8px 0;color:#fd5154}._2tVd-{position:relative;overflow:hidden}._2tVd-:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2tVd-:hover:not(:active):after{-webkit-animation:_2Bm1f .09s linear 0s;animation:_2Bm1f .09s linear 0s}@-webkit-keyframes _2Bm1f{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2Bm1f{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2qdH-,body{height:100%;width:100%}._2qdH-{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._1IysB{font-size:14px;color:#101010;line-height:20px;padding:15px}._1IysB p:first-child{font-size:24px;color:#101010;font-weight:700;line-height:32px;margin:0 0 16px}._1IysB p{margin-bottom:32px}._1IysB .nEq9d{width:100%;-webkit-box-sizing:border-box;box-sizing:border-box;background-color:#fff}._1IysB .nEq9d button{background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._2bAI1{padding:16px}._1CggS{margin:8px 0;font-size:12px;color:#fd5154;font-weight:500;display:block}',
          }}
        />
        <style
          type="text/css"
          id="s717-0"
          dangerouslySetInnerHTML={{
            __html:
              "._1V4VV{position:fixed;z-index:555}._2zlkI,._1V4VV{top:0;left:0;width:100%;height:100%}._2zlkI{position:absolute;background:rgba(0,0,0,.2)}.SKZwN{position:relative;width:90%;top:30%;left:5%;height:auto;-webkit-box-sizing:border-box;box-sizing:border-box;padding:25px 20px;border-radius:2px;background-color:#fff;-webkit-box-shadow:0 6px 10px 0 rgba(0,0,0,.07);box-shadow:0 6px 10px 0 rgba(0,0,0,.07)}._1t3kZ{font-size:16px;font-weight:600;color:#0a0a0a;margin-bottom:15px}.fKDcm{font-size:13px;line-height:1.35;text-align:left;color:#0a0a0a}._1C5kl{font-size:15px;font-weight:600;color:#666;overflow:auto;clear:both;margin-top:40px;text-align:center}._1hbAP{float:right;margin-left:40px}._1hbAP:first-child{color:#00b9f5}",
          }}
        />
        <style
          type="text/css"
          id="s718-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2ZCCn{-webkit-animation:_2ZCCn .3s cubic-bezier(.22,.61,.36,1);animation:_2ZCCn .3s cubic-bezier(.22,.61,.36,1)}.vI3qb{-webkit-animation:vI3qb .3s cubic-bezier(.22,.61,.36,1);animation:vI3qb .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2ZCCn{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2ZCCn{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes vI3qb{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes vI3qb{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.meiTy{-ms-flex-direction:row;flex-direction:row}._3ehd5,.meiTy{display:-ms-flexbox;display:flex}._3ehd5{-ms-flex-direction:column;flex-direction:column}.w8fOf{border-bottom:1px solid #cacaca}._1GNGt{border:1px solid #cacaca}._1yfJ9{border-top:1px solid #cacaca}._1lZYz{font-size:12px;margin:8px 0;color:#fd5154}.TdNmg{position:relative;overflow:hidden}.TdNmg:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.TdNmg:hover:not(:active):after{-webkit-animation:lnaL1 .09s linear 0s;animation:lnaL1 .09s linear 0s}@-webkit-keyframes lnaL1{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes lnaL1{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._1RGIo,body{height:100%;width:100%}._1RGIo{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3dYK7{border-radius:100%;position:relative;top:4px;width:24px;height:24px}._3dYK7 ._3rOji{position:absolute;top:7px;left:6px;width:11px;height:11px}._3dYK7 ._3rOji:after,._3dYK7 ._3rOji:before{content:"";margin-top:-2px;background:#1d252d;width:100%;height:2px;position:absolute;top:50%;left:0}._3dYK7 ._3rOji:before{-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}._3dYK7 ._3rOji:after{-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}._2Q3mW{z-index:210}._2Q3mW ._2sbgr{display:block;background:rgba(0,0,0,.4);-webkit-animation:_3evsA .2s ease forwards;animation:_3evsA .2s ease forwards;width:100%;height:100%}._2Q3mW .FF3wS,._2Q3mW ._2sbgr{overflow:auto;z-index:210;position:fixed;top:0;left:0}._2Q3mW .FF3wS{background:#fff;padding:20px 0;-webkit-transition:visibility 0s linear,opacity .2s linear,all .2s ease;transition:visibility 0s linear,opacity .2s linear,all .2s ease;right:0;bottom:0;margin:auto;width:90%;height:-webkit-fit-content;height:-moz-fit-content;height:fit-content;border-radius:12px}._2Q3mW .FF3wS ._5RSin{text-align:center;padding:20px}._2Q3mW .FF3wS ._5RSin ._3xP68{font-size:14px;color:#1d252d;font-weight:500;margin:12px 10px 28px}._2Q3mW .FF3wS ._5RSin button{background:#000000;color:#fff;font-size:16px;height:52px;width:95%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer;margin:0 auto}.o3f6y{top:0;visibility:visible;opacity:1}@-webkit-keyframes _3evsA{0%{opacity:0}to{opacity:1}}@keyframes _3evsA{0%{opacity:0}to{opacity:1}}._3GR-D{top:-100%;visibility:hidden;opacity:0}.O9qYn{display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;padding:0 30px}.O9qYn .kPnDK{font-size:22px;color:#1d252d;font-weight:700;text-align:center;-ms-flex-positive:1;flex-grow:1}._2iyz3{position:fixed;top:0;right:0;bottom:0;left:0;-ms-flex-pack:center;justify-content:center;z-index:1000}._2iyz3,._2iyz3 .JcUCr{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2iyz3 .JcUCr{-ms-flex-pack:end;justify-content:flex-end;border-radius:12px 12px 0 0;padding:20px}._2iyz3 .JcUCr .JzGqI{width:32px;height:32px;cursor:pointer}._2iyz3 .JcUCr ._1NHnS{-ms-flex-pack:end;justify-content:flex-end}._2iyz3 ._2Q3mW,._2iyz3 .JcUCr ._1NHnS{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2iyz3 ._2Q3mW{-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column;margin:0 auto;width:60%}._2iyz3 ._2Q3mW img{width:76px;height:auto;margin-bottom:10px}._2iyz3 ._2Q3mW .O9qYn{display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;padding:0 30px}._2iyz3 ._2Q3mW .O9qYn .kPnDK{font-size:22px;color:#1d252d;font-weight:700;text-align:center;-ms-flex-positive:1;flex-grow:1}._2iyz3 ._2Q3mW ._5RSin{text-align:center;padding:20px;width:100%}._2iyz3 ._2Q3mW ._5RSin ._3xP68{font-size:14px;color:#1d252d;font-weight:500;margin:0 0 20px}._2iyz3 ._2Q3mW button{background:#000000;color:#fff;font-size:16px;height:52px;width:95%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer;margin:0 auto;width:100%}',
          }}
        />
        <style
          type="text/css"
          id="s729-0"
          dangerouslySetInnerHTML={{
            __html:
              "._35KJO{height:84vh;overflow-y:auto;background:#f9f9f9}.T5la9{height:8px;width:100%;background-color:#f2f2f2}._2s-sR{height:220px;background-size:cover;width:100%;color:#fff;display:-ms-flexbox;display:flex}.hjGc0{overflow-y:auto}._1-3sJ{overflow-x:auto}.dS68w{z-index:1}.GXdz6{z-index:3}.cCw_5{z-index:15}._1GGH3{width:100%;-webkit-box-sizing:border-box;box-sizing:border-box}.hCXM8{min-width:100px}._1pmmg{width:98%;-webkit-box-sizing:border-box;box-sizing:border-box}._3Vx3f{min-width:90px}._41Ivs{width:-webkit-fill-available}.CIhyj{width:40px}._1hutL{width:20em}._2oVmL{width:94%}._3RMPj{height:26px}._1sT76{max-height:64vh;overflow-y:auto}._2q3B4{max-height:100vh;overflow-y:scroll;height:100vh}._34UZH{min-height:100px}._1Lfin{min-height:300px}._3Giue{max-height:70vh;height:70vh}.PS4FN{height:80vh}.o5ENd{height:30vh}._3bOKJ{margin-left:0}.SWkUT{margin-top:2px}._208yQ{margin-bottom:2px}._3S8s_{margin-left:2px}._3TzvY{margin-right:2px}._3bZ3I{margin-top:4px}._1mBmC{margin-bottom:4px}._2KwcZ{margin-left:4px}._1kAs3{margin-right:4px}._2j9Dm{margin-top:6px}._1ce9t{margin-bottom:6px}._3PRFW{margin-left:6px}.oFvka{margin-right:6px}._3iAKO{margin-top:8px}.HHKJl{margin-bottom:8px}.hwEGM{margin-right:8px}.s8QXx{margin-left:8px}._2p4qC{margin-top:-10px}._1d5iP{margin-top:10px}.sGqet{margin-bottom:10px}._1-EZ2{margin-left:10px}._2G5-H{margin-right:10px}._1FT5Q{margin-top:12px}._3K5Mn{margin-bottom:12px}._3ph9l{margin-left:12px}.IEPkD{margin-right:12px}._1H7Rv{margin-top:14px}._3Haax{margin-bottom:14px}._1x23U,._2KQTl{margin-left:14px}._2rbos{margin-top:15px}._3ccJ2{margin-bottom:15px}._2J19y,._2iUTH{margin-left:15px}._3p41x{margin-top:16px}._1bZFj{margin-bottom:16px}._1cY4e,._3bJam{margin-left:16px}._1MUR2{margin-top:20px}._3qxRl{margin-bottom:20px}._3KV6a{margin-left:20px}._2IOuj{margin-right:20px}._2fL3V{margin-top:22px}._3-7_R{margin-bottom:22px}._3EwqA,._38-9T{margin-left:22px}._1_YYZ{margin-top:24px}._13meD{margin-bottom:24px}._3-97L{margin-left:24px}.PiBeG{margin-right:24px}.m9nL7{margin-top:26px}._9Zvg1{margin-bottom:26px}._3fR8h{margin-left:26px}._2kLMc{margin-right:26px}._1tieV{margin-left:-26px}._355ZP{margin-top:29px}.hv_8G{margin-bottom:29px}.jCrCa{margin-left:29px}._2RWDY{margin-right:29px}.oYg3q{margin-top:32px}._1LgQ6{margin-bottom:32px}._3i-lt,.A3RDV{margin-left:32px}._2E5pP{margin-top:60px}.Hgj2-{margin-top:70px}._1ahZ1{margin-bottom:80px}.you6R{margin-top:80px}.n1czm{margin-top:92px}._3WQ6l{margin-top:110px}._2iQzp{margin-top:145px}._1gJ2p{margin-top:160px}._4xf9K{margin-top:150px}._1WdyF{margin-top:200px}._3d7p5{margin-top:218px}.-zF54{text-transform:capitalize}._1bG-k{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._3l8OL{-ms-flex:1 1;flex:1 1}._3S_O6{-ms-flex:2 1;flex:2 1}.lAbCa{-ms-flex-align:start;align-items:flex-start}._3WTJx{-ms-flex-pack:end;justify-content:flex-end}._2nsvP{-ms-flex-pack:center;justify-content:center}._3HQnR{-ms-flex-pack:justify;justify-content:space-between}._2b554{text-align:center}._3Yl6K{text-align:right}._3nwB6{text-align:left}.Sbqf0{font-weight:600}._3hAod{line-height:1.33}._3NmAh{font-size:10px}._27AVs{font-size:12px}._11hDq{font-size:13px}.difBz{font-size:14px}.kEmVV{font-size:15px}._2inVJ{font-size:16px}._3T4jm{font-size:18px}.cAJHz{font-size:20px}._3dCoD{font-size:24px}._2VOmM{color:#506d85}._2k1iK{color:#07448e}._1uaiT{color:#000}._2nA0X{color:#222}.D6GYn{color:#1b252e}._3XZCi{color:#8ba6c1}._2VC8t{color:#00b9f5}._2FFSa{color:#fff}._2pSXo{color:#09b36d}._3qpLY{color:#00aced}._3i6m-{color:#012b72}._3R0MF{color:#220}._3y6mB{color:#e64545}._2YZCE{background-color:#dde5ed}._2lcf-{background-color:#fff}._1dyr3{background-color:#00b9f5}._1PUPW{background-color:#f9f9f9}._1Ot6f{background-color:#f5f8fa}.IIiTL{background-color:#3c3c3c}.JL7L1{background-color:#ffe6e6}._3aui6{background-color:#f0faff}.MhHiW{background-color:#def7eb}._3p3jN{border:1px solid #dde5ed}._1rA-3{border:1px solid #00b9f5}.eMt_s{border-top:1px solid #8ba6c1}._3T6-1{border:.5px solid #00aced}._2FaSP{border:2px solid #00aced}._2AkEv{border:.8px solid #e5e5e5}._1azoP{border-bottom:1px solid #dde5ed}._3U7vk{border:.5px solid #f4f4f4}._1E7Iq{border-top:.5px solid #f4f4f4}._3UcvJ{border-top:.5px solid #e6eaf2}._3b7UG{border-left:4px solid #e64545}.Ri4mA{border-radius:4px}._1FWWi{border-radius:2px}._1xRDD{border-radius:2.5px}.Z5hv7{border-top-left-radius:15px;border-top-right-radius:15px}._3EZT6{border:1px solid #f5f8fa}.n_sFT{position:fixed}._1bMqV{position:relative}._16uJv{position:absolute}._2BGIu{top:0}._1YxMF{bottom:0}.MFgr_{bottom:76px}._1LTcV{bottom:-1px}._2ko8s{left:0}.aur7z{right:0}._1bFMQ{right:10px}.d6L5T{top:-14px}._3wHvd{top:-11px}._5IiA8{top:-12px}.brAYo{top:-8px}._33YJe{top:-6px}._2EwiY{top:-3px}._1k54A{top:-4px}._1iUh1{top:-2px}._2litY{top:-1px}._1PMt8{top:12px}._3iQpK{top:14px}.lyBHV{top:20px}._3JZNn{top:22px}._1fOc_{top:70px}._3-wJ3{top:133px}._3SXKH{top:140px}.vgFM2{top:160px!important}._3V0SR{left:5px}._2LfTh{left:7px}._1E_vm{left:8px}._3ltNq{left:9px}._1ZnFF{left:10px}._31lRv{left:45%}._10_sM{left:64px}.AdkC0{left:302px}._1Hiin{-webkit-box-shadow:0 -1px 2px 0 hsla(0,0%,76.9%,.5);box-shadow:0 -1px 2px 0 hsla(0,0%,76.9%,.5)}._1x3mk{-webkit-box-shadow:0 1px 0 0 #dde5ed;box-shadow:0 1px 0 0 #dde5ed}.uIZhP{font-size:16px;text-align:right;color:#1b252e}.IOk_W{display:block;position:fixed;z-index:21;padding-top:100px;left:0;top:0;width:100%;height:100%;overflow:auto;background-color:#000;background-color:rgba(0,0,0,.4)}._2UVw5{background-color:#fefefe;margin:auto;padding:20px;border:1px solid #888;width:80%}._2iF_s{color:#aaa;float:right;font-size:28px;font-weight:700}._2iF_s:focus,._2iF_s:hover{color:#000;text-decoration:none;cursor:pointer}.k9Hmf{font-size:14px;font-weight:700;color:#131926;padding:12px;border-bottom:.5px solid #e6eaf2}._1gkgI{font-weight:500;text-align:right;color:#00aef3}._39Hqa{-ms-flex:1 1;flex:1 1;margin:0 10px}._32-bT>._1YXTZ>.jHWX0{text-align:center;height:60px;padding:8px 0}._1szuE{margin-right:32px;font-size:16px;font-weight:500;text-align:center;color:#00b0fa}._1szuE:last-of-type{margin-right:0}._3XjbX{position:relative;left:-16px;width:100%}._1AnfK{padding-top:4px}._3kp8u{padding-bottom:4px}._16F3b{padding-left:4px}._2SAoi{padding-right:4px}._1C_5l{padding-top:5px}._3V_eh{padding-bottom:5px}._3oh4Z{padding-left:5px}.NftD4{padding-right:5px}.C8kNN{padding-top:7px}.dIQ6h{padding-bottom:7px}.Qi4Xu{padding-left:7px}._1FWlk{padding-right:7px}._14xO5{padding:8px}._27uqy{padding-top:8px}._9WfmU{padding-bottom:8px}._2Fff0{padding-left:8px}._2CsI4{padding-right:8px}._3lyuQ{padding:10px}._3eQ9t{padding-top:10px}._31iCo{padding-bottom:10px}._2hJhh{padding-left:10px}.AkrqI{padding-right:10px}.t0iCA{padding:12px}.aWSH4{padding-top:12px}._2BYsw{padding-bottom:12px}._2Uyv8{padding-left:12px}._1AVQe{padding-right:12px}._1P_kC{padding-top:14px}._3WSe9{padding-bottom:14px}._30HkQ{padding-left:14px}._2uP_m{padding-right:14px}._3nJGW{padding:16px}._3HOH2{padding-top:16px}.RIpl3{padding-bottom:16px}._2Tuh9{padding-left:16px}.VwiTh{padding-right:16px}._3JfHe{padding-top:17px}.q_DBQ{padding-bottom:17px}._1ZaCG{padding-left:17px}._1gRP5{padding-right:17px}.dRxBG{padding:20px}.Fc048{padding-top:20px}.Hm6Vy{padding-bottom:20px}.dj0Kw{padding-left:20px}.et01Y{padding-right:20px}._1zIGm{padding-top:23px}._3Sbj4{padding-bottom:23px}._3jPIl{padding-left:23px}._1cm29{padding-right:23px}.hRlru{padding-left:24px}._2loC1{padding-right:24px}._3BURz{padding-bottom:25px}._3ZQse{padding-left:30px}.mWl0K{padding-right:30px}._1fJdt{padding-left:33px}._2jxCG{padding-right:33px}._8ut57{padding-bottom:70px}._1e5g9{max-width:100px;max-height:125px;padding:8px;min-width:100px;min-height:125px;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;-ms-flex-align:center;align-items:center}._2Dhg_{font-size:12px;margin:8px 0;color:#ff0025}._1ppwP{background:#fff;position:absolute;bottom:66px;width:100%;border-radius:5px;border:.5px solid #f4f4f4;background-color:#fff;left:0;padding:20px 20px 8px;-webkit-box-sizing:border-box;box-sizing:border-box}._1ppwP,.wkpqQ{-webkit-box-shadow:-1px 1px 3px 1px rgba(0,0,0,.08);box-shadow:-1px 1px 3px 1px rgba(0,0,0,.08)}.wkpqQ{-o-object-fit:contain;object-fit:contain;border-radius:4px;border:.5px solid #f4f4f4;background-color:#fff;padding:1px 24px}._1c9hO{margin-left:-15px;width:109%;-webkit-box-sizing:border-box;box-sizing:border-box;border:8px solid #f9f9f9;border-top:none}.PCay8{height:40px;width:40px;padding:8px}.Xvtwg{height:20px;width:20px}.gLvzI{cursor:pointer}._2XAzE{width:40px;height:40px}._2ArPx{width:4px;height:4px;background-color:#506d85}._3yTrl{width:15px;height:15px;opacity:.54;border-radius:50%;border:1px solid #dde5ed;margin-right:8px}._1c8-U{width:13px;height:15px}.Io9-v{top:50px}.Io9-v,._3-JjK{position:relative;z-index:1;right:10px}._3-JjK{top:12px}._1NSpW{width:22px;height:22px}._1NAmP{border-radius:50%;border:6px solid #dde5ed;border-top-color:#012b72;width:160px;height:160px;-webkit-animation:_XLwH 2s linear infinite;animation:_XLwH 2s linear infinite;margin:0 auto}@-webkit-keyframes _XLwH{0%{-webkit-transform:rotate(0deg)}to{-webkit-transform:rotate(1turn)}}@keyframes _XLwH{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}.LZPsp{top:38%;left:42%}.LZPsp>img{height:50px;width:50px}._35sAj{top:38%;left:38%}._35sAj>img{height:30px;width:30px}.hDX5Q>img{height:40px;width:40px}._1GA7G{padding:4px 28px;font-size:13px}.Fy5Xc{-webkit-box-shadow:-1px 1px 3px 1px rgba(0,0,0,.08);box-shadow:-1px 1px 3px 1px rgba(0,0,0,.08)}._3w4W_{font-size:13px;margin:8px 0;padding:4px;width:38%;text-align:center}._3llpZ{color:#1b252e;border:1px solid #d1d1d1;background:#fff}._3NxT1>span{padding:0 8px}._30XwE{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;position:fixed;z-index:2;padding:8px 14px;line-height:0;-webkit-box-sizing:border-box;box-sizing:border-box;height:53px;width:329px;text-align:center;border-radius:2.5px;border:.5px solid #dcdcdc;overflow-x:auto;background-color:#fff;overflow-y:hidden;top:90px;left:40px}._30XwE>div>img{width:18px;height:20px;margin:4px 10px}.uKGFe{margin:5px 12px 0;padding-bottom:8px;font-size:10px;color:#323232}._2hmOP{position:relative;top:6%;margin-bottom:80px;min-height:100vh;overflow-y:auto;border:2px solid #c6c6c6}._2NbaD{width:280px;margin:0 auto}._2fB4R{font-size:10px;position:absolute;top:5px;color:#fff}._3_Gxo{position:absolute;background:#fff;-webkit-box-shadow:-1px 1px 4px 1px rgba(0,0,0,.08);box-shadow:-1px 1px 4px 1px rgba(0,0,0,.08);border:.5px solid #f4f4f4;background-color:#fff;padding:10px;width:159px;z-index:1}.v_Wgp{position:fixed;top:0;width:100%;z-index:3;left:0;background:#fff;-webkit-box-shadow:0 2px 0 0 #dde5ed;box-shadow:0 2px 0 0 #dde5ed;background-color:#fff;padding:8px}._3UWvx{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;margin-bottom:8px}.RE3Yx{text-align:left;font-weight:600}.RE3Yx,._3ZNYo{-ms-flex:1 1;flex:1 1;font-size:16px;color:#1b252e}._3ZNYo{text-align:right}._1UANk{font-size:12px;line-height:1.33;color:#506d85;text-align:left}._3bPfe{padding-bottom:0}._2c_Th{-ms-flex:2 1;flex:2 1;text-align:center;font-size:16px;font-weight:600;color:#000;padding-left:6em}.YIUy1{-ms-flex:1 1;flex:1 1;text-align:right;font-size:12px;padding-right:1em}._22iWc{-ms-flex-pack:center;justify-content:center}._22iWc,._1EZZP{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._1EZZP{position:fixed;background:#fff;bottom:0;width:100%;left:0;-webkit-box-shadow:0 -1px 2px 0 hsla(0,0%,76.9%,.5);box-shadow:0 -1px 2px 0 hsla(0,0%,76.9%,.5);border:.8px solid #e5e5e5;background-color:#fff}.XPJOV{padding:19px 24px;-ms-flex:1 1;flex:1 1;font-size:21px;font-weight:700;line-height:1.1;letter-spacing:.58px;text-align:center;color:#fff}._1o7On{font-size:12px;color:#1b252e;margin-top:8px}._3wqzY{padding-left:16px;-ms-flex:1 1;flex:1 1;text-align:left}._1hWxC{width:16px;height:16px}._1HAkd{margin-top:4px;margin-bottom:4px;-webkit-padding-start:25px;padding-inline-start:25px;-webkit-margin-before:0;margin-block-start:0;-webkit-margin-after:0;margin-block-end:0}._24hzI{width:16px;height:16px}._2FNa5{position:fixed;top:0;background:#fff;height:84px;background-size:cover;z-index:20;width:100%;color:#000;padding:20px 16px 0}._1rKoS{width:297px;height:175px}._2wPX2{position:absolute;top:0;left:0;padding:9px;text-align:center;background:#ff9d57;width:90px}.PuFtr{width:9px;height:9px;border-radius:4.5px;border:1px solid #8ba6c1;background-color:#fff}._1CWfn{font-weight:400}._3g5w2{width:20px}.amSkZ{width:160px}._2ixBw{text-decoration:line-through;position:relative;bottom:2px}.Uf6P3{text-decoration:none}.j5F70{position:absolute;top:0;bottom:0;left:0;right:0;margin:auto;height:30px}",
          }}
        />
        <style
          type="text/css"
          id="s1580-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2ZnxH{-webkit-animation:_2ZnxH .3s cubic-bezier(.22,.61,.36,1);animation:_2ZnxH .3s cubic-bezier(.22,.61,.36,1)}._3zrqi{-webkit-animation:_3zrqi .3s cubic-bezier(.22,.61,.36,1);animation:_3zrqi .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2ZnxH{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2ZnxH{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3zrqi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3zrqi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1EmgA{-ms-flex-direction:row;flex-direction:row}._2B9He,._1EmgA{display:-ms-flexbox;display:flex}._2B9He{-ms-flex-direction:column;flex-direction:column}.nO553{border-bottom:1px solid #cacaca}._1T6Th{border:1px solid #cacaca}.aGiFe{border-top:1px solid #cacaca}._3vXH7{font-size:12px;margin:8px 0;color:#fd5154}._3zhul{position:relative;overflow:hidden}._3zhul:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3zhul:hover:not(:active):after{-webkit-animation:_1TW-Y .09s linear 0s;animation:_1TW-Y .09s linear 0s}@-webkit-keyframes _1TW-Y{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1TW-Y{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._3xWFo,body{height:100%;width:100%}._3xWFo{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2xOtw ._25iE3{width:100%;}._2xOtw ._25iE3 ._2ntdo{display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;margin:0 auto;width:1200px}._2xOtw ._25iE3 ._2ntdo ._299Nm{width:964px;padding-right:17px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-direction:column;flex-direction:column;grid-gap:24px;gap:24px}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR{margin:4px 0 0 auto}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR>p{text-align:right;padding-right:2.2rem;font-size:12px;color:#101010;font-weight:400;line-height:20px}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR .Q1lr5{position:relative;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;grid-gap:28px;gap:28px;grid-gap:2rem;gap:2rem}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR .Q1lr5 ._3A_b4{position:absolute;bottom:55px;border:1px solid #cacaca;border-radius:12px;overflow:hidden;z-index:2}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR .Q1lr5 ._1w8OY{background:#000000;color:#fff;font-size:16px;height:52px;width:298px;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR .Q1lr5 ._1w8OY img{width:50%}._2xOtw ._25iE3 ._2ntdo ._299Nm .kgzwR .Q1lr5 ._1w8OY._3YbSs{background:rgba(0,184,245,.5)}._2xOtw ._25iE3 ._2ntdo .EjZaV{width:278px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-direction:column;flex-direction:column}._2xOtw ._25iE3 ._2ntdo .EjZaV ._2sC2j{position:-webkit-sticky;position:sticky;top:16px}._2xOtw ._25iE3 ._2ntdo .EjZaV ._3Rsvi{margin-top:48px;width:100%}._2xOtw ._25iE3 ._2ntdo ._3CN5l{width:278px}._2xOtw ._25iE3 ._2ntdo ._3CN5l ._1QhiK{font-size:12px;color:#000;font-weight:400;line-height:20px;margin:16px 4px}._2xOtw ._25iE3 ._2ntdo ._3CN5l ._2Raup{background:#000000;color:#fff;font-size:16px;height:52px;width:278px;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._2xOtw ._25iE3 ._2ntdo ._3CN5l ._2Raup img{width:50%}._2xOtw ._25iE3 ._2ntdo ._3CN5l ._2Raup._3YbSs{background:rgba(0,184,245,.5)}._2xOtw ._25iE3 ._1mIwr{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:start;justify-content:flex-start;font-size:16px;color:#101010;font-weight:600;line-height:20px;margin-bottom:12px}._2xOtw ._25iE3 ._1mIwr img{padding-right:6px;width:20px;height:auto}._2xOtw ._25iE3 ._2M1pt{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-direction:column;flex-direction:column;width:100%;width:-moz-available;width:-webkit-fill-available;width:fill-available}._2xOtw ._25iE3 ._2M1pt ._2LiG5{width:100%}._2xOtw ._25iE3 ._2M1pt ._2LiG5 ._27t5Z{overflow:hidden;border-radius:10px;margin:12px 4px 16px 2px}._2xOtw ._25iE3 ._2M1pt ._3hzoy{border:1px solid #cacaca;padding-top:14px;border-radius:12px;width:inherit;background:#fff}._2xOtw ._25iE3 ._35MFN{padding:0 16px;margin-bottom:20px}._2xOtw ._25iE3 ._35MFN .MJstM{display:-ms-flexbox;display:flex;padding:40px 0 0 40px}._2xOtw ._25iE3 ._35MFN .MJstM ._35hYn{width:50%}._2xOtw ._25iE3 ._35MFN .MJstM ._35hYn div ._1oYdm{font-size:16px;color:#101010;font-weight:600;line-height:20px;padding-left:50px}._2xOtw ._25iE3 ._35MFN .MJstM ._35hYn div ._5gEfD{padding:0 25px;margin-left:25px;border-left:2px solid #cacaca;height:100vh}._2xOtw ._25iE3 ._35MFN .MJstM ._35hYn div ._5gEfD ._11uHP{border:1px solid #cacaca;border-radius:12px;padding-top:14px}._2xOtw ._25iE3 ._35MFN .MJstM ._35hYn div ._5gEfD ._1Fthr{font-size:14px;color:#fff;font-weight:600;line-height:24px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;margin:20px 0 0;background:#000000;border-radius:8px;padding:14px;cursor:pointer}._2xOtw ._25iE3 ._35MFN ._1oYdm{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:16px}._2xOtw ._25iE3 ._35MFN ._1oYdm h3{font-size:18px;color:#101010;font-weight:700;line-height:24px}._2xOtw ._25iE3 ._35MFN ._1oYdm span{font-size:12px;color:#000000;font-weight:500;line-height:16px}._2xOtw ._25iE3 ._35MFN ._32xRc{border:1px solid rgba(16,16,16,.13);border-radius:11px;overflow:hidden}._2xOtw ._25iE3 ._35MFN ._32xRc ._2ukkJ{background-color:#f5f9fe;position:relative;border-bottom:1px solid rgba(16,16,16,.13);border-radius:11px 11px 0 0;padding:0 8px}._2xOtw ._25iE3 ._35MFN ._32xRc ._3pNYj{padding-left:16px}._2xOtw ._25iE3 ._35MFN ._32xRc ._2yqUJ{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#000000;font-weight:600;line-height:16px;cursor:pointer;background:#e7f1f8;padding:8px 0 7px}._2xOtw ._25iE3 ._35MFN ._32xRc ._2yqUJ span{padding-right:5px}._2xOtw ._25iE3 ._35MFN ._32xRc ._2yqUJ i{padding:3.5px;border:solid #000000;border-width:0 1.25px 1.25px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}@media(min-width:992px){._2xOtw ._25iE3 ._35MFN{padding:0;min-width:278px}._2xOtw ._25iE3 ._35MFN ._1oYdm h3{font-size:16px;color:#101010;font-weight:600;line-height:20px}._2xOtw ._25iE3 ._35MFN ._1oYdm span{font-size:12px;color:#000000;font-weight:600;line-height:16px;cursor:pointer}._2xOtw ._25iE3 ._35MFN ._32xRc ._3pNYj{padding-left:8px}}._2xOtw .ftgFh,._2xOtw ._3FlLC,._2xOtw ._2mf3g,._2xOtw .bo4yu{width:100%}._2xOtw ._3PwQg{margin-top:16px;width:100%}.Moy3v{position:fixed;top:0;right:0;bottom:0;left:0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;z-index:1000}.Moy3v ._2HNcN{margin:0 auto;width:50%;padding:30px 0;min-height:400px}._83C5z{min-height:400px;height:600px;z-index:999}@media(min-width:992px){.Moy3v ._2HNcN{padding:40px 0 46px}}',
          }}
        />
        <style
          type="text/css"
          id="s1213-0"
          dangerouslySetInnerHTML={{
            __html:
              '._8QVLW{-webkit-animation:_8QVLW .3s cubic-bezier(.22,.61,.36,1);animation:_8QVLW .3s cubic-bezier(.22,.61,.36,1)}._2VXsR{-webkit-animation:_2VXsR .3s cubic-bezier(.22,.61,.36,1);animation:_2VXsR .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _8QVLW{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _8QVLW{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2VXsR{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2VXsR{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._3sxgB{-ms-flex-direction:row;flex-direction:row}._21Uc1,._3sxgB{display:-ms-flexbox;display:flex}._21Uc1{-ms-flex-direction:column;flex-direction:column}._13qqR{border-bottom:1px solid #cacaca}._3oRhs{border:1px solid #cacaca}._1gafq{border-top:1px solid #cacaca}._54dOf{font-size:12px;margin:8px 0;color:#fd5154}.q3lUf{position:relative;overflow:hidden}.q3lUf:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.q3lUf:hover:not(:active):after{-webkit-animation:PDCHV .09s linear 0s;animation:PDCHV .09s linear 0s}@-webkit-keyframes PDCHV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes PDCHV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.tBcah,body{height:100%;width:100%}.tBcah{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}header{background:#e0f5fd}header ._1l3s7{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;font-size:18px;font-weight:700}header ._1l3s7 ._1qGEm{width:24px;height:24px}header ._1l3s7 i{font-size:24px;min-width:24px;min-height:24px}header ._1l3s7 ._2KVBU{height:18px}header ._3iI3L{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}header ._3iI3L i{font-size:24px;min-width:24px;min-height:24px}header ._3iI3L .c_OLY{width:120px;height:18px}header ._3iI3L ._1qGEm{width:24px;height:24px}._3VwH5{background:#e0f5fd}@media(min-width:992px){header a img[alt=logo]{width:140px;height:21px}}',
          }}
        />
        <style
          type="text/css"
          id="s750-0"
          dangerouslySetInnerHTML={{
            __html:
              "._1ZfZl{-ms-flex-direction:row;flex-direction:row}._3PdXk,._1ZfZl{display:-ms-flexbox;display:flex}._3PdXk{-ms-flex-direction:column;flex-direction:column}.pXJ37{border-bottom:1px solid #ccc}._2PT5D{border:1px solid #ccc}._1RSAj{border-top:1px solid #ccc}::-webkit-scrollbar{width:6px;height:6px;background-color:#ccc;border-radius:20px}::-webkit-scrollbar-thumb{background-color:#00baf2;border-radius:20px}::-webkit-scrollbar-track{background-color:#fff;border-radius:20px}header{background:#fff;width:100%;-webkit-box-shadow:0 5px 20px rgba(0,41,112,.1);box-shadow:0 5px 20px rgba(0,41,112,.1);position:-webkit-sticky;position:sticky;top:0;z-index:10}header ._3Djqr{height:92px;width:90%;margin:0 auto;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}header ._3Djqr,header ._3Djqr a{display:-ms-flexbox;display:flex}header ._3Djqr a ._1E9YT{max-width:180px}header ._3Djqr a ._2k8h1{max-width:230px}header ._3Djqr ._3xUYd{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}header ._3i81q{-ms-flex-pack:start;justify-content:flex-start}.xthM0{margin:0 auto;width:100%;background:#002970}@media only screen and (max-width:900px){header{width:100%;top:0;position:-webkit-sticky;position:sticky;-webkit-box-shadow:0 4px 8px rgba(0,0,0,.08);box-shadow:0 4px 8px rgba(0,0,0,.08)}header ._3Djqr{padding:9px 20px 9px 0;min-height:55px;width:100%!important;height:100%;-webkit-box-sizing:border-box;box-sizing:border-box;position:relative;top:0;z-index:4;-ms-flex-pack:justify;justify-content:space-between}header ._3Djqr,header ._3Djqr .MMLFt{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}header ._3Djqr .MMLFt{-ms-flex-pack:start;justify-content:flex-start}header ._3Djqr ._13ls6{margin-left:25px;position:relative;border-radius:50%;display:-ms-flexbox;display:flex}header ._3Djqr ._13ls6 img{width:32px;height:32px;border-radius:50%;border:2px solid #00baf2}header ._3Djqr ._13ls6._2R77q{background:#00baf2;border-radius:16px;white-space:nowrap;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}header ._3Djqr ._13ls6._2R77q span{margin:0 6px 0 12px;font-size:10px;color:#fff;font-weight:600}header ._2Jd8h{background:#fff;-webkit-box-shadow:0 4px 8px rgba(0,0,0,.08);box-shadow:0 4px 8px rgba(0,0,0,.08)}header ._2NJnr{min-height:100vh;height:100%;background:#fff;position:relative;overflow-y:scroll}}",
          }}
        />
        <style
          type="text/css"
          id="s819-0"
          dangerouslySetInnerHTML={{
            __html:
              "._2q69t{display:-ms-flexbox;display:flex;position:relative}._2q69t ._3r8MI{max-width:180px}._2q69t .dT_4g{max-width:230px}@media only screen and (max-width:900px){._2q69t ._3r8MI{max-width:128px;max-height:40px}._2q69t .dT_4g{max-width:220px;padding:8px 0}}",
          }}
        />
        <style
          type="text/css"
          id="s759-0"
          dangerouslySetInnerHTML={{
            __html:
              '.XEfoj{-ms-flex-direction:row;flex-direction:row}._2Lcpu,.XEfoj{display:-ms-flexbox;display:flex}._2Lcpu{-ms-flex-direction:column;flex-direction:column}.KtsHO{border-bottom:1px solid #ccc}._3zH51{border:1px solid #ccc}._2SwAt{border-top:1px solid #ccc}::-webkit-scrollbar{width:6px;height:6px;background-color:#ccc;border-radius:20px}::-webkit-scrollbar-thumb{background-color:#00baf2;border-radius:20px}::-webkit-scrollbar-track{background-color:#fff;border-radius:20px}.IA_rP{top:0;left:0;overflow:hidden}.IA_rP,.IA_rP:after{position:absolute;width:100%;height:100%}.IA_rP:after{content:"";display:block;pointer-events:none;background-image:radial-gradient(circle,#000 10%,rgba(0,0,0,0) 15%);background-repeat:no-repeat;background-position:50%;-webkit-transform:scale(10);-ms-transform:scale(10);transform:scale(10);opacity:0;-webkit-transition:opacity 1s,-webkit-transform .5s;transition:opacity 1s,-webkit-transform .5s;transition:transform .5s,opacity 1s;transition:transform .5s,opacity 1s,-webkit-transform .5s}.IA_rP:active:after{-webkit-transform:scale(0);-ms-transform:scale(0);transform:scale(0);opacity:.2;-webkit-transition:0s;transition:0s}',
          }}
        />
        <style
          type="text/css"
          id="s820-0"
          dangerouslySetInnerHTML={{
            __html:
              '._30LPE{-ms-flex-direction:row;flex-direction:row}._2cDH_,._2dv-g ul ul,._30LPE{display:-ms-flexbox;display:flex}._2cDH_,._2dv-g ul ul{-ms-flex-direction:column;flex-direction:column}._3e1bU{border-bottom:1px solid #ccc}._1d-1m,._2dv-g ul ul{border:1px solid #ccc}._1slap{border-top:1px solid #ccc}::-webkit-scrollbar{width:6px;height:6px;background-color:#ccc;border-radius:20px}::-webkit-scrollbar-thumb{background-color:#00baf2;border-radius:20px}::-webkit-scrollbar-track{background-color:#fff;border-radius:20px}._2dv-g{width:70%;margin:auto;-ms-flex-pack:center;justify-content:center}._2dv-g,._2dv-g ul{display:-ms-flexbox;display:flex}._2dv-g ul{position:relative}._2dv-g ul li{margin-right:5px;padding:3px}._2dv-g ul li a{font-size:17px;color:#000;font-weight:600}._2dv-g ul ul{background:#fff;-webkit-box-shadow:10px 10px 30px rgba(0,0,0,.1);box-shadow:10px 10px 30px rgba(0,0,0,.1);border-radius:6px}._2dv-g ul ul li{margin-right:0;-webkit-box-sizing:border-box;box-sizing:border-box}._2dv-g ul ul li a{padding:12px ​10px;border-radius:0;font-size:14px;color:#000;font-weight:600;line-height:17px}._2dv-g ul .BjkLs,._2dv-g ul ._1VXMb,._2dv-g ul ._2QZIQ,._2dv-g ul ._2skuQ{-webkit-transition:.35s ease-out;transition:.35s ease-out}._2dv-g ul .BjkLs{width:202px;position:absolute}._2dv-g ul ._1VXMb{min-height:200px;-webkit-box-shadow:10px 10px 30px rgba(0,0,0,.1);box-shadow:10px 10px 30px rgba(0,0,0,.1);border-radius:0 6px 6px 0;display:-ms-flexbox;display:flex;width:240px;position:absolute;top:-1px;left:196px;z-index:1}._2dv-g ul ._1VXMb ._3DgmP{padding:3px 6px 3px 3px}._2dv-g ul .et6Xc{min-width:500px;height:440px}._2dv-g ul ._2QZIQ,._2dv-g ul ._2skuQ{min-height:200px;border-radius:0 6px 6px 0}._2dv-g ul ._2QZIQ{width:262px;position:absolute;top:-1px;left:237px}._2dv-g ul ._2skuQ{width:354px;position:absolute;top:-1px;left:258px}._2dv-g ul ._3y5vS{cursor:pointer;position:relative}._2dv-g ul ._3y5vS a{-webkit-transition:.25s ease-in;transition:.25s ease-in;padding:12px;display:block}._2dv-g ul ._3y5vS:hover,._2dv-g ul .DK57R{background:#f5f7fa;border-radius:4px 4px 0 0}._2dv-g ul ._2dmXc>a{color:#00baf2}._2dv-g ul ._1FDnN{height:376px}._2dv-g ._2dve7{-webkit-transition:background-color .2s ease-out,opacity .2s;transition:background-color .2s ease-out,opacity .2s;width:100%;height:100%;position:absolute;top:0;left:0}._2dv-g ._2dve7:before{-webkit-box-shadow:-1px -1px 0 #707070,-2px -2px 0 #707070,-3px -3px 0 #707070,-4px -4px 0 #707070,-5px -5px 0 #707070,-1px 1px 0 #707070,-2px 2px 0 #707070,-3px 3px 0 #707070,-4px 4px 0 #707070,-5px 5px 0 #707070;box-shadow:-1px -1px 0 #707070,-2px -2px 0 #707070,-3px -3px 0 #707070,-4px -4px 0 #707070,-5px -5px 0 #707070,-1px 1px 0 #707070,-2px 2px 0 #707070,-3px 3px 0 #707070,-4px 4px 0 #707070,-5px 5px 0 #707070;-webkit-transform:translateX(0);-ms-transform:translateX(0);transform:translateX(0);width:2px}._2dv-g ._2dve7:after,._2dv-g ._2dve7:before{content:"";background:#707070;-webkit-transition:.16s ease-out 80ms;transition:.16s ease-out 80ms;height:2px;position:absolute;top:50%;right:9%}._2dv-g ._2dve7:after{width:0}._2dv-g ._2dve7:hover:after,._2dv-g ._2dve7:hover:before{-webkit-transform:translateX(8px);-ms-transform:translateX(8px);transform:translateX(8px)}._2dv-g ._2dve7:hover:after{width:15px;margin-left:-20px}._1i1WI{margin:0 0 0 20px}@media only screen and (max-width:900px){._2dv-g{display:none}}',
          }}
        />
        <style
          type="text/css"
          id="s818-0"
          dangerouslySetInnerHTML={{
            __html:
              "._12nus{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row}._2dRU2,._2blcs ul,._2blcs ul li ._3ok19 ._1uxzD{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column}.Nn4jX,._2blcs ul li ._3ok19{border-bottom:1px solid #ccc}._3ZJLa,._2blcs ul{border:1px solid #ccc}._38uHz{border-top:1px solid #ccc}::-webkit-scrollbar{width:6px;height:6px;background-color:#ccc;border-radius:20px}::-webkit-scrollbar-thumb{background-color:#00baf2;border-radius:20px}::-webkit-scrollbar-track{background-color:#fff;border-radius:20px}._2blcs{margin-left:auto;position:relative}._2blcs:hover ul{opacity:1;visibility:visible;-webkit-transition:.25s ease-in;transition:.25s ease-in}._2blcs ._1YPz_{background:#00baf2;padding:2px 2px 2px 20px;border-radius:20px;cursor:pointer;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:end;justify-content:flex-end;font-size:15px;color:#fff;font-weight:600}._2blcs ._1YPz_ img{margin-left:9px;border-radius:50%;width:34px;height:34px}._2blcs ._1YPz_:hover{background:#002970}._2blcs .jKqd8{background:#002970;min-width:112px;max-width:225px}._2blcs .jKqd8 span{white-space:nowrap;text-overflow:ellipsis;overflow:hidden}._2blcs ul{display:-ms-flexbox;display:flex;width:304px;opacity:0;visibility:hidden;-webkit-transition:.35s ease-out;transition:.35s ease-out;background:#fff;-webkit-box-shadow:0 0 20px rgba(0,0,0,.1);box-shadow:0 0 20px rgba(0,0,0,.1);border-radius:6px;position:absolute;top:52px;right:0}._2blcs ul li{padding:3px;position:relative;cursor:pointer}._2blcs ul li a{-webkit-transition:.25s ease-in;transition:.25s ease-in;padding:15px;display:block;width:calc(100% - 30px);font-size:14px;color:#000;font-weight:500}._2blcs ul li a:hover{background:#f5f7fa;border-radius:4px 4px 0 0}._2blcs ul li:first-child{padding:16px 16px 8px}._2blcs ul li ._3ok19{padding-bottom:8px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2blcs ul li ._3ok19 ._1uxzD{padding:11px}._2blcs ul li ._3ok19 ._1uxzD .YmDus{display:-ms-flexbox;display:flex;-ms-flex-align:end;align-items:flex-end}._2blcs ul li ._3ok19 ._1uxzD .YmDus img{width:16px}._2blcs ul li ._3ok19 ._1uxzD .YmDus span{margin-left:8px;font-size:12px;color:#707070;font-weight:500;line-height:9px}._2blcs ul li ._3ok19 ._1uxzD ._2D3va{margin-top:10px;font-size:20px;color:#000;font-weight:600;line-height:15px}._2blcs ul li ._3ok19 ._2u0gv{padding:11px;display:-ms-flexbox;display:flex;-ms-flex-align:end;align-items:flex-end;-ms-flex-direction:column;flex-direction:column}._2blcs ul li ._3ok19 ._2u0gv img{width:20px}._2blcs ul li ._3ok19 ._2u0gv span{margin-top:10px;font-size:12px;color:#000;font-weight:500;line-height:9px}._2blcs ul li ._3ok19 ._2u0gv:hover{background:#f5f7fa;border-radius:4px 4px 0 0}@media only screen and (max-width:900px){._2blcs:hover ul{display:none}._2blcs ._1YPz_{padding-left:12px}._2blcs ._1YPz_ span{font-size:10px;color:#fff;font-weight:600}._2blcs ._1YPz_ img{padding:0;width:32px;height:32px}._2blcs .jKqd8{padding-left:2px;min-width:auto;max-width:auto;background:#00baf2!important}._2blcs .jKqd8 img{margin-left:0}}",
          }}
        />
        <style
          type="text/css"
          id="s816-0"
          dangerouslySetInnerHTML={{
            __html:
              "._2OXSz{-ms-flex-direction:row;flex-direction:row}.JgAno,._2OXSz{display:-ms-flexbox;display:flex}.JgAno{-ms-flex-direction:column;flex-direction:column}._3kEm_{border-bottom:1px solid #ccc}._2Wa1y{border:1px solid #ccc}._2n1wf{border-top:1px solid #ccc}::-webkit-scrollbar{width:6px;height:6px;background-color:#ccc;border-radius:20px}::-webkit-scrollbar-thumb{background-color:#00baf2;border-radius:20px}::-webkit-scrollbar-track{background-color:#fff;border-radius:20px}.MLCC9{background:#fff;border-radius:8px;-webkit-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);transform:translate(-50%,-50%);-webkit-box-shadow:0 0 15px 6px rgba(0,0,0,.1);box-shadow:0 0 15px 6px rgba(0,0,0,.1);width:570px;height:480px;position:absolute;top:50%;left:50%}.MLCC9 ._2jZ45{position:absolute;top:15px;right:20px;z-index:2}.MLCC9 .nXTNx{width:100%;height:500px;position:absolute;z-index:0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column}.MLCC9 .nXTNx img{width:100px;height:100px}.MLCC9 iframe{border-radius:8px;position:relative;z-index:1;width:100%;height:100%}@media only screen and (max-width:900px){.MLCC9{margin:0;border-radius:0;width:100%;height:100%}.MLCC9 iframe{height:95%}.MLCC9 ._2jZ45{position:relative;top:18px;left:18px;z-index:2}.MLCC9 ._2jZ45 img{-webkit-transform:rotate(225deg);-ms-transform:rotate(225deg);transform:rotate(225deg);width:18px}}",
          }}
        />
        <style
          type="text/css"
          id="s1214-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2B1tN{-webkit-animation:_2B1tN .3s cubic-bezier(.22,.61,.36,1);animation:_2B1tN .3s cubic-bezier(.22,.61,.36,1)}._2AzCF{-webkit-animation:_2AzCF .3s cubic-bezier(.22,.61,.36,1);animation:_2AzCF .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2B1tN{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2B1tN{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2AzCF{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2AzCF{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.u4SCj{-ms-flex-direction:row;flex-direction:row}._3qFLS,.u4SCj{display:-ms-flexbox;display:flex}._3qFLS{-ms-flex-direction:column;flex-direction:column}._2yImc{border-bottom:1px solid #cacaca}._23s_J{border:1px solid #cacaca}._3lJz1{border-top:1px solid #cacaca}._1_kJc{font-size:12px;margin:8px 0;color:#fd5154}._2JX2k{position:relative;overflow:hidden}._2JX2k:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2JX2k:hover:not(:active):after{-webkit-animation:edvmW .09s linear 0s;animation:edvmW .09s linear 0s}@-webkit-keyframes edvmW{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes edvmW{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._11NsA,body{height:100%;width:100%}._11NsA{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._1Q5Lq{width:100%;background:linear-gradient(0deg,#fff calc(100% - 145px),#e0f5fd 0)}.U1Ed2{text-align:center;padding:9px 0 7px}.U1Ed2 ._1TY7a{display:-ms-inline-flexbox;display:inline-flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;margin-right:10px}.U1Ed2 ._1TY7a,.U1Ed2 ._1TY7a a{font-size:12px;color:#223368;font-weight:500;line-height:20px}.U1Ed2 ._1TY7a:last-child a,.U1Ed2 ._1TY7a:last-child span{font-weight:600}.U1Ed2 ._1TY7a:last-child a ._2eabs,.U1Ed2 ._1TY7a:last-child span ._2eabs{display:none}.U1Ed2 ._2eabs{border-top:2px solid #223368;border-right:2px solid #223368;margin-right:10px;display:inline-block;position:relative;top:0;right:-7px;width:8px;height:8px;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);margin-left:auto}',
          }}
        />
        <style
          type="text/css"
          id="s1386-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2EUQW{-webkit-animation:_2EUQW .3s cubic-bezier(.22,.61,.36,1);animation:_2EUQW .3s cubic-bezier(.22,.61,.36,1)}._2IF4a{-webkit-animation:_2IF4a .3s cubic-bezier(.22,.61,.36,1);animation:_2IF4a .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2EUQW{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2EUQW{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2IF4a{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2IF4a{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2hcQh{-ms-flex-direction:row;flex-direction:row}.Ow5eM,._2hcQh{display:-ms-flexbox;display:flex}.Ow5eM{-ms-flex-direction:column;flex-direction:column}._2QKfi{border-bottom:1px solid #cacaca}.VSzr-{border:1px solid #cacaca}._2yfIw{border-top:1px solid #cacaca}.pxIzy{font-size:12px;margin:8px 0;color:#fd5154}._2XeJO{position:relative;overflow:hidden}._2XeJO:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2XeJO:hover:not(:active):after{-webkit-animation:_1dC1F .09s linear 0s;animation:_1dC1F .09s linear 0s}@-webkit-keyframes _1dC1F{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1dC1F{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._1IgMP,body{height:100%;width:100%}._1IgMP{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2O4tN{background:#fff8e1;padding:8px 12px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;font-size:12px;color:#101010;font-weight:400}._2O4tN span{margin-right:10px;padding-top:3px}._2O4tN span img{width:16px;height:16px}._2O4tN ._3HsFZ span{font-size:12px;color:#101010;font-weight:700;margin-right:10px}._2O4tN ._3HsFZ p{margin:0}',
          }}
        />
        <style
          type="text/css"
          id="s1306-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1M8jV{-webkit-animation:_1M8jV .3s cubic-bezier(.22,.61,.36,1);animation:_1M8jV .3s cubic-bezier(.22,.61,.36,1)}._1Ivpi{-webkit-animation:_1Ivpi .3s cubic-bezier(.22,.61,.36,1);animation:_1Ivpi .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1M8jV{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1M8jV{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1Ivpi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1Ivpi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1i1lu{-ms-flex-direction:row;flex-direction:row}._2Ps1V,._1i1lu{display:-ms-flexbox;display:flex}._2Ps1V{-ms-flex-direction:column;flex-direction:column}._28ZlC{border-bottom:1px solid #cacaca}._13ZmX{border:1px solid #cacaca}._37Aq2{border-top:1px solid #cacaca}._3bHZG{font-size:12px;margin:8px 0;color:#fd5154}._2CUeq{position:relative;overflow:hidden}._2CUeq:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2CUeq:hover:not(:active):after{-webkit-animation:_2a2QA .09s linear 0s;animation:_2a2QA .09s linear 0s}@-webkit-keyframes _2a2QA{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2a2QA{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.Ehfcb,body{height:100%;width:100%}.Ehfcb{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2BQKr{padding:16px 16px 25px}._2BQKr ._3ph4K ._3fBbc{display:-ms-flexbox;display:flex;margin-bottom:8px;font-size:18px;color:#101010;font-weight:600;line-height:20px}._2BQKr ._3ph4K .Lx7CQ{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._2BQKr ._3ph4K .Lx7CQ img{padding:0 2px 0 10px;width:9px}._2BQKr ._3ph4K .Lx7CQ .Ur6tJ{font-size:10px;color:#fff;font-weight:500;line-height:16px;background:#ff9d00;border-radius:4px;padding:2px 8px}._2BQKr ._164ne ._2Zi7O{background:#fff8e1;padding:8px 12px;border-radius:8px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:12px;color:#101010;font-weight:400;line-height:16px}._2BQKr ._164ne ._2Zi7O img{margin-right:8px;width:16px}._2BQKr ._164ne ._3L47o{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:space-evenly;justify-content:space-evenly;border-bottom:1px solid rgba(16,16,16,.07)}._2BQKr ._164ne ._3L47o .VdzpF{min-width:126px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column}._2BQKr ._164ne ._3L47o .VdzpF ._1TDMZ{font-size:14px;color:#101010;font-weight:600;line-height:20px}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N{font-size:12px;color:rgba(16,16,16,.54);line-height:16px;margin-bottom:12px}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N .Ur6tJ{font-size:10px;color:#fff;font-weight:500;line-height:16px;background:#ff9d00;border-radius:4px;padding:2px 8px}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N img{width:9px;height:9px}._2BQKr ._164ne ._3L47o ._3hSEV{border-bottom:2px solid #000000}._2BQKr ._3gQ_b{margin-top:16px}._2BQKr ._2c1ZK{padding:20px 30px 16px}._2BQKr ._1BYFc{padding:8px 27px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;background:#f5f9fe;position:relative;border-radius:0 0 12px 12px}._2BQKr ._1BYFc ._3F-_I{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2BQKr ._1BYFc ._3F-_I .Yjs7H:after{content:"";background:#fff;border-radius:50%;-webkit-box-shadow:inset 3px 0 7px -6px rgba(16,16,16,.5);box-shadow:inset 3px 0 7px -6px rgba(16,16,16,.5);width:20px;height:20px;position:absolute;top:-35px;right:-10px}._2BQKr ._1BYFc ._3F-_I ._25O6r:after{-webkit-box-shadow:inset -3px 0 7px -6px rgba(16,16,16,.5);box-shadow:inset -3px 0 7px -6px rgba(16,16,16,.5);left:-10px}._2BQKr ._1BYFc ._3M7bE{border:1px solid #101010;background:#e0f5fd;font-size:11px;color:#101010;font-weight:700;line-height:16px;border-radius:4px;padding:0 6px;margin-right:27px}._2BQKr ._1BYFc ._2wdgW{border:1px solid #21c179;background:#e3f6ec;font-size:11px;color:#21c179;font-weight:600;line-height:16px;border-radius:4px;padding:0 6px;margin-right:27px}._2BQKr ._1BYFc ._1PFnA{font-size:12px;color:#7e7e7e;font-weight:500;line-height:16px;margin-right:auto}._2BQKr ._1BYFc ._1PFnA,._2BQKr ._1BYFc ._1PFnA div{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:start;justify-content:flex-start}._2BQKr ._1BYFc ._1PFnA div{margin-right:24px;white-space:nowrap}._2BQKr ._1BYFc ._1PFnA div img{width:16px;height:16px;padding:0 4px 2px 0}._2BQKr ._1BYFc .JoZ_k{font-size:12px;color:#000000;font-weight:600;line-height:16px;cursor:pointer}._2BQKr ._2Ixce{padding:0 20px 0 40px;overflow-y:auto;height:92%}._2BQKr ._2Ixce ._1TDMZ{font-size:16px;color:#101010;font-weight:600;line-height:20px}._2BQKr ._2Ixce ._33g73{font-size:14px;color:#7e7e7e;font-weight:400;line-height:16px}._2BQKr .aQX9t{border:.5px solid rgba(16,16,16,.22);border-radius:12px;background:#fff}@media(min-width:992px){._2BQKr{padding-top:0;padding-bottom:0}._2BQKr ._164ne{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;padding-bottom:16px}._2BQKr ._164ne ._3L47o{-ms-flex-pack:start;justify-content:flex-start;border:none}._2BQKr ._164ne ._3L47o,._2BQKr ._164ne ._3L47o .VdzpF{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N{margin-bottom:0}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N span{margin-right:12px}._2BQKr ._164ne ._3L47o .VdzpF ._2rn_N span img{padding-right:4px}._2BQKr ._2TsZU{height:196px;overflow-y:auto}._2BQKr ._2TsZU::-webkit-scrollbar{display:block}._2BQKr ._1Dacs>._3gQ_b{margin-top:0;margin-right:4px}._2BQKr ._1Dacs>._3gQ_b._2AsT2{margin-top:20px}._7efW6{padding:0}._2BQKr>._164ne>._3ph4K>.Lx7CQ span{margin-right:12px}._2BQKr>._164ne>._3ph4K>.Lx7CQ img{padding-left:0}}',
          }}
        />
        <style
          type="text/css"
          id="s1296-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1MXHM{-webkit-animation:_1MXHM .3s cubic-bezier(.22,.61,.36,1);animation:_1MXHM .3s cubic-bezier(.22,.61,.36,1)}.RhFXf{-webkit-animation:RhFXf .3s cubic-bezier(.22,.61,.36,1);animation:RhFXf .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1MXHM{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1MXHM{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes RhFXf{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes RhFXf{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1h6Ku{-ms-flex-direction:row;flex-direction:row}._3DEEw,._1h6Ku{display:-ms-flexbox;display:flex}._3DEEw{-ms-flex-direction:column;flex-direction:column}._2n1rw{border-bottom:1px solid #cacaca}.eVcG3{border:1px solid #cacaca}._1XL6J{border-top:1px solid #cacaca}.Jm9bR{font-size:12px;margin:8px 0;color:#fd5154}._4rDPE{position:relative;overflow:hidden}._4rDPE:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._4rDPE:hover:not(:active):after{-webkit-animation:_3h7TG .09s linear 0s;animation:_3h7TG .09s linear 0s}@-webkit-keyframes _3h7TG{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3h7TG{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.Hv3eT,body{height:100%;width:100%}.Hv3eT{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.abtQa{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:justify;justify-content:space-between;background:#fff}.abtQa ._3tMEB{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-direction:column;flex-direction:column;font-size:10px;color:#7e7e7e;font-weight:400;line-height:12px;width:48px;text-align:center;-ms-flex-item-align:center;align-self:center}.abtQa ._3tMEB img{width:32px;height:auto;margin-bottom:8px}.abtQa ._2XDZF{margin-right:38px}.abtQa ._1CLeO{margin-left:10px;width:100%}.abtQa ._1CLeO ._1z7xD{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:4px}.abtQa ._1CLeO ._1z7xD._1nqFV{font-size:10px;color:#101010;font-weight:400;line-height:12px}.abtQa ._1CLeO ._1z7xD._3svf- div{font-size:14px;color:#101010;font-weight:700;line-height:20px}.abtQa ._1CLeO ._1z7xD._3svf- span{font-size:10px;color:#101010;font-weight:600;line-height:12px}.abtQa ._1CLeO ._1z7xD._3svf- span._27kXv{margin:0 8px}.abtQa ._1CLeO ._1z7xD._1V10B{font-size:12px;color:#101010;font-weight:400;line-height:16px}.abtQa ._1CLeO ._1z7xD.ya23h{font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px;margin-bottom:0}.abtQa ._1CLeO ._1z7xD.ya23h ._1dVW_{text-align:right;margin-left:28px}._3x4s5{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:justify;justify-content:space-between;background:#fff}._3x4s5 ._3tMEB{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-direction:column;flex-direction:column;font-size:12px;color:#7e7e7e;font-weight:400;line-height:14px;width:48px;text-align:center;-ms-flex-item-align:center;align-self:center;margin-right:38px}._3x4s5 ._3tMEB span{width:100px}._3x4s5 ._3tMEB img{width:32px;height:auto;margin-bottom:8px}._3x4s5 ._1CLeO{margin-left:10px;width:100%}._3x4s5 ._1CLeO ._1z7xD{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:4px}._3x4s5 ._1CLeO ._1z7xD._1nqFV{font-size:14px;color:#101010;font-weight:500;line-height:18px}._3x4s5 ._1CLeO ._1z7xD._1nqFV span{font-size:12px;color:#7e7e7e;font-weight:600;line-height:16px}._3x4s5 ._1CLeO ._1z7xD._3svf- div{font-size:20px;color:#101010;font-weight:700;line-height:24px}._3x4s5 ._1CLeO ._1z7xD._3svf- span,._3x4s5 ._1CLeO ._1z7xD._3svf- span span{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._3x4s5 ._1CLeO ._1z7xD._3svf- span span{font-size:12px;color:#7e7e7e;font-weight:600;line-height:16px}._3x4s5 ._1CLeO ._1z7xD._3svf- span span img{padding:0 6px}._3x4s5 ._1CLeO ._1z7xD._3svf- span span._27kXv{margin:0 8px}._3x4s5 ._1CLeO ._1z7xD._1V10B{font-size:14px;color:#101010;font-weight:600;line-height:18px}._3x4s5 ._1CLeO ._1z7xD.ya23h{font-size:12px;color:#7e7e7e;font-weight:400;line-height:18px;margin-bottom:0}._3x4s5 ._1CLeO ._1z7xD.ya23h ._1dVW_{text-align:right;margin-left:28px}._2PSnX{border:.5px solid rgba(16,16,16,.22);border-radius:12px;padding:12px;overflow:hidden}.sboCZ{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:start;justify-content:flex-start;font-size:12px;color:#101010;font-weight:400;line-height:16px;margin:12px 0;background:#fff8e1;border-radius:8px;padding:8px 12px}.sboCZ .X4bxb{margin-right:10px;width:16px;height:16px}._36CLn{width:calc(100% - 9em - 6px);margin:20px 0 20px auto}',
          }}
        />
        <style
          type="text/css"
          id="s1279-0"
          dangerouslySetInnerHTML={{
            __html:
              '.dnipV{-webkit-animation:dnipV .3s cubic-bezier(.22,.61,.36,1);animation:dnipV .3s cubic-bezier(.22,.61,.36,1)}._3DJmi{-webkit-animation:_3DJmi .3s cubic-bezier(.22,.61,.36,1);animation:_3DJmi .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes dnipV{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes dnipV{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3DJmi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3DJmi{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2ueWd{-ms-flex-direction:row;flex-direction:row}.F-SnD,._2ueWd{display:-ms-flexbox;display:flex}.F-SnD{-ms-flex-direction:column;flex-direction:column}.XVD82{border-bottom:1px solid #cacaca}._2MScA{border:1px solid #cacaca}._3YtvX{border-top:1px solid #cacaca}._3hykb{font-size:12px;margin:8px 0;color:#fd5154}.cncdH{position:relative;overflow:hidden}.cncdH:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.cncdH:hover:not(:active):after{-webkit-animation:_1AWNf .09s linear 0s;animation:_1AWNf .09s linear 0s}@-webkit-keyframes _1AWNf{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1AWNf{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._3EwLr,body{height:100%;width:100%}._3EwLr{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*,.hVMs1{-webkit-box-sizing:border-box;box-sizing:border-box}.hVMs1{margin-top:16px}.hVMs1 ._1qlUW{width:100%;height:60px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;position:relative;-webkit-box-sizing:border-box;box-sizing:border-box}.hVMs1 ._1qlUW img{margin:20px 20px 20px 0}.hVMs1 ._1qlUW ._2q4YC{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;width:100%;height:100%;border-bottom:1px solid rgba(16,16,16,.07)}.hVMs1 ._1qlUW ._2q4YC ._1g5i9{font-size:14px;color:#101010;font-weight:500;line-height:20px}.hVMs1 ._1qlUW ._2q4YC i{width:7px;height:7px;position:absolute;right:10px;border-top:2px solid #101010;border-right:2px solid #101010;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.hVMs1 hr{margin-left:30px;height:1px;background-color:rgba(16,16,16,.07);border:none}._2kxZ9{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:14px;font-weight:600;padding:16px 0 20px}@media(min-width:992px){.hVMs1{margin-top:0;margin-right:4px}}',
          }}
        />
        <style
          type="text/css"
          id="s1630-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3hayU{-webkit-animation:_3hayU .3s cubic-bezier(.22,.61,.36,1);animation:_3hayU .3s cubic-bezier(.22,.61,.36,1)}._1C1oL{-webkit-animation:_1C1oL .3s cubic-bezier(.22,.61,.36,1);animation:_1C1oL .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _3hayU{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _3hayU{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1C1oL{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1C1oL{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.smE8e{-ms-flex-direction:row;flex-direction:row}._3Ot75,.smE8e{display:-ms-flexbox;display:flex}._3Ot75{-ms-flex-direction:column;flex-direction:column}._1zt0a{border-bottom:1px solid #cacaca}._2BP4a{border:1px solid #cacaca}._2PaIY{border-top:1px solid #cacaca}._2dSMP{font-size:12px;margin:8px 0;color:#fd5154}.V-nlN ._3KmyC,.Nps2l{position:relative;overflow:hidden}.V-nlN ._3KmyC:after,.Nps2l:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.V-nlN ._3KmyC:hover:not(:active):after,.Nps2l:hover:not(:active):after{-webkit-animation:_25hwf .09s linear 0s;animation:_25hwf .09s linear 0s}@-webkit-keyframes _25hwf{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _25hwf{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.M_dgI,body{height:100%;width:100%}.M_dgI{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.V-nlN{margin:0 16px 34px}.V-nlN h3{font-size:18px;color:#101010;font-weight:700;line-height:24px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:justify;justify-content:space-between}.V-nlN h3 .tBJCF{font-size:14px;color:#7e7e7e;font-weight:700;line-height:24px;display:inline;text-transform:uppercase}.V-nlN h3 .tBJCF._1WnRn{font-size:14px;color:#21c179;font-weight:700;line-height:24px}.V-nlN ._2aN0Z{background:#fff;border:1px solid rgba(16,16,16,.22);border-radius:12px;padding:6px 0 6px 20px;margin-top:12px}.V-nlN ._2aN0Z .F5OMD,.V-nlN ._2aN0Z .F5OMD ._39VRe{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}.V-nlN ._2aN0Z .F5OMD ._39VRe{width:25px;height:20px;-ms-flex-pack:center;justify-content:center;border-radius:50%;font-size:12px;color:#fff;font-weight:600;text-transform:uppercase;background-color:#000000;padding:8px;margin-right:10px}.V-nlN ._2aN0Z .F5OMD img{width:32px;height:32px;margin-right:16px}.V-nlN ._2aN0Z .F5OMD ._16A2f{width:100%;border-bottom:1px solid rgba(16,16,16,.22);padding:18px 0;font-size:14px;color:#101010;font-weight:500;line-height:20px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}.V-nlN ._2aN0Z .F5OMD ._16A2f i{margin:0 24px 0 auto;padding:5px;border:solid #101010;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}.V-nlN ._2aN0Z .F5OMD ._16A2f ._1RebE{text-transform:capitalize}.V-nlN ._2aN0Z .F5OMD ._16A2f ._15k_h{font-size:12px;color:#7e7e7e;font-weight:400;display:block}.V-nlN ._2aN0Z .F5OMD ._16A2f ._3TCyC span{font-size:12px;color:#7e7e7e;font-weight:400;display:block;word-wrap:break-word}.V-nlN ._2aN0Z .F5OMD ._348yR{padding:10px 0}.V-nlN ._2aN0Z .F5OMD:last-child>div{border-bottom:0}.V-nlN ._2xicD{margin-bottom:16px}.V-nlN ._3KmyC{background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer;margin-top:16px}.V-nlN ._3KmyC img{font-size:12px;width:20px;height:20px;margin:0 4px}',
          }}
        />
        <style
          type="text/css"
          id="s1611-0"
          dangerouslySetInnerHTML={{
            __html:
              '.GcnGI{-webkit-animation:GcnGI .3s cubic-bezier(.22,.61,.36,1);animation:GcnGI .3s cubic-bezier(.22,.61,.36,1)}._2a0Z2{-webkit-animation:_2a0Z2 .3s cubic-bezier(.22,.61,.36,1);animation:_2a0Z2 .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes GcnGI{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes GcnGI{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2a0Z2{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2a0Z2{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.U11QK{-ms-flex-direction:row;flex-direction:row}._3E2_b,.U11QK{display:-ms-flexbox;display:flex}._3E2_b{-ms-flex-direction:column;flex-direction:column}._3TJSG{border-bottom:1px solid #cacaca}._3CEgL{border:1px solid #cacaca}._3SfPT{border-top:1px solid #cacaca}._27bO9{font-size:12px;margin:8px 0;color:#fd5154}.Ks4ZP,._1uaZZ button{position:relative;overflow:hidden}.Ks4ZP:after,._1uaZZ button:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.Ks4ZP:hover:not(:active):after,._1uaZZ button:hover:not(:active):after{-webkit-animation:_1eIPv .09s linear 0s;animation:_1eIPv .09s linear 0s}@-webkit-keyframes _1eIPv{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1eIPv{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.a94F8,body{height:100%;width:100%}.a94F8{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.JAC0- ._3B6Xe{position:fixed;top:0;z-index:1;margin:0 16px;background:#fff;width:100%}.JAC0- ._3B6Xe .bFYAr{width:100%;padding:30px 0 24px;display:-ms-flexbox;display:flex;-ms-flex-align:baseline;align-items:baseline}.JAC0- ._3B6Xe .bFYAr ._1teWR{margin-left:16px;font-size:18px;color:#101010;font-weight:700;line-height:24px}.JAC0- ._3B6Xe .bFYAr ._1teWR span{display:block;padding-top:4px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}.JAC0- ._3B6Xe .bFYAr ._10BpD{width:16px;height:16px}.JAC0- ._3B6Xe .bFYAr._2p6Vg{padding:30px 0}.JAC0- ._3B6Xe ._3B7XY{background:#fff8e1;padding:8px 12px;margin-right:30px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:start;font-size:12px;color:#101010;font-weight:400}.JAC0- ._3B6Xe ._3B7XY img{padding-right:8px}.JAC0- ._3B6Xe ._3B7XY ._2uSj6 span{font-size:12px;color:#101010;font-weight:700}.JAC0- ._3B6Xe ._3B7XY ._2uSj6 p{margin:0}.JAC0- ._3B6Xe ._3B7XY._1YEv3{margin-top:5px}.JAC0- .YKC4j{margin:100px 16px 0}.JAC0- .YKC4j h5{padding-bottom:32px;text-transform:uppercase;font-size:14px;color:#101010;font-weight:600;line-height:24px}.JAC0- .YKC4j ._22mFO{height:80%;overflow-y:scroll;margin-bottom:170px}.JAC0- .YKC4j ._22mFO ._2s2Ln{display:-ms-flexbox;display:flex;padding:0 0 15px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh{display:-ms-flexbox;display:flex;width:100%;padding-bottom:15px;border-bottom:1px solid rgba(16,16,16,.07)}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh ._2TTiE{display:-ms-flexbox;display:flex;-ms-flex-align:baseline;align-items:baseline;-ms-flex-direction:column;flex-direction:column;font-size:16px;color:#101010;font-weight:500;line-height:24px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh ._2TTiE>span{margin-top:8px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:10px;color:#7e7e7e;font-weight:600;line-height:16px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh ._2TTiE>span img{margin:0 3px;width:13px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh ._2TTiE>span .xEsb5{margin-right:5px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._1tENh ._2TTiE>span ._3scCh{font-size:10px;color:#21c179;font-weight:600;line-height:16px}.JAC0- .YKC4j ._22mFO ._2s2Ln ._3hh-V{margin-left:auto;min-width:100px;border-bottom:1px solid rgba(16,16,16,.07)}.JAC0- .YKC4j ._22mFO ._2s2Ln ._3hh-V img{width:32px;margin-left:14px}.JAC0- .YKC4j ._22mFO ._2s2Ln:last-of-type ._1tENh{border-bottom:0;padding-bottom:0}.JAC0- .GqjFe{-webkit-box-shadow:0 -3px 8px -4px rgba(16,16,16,.13);box-shadow:0 -3px 8px -4px rgba(16,16,16,.13);background:#fff;width:100%;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-direction:column;flex-direction:column;position:fixed;bottom:0;z-index:1}.JAC0- .GqjFe a{padding:12px 4px 20px 0;border-bottom:1px solid rgba(16,16,16,.22);display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}.JAC0- .GqjFe a i{margin-left:auto;margin-right:8px;padding:4px;border:solid #000000;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}.JAC0- .GqjFe a img{margin:0 10px 0 15px}.JAC0- .GqjFe a._3fN7v{margin-bottom:17%;border-bottom:0}.JAC0- .GqjFe ._3amn0{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;padding:10px 16px}.JAC0- .GqjFe ._3amn0 span{text-transform:uppercase;margin-left:12px;font-size:14px;color:#7e7e7e;font-weight:600;line-height:16px}.JAC0- .GqjFe ._3amn0 button{background:#000000;color:#fff;font-size:16px;height:52px;width:184px;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer;margin-right:4px}.JAC0- .GqjFe ._3amn0 button:disabled,.JAC0- .GqjFe ._3amn0 button button[disabled]{background:rgba(16,16,16,.07);color:rgba(248,147,147,.22)}.JAC0- .GqjFe ._3aVVE{padding:1px 18px 8px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;margin-bottom:75px;font-size:14px;color:#101010;font-weight:500;line-height:20px}.JAC0- .GqjFe ._3aVVE ._3ZhxK{margin-left:28px}._1uaZZ{padding:0 20px 20px;margin-top:-30px}._1uaZZ h3{padding-right:30px}._1uaZZ button{margin:16px 0 0;background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._1uaZZ ._1E7WB{background:#e0f5fd}._1uaZZ ._1E7WB img{width:124px}._1uaZZ ._20ET9{border:1px solid #000000;background:#fff;color:#000000}._7N6s_{font-size:18px;color:#101010;font-weight:700;line-height:24px;margin-left:16px;width:80%;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._7N6s_ ._1kVU8{font-size:14px;color:rgba(16,16,16,.54);font-weight:600;line-height:20px}._7N6s_ ._2gXm5{color:#21c179}.XKZh9{position:absolute;right:15px;bottom:-8px;width:100%}.XKZh9._697Rh{bottom:50px}@media screen and (max-width:385px){.GqjFe a._1YEv3{margin-bottom:11px}.XKZh9._697Rh{bottom:65px}}@media screen and (min-width:992px){._1Jpon{width:100%;margin-top:24px}}',
          }}
        />
        <style
          type="text/css"
          id="s1619-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2n0jn{-webkit-animation:_2n0jn .3s cubic-bezier(.22,.61,.36,1);animation:_2n0jn .3s cubic-bezier(.22,.61,.36,1)}._3D0vG{-webkit-animation:_3D0vG .3s cubic-bezier(.22,.61,.36,1);animation:_3D0vG .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2n0jn{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2n0jn{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3D0vG{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3D0vG{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.bDx6c{-ms-flex-direction:row;flex-direction:row}._1wOt5,.bDx6c{display:-ms-flexbox;display:flex}._1wOt5{-ms-flex-direction:column;flex-direction:column}._1CRFT{border-bottom:1px solid #cacaca}._2hqcH{border:1px solid #cacaca}._3jWqY{border-top:1px solid #cacaca}._31fBm{font-size:12px;margin:8px 0;color:#fd5154}._1zaYz ._2GnCy button,._1zaYz ._1hKlJ button,._1u0hH{position:relative;overflow:hidden}._1zaYz ._2GnCy button:after,._1zaYz ._1hKlJ button:after,._1u0hH:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._1zaYz ._2GnCy button:hover:not(:active):after,._1zaYz ._1hKlJ button:hover:not(:active):after,._1u0hH:hover:not(:active):after{-webkit-animation:_1UTGN .09s linear 0s;animation:_1UTGN .09s linear 0s}@-webkit-keyframes _1UTGN{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1UTGN{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._1oyTl,body{height:100%;width:100%}._1oyTl{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.Dfrub{width:100%;margin-top:24px}._4a1S_{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;font-size:14px;font-size:1rem;color:#101010;font-weight:600;line-height:20px}._4a1S_ img{width:20px;height:20px;vertical-align:sub;padding-right:5px}._4a1S_ h3{display:inline-block;font-size:16px;color:#101010;font-weight:600;line-height:20px;padding-right:8px}._4a1S_ ._3xMvt{color:rgba(16,16,16,.54)}._4a1S_ ._3xMvt,._4a1S_ ._3xMvt.rSovx{font-size:14px;font-weight:600;line-height:18px}._4a1S_ ._3xMvt.rSovx{color:#21c179}._4a1S_ ._1OM-M{font-size:12px;color:#7e7e7e;font-weight:400;line-height:20px}._4a1S_ ._3NwN7{font-size:10.5px;font-size:.75rem;color:#101010;font-weight:400;line-height:20px;border-radius:8px;background:#f5f9fe;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;padding:6px}._4a1S_ ._3NwN7>span{margin-right:5px}._4a1S_ ._3NwN7 ._3nWlW{font-size:10.5px;font-size:.75rem;color:#000000;font-weight:600;line-height:16px;cursor:pointer}._4a1S_ ._3NwN7 ._3nWlW i{padding:3px;border:solid #000000;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}._1cAcI{border-radius:12px;border:1px solid rgba(16,16,16,.13);margin-top:5px;padding:10px 10px 10px 10px}hr{height:1px;background:rgba(16,16,16,.13);border:none;margin:0}._1zaYz{padding-right:16px}._1zaYz ._1hKlJ{display:-ms-flexbox;display:flex;margin-top:10px;grid-gap:16px;gap:16px}._1zaYz ._1hKlJ>div{-ms-flex:1 1;flex:1 1}._1zaYz ._1hKlJ button{background:#fff;color:#000000;font-size:16px;font-weight:600;width:100%;height:52px;border-radius:8px;border:1px solid #000000;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer;-ms-flex:1 1;flex:1 1}._1zaYz ._1hKlJ._2Wkfy{-ms-flex-wrap:wrap;flex-wrap:wrap}._1zaYz ._1hKlJ._2Wkfy>div{-ms-flex:0 0 32%;flex:0 0 32%}._1zaYz ._1hKlJ._2Wkfy ._1Aq9z{margin-left:auto}._1zaYz ._2GnCy{-ms-flex-align:center;margin-top:16px;-ms-flex:1 1;flex:1 1;grid-gap:16px;gap:16px}._1zaYz ._2GnCy,._1zaYz ._2GnCy button{display:-ms-flexbox;display:flex;align-items:center}._1zaYz ._2GnCy button{background:#fff;color:#000000;font-size:16px;font-weight:600;width:30%;height:52px;border-radius:8px;border:1px solid #000000;padding:0 12px;-ms-flex-align:center;-ms-flex-pack:center;justify-content:center;cursor:pointer;-ms-flex-item-align:end;align-self:flex-end}._1zaYz ._16INN{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-direction:column;flex-direction:column;-ms-flex:1 1;flex:1 1}._1zaYz ._16INN ._32Xu3{display:-ms-flexbox;display:flex;width:100%;grid-gap:16px;gap:16px}._1zaYz ._16INN ._32Xu3>div{-ms-flex:1 1;flex:1 1}._3KFHG{-ms-flex-pack:justify;justify-content:space-between;padding:12px 4px}._3KFHG,._3KFHG ._262Hv{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._3KFHG ._262Hv ._2sTmD{height:20px}._3KFHG ._3Fc7l{text-transform:capitalize;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;font-size:12.25px;font-size:.875rem;color:#101010;font-weight:500;line-height:20px}._3KFHG ._3Fc7l span{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:10px;color:#21c179;font-weight:600;line-height:16px}._3KFHG ._3Fc7l span ._2RC1d{font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px;margin-right:8px}._3KFHG ._3Fc7l span img{margin-right:3px;width:14px;height:14px}._3KFHG ._3zwqf{width:30px;height:30px;cursor:pointer}._2B4Yj ._2m0G6{font-size:12.25px;font-size:.875rem;color:#000000;font-weight:600;line-height:20px;cursor:pointer}._2B4Yj ._2m0G6 i{padding:2.5px;border:solid #000000;border-width:0 1px 1px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg);margin-left:5px;vertical-align:super}._2B4Yj ._2m0G6._3hUIm i{-webkit-transform:rotate(-135deg);-ms-transform:rotate(-135deg);transform:rotate(-135deg);vertical-align:middle}._2B4Yj ._1W7Gv{padding-right:4px;overflow:hidden}._2B4Yj ._1W7Gv._2V02f{overflow-y:auto}._2B4Yj h5{text-transform:uppercase;font-size:12.25px;font-size:.875rem;color:#101010;font-weight:600;line-height:21px;padding:12px 0;margin-right:8px;display:inline-block}._2B4Yj ._13KRe{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2B4Yj ._262Hv{display:-ms-flexbox;display:flex;padding:12px 0}._2B4Yj ._262Hv ._2sTmD{height:20px;-ms-flex-item-align:center;align-self:center}._2B4Yj ._3Fc7l{text-transform:capitalize;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;font-size:14px;color:#101010;font-weight:500;line-height:20px}._2B4Yj ._3Fc7l span{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:8.4px;font-size:.6rem;color:#21c179;font-weight:600;line-height:16px}._2B4Yj ._3Fc7l span ._13_na{font-size:10.5px;font-size:.75rem;color:#7e7e7e;font-weight:400;line-height:16px;margin-right:8px}._2B4Yj ._3Fc7l span img{margin-right:3px;width:14px;height:14px}._2B4Yj ._1Aq9z{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;width:80px;cursor:pointer}._2B4Yj ._1Aq9z ._3zwqf{margin-right:10px}._12Ufm{background:#fff8e1;padding:8px 12px;margin-right:30px;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:start;font-size:10.5px;font-size:.75rem;color:#101010;font-weight:400}._12Ufm img{padding-right:8px}._12Ufm ._1lY3Z span{font-size:10.5px;font-size:.75rem;color:#101010;font-weight:700}._12Ufm ._1lY3Z p{margin:0}._2Ro-8{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;padding:10px 0;background:rgba(16,16,16,.07);min-height:40px;font-size:10.5px;font-size:.75rem;color:#101010;font-weight:500}._2Ro-8 ._2r55e{font-size:12.25px;font-size:.875rem;color:#101010;font-weight:600}._2Ro-8 ._1zvO-{-ms-flex-pack:justify;justify-content:space-between;width:100px}._2Ro-8 ._1zvO-,._2Ro-8 ._1zvO- button{cursor:pointer;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2Ro-8 ._1zvO- button{background:false;color:#000000;font-size:12.25px;font-size:.875rem;font-weight:600;width:100%;height:30px;border-radius:false;padding:0 12px;-ms-flex-pack:center;justify-content:center;border:none}._2Ro-8 ._1zvO- img{margin-right:5px;width:20px}',
          }}
        />
        <style
          type="text/css"
          id="s1612-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3CnLH{-webkit-animation:_3CnLH .3s cubic-bezier(.22,.61,.36,1);animation:_3CnLH .3s cubic-bezier(.22,.61,.36,1)}._1sQt7{-webkit-animation:_1sQt7 .3s cubic-bezier(.22,.61,.36,1);animation:_1sQt7 .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _3CnLH{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _3CnLH{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1sQt7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1sQt7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.OdXOb{-ms-flex-direction:row;flex-direction:row}._1FubT,.OdXOb{display:-ms-flexbox;display:flex}._1FubT{-ms-flex-direction:column;flex-direction:column}._1Q1Zr{border-bottom:1px solid #cacaca}._35JYG{border:1px solid #cacaca}.wgRVE{border-top:1px solid #cacaca}._2qbg0{font-size:12px;margin:8px 0;color:#fd5154}._3yIvT ._3vlTf,._3yIvT ._2_Z5g,._1qpsK,._2fRgD ._1vfFe ._2I1os button{position:relative;overflow:hidden}._3yIvT ._3vlTf:after,._3yIvT ._2_Z5g:after,._1qpsK:after,._2fRgD ._1vfFe ._2I1os button:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3yIvT ._3vlTf:hover:not(:active):after,._3yIvT ._2_Z5g:hover:not(:active):after,._1qpsK:hover:not(:active):after,._2fRgD ._1vfFe ._2I1os button:hover:not(:active):after{-webkit-animation:_2wSNC .09s linear 0s;animation:_2wSNC .09s linear 0s}@-webkit-keyframes _2wSNC{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2wSNC{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._3TIUE,body{height:100%;width:100%}._3TIUE{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2KTD9{position:fixed;top:0;z-index:1;margin:0 16px;background:#fff;width:100%}._2KTD9 ._2maaQ{width:100%;padding:30px 0 24px;display:-ms-flexbox;display:flex;-ms-flex-align:baseline;align-items:baseline}._2KTD9 ._2maaQ ._114R0{margin-left:16px;font-size:18px;color:#101010;font-weight:700;line-height:24px}._2KTD9 ._2maaQ ._114R0 span{display:block;padding-top:4px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._2KTD9 ._2maaQ ._2pi99{width:16px;height:16px}._2KTD9 ._2maaQ.VgfQf{padding:30px 0}._2fRgD{height:80%;overflow-y:scroll;margin:100px 0 180px}._2fRgD .JHjoA{margin:0 16px}._2fRgD ._1vfFe{border:.5px solid rgba(16,16,16,.22);border-radius:12px;padding:0 20px;margin:0 16px 16px}._2fRgD ._1vfFe ._3wTWs{height:54px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;font-size:14px;color:#101010;font-weight:600;line-height:20px}._2fRgD ._1vfFe ._3wTWs i{padding:4px;border:solid #101010;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}._2fRgD ._1vfFe ._1kCz4{display:-ms-flexbox;display:flex;margin-top:20px}._2fRgD ._1vfFe ._1kCz4>div{margin-right:33px;min-width:66px}._2fRgD ._1vfFe ._3zDYO{margin-top:24px}._2fRgD ._1vfFe ._3zDYO>div{margin-bottom:24px}._2fRgD ._1vfFe ._2I1os button{margin-top:32px;background:#fff;color:#000000;font-size:16px;font-weight:600;width:100%;height:52px;border-radius:8px;border:1px solid #000000;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer}._2fRgD ._1vfFe ._2I1os button img{width:124px}._2fRgD ._1vfFe ._78Nqo{margin-top:24px}._2fRgD ._1vfFe ._2isSs{font-size:12px;color:#7e7e7e;font-weight:500;line-height:20px;margin:0}._2fRgD._3gW19{margin-top:190px}.EISff{margin-top:6.5rem}._2bmca{background:#f5f9fe;border:.5px solid rgba(16,16,16,.22);border-radius:12px;display:-ms-flexbox;display:flex;padding:22px 27px;margin-top:20px;margin-bottom:20px;margin-left:0}._2bmca ._38L96{margin-left:20px;text-transform:capitalize;display:-ms-flexbox;display:flex;-ms-flex-align:baseline;align-items:baseline;-ms-flex-direction:column;flex-direction:column;font-size:14px;color:#101010;font-weight:500;line-height:20px}._2bmca ._38L96 span{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:10px;color:#21c179;font-weight:600;line-height:16px}._2bmca ._38L96 span img{margin-right:3px;width:13px}._2bmca .yk0vm{margin-left:auto;width:24px}._1fDn9{margin:8px 0;font-size:12px;color:#fd5154}._281u3{position:absolute;border:1px solid #cacaca;border-radius:12px;overflow:hidden;z-index:2}._3yIvT{margin:-20px 16px 50px}._3yIvT ._2_Z5g{margin-top:32px;background:#000000;color:#fff;border-radius:8px;border:0}._3yIvT ._3vlTf,._3yIvT ._2_Z5g{font-size:16px;height:52px;width:100%;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer;margin-bottom:20px}._3yIvT ._3vlTf{background:#fff;color:#000000;border-radius:8px;border:1px solid #000000}._2Puqn{position:relative}@media screen and (min-width:992px){._1kCz4{font-size:.875rem;color:#101010;font-weight:500;line-height:24px;grid-gap:33px;gap:33px}._2uAgE,._1kCz4{display:-ms-flexbox;display:flex}._2uAgE{-ms-flex-align:start;align-items:flex-start;-ms-flex-direction:column;flex-direction:column;-ms-flex:1 1;flex:1 1}._2uAgE ._3_xlA{display:-ms-flexbox;display:flex;width:100%;grid-gap:16px;gap:16px}._2uAgE ._3_xlA>div{-ms-flex:1 1;flex:1 1}._30km8,._2uAgE ._3_xlA>div._30km8{padding-top:24px}}.SJskP .Y_vFA{font-size:14px;color:#101010;font-weight:600;line-height:16px;margin-bottom:2px}.SJskP ._1XbXK{font-size:12px;color:rgba(16,16,16,.54);font-weight:400;line-height:16px}.SJskP img{margin:14px 8px;width:291px;height:77px}',
          }}
        />
        <style
          type="text/css"
          id="s1607-0"
          dangerouslySetInnerHTML={{
            __html:
              '.ZbCt4{-webkit-animation:ZbCt4 .3s cubic-bezier(.22,.61,.36,1);animation:ZbCt4 .3s cubic-bezier(.22,.61,.36,1)}._3R61b{-webkit-animation:_3R61b .3s cubic-bezier(.22,.61,.36,1);animation:_3R61b .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes ZbCt4{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes ZbCt4{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3R61b{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3R61b{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.a2nJq{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row}._9RCKB,._3ajMo ._3d1gu{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column}._2xNu7{border-bottom:1px solid #cacaca}._3Gxt9{border:1px solid #cacaca}._2I1mC{border-top:1px solid #cacaca}.p3smU{font-size:12px;margin:8px 0;color:#fd5154}._3ajMo ._2zTv- button,.xcLGN{position:relative;overflow:hidden}._3ajMo ._2zTv- button:after,.xcLGN:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3ajMo ._2zTv- button:hover:not(:active):after,.xcLGN:hover:not(:active):after{-webkit-animation:_1C5zK .09s linear 0s;animation:_1C5zK .09s linear 0s}@-webkit-keyframes _1C5zK{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1C5zK{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2sdkg,body{height:100%;width:100%}._2sdkg{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3ajMo ._3d1gu{background:#fff;border-radius:12px;padding:0 16px 20px}._3ajMo ._3d1gu ._2lXZv{font-size:18px;color:#101010;font-weight:500;line-height:20px}._3ajMo ._3d1gu ._2lXZv span{display:-ms-flexbox;display:flex;padding-top:4px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._3ajMo ._3d1gu ul{margin-top:20px}._3ajMo ._3d1gu ._1mIdd{border-bottom:1px solid rgba(16,16,16,.13);padding-bottom:10px}._3ajMo ._3d1gu .dEEgW{margin-top:12px}._3ajMo ._3d1gu .dEEgW label{font-size:12px;color:#7e7e7e;font-weight:500;line-height:20px}._3ajMo ._3d1gu .wdPqw{position:relative;padding-top:16px}._3ajMo ._3d1gu .wdPqw ._2vmdH{position:absolute;top:23px;right:0;bottom:0;z-index:1}._3ajMo ._3d1gu ._3TBbO{pointer-events:none;opacity:.5}._3ajMo ._2zTv-{background:#fff;width:100%;padding:12px 16px 18px}._3ajMo ._2zTv- button{background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._3ajMo ._1oMQP{margin:8px 0;font-size:12px;color:#fd5154}@media only screen and (min-width:992px){._3ajMo{background:#fff;border:1px solid rgba(16,16,16,.13);border-radius:12px}._3ajMo ._3d1gu{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-direction:row;flex-direction:row;padding:0 16px 14px;height:92px}._3ajMo ._3d1gu ._2Ocet{-ms-flex-item-align:center;align-self:center;padding-top:16px;display:-ms-flexbox;display:flex}._3ajMo ._3d1gu ._2Ocet ._19kGz{width:20px;height:20px;margin-right:6px}._3ajMo ._3d1gu ._2Ocet>div ._3GDXC{font-size:16px;color:#101010;font-weight:600;line-height:20px}._3ajMo ._3d1gu ._2Ocet>div ._2wVvA{font-size:12px;color:rgba(16,16,16,.54);font-weight:400;line-height:20px}._3ajMo ._3d1gu>ul{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex:.9 1;flex:.9 1;margin:0;grid-gap:16px;gap:16px}._3ajMo ._3d1gu>ul li{-ms-flex-preferred-size:220px;flex-basis:220px;border-bottom:1px solid rgba(0,0,0,0)}._3ajMo ._3d1gu>ul li .wdPqw ._1aWLm>label{font-size:12px;color:rgba(16,16,16,.54);font-weight:400;line-height:16px}._3ajMo ._3d1gu>ul li .wdPqw ._1aWLm>h5{font-size:16px;color:#000;font-weight:500;line-height:18px}._3ajMo ._3d1gu>ul :last-child{-ms-flex-preferred-size:280px;flex-basis:280px}._3ajMo ._3d1gu>ul ._1Ud_Q{-ms-flex-preferred-size:44px;flex-basis:44px;height:0}._3ajMo ._3d1gu>ul ._1Ud_Q>h5{font-size:16px;font-weight:600;padding-top:4px}._3ajMo ._3d1gu ._33-8e{font-size:14px;color:#000000;font-weight:600;line-height:16px;cursor:pointer;margin-top:28px}}',
          }}
        />
        <style
          type="text/css"
          id="s1360-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1MQs6{-webkit-animation:_1MQs6 .3s cubic-bezier(.22,.61,.36,1);animation:_1MQs6 .3s cubic-bezier(.22,.61,.36,1)}.nJzMZ{-webkit-animation:nJzMZ .3s cubic-bezier(.22,.61,.36,1);animation:nJzMZ .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1MQs6{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1MQs6{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes nJzMZ{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes nJzMZ{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2wUwV{-ms-flex-direction:row;flex-direction:row}._2-OnI,._2wUwV{display:-ms-flexbox;display:flex}._2-OnI{-ms-flex-direction:column;flex-direction:column}._1B1_e{border-bottom:1px solid #cacaca}._2jzZ5{border:1px solid #cacaca}.o0UJH{border-top:1px solid #cacaca}._19Jpr{font-size:12px;margin:8px 0;color:#fd5154}._1pk2o{position:relative;overflow:hidden}._1pk2o:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._1pk2o:hover:not(:active):after{-webkit-animation:_2zdsk .09s linear 0s;animation:_2zdsk .09s linear 0s}@-webkit-keyframes _2zdsk{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2zdsk{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.EbWGx,body{height:100%;width:100%}.EbWGx{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.Gk33M{display:block;padding-top:14px;position:relative}.Gk33M>input{display:block;color:#101010;outline:0;width:100%;padding:0;-webkit-box-shadow:none;box-shadow:none;border-radius:0;font-size:16px;font-weight:500;background-image:none;height:38px;-webkit-appearance:none;-webkit-tap-highlight-color:rgba(0,0,0,0);border:none;border-bottom:1px solid rgba(0,0,0,.15);-webkit-transition:border-bottom .2 ease;transition:border-bottom .2 ease;background:rgba(0,0,0,0)}.Gk33M>input.I3F_s{border-bottom:1px solid #fd5154}.Gk33M>input+label{position:absolute;-webkit-transform:translateY(28px);-ms-transform:translateY(28px);transform:translateY(28px);font-size:14px;line-height:1.33;color:#7e7e7e;text-overflow:clip;cursor:text;pointer-events:none;top:0;display:block;width:100%;overflow-x:hidden;white-space:nowrap;-webkit-transition:.15s ease-out;transition:.15s ease-out}._1CZC2{width:16px;height:16px;margin-right:8px}.Gk33M>input:focus{border-bottom:2px solid #00b9f5}.Gk33M>input:focus.I3F_s{border-bottom:1px solid #fd5154}.Gk33M>input:focus+label,.Gk33M>input:valid+label{-webkit-transform:translate(0);-ms-transform:translate(0);transform:translate(0);font-size:12px;line-height:1.33}.Gk33M>input:focus+label>img,.Gk33M>input:valid+label>img{display:none}._3cQw1{left:18px}.Gk33M>input:disabled+label,.Gk33M>input:focus+._3cQw1,.Gk33M>input:valid+._3cQw1{display:none}',
          }}
        />
        <style
          type="text/css"
          id="s1563-0"
          dangerouslySetInnerHTML={{
            __html:
              '._2b02j{-webkit-animation:_2b02j .3s cubic-bezier(.22,.61,.36,1);animation:_2b02j .3s cubic-bezier(.22,.61,.36,1)}.GuoJw{-webkit-animation:GuoJw .3s cubic-bezier(.22,.61,.36,1);animation:GuoJw .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _2b02j{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _2b02j{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes GuoJw{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes GuoJw{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1GauX{-ms-flex-direction:row;flex-direction:row}._1JMm5,._3RsKg,._1GauX{display:-ms-flexbox;display:flex}._1JMm5,._3RsKg{-ms-flex-direction:column;flex-direction:column}._2yM-T{border-bottom:1px solid #cacaca}._3Gnm2{border:1px solid #cacaca}._2jrJK{border-top:1px solid #cacaca}._4_Cvb{font-size:12px;margin:8px 0;color:#fd5154}._xCIX{position:relative;overflow:hidden}._xCIX:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._xCIX:hover:not(:active):after{-webkit-animation:_1aV-z .09s linear 0s;animation:_1aV-z .09s linear 0s}@-webkit-keyframes _1aV-z{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1aV-z{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._38XTs,body{height:100%;width:100%}._38XTs{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3RsKg{background:#fff;border:1px solid rgba(16,16,16,.22);border-radius:12px;padding:20px 24px;margin:24px 16px}._3RsKg ._1hEF8{margin-left:30px;font-size:14px;color:#101010;font-weight:500;line-height:20px}._3RsKg ._1hEF8 span{display:-ms-flexbox;display:flex;font-size:12px;color:#7e7e7e;font-weight:400;line-height:18px}._3RsKg ul{margin-top:20px}._3RsKg ul li{margin-bottom:20px}._3RsKg ._3yRvN{font-size:12px;margin:8px 0;color:#ff0025}@media only screen and (min-width:992px){._3RsKg{margin:0}._3RsKg ul{display:-ms-flexbox;display:flex;-ms-flex-wrap:wrap;flex-wrap:wrap}._3RsKg ul .QeGEt{padding:10px;width:33%;float:left;-webkit-box-sizing:border-box;box-sizing:border-box;position:relative;margin-bottom:0}._3RsKg ul .QeGEt._1Tw2i{-webkit-box-sizing:border-box;box-sizing:border-box;-ms-flex-item-align:end;align-self:flex-end}}',
          }}
        />
        <style
          type="text/css"
          id="s1129-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3ZwR8{-webkit-animation:_3ZwR8 .3s cubic-bezier(.22,.61,.36,1);animation:_3ZwR8 .3s cubic-bezier(.22,.61,.36,1)}._2qtX7{-webkit-animation:_2qtX7 .3s cubic-bezier(.22,.61,.36,1);animation:_2qtX7 .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _3ZwR8{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _3ZwR8{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2qtX7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2qtX7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1cbi8{-ms-flex-direction:row;flex-direction:row}._2S4Wy,._1cbi8{display:-ms-flexbox;display:flex}._2S4Wy{-ms-flex-direction:column;flex-direction:column}.MK5pT{border-bottom:1px solid #cacaca}._1sIoE{border:1px solid #cacaca}.mInku{border-top:1px solid #cacaca}._1gigZ{font-size:12px;margin:8px 0;color:#fd5154}._163_R{position:relative;overflow:hidden}._163_R:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._163_R:hover:not(:active):after{-webkit-animation:_3CRtK .09s linear 0s;animation:_3CRtK .09s linear 0s}@-webkit-keyframes _3CRtK{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3CRtK{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._25umU,body{height:100%;width:100%}._25umU{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3TnU- label{cursor:pointer;display:block;padding-left:30px;position:relative;text-align:left;font-size:14px;color:rgba(16,16,16,.54);font-weight:400}._3TnU- label:hover .ar-xN{color:#000000}._3TnU- input{left:0;opacity:0;position:absolute;visibility:hidden;width:auto}._3TnU- .ar-xN{border-radius:2px;color:#81b3f2;-webkit-transition:border-color .28s ease;transition:border-color .28s ease;z-index:0;border:1px solid #7e7e7e;width:14px;height:14px;position:absolute;top:3px;left:0}._3TnU- .ar-xN:before{-webkit-transform-origin:left top;-ms-transform-origin:left top;transform-origin:left top;-webkit-transform:rotate(-135deg);-ms-transform:rotate(-135deg);transform:rotate(-135deg);top:11px;left:5px}._3TnU- .ar-xN:after,._3TnU- .ar-xN:before{background:#000000;display:block;border-radius:2px;content:"";-webkit-transition:opacity .28s ease,height 0s linear .28s;transition:opacity .28s ease,height 0s linear .28s;opacity:0;position:absolute;width:2px;height:0}._3TnU- .ar-xN:after{-webkit-transform-origin:left top;-ms-transform-origin:left top;transform-origin:left top;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg);top:8px;left:1px}._3TnU- ._2C3_S{color:#fff;background:#000000;border:1px solid #000000}._3TnU- ._2C3_S:after{height:5px}._3TnU- ._2C3_S:after,._3TnU- ._2C3_S:before{opacity:1;-webkit-transition:height .28s ease;transition:height .28s ease;background:#fff}._3TnU- ._2C3_S:before{height:11px;-webkit-transition-delay:.28s;transition-delay:.28s}',
          }}
        />
        <style
          type="text/css"
          id="s1601-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1SFq0{-webkit-animation:_1SFq0 .3s cubic-bezier(.22,.61,.36,1);animation:_1SFq0 .3s cubic-bezier(.22,.61,.36,1)}._9F0R{-webkit-animation:_9F0R .3s cubic-bezier(.22,.61,.36,1);animation:_9F0R .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1SFq0{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1SFq0{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _9F0R{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _9F0R{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._3jApw{-ms-flex-direction:row;flex-direction:row}.t2QGc,._3jApw{display:-ms-flexbox;display:flex}.t2QGc{-ms-flex-direction:column;flex-direction:column}._29b50{border-bottom:1px solid #cacaca}._1VMtm{border:1px solid #cacaca}._3DxBl{border-top:1px solid #cacaca}._3KUCh{font-size:12px;margin:8px 0;color:#fd5154}._3BGcF{position:relative;overflow:hidden}._3BGcF:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3BGcF:hover:not(:active):after{-webkit-animation:_3psuZ .09s linear 0s;animation:_3psuZ .09s linear 0s}@-webkit-keyframes _3psuZ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3psuZ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._3ooA7,body{height:100%;width:100%}._3ooA7{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._1Ed7Z{background:#000000;color:#fff;font-size:16px;border-radius:8px;border:0}._1Ed7Z,._2Ke-6{height:52px;width:298px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer}._2Ke-6{background:#fff;color:#000000;font-size:12px;border-radius:8px;border:1px solid #000000}',
          }}
        />
        <style
          type="text/css"
          id="s1582-0"
          dangerouslySetInnerHTML={{
            __html:
              '.E780_{-webkit-animation:E780_ .3s cubic-bezier(.22,.61,.36,1);animation:E780_ .3s cubic-bezier(.22,.61,.36,1)}._2RLWw{-webkit-animation:_2RLWw .3s cubic-bezier(.22,.61,.36,1);animation:_2RLWw .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes E780_{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes E780_{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2RLWw{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2RLWw{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1nyGs{-ms-flex-direction:row;flex-direction:row}._2NKIP,._1nyGs{display:-ms-flexbox;display:flex}._2NKIP{-ms-flex-direction:column;flex-direction:column}._0sHt{border-bottom:1px solid #cacaca}._3MFIZ{border:1px solid #cacaca}._2ksnC{border-top:1px solid #cacaca}._1090M{font-size:12px;margin:8px 0;color:#fd5154}._2lezt{position:relative;overflow:hidden}._2lezt:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2lezt:hover:not(:active):after{-webkit-animation:_3qC-1 .09s linear 0s;animation:_3qC-1 .09s linear 0s}@-webkit-keyframes _3qC-1{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3qC-1{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._1Ox6A,body{height:100%;width:100%}._1Ox6A{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2Iczg ._3c_pK{padding:16px 16px 0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2Iczg ._3c_pK img{width:20px;height:20px}._2Iczg ._3c_pK a{font-size:14px;font-weight:500;line-height:20px}._2Iczg nav{background:#e0f5fd;margin:24px 16px 0;border-radius:4px;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-direction:row;flex-direction:row}._2Iczg nav,._2Iczg nav a{-ms-flex-align:center;align-items:center}._2Iczg nav a{display:block;width:33%;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#101010;font-weight:600;line-height:16px}._2Iczg nav a svg{padding-right:5px;width:auto;height:16px}._2Iczg nav ._1MDsl,._2Iczg nav a:hover{background:#fff;-webkit-box-shadow:0 1px 4px -2px rgba(16,16,16,.13);box-shadow:0 1px 4px -2px rgba(16,16,16,.13);border-radius:4px;margin:2px;padding:6px 0}._2Iczg nav ._1MDsl svg path{fill:#101010;fill-opacity:1}._2Iczg ._2gna8{padding-top:28px}._2Iczg ._2gna8 h1{padding:0 16px 16px;font-size:24px;color:#101010;font-weight:700;line-height:24px}._2Iczg ._2gna8 .Bxtpi{margin:16px 0 0;border-bottom:1px solid rgba(16,16,16,.07);padding:0 16px;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2Iczg ._2gna8 .Bxtpi,._2Iczg ._2gna8 .Bxtpi ._1UkrT{display:-ms-flexbox;display:flex}._2Iczg ._2gna8 .Bxtpi ._1UkrT img{margin-right:8px;width:24px;height:24px}._2Iczg ._2gna8 .Bxtpi ._1UkrT ._3hh9P ._2xqc3{display:-ms-flexbox;display:flex;margin-bottom:7px;font-size:18px;color:#101010;font-weight:600;line-height:20px}._2Iczg ._2gna8 .Bxtpi ._1UkrT ._3hh9P ._2xqc3 img{padding-left:7px;width:13px}._2Iczg ._2gna8 .Bxtpi ._1UkrT ._3hh9P ._3zH3f{display:-ms-flexbox;display:flex;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._2Iczg ._2gna8 .Bxtpi ._1UkrT ._3hh9P ._3zH3f img{padding:0 2px 0 10px;width:9px;height:auto}._2Iczg ._2gna8 .Bxtpi ._1MDsl{border-bottom:2px solid #000000;padding-bottom:15px}._2Iczg ._370K8{background:#f5f9fe;padding:11px 16px 0}._2Iczg ._370K8 .rskba{overflow-x:scroll;overflow-y:hidden;white-space:nowrap;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-direction:row;flex-direction:row}._2Iczg ._370K8 .rskba ._1veAN{background:#fff;border:1px solid rgba(16,16,16,.07);border-radius:12px;margin-right:15px;padding:12px;font-size:12px;color:#101010;font-weight:600;line-height:16px}._2Iczg ._370K8 .rskba ._1veAN span{color:#7e7e7e}._2Iczg ._370K8 .rskba ._1veAN a,._2Iczg ._370K8 .rskba ._1veAN span{display:block;padding-top:5px;font-size:12px;font-weight:400;line-height:16px}._2Iczg ._370K8 .rskba::-webkit-scrollbar{width:0;display:none;background:rgba(0,0,0,0)}._2Iczg ._370K8 ._2ESIw{background:#fff;border-radius:20px 20px 0 0;margin-top:12px;padding:30px 17px 0;-ms-flex-pack:distribute;justify-content:space-around;-ms-flex-direction:row;flex-direction:row}._2Iczg ._370K8 ._2ESIw,._2Iczg ._370K8 ._2ESIw ul li{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2Iczg ._370K8 ._2ESIw ul li{margin-bottom:18px;height:35px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px;-ms-flex-pack:center;justify-content:center}._2Iczg ._370K8 ._2ESIw ul li:first-child{height:21px}._2Iczg ._370K8 ._2ESIw ul li svg{width:30px;height:30px}._2Iczg ._370K8 ._2ESIw ul li:last-child{margin-bottom:0}._2Iczg ._1nN9v{background:#fff;padding:10px 0;border-top:1px solid rgba(16,16,16,.07);border-bottom:1px solid rgba(16,16,16,.07)}._2Iczg ._1nN9v ul{-ms-flex-pack:distribute;justify-content:space-around}._2Iczg ._1nN9v ul,._2Iczg ._1nN9v ul li{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2Iczg ._1nN9v ul li{font-size:10px;color:#7e7e7e;font-weight:400;line-height:16px}._2Iczg ._1nN9v ul li svg{margin-right:5px;width:22px;height:22px}._2I5pQ{position:relative;background-color:#fff}._2I5pQ ._3c_pK{padding:30px 16px 20px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;position:-webkit-sticky;position:sticky;top:0;background:#fff}._2I5pQ ._3c_pK img{width:20px;height:20px}._2I5pQ ._3c_pK a{font-size:14px;font-weight:500;line-height:20px}._2I5pQ ._3mkx_{visibility:hidden}._2I5pQ nav{background:#e7f1f8;border-radius:4px;min-width:75%;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-direction:row;flex-direction:row}._2I5pQ nav,._2I5pQ nav a{-ms-flex-align:center;align-items:center}._2I5pQ nav a{display:block;width:33%;display:-ms-flexbox;display:flex;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#101010;font-weight:600;line-height:16px}._2I5pQ nav ._1MDsl,._2I5pQ nav a:hover{background:#fff;-webkit-box-shadow:0 1px 4px -2px rgba(16,16,16,.13);box-shadow:0 1px 4px -2px rgba(16,16,16,.13);border-radius:4px;margin:2px;padding:8px 0}._2I5pQ nav ._1MDsl svg path{fill:#101010;fill-opacity:1}._2I5pQ ._3DZis{padding-top:28px}._2I5pQ ._3DZis h1{padding:0 16px 16px;font-size:24px;color:#101010;font-weight:700;line-height:24px}._2I5pQ ._3DZis .Bxtpi{border-bottom:1px solid rgba(16,16,16,.07);padding:0 16px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2I5pQ ._3DZis .Bxtpi ._1UkrT{display:-ms-flexbox;display:flex;padding-bottom:15px;font-size:14px;color:#101010;font-weight:600;line-height:20px}._2I5pQ ._3DZis .Bxtpi ._1UkrT img{margin-right:8px;width:24px;height:24px}._2I5pQ ._3DZis .Bxtpi ._1MDsl{border-bottom:2px solid #000000;padding-bottom:15px}._2I5pQ ._3DZis ._2yFiO{padding:25px 0 16px 16px}._2I5pQ ._3DZis ._2yFiO ._28aTX{margin-bottom:20px;display:-ms-flexbox;display:flex}._2I5pQ ._3DZis ._2yFiO ._28aTX ._2UPp9{background:#fff;border:1px solid rgba(16,16,16,.07);border-radius:12px;margin-right:12px;width:72px;height:72px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}._2I5pQ ._3DZis ._2yFiO ._28aTX ._2UPp9 img{width:55%}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6{width:80%;display:-ms-flexbox;display:flex;padding:17px 0 30px;border-bottom:1px solid rgba(16,16,16,.07)}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 .VRk2-{font-size:14px;color:#101010;font-weight:500;line-height:20px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 .VRk2- span{padding-top:8px;display:block;font-size:12px;color:#7e7e7e;font-weight:600;line-height:16px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu{width:100px;margin:0 16px 0 auto}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu .M_4gB{background:#000000;border-radius:50px;padding:10px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#fff;font-weight:600;line-height:16px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu .M_4gB img{margin-right:4px;width:20px;height:20px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu ._29YQX{background:#fff;border:1px solid #000000;border-radius:50px;padding:10px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#000000;font-weight:600;line-height:16px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu ._29YQX img{margin-right:4px;width:20px;height:20px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu ._2kNTl{background:#fff;border:1px solid #000000;border-radius:50px;padding:5px 10px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu ._2kNTl span{padding:3px 5px;margin:0 2px;font-size:12px;color:#000000;font-weight:600;line-height:16px}._2I5pQ ._3DZis ._2yFiO ._28aTX ._1Dbj6 ._1KHqu ._2kNTl span img{width:20px;height:20px}._2I5pQ ._1YVGq{font-size:14px;color:#101010;font-weight:400;line-height:20px;padding:16px 16px 24px}._2I5pQ ._1YVGq button{margin-top:32px;background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._2I5pQ ._1YVGq button,.rskba{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}.rskba{overflow-x:scroll;overflow-y:hidden;white-space:nowrap;-ms-flex-direction:row;flex-direction:row}.rskba ._1veAN{background:#fff;border:1px solid rgba(16,16,16,.07);border-radius:12px;margin-right:15px;padding:12px;font-size:12px;color:#101010;font-weight:600;line-height:16px}.rskba ._1veAN span{color:#7e7e7e}.rskba ._1veAN a,.rskba ._1veAN span{display:block;padding-top:5px;font-size:12px;font-weight:400;line-height:16px}.rskba::-webkit-scrollbar{width:0;display:none;background:rgba(0,0,0,0)}._293HI{display:-ms-flexbox;display:flex;-ms-flex-direction:row;flex-direction:row;-ms-flex-pack:center;-ms-flex-align:center;padding:14px 16px;position:-webkit-sticky;position:sticky;width:184px;height:52px;left:175px;bottom:0;background:#000000;border-radius:8px}._293HI,._1n_tm{justify-content:center;align-items:center}._1n_tm{display:block;width:33%;-ms-flex:1 1;flex:1 1;display:-ms-flexbox;display:flex;-ms-flex-align:center;-ms-flex-pack:center;font-size:12px;color:#101010;font-weight:600;line-height:16px}._13NQj{padding-right:5px;width:auto;height:16px}._1tSzS{border:1px solid rgba(16,16,16,.13);border-radius:12px;padding:20px;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%}._1tSzS ._7efns{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._1tSzS ._7efns h3{font-size:14px;color:#101010;font-weight:600;line-height:18px}._1tSzS ._7efns span{font-size:14px;color:#666;font-weight:500;line-height:18px}._1tSzS ._7efns img{margin-right:12px}._3K2ik{font-size:18px;color:#101010;font-weight:500;line-height:16px}@media only screen and (min-width:992px){._1tSzS{padding:0;min-height:80px;overflow:hidden}._1tSzS>div label>div{padding:10px 20px 20px 10px}._1tSzS>div ._7efns{padding:4px 0 0 20px}._1tSzS>div ._7efns span{padding-left:0}._1tSzS ._3c_pK{padding:30px 20px 20px}._1tSzS ._3c_pK nav{min-width:100%}._3w7Vy{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;min-height:500px;background:hsla(0,0%,88.2%,.5)}}',
          }}
        />
        <style
          type="text/css"
          id="s1308-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3fjMc{-webkit-animation:_3fjMc .3s cubic-bezier(.22,.61,.36,1);animation:_3fjMc .3s cubic-bezier(.22,.61,.36,1)}._1en5r{-webkit-animation:_1en5r .3s cubic-bezier(.22,.61,.36,1);animation:_1en5r .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _3fjMc{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _3fjMc{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1en5r{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1en5r{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._3_92P{-ms-flex-direction:row;flex-direction:row}.YazHS,._3_92P{display:-ms-flexbox;display:flex}.YazHS{-ms-flex-direction:column;flex-direction:column}._1_HD0{border-bottom:1px solid #cacaca}._22Ev7{border:1px solid #cacaca}._1mz5q{border-top:1px solid #cacaca}._36MmI{font-size:12px;margin:8px 0;color:#fd5154}._3gwrM{position:relative;overflow:hidden}._3gwrM:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3gwrM:hover:not(:active):after{-webkit-animation:_2UbrI .09s linear 0s;animation:_2UbrI .09s linear 0s}@-webkit-keyframes _2UbrI{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2UbrI{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2Kerp,body{height:100%;width:100%}._2Kerp{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2fopa ._1bLSG{display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;font-size:16px;color:#101010;font-weight:600;line-height:24px;padding:16px 0 2px;text-transform:capitalize}._2fopa ._1bLSG>img{vertical-align:middle;padding-right:20px}._2fopa ._1bLSG span{font-size:13px;color:#7e7e7e;font-weight:400;line-height:20px;padding-left:5px}._2fopa ._1806b{margin:8px 0 30px;padding-top:10px}._2fopa ._1J_j8{display:block;position:relative;overflow:hidden;cursor:pointer;min-height:20px}._2fopa ._2Gdtu{border-top:2px solid #101010;border-right:2px solid #101010;margin-left:auto;display:block;position:relative;top:-2px;right:5px;width:8px;height:8px}._2fopa ._3oFKf{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2fopa ._1ncWU{margin:auto 0}._2fopa ._2LFl3{display:none;pointer-events:none}._2fopa ._2LFl3:checked+label._2GyBM{display:block;min-height:325px;-webkit-transition:height .8s;transition:height .8s;-webkit-transition-timing-function:cubic-bezier(.68,-.55,.265,1.55);transition-timing-function:cubic-bezier(.68,-.55,.265,1.55)}._2fopa ._2LFl3:checked+label._2GyBM ._1bLSG ._2Gdtu{-webkit-transition:-webkit-transform .8s;transition:-webkit-transform .8s;transition:transform .8s;transition:transform .8s,-webkit-transform .8s;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}._2fopa ._2LFl3:not(:checked)+label._1iNJK{display:block;-webkit-transition:height .8s;transition:height .8s;height:60px;-webkit-transition-timing-function:cubic-bezier(.68,-.55,.265,1.55);transition-timing-function:cubic-bezier(.68,-.55,.265,1.55)}._2fopa ._2LFl3:not(:checked)+label._1iNJK ._1bLSG ._2Gdtu{-webkit-transition:-webkit-transform .8s;transition:-webkit-transform .8s;transition:transform .8s;transition:transform .8s,-webkit-transform .8s;-webkit-transform:rotate(135deg);-ms-transform:rotate(135deg);transform:rotate(135deg)}._2hW9g{display:-ms-flexbox;display:flex}._2hW9g .LGLpg{font-size:14px;color:#101010;font-weight:500;line-height:24px;border:1px solid rgba(16,16,16,.22);border-radius:6px;padding:10px;margin-right:8px;text-align:center}._2hW9g .LGLpg span{display:block;font-size:12px;color:#7e7e7e;font-weight:500;line-height:16px}._2hW9g .LGLpg.PAbkN{background-color:#000000;font-size:14px;color:#fff;font-weight:500;line-height:24px}._2hW9g .LGLpg.PAbkN span{font-size:12px;color:#fff;font-weight:500;line-height:16px}@media screen and (min-width:992px){._2fopa ._1806b{margin:8px 0}._2fopa label._2GyBM{overflow:visible}._3jztX ._1806b{padding:0}._3jztX ._2Gdtu{right:20px}}',
          }}
        />
        <style
          type="text/css"
          id="s1569-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1FWzi{-webkit-animation:_1FWzi .3s cubic-bezier(.22,.61,.36,1);animation:_1FWzi .3s cubic-bezier(.22,.61,.36,1)}._2kn4N{-webkit-animation:_2kn4N .3s cubic-bezier(.22,.61,.36,1);animation:_2kn4N .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1FWzi{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1FWzi{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2kn4N{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2kn4N{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1CIwa{-ms-flex-direction:row;flex-direction:row}._3F9hA,._1CIwa{display:-ms-flexbox;display:flex}._3F9hA{-ms-flex-direction:column;flex-direction:column}._1owgD{border-bottom:1px solid #cacaca}._2vqCo{border:1px solid #cacaca}._24UyW{border-top:1px solid #cacaca}.iHpuq{font-size:12px;margin:8px 0;color:#fd5154}.RlmGD{position:relative;overflow:hidden}.RlmGD:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.RlmGD:hover:not(:active):after{-webkit-animation:_3LwDG .09s linear 0s;animation:_3LwDG .09s linear 0s}@-webkit-keyframes _3LwDG{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3LwDG{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._3ab-p,body{height:100%;width:100%}._3ab-p{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3Doik{margin:24px 16px}._3Doik h3{font-size:18px;color:#101010;font-weight:700;line-height:24px;margin-bottom:16px}._3Doik ._3tEuX{margin:16px 0 14px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;font-size:12px;color:#101010;line-height:16px}._3Doik ._3tEuX img{width:auto;height:17px;margin-right:5px}._3Doik ._3hOTa{margin-left:17px}._3Doik ._3hOTa ._3bQhK{font-size:12px;color:#101010;font-weight:400;line-height:16px;padding-bottom:16px;margin:0}._3Doik ._3hOTa ._3bQhK span{font-weight:700}._3Doik ._3hOTa ._3bQhK:before{content:"•";color:#c4c4c4;display:inline-block;width:1em;margin-left:-1em}@media screen and (min-width:992px){._3Doik{width:100%;border:1px solid rgba(16,16,16,.13);border-radius:12px;padding:15px 15px 4px;margin:16px 0 100px;-webkit-box-sizing:border-box;box-sizing:border-box}}',
          }}
        />
        <style
          type="text/css"
          id="s1248-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3cA8z{-webkit-animation:_3cA8z .3s cubic-bezier(.22,.61,.36,1);animation:_3cA8z .3s cubic-bezier(.22,.61,.36,1)}._2_nU_{-webkit-animation:_2_nU_ .3s cubic-bezier(.22,.61,.36,1);animation:_2_nU_ .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _3cA8z{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _3cA8z{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2_nU_{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2_nU_{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2BFcE{-ms-flex-direction:row;flex-direction:row}._3fhlC,._2BFcE{display:-ms-flexbox;display:flex}._3fhlC{-ms-flex-direction:column;flex-direction:column}._3n-tu{border-bottom:1px solid #cacaca}._1ZZns{border:1px solid #cacaca}._2YHqx{border-top:1px solid #cacaca}._3Ww7y{font-size:12px;margin:8px 0;color:#fd5154}._2ulf4 ._3u-gw button,._3wYc6{position:relative;overflow:hidden}._2ulf4 ._3u-gw button:after,._3wYc6:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2ulf4 ._3u-gw button:hover:not(:active):after,._3wYc6:hover:not(:active):after{-webkit-animation:_1qlep .09s linear 0s;animation:_1qlep .09s linear 0s}@-webkit-keyframes _1qlep{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1qlep{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.sCrB1,body{height:100%;width:100%}.sCrB1{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2ulf4{padding:6px 16px 16px}._2ulf4 h3{font-size:24px;color:#101010;font-weight:700;line-height:32px;margin-bottom:27px}._2ulf4 ._3fyFY{margin-bottom:15px}._2ulf4 ._3fyFY>span{font-size:16px;color:#101010;font-weight:400;line-height:32px;margin-right:10px;text-transform:capitalize}._2ulf4 ._13YRF{border-bottom:1px solid rgba(16,16,16,.07);padding-bottom:9px}._2ulf4 ._13YRF ._2BFcE{padding-bottom:6px;font-size:14px;color:#7e7e7e;font-weight:400;line-height:20px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2ulf4 ._13YRF ._2BFcE>span{margin-left:10px}._2ulf4 ._13YRF ._2BFcE .b33UG{text-decoration:line-through;padding:0 5px}._2ulf4 ._13YRF ._2BFcE ._2ejYZ{display:-ms-flexbox;display:flex}._2ulf4 ._13YRF ._2BFcE ._2ejYZ span{position:relative;display:-ms-flexbox;display:flex}._2ulf4 ._13YRF ._2BFcE ._2ejYZ span ._38LQO{margin-left:5px;cursor:pointer}._2ulf4 ._13YRF ._2BFcE ._3hvdA{margin-left:0;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}._2ulf4 ._13YRF ._2BFcE ._3hvdA img{margin-left:5px}._2ulf4 ._13YRF ._3dmSN{font-size:18px;margin:5px 0}._2ulf4 ._13YRF ._3dmSN,._2ulf4 ._13YRF ._2LdCE{padding-bottom:6px;color:#7e7e7e;font-weight:400;line-height:20px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2ulf4 ._13YRF ._2LdCE{font-size:13px}._2ulf4 ._13YRF ._2LdCE span{font-size:14px;color:#21c179;font-weight:400;line-height:20px}._2ulf4 ._3cNYf{padding-top:24px}._2ulf4 ._3cNYf .toUhe{padding-bottom:4px;font-size:18px;color:#101010;font-weight:700;line-height:24px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2ulf4 ._3cNYf .toUhe>span{margin-left:10px}._2ulf4 ._3cNYf .QP6eM{font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._2ulf4 ._3cNYf ._36yG_{margin-top:0;font-size:12px;color:#101010;font-weight:400;line-height:16px}._2ulf4 ._3u-gw{margin-top:25px}._2ulf4 ._3u-gw button{background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._2ulf4 ._3u-gw button:disabled,._2ulf4 ._3u-gw button button[disabled]{background:rgba(16,16,16,.07);color:rgba(248,147,147,.22)}._2qq6w,._31ILI{font-size:16px;color:#000;font-weight:500}@media(min-width:992px){._2ulf4{margin:0;width:inherit;background:#fff;border-radius:12px}._2ulf4 .xy-8S ._13YRF ._2BFcE>span{font-size:14px;color:#7e7e7e;font-weight:400;line-height:20px}._2ulf4 .xy-8S ._3cNYf{padding-top:8px}._2ulf4 .xy-8S ._3cNYf .toUhe>span{font-size:18px;color:#101010;font-weight:700;line-height:24px}._2ulf4 ._2yndT{overflow-y:scroll;max-height:152px;padding:0 10px 0 0}._2ulf4 ._2yndT::-webkit-scrollbar{width:4px}._2ulf4 ._13YRF{padding-bottom:8px}._2ulf4 ._13YRF ._2BFcE{font-size:12px;color:rgba(16,16,16,.54);font-weight:400;line-height:16px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2ulf4 ._13YRF ._2BFcE>div{position:relative;display:-ms-flexbox;display:flex}._2ulf4 ._13YRF ._2BFcE>div ._6q6ZP{cursor:pointer;margin-left:5px}._2ulf4 ._13YRF ._2BFcE ._2qq6w,._2ulf4 ._13YRF ._2BFcE ._31ILI{font-size:12px;color:rgba(16,16,16,.54);font-weight:400;line-height:16px}._2ulf4 ._3cNYf{padding-top:12px}._2ulf4 ._3cNYf .toUhe{font-size:16px;color:#7e7e7e;font-weight:700;line-height:24px;color:#101010}._2yndT h2{font-size:14px;color:#101010;font-weight:600;line-height:16px}._2yndT ._1UOeJ{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between}._2yndT ._1UOeJ ._1Z2Ep>p{color:rgba(16,16,16,.54);font-weight:400;line-height:20px}._2yndT ._1UOeJ ._1PLns>p{font-size:14px;color:#101010;font-weight:500;line-height:20px}}',
          }}
        />
        <style
          type="text/css"
          id="s1544-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1nKPI{-webkit-animation:_1nKPI .3s cubic-bezier(.22,.61,.36,1);animation:_1nKPI .3s cubic-bezier(.22,.61,.36,1)}._1zf5u{-webkit-animation:_1zf5u .3s cubic-bezier(.22,.61,.36,1);animation:_1zf5u .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1nKPI{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1nKPI{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1zf5u{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1zf5u{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._3qNvj{-ms-flex-direction:row;flex-direction:row}._2oq7H,._3qNvj{display:-ms-flexbox;display:flex}._2oq7H{-ms-flex-direction:column;flex-direction:column}._3o8aI{border-bottom:1px solid #cacaca}._3PGBa{border:1px solid #cacaca}.PAgqa{border-top:1px solid #cacaca}._20MZ_{font-size:12px;margin:8px 0;color:#fd5154}._2bz-Z{position:relative;overflow:hidden}._2bz-Z:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2bz-Z:hover:not(:active):after{-webkit-animation:dn6xQ .09s linear 0s;animation:dn6xQ .09s linear 0s}@-webkit-keyframes dn6xQ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes dn6xQ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.AaJLo,body{height:100%;width:100%}.AaJLo{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.R9gXf{margin:0 16px}.R9gXf ._3l7oL{background:#fff;border:1px solid #dde5ed;border-radius:12px;padding:20px 0 20px 16px;margin:24px 0 12px}.R9gXf ._3l7oL h3{font-size:18px;color:#101010;font-weight:700;line-height:24px;margin-bottom:20px}.R9gXf ._3l7oL .AunpR{display:-ms-flexbox;display:flex}.R9gXf ._3l7oL .AunpR .qLZGy{width:100%}.R9gXf ._3l7oL .AunpR .qLZGy ._3TIl1 ._1FzkN{border:1px dashed #7e7e7e;padding:4px 8px;margin-right:10px;font-size:14px;color:#101010;font-weight:600;line-height:20px}.R9gXf ._3l7oL .AunpR .qLZGy ._3TIl1 ._2aFyg{font-size:12px;color:#21c179;font-weight:600;line-height:16px}.R9gXf ._3l7oL .AunpR .qLZGy p{margin-bottom:24px;padding:0 24px 20px 0;border-bottom:1px solid #eee;font-size:12px;color:#101010;font-weight:400;line-height:16px}.R9gXf ._3l7oL ._2sxXy{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center}.R9gXf ._3l7oL ._2sxXy img{width:32px;height:32px;margin-right:10px}.R9gXf ._3l7oL ._2sxXy ._1H_y6{font-size:14px;color:#101010;font-weight:500;line-height:20px}.R9gXf ._3l7oL ._2sxXy ._1H_y6 span{display:-ms-flexbox;display:flex;padding-top:4px;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}.R9gXf ._3l7oL ._2sxXy ._2_pDn{font-size:32px;margin-right:10px;height:32px;width:32px}.R9gXf ._3l7oL ._2sxXy ._2d7Ui{margin:0 24px 0 auto;padding:5px;border:solid #101010;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}._2Sl34{position:fixed;top:0;left:0;width:100%;height:100%;z-index:2;background-color:#fff}._2Sl34 ._1quRa{margin-top:20px;padding:16px}._2Sl34 ._1quRa .O40Tx{display:-ms-flexbox;display:flex;margin-bottom:15px}._2Sl34 ._1quRa .O40Tx h3{font-size:18px;color:#101010;font-weight:700;line-height:24px;margin-left:16px}._2Sl34 ._1quRa ._2fCa1{position:relative}._2Sl34 ._1quRa ._2fCa1 ._3lIcJ{font-size:12px;color:#21c179;line-height:16px;margin-bottom:24px}._2Sl34 ._1quRa ._2fCa1 ._1-l4J{border-color:#fd5154}._2Sl34 ._1quRa ._2fCa1 .IV8-N{width:calc(100% + 32px);display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column;font-size:14px;color:#101010;font-weight:600;line-height:20px;position:relative;left:-16px;padding:0 16px;-webkit-box-sizing:border-box;box-sizing:border-box;margin:34px 0 25px}._2Sl34 ._1quRa ._2fCa1 .IV8-N :not(:first-child){font-size:12px;color:#666;line-height:16px;margin-top:5px}._2Sl34 ._1quRa ._2Byaj{position:fixed;bottom:0;left:0;width:100%;padding:12px 16px;-webkit-box-sizing:border-box;box-sizing:border-box;background-color:#fff}._2Sl34 ._1quRa ._2Byaj button{background:#000000;color:#fff;font-size:16px;height:52px;width:100%;border-radius:8px;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;border:0;cursor:pointer}._1Jm1S{padding:0 16px;margin-bottom:20px}._1Jm1S ._3JUD8{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:16px}._1Jm1S ._3JUD8 h3{font-size:18px;color:#101010;font-weight:700;line-height:24px}._1Jm1S ._3JUD8 span{font-size:14px;color:#000000;font-weight:500;line-height:16px}._1Jm1S ._218j6{border:1px solid rgba(16,16,16,.13);border-radius:11px;overflow:hidden}._1Jm1S ._218j6 ._3EDTI{background-color:#f5f9fe;position:relative;border-bottom:1px solid rgba(16,16,16,.13);border-radius:11px 11px 0 0;padding:0 8px}._1Jm1S ._218j6 ._2sRce{padding-left:16px}._1Jm1S ._218j6 ._1igpg{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;font-size:12px;color:#000000;font-weight:600;line-height:16px;cursor:pointer;background:#e7f1f8;padding:8px 0 7px}._1Jm1S ._218j6 ._1igpg span{padding-right:5px}._1Jm1S ._218j6 ._1igpg i{padding:3.5px;border:solid #000000;border-width:0 1.25px 1.25px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}@media(min-width:992px){._1Jm1S{padding:0;min-width:278px}._1Jm1S ._3JUD8 h3{font-size:16px;color:#101010;font-weight:600;line-height:20px}._1Jm1S ._3JUD8 span{font-size:14px;color:#000000;font-weight:600;line-height:16px;cursor:pointer}._1Jm1S ._218j6 ._2sRce{padding-left:8px}}',
          }}
        />
        <style
          type="text/css"
          id="s1559-0"
          dangerouslySetInnerHTML={{
            __html:
              '._4SpGa{-webkit-animation:_4SpGa .3s cubic-bezier(.22,.61,.36,1);animation:_4SpGa .3s cubic-bezier(.22,.61,.36,1)}._2hAps{-webkit-animation:_2hAps .3s cubic-bezier(.22,.61,.36,1);animation:_2hAps .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _4SpGa{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _4SpGa{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _2hAps{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _2hAps{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1B9j5{-ms-flex-direction:row;flex-direction:row}._2P9A_,._1B9j5{display:-ms-flexbox;display:flex}._2P9A_{-ms-flex-direction:column;flex-direction:column}.LR0wO{border-bottom:1px solid #cacaca}._3q5tm{border:1px solid #cacaca}._2ZwuJ{border-top:1px solid #cacaca}._2qwjr{font-size:12px;margin:8px 0;color:#fd5154}._3t6a7{position:relative;overflow:hidden}._3t6a7:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3t6a7:hover:not(:active):after{-webkit-animation:ByNtV .09s linear 0s;animation:ByNtV .09s linear 0s}@-webkit-keyframes ByNtV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes ByNtV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._15Gk_,body{height:100%;width:100%}._15Gk_{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3JtXg{padding:8px 0;position:relative}._3JtXg ._1Hob6{color:#fd5154;font-size:12px}._3JtXg ._1-07V{color:#21c179;font-size:12px;padding-top:4px}._3JtXg ._2cKfv{display:block;font-size:12px;color:#101010;font-weight:400;line-height:16px;padding-top:4px}._3JtXg ._2f74C{display:inline-block}._3JtXg .G4Uk_{width:100%;-webkit-box-sizing:border-box;box-sizing:border-box;padding:10px 62px 10px 10px;border:1.5px solid #cacaca;border-radius:8px;caret-color:#000000;font-size:16px;color:#101010;font-weight:500}._3JtXg .G4Uk_.flFK1{border-color:#fd5154;caret-color:#fd5154}._3JtXg .G4Uk_.hEikD{border-color:#21c179;caret-color:#21c179}._3JtXg input:focus{border-color:#000000}._3JtXg ::-webkit-input-placeholder{font-weight:600;opacity:1}._3JtXg ::-moz-placeholder{font-weight:600;opacity:1}._3JtXg :-ms-input-placeholder{font-weight:600;opacity:1}._3JtXg ::-ms-input-placeholder{font-weight:600;opacity:1}._3JtXg ::placeholder{font-weight:600;opacity:1}._3JtXg ._1i2d8{position:absolute;top:22px;right:16px;font-size:12px;color:#000000;font-weight:500;line-height:16px;cursor:pointer}._3JtXg ._1i2d8 img{position:relative;bottom:3px}._3JtXg ._2JG-6{-webkit-transform:scale(.3);-ms-transform:scale(.3);transform:scale(.3);right:-66px;top:0}._3JtXg .YCVhw{display:-ms-flexbox;display:flex}',
          }}
        />
        <style
          type="text/css"
          id="s1123-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1SCee input[type=radio]{border:0;clip:rect(0 0 0 0);height:1px;margin:-1px;overflow:hidden;padding:0;position:absolute;width:1px}._1SCee input[type=radio]:focus+label:before,._1SCee input[type=radio]:hover+label:before{border-color:#00b9f5;background-color:#fff}._1SCee input[type=radio]:active+label:before{-webkit-transition-duration:0s;transition-duration:0s}._1SCee input[type=radio]+label{position:relative;padding-left:2em;vertical-align:middle;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;font-size:16px}._1SCee input[type=radio]+label:before{-webkit-box-sizing:content-box;box-sizing:content-box;content:"";color:#fff;position:absolute;top:50%;left:0;width:14px;height:14px;margin-top:-9px;border-radius:2px;border:2px solid #adadad;text-align:center;-webkit-transition:all .4s ease;transition:all .4s ease}._1SCee input[type=radio]+label:after{-webkit-box-sizing:content-box;box-sizing:content-box;content:"";background-color:#00b9f5;position:absolute;top:50%;left:4px;width:10px;height:10px;margin-top:-5px;-webkit-transform:scale(0);-ms-transform:scale(0);transform:scale(0);-webkit-transform-origin:50%;-ms-transform-origin:50%;transform-origin:50%;-webkit-transition:-webkit-transform .2s ease-out;transition:-webkit-transform .2s ease-out;transition:transform .2s ease-out;transition:transform .2s ease-out,-webkit-transform .2s ease-out}._1SCee input[type=radio]:disabled+label:before{border-color:#ccc}._1SCee input[type=checkbox]:disabled:hover+label:before,._1SCee input[type=radio]:disabled:focus+label:before,._1SCee input[type=radio]:disabled:hover+label:before{background-color:inherit}._1SCee input[type=radio]:disabled:checked+label:before{background-color:#ccc}._1SCee input[type=radio]+label.z99kO:before,._1SCee input[type=radio]:checked+label:before{background-color:#fff;border:2px solid #00b9f5}._1SCee input[type=radio]+label.z99kO:after,._1SCee input[type=radio]:checked+label:after{-webkit-transform:scale(1);-ms-transform:scale(1);transform:scale(1)}._1SCee input[type=radio]+label:after,._1SCee input[type=radio]+label:before{border-radius:50%}',
          }}
        />
        <style
          type="text/css"
          id="s1618-0"
          dangerouslySetInnerHTML={{
            __html:
              '.kicwC{position:relative}.P5uSC,.pzw7i{padding:10px;background:#fff;position:absolute;width:94%;z-index:24;border:1px solid #dedede;-webkit-box-shadow:0 2px 4px 0 rgba(0,0,0,.1);box-shadow:0 2px 4px 0 rgba(0,0,0,.1);max-height:250px;overflow-y:auto}._3qD-Y,.i1L0G{font-size:10px;font-weight:600;color:#4a4a4a;padding-bottom:5px;padding-top:5px;border-bottom:1px solid #ebebeb}._2m-fT{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:93%;display:block;font-size:12px;color:#333;padding:8px 0;cursor:pointer}._2m-fT span{font-weight:700;color:#000}._2jH7v{background:#fff;position:absolute;right:0;bottom:10px}.AKYSC,._2jH7v{width:20px;height:20px}.AKYSC{font-size:10px;text-indent:-9999em;border-radius:50%;background:#00b9f5;background:-webkit-gradient(linear,left top,right top,color-stop(10%,#00b9f5),color-stop(42%,rgba(57,255,26,0)));background:linear-gradient(90deg,#00b9f5 10%,rgba(57,255,26,0) 42%);position:relative;-webkit-animation:_2jkBx 1.4s linear infinite;animation:_2jkBx 1.4s linear infinite;-webkit-transform:translateZ(0);transform:translateZ(0)}.AKYSC:before{width:50%;height:50%;background:#00b9f5;border-radius:100% 0 0 0}.AKYSC:after,.AKYSC:before{position:absolute;top:0;left:0;content:""}.AKYSC:after{background:#fff;width:75%;height:75%;border-radius:50%;margin:auto;bottom:0;right:0}@-webkit-keyframes _2jkBx{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes _2jkBx{0%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}',
          }}
        />
        <style
          type="text/css"
          id="s1616-0"
          dangerouslySetInnerHTML={{
            __html:
              '._3czmS{-ms-flex-direction:column;display:-ms-flexbox;display:flex;flex-direction:column;position:relative}._3czmS input:not(:focus):not(._3_CSA):not(.zsaFH){color:rgba(0,0,0,0)}._1ARpv,._3czmS input,._3czmS label{-webkit-font-smoothing:antialiased;text-shadow:none}._3czmS input{-moz-appearance:none;-webkit-appearance:none;-webkit-tap-highlight-color:transparent;border-radius:0;display:-moz-flex;display:-ms-flexbox;display:flex;font-weight:600;font-size:18px;line-height:30px;padding-right:20px}._209Bw{-moz-transform-origin:left top;-moz-transform:scale(1) translate3d(0,22px,0);-moz-transition:.2s ease all;-ms-flex-order:1;-webkit-order:1;-webkit-transform-origin:left top;-webkit-transform:scale(1) translate3d(0,22px,0);-webkit-transition:all .2s ease;color:#7e7e7e;font-size:14px;font-weight:400;order:1;padding-left:2px;pointer-events:none;text-transform:capitalize;-ms-transform-origin:left top;transform-origin:left top;transform:scale(1) translate3d(0,22px,0);transition:all .2s ease}._3czmS input._3_CSA+label,._3czmS input:focus+label,.zsaFH+label{-moz-transform:scale(.8) translate3d(0,5px,0);-webkit-transform:scale(.8) translate3d(0,5px,0);font-size:16px;line-height:1.33;color:#7e7e7e;opacity:1;transform:scale(.8) translate3d(0,5px,0)}._3czmS input:focus{border-bottom:#00b9f5!important}._3mfQq:active,._3mfQq:focus,._209Bw{outline:0}._3czmS input{border-bottom:1px solid rgba(0,0,0,.15)}._3mfQq{-ms-flex-order:2;-ms-flex:1 1 auto;-webkit-flex:1 1 auto;-webkit-order:2;border:0;color:#000;flex:1 1 auto;order:2}._3Wf90{-ms-flex-order:3;-webkit-order:3;display:block;order:3;top:0}._3Wf90:after,._3Wf90:before{-moz-transition:.2s ease all;-webkit-transition:all .2s ease;background:#00b9f5;bottom:0;content:"";height:2px;position:absolute;transition:all .2s ease;width:0}._3Wf90:before{left:50%}._3Wf90:after{right:50%}._3mfQq:focus~._3Wf90:after,._3mfQq:focus~._3Wf90:before,.zsaFH~._3Wf90:after,.zsaFH~._3Wf90:before{width:50%}._1ARpv,._3Wf90{position:relative;width:inherit}._1ARpv{display:none;font-size:13px;-ms-flex-order:4;order:4;margin-top:4px}._29Mw5{display:inline-block}.zsaFH~._3Wf90:after,.zsaFH~._3Wf90:before{background:#e74c3c}._1ARpv,._3czmS ._3mfQq.zsaFH{color:#e74c3c}._3Kwq3{position:absolute;right:0;top:30px;width:16px;height:16px;opacity:.3;cursor:pointer}._3Kwq3:hover{opacity:1}._3Kwq3:after,._3Kwq3:before{position:absolute;left:7px;content:" ";height:17px;width:1px;background-color:#333}._3Kwq3:before{-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}._3Kwq3:after{-webkit-transform:rotate(-45deg);-ms-transform:rotate(-45deg);transform:rotate(-45deg)}._3JuBy{height:24px;width:24px;position:absolute;top:22px;right:0}',
          }}
        />
        <style
          type="text/css"
          id="s1567-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1FSYp{-webkit-animation:_1FSYp .3s cubic-bezier(.22,.61,.36,1);animation:_1FSYp .3s cubic-bezier(.22,.61,.36,1)}._3yiL7{-webkit-animation:_3yiL7 .3s cubic-bezier(.22,.61,.36,1);animation:_3yiL7 .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1FSYp{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1FSYp{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3yiL7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3yiL7{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._2yPSz{-ms-flex-direction:row;flex-direction:row}._2EbQL,._2yPSz{display:-ms-flexbox;display:flex}._2EbQL{-ms-flex-direction:column;flex-direction:column}._16ghi{border-bottom:1px solid #cacaca}._2mS4V{border:1px solid #cacaca}._1IVOq{border-top:1px solid #cacaca}.ipvcR{font-size:12px;margin:8px 0;color:#fd5154}._3M3Dk{position:relative;overflow:hidden}._3M3Dk:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._3M3Dk:hover:not(:active):after{-webkit-animation:_2JUtJ .09s linear 0s;animation:_2JUtJ .09s linear 0s}@-webkit-keyframes _2JUtJ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2JUtJ{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.sMtSV,body{height:100%;width:100%}.sMtSV{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.Vpsox{display:block;position:relative;border-bottom:1px solid rgba(0,0,0,.15);margin-top:24px}.Vpsox span{border:none;font-size:16px;margin:0;padding:5px 0 3px;background:none;color:inherit}.NcdiH,.Vpsox span{display:block;text-align:left}.NcdiH{font-size:14px;line-height:1.33;-webkit-transition-duration:.2s;transition-duration:.2s;-webkit-transition-timing-function:cubic-bezier(.4,0,.2,1);transition-timing-function:cubic-bezier(.4,0,.2,1);visibility:visible;pointer-events:none;width:100%;overflow:hidden;white-space:nowrap;position:absolute;top:5px;right:0;bottom:0;left:0}.NcdiH._2T6HA,._2QfN9{font-size:12px}._2QfN9{position:relative;display:inline-block;-webkit-box-sizing:border-box;box-sizing:border-box;width:100%;max-width:100%;margin:0;padding-top:10px;line-height:30px;cursor:pointer}._2QfN9:focus{outline:none}._3IwJl span{font-weight:100;font-size:14px;color:#9b9b9b}._3IwJl+label{display:none}.zmJQ5{position:absolute;right:8px;top:5px;margin:0 0 0 10px;padding:4px;border:solid #909090;border-width:0 2px 2px 0;display:inline-block;-webkit-transition:all .3s ease;transition:all .3s ease;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}._2Wkda{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:absolute;-webkit-transition:.25s ease;transition:.25s ease;top:30px;left:0;width:90%;list-style:none;margin:0;padding:16px;background-color:#fff;-webkit-box-shadow:0 2px 6px 0 hsla(0,0%,54.1%,.25);box-shadow:0 2px 6px 0 hsla(0,0%,54.1%,.25);z-index:1000;max-height:200px;overflow-y:auto}.LP0cX{padding:8px;cursor:pointer;font-size:14px;line-height:1.21;color:#121927;display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:start;-ms-flex-pack:start;justify-content:flex-start}._2Wkda .baT2H{opacity:.3}._1aBZS{-ms-flex-order:3;-webkit-order:3;display:block;order:3;top:0}._1aBZS:after,._1aBZS:before{-moz-transition:.2s ease all;-webkit-transition:all .2s ease;background:#00b9f5;bottom:0;content:"";height:2px;position:absolute;transition:all .2s ease;width:0}._1aBZS:before{left:50%}._1aBZS:after{right:50%}._2QfN9:focus~._1aBZS:after,._2QfN9:focus~._1aBZS:before{width:50%}._2QfN9>span{border-bottom:0;top:16px;position:relative;font-size:16px;font-weight:600;line-height:1.12;color:#1b252e;padding-bottom:12px}@media screen and (min-width:992px){.Vpsox{margin-top:0}}',
          }}
        />
        <style
          type="text/css"
          id="s1554-0"
          dangerouslySetInnerHTML={{
            __html:
              '._33YDN{-webkit-animation:_33YDN .3s cubic-bezier(.22,.61,.36,1);animation:_33YDN .3s cubic-bezier(.22,.61,.36,1)}._3qIeg{-webkit-animation:_3qIeg .3s cubic-bezier(.22,.61,.36,1);animation:_3qIeg .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _33YDN{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _33YDN{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3qIeg{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3qIeg{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._3FQKA{-ms-flex-direction:row;flex-direction:row}._2Xo4m,._3FQKA{display:-ms-flexbox;display:flex}._2Xo4m{-ms-flex-direction:column;flex-direction:column}.OInew{border-bottom:1px solid #cacaca}._2Dkic{border:1px solid #cacaca}._1OlDS{border-top:1px solid #cacaca}.oPvtw{font-size:12px;margin:8px 0;color:#fd5154}._2ovAB{position:relative;overflow:hidden}._2ovAB:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._2ovAB:hover:not(:active):after{-webkit-animation:_1hmB2 .09s linear 0s;animation:_1hmB2 .09s linear 0s}@-webkit-keyframes _1hmB2{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1hmB2{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2IvUM,body{height:100%;width:100%}._2IvUM{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.HexHN{display:-ms-flexbox;display:flex;-ms-flex-align:baseline;align-items:baseline}.HexHN._1g25R{border-color:#21c179}.HexHN:last-of-type ._3jOoB{border-bottom:0}.HexHN ._3h370{position:relative;top:32px}.HexHN ._3h370.pZAgU{top:6px}.HexHN ._3h370 span{font-size:12px;color:#101010;font-weight:400;line-height:14px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:space-evenly;justify-content:space-evenly;width:100%;position:relative}.HexHN ._3h370 span i{width:6px;height:6px;position:relative;top:-1px;padding:2px;-webkit-box-sizing:border-box;box-sizing:border-box;border-right:1px solid #101010;border-bottom:1px solid #101010;display:block;-webkit-transform:rotate(45deg);-ms-transform:rotate(45deg);transform:rotate(45deg)}.HexHN ._3Do3o{position:relative;top:8px;background-color:#fff;padding:0 12px 0 8px}.HexHN ._3Do3o .SDpuU{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;width:40px;height:40px;border:1px solid #cacaca;border-radius:50%}.HexHN ._3Do3o .SDpuU img{width:27px;height:27px}.HexHN ._3jOoB{position:relative;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;-ms-flex-positive:7;flex-grow:7;-webkit-box-sizing:border-box;box-sizing:border-box;padding:20px 0 22px;border-bottom:1px solid rgba(16,16,16,.13)}.HexHN ._3jOoB._10MEq{border-bottom:none}.HexHN ._3jOoB._5tfWF{padding-bottom:51px}.HexHN ._3jOoB ._2edaR{font-size:14px;color:#101010;font-weight:500;line-height:20px;margin-bottom:16px}.HexHN ._3jOoB ._2edaR p{margin:0}.HexHN ._3jOoB ._2edaR a{font-size:14px;color:#666;font-weight:400;text-decoration:underline}.HexHN ._3jOoB ._2edaR ._2y2VG{font-size:12px;color:#666;font-weight:400;line-height:16px;margin-top:8px}.HexHN ._3jOoB .GcYyv{display:-ms-flexbox;display:flex}.HexHN ._3jOoB .GcYyv ._2BkR6{font-size:10px;color:#fff;font-weight:700;line-height:10px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;line-height:16px;background:#21c179;border-radius:4px;padding:0 4px;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;margin-right:8px}.HexHN ._3jOoB .fJBna{display:none}.HexHN ._3jOoB ._2-h7m{display:-ms-flexbox;display:flex;-ms-flex-align:start;align-items:flex-start;-ms-flex-pack:start;justify-content:flex-start;position:absolute;border-radius:8px;z-index:1;padding:8px 12px;margin:12px 0;background-color:#fff8e1;width:90%}.HexHN ._3jOoB ._2-h7m img{width:16px;height:16px;padding-right:6px}.HexHN ._3jOoB ._2-h7m ._14q1a{font-size:12px;color:#101010;font-weight:400;line-height:16px}.HexHN ._3jOoB ._2ejSA{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-wrap:wrap;flex-wrap:wrap}.HexHN ._3jOoB ._2ejSA .BcRTi{font-size:12px;color:#101010;font-weight:500;line-height:16px;position:relative;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;border:1px dashed #21c179;border-radius:4px;margin-right:6px}.HexHN ._3jOoB ._2ejSA .BcRTi._3yJvs{border-color:#cacaca}.HexHN ._3jOoB ._2ejSA .BcRTi img{width:14px;height:14px;padding-left:5px}.HexHN ._3jOoB ._2ejSA .BcRTi span{padding:2px 4px 2px 3px}.HexHN ._3jOoB ._2ejSA ._1mEXY{font-size:12px;color:#21c179;font-weight:500;line-height:16px;white-space:nowrap}.HexHN ._3jOoB ._2ejSA ._1mEXY._2Ynk2{color:#666}.HexHN ._3jOoB ._2ejSA._5tfWF{padding-bottom:10px}.HexHN ._3jOoB ._2GG6t{font-size:12px;color:#21c179;line-height:14px;margin-bottom:5px;width:calc(100% + 80px)}.HexHN ._22_QF{opacity:.5;pointer-events:none}@media(min-width:992px){.HexHN ._3jOoB ._29Fbe{width:175px;z-index:2}}',
          }}
        />
        <style
          type="text/css"
          id="s1602-0"
          dangerouslySetInnerHTML={{
            __html:
              '._315Rv{-webkit-animation:_315Rv .3s cubic-bezier(.22,.61,.36,1);animation:_315Rv .3s cubic-bezier(.22,.61,.36,1)}._3mqBl{-webkit-animation:_3mqBl .3s cubic-bezier(.22,.61,.36,1);animation:_3mqBl .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _315Rv{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _315Rv{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _3mqBl{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _3mqBl{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._183TZ{-ms-flex-direction:row;flex-direction:row}._2olNf,._2c8vH,._183TZ{display:-ms-flexbox;display:flex}._2olNf,._2c8vH{-ms-flex-direction:column;flex-direction:column}._33_Mr{border-bottom:1px solid #cacaca}._2vZik{border:1px solid #cacaca}._2LEL9{border-top:1px solid #cacaca}._1kwBL{font-size:12px;margin:8px 0;color:#fd5154}.B7JIQ{position:relative;overflow:hidden}.B7JIQ:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.B7JIQ:hover:not(:active):after{-webkit-animation:_1eZHV .09s linear 0s;animation:_1eZHV .09s linear 0s}@-webkit-keyframes _1eZHV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _1eZHV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.q5cs3,body{height:100%;width:100%}.q5cs3{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._3McsZ{padding:15px 16px 16px}._3McsZ>h1{font-size:24px;margin-bottom:30px}._3McsZ ._2yg6i,._3McsZ>h1{color:#101010;font-weight:700;line-height:16px}._3McsZ ._2yg6i{background-color:#e0f5fd;padding:18px 18px 10px;border-radius:12px;font-size:18px;display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;position:relative}._3McsZ ._2yg6i ._3XMhY{background-color:#ffd766;font-size:10px;color:#101010;font-weight:600;line-height:16px;position:absolute;top:-12px;width:-webkit-fit-content;width:-moz-fit-content;width:fit-content;border-radius:5px;padding:2px 5px}._3McsZ ._2yg6i>span{margin-bottom:5px}._3McsZ ._2yg6i ._1rkcM{font-size:14px;color:#101010;font-weight:500;line-height:16px}._3McsZ ._2yg6i ._3ZzVI{font-size:10px;color:#7e7e7e;font-weight:400;line-height:16px}._3McsZ ._2yg6i ._1FLyD{font-size:10px;color:#7e7e7e;font-weight:600;line-height:16px}._3McsZ ._2hJbA{font-size:10px;color:#7e7e7e;font-weight:400;line-height:16px;margin:10px 0}._3McsZ ._28p8X{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column}._3McsZ ._28p8X>div{width:100%}._3McsZ ._28p8X ._1RMFy{margin:0 0 16px}._3McsZ ._28p8X ._1RMFy button{background:#000000;color:#fff;border-radius:8px;border:0}._3McsZ ._28p8X ._1RMFy button,._3McsZ ._28p8X ._3CKHm button{font-size:16px;height:52px;width:100%;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer}._3McsZ ._28p8X ._3CKHm button{background:#fff;color:#000000;border-radius:8px;border:1px solid #000000}._2c8vH{background:#fff;border:1px solid rgba(16,16,16,.22);border-radius:12px;padding:20px 16px;margin:16px}._2c8vH ._10CcA{margin:2px 0 0 30px;font-size:14px;color:#101010;font-weight:500;line-height:20px}._2c8vH ._10CcA span{display:-ms-flexbox;display:flex;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}._2c8vH ._10CcA ._1FLyD{display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between}._2c8vH ._10CcA ._1FLyD div{display:-ms-flexbox;display:flex;grid-gap:5px;gap:5px}._2c8vH ._10CcA ._1FLyD div span{font-size:10px;font-weight:700}._2c8vH ._10CcA ._1FLyD img{width:35px}._2c8vH ._10CcA ._2iWDE span{display:inline}._2c8vH ._1B0M0 ._3SGu5{margin-top:-5px}._2c8vH ._1B0M0 ._3SGu5 img{width:124px}._2c8vH ._1B0M0 ._2iWDE{margin-top:-2px}._2c8vH ul{margin-top:20px}._2c8vH ul li{margin-bottom:20px}.O6CPe{margin:24px 16px 16px}.O6CPe>h1{font-size:18px;color:#101010;font-weight:700;line-height:16px}.O6CPe ._3aHyV{font-size:14px;color:#101010;font-weight:500;line-height:20px;margin:10px 0}.O6CPe ._1HW30{font-size:12px;color:#7e7e7e;font-weight:500;line-height:20px;margin:8px 0 32px}.O6CPe ._28p8X>div{margin-bottom:12px}.O6CPe ._28p8X ._1RMFy button{background:#000000;color:#fff;border-radius:8px;border:0}.O6CPe ._28p8X ._1RMFy button,.O6CPe ._28p8X ._3CKHm button{font-size:16px;height:52px;width:100%;font-weight:600;padding:0 12px;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:center;justify-content:center;cursor:pointer}.O6CPe ._28p8X ._3CKHm button{background:#fff;color:#000000;border-radius:8px;border:1px solid #000000}.O6CPe ._3Q98p{margin:8px 0;font-size:12px;color:#fd5154}',
          }}
        />
        <style
          type="text/css"
          id="s1604-0"
          dangerouslySetInnerHTML={{
            __html:
              '._35q-w{-webkit-animation:_35q-w .3s cubic-bezier(.22,.61,.36,1);animation:_35q-w .3s cubic-bezier(.22,.61,.36,1)}._1raJT{-webkit-animation:_1raJT .3s cubic-bezier(.22,.61,.36,1);animation:_1raJT .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _35q-w{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _35q-w{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1raJT{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1raJT{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}._1vKoE{-ms-flex-direction:row;flex-direction:row}._1t08h,._1vKoE{display:-ms-flexbox;display:flex}._1t08h{-ms-flex-direction:column;flex-direction:column}._1ztyZ{border-bottom:1px solid #cacaca}._mrT1{border:1px solid #cacaca}.BYdjw{border-top:1px solid #cacaca}._3_dfe{font-size:12px;margin:8px 0;color:#fd5154}.vwcAs{position:relative;overflow:hidden}.vwcAs:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}.vwcAs:hover:not(:active):after{-webkit-animation:_2X0wV .09s linear 0s;animation:_2X0wV .09s linear 0s}@-webkit-keyframes _2X0wV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _2X0wV{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.Dztan,body{height:100%;width:100%}.Dztan{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}._2lY0E{width:100%;max-width:906px;margin-top:24px}._2lY0E ._2LMRr{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;margin-bottom:15px;grid-gap:8px;gap:8px}._2lY0E ._2LMRr>h1{font-size:16px;color:#101010;font-weight:600;line-height:20px}._2lY0E ._2LMRr ._1IArC{background-color:#ffd766;font-size:10px;color:#101010;font-weight:600;line-height:16px;border-radius:5px;padding:2px 5px}._2lY0E ._3hurN{border:1px solid rgba(16,16,16,.13);border-radius:12px;overflow:hidden}._2lY0E ._3hurN ._3laBB{background:#e0f5fd;display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;-ms-flex-pack:justify;justify-content:space-between;padding:15px}._2lY0E ._3hurN ._3laBB>h1{font-size:16px;color:#101010;font-weight:500;line-height:20px}._2lY0E ._3hurN ._3laBB ._3g5eK{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;grid-gap:8px;gap:8px}._2lY0E ._3hurN ._3laBB ._3g5eK ._37avW{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column}._2lY0E ._3hurN ._3laBB ._3g5eK ._37avW>p{margin:0;font-size:16px;color:#101010;font-weight:700;line-height:20px;text-align:left}._2lY0E ._3hurN ._3laBB ._3g5eK ._37avW .pRLwz{font-size:12px;color:#101010;font-weight:400;line-height:16px}._2lY0E ._3hurN ._3laBB ._3g5eK>button{width:107px;padding:10px 0;background:#fff;border:1px solid #000000;border-radius:96px;font-size:14px;color:#000000;font-weight:600;line-height:16px;cursor:pointer}._2lY0E ._3hurN ._1zxeY{padding:14px 16px 8px}._2lY0E ._3hurN ._1zxeY ._307LX{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;margin-bottom:30px}._2lY0E ._3hurN ._1zxeY ._307LX>h1{font-size:16px;color:#101010;font-weight:600;line-height:20px;margin-right:30px}._2lY0E ._3hurN ._1zxeY ._307LX ._1Y5DM{display:-ms-flexbox;display:flex;-ms-flex-align:end;align-items:flex-end;grid-gap:4px;gap:4px}._2lY0E ._3hurN ._1zxeY ._307LX ._1Y5DM .iOF_k{width:58px;margin:4px 10px}._2lY0E ._3hurN ._1zxeY ._307LX ._1Y5DM ._37avW{display:-ms-flexbox;display:flex;-ms-flex-direction:column;flex-direction:column;margin-bottom:15px}._2lY0E ._3hurN ._1zxeY ._307LX ._1Y5DM ._37avW>p{margin:0;font-size:16px;color:#101010;font-weight:700;line-height:20px;text-align:left}._2lY0E ._3hurN ._1zxeY ._2d49Y{font-size:10px;color:rgba(16,16,16,.54);font-weight:400;line-height:16px}._2lY0E ._3hurN ._1zxeY ._2d49Y,._2lY0E ._3hurN ._1zxeY ._2d49Y span{display:-ms-flexbox;display:flex;-ms-flex-align:center;align-items:center;grid-gap:5px;gap:5px}._2lY0E ._3hurN ._1zxeY ._2d49Y span img{width:35px}._2lY0E ._3hurN ._1zxeY ._2d49Y._1Vc6F img{width:124px}._2lY0E ._3hurN ._1zxeY>h1{font-size:14px;color:#101010;font-weight:700;line-height:16px;margin-bottom:30px}',
          }}
        />
        <style
          type="text/css"
          id="s1606-0"
          dangerouslySetInnerHTML={{
            __html:
              '._1gN1v{-webkit-animation:_1gN1v .3s cubic-bezier(.22,.61,.36,1);animation:_1gN1v .3s cubic-bezier(.22,.61,.36,1)}._1rWA6{-webkit-animation:_1rWA6 .3s cubic-bezier(.22,.61,.36,1);animation:_1rWA6 .3s cubic-bezier(.22,.61,.36,1)}@-webkit-keyframes _1gN1v{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes _1gN1v{0%{-webkit-transform:translateY(100%);transform:translateY(100%)}to{-webkit-transform:translateY(0);transform:translateY(0)}}@-webkit-keyframes _1rWA6{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}@keyframes _1rWA6{0%{-webkit-transform:translateX(100%);transform:translateX(100%)}to{-webkit-transform:translateX(0);transform:translateX(0)}}.SHryj{-ms-flex-direction:row;flex-direction:row}._20LML,.SHryj{display:-ms-flexbox;display:flex}._20LML{-ms-flex-direction:column;flex-direction:column}._1eecu{border-bottom:1px solid #cacaca}._2fOuY{border:1px solid #cacaca}.Ub-Ib{border-top:1px solid #cacaca}._2cfJt{font-size:12px;margin:8px 0;color:#fd5154}._29FRb{position:relative;overflow:hidden}._29FRb:after{content:"";position:absolute;top:50%;left:50%;width:5px;height:5px;background:hsla(0,0%,100%,.5);opacity:1%;border-radius:100%;-webkit-transform:scale(1) translate(-50%);-ms-transform:scale(1) translate(-50%);transform:scale(1) translate(-50%);-webkit-transform-origin:50% 50%;-ms-transform-origin:50% 50%;transform-origin:50% 50%}._29FRb:hover:not(:active):after{-webkit-animation:_3IE6Z .09s linear 0s;animation:_3IE6Z .09s linear 0s}@-webkit-keyframes _3IE6Z{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@keyframes _3IE6Z{0%{-webkit-transform:scale(0);transform:scale(0);opacity:1}20%{-webkit-transform:scale(25);transform:scale(25);opacity:1}50%{-webkit-transform:scale(50);transform:scale(50);opacity:1}to{opacity:1;-webkit-transform:scale(90);transform:scale(90)}}@font-face{font-family:Inter;font-style:normal;font-weight:100;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:200;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:300;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:400;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:500;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:600;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:700;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:800;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}@font-face{font-family:Inter;font-style:normal;font-weight:900;font-display:swap;src:url(https://fonts.gstatic.com/s/inter/v3/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7W0Q5nw.woff2) format("woff2");unicode-range:U+00??,U+0131,U+0152-0153,U+02bb-02bc,U+02c6,U+02da,U+02dc,U+2000-206f,U+2074,U+20ac,U+2122,U+2191,U+2193,U+2212,U+2215,U+feff,U+fffd}html{-webkit-text-size-adjust:100%;-webkit-box-sizing:border-box;box-sizing:border-box;-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;overflow-x:hidden;overflow-y:scroll;text-rendering:optimizeLegibility;font-size:14px;-ms-touch-action:manipulation;touch-action:manipulation}a{text-decoration:none;color:#000000;cursor:pointer}a,button{-ms-touch-action:manipulation;touch-action:manipulation}iframe{border:0}article,aside,figure,footer,hgroup,section{display:block}body,button,input,pre,select,textarea{font-family:Inter,sans-serif}code,pre{-moz-osx-font-smoothing:auto;-webkit-font-smoothing:auto;line-height:1.5px}body{background:#fff;color:#101010;margin:0 auto;font-weight:400;font-size:14px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}._2WUIR,body{height:100%;width:100%}._2WUIR{overflow:hidden!important;position:fixed}svg:not(:root){overflow:hidden}button:focus,div[role=button]:focus,input:focus,select:focus,textarea:focus{outline:none}ol,ul{list-style:none}h1,h2,h3,h4,h5,h6,ol,ul{margin:0;padding:0}*{-webkit-box-sizing:border-box;box-sizing:border-box}.oQ1nQ{-ms-flex-align:center;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:16px;overflow-x:scroll}.oQ1nQ,.oQ1nQ>div{display:-ms-flexbox;display:flex;align-items:center}.oQ1nQ>div{-ms-flex:0 0 120px;flex:0 0 120px;-ms-flex-align:center;-ms-flex-pack:center;justify-content:center;-ms-flex-direction:column;flex-direction:column;min-width:120px;min-height:100px;padding:8px;margin-right:12px;border-radius:12px;border:1px solid #dde5ed;font-size:12px;color:#7e7e7e;font-weight:400;line-height:16px}.oQ1nQ>div>img{width:30px;height:30px}.oQ1nQ>div ._1EZyk{font-size:14px;color:#101010;font-weight:400;line-height:16px;padding:10px 0 5px}.oQ1nQ>div ._1HB91{font-size:14px;color:#101010;font-weight:600;line-height:16px;text-align:center;margin-bottom:6px}@media(min-width:992px){.oQ1nQ{padding-bottom:4px}}',
          }}
        />
      </>
      <>{JSON.stringify(data)}
        <div id="app">
          <div>
            <div className="_1-VZb">
              <div className="_2xOtw">
                <form autoComplete="off" onSubmit={formik.handleSubmit}>
                  <section className="_25iE3">
                    {/* <div className="_2ntdo"> */}
                    <div className="row">
                      <div className="col-xl-8">
                        <div className="_299Nm">
                          <div className="_2M1pt">
                            <div className="_1mIwr">
                              <span>Flight Details</span>
                            </div>

                            {/* Flight Details data Start */}
                            {paymentResult?.itineraries?.map((item, index) => {
                              return (
                                <>
                                  <div className="_2LiG5" key={index}>
                                    <div>
                                      <div className="_2BQKr _7efW6">
                                        <div className="_1Dacs undefined">
                                          <div className="_3gQ_b aQX9t">
                                            <div className="_2c1ZK">
                                              {item?.segments?.map(
                                                (stopData, index2) => {
                                                  return (
                                                    <>
                                                      <div
                                                        className="_3x4s5 mb-4"
                                                        key={index2}
                                                      >
                                                        <div className="_3tMEB">
                                                          {isValidURL(
                                                            findLogo(
                                                              stopData?.carrierCode
                                                            )
                                                          ) ? (
                                                            <img
                                                              className="size-40"
                                                              src={findLogo(
                                                                stopData?.carrierCode
                                                              )}
                                                              style={{
                                                                borderRadius:
                                                                  "50%",
                                                              }}
                                                              alt="image"
                                                            />
                                                          ) : (
                                                            <Skeleton
                                                              circle
                                                              height={"40px"}
                                                              width={"40px"}
                                                            />
                                                          )}
                                                          <span>
                                                            {capitalizeFLetter(
                                                              searchResult
                                                                ?.flightSearch
                                                                ?.dictionaries
                                                                ?.carriers[
                                                                stopData
                                                                  .carrierCode
                                                              ]
                                                            )}
                                                          </span>
                                                          <span>{`${stopData.carrierCode} - ${stopData.number}`}</span>
                                                        </div>
                                                        <div className="_1CLeO">
                                                          <div className="_1z7xD _1nqFV">
                                                            <div>
                                                              {
                                                                stopData
                                                                  .departure
                                                                  .iataCode
                                                              }
                                                            </div>
                                                            <div>
                                                              {
                                                                stopData.arrival
                                                                  .iataCode
                                                              }
                                                            </div>
                                                          </div>
                                                          <div className="_1z7xD _3svf-">
                                                            <div>
                                                              {moment(
                                                                stopData
                                                                  ?.departure
                                                                  ?.at
                                                              ).format(
                                                                "h:mm a"
                                                              )}
                                                            </div>
                                                            <span>
                                                              ————
                                                              <span className="_27kXv">
                                                                {TimeDifference(
                                                                  stopData?.duration
                                                                )}
                                                                {/* {TimeDifference(
                                                                  stopData
                                                                    ?.departure
                                                                    .at,
                                                                  stopData
                                                                    ?.arrival.at
                                                                )} */}
                                                                {/* <img src="./tickets.paytm.com_flights_review_files/68a0a4f5.svg" /> */}
                                                              </span>
                                                              ————
                                                            </span>
                                                            <div>
                                                              {moment(
                                                                stopData
                                                                  ?.arrival?.at
                                                              ).format(
                                                                "h:mm a"
                                                              )}
                                                            </div>
                                                          </div>
                                                          <div className="_1z7xD _1V10B">
                                                            <div>
                                                              {moment(
                                                                stopData
                                                                  ?.departure
                                                                  ?.at
                                                              ).format(
                                                                "MMMM Do YYYY"
                                                              )}
                                                            </div>
                                                            <div>
                                                              {moment(
                                                                stopData
                                                                  ?.arrival?.at
                                                              ).format(
                                                                "MMMM Do YYYY"
                                                              )}
                                                            </div>
                                                          </div>
                                                          <div className="_1z7xD ya23h">
                                                            <div>
                                                              {" "}
                                                              (T
                                                              {stopData
                                                                .departure
                                                                .terminal
                                                                ? stopData
                                                                    .departure
                                                                    .terminal
                                                                : 0}
                                                              )
                                                              {searchAirport(
                                                                stopData
                                                                  ?.departure
                                                                  ?.iataCode
                                                              )}
                                                            </div>
                                                            <div className="_1dVW_">
                                                              {" "}
                                                              (T
                                                              {stopData.arrival
                                                                .terminal
                                                                ? stopData
                                                                    .arrival
                                                                    .terminal
                                                                : null}
                                                              )
                                                              {searchAirport(
                                                                stopData
                                                                  ?.arrival
                                                                  ?.iataCode
                                                              )}
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                      {index2 <
                                                        item?.segments?.length -
                                                          1 && (
                                                        <Alert color="warning">
                                                          {TimeDifferenceLayOver(
                                                            item?.segments[
                                                              index2
                                                            ].arrival.at,
                                                            item?.segments[
                                                              index2 + 1
                                                            ].departure.at
                                                          )}{" "}
                                                          layover in{" "}
                                                          {searchAirport(
                                                            stopData?.arrival
                                                              ?.iataCode
                                                          )}
                                                        </Alert>
                                                      )}
                                                      {/* {index2 <
                                                      item?.segments?.length - 1 && (
                                                      <Alert color="warning">
                                                        {TimeDifference(
                                                          item?.segments[index2]
                                                            .arrival.at,
                                                            item?.segments[index2 + 1]
                                                            .departure.at
                                                        )}{" "}
                                                        layover in{" "}
                                                        {getAirport(
                                                          stopData.arrival.iataCode
                                                        )}
                                                      </Alert>
                                                    )} */}
                                                    </>
                                                  );
                                                }
                                              )}
                                              {/* <div className="_3x4s5">
                                              <div className="_3tMEB">
                                                <img src="./tickets.paytm.com_flights_review_files/AI.png" />
                                                <span>Air India</span>
                                                <span>AI-636</span>
                                              </div>
                                              <div className="_1CLeO">
                                                <div className="_1z7xD _1nqFV">
                                                  <div>
                                                    Indore<span> (DEPART)</span>
                                                  </div>
                                                  <div>Mumbai</div>
                                                </div>
                                                <div className="_1z7xD _3svf-">
                                                  <div>16:35</div>
                                                  <span>
                                                    ————
                                                    <span className="_27kXv">
                                                      1h 25m
                                                      <img src="./tickets.paytm.com_flights_review_files/68a0a4f5.svg" />
                                                    </span>
                                                    ————
                                                  </span>
                                                  <div>18:00</div>
                                                </div>
                                                <div className="_1z7xD _1V10B">
                                                  <div>Mon, 16 Oct</div>
                                                  <div>Mon, 16 Oct</div>
                                                </div>
                                                <div className="_1z7xD ya23h">
                                                  <div> Devi Ahilyabai Holkar</div>
                                                  <div className="_1dVW_">
                                                    (T2) Chhatrapati Shivaji Maharaj
                                                    Airport
                                                  </div>
                                                </div>
                                              </div>
                                            </div> */}
                                              {/* <section className="sboCZ _36CLn">
                                              <div className="X4bxb">
                                                <img src="./tickets.paytm.com_flights_review_files/f7f1a80b.svg" />
                                              </div>
                                              <div>
                                                <b>5h 5m</b> layover in <b>Mumbai</b>{" "}
                                                You need to change the flight during the
                                                layover
                                              </div>
                                            </section>
                                            <div className="_3x4s5">
                                              <div className="_3tMEB">
                                                <img src="./tickets.paytm.com_flights_review_files/AI.png" />
                                                <span>Air India</span>
                                                <span>AI-945</span>
                                              </div>
                                              <div className="_1CLeO">
                                                <div className="_1z7xD _1nqFV">
                                                  <div>Mumbai</div>
                                                  <div>Abu Dhabi</div>
                                                </div>
                                                <div className="_1z7xD _3svf-">
                                                  <div>23:05</div>
                                                  <span>
                                                    ————
                                                    <span className="_27kXv">
                                                      2h 55m
                                                      <img src="./tickets.paytm.com_flights_review_files/68a0a4f5.svg" />
                                                    </span>
                                                    ————
                                                  </span>
                                                  <div>00:30</div>
                                                </div>
                                                <div className="_1z7xD _1V10B">
                                                  <div>Mon, 16 Oct</div>
                                                  <div>Tue, 17 Oct</div>
                                                </div>
                                                <div className="_1z7xD ya23h">
                                                  <div>
                                                    (T2) Chhatrapati Shivaji Maharaj
                                                    Airport
                                                  </div>
                                                  <div className="_1dVW_">
                                                    (T1) Abu Dhabi International Airport
                                                  </div>
                                                </div>
                                              </div>
                                            </div> */}
                                            </div>
                                            {/* <div className="_1BYFc">
                                            <div className="_3F-_I">
                                              <div className="Yjs7H" />
                                              <div className="Yjs7H _25O6r" />
                                            </div>
                                            <div className="_1PFnA">
                                              <div>
                                                <img
                                                  src="./tickets.paytm.com_flights_review_files/886d7a73.svg"
                                                  alt="baggage-icon"
                                                />
                                                Checkin 40 kg · Cabin 12 kg
                                              </div>
                                            </div>
                                          </div> */}
                                          </div>
                                          <div className="hVMs1" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            })}

                            {/* Flight Details data End */}
                          </div>
                          <div className="bo4yu">
                            <section className="Dfrub">
                              <div className="_4a1S_">
                                <div>
                                  <span>
                                    {/* <img
                                    src="./tickets.paytm.com_flights_review_files/25f4e5d3.svg"
                                    alt="icon"
                                  /> */}
                                    <h3>Enter Passenger Details</h3>
                                    <span className="_3xMvt">
                                      {countUser}/{passCount.length} Added
                                    </span>
                                  </span>
                                  <div className="_1OM-M">
                                    Please mention name same as govt ID
                                  </div>
                                </div>
                                {/* <div>
                                <span className="_3NwN7">
                                  <img
                                    src="./tickets.paytm.com_flights_review_files/65ee514a.svg"
                                    alt=""
                                  />
                                  <span>
                                    Quickly select travellers from Saved List/
                                    Past Bookings
                                  </span>
                                  <span className="_3nWlW">
                                    Login to Continue
                                    <i />
                                  </span>
                                </span>
                              </div> */}
                              </div>
                              <section className="_1cAcI">
                                <Accordion open={open} toggle={toggle}>
                                  {passCount.map((item, index) => {
                                    return (
                                      <>
                                        <AccordionItem key={index}>
                                          <AccordionHeader targetId={index}>
                                            {item.complete
                                              ? `${data[index].firstname} ${data[index].lastname} Added`
                                              : `${typeArray[item.type]} ${
                                                  item.number
                                                }`}{" "}
                                            &nbsp;
                                            <span className="text-danger">
                                              {error[index]?.errorInd}
                                            </span>
                                          </AccordionHeader>
                                          <AccordionBody accordionId={index}>
                                            <div className="row x-gap-20 y-gap-20 pt-20">
                                              <div className="col-md-12">
                                                <input
                                                  type="radio"
                                                  name={`gender_${index}`}
                                                  defaultValue="MALE"
                                                  defaultChecked={data[index]?.gender==="MALE"}
                                                  onChange={(e) => {
                                                    changeGender(e, index);
                                                  }}
                                                  style={{ cursor: "pointer" }}
                                                />
                                                Male &nbsp;&nbsp;&nbsp;
                                                <input
                                                  type="radio"
                                                  name={`gender_${index}`}
                                                  defaultValue="FEMALE"
                                                  onChange={(e) => {
                                                    changeGender(e, index);
                                                  }}
                                                  defaultChecked={data[index]?.gender==="FEMALE"}
                                                  style={{ cursor: "pointer" }}
                                                />
                                                Female &nbsp;&nbsp;&nbsp;
                                                <input
                                                  type="radio"
                                                  name={`gender_${index}`}
                                                  defaultValue="UNSPECIFIED"
                                                  onChange={(e) => {
                                                    changeGender(e, index);
                                                  }}
                                                  defaultChecked={data[index]?.gender==="UNSPECIFIED"}
                                                  style={{ cursor: "pointer" }}
                                                />
                                                Other
                                                <br />
                                                <span className="text-danger">
                                                  {error[index]?.gender}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label className="lh-1 text-16 text-light-1">
                                                  First and Middle Name
                                                </label>
                                                {/* <div className="paymentinput"> */}
                                                <input
                                                  maxLength={70}
                                                  name={`firstname_${index}`}
                                                  type="text"
                                                  onChange={(e) => {
                                                    changeFirstName(e, index);
                                                  }}
                                                  defaultValue={
                                                    data[index]?.firstname
                                                  }
                                                  className="paymentinput"
                                                />
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.firstname}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label className="lh-1 text-16 text-light-1">
                                                  Last Name
                                                </label>
                                                {/* <div className="form-input "> */}
                                                <input
                                                  maxLength={35}
                                                  name={`lastname_${index}`}
                                                  onChange={(e) => {
                                                    changeLastName(e, index);
                                                  }}
                                                  defaultValue={
                                                    data[index]?.lastname
                                                  }
                                                  type="text"
                                                  className="paymentinput"
                                                />
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.lastname}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label
                                                  className="lh-1 text-16 text-light-1"
                                                  style={{ top: "15px" }}
                                                >
                                                  Date of Birth
                                                </label>
                                                {/* <div className="paymentinput"> */}
                                                <input
                                                  type="date"
                                                  autoComplete="off"
                                                  name={`dateOfBirth_${index}`}
                                                  selected={
                                                    data[index]?.dateOfBirth
                                                  }
                                                  onChange={(e) => {
                                                    changeDOB(
                                                      e.target.value,
                                                      index,
                                                      typeArray[item.type]
                                                    );
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                  max={
                                                    new Date()
                                                      .toISOString()
                                                      .split("T")[0]
                                                  }
                                                />
                                                {/* <DatePicker
                                                  autoComplete="off"
                                                  name={`dateOfBirth_${index}`}
                                                  showYearDropdown
                                                  dateFormatCalendar="yyyy"
                                                  yearDropdownItemNumber={30}
                                                  showIcon={true}
                                                  selected={
                                                    data[index]?.dateOfBirth
                                                  }
                                                  onChange={(date) => {
                                                    changeDOB(date, index);
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                /> */}
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.dateOfBirth}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label
                                                  className="lh-1 text-16 text-light-1"
                                                  style={{ top: "15px" }}
                                                >
                                                  Passenger Nationality
                                                </label>
                                                {/* <div className="form-input "> */}
                                                <Select
                                                  className="selectFull"
                                                  options={options}
                                                  // value={value}
                                                  onChange={(value) => {
                                                    changeNationality(
                                                      value,
                                                      index
                                                    );
                                                  }}
                                                />
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.nationality}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label
                                                  className="lh-1 text-16 text-light-1"
                                                  style={{ top: "15px" }}
                                                >
                                                  Passport Issue Country
                                                </label>
                                                {/* <div className="form-input "> */}
                                                <Select
                                                  className="selectFull"
                                                  options={options}
                                                  // value={valueIssue}
                                                  onChange={(value) => {
                                                    changeIssueCountry(
                                                      value,
                                                      index
                                                    );
                                                  }}
                                                />
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.issueCountry}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label className="lh-1 text-16 text-light-1">
                                                  Passport Number
                                                </label>
                                                {/* <div className="form-input "> */}
                                                <input
                                                  maxLength={9}
                                                  onChange={(e) => {
                                                    changeNumber(e, index);
                                                  }}
                                                  name={`number_${index}`}
                                                  type="text"
                                                  value={data[index]?.number}
                                                  className="paymentinput"
                                                />
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.number}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label
                                                  className="lh-1 text-16 text-light-1"
                                                  style={{ top: "15px" }}
                                                >
                                                  Passport Issuing Date
                                                </label>
                                                {/* <div className="form-input "> */}
                                                <input
                                                  type="date"
                                                  autoComplete="off"
                                                  name={`issuanceDate_${index}`}
                                                  selected={
                                                    data[index]?.issuanceDate
                                                  }
                                                  onChange={(e) => {
                                                    changeIssuanceDate(
                                                      e.target.value,
                                                      index
                                                    );
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                  max={
                                                    new Date()
                                                      .toISOString()
                                                      .split("T")[0]
                                                  }
                                                />
                                                {/* <DatePicker
                                                  autoComplete="off"
                                                  name={`issuanceDate_${index}`}
                                                  showYearDropdown
                                                  dateFormatCalendar="yyyy"
                                                  yearDropdownItemNumber={10}
                                                  showIcon
                                                  selected={
                                                    data[index]?.issuanceDate
                                                  }
                                                  onChange={(date) => {
                                                    changeIssuanceDate(
                                                      date,
                                                      index
                                                    );
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                /> */}
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.issuanceDate}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <label
                                                  className="lh-1 text-16 text-light-1"
                                                  style={{ top: "15px" }}
                                                >
                                                  Passport Expiry Date
                                                </label>
                                                {/* <div className="form-input"> */}
                                                <input
                                                  type="date"
                                                  autoComplete="off"
                                                  name={`expiryDate_${index}`}
                                                  value={
                                                    data[index]?.expiryDate ||
                                                    ""
                                                  }
                                                  selected={
                                                    data[index]?.expiryDate ||
                                                    ""
                                                  }
                                                  onChange={(e) => {
                                                    changeExpiryDate(
                                                      e.target.value,
                                                      index
                                                    );
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                  min={
                                                    data[index]?.issuanceDate ||
                                                    new Date()
                                                      .toISOString()
                                                      .split("T")[0]
                                                  }
                                                />
                                                {/* <DatePicker
                                                  autoComplete="off"
                                                  name={`expiryDate_${index}`}
                                                  showYearDropdown
                                                  dateFormatCalendar="yyyy"
                                                  yearDropdownItemNumber={10}
                                                  showIcon
                                                  selected={
                                                    data[index]?.expiryDate
                                                  }
                                                  onChange={(date) => {
                                                    changeExpiryDate(date, index);
                                                  }}
                                                  dateFormat="dd MMMM yyyy"
                                                  onKeyDown={(e) =>
                                                    e.preventDefault()
                                                  }
                                                  className="paymentinput"
                                                /> */}
                                                {/* </div> */}
                                                <span className="text-danger">
                                                  {error[index]?.expiryDate}
                                                </span>
                                              </div>
                                              <div className="col-md-4">
                                                <div className="form-input ">
                                                  <button
                                                    type="button"
                                                    onClick={(e) => {
                                                      save(
                                                        e,
                                                        index,
                                                        typeArray[item.type]
                                                      );
                                                    }}
                                                    className="mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-4 bg-dark-1 text-white"
                                                  >
                                                    {" "}
                                                    Save
                                                  </button>
                                                </div>
                                              </div>
                                            </div>
                                          </AccordionBody>
                                        </AccordionItem>
                                      </>
                                    );
                                  })}
                                </Accordion>

                                <hr />
                              </section>
                              <span className="text-danger">{mainError}</span>
                            </section>
                          </div>
                          <div
                            className="_3FlLC"
                            style={{
                              paddingBottom: "30px",
                              paddingTop: "30px",
                            }}
                          >
                            <div className="_3ajMo">
                              <div className="_3d1gu">
                                <div className="_2Ocet">
                                  <div>
                                    <h1 className="_3GDXC">
                                      Enter Contact Information
                                    </h1>
                                    <span className="_2wVvA">
                                      Your ticket SMS and Email will be sent
                                      here
                                    </span>
                                  </div>
                                </div>
                                <ul>
                                  <li style={{ height: 72 }}>
                                    <div className="wdPqw">
                                      <div
                                        className="Gk33M"
                                        style={{ width: "120px" }}
                                      >
                                        <PhoneInput
                                          country={"us"}
                                          value={phoneCode}
                                          onChange={(phone) => {
                                            changeCode(phone);
                                          }}
                                          countryPhoneNumber={true}
                                          onKeyDown={(e) => e.preventDefault()}
                                        />
                                      </div>
                                      <span className="text-danger">
                                        {errorPhoneCode}
                                      </span>
                                    </div>
                                  </li>
                                  <li style={{ height: 72 }}>
                                    <div className="wdPqw">
                                      <div
                                        className="Gk33M"
                                        style={{ width: "190px" }}
                                      >
                                        <input
                                          type="number"
                                          name="mobile"
                                          defaultValue={formik.values.mobile}
                                          value={formik.values.mobile}
                                          //onChange={changePhone}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                        />
                                        <label className="">
                                          Mobile Number*
                                        </label>
                                      </div>
                                      {formik.touched.mobile &&
                                        formik.errors.mobile && (
                                          <span className="text-danger">
                                            {formik.errors.mobile}
                                          </span>
                                        )}
                                    </div>
                                  </li>
                                  <li style={{ height: 72 }}>
                                    <div className="wdPqw">
                                      <div
                                        className="Gk33M"
                                        style={{ width: "190px" }}
                                      >
                                        <input
                                          type="text"
                                          name="email"
                                          value={formik.values.email}
                                          onChange={formik.handleChange}
                                          onBlur={formik.handleBlur}
                                        />
                                        <label className="">Email ID*</label>
                                      </div>
                                      {formik.touched.email &&
                                        formik.errors.email && (
                                          <span className="text-danger">
                                            {formik.errors.email}
                                          </span>
                                        )}
                                    </div>
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          <div className="kgzwR">
                            <p>
                              By booking with Travelquota, you agree to{" "}
                              <span>
                                <a
                                  href="https://paytm.com/company/terms-and-conditions?company=one97&tab=terms"
                                  target="_blank"
                                >
                                  T&amp;C
                                </a>
                              </span>
                            </p>
                            <div className="Q1lr5">
                              <button
                                type="submit"
                                className="mainSearch__submit button -blue-1 py-15 px-35 h-60 col-12 rounded-4 bg-dark-1 text-white"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <Spinner></Spinner>&nbsp;Loading...
                                  </>
                                ) : (
                                  <> Ready to Pay</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-xl-4">
                        <div className="EjZaV">
                          <div className="_2sC2j">
                            <div className="_2M1pt">
                              <div className="_1mIwr">Fare Breakup</div>
                              <div className="_3hzoy">
                                <div className="_2ulf4">
                                  <div className="_13YRF">
                                    <div className="_2BFcE">
                                      <div className="_2qq6w">Base Fare</div>
                                    </div>
                                    {count.adult != 0 && (
                                      <div className="_2BFcE">
                                        Adult(s) ({count.adult} X{" "}
                                        {currencyResult.symbol}{" "}
                                        {count.adultPrice})
                                        <span>
                                          {currency}{" "}
                                          {Number(count.adultPrice) *
                                            Number(count.adult)}
                                        </span>
                                      </div>
                                    )}
                                    {count.child != 0 && (
                                      <div className="_2BFcE">
                                        Children ({count.child} X {currency}{" "}
                                        {count.childPrice})
                                        <span>
                                          {currency}{" "}
                                          {Number(count.childPrice) *
                                            Number(count.child)}
                                        </span>
                                      </div>
                                    )}
                                    {count.infant != 0 && (
                                      <div className="_2BFcE">
                                        Infant(s) ({count.infant} X {currency}{" "}
                                        {count.infantPrice})
                                        <span>
                                          {currency}{" "}
                                          {Number(count.infantPrice) *
                                            Number(count.infant)}
                                        </span>
                                      </div>
                                    )}
                                    <div className="_2BFcE">
                                      <div className="_31ILI">
                                        Taxes &amp; Fees
                                      </div>
                                      {/* <span>{currency} {Number(count.infantTax)+Number(count.adultTax)+Number(count.childTax)}</span> */}
                                      <span>
                                        {currency} {total.tt}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="_3cNYf">
                                    <div className="toUhe">
                                      {/* Total Airfare<span>{currency} {Number(count.infantPrice)*Number(count.infant)+Number(count.childPrice)*Number(count.child)+Number(count.adultPrice)*Number(count.adult)+Number(count.infantTax)+Number(count.adultTax)+Number(count.childTax)}</span> */}
                                      Total Airfare
                                      <span>
                                        {currency} {total.taf}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="_13YRF">
                                    <div className="_2BFcE">
                                      <div>
                                        Convenience Fee
                                        {/* <img
                                      src="./tickets.paytm.com_flights_review_files/58f4602e.svg"
                                      className="_6q6ZP"
                                    /> */}
                                      </div>
                                      <span>
                                        {currency} {total.cf}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="_3cNYf">
                                    <div className="toUhe">
                                      Grand Total
                                      <span>
                                        {currency} {total.gt}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {/* <div className="_3Rsvi">
                          <div>
                            <section className="_1Jm1S">
                              <div className="_3JUD8">
                                <h3>Offers (1)</h3>
                                <span>View All Offers</span>
                              </div>
                              <div className="_218j6">
                                <div className="_3EDTI">
                                  <div className="_3JtXg">
                                    <span className="_1i2d8">Apply</span>
                                    <input
                                      className="G4Uk_"
                                      placeholder="Enter Promocode"
                                      defaultValue=""
                                    />
                                  </div>
                                </div>
                                <div className="_2sRce">
                                  <div className="HexHN">
                                    <div className="_3h370 pZAgU">
                                      <div className="">
                                        <div>
                                          <div className="_1SCee">
                                            <input
                                              type="radio"
                                              name="fare"
                                              id=""
                                              readOnly=""
                                              defaultValue="fare"
                                            />
                                            <label
                                              className=""
                                              htmlFor=""
                                              id=""
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="_3jOoB">
                                      <div className="_29Fbe">
                                        <div className="">
                                          <div className="_2edaR">
                                            <p className="">
                                              Earn 30,000 Cashback Points.{" "}
                                              <a>T&amp;Cs</a>
                                            </p>
                                          </div>
                                          <div className="_2ejSA">
                                            <div className="BcRTi">
                                              <img src="./tickets.paytm.com_flights_review_files/0695b691.svg" />
                                              <span>INTPOINTS</span>
                                            </div>
                                            <div className="_1mEXY">
                                              Save ₹300
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="_3Do3o">
                                        <div className="SDpuU">
                                          <img src="./tickets.paytm.com_flights_review_files/cashback_points_icon2.png" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="_1igpg">
                                  <span>Login to avail more offers</span>
                                  <i />
                                </div>
                              </div>
                            </section>
                          </div>
                        </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* </div> */}
                    <section className="_35MFN" />
                  </section>
                </form>
              </div>
            </div>
            <div className="">
              <div className=" iframeHolder" />
            </div>
          </div>
        </div>
      </>
    </>
  );
};

export default Index;
