
function getConfiguration(){
    const env = process.env.NODE_ENV || 'development';
    switch (env){
        case 'development':
            return require('../config/devDefault');
        case 'production':
            return require('../config/prodDefault');
        default:
            return require('../config/development');
    }
}

module.exports = {
    getConfiguration
}