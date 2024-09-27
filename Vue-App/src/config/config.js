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
        defaultOrder:{
            "companies": { column : "full_name", order: "ASC" },
            "clients": { column : "full_name", order: "ASC" },
            "positions": { column : "name", order: "ASC" },
            "materials": { column : "ch_name", order: "ASC" },
            "products": { column : "ch_name", order: "ASC" },
            "employees": { column : "name", order: "ASC" },
            "pricing_conditions": { column : "product", order: "ASC" },
            "pricing_rules": { column : "price_per_unit", order: "DESC" },
            "transactions": { column : "transaction_date", order: "DESC" }
        }
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
    samePasswordIndicator: 'SameAsOld0517!',

    // arbitrary order displayed to users on filtering elements
    arbitraryAttributeOrder:{
        "clients": ["id", "full_name", "phone", "qq_contact", "wechat_contact", "email", "company"],
        "companies": ['id', "full_name", "phone", "email"],
        "employees": ["id", "name", "phone", "wechat_contact", "qq_contact", "position", "email"],
        "materials": ["id", "ch_name", "en_name"],
        "positions": ["id", "name"],
        "pricing_conditions": ["id", "product", "quantity", "materials", "size", "client", "company", "colour"],
        "pricing_rules": ["id", "price_per_unit"],
        "products": ["id", "ch_name", "en_name"],
        "transactions": ["id", "name", "status", "transaction_date", "product", "materials", "client", "company", "quantity", "price_per_unit", "amount", "colour", "size", "length", "width", "height", "employee", "modified_date", "creation_date", "note"]
    },
    // dedfault displaying columns on table styling
    /*
        - target: mapped to id & name (full_name, ch_name, en_nane) & icon
        - name: mapped to ch_name & en_name
        - dimension: will be mapped & rendered with all dimensions (units, length, width, height)
    */
    defaultListings:{
        "clients": ["target", "phone", "wechat_contact", "qq_contact", "company", "email"],
        "companies": ["target", "phone", "email"],
        "employees": ["target", "phone", "wechat_contact", "qq_contact", "position", "email"],
        "materials": ["target", "descriptions"],
        "positions": ["target", "descriptions"],
        "pricing_conditions": ["id", "product", "category", "conditions"],
        "pricing_rules": ["id", "price_per_unit", "listed_conditions"],
        "products": ["target", "descriptions"],
        "transactions": ["transaction details", "transaction_date", "product & materials", "quantity", "price_per_unit", "amount", "dimension", "colour", "employee", "note"]
    },

    // categorical choices
    multipleOptions:{
        "status": ['created', 'quoted', 'paid'],
        "address-type": ['home', 'work', 'other'],
    },
    optionsColouring:{
        "status":{
            "created": "danger",
            "quoted": "success",
            "paid": "dark"
        },
        "position":{
            "Assembler": "primary",
            "Designer": "warning",
            "Installer": "info",
        },
        "conditions":{
            "general": "primary",
            "individual": "info",
        }
    },
    units:{
        "defaultSize": "m²",
        "defaultDiemsion": "mm",
        "diemsion": ["mm","cm","m"],
        "size": ["mm²","cm²","m²"],
    }
}

module.exports = { config };