// ── Workflow Definitions ──────────────────────────────────────────────────────
const WORKFLOWS = {

  REGISTRATION: {
    label: 'User Registration',
    totalSteps: 4,
    steps: [
      {
        title: 'Personal Information',
        subtitle: 'Tell us a bit about yourself',
        fields: [
          { id: 'firstName', label: 'First Name',   type: 'text', placeholder: 'John', required: true },
          { id: 'lastName',  label: 'Last Name',    type: 'text', placeholder: 'Doe',  required: true },
          { id: 'dob',       label: 'Date of Birth',type: 'date', required: true },
          { id: 'phone',     label: 'Phone Number', type: 'tel',  placeholder: '+91 9999999999' },
        ]
      },
      {
        title: 'Account Setup',
        subtitle: 'Choose your account credentials',
        fields: [
          { id: 'displayName', label: 'Display Name', type: 'text',     placeholder: 'How others see you', required: true },
          { id: 'bio',         label: 'Short Bio',    type: 'textarea', placeholder: 'Tell us a little about yourself...' },
          { id: 'website',     label: 'Website',      type: 'url',      placeholder: 'https://yoursite.com' },
        ]
      },
      {
        title: 'Preferences',
        subtitle: 'Customize your experience',
        fields: [
          { id: 'theme',         label: 'UI Theme',                 type: 'radio',    options: ['Light', 'Dark', 'System'] },
          { id: 'notifications', label: 'Notification Preferences', type: 'checkbox', options: ['Email updates', 'SMS alerts', 'Push notifications'] },
          { id: 'language',      label: 'Language',                 type: 'select',   options: ['English', 'Hindi', 'Spanish', 'French', 'German'] },
        ]
      },
      {
        title: 'Review & Confirm',
        subtitle: 'Check your details before submitting',
        fields: [
          { id: 'agree',      label: 'Agreements', type: 'checkbox', options: ['I agree to the Terms of Service', 'I accept the Privacy Policy'] },
          { id: 'newsletter', label: 'Newsletter',  type: 'radio',   options: ['Subscribe me', 'No thanks'] },
        ]
      }
    ]
  },

  SURVEY: {
    label: 'Feedback Survey',
    totalSteps: 4,
    steps: [
      {
        title: 'Overall Satisfaction',
        subtitle: 'Rate your overall experience with us',
        fields: [
          { id: 'overallRating', label: 'Overall Rating (1–10)', type: 'range', min: 1, max: 10, required: true },
          { id: 'recommend',     label: 'Would you recommend us?', type: 'radio', options: ['Definitely Yes', 'Probably Yes', 'Unsure', 'No'] },
        ]
      },
      {
        title: 'Product Feedback',
        subtitle: 'What do you think about our product?',
        fields: [
          { id: 'bestFeature',  label: 'Best Feature',          type: 'text',     placeholder: 'What did you love most?' },
          { id: 'improvement',  label: 'What could be improved?',type: 'textarea', placeholder: 'Your honest feedback...' },
          { id: 'features',     label: 'Features you use most', type: 'checkbox', options: ['Dashboard', 'Analytics', 'Integrations', 'Mobile App', 'API'] },
        ]
      },
      {
        title: 'Support Experience',
        subtitle: 'Tell us about our customer support',
        fields: [
          { id: 'supportRating',   label: 'Support Rating (1–10)',      type: 'range', min: 1, max: 10 },
          { id: 'supportChannel',  label: 'How did you contact support?',type: 'radio', options: ['Email', 'Live Chat', 'Phone', 'Community Forum', 'Never needed to'] },
          { id: 'supportFeedback', label: 'Any comments about support?', type: 'textarea', placeholder: 'Optional...' },
        ]
      },
      {
        title: 'About You',
        subtitle: 'Help us understand our users better',
        fields: [
          { id: 'role',        label: 'Your Role',    type: 'select', options: ['Developer', 'Designer', 'Manager', 'Student', 'Other'] },
          { id: 'companySize', label: 'Company Size', type: 'radio',  options: ['1–10', '11–50', '51–200', '200+'] },
          { id: 'extra',       label: 'Anything else?',type: 'textarea', placeholder: 'Free text...' },
        ]
      }
    ]
  },

  ONBOARDING: {
    label: 'Employee Onboarding',
    totalSteps: 4,
    steps: [
      {
        title: 'Welcome',
        subtitle: 'Fill in your employment details',
        fields: [
          { id: 'employeeId', label: 'Employee ID',       type: 'text',   placeholder: 'EMP-0001', required: true },
          { id: 'department', label: 'Department',        type: 'select', options: ['Engineering', 'Design', 'HR', 'Finance', 'Marketing', 'Sales'] },
          { id: 'startDate',  label: 'Start Date',        type: 'date',   required: true },
          { id: 'manager',    label: 'Reporting Manager', type: 'text',   placeholder: 'Manager name' },
        ]
      },
      {
        title: 'Equipment Setup',
        subtitle: 'What equipment do you need?',
        fields: [
          { id: 'laptop',      label: 'Laptop Preference',   type: 'radio',    options: ['MacBook Pro', 'MacBook Air', 'Dell XPS', 'ThinkPad'] },
          { id: 'peripherals', label: 'Peripherals',         type: 'checkbox', options: ['External Monitor', 'Keyboard', 'Mouse', 'Headset', 'Webcam'] },
          { id: 'specialReq',  label: 'Special Requirements',type: 'textarea', placeholder: 'Accessibility needs, standing desk, etc.' },
        ]
      },
      {
        title: 'System Access',
        subtitle: 'Which systems do you need access to?',
        fields: [
          { id: 'tools',            label: 'Tools & Platforms',          type: 'checkbox', options: ['Slack', 'Jira', 'GitHub', 'Confluence', 'Google Workspace', 'AWS Console', 'Figma'] },
          { id: 'vpn',              label: 'VPN Required?',              type: 'radio',    options: ['Yes', 'No'] },
          { id: 'securityTraining', label: 'Security Training Completed?',type: 'radio',   options: ['Yes', 'Scheduled', 'Not yet'] },
        ]
      },
      {
        title: 'Final Confirmation',
        subtitle: 'Review and submit your onboarding form',
        fields: [
          { id: 'emergencyContact', label: 'Emergency Contact Name',  type: 'text', placeholder: 'Full name' },
          { id: 'emergencyPhone',   label: 'Emergency Contact Phone', type: 'tel',  placeholder: '+91 9999999999' },
          { id: 'policies', label: 'Policy Acknowledgements', type: 'checkbox',
            options: ['I have read the Employee Handbook', 'I agree to the Code of Conduct', 'I accept IT Security Policy'] },
        ]
      }
    ]
  },

  CHECKOUT: {
    label: 'Checkout Process',
    totalSteps: 4,
    steps: [
      {
        title: 'Cart Review',
        subtitle: "Confirm what you're ordering",
        fields: [
          { id: 'promoCode', label: 'Promo Code (optional)', type: 'text',     placeholder: 'SAVE10' },
          { id: 'giftWrap',  label: 'Gift Wrapping?',        type: 'radio',    options: ['Yes (+₹99)', 'No'] },
          { id: 'notes',     label: 'Order Notes',           type: 'textarea', placeholder: 'Any special instructions...' },
        ]
      },
      {
        title: 'Shipping Address',
        subtitle: 'Where should we deliver?',
        fields: [
          { id: 'street',  label: 'Street Address', type: 'text', placeholder: '123 Main Street', required: true },
          { id: 'city',    label: 'City',           type: 'text', placeholder: 'New Delhi', required: true },
          { id: 'state',   label: 'State',          type: 'text', placeholder: 'Delhi', required: true },
          { id: 'pincode', label: 'PIN Code',       type: 'text', placeholder: '110001', required: true },
        ]
      },
      {
        title: 'Payment Method',
        subtitle: "Choose how you'd like to pay",
        fields: [
          { id: 'paymentMethod', label: 'Payment Method', type: 'radio', options: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Cash on Delivery'] },
          { id: 'savePayment',   label: 'Save for future?',type: 'radio', options: ['Yes', 'No'] },
        ]
      },
      {
        title: 'Order Confirmation',
        subtitle: 'Review your order one final time',
        fields: [
          { id: 'deliverySpeed', label: 'Delivery Speed', type: 'radio',
            options: ['Standard (5–7 days)', 'Express (2–3 days, +₹149)', 'Same Day (+₹299)'] },
          { id: 'confirmTerms', label: 'Confirmation', type: 'checkbox',
            options: ['I confirm the order details are correct', 'I agree to return & refund policy'] },
        ]
      }
    ]
  }
};

// ── Render step fields ────────────────────────────────────────────────────────
function renderStepFields(stepDef, savedData = {}) {
  return stepDef.fields.map(field => {
    const val = savedData[field.id];
    let input = '';

    switch (field.type) {
      case 'textarea':
        input = `<textarea id="f_${field.id}" placeholder="${field.placeholder || ''}">${val || ''}</textarea>`;
        break;

      case 'select':
        input = `<select id="f_${field.id}">
          ${field.options.map(o => `<option value="${o}"${val === o ? ' selected' : ''}>${o}</option>`).join('')}
        </select>`;
        break;

      case 'radio':
        // FIX: radio + label in same flex row, label text LEFT
        input = `<div class="radio-group">
          ${field.options.map(o => `
            <label class="radio-option">
              <input type="radio" name="${field.id}" value="${o}"${val === o ? ' checked' : ''} />
              <span class="option-label">${o}</span>
            </label>`).join('')}
        </div>`;
        break;

      case 'checkbox': {
        const vals = Array.isArray(val) ? val : [];
        input = `<div class="checkbox-group">
          ${field.options.map(o => `
            <label class="checkbox-option">
              <input type="checkbox" name="${field.id}" value="${o}"${vals.includes(o) ? ' checked' : ''} />
              <span class="option-label">${o}</span>
            </label>`).join('')}
        </div>`;
        break;
      }

      case 'range':
        input = `<div class="range-wrap">
          <input type="range" id="f_${field.id}" min="${field.min||1}" max="${field.max||10}"
            value="${val || field.min || 1}"
            oninput="document.getElementById('rv_${field.id}').textContent = this.value" />
          <span class="range-val" id="rv_${field.id}">${val || field.min || 1}</span>
        </div>`;
        break;

      default:
        input = `<input type="${field.type}" id="f_${field.id}"
          placeholder="${field.placeholder || ''}"
          value="${val || ''}"
          ${field.required ? 'required' : ''} />`;
    }

    return `<div class="field">
      <label>${field.label}${field.required ? ' <span style="color:#dc2626">*</span>' : ''}</label>
      ${input}
    </div>`;
  }).join('');
}

// ── Collect step field values ─────────────────────────────────────────────────
function collectStepData(stepDef) {
  const data = {};
  stepDef.fields.forEach(field => {
    if (field.type === 'radio') {
      const el = document.querySelector(`input[name="${field.id}"]:checked`);
      data[field.id] = el ? el.value : null;
    } else if (field.type === 'checkbox') {
      const els = document.querySelectorAll(`input[name="${field.id}"]:checked`);
      data[field.id] = Array.from(els).map(e => e.value);
    } else if (field.type === 'range') {
      const el = document.getElementById(`f_${field.id}`);
      data[field.id] = el ? parseInt(el.value) : null;
    } else {
      const el = document.getElementById(`f_${field.id}`);
      data[field.id] = el ? el.value : null;
    }
  });
  return data;
}
