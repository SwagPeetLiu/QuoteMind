import { createRouter, createWebHistory } from "vue-router";
import store from "../store";
import Dashboard from "@/views/Dashboard.vue";

// Company Resources
import test from "@/views/resources/test.vue";
import Employees from "@/views/resources/Employees.vue";
import Materials from "@/views/resources/Materials.vue";
import Positions from "@/views/resources/Positions.vue";
import Products from "@/views/resources/Products.vue";

// clients:
import Clients from "@/views/customers/Clients.vue";
import Companies from "@/views/customers/Companies.vue";

// pricings & transactions
import Transactions from "@/views/Transactions.vue";
import Billing from "@/views/customers/Billing.vue";
import Pricing_Conditions from "@/views/pricings/Pricing_Conditions.vue";
import Pricing_Rules from "@/views/pricings/Pricing_Rules.vue";

// user based views
import Profile from "@/views/Profile.vue";
import SignIn from "@/views/SignIn.vue";
import SignUp from "@/views/SignUp.vue";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard",
    meta: { requiresAuth: true, mainLink: "Dashboard", subLink: "" }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, mainLink: "Dashboard", subLink: "" }
  },

  // Comapny resources:
  {
    path: "/resources/",
    name: "Resources",
    component: test,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Test" }
  },
  {
    path: "/resources/test",
    name: "Test",
    component: test,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Test" }
  },
  {
    path: "/resources/products",
    name: "Products",
    component: Products,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Products" }
  },
  {
    path: "/resources/materials",
    name: "Materials",
    component: Materials,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Materials" }
  },
  {
    path: "/resources/employees",
    name: "Employees",
    component: Employees,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Employees" }
  },
  {
    path: "/resources/positions",
    name: "Positions",
    component: Positions,
    meta: { requiresAuth: true, mainLink: "Resources", subLink: "Positions" }
  },

  // Customers:
  {
    path: "/customers/",
    name: "Customers",
    component: Companies,
    meta: { requiresAuth: true, mainLink: "Customers", subLink: "Companies" }
  },
  {
    path: "/customers/companies",
    name: "Companies",
    component: Companies,
    meta: { requiresAuth: true, mainLink: "Customers", subLink: "Companies" }
  },
  {
    path: "/customers/clients",
    name: "Clients",
    component: Clients,
    meta: { requiresAuth: true, mainLink: "Customers", subLink: "Clients" }
  },
  {
    path: "/customers/billing",
    name: "Billings",
    component: Billing,
    meta: { requiresAuth: true, mainLink: "Customers", subLink: "Billings" }
  },

  // pricing routes:
  {
    path: "/pricings",
    name: "Pricings",
    component: Pricing_Rules,
    meta: { requiresAuth: true, mainLink: "Pricings", subLink: "Pricing_Rules" }
  },
  {
    path: "/pricings/pricing_rules",
    name: "Pricing_Rules",
    component: Pricing_Rules,
    meta: { requiresAuth: true, mainLink: "Pricings", subLink: "Pricing_Rules" }
  },
  {
    path: "/pricings/pricing_conditions",
    name: "Pricing_Conditions",
    component: Pricing_Conditions,
    meta: { requiresAuth: true, mainLink: "Pricings", subLink: "Pricing_Conditions" }
  },

  // Transactions:
  {
    path: "/transactions",
    name: "Transactions",
    component: Transactions,
    meta: { requiresAuth: true, mainLink: "Transactions", subLink: "" }
  },

  // user informations
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: true, mainLink: "Profile", subLink: "" }
  },
  {
    path: "/sign-in",
    name: "Sign In",
    component: SignIn,
    meta: { requiresAuth: false, requiresLogout: true, mainLink: "Sign In", subLink: "" }
  },
  {
    path: "/sign-up",
    name: "Sign Up",
    component: SignUp,
    meta: { requiresAuth: false, requiresLogout: true, mainLink: "Sign Up", subLink: "" }
  },

  // TODO: add 404 page
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: SignIn, 
    meta: { requiresAuth: true, mainLink: "Sign In", subLink: ""}
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  linkActiveClass: "active", // adding css class tag of active once the route is active
});

// navigation guards:

router.beforeEach((to, from, next) => {
  const isAuthenticated = store.getters.getIsAuthenticated && store.getters.getUser.session;

  // if user is accessing routes that requires login, redirect accordingly:
  if (to.meta.requiresAuth && !isAuthenticated) {
    store.commit("setMenuAct", { ...store.state.menuAct, mainLink: "Sign In", subLink: "" });
    next({ name: "Sign In" });
  }
  // does not allow signing in again if already logged in
  else if (to.meta.requiresLogout && isAuthenticated) {
    store.commit("setMenuAct", { ...store.state.menuAct, mainLink: "Dashboard", subLink: "" });
    next({ name: "Dashboard" });
  }
  else {
    store.commit("setMenuAct", { ...store.state.menuAct, mainLink: to.meta.mainLink, subLink: to.meta.subLink });
    next();
  }
});

export default router;
