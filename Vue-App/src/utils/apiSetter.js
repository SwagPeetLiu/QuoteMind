import axios from 'axios';

// functio used to set up the global base URL for API calls:
function setBaseURL(){
    if (process.env.NODE_ENV === 'test') {
        axios.defaults.baseURL = 'https://3.27.193.145:3000';
    }
    else if (process.env.NODE_ENV === 'production') {
        axios.defaults.baseURL = 'https://3.27.193.145:3000';
    }
    else{
        axios.defaults.sslVerify = false;
        axios.defaults.baseURL = 'https://localhost:3000';
    }
}

export { setBaseURL };