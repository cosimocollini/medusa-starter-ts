import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';
import { getIcon } from '@/utils/icons';

/**
 * Renders the login page template with accessible form.
 * Follows WCAG 2.1 guidelines for form accessibility.
 */
export const renderLogin = async () => {
  const html = `
    <main class="auth-container">
      <div class="auth-card">
        <header class="auth-header">
          <div class="auth-icon-wrapper">
            ${getIcon({ name: 'user', size: 'lg' })}
          </div>
          <h1 id="login-heading" class="auth-title">${t('common.login')}</h1>
          <p class="auth-subtitle">${t('auth.login_subtitle')}</p>
        </header>
        
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
          
          <div id="login-error" class="error-box auth-error hidden" role="alert" aria-live="polite"></div>
          
          <button type="submit" id="login-submit-btn" class="btn btn--primary btn--full">
            ${t('auth.submit')}
          </button>
        </form>
        
        <footer class="auth-footer">
          <p>${t('auth.no_account_prompt')}</p>
          <a href="/register" class="auth-link" data-link>${t('auth.register_title')}</a>
        </footer>
      </div>
    </main>
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
  const submitBtn = document.getElementById('login-submit-btn') as HTMLButtonElement;
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      submitBtn.disabled = true;
      const originalText = submitBtn.textContent;
      submitBtn.textContent = t('common.loading');
      errorBox?.classList.add('hidden');

      await authStore.login(email, password);
      
      // Redirect to account on success
      navigate('/account');
    } catch (error: any) {
      if (errorBox) {
        errorBox.textContent = error.message || t('auth.login_failed');
        errorBox.classList.remove('hidden');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.submit');
    }
  });
};
