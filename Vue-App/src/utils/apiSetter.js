import axios from 'axios';

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

// function used to attach/ dettach the common headers after user is logged in:
function setToken(token) {
    axios.defaults.headers.common['session-token'] = token;
}
function clearToken(){
    delete axios.defaults.headers.common['session-token'];
}

export { 
    setBaseURL,
    setToken,
    clearToken
};