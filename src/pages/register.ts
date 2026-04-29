import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';
import { getIcon } from '@/utils/icons';

/**
 * Renders the registration page with an accessible form (WCAG 2.1).
 */
export const renderRegister = async () => {
  const html = `
    <main class="auth-container">
      <div class="auth-card">
        <header class="auth-header">
          <div class="auth-icon-wrapper">
            ${getIcon({ name: 'user', size: 'lg' })}
          </div>
          <h1 id="register-heading" class="auth-title">${t('auth.register_title')}</h1>
          <p class="auth-subtitle">${t('auth.register_subtitle')}</p>
        </header>
        
        <form id="register-form" class="auth-form" aria-labelledby="register-heading" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label for="first_name" class="form-label">${t('auth.first_name')}</label>
              <input 
                type="text" 
                id="first_name" 
                name="first_name" 
                class="form-input"
                required 
                autocomplete="given-name" 
                placeholder="Mario"
              />
            </div>
            
            <div class="form-group">
              <label for="last_name" class="form-label">${t('auth.last_name')}</label>
              <input 
                type="text" 
                id="last_name" 
                name="last_name" 
                class="form-input"
                required 
                autocomplete="family-name" 
                placeholder="Rossi"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="email" class="form-label">${t('auth.email')}</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              class="form-input"
              required 
              autocomplete="email" 
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
              autocomplete="new-password" 
              minlength="8" 
              placeholder="••••••••"
              aria-describedby="password-hint"
            />
            <small id="password-hint" class="form-hint">${t('auth.password_hint')}</small>
          </div>
          
          <div id="register-error" class="error-box auth-error hidden" role="alert" aria-live="polite"></div>
          
          <button type="submit" id="register-submit-btn" class="btn btn--primary btn--full">
            ${t('auth.register_title')}
          </button>
        </form>
        
        <footer class="auth-footer">
          <p>${t('auth.already_have_account_prompt')}</p>
          <a href="/login" class="auth-link" data-link>${t('common.login')}</a>
        </footer>
      </div>
    </main>
  `;

  return { html, title: `${t('auth.register_title')} | Medusa Store` };
};

/**
 * Handles the registration form logic.
 */
export const initRegister = () => {
  const form = document.getElementById('register-form') as HTMLFormElement;
  const errorBox = document.getElementById('register-error');
  const submitBtn = document.getElementById('register-submit-btn') as HTMLButtonElement;
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    if ((data.password as string).length < 8) {
      if (errorBox) {
        errorBox.textContent = t('auth.password_too_short');
        errorBox.classList.remove('hidden');
      }
      return;
    }
    
    let originalText = submitBtn.textContent;
    try {
      submitBtn.disabled = true;
      originalText = submitBtn.textContent;
      submitBtn.textContent = t('common.loading');
      errorBox?.classList.add('hidden');

      await authStore.register(data);
      navigate('/account');
    } catch (error: any) {
      if (errorBox) {
        errorBox.textContent = error.message || t('auth.register_failed');
        errorBox.classList.remove('hidden');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
};
