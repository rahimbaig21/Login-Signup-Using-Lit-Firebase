import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@vaadin/button';
import '@vaadin/text-field';
import '@vaadin/password-field';
import '@vaadin/form-layout';
import { getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import './firebase-config'; 
import './welcomepage';
import {Router} from '@vaadin/router';


@customElement('login-signup-form')
export class LoginSignupForm extends LitElement {
  static styles = css`
    :host {
      display: block;
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
     
    }
    
    .form-container {
      border: 1px solid #ccc;
      padding: 20px;
      border-radius: 8px;
      display;flex;
      margin-top: 150px;   
    }

    .toggle-buttons {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .form-buttons {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }

    h2 {
      font-size:40px;
      text-align: center;
      margin: 0 0 20px 0;
    }
  `;

  @state()
  private isLoginForm = true;

  @state()
  private formData = {
    name: '',
    email: '',
    password: ''
  };

  private auth = getAuth();

  private async handleSubmit(e: Event) {
    e.preventDefault();

    try {
      if (this.isLoginForm) {
        const userCredential = await signInWithEmailAndPassword(
          this.auth, 
          this.formData.email, 
          this.formData.password
        );

        console.log('User signed in:', userCredential.user);
        Router.go('/welcome');
      } else {
        const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/signupUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              name: this.formData.name,
              email: this.formData.email,
              password: this.formData.password
            }
          }),
          
        });
        
        
        const result = await response.json();
        console.log(result);
        if (response.ok) {
          console.log('User signed up:', result);
          await signInWithEmailAndPassword(
            this.auth,
            this.formData.email,
            this.formData.password
          );
          alert('Signup successful!');
          this.isLoginForm=true;
        } else {
          throw new Error('Signup failed');
        }
      }

      this.formData = {
        name: '',
        email: '',
        password: ''
      };
    } catch (e) {
      console.error('Error:', e);
      alert('An error occurred. Please try again.');
    }
}

  private handleInput(e: CustomEvent) {
    const target = e.target as HTMLInputElement;
    this.formData = {
      ...this.formData,
      [target.name]: target.value
    };
  }

  render() {
    return html`
      <div class="form-container">
        <div class="toggle-buttons">
          <vaadin-button
            theme="primary ${this.isLoginForm ? '' : 'outline'}"
            @click=${() => this.isLoginForm = true}
          >
            Login
          </vaadin-button>
          <vaadin-button
            theme="primary ${!this.isLoginForm ? '' : 'outline'}"
            @click=${() => this.isLoginForm = false}
          > Sign Up </vaadin-button>
        </div>
        <h2>${this.isLoginForm ? 'Login' : 'Sign Up'}</h2>
        <vaadin-form-layout>
          ${!this.isLoginForm ? html`
            <vaadin-text-field
              label="name"
              name="name"
              required
              .value=${this.formData.name}
              @input=${this.handleInput}
            ></vaadin-text-field>
          ` : ''}

          <vaadin-text-field
            label="Email"
            name="email"
            type="email"
            required
            .value=${this.formData.email}
            @input=${this.handleInput}
          ></vaadin-text-field>
          
          <vaadin-password-field
            label="Password"
            name="password"
            required
            .value=${this.formData.password}
            @input=${this.handleInput}
          ></vaadin-password-field>
        </vaadin-form-layout>

        <div class="form-buttons">
          <vaadin-button
            theme="primary"
            @click=${this.handleSubmit}
          >
            ${this.isLoginForm ? 'Login' : 'Sign Up'}
          </vaadin-button>
        </div>
      </div>
    `;
  }
}