'use client';
import axios from "axios";
import { BASE_URL } from '../config';

export const request = async (name, data, method) => {
  const apiUrl = `${BASE_URL}${name}`;
  let returnData = { response: null, error: null };
  const config = {
    headers: { "Content-Type": "application/json" },
  };
  await axios[method](apiUrl, data, config)
    .then((res) => {
        returnData.response = res.data
    })
    .catch((err) => {
      returnData.error = err;
    });
  return returnData;
};

export const requestToken = async (name, data, method, token) => {
  const apiUrl = `${BASE_URL}${name}`;
  let returnData = { response: null, error: null };
  const config = {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
  };
  await axios[method](apiUrl, data, config)
    .then((res) => {
        returnData.response = res.data
    })
    .catch((err) => {
      returnData.error = err;
    });
  return returnData;
};

export const getRequestToken = async (name, data, method, token) => {
  const apiUrl = `${BASE_URL}${name}`;
  let returnData = { response: null, error: null };
  console.log("apiUrl_:", apiUrl)
  const config = {
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`},
  };
  await axios[method](apiUrl, config)
    .then((res) => {
        returnData.response = res.data
    })
    .catch((err) => {
      returnData.error = err;
    });
  return returnData;
};

export const requestTokenUpload = async (name, data, method, token) => {
  console.log("Data_OF_blog_:", data)
  const apiUrl = `${BASE_URL}${name}`;
  let returnData = { response: null, error: null };
  const config = {
    headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}`},
  };
  await axios[method](apiUrl, data, config)
    .then((res) => {
        returnData.response = res.data
    })
    .catch((err) => {
      returnData.error = err;
    });
  return returnData;
};