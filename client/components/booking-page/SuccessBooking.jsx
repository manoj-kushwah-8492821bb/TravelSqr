import {loadStripe} from '@stripe/stripe-js';
import {
  Elements,
} from '@stripe/react-stripe-js';
import CheckoutForm from './stepper-booking/CheckoutForm';
import { useRouter } from "next/router";
import { requestToken } from "../../api/Api";
import { useState, useEffect } from 'react';
import { Spinner } from "reactstrap";
import styles from './SuccessBooking.module.css';  // Import the CSS file

function SuccessBooking() {
    const router = useRouter();
    const [errorMessage,setErrorMessage] = useState('');
    const [resultImage,setResultImage] = useState('');
    const [iscoins, setIsCoins] = useState('');
    const [loader,setLoader] = useState(true);
    const [countdown, setCountdown] = useState(20); // Timer starts from 10


    async function succesPayment (data){
        
        const coinsUsed = localStorage.getItem("coinsUsed") || 0; // Get coinsUsed
        data.coinsUsed = Number(coinsUsed);

        const promise = await requestToken(
            "flight/flight-order-complete",
            data,
            "post",
            localStorage.getItem("userToken")
        );
        console.log("promiseDATa_:", promise)
        // console.log("data_:", promise.response.ResponseBody.booking.coinsPerBooking)
        if (promise?.error != undefined) {
            setErrorMessage('Something went wrong, Please contact customer care.');
            setResultImage('/img/booking-pages/failed.png');
            setLoader(false);
            //toast.error(promise.error.response.data.ResponseMessage);
            //setLoading(false);
        } else {
            if(router?.query?.redirect_status!='succeeded'){
                setErrorMessage('Something went wrong, Please contact customer care.');
                setResultImage('/img/booking-pages/failed.png');
                setLoader(false);
            }else{
                setErrorMessage('Your payment is successful.');
                setResultImage('/img/booking-pages/success.png');
                setIsCoins(promise.response.ResponseBody.booking.coinsPerBooking)
                setLoader(false);
            }
        }
            
    }
    useEffect(() => {
        let data = {
            booking_id: router.query.booking_id,
            payment_intent_id: router.query.payment_intent,
            transaction_id: router.query.payment_intent_client_secret
        };
        if (router?.query?.redirect_status == 'succeeded') {
            succesPayment(data);
        }

        // Countdown logic
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    router.push("/"); // Redirect to home page
                }
                return prev - 1;
            });
        }, 1000); // Decrease every second

    }, [router?.query?.redirect_status])

    return (
        <div className="row">
            <div className="col-sm"></div>
            <div className="col-sm">
                {loader ? (
                    <>
                        <div className="d-flex justify-content-center align-items-center pt-15">
                            <Spinner color="primary"></Spinner>
                        </div>
                        <div className="d-flex justify-content-center align-items-center pt-15">
                            Your payment is processing. Please wait...
                        </div>
                    </>
                ) : (
                    <>
                            {/* Coins showing here after successfully booking (Date= 8_march_2025) */}
                            <div className="d-flex justify-content-center align-items-center pt-15">
                                <div className="coins-icon">💰</div>
                                <div className="coins-text">
                                    You have earned <strong>{iscoins}</strong> coins on your bookin.
                                </div>
                            </div>


                        
                        <img src={`${resultImage}`} />
                        <div className="d-flex justify-content-center align-items-center pt-15">
                            {errorMessage}
                        </div>

                            {/* Countdown message */}
                            <div className="d-flex justify-content-center align-items-center pt-15">
                                Redirecting to home page in <strong>{countdown}</strong> seconds...
                            </div>
                    </>
                )}
            </div>
            <div className="col-sm"></div>
        </div>
    );
}

export default SuccessBooking;