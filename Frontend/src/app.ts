import { Router } from '@vaadin/router';
import './login-signup';
import './welcomepage';
// import { getAuth, onAuthStateChanged } from "firebase/auth";

class MyApp {
  constructor() {
    this.initializeRouter();
  }

  private initializeRouter() {
    const outlet = document.querySelector('#outlet'); // The router outlet container in `index.html`
    if (!outlet) {
      throw new Error('Router outlet not found. ');
    }

    const router = new Router(document.getElementById('outlet'));
    router.setRoutes([
      { path: '/', component: 'login-signup-form' },
      { path: '/welcome', component: 'welcome-page' }
    ]);

  }
}
new MyApp();




