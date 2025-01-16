import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { Router } from '@vaadin/router';
import '@vaadin/text-field';
import '@vaadin/email-field';
import '@vaadin/date-picker';
import '@vaadin/select';
import '@vaadin/button';
import '@vaadin/grid';

interface UserData {
  userId: string | null;
  userEmail: string | null;

}

interface FormFieldConfig {
  type: string;
  name: string;
  label: string;
  value: string;
  options?: Array<{ label: string; value: string }>;
}


interface EmployeeRecord {
  emp_id: number;
  name: string;
  email: string;
  address: string;
  dob: string;
  designation: string;
}

@customElement('welcome-page')
export class WelcomePage extends LitElement {

  static styles = css`
  :host {
    background-color:#fab6b6;
    display: block;
    font-family: system-ui, -apple-system, sans-serif;
    --navbar-height: 80px;
  }

  .preloader {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.3s ease-out;
  }

  .preloader.fade-out {
    opacity: 0;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
    
  .navbar {
    background-color: white;
    padding: 1rem 2rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border-bottom: 1px solid #e5e7eb;
    z-index: 1000;
    height: var(--navbar-height);
    box-sizing: border-box;
  }

  .navbar-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .avatar {
    width: 40px;
    height: 40px;
    background-color: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1.125rem;
  }

  .user-details {
    display: flex;
    flex-direction: column;
  }

  .user-name {
    font-weight: 600;
    color: #1f2937;
    font-size: 1.125rem;
  }

  .user-email {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .sign-out-btn {
    padding: 0.8rem 1.2rem;
    background-color: #fee2e2;
    color: #dc2626;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    font-weight: 1000;
    font-size:16px;
    transition: background-color 0.2s;
  }

  .sign-out-btn:hover {
    background-color: #fecaca;
  }

  .welcome-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 2rem;
    text-align: center;
  }

  .content-wrapper {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .form-container {
    width: 30%;
    background-color: white;
    padding: 1.5rem;
    border: 1px solid black;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    height: fit-content;
  }

  .grid-container {
    width: 70%;
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    border: 1px solid black;
    overflow: auto;
  }

  .form-grid {
    display: grid;
    gap: 1rem;
  }

  h2 {
    color: #1f2937;
    margin-bottom: 1.5rem;
    font-size: 1.50rem;
    text-align: center;
  }
`;

  @property({ type: Boolean }) loading: boolean = true;
  @state() private showPreloader: boolean = true;
  @property({ type: Object })
  private userData: UserData = {
    userId: null,
    userEmail: null,
  };
  @property({ type: Array })
  private employees: EmployeeRecord[] = [];
  @state()
  private editingUser: EmployeeRecord | null = null;
  @state()
  private EmpFormData = {
    name: '',
    email: '',
    address: '',
    dob: '',
    designation: ''
  };
  @state()
  private name = {};
  // private designationOptions = [
  //   { label: 'HR', value: 'HR' },
  //   { label: 'Developer', value: 'Developer' },
  //   { label: 'Admin', value: 'Admin' }
  // ];

  private formFields: FormFieldConfig[] = [
    {
      type: 'text',
      name: 'name',
      label: 'Name',
      value: ''
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email',
      value: ''
    },
    {
      type: 'text',
      name: 'address',
      label: 'Address',
      value: ''
    },
    {
      type: 'date',
      name: 'dob',
      label: 'Date of Birth',
      value: ''
    },
    
    {
      type: 'select',
      name: 'designation',
      label: 'Designation',
      value: '',
      options: [
        { label: 'HR', value: 'HR' },
        { label: 'Developer', value: 'Developer' },
        { label: 'Admin', value: 'Admin' }
      ]
    }
  ];

  connectedCallback() {
    super.connectedCallback();
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.userData = {
          userId: user.uid,
          userEmail: user.email,
        };
        this.showPreloader = true;
        const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/getusername', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              userid: this.userData.userId
            }
          }),
        });
        console.log("Userid=", this.userData.userId)
        const result = await response.json();
        console.log(result);
        await this.getEmployeeDetails();
        if (result.result && result.result.userName) {
          this.name = result.result.userName;
        }
        setTimeout(() => {
          const preloader = this.shadowRoot?.querySelector('.preloader');
          if (preloader) {
            preloader.classList.add('fade-out');
            setTimeout(() => {
              this.showPreloader = false;
            }, 300);
          }
        }, 1000);

      } else {
        Router.go('/login');
      }

    });
  }

  private getUserInitials(): string {
    if (!this.userData.userEmail) return 'U';
    return this.userData.userEmail
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }

  private async handleSignOut() {
    const auth = getAuth();
    try {
      await signOut(auth);
      Router.go('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  private updateEmpFormData(field: string, value: string) {
    this.EmpFormData = {
      ...this.EmpFormData,
      [field]: value
    };
  }

  private async handleSubmit() {
    if (this.editingUser) {

      await this.UpdateEmployee(this.editingUser);
      this.editingUser = null;

    } else {

      await this.addEmployee();
    }
  }

  private resetForm() {
    this.EmpFormData = {
      name: '',
      email: '',
      address: '',
      dob: '',
      designation: ''
    };
  }

  private async addEmployee() {
    console.log('Sending request body:', {
      userid: this.userData.userId,
      name: this.EmpFormData.name,
      email: this.EmpFormData.email,
      dob: this.EmpFormData.dob,
      designation: this.EmpFormData.designation,
      address: this.EmpFormData.address,
    });
    const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/addemployee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          userid: this.userData.userId,
          name: this.EmpFormData.name,
          email: this.EmpFormData.email,
          dob: this.EmpFormData.dob,
          designation: this.EmpFormData.designation,
          address: this.EmpFormData.address
        }
      }),
    });
    if (response.ok) {
      const newEmployee = await response.json();
      this.employees = [...this.employees, newEmployee];
      console.log('Employee data:', this.employees);
      this.resetForm();
      alert('Employee added successfully');
      await this.getEmployeeDetails();
    } else {
      throw new Error('Failed to add employee');
    }
  }

  private async getEmployeeDetails() {
    if (!this.userData.userId) {
      console.log('No userId available yet');
      return;
    }
    const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/getemployeedetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          userid: this.userData.userId
        }
      }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(' API response:', data.result.result);
      this.employees = data.result.result.map((employee: any) => ({
        emp_id: employee.emp_id,
        name: employee.emp_name,
        email: employee.emp_email,
        address: employee.emp_address,
        dob: employee.emp_dob,
        designation: employee.emp_designation,
      }));
    } else {
      throw new Error('Failed to fetch employee details');
    }

  }

  private async EditEmployee(user: EmployeeRecord) {
    this.editingUser = user;
    this.EmpFormData = {
      name: user.name,
      email: user.email,
      address: user.address,
      dob: user.dob,
      designation: user.designation
    };
  }

  private async UpdateEmployee(user: EmployeeRecord) {
    const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/update_employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          emp_id: user.emp_id,
          userid: this.userData.userId,
          name: this.EmpFormData.name,
          email: this.EmpFormData.email,
          address: this.EmpFormData.address,
          dob: this.EmpFormData.dob,
          designation: this.EmpFormData.designation
        }
      }),
    });
    const result = await response.json();
    console.log(result);
    if (result) {
      console.log('Employee data updated successfully');
      await this.getEmployeeDetails();
      this.resetForm();
    } else {
      console.warn('Employee data update unsuccessful:', result);

    }

  };

  private async DeleteEmployee(emp_id: number) {
    const response = await fetch('http://127.0.0.1:5001/login-signup-88bbc/us-central1/delete_employee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          emp_id: emp_id,
        }
      }),
    });
    if (response.ok) {
      alert("Employee was deleted successfully");
      await this.getEmployeeDetails();
    }
  }

  private renderFormField(field: FormFieldConfig) {
    switch (field.type) {
      case 'text':
        return html`
          <vaadin-text-field
            label=${field.label}
            .value=${this.EmpFormData[field.name as keyof typeof this.EmpFormData]}
            @value-changed=${(e: CustomEvent) => this.updateEmpFormData(field.name, e.detail.value)}
          ></vaadin-text-field>
        `;

      case 'email':
        return html`
          <vaadin-email-field
            label=${field.label}
            .value=${this.EmpFormData[field.name as keyof typeof this.EmpFormData]}
            @value-changed=${(e: CustomEvent) => this.updateEmpFormData(field.name, e.detail.value)}
          ></vaadin-email-field>
        `;

      case 'date':
        return html`
          <vaadin-date-picker
            label=${field.label}
            .value=${this.EmpFormData[field.name as keyof typeof this.EmpFormData]}
            @value-changed=${(e: CustomEvent) => this.updateEmpFormData(field.name, e.detail.value)}
          ></vaadin-date-picker>
        `;

      case 'select':
        return html`
          <vaadin-select
            label=${field.label}
            .value=${this.EmpFormData[field.name as keyof typeof this.EmpFormData]}
            .items=${field.options}
            @value-changed=${(e: CustomEvent) => this.updateEmpFormData(field.name, e.detail.value)}
          ></vaadin-select>
        `;

      default:
        return html`<div>Unsupported field type: ${field.type}</div>`;
    }
  }

  render() {
    return html`
    ${this.showPreloader ? html`
      <div class="preloader">
        <div class="spinner"></div>
      </div>
    ` : ''}
      <nav class="navbar">
        <div class="navbar-content">
          <div class="user-info">
            <div class="avatar">
              ${this.getUserInitials()}
            </div>
            <div class="user-details">
              <span class="user-name">${this.name}</span>
              <span class="user-email">${this.userData.userEmail}</span>
            </div>
          </div>
          <button 
            @click=${this.handleSignOut}
            class="sign-out-btn"
          >
            Sign Out
          </button>
        </div>
      </nav>
     <div class="welcome-section">
        <h1 class="welcome-title">Welcome back, ${this.name} 👋</h1>
        <div class="content-wrapper">
          <div class="form-container">
            <h2>${this.editingUser ? 'Edit User' : 'Add Your Employee data'}</h2>
            <div class="form-grid">
              ${this.formFields.map(field => this.renderFormField(field))}
              <vaadin-button
                theme="primary"
                @click=${this.handleSubmit}
              >
                ${this.editingUser ? 'Update Employee' : 'Add Employee'}
              </vaadin-button>
            </div>
          </div>
          <div class="grid-container">
            <h2>Employee List</h2>
          <vaadin-grid .items=${this.employees}>
            <vaadin-grid-column path="name" header="Name"></vaadin-grid-column>
            <vaadin-grid-column path="email" header="Email"></vaadin-grid-column>
            <vaadin-grid-column path="address" header="Address"></vaadin-grid-column>
            <vaadin-grid-column path="dob" header="Date of Birth"></vaadin-grid-column>
            <vaadin-grid-column path="designation" header="Designation"></vaadin-grid-column>
            <vaadin-grid-column
              header="Actions"
              .renderer=${(root: HTMLElement, _: HTMLElement, rowData: { item: EmployeeRecord }) => {
        root.innerHTML = `
                  <vaadin-button theme="secondary" style="background-color:#b3d1ff" data-action="edit">Edit</vaadin-button>
                  <vaadin-button theme="error" style="background-color:#ffb3b3" data-action="delete">Delete</vaadin-button>
                `;
        const editButton = root.querySelector('[data-action="edit"]');
        const deleteButton = root.querySelector('[data-action="delete"]');
        editButton?.addEventListener('click', () => this.EditEmployee(rowData.item));
        deleteButton?.addEventListener('click', () => this.DeleteEmployee(rowData.item.emp_id));
      }}
            ></vaadin-grid-column>
          </vaadin-grid>
        </div>
        </div>
    `;
  }
}