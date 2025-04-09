import Seo from "../../../components/common/Seo";
import DashboardCard from "./components/DashboardCard";
import Sidebar from "../common/Sidebar";
//import Header from "../../../components/header/header";
import Header from "../../../components/header/dashboard-header";
import ChartSelect from "./components/ChartSelect";
import ChartMain from "./components/ChartMain";
import Link from "next/link";
import RercentBooking from "./components/RercentBooking";
import Footer from "../common/Footer";
import toast from "react-hot-toast";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { useEffect, useState } from "react";
import { getRequestToken } from "../../../api/Api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,

  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },

    tooltips: {
      position: "nearest",
      mode: "index",
      intersect: false,
      yPadding: 10,
      xPadding: 10,
      caretSize: 4,
      backgroundColor: "rgba(72, 241, 12, 1)",
      borderColor: "rgb(255, 99, 132)",
      backgroundColor: "#1967d2",
      borderColor: "rgba(0,0,0,1)",
      borderWidth: 4,
    },
  },
};

const Index = () => {
  const [labels, setLabels] = useState([]);
  const [amount, setAmount] = useState([]);
  const [earning, setEarning] = useState(0);
  const [bookings, setBookings] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loader, setLoader] = useState(true);

  const getData = async () => {
    const promiseToken = await getRequestToken(
      `admin/dashboard`,
      {},
      "get",
      localStorage.getItem("token")
    );
    if (promiseToken.error) {
      toast.error("Something went wrong. Try again later.");
    } else {
      setLoader(false);
      let labelArray = new Array();
      let AmountArray = new Array();
      promiseToken.response.ResponseBody?.graphData?.map((data) => {
        labelArray.push(data.date);
        AmountArray.push(data.totalAmount);
      });
      setLabels(labelArray);
      setEarning(promiseToken.response.ResponseBody?.totalEarning);
      setTotalUsers(promiseToken.response.ResponseBody?.totalUsers);
      setBookings(promiseToken.response.ResponseBody?.totalBooking);
      setAmount(AmountArray);
    }
  };

  // const labels = ["January", "February", "March", "April", "May", "June"];
  useEffect(() => {
    getData();
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "Total",
        data: labels.map(() => faker.datatype.number({ min: 100, max: 400 })),
        borderColor: "#1967d2",
        backgroundColor: "#1967d2",
        data: amount,
        fill: true,
        lineTension: 0.5,
      },
    ],
  };

  const dashCardData = [
    {
      title: "Earnings",
      amount: "$" + earning.toFixed(2),
      description: "Total earnings",
      icon: "/img/dashboard/icons/2.svg",
    },
    {
      title: "Bookings",
      amount: bookings,
      description: "Total bookings",
      icon: "/img/dashboard/icons/3.svg",
    },
    {
      title: "Users",
      amount: totalUsers,
      description: "Total users",
      icon: "https://img.icons8.com/ultraviolet/60/user.png",
    },
  ];
  return (
    <>
      <Seo pageTitle="Dashboard" />
      {/* End Page Title */}

      <div className="header-margin"></div>

      <Header />
      {/* End dashboard-header */}

      <div className="dashboard">
        <div className="dashboard__sidebar bg-white scroll-bar-1">
          <Sidebar />
          {/* End sidebar */}
        </div>
        {/* End dashboard__sidebar */}

        <div className="dashboard__main">
          <div className="dashboard__content bg-light-2">
            <div className="row y-gap-20 justify-between items-end pb-60 lg:pb-40 md:pb-32">
              <div className="col-12">
                <h1 className="text-30 lh-14 fw-600">Dashboard</h1>
                {/* <div className="text-15 text-light-1">
                  Lorem ipsum dolor sit amet, consectetur.
                </div> */}
              </div>
              {/* End .col-12 */}
            </div>
            {/* End .row */}

            <div className="row y-gap-30">
              {dashCardData.map((item, index) => (
                <div key={index} className="col-xl-4 col-lg-6 col-md-6">
                  <div className="py-30 px-30 rounded-4 bg-white shadow-3">
                    <div className="row y-gap-20 justify-between items-center">
                      <div className="col-auto">
                        <div className="fw-500 lh-14">{item.title}</div>
                        <div className="text-26 lh-16 fw-600 mt-5">
                          {item.amount}
                        </div>
                        <div className="text-15 lh-14 text-light-1 mt-5">
                          {item.description}
                        </div>
                      </div>
                      <div className="col-auto">
                        <img src={item.icon} alt="icon" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row y-gap-30 pt-20 chart_responsive">
              <div className="col-xl-7 col-md-6">
                <div className="py-30 px-30 rounded-4 bg-white shadow-3">
                  <div className="d-flex justify-between items-center">
                    <h2 className="text-18 lh-1 fw-500">Earning Statistics</h2>
                    {/* <ChartSelect /> */}
                  </div>
                  <div className="pt-30">
                    <div className="widget-content">
                      <Line options={options} data={data} />
                    </div>
                  </div>
                </div>
              </div>
              {/* End .col */}

              <div className="col-xl-5 col-md-6">
                <div className="py-30 px-30 rounded-4 bg-white shadow-3">
                  <div className="d-flex justify-between items-center">
                    <h2 className="text-18 lh-1 fw-500">Recent Bookings</h2>
                    <div>
                      <Link
                        href="/admin/db-booking"
                        className="text-14 text-blue-1 fw-500 underline"
                      >
                        View All
                      </Link>
                    </div>
                  </div>

                  <RercentBooking />
                </div>
              </div>
              {/* End .col */}
            </div>
            {/* End .row */}

            <Footer />
          </div>
          {/* End .dashboard__content */}
        </div>
        {/* End dashbaord content */}
      </div>
      {/* End dashbaord content */}
    </>
  );
};

export default Index;
