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
        MAX_ADDRESS_CATEGORY_LENGTH: 3
    },
    search: {
        pageSize: 10,
    },
    session:{
        LOGOUT_TIME : 60 * 1000 * 15, // 15 minutes before atuo logout
        LOGIN_TIME : 60 * 1000 * 55 // renew session every 55 minuetes
    }
}

module.exports = { config };