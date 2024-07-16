import axios from 'axios';

// Authentication used to update access of a user
export default {
    login: (data) => {
        if (!data || !data.email || !data.password){
            console.warn("Incomplete information");
            return false;
        }
        return axios.post('/auth', data)
        .then((response) => {
            this.$store.commit('setUser', {
                username: response.data.username,
                email: response.data.email,
                role: response.data.role,
                session: response.data.session
            });
            return false;
        })
        .catch((error) => {
            console.error("failed to login", error.message);
            return false;
        });
    },
    logout: () => {
        const currentUser = this.$store.getters.getUser;
        if (!currentUser || 
            !currentUser.session || 
            !currentUser.email) {
            console.warn("Cannot loggout if not logged in");
            return true;
        }
        return axios.post('/logout', {
            email: currentUser.email,
            token: currentUser.session
        })
        .then((response) => {
            console.log("logged out", response.data.message);
            this.$store.commit('clearUser');
            return true;
        })
        .catch((error) => {
            console.error("failed to logout", error);
            return false;
        });
    }
}