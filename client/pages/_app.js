import Aos from "aos";
import { useEffect, useState } from "react";
import SrollTop from "../components/common/ScrollTop";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/scrollbar";
import "swiper/css/effect-cards";
import "aos/dist/aos.css";
import "../styles/index.scss";
import "../styles/extra.css";
import { Provider } from "react-redux";
import { store } from "../app/store";
import toast, { Toaster } from "react-hot-toast";
import "react-loading-skeleton/dist/skeleton.css";

import Chatboat from "../components/chatboat";

//import { LoginSuccess } from "../features/LoginAuthSlice";
//import { requestToken } from "../api/Api";
//import { useDispatch } from "react-redux";

if (typeof window !== "undefined") {
  require("bootstrap/dist/js/bootstrap");
}

export default function App({ Component, pageProps }) {
  const [offlineToastId, setOfflineToastId] = useState(null);

  useEffect(() => {
    Aos.init({
      duration: 1200,
      once: true,
    });

    const handleOnlineStatusChange = () => {
      if (!navigator.onLine) {
        // Offline
        const id = toast("No internet connection!", {
          position: toast.POSITION.BOTTOM_CENTER,
          style: {
            background: "black",
            width: "210px",
            color: "white",
          },
          autoClose: false, // Do not auto-close the toast
        });

        setOfflineToastId(id);
      } else {
        // Online
        if (offlineToastId) {
          toast.dismiss(offlineToastId); // Close the toast when online
        }
      }
    };

    window.addEventListener("online", handleOnlineStatusChange);
    window.addEventListener("offline", handleOnlineStatusChange);

    return () => {
      window.removeEventListener("online", handleOnlineStatusChange);
      window.removeEventListener("offline", handleOnlineStatusChange);
    };
  }, [offlineToastId]);

  return (
    <main>
      <Provider store={store}>
        <Chatboat />
        <Component {...pageProps} />
        <SrollTop />
        <Toaster />
      </Provider>
    </main>
  );
}
