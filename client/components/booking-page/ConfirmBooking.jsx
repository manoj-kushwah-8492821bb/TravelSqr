import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./stepper-booking/CheckoutForm";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { requestToken } from "../../api/Api";
import { useState } from "react";
import { useSelector } from "react-redux";

function ConfirmBooking() {
  const router = useRouter();
  const [formSubmitted, setFormSubmitted] = useState(false);
  //let currencyData = useSelector((state) => state?.CurrencySlice?.currencyData);
  //const [errorMessage,setErrorMessage] = useState('');
  //console.log("payment_intent_client_secret",router.query.payment_intent_client_secret);

  // const stripePromise = loadStripe(
  //   "pk_test_51Nu9f2FZ94b1jm8UkKBhVLN59XvlGWY5NQdB3bmHIOItuptOcJMNd5kUddaPAHYeXfcPVWHVF2hk4Hqb3vnZ7cuj00VmUONw18"
  // );
  const stripePromise = loadStripe(
    "pk_test_51P9M8kLvpmxmqqGIo3WNM4j0VzQti6x5kpIZYzzxdKdbIBHsAORApQBcuw4uQ5I9ncik27XzbtLH8vOfhPaj2KtN00R8eDru74"
  );
  // const stripePromise = loadStripe(
  //   "pk_live_51P9M8kLvpmxmqqGIpamZlMsVhqzOy3FJt9kK9B5cr7ttbfOKaJ7XwoQQ7lTwEACmpyGxGy6SQFo8D4au352Sc4Mx00zLmMb2gT"
  // );
  //const mid = 150;
  const options = {
    payment_method_types: ["card"],
    mode: "payment",
    amount: Number((Number(router?.query?.grandtotal) * 100).toFixed(0)),
    currency: router?.query?.currency?.toLowerCase(),
  };
  //console.log(options);
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!formSubmitted) {
        const message = "Are you sure you want to leave? Your changes may not be saved.";
        event.returnValue = message; // Standard for most browsers
        return message; // For some older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [formSubmitted]);
  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        int_id={router.query.clientsecret}
        booking_id={router.query.booking_id}
        paymentintentid={router.query.paymentintentid}
        onFormSubmit={() => setFormSubmitted(true)}
      />
    </Elements>
  );
}

export default ConfirmBooking;
