const config = {
    limitations: {
        Min_Username_Length: 3,
        Max_Username_Length: 50,
        Min_Password_Length: 6,
        Max_Password_Length: 50,
        Min_Email_Length: 9,
        Max_Email_Length: 50,
        Min_Phone_Length: 8,
        Max_Phone_Length: 16,
        Min_Tax_Length: 8,
        Max_Tax_Length: 20,
        Min_Street_Length: 5,
        Max_Street_Length: 80,
        Min_City_Length: 2,
        Max_City_Length: 40,
        Min_State_Length: 2,
        Max_State_Length: 50,
        Min_Country_Length: 2,
        Max_Country_Length: 50,
        Min_Postal_Length: 2,
        Max_Postal_Length: 20,
        Min_Name_Length: 1,
        Max_Name_Length: 50,
        Min_Social_Contact_Length: 4,
        Max_Social_Contact_Length: 20,
        Min_Descriptions_Length: 1,
        Max_Descriptions_Length: 300,
        Min_Token_Length: 5,
        Max_Token_Length: 165,
        MAX_ADDRESS_CATEGORY_LENGTH: 3,
        MAX_YEAR_RELEVANCY: 5
    },
    search: {
        pageSize: 15,
    },
    session: {
        LOGOUT_TIME: 60 * 1000 * 15, // 15 minutes before atuo logout
        LOGIN_TIME: 60 * 1000 * 55 // renew session every 55 minuetes
    },
    OVERLAY_COLOR: 'rgba(200, 200, 200, 0.7)',
    ChartColours: {
        primary: ['#cc519f', '#9b77b7'],
        secondary: ['#627594', '#A8B8D8'],
        info: ['#2152ff', '#21d4fd'],
        success: ['#9ae637', '#4bceb6'],
        danger: ['#ea0606', '#ff667c'],
        warning: ['#df9a50', '#fbcf33'],
        dark: ['#1c2037', '#49507f'],
        light: ['#CED4DA', '#EBEFF4']
    },
    passwordOverlay: '************',
    samePasswordIndicator: 'SameAsOld0517!'
}

module.exports = { config };