import axios from "axios";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3333";

const api = axios.create({
    baseURL: API_BASE_URL,
});

console.log("API URL em uso:", API_BASE_URL);

export { api }