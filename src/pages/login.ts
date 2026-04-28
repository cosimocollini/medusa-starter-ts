import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the login page template with accessible form.
 * Follows WCAG 2.1 guidelines for form accessibility.
 */
export const renderLogin = async () => {
  const html = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 id="login-heading" class="auth-title">${t('common.login')}</h1>
        <p class="auth-subtitle">${t('auth.login_subtitle') || 'Accedi al tuo account per gestire i tuoi ordini'}</p>
        
        <form id="login-form" class="auth-form" aria-labelledby="login-heading" novalidate>
          <div class="form-group">
            <label for="email" class="form-label">${t('auth.email')}</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input"
              required 
              autocomplete="email"
              aria-required="true"
              placeholder="email@example.com"
            />
          </div>
          
          <div class="form-group">
            <label for="password" class="form-label">${t('auth.password')}</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              class="form-input"
              required 
              autocomplete="current-password"
              aria-required="true"
              placeholder="••••••••"
            />
          </div>
          
          <div id="login-error" class="error-box" role="alert" aria-live="polite"></div>
          
          <button type="submit" class="submit-btn primary-btn">
            ${t('auth.submit')}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>${t('auth.no_account_prompt') || 'Non hai ancora un account?'}</p>
          <a href="/register" class="auth-link" data-link>${t('auth.register_title')}</a>
        </div>
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
    
    // Basic validation
    if (!email || !password) {
      if (errorBox) errorBox.textContent = t('auth.fields_required') || 'Tutti i campi sono obbligatori';
      return;
    }
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t('common.loading');
      if (errorBox) errorBox.textContent = '';

      await authStore.login(email, password);
      
      // Redirect to account on success
      navigate('/account');
    } catch (error: any) {
      if (errorBox) {
        errorBox.textContent = error.message || t('auth.login_failed');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.submit');
    }
  });
};
