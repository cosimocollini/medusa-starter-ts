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
      edit: 'Modifica',
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      increase: 'Aumenta',
      decrease: 'Diminuisci',
      confirm_delete: 'Sei sicuro di voler eliminare questo elemento?',
    },
    auth: {
      email: 'Email',
      password: 'Password',
      submit: 'Accedi',
      no_account: 'Non hai un account? Registrati',
      no_account_prompt: 'Non hai ancora un account?',
      login_subtitle: 'Accedi al tuo account per gestire i tuoi ordini',
      login_success: 'Accesso effettuato con successo',
      login_failed: 'Email o password non validi',
      fields_required: 'Tutti i campi sono obbligatori',
      register_title: 'Registrati',
      register_subtitle: 'Crea un account per velocizzare il checkout e tracciare i tuoi ordini',
      register_success: 'Account creato con successo',
      register_failed: 'Errore durante la registrazione. Riprova.',
      register_prompt: 'Crea un account',
      already_have_account: 'Hai già un account? Accedi',
      already_have_account_prompt: 'Hai già un account?',
      first_name: 'Nome',
      last_name: 'Cognome',
      password_hint: 'Almeno 8 caratteri',
      password_too_short: 'La password deve essere di almeno 8 caratteri',
    },
    account: {
      title: 'Il mio Account',
      dashboard: 'Dashboard',
      welcome: 'Bentornato',
      profile: 'Profilo',
      orders: 'I miei Ordini',
      recent_orders: 'Ordini Recenti',
      no_orders: 'Non hai ancora effettuato ordini',
      order_id: 'ID Ordine',
      date: 'Data',
      total: 'Totale',
      status: 'Stato',
      details: 'Dettagli',
      view_details: 'Vedi dettagli',
      see_all_orders: 'Vedi tutti gli ordini',
      profile_info: 'Informazioni Profilo',
      addresses: 'Indirizzi',
      manage_addresses: 'Gestisci indirizzi',
      manage_addresses_desc: 'Gestisci i tuoi indirizzi di spedizione e fatturazione per un checkout più veloce.',
      logout: 'Esci dal profilo',
      add_address: 'Aggiungi Indirizzo',
      edit_address: 'Modifica Indirizzo',
      no_addresses: 'Non hai ancora salvato alcun indirizzo.',
      payment_methods: 'Metodi di Pagamento',
      manage_payments: 'Gestisci metodi di pagamento',
      manage_payments_desc: 'Gestisci le tue carte di credito salvate per acquisti più rapidi.',
      add_payment_method: 'Aggiungi Carta',
      no_payment_methods: 'Non hai ancora salvato alcun metodo di pagamento.',
      delete_payment_method_confirm: 'Sei sicuro di voler eliminare questa carta?'
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
