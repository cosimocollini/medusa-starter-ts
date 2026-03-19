import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the registration page with an accessible form (WCAG).
 */
export const renderRegister = async () => {
  const html = `
    <div class="auth-container">
      <h1 id="register-heading">${t('auth.register_title')}</h1>
      
      <form id="register-form" class="auth-form" aria-labelledby="register-heading">
        <div class="form-grid">
          <div class="form-group half">
            <label for="first_name">${t('auth.first_name')}</label>
            <input type="text" id="first_name" name="first_name" required autocomplete="given-name" />
          </div>
          
          <div class="form-group half">
            <label for="last_name">${t('auth.last_name')}</label>
            <input type="text" id="last_name" name="last_name" required autocomplete="family-name" />
          </div>
          
          <div class="form-group">
            <label for="email">${t('auth.email')}</label>
            <input type="email" id="email" name="email" required autocomplete="email" />
          </div>
          
          <div class="form-group">
            <label for="password">${t('auth.password')}</label>
            <input type="password" id="password" name="password" required autocomplete="new-password" minlength="8" />
          </div>
        </div>
        
        <div id="register-error" class="error-box" role="alert" aria-live="polite"></div>
        
        <button type="submit" class="submit-btn primary-btn">
          ${t('auth.register_title')}
        </button>
      </form>
      
      <div class="auth-footer">
        <a href="/login" data-link>${t('auth.already_have_account')}</a>
      </div>
    </div>
  `;

  return { html, title: `${t('auth.register_title')} | Medusa Store` };
};

/**
 * Handles the registration form logic.
 */
export const initRegister = () => {
  const form = document.getElementById('register-form') as HTMLFormElement;
  const errorBox = document.getElementById('register-error');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    const submitBtn = form.querySelector('.submit-btn') as HTMLButtonElement;
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t('common.loading');
      if (errorBox) errorBox.textContent = '';

      await authStore.register(data);
      navigate('/account');
    } catch (error) {
      if (errorBox) errorBox.textContent = t('auth.register_failed');
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.register_title');
    }
  });
};
