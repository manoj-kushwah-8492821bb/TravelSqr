import React, { useState } from "react";
import { Spinner } from "reactstrap";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { requestToken } from "../../../api/Api";
import { useRouter } from "next/router";
import { BASE_URL_IMG, FRONT_URL } from "../../../config";

const CheckoutForm = (props) => {
  const router = useRouter();
  //console.log('router',router.query);
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    props.onFormSubmit();
    setLoading(true);

    if (elements == null) {
      setLoading(false);
      return;
    }

    // Trigger form validation and wallet collection
    const { error: submitError } = await elements.submit();
    if (submitError) {
      // Show error to your customer
      setErrorMessage(submitError.message);
      setLoading(false);
      return;
    }

    // Create the PaymentIntent and obtain clientSecret from your server endpoint
    // const res = await fetch('/create-intent', {
    //   method: 'POST',
    // });

    // const {client_secret: clientSecret} = await res.json();
    //const clientSecret =  "pi_3O3FBbFZ94b1jm8U0rgXgxCE_secret_M2izRfR9LkVIskqbFRtvMCYHt";
    const clientSecret = props.int_id;

    const { error } = await stripe.confirmPayment({
      //`Elements` instance that was used to create the Payment Element
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${FRONT_URL}/paymentsuccess/?booking_id=${props.booking_id}`,
      },
    });
    //console.log(error);
    if (error) {
      // This point will only be reached if there is an immediate error when
      // confirming the payment. Show error to your customer (for example, payment
      // details incomplete)
      setErrorMessage(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      // Your customer will be redirected to your `return_url`. For some payment
      // methods like iDEAL, your customer will be redirected to an intermediate
      // site first to authorize the payment, then redirected to the `return_url`.
    }
  };
  //console.log(errorMessage);
  return (
    <>
      <div class="row">
        <div class="col-sm"></div>
        <div class="col-sm">
          <form onSubmit={handleSubmit}>
            <PaymentElement />
            <div className="d-flex justify-content-center align-items-center pt-15">
              <button
                type="submit"
                disabled={!stripe || !elements}
                className="mainSearch__submit button -blue-1 py-15 px-35 h-60 col-6 rounded-4 bg-dark-1 text-white mt-3"
              >
                {loading ? (
                  <>
                    <Spinner></Spinner>&nbsp;Loading...
                  </>
                ) : (
                  <>
                    Pay <div className="icon-arrow-top-right ml-15" />
                  </>
                )}
              </button>
              {/* Show error message to your customers */}
            </div>
            {errorMessage && (
              <span className="text-danger">{errorMessage}</span>
            )}
          </form>
        </div>
        <div class="col-sm"></div>
      </div>
    </>
  );
};

export default CheckoutForm;
