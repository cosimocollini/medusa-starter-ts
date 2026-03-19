/**
 * Simple i18n utility to handle translations.
 * Currently supports Italian (default).
 */

const translations = {
  it: {
    common: {
      loading: 'Caricamento...',
      error: 'Si è verificato un errore',
      retry: 'Riprova',
      home: 'Home',
      cart: 'Carrello',
      login: 'Accedi',
      logout: 'Esci',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      submit: 'Accedi',
      no_account: 'Non hai un account? Registrati',
      login_success: 'Accesso effettuato con successo',
      login_failed: 'Email o password non validi',
      register_title: 'Registrati',
      register_success: 'Account creato con successo',
      register_failed: 'Errore durante la registrazione. Riprova.',
      already_have_account: 'Hai già un account? Accedi',
      first_name: 'Nome',
      last_name: 'Cognome',
    },
    account: {
      title: 'Il mio Account',
      orders: 'I miei Ordini',
      no_orders: 'Non hai ancora effettuato ordini',
      order_id: 'ID Ordine',
      date: 'Data',
      total: 'Totale',
      status: 'Stato',
      details: 'Dettagli',
      logout: 'Esci dal profilo'
    },
    cart: {
      add_to_cart: 'Aggiungi al carrello',
      adding: 'Aggiungendo...',
      added: 'Aggiunto!',
      title: 'Il tuo Carrello',
      empty: 'Il tuo carrello è vuoto',
      item: 'Prodotto',
      quantity: 'Quantità',
      price: 'Prezzo',
      total: 'Totale',
      subtotal: 'Subtotale',
      remove: 'Rimuovi',
      checkout: 'Procedi al Checkout',
      continue_shopping: 'Continua lo shopping'
    },
    checkout: {
      title: 'Checkout',
      shipping_address: 'Indirizzo di Spedizione',
      shipping_method: 'Metodo di Spedizione',
      payment: 'Pagamento',
      complete_order: 'Completa Ordine',
      email: 'Email',
      first_name: 'Nome',
      last_name: 'Cognome',
      address: 'Indirizzo',
      city: 'Città',
      postal_code: 'CAP',
      province: 'Provincia',
      country_code: 'Codice Paese (es. IT)',
      phone: 'Telefono',
      processing: 'Elaborazione in corso...',
      success: 'Ordine completato con successo!',
      error: 'Errore durante il checkout. Riprova.'
    },
    product: {
      variants: 'Seleziona una variante',
      description: 'Descrizione',
      no_stock: 'Esaurito',
      back: 'Torna ai prodotti'
    }
  }
};

type Language = keyof typeof translations;
let currentLang: Language = 'it';

/**
 * Get translation for a given key.
 * Usage: t('auth.email')
 */
export const t = (key: string): string => {
  const keys = key.split('.');
  let result: any = translations[currentLang];
  
  for (const k of keys) {
    if (result[k]) {
      result = result[k];
    } else {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return result;
};

/**
 * Set current language for the application.
 */
export const setLanguage = (lang: Language) => {
  currentLang = lang;
};
