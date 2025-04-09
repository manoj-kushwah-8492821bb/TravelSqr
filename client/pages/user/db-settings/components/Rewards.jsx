import React, { useEffect, useState } from 'react';
import { getRequestToken } from '../../../../api/Api';
import { Spinner } from 'reactstrap'; // Import Bootstrap Spinner

const Rewards = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    const getData = async () => {
        try {
            const promiseToken = await getRequestToken(
                "user/auth",
                {},
                "get",
                localStorage.getItem("userToken")
            );
            console.log("Response Data:", promiseToken);

            if (promiseToken.error) {
                throw new Error("Something went wrong. Try again later.");
            }

            setProfileData(promiseToken.response.ResponseBody);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="rewards-container d-flex justify-content-center align-items-center pt-15">
            {loading ? (
                <Spinner color="primary" />
            ) : profileData ? (
                <h3>
                    Total Coins: <span className="text-success">💰 {profileData.coins}</span>
                </h3>
            ) : (
                <p className="text-danger">Failed to load coins.</p>
            )}
        </div>
    );
};

export default Rewards;
