function getIcon(target) {
    switch (target) {

        // table attributes icons
        case "id":
            return "fa-solid fa-hashtag";
        case "client":
        case "clients":
            return "fa-solid fa-user-tie";
        case "company":
        case "companies":
            return "fa-solid fa-city";

        case "full_name":
        case "name":
        case "ch_name":
        case "en_name":
            return "fa-solid fa-signature";

        case "phone":
            return "fa-solid fa-phone";
        case "qq_contact":
            return "fa-brands fa-qq";
        case "wechat_contact":
            return "fa-brands fa-weixin";
        case "position":
        case "positions":
            return "fa-solid fa-address-card";
        
        case "color":
        case "colour":
            return "fa-solid fa-palette";

        case "materials":
        case "material":
            return "fa-solid fa-layer-group";
        case "product":
        case "products":
            return "fa-solid fa-scroll";

        case "quantity":
            return "fa-solid fa-calculator";
        case "size":
            return "fa-solid fa-expand";
        case "price_per_unit":
            return "fa-solid fa-coins";
        case "amount":
        case "account":
        case "transactions":
        case "transaction":
            return "fa-solid fa-money-bill-wave";
            
        case "creation_date":
            return "fa-solid fa-clock-rotate-left";
        case "modified_date":
            return "fa-solid fa-clock";
        case "transaction_date":
            return "fa-solid fa-calendar-check";

        case "employee":
        case "employees":
            return "fa-solid fa-user-gear";
        case "height":
            return "fa-solid fa-ruler-vertical";
        case "length":
            return "fa-solid fa-ruler-horizontal";
        case "width":
            return "fa-solid fa-ruler-combined";
        case "note":
            return "fa-solid fa-note-sticky";
        case "status":
            return "fa-solid fa-feather-pointed";
        case "address":
        case "addresses":
            return "fa-solid fa-location-dot";
        case "postal":
            return "fa-solid fa-location-arrow";
        case "unit":
            return "fa-brands fa-unity";

        // user management
        case "email":
            return "fa-solid fa-envelope-open-text";
        case "role":
            return "fa-solid fa-shield-halved";
        case "username":
            return "fa-solid fa-user-tag";
        case "password":
            return 'fa-solid fa-unlock-keyhole';
        case "language":
            return "fa-solid fa-language";
        case "locale":
            return "fa-solid fa-earth-asia";
        case "setting menu":
            return "fa-solid fa-sliders";

        // tables
        case "rules":
        case "rule":
        case "pricing_rules":
            return "fa-solid fa-tags";
        case "conditions":
        case "condition":
        case "pricing_conditions":
            return "fa-solid fa-pen-ruler";

        // stats:
        case "periodic increase":
            return "fa-solid fa-arrow-up";
        case "periodic decrease":
            return "fa fa-arrow-down";
        case "trend up":
            return "fa-solid fa-arrow-trend-up";
        case "trend down":
            return "fa-solid fa-arrow-trend-down";
        case "chart distribution":
            return "fa-solid fa-chart-simple";
        case "calendar":
            return "fa-solid fa-calendar-days";
        case "between":
            return "fa-solid fa-arrow-right-arrow-left";

        // routes:
        case "home":
            return "fa fa-home";
        case "sign out":
            return "fa fa-sign-out";
        case "menu":
            return "fa fa-bars";
        case "settings":
            return "fa fa-cog";
        case "resources":
            return "fa fa-file-text";
        case "info":
            return "fa fa-info-circle";
        case "us":
            return "fa fa-handshake-o";
        case "code":
            return "fa fa-code";
        case "sign up":
            return "fas fa-user-circle";
        case "privacy":
            return "fa-solid fa-shield-halved";
        
        // controls:
        case "search":
            return "fa-solid fa-magnifying-glass";
        case "down arrow":
            return "fa-solid fa-caret-down";
        case "create transaction":
            return "fa-solid fa-cart-plus";
        case "quote transactions":
            return "fa-solid fa-tags";
        case "view and extract":
            return "fa-solid fa-eye";
        case "search enter":
            return "fa-solid fa-arrow-turn-down";
        case "add":
            return "fa-solid fa-plus";
        case "cancel":
        case "close":
            return "fa-solid fa-xmark";
        case "delete":
            return "fa-solid fa-trash-can";
        case "switch":
            return "fa-solid fa-repeat";
        case "tick":
            return "fa-solid fa-check";
        default:
            return "fa-solid fa-circle-info";
    }
}

module.exports = { getIcon };