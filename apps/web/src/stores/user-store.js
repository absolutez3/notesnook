import createStore from "../common/store";
import { db } from "../common/db";
import { store as appStore } from "./app-store";
import BaseStore from "./index";
import config from "../utils/config";
import { EV, EVENTS } from "notes-core/common";
import { showAccountLoggedOutNotice } from "../common/dialog-controller";
import Config from "../utils/config";
import { onPageVisibilityChanged } from "../utils/page-visibility";
import { hashNavigate } from "../navigation";

class UserStore extends BaseStore {
  isLoggedIn = false;
  isLoggingIn = false;
  isSigningIn = false;
  user = undefined;

  init = () => {
    EV.subscribe(EVENTS.appRefreshRequested, () => appStore.refresh());

    EV.subscribe(EVENTS.userSessionExpired, async () => {
      Config.set("sessionExpired", true);
      window.location.replace("/sessionexpired");
    });

    db.user.getUser().then(async (user) => {
      if (!user) return false;
      this.set((state) => {
        state.user = user;
        state.isLoggedIn = true;
      });
      if (Config.get("sessionExpired")) EV.publish(EVENTS.userSessionExpired);
    });

    if (Config.get("sessionExpired")) return;

    return db.user.fetchUser().then(async (user) => {
      if (!user) return false;

      EV.remove(
        EVENTS.userSubscriptionUpdated,
        EVENTS.userEmailConfirmed,
        EVENTS.databaseSyncRequested
      );

      this.set((state) => {
        state.user = user;
        state.isLoggedIn = true;
      });

      EV.subscribe(EVENTS.userSubscriptionUpdated, (subscription) => {
        this.set((state) => (state.user.subscription = subscription));
      });

      EV.subscribe(EVENTS.userEmailConfirmed, () => {
        hashNavigate("/confirmed");
      });

      EV.subscribe(EVENTS.databaseSyncRequested, async () => {
        await appStore.sync(false);
      });

      EV.subscribe(EVENTS.userLoggedOut, async (reason) => {
        this.set((state) => {
          state.user = {};
          state.isLoggedIn = false;
        });
        config.clear();
        await appStore.refresh();

        if (!!reason) {
          await showAccountLoggedOutNotice(reason);
        }
      });

      onPageVisibilityChanged(async (documentHidden) => {
        if (!documentHidden) {
          await db.connectSSE();
        }
      });
      return true;
    });
  };

  login = (form, skipInit = false) => {
    this.set((state) => (state.isLoggingIn = true));
    return db.user
      .login(form.email.toLowerCase(), form.password)
      .then(() => {
        if (skipInit) return true;
        return this.init();
      })
      .finally(() => {
        this.set((state) => (state.isLoggingIn = false));
      });
  };

  signup = (form) => {
    this.set((state) => (state.isSigningIn = true));
    return db.user
      .signup(form.email.toLowerCase(), form.password)
      .then(() => {
        return this.init();
      })
      .finally(() => {
        this.set((state) => (state.isSigningIn = false));
      });
  };
}

/**
 * @type {[import("zustand").UseStore<UserStore>, UserStore]}
 */
const [useStore, store] = createStore(UserStore);
export { useStore, store };