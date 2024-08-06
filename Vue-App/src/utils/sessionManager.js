import store from '../store';
import auth from '../api/auth';
import { config } from '../config/config';

// function used to autoamtically renew the session
function startLoginTimer(data){
    const loginTimer = setTimeout(() => {
        auth.login(data);
    }, config.session.LOGIN_TIME);
    store.commit("setUserSessionManager", 
        { ...store.state.userSessionManager, login: loginTimer });
}

// function used to autoamtically loggout the user when navigating away
function startLogoutTimer(){
    console.log(process.env.NODE_ENV);
    const logoutTimer = setTimeout(() => {
        auth.logout();
    }, config.session.LOGOUT_TIME);
    store.commit("setUserSessionManager", 
        { ...store.state.userSessionManager, logout: logoutTimer });
}

// function used to clear the logout timer
function clearLogoutTimer(){
    if(store.state.userSessionManager.logout){
        clearTimeout(store.state.userSessionManager.logout);
        store.commit("setUserSessionManager", 
            { ...store.state.userSessionManager, logout: null });
    }
}
function clearPreviousTimers(){
    const managers = store.state.userSessionManager;
    if(managers.login){
        clearTimeout(managers.login);
    }
    if(managers.logout){
        clearTimeout(managers.logout);
    }
    if(managers.blurListener){
        window.removeEventListener('blur', managers.blurListener);
    }
    if(managers.focusListener){
        window.removeEventListener('focus', managers.focusListener);
    }
    store.commit("setUserSessionManager", 
        { login: null, logout: null, blurListener: null, focusListener: null });
}

module.exports = { 
    startLoginTimer,
    startLogoutTimer,
    clearLogoutTimer,
    clearPreviousTimers
}