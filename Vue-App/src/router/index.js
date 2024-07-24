import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/Dashboard.vue";
import Tables from "@/views/Tables.vue";
import Billing from "@/views/Billing.vue";
import VirtualReality from "@/views/VirtualReality.vue";
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
    meta: { requiresAuth: false }
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: false }
  },
  {
    path: "/tables",
    name: "Tables",
    component: Tables,
    meta: { requiresAuth: false }
  },
  {
    path: "/billing",
    name: "Billing",
    component: Billing,
    meta: { requiresAuth: false }
  },
  {
    path: "/virtual-reality",
    name: "Virtual Reality",
    component: VirtualReality,
    meta: { requiresAuth: false }
  },
  {
    path: "/profile",
    name: "Profile",
    component: Profile,
    meta: { requiresAuth: false }
  },
  {
    path: "/sign-in",
    name: "Sign In",
    component: SignIn,
    meta: { requiresAuth: false, requiresLogout: true }
  },
  {
    path: "/sign-up",
    name: "Sign Up",
    component: SignUp,
    meta: { requiresAuth: false, requiresLogout: true }
  },
  {
    path: "/test",
    name: "test",
    component: test,
    meta: { requiresAuth: false }
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
    next({ name: "Sign In" });
  }
  // does not allow signing in again if already logged in
  else if (to.meta.requiresLogout && isAuthenticated){
    next({ name: "Dashboard" });
  }
  else{
    next();
  }
});

export default router;
