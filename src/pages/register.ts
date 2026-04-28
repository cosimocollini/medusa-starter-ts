import { authStore } from '@/store/auth';
import { navigate } from '@/router';
import { t } from '@/utils/i18n';

/**
 * Renders the registration page with an accessible form (WCAG 2.1).
 */
export const renderRegister = async () => {
  const html = `
    <div class="auth-container">
      <div class="auth-card">
        <h1 id="register-heading" class="auth-title">${t('auth.register_title')}</h1>
        <p class="auth-subtitle">${t('auth.register_subtitle') || 'Crea un account per velocizzare il checkout e tracciare i tuoi ordini'}</p>
        
        <form id="register-form" class="auth-form" aria-labelledby="register-heading" novalidate>
          <div class="form-row">
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
            <small id="password-hint" class="form-hint">${t('auth.password_hint') || 'Almeno 8 caratteri'}</small>
          </div>
          
          <div id="register-error" class="error-box" role="alert" aria-live="polite"></div>
          
          <button type="submit" class="submit-btn primary-btn">
            ${t('auth.register_title')}
          </button>
        </form>
        
        <div class="auth-footer">
          <p>${t('auth.already_have_account_prompt') || 'Hai già un account?'}</p>
          <a href="/login" class="auth-link" data-link>${t('common.login')}</a>
        </div>
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
    
    // Basic validation
    if (!data.email || !data.password || !data.first_name || !data.last_name) {
      if (errorBox) errorBox.textContent = t('auth.fields_required') || 'Tutti i campi sono obbligatori';
      return;
    }

    if ((data.password as string).length < 8) {
      if (errorBox) errorBox.textContent = t('auth.password_too_short') || 'La password deve essere di almeno 8 caratteri';
      return;
    }
    
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = t('common.loading');
      if (errorBox) errorBox.textContent = '';

      await authStore.register(data);
      navigate('/account');
    } catch (error: any) {
      if (errorBox) {
        errorBox.textContent = error.message || t('auth.register_failed');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = t('auth.register_title');
    }
  });
};
