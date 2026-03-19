import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the login page template with accessible form.
 * Follows WCAG guidelines for form accessibility.
 */
export const renderLogin = async () => {
  const html = `
    <div class="login-container">
      <h1 id="login-heading">${t('common.login')}</h1>
      
      <form id="login-form" class="auth-form" aria-labelledby="login-heading">
        <div class="form-group">
          <label for="email">${t('auth.email')}</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            autocomplete="email"
            aria-required="true"
          />
        </div>
        
        <div class="form-group">
          <label for="password">${t('auth.password')}</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            required 
            autocomplete="current-password"
            aria-required="true"
          />
        </div>
        
        <div id="login-error" class="error-box" role="alert" aria-live="polite"></div>
        
        <button type="submit" class="submit-btn">
          ${t('auth.submit')}
        </button>
      </form>
      
      <div class="auth-footer">
        <a href="/register" data-link>${t('auth.no_account')}</a>
      </div>
    </div>
  `;

  return { html, title: `${t('common.login')} | Medusa Store` };
};

/**
 * Handle form submission logic.
 * Called after rendering.
 */
export const initLogin = () => {
  const form = document.getElementById('login-form') as HTMLFormElement;
  const errorBox = document.getElementById('login-error');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    const submitBtn = form.querySelector('.submit-btn') as HTMLButtonElement;
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t('common.loading');
      if (errorBox) errorBox.textContent = '';

      await authStore.login(email, password);
      
      // Redirect to home on success
      navigate('/');
    } catch (error) {
      if (errorBox) {
        errorBox.textContent = t('auth.login_failed');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.submit');
    }
  });
};
