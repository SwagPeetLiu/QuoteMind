import axios from 'axios';
let interceptorId = null;
import store from "../store";
import { useTranslation } from './I18n';
const { global: { t } } = useTranslation(); // access the gloabal translation function

// functio used to set up the global base URL for API calls:
function setBaseURL(){
    if (process.env.NODE_ENV === 'test') {
        axios.defaults.baseURL = 'https://quotemind.pro/api';
    }
    else if (process.env.NODE_ENV === 'production') {
        axios.defaults.baseURL = 'https://quotemind.pro/api';
    }
    else{
        axios.defaults.sslVerify = false;
        axios.defaults.baseURL = 'https://localhost:3000/api';
    }
}

// Function to set up the interceptor
function setupInterceptor(access_token) {

    // Clear any existing interceptor
    if (interceptorId !== null) {
        axios.interceptors.response.eject(interceptorId);
    }

    // Set up the new interceptor
    interceptorId = axios.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            // try to refresh token upon 401 & server is asking for refreshing the session
            if (error.response.status === 401 && error.response.data.refresh && !originalRequest._retry) { // prevent iniginite filed requests
                originalRequest._retry = true;
                try {
                    const refreshed = await axios.post('/auth/refresh', { access_token: access_token });
                    setToken(refreshed.data.session_token, refreshed.data.access_token);
                    originalRequest.headers['session-token'] = refreshed.data.session_token; // upodate the header of the current request as well
                    return axios(originalRequest);
                
                // if failed to do so, ask user to re-login
                } catch (e) {
                    if (e.response && e.response.status === 401) {
                        store.commit("setToastMessage", { message: t("apiMessage.refreshToken.failed"), type: "error" });
                        store.commit("clearUser");
                    }
                }
            }
            return Promise.reject(error);
        }
    );
}

/*
function used to attach/ dettach the common headers after user is logged in
- token to set up the session,
*/
function setToken(session, access) {
    axios.defaults.headers.common['session-token'] = session;
    setupInterceptor(access);

    // store them accordingly in the local storage:
    const storedUserString = localStorage.getItem('user');
    if (storedUserString) {
        const storedUser = JSON.parse(storedUserString);
        storedUser.session = session;
        storedUser.access = access;
        localStorage.setItem('user', JSON.stringify(storedUser));
      }
}

// Function to clear tokens and remove the interceptor
function clearToken() {
    delete axios.defaults.headers.common['session-token'];
    if (interceptorId !== null) {
        axios.interceptors.response.eject(interceptorId);
        interceptorId = null;
    }
}

export { 
    setBaseURL,
    setToken,
    clearToken
};