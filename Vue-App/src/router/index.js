import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Tables from "@/views/Tables.vue";
import Billing from "@/views/Billing.vue";
import Profile from "@/views/Profile.vue";
import SignIn from "@/views/SignIn.vue";
import SignUp from "@/views/SignUp.vue";
import test from "@/views/test.vue";
import store from "../store";

const routes = [
  {
    path: "/",
    name: "/",
    redirect: "/dashboard",
    meta: { requiresAuth: false, mainLink: "Dashboard", subLink: "" }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: false, mainLink: "Dashboard", subLink: "" }
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { requiresAuth: false, mainLink: "Tables", subLink: "Tables" }
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { requiresAuth: false, mainLink: "Billing", subLink: ""}
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: false, mainLink: "Profile", subLink: "" }
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
  {
    path: "/Tables/test",
    name: "test",
    component: test,
    meta: { requiresAuth: false, mainLink: "Tables", subLink: "test"}
  },
  // {
  //   path: "/:catchAll(.*)",
  //   name: "NotFound",
  //   component: NotFound, // You'll need to create this component
  //   meta: { requiresAuth: false }
  // }
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
    store.commit("setMenuAct", { mainLink: "Sign In", subLink: "", ...store.state.menuAct});
    next({ name: "Sign In" });
  }
  // does not allow signing in again if already logged in
  else if (to.meta.requiresLogout && isAuthenticated){
    store.commit("setMenuAct", { mainLink: "Dashboard", subLink: "", ...store.state.menuAct});
    next({ name: "Dashboard" });
  }
  else{
    store.commit("setMenuAct", { mainLink: to.meta.mainLink, subLink: to.meta.subLink, ...store.state.menuAct});
    next();
  }
});

export default router;
