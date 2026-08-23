import type { Locale } from "./config";
import type { GalleryFilter, ServiceSlug } from "@/lib/site";

export type ServiceCopy = {
  name: string;
  blurb: string;
  detail: string;
  includes: string[];
  ideal: string;
};

export type Dictionary = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    services: string;
    gallery: string;
    about: string;
    contact: string;
    book: string;
    menu: string;
    close: string;
    language: string;
  };
  lang: {
    it: string;
    en: string;
  };
  hero: {
    kicker: string;
    lines: [string, string, string];
    sub: string;
    cta: string;
    scroll: string;
    imageAlt: string;
  };
  statement: {
    lines: [string, string, string, string];
    body: string;
  };
  services: {
    kicker: string;
    viewAll: string;
    minutes: string;
    items: Record<ServiceSlug, ServiceCopy>;
  };
  cta: {
    lines: [string, string, string];
    button: string;
    imageAlt: string;
  };
  gallery: {
    kicker: string;
    open: string;
    close: string;
    prev: string;
    next: string;
    filters: Record<GalleryFilter, string>;
  };
  experience: {
    kicker: string;
    items: [
      { n: string; title: string; line: string; imageAlt: string },
      { n: string; title: string; line: string; imageAlt: string },
      { n: string; title: string; line: string; imageAlt: string },
      { n: string; title: string; line: string; imageAlt: string },
    ];
  };
  about: {
    kicker: string;
    lines: [string, string];
    body: string;
    yearLabel: string;
    locationLabel: string;
    imageAlt: string;
  };
  testimonials: {
    kicker: string;
    items: { quote: string; name: string }[];
  };
  location: {
    kicker: string;
    addressTitle: string;
    hoursTitle: string;
    contactsTitle: string;
    directions: string;
    phone: string;
    whatsapp: string;
    mapReveal: string;
    mapAlt: string;
  };
  footer: {
    rights: string;
  };
  bookBar: {
    label: string;
    cta: string;
  };
  pages: {
    servizi: {
      kicker: string;
      title: [string, string];
      intro: string;
      metaTitle: string;
      metaDescription: string;
    };
    serviceDetail: {
      back: string;
      durationLabel: string;
      priceLabel: string;
      includesLabel: string;
      idealLabel: string;
      bookCta: string;
      relatedLabel: string;
    };
    galleria: {
      kicker: string;
      title: [string, string];
      intro: string;
      metaTitle: string;
      metaDescription: string;
    };
    storia: {
      kicker: string;
      title: [string, string];
      lead: string;
      sections: {
        title: string;
        body: string;
        imageAlt: string;
      }[];
      values: { label: string; body: string }[];
      valuesTitle: string;
      metaTitle: string;
      metaDescription: string;
    };
    contatti: {
      kicker: string;
      title: [string, string] | [string, string, string];
      lead: string;
      channelsTitle: string;
      hoursTitle: string;
      addressTitle: string;
      metaTitle: string;
      metaDescription: string;
    };
    prenota: {
      kicker: string;
      title: [string, string];
      lead: string;
      note: string;
      contactCta: string;
      whatsappCta: string;
      soon: string;
      metaTitle: string;
      metaDescription: string;
      steps: {
        service: { title: string; lead: string };
        date: { title: string; lead: string };
        calendar: {
          prevMonth: string;
          nextMonth: string;
          today: string;
          weekdays: readonly [string, string, string, string, string, string, string];
          gridLabel: string;
        };
        time: {
          title: string;
          lead: string;
          loading: string;
          empty: string;
          pickDateFirst: string;
          pickSlot: string;
          selectedLead: string;
          groups: { morning: string; afternoon: string; evening: string };
          slotsAvailable: string;
          selected: string;
          timezoneNote: string;
        };
      };
      notesLabel: string;
      notesPlaceholder: string;
      confirm: string;
      submitting: string;
      signInToBook: string;
      guest: {
        title: string;
        lead: string;
        name: string;
        email: string;
        phone: string;
        haveAccount: string;
        signInLink: string;
      };
      summary: { service: string; date: string; time: string; total: string };
      assist: { lead: string };
      states: {
        notConfiguredTitle: string;
        notConfiguredLead: string;
        emptyTitle: string;
        emptyLead: string;
      };
      success: {
        kicker: string;
        title: string;
        body: string;
        dateLabel: string;
        referenceLabel: string;
        manageCta: string;
        homeCta: string;
      };
      errors: {
        notConfigured: string;
        unknownService: string;
        slotsFailed: string;
        slotTaken: string;
        authRequired: string;
        guestRequired: string;
        createFailed: string;
      };
    };
    gestisci: {
      kicker: string;
      title: string;
      lead: string;
      missing: string;
      missingLead: string;
      cancelled: string;
      cancel: string;
      confirmCancel: string;
      tooLate: string;
      home: string;
      bookAgain: string;
      metaTitle: string;
      metaDescription: string;
    };
    auth: {
      signIn: {
        kicker: string;
        title: [string, string];
        lead: string;
        emailLabel: string;
        passwordLabel: string;
        submit: string;
        pendingSubmit: string;
        noAccountPrompt: string;
        noAccountLink: string;
        metaTitle: string;
        metaDescription: string;
      };
      signUp: {
        kicker: string;
        title: [string, string];
        lead: string;
        nameLabel: string;
        phoneLabel: string;
        emailLabel: string;
        passwordLabel: string;
        submit: string;
        pendingSubmit: string;
        haveAccountPrompt: string;
        haveAccountLink: string;
        checkEmail: string;
        metaTitle: string;
        metaDescription: string;
      };
      errors: {
        genericSignIn: string;
        genericSignUp: string;
        notConfigured: string;
        tooMany: string;
      };
    };
    account: {
      kicker: string;
      title: [string, string];
      lead: string;
      greeting: string;
      signOut: string;
      emailLabel: string;
      roleLabel: string;
      joinedLabel: string;
      adminPanelCta: string;
      appointmentsCta: string;
      metaTitle: string;
      metaDescription: string;
      appointments: {
        kicker: string;
        title: [string, string];
        lead: string;
        backToAccount: string;
        upcomingTitle: string;
        pastTitle: string;
        emptyUpcomingLead: string;
        emptyPastLead: string;
        bookCta: string;
        cancel: string;
        confirmCancel: string;
        statuses: {
          pending: string;
          confirmed: string;
          arrived: string;
          completed: string;
          cancelled: string;
          noShow: string;
        };
        errors: {
          tooLate: string;
          notFound: string;
          generic: string;
        };
        metaTitle: string;
        metaDescription: string;
      };
    };
    notFound: {
      kicker: string;
      title: string;
      lead: string;
      home: string;
      services: string;
    };
    error: {
      kicker: string;
      title: string;
      lead: string;
      reference: string;
      retry: string;
      home: string;
    };
    admin: {
      kicker: string;
      title: [string, string];
      lead: string;
      metaTitle: string;
      metaDescription: string;
      nav: {
        section: string;
        backToSite: string;
        overview: string;
        appointments: string;
        services: string;
        hours: string;
        customers: string;
        gallery: string;
        reviews: string;
        settings: string;
      };
      overview: {
        kicker: string;
        lead: string;
        viewAll: string;
        today: string;
        todayHint: string;
        upcoming: string;
        upcomingHint: string;
        pending: string;
        pendingHint: string;
        todaySchedule: string;
        emptyToday: string;
      };
      appointments: {
        kicker: string;
        title: string;
        lead: string;
        metaTitle: string;
        ranges: { today: string; week: string; month: string; all: string };
        allStatuses: string;
        searchPlaceholder: string;
        search: string;
        clear: string;
        empty: string;
        unknownCustomer: string;
        guestBadge: string;
        customerNotesLabel: string;
        internalNotesLabel: string;
        internalNotesPlaceholder: string;
        statusLabel: string;
        saveNotes: string;
        close: string;
      };
      services: {
        kicker: string;
        title: string;
        lead: string;
        metaTitle: string;
        new: string;
        newLead: string;
        edit: string;
        editLead: string;
        active: string;
        empty: string;
        form: {
          name: string;
          slug: string;
          slugHint: string;
          price: string;
          duration: string;
          image: string;
          imageHint: string;
          description: string;
          sortOrder: string;
          active: string;
          saveNew: string;
          saveEdit: string;
          saving: string;
        };
      };
      hours: {
        kicker: string;
        title: string;
        lead: string;
        open: string;
        close: string;
        closed: string;
        saveHours: string;
        blockedTitle: string;
        blockedLead: string;
        date: string;
        reason: string;
        reasonPlaceholder: string;
        addBlocked: string;
        blockedEmpty: string;
        remove: string;
        breaksTitle: string;
        breaksLead: string;
        breakDay: string;
        breakDayAll: string;
        breakStart: string;
        breakEnd: string;
        breakLabel: string;
        breakLabelPlaceholder: string;
        addBreak: string;
        breaksEmpty: string;
      };
      customers: {
        kicker: string;
        title: string;
        lead: string;
        total: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        bookings: string;
        last: string;
        joined: string;
        empty: string;
      };
      gallery: {
        kicker: string;
        title: string;
        lead: string;
        file: string;
        /** Column heading + upload-form label for a photo's optional title. */
        titleField: string;
        category: string;
        sortOrder: string;
        upload: string;
        uploading: string;
        featured: string;
        remove: string;
        empty: string;
        saveItem: string;
      };
      reviews: {
        kicker: string;
        title: string;
        lead: string;
        empty: string;
        featured: string;
        remove: string;
        statuses: { pending: string; approved: string; rejected: string };
      };
      settings: {
        kicker: string;
        title: string;
        lead: string;
        identity: string;
        businessName: string;
        email: string;
        address: string;
        phone: string;
        whatsapp: string;
        instagram: string;
        facebook: string;
        bookingRules: string;
        noticeHours: string;
        noticeHint: string;
        maxDays: string;
        maxDaysHint: string;
        cancellationHours: string;
        cancellationHint: string;
        slotInterval: string;
        slotHint: string;
        requireConfirm: string;
        save: string;
        saving: string;
      };
    };
  };
  header: {
    account: string;
    signIn: string;
  };
};

const it: Dictionary = {
  meta: {
    title: "Doctor Cuts — L’arte del taglio · Macerata",
    description:
      "Doctor Cuts, studio di grooming maschile a Macerata. Tagli precisi, dettagli considerati. Via Antelmo Severini, 4/C.",
  },
  nav: {
    services: "Servizi",
    gallery: "Galleria",
    about: "Storia",
    contact: "Contatti",
    book: "Prenota",
    menu: "Menu",
    close: "Chiudi",
    language: "Lingua",
  },
  lang: {
    it: "Italiano",
    en: "English",
  },
  hero: {
    kicker: "EST. 2026",
    lines: ["L’ARTE", "DEL", "TAGLIO."],
    sub: "Precisione e cura per l’uomo contemporaneo.",
    cta: "Prenota appuntamento",
    scroll: "Scopri",
    imageAlt: "Taglio in corso nello studio Doctor Cuts",
  },
  statement: {
    lines: ["NON SOLO", "UN TAGLIO.", "UN LUOGO", "PER FERMARSI."],
    body: "Tagli precisi, dettagli considerati, un’esperienza costruita intorno a te.",
  },
  services: {
    kicker: "Servizi",
    viewAll: "Tutti i servizi",
    minutes: "MIN",
    items: {
      haircut: {
        name: "Taglio",
        blurb: "Taglio di precisione",
        detail:
          "Consulenza, lavaggio, taglio a forbice o macchina e styling finale. Pensato sulla forma della testa e sulla direzione naturale del capello.",
        includes: [
          "Consulenza personale",
          "Lavaggio",
          "Taglio a forbice o macchina",
          "Styling finale",
        ],
        ideal: "Per chi cerca un taglio pulito e curato.",
      },
      "beard-fade": {
        name: "Fade barba",
        blurb: "Sfumatura barba precisa",
        detail:
          "Fade della barba con transizioni nette e rifinitura dei contorni. Un lavoro definito, senza eccessi.",
        includes: [
          "Sfumatura barba",
          "Rifinitura contorni",
          "Controllo simmetria",
          "Finitura con prodotto",
        ],
        ideal: "Per chi vuole una barba sfumata e ordinata.",
      },
      "face-mask": {
        name: "Maschera viso",
        blurb: "Trattamento viso rinfrescante",
        detail:
          "Maschera viso per pulire e ravvivare la pelle. Un momento di cura tra un taglio e l’altro, o come trattamento a sé.",
        includes: [
          "Pulizia della pelle",
          "Applicazione maschera",
          "Tempo di posa",
          "Rimuovere e finire",
        ],
        ideal: "Per chi vuole freschezza e cura della pelle.",
      },
      "face-massage": {
        name: "Massaggio viso",
        blurb: "Massaggio rilassante del viso",
        detail:
          "Massaggio viso completo per rilassare i muscoli, stimolare la circolazione e lasciare la pelle più morbida e riposata.",
        includes: [
          "Preparazione della pelle",
          "Massaggio viso completo",
          "Pressione e rilascio",
          "Finitura con crema o olio",
        ],
        ideal: "Per chi cerca relax e un viso più riposato.",
      },
    },
  },
  cta: {
    lines: ["IL TUO PROSSIMO", "MIGLIOR LOOK", "INIZIA QUI."],
    button: "Prenota",
    imageAlt: "Uscita dallo studio, luce serale",
  },
  gallery: {
    kicker: "Galleria",
    open: "Apri immagine",
    close: "Chiudi",
    prev: "Precedente",
    next: "Successiva",
    filters: {
      all: "Tutti",
      cuts: "Tagli",
      fade: "Fade",
      beard: "Barba",
      style: "Style",
      studio: "Studio",
    },
  },
  experience: {
    kicker: "L’esperienza",
    items: [
      { n: "01", title: "Arrivo", line: "Il rumore resta fuori.", imageAlt: "Interno dello studio" },
      { n: "02", title: "Pausa", line: "Siediti. Rallenta.", imageAlt: "Attrezzi disposti con cura" },
      { n: "03", title: "Craft", line: "Precisione in ogni dettaglio.", imageAlt: "Dettaglio di un taglio" },
      { n: "04", title: "Uscita", line: "Esci diverso.", imageAlt: "Silhouette all’uscita dello studio" },
    ],
  },
  about: {
    kicker: "Storia",
    lines: ["COSTRUITO INTORNO", "AL BUON GUSTO."],
    body: "Doctor Cuts esiste per chi nota i dettagli. Uno studio a Macerata, pensato come un ritaglio di calma: luce bassa, attrezzi a posto, un taglio che tiene.",
    yearLabel: "Aperto",
    locationLabel: "Sede",
    imageAlt: "Interno Doctor Cuts a Macerata",
  },
  testimonials: {
    kicker: "Voci",
    items: [
      { quote: "Il miglior taglio che abbia fatto da anni.", name: "Marco R." },
      { quote: "Silenzio, precisione, niente teatro. Esci a posto.", name: "Luca B." },
      { quote: "Finalmente uno studio che tratta il taglio come un mestiere.", name: "Andrea V." },
    ],
  },
  location: {
    kicker: "Trovaci",
    addressTitle: "Indirizzo",
    hoursTitle: "Orari",
    contactsTitle: "Contatti",
    directions: "Indicazioni",
    phone: "Telefono",
    whatsapp: "WhatsApp",
    mapReveal: "Mostra mappa",
    mapAlt: "Mappa della sede Doctor Cuts a Macerata",
  },
  footer: {
    rights: "Tutti i diritti riservati.",
  },
  bookBar: {
    label: "Taglio",
    cta: "Prenota",
  },
  pages: {
    servizi: {
      kicker: "Servizi",
      title: ["QUATTRO MODI", "DI USCIRE DIVERSO."],
      intro:
        "Ogni servizio è pensato come un rituale, non come una lista. Prezzi in euro, tempi reali. La prenotazione richiede pochi passaggi.",
      metaTitle: "Servizi — Doctor Cuts",
      metaDescription:
        "Tagli, fade, barba e rituale completo. Servizi di grooming maschile a Macerata da Doctor Cuts.",
    },
    serviceDetail: {
      back: "Torna ai servizi",
      durationLabel: "Durata",
      priceLabel: "Prezzo",
      includesLabel: "Cosa è compreso",
      idealLabel: "Per chi è",
      bookCta: "Prenota questo servizio",
      relatedLabel: "Altri servizi",
    },
    galleria: {
      kicker: "Galleria",
      title: ["DENTRO", "LO STUDIO."],
      intro:
        "Selezione di tagli, dettagli e ambienti. Le immagini si aprono a schermo intero.",
      metaTitle: "Galleria — Doctor Cuts",
      metaDescription:
        "Selezione di tagli, fade, barba e interni dello studio Doctor Cuts a Macerata.",
    },
    storia: {
      kicker: "Storia",
      title: ["COSTRUITO INTORNO", "AL BUON GUSTO."],
      lead: "Doctor Cuts è uno studio a Macerata pensato per chi tratta il proprio look come parte di uno stile personale.",
      sections: [
        {
          title: "L’idea",
          body: "Uno spazio raccolto, con pochi dettagli scelti bene: legno scuro, luce calda, attrezzi in vista. Nessun brusio, nessuna vetrina di prodotti che non usiamo.",
          imageAlt: "Interno dello studio Doctor Cuts",
        },
        {
          title: "Il mestiere",
          body: "Consulenza prima del taglio. Forbice, macchina o rasoio a seconda della testa. Prodotti dedicati, gesti misurati. Il taglio deve tenere anche il giorno dopo.",
          imageAlt: "Rasoio in mano al barbiere",
        },
        {
          title: "Il tempo",
          body: "Ogni appuntamento occupa la sua durata reale. Nessuna sovrapposizione, nessuna fretta: quando entri, la poltrona è tua.",
          imageAlt: "Poltrona da barbiere nello studio",
        },
      ],
      values: [
        { label: "Precisione", body: "Il dettaglio non è ornamento." },
        { label: "Discrezione", body: "Il tempo dello studio è tuo." },
        { label: "Cura", body: "Prodotti e strumenti scelti uno per uno." },
      ],
      valuesTitle: "Valori",
      metaTitle: "Storia — Doctor Cuts",
      metaDescription:
        "Come nasce Doctor Cuts a Macerata: uno studio pensato per chi tratta il proprio look come parte di uno stile personale.",
    },
    contatti: {
      kicker: "Contatti",
      title: ["SCRIVICI,", "CHIAMACI,", "PASSA."],
      lead: "Prenotazioni via app, telefono o WhatsApp. Rispondiamo negli orari di apertura.",
      channelsTitle: "Canali",
      hoursTitle: "Orari",
      addressTitle: "Indirizzo",
      metaTitle: "Contatti — Doctor Cuts",
      metaDescription:
        "Indirizzo, telefono e canali per raggiungere Doctor Cuts a Macerata.",
    },
    prenota: {
      kicker: "Prenotazioni",
      title: ["PRENOTA", "ONLINE."],
      lead: "Scegli il servizio, la data e l’orario. Puoi prenotare anche senza account: ti confermiamo via email.",
      note: "Prenotazioni disponibili fino a 30 giorni in anticipo.",
      contactCta: "Chiama lo studio",
      whatsappCta: "Scrivi su WhatsApp",
      soon: "In arrivo",
      metaTitle: "Prenota — Doctor Cuts",
      metaDescription:
        "Prenota il tuo appuntamento da Doctor Cuts a Macerata: scegli servizio, data e orario in pochi secondi.",
      steps: {
        service: { title: "01 · Servizio", lead: "Scegli l’esperienza." },
        date: { title: "02 · Data", lead: "Scegli un giorno dal calendario." },
        calendar: {
          prevMonth: "Mese precedente",
          nextMonth: "Mese successivo",
          today: "Oggi",
          weekdays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
          gridLabel: "Calendario prenotazioni",
        },
        time: {
          title: "03 · Orario",
          lead: "Orari liberi in base al servizio scelto.",
          loading: "Cerco orari disponibili…",
          empty: "Nessun orario libero in questa data. Prova un altro giorno.",
          pickDateFirst: "Seleziona una data per vedere gli orari.",
          pickSlot: "Tocca un orario per continuare.",
          selectedLead: "Appuntamento alle",
          groups: {
            morning: "Mattina",
            afternoon: "Pomeriggio",
            evening: "Sera",
          },
          slotsAvailable: "{count} orari disponibili",
          selected: "Selezionato: {time}",
          timezoneNote: "Orari in fuso Europe/Rome (Macerata)",
        },
      },
      notesLabel: "Note per il barbiere (opzionale)",
      notesPlaceholder: "Es. preferenze di taglio, allergie, richieste particolari…",
      confirm: "Conferma prenotazione",
      submitting: "Conferma in corso…",
      signInToBook: "Accedi per confermare",
      guest: {
        title: "04 · I tuoi dati",
        lead: "Nessun account necessario. Ti mandiamo la conferma via email.",
        name: "Nome",
        email: "Email",
        phone: "Telefono (opzionale)",
        haveAccount: "Hai già un account?",
        signInLink: "Accedi",
      },
      summary: { service: "Servizio", date: "Data", time: "Ora", total: "Totale" },
      assist: { lead: "Hai bisogno di aiuto?" },
      states: {
        notConfiguredTitle: "Prenotazioni online in configurazione",
        notConfiguredLead:
          "Il sistema di prenotazione non è ancora collegato al database. Nel frattempo puoi contattarci direttamente.",
        emptyTitle: "Nessun servizio disponibile",
        emptyLead:
          "Non troviamo servizi attivi nel database. Se hai appena collegato Supabase, esegui supabase/seed.sql dal SQL Editor.",
      },
      success: {
        kicker: "Confermata",
        title: "TI ASPETTIAMO.",
        body: "Abbiamo bloccato il tuo posto per {service}. Ti abbiamo inviato una mail con tutti i dettagli.",
        dateLabel: "Data e ora",
        referenceLabel: "Riferimento",
        manageCta: "Gestisci prenotazione",
        homeCta: "Torna alla home",
      },
      errors: {
        notConfigured:
          "Le prenotazioni non sono ancora collegate. Contatta lo studio via WhatsApp o telefono.",
        unknownService: "Servizio non trovato. Aggiorna la pagina e riprova.",
        slotsFailed: "Non è stato possibile caricare gli orari. Riprova tra un momento.",
        slotTaken:
          "Questo orario è appena stato prenotato da qualcun altro. Scegline un altro.",
        authRequired: "Accedi per confermare la prenotazione.",
        guestRequired: "Inserisci nome e email per confermare come ospite.",
        createFailed: "Non è stato possibile completare la prenotazione. Riprova.",
      },
    },
    gestisci: {
      kicker: "Prenotazione",
      title: "La tua prenotazione",
      lead: "Da qui puoi controllare o cancellare l’appuntamento.",
      missing: "Prenotazione non trovata.",
      missingLead:
        "Il link non è valido o è scaduto. Controlla l’email di conferma o scrivici.",
      cancelled: "Prenotazione annullata.",
      cancel: "Annulla prenotazione",
      confirmCancel: "Confermi l’annullamento?",
      tooLate: "Troppo tardi per cancellare online. Contatta lo studio.",
      home: "Torna alla home",
      bookAgain: "Prenota di nuovo",
      metaTitle: "Gestisci prenotazione — Doctor Cuts",
      metaDescription: "Controlla o cancella la tua prenotazione Doctor Cuts.",
    },
    auth: {
      signIn: {
        kicker: "Accedi",
        title: ["BENTORNATO.", ""],
        lead: "Accedi con la tua email per gestire i tuoi appuntamenti.",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "Accedi",
        pendingSubmit: "Accesso in corso…",
        noAccountPrompt: "Non hai ancora un account?",
        noAccountLink: "Registrati",
        metaTitle: "Accedi — Doctor Cuts",
        metaDescription: "Accedi all’area personale di Doctor Cuts.",
      },
      signUp: {
        kicker: "Registrati",
        title: ["CREA IL", "TUO ACCOUNT."],
        lead: "Bastano nome, email e una password. Il numero di telefono ci serve solo per contattarti in caso di modifiche all’appuntamento.",
        nameLabel: "Nome e cognome",
        phoneLabel: "Telefono",
        emailLabel: "Email",
        passwordLabel: "Password (min. 8 caratteri)",
        submit: "Crea account",
        pendingSubmit: "Creazione…",
        haveAccountPrompt: "Hai già un account?",
        haveAccountLink: "Accedi",
        checkEmail: "Controlla la casella email per confermare la registrazione.",
        metaTitle: "Registrati — Doctor Cuts",
        metaDescription: "Crea il tuo account Doctor Cuts.",
      },
      errors: {
        genericSignIn: "Credenziali non valide. Riprova.",
        genericSignUp: "Non è stato possibile creare l’account. Riprova.",
        notConfigured:
          "Supabase non è ancora configurato. Imposta le variabili di ambiente in .env.local (vedi README).",
        tooMany: "Troppi tentativi. Riprova tra qualche minuto.",
      },
    },
    account: {
      kicker: "Account",
      title: ["CIAO,", ""],
      lead: "Da qui gestirai prenotazioni, preferenze e dati di contatto.",
      greeting: "Ciao",
      signOut: "Esci",
      emailLabel: "Email",
      roleLabel: "Ruolo",
      joinedLabel: "Iscritto dal",
      adminPanelCta: "Vai al pannello admin",
      appointmentsCta: "I tuoi appuntamenti",
      metaTitle: "Account — Doctor Cuts",
      metaDescription: "Area personale Doctor Cuts.",
      appointments: {
        kicker: "Appuntamenti",
        title: ["I TUOI", "APPUNTAMENTI."],
        lead: "Gestisci le tue prenotazioni passate e future.",
        backToAccount: "Torna all’account",
        upcomingTitle: "In arrivo",
        pastTitle: "Storico",
        emptyUpcomingLead:
          "Non hai appuntamenti in arrivo. Prenota il prossimo taglio in pochi secondi.",
        emptyPastLead: "Nessun appuntamento passato al momento.",
        bookCta: "Prenota ora",
        cancel: "Annulla",
        confirmCancel: "Sei sicuro di voler annullare questo appuntamento?",
        statuses: {
          pending: "In attesa",
          confirmed: "Confermato",
          arrived: "Arrivato",
          completed: "Completato",
          cancelled: "Annullato",
          noShow: "Non presentato",
        },
        errors: {
          tooLate:
            "Non è più possibile annullare online. Contatta lo studio via WhatsApp o telefono.",
          notFound: "Appuntamento non trovato.",
          generic: "Non è stato possibile annullare. Riprova.",
        },
        metaTitle: "I tuoi appuntamenti — Doctor Cuts",
        metaDescription: "Gestisci le tue prenotazioni Doctor Cuts.",
      },
    },
    notFound: {
      kicker: "Errore 404",
      title: "Pagina non trovata.",
      lead: "La pagina che cerchi non esiste o è stata spostata.",
      home: "Torna alla home",
      services: "Vedi i servizi",
    },
    error: {
      kicker: "Si è verificato un errore",
      title: "Qualcosa è andato storto.",
      lead: "Riprova tra un attimo. Se il problema persiste, contattaci direttamente.",
      reference: "Codice di riferimento:",
      retry: "Riprova",
      home: "Torna alla home",
    },
    admin: {
      kicker: "Admin",
      title: ["PANNELLO", "ADMIN."],
      lead: "Gestisci servizi, appuntamenti, orari e galleria.",
      metaTitle: "Admin — Doctor Cuts",
      metaDescription: "Pannello amministrativo Doctor Cuts.",
      nav: {
        section: "Admin",
        backToSite: "Torna al sito",
        overview: "Overview",
        appointments: "Appuntamenti",
        services: "Servizi",
        hours: "Orari",
        customers: "Clienti",
        gallery: "Galleria",
        reviews: "Recensioni",
        settings: "Impostazioni",
      },
      overview: {
        kicker: "Overview",
        lead: "Il polso dello studio in tempo reale.",
        viewAll: "Tutti gli appuntamenti",
        today: "Oggi",
        todayHint: "Prenotazioni attive per oggi",
        upcoming: "In arrivo",
        upcomingHint: "Confermati o in attesa",
        pending: "Da confermare",
        pendingHint: "Richiedono la tua approvazione",
        todaySchedule: "Agenda di oggi",
        emptyToday: "Nessun appuntamento oggi. Buona giornata.",
      },
      appointments: {
        kicker: "Appuntamenti",
        title: "Prenotazioni",
        lead: "Filtra, cerca e aggiorna gli appuntamenti dello studio.",
        metaTitle: "Appuntamenti · Admin — Doctor Cuts",
        ranges: { today: "Oggi", week: "7 giorni", month: "30 giorni", all: "Tutti" },
        allStatuses: "Tutti",
        searchPlaceholder: "Cerca per nome, email, telefono o riferimento…",
        search: "Cerca",
        clear: "Pulisci",
        empty: "Nessun appuntamento con questi filtri.",
        unknownCustomer: "Cliente sconosciuto",
        guestBadge: "Ospite",
        customerNotesLabel: "Note cliente",
        internalNotesLabel: "Note interne",
        internalNotesPlaceholder: "Solo per lo studio (es. preferenze, allergie, promemoria).",
        statusLabel: "Stato",
        saveNotes: "Salva note",
        close: "Chiudi",
      },
      services: {
        kicker: "Servizi",
        title: "Listino",
        lead: "Modifica prezzi, durate e visibilità dei servizi.",
        metaTitle: "Servizi · Admin — Doctor Cuts",
        new: "Nuovo servizio",
        newLead: "Aggiungi un nuovo servizio al listino.",
        edit: "Modifica",
        editLead: "Modifica i dettagli del servizio.",
        active: "Attivo",
        empty: "Nessun servizio creato.",
        form: {
          name: "Nome",
          slug: "Slug URL",
          slugHint: "Se lasci vuoto lo generiamo dal nome.",
          price: "Prezzo (€)",
          duration: "Durata (min)",
          image: "URL immagine",
          imageHint: "Un percorso in /images o un URL Supabase Storage.",
          description: "Descrizione",
          sortOrder: "Ordine",
          active: "Visibile ai clienti",
          saveNew: "Crea servizio",
          saveEdit: "Salva modifiche",
          saving: "Salvataggio…",
        },
      },
      hours: {
        kicker: "Orari",
        title: "Orari e chiusure",
        lead: "Aggiorna l’orario settimanale, le pause e le date di chiusura. Le modifiche aggiornano prenotazioni e pagina Contatti.",
        open: "Apertura",
        close: "Chiusura",
        closed: "Chiuso",
        saveHours: "Salva orari",
        blockedTitle: "Date chiuse",
        blockedLead: "Ferie, festivi o singole giornate in cui lo studio non riceve.",
        date: "Data",
        reason: "Motivo",
        reasonPlaceholder: "es. Ferie estive, festivo",
        addBlocked: "Aggiungi",
        blockedEmpty: "Nessuna data bloccata al momento.",
        remove: "Rimuovi",
        breaksTitle: "Pause",
        breaksLead: "Intervalli in cui non si accettano prenotazioni (es. pranzo).",
        breakDay: "Giorno",
        breakDayAll: "Ogni giorno",
        breakStart: "Inizio",
        breakEnd: "Fine",
        breakLabel: "Etichetta",
        breakLabelPlaceholder: "es. Pranzo",
        addBreak: "Aggiungi pausa",
        breaksEmpty: "Nessuna pausa configurata.",
      },
      customers: {
        kicker: "Clienti",
        title: "Clienti registrati",
        lead: "Chi ha un account può vedere i propri appuntamenti e prenotare in autonomia.",
        total: "clienti",
        name: "Nome",
        email: "Email",
        phone: "Telefono",
        role: "Ruolo",
        bookings: "Prenotazioni",
        last: "Ultimo",
        joined: "Iscritto",
        empty: "Ancora nessun cliente registrato.",
      },
      gallery: {
        kicker: "Galleria",
        title: "Foto studio",
        lead: "Carica, riordina ed evidenzia le foto della galleria pubblica. Le modifiche compaiono subito sul sito.",
        file: "File",
        titleField: "Titolo",
        category: "Categoria",
        sortOrder: "Ordine",
        upload: "Carica",
        uploading: "Caricamento…",
        featured: "In evidenza",
        remove: "Rimuovi",
        empty: "Nessuna foto in galleria. Caricane una qui sopra.",
        saveItem: "Salva",
      },
      reviews: {
        kicker: "Recensioni",
        title: "Moderazione",
        lead: "Approva o rifiuta le recensioni dei clienti prima che compaiano online.",
        empty: "Nessuna recensione ricevuta.",
        featured: "In evidenza",
        remove: "Elimina",
        statuses: { pending: "In attesa", approved: "Approvata", rejected: "Rifiutata" },
      },
      settings: {
        kicker: "Impostazioni",
        title: "Impostazioni studio",
        lead: "Dati di contatto, canali e regole di prenotazione.",
        identity: "Anagrafica",
        businessName: "Nome attività",
        email: "Email pubblica",
        address: "Indirizzo",
        phone: "Telefono",
        whatsapp: "WhatsApp (URL)",
        instagram: "Instagram (URL)",
        facebook: "Facebook (URL)",
        bookingRules: "Regole di prenotazione",
        noticeHours: "Preavviso (ore)",
        noticeHint: "Ore minime prima dell’appuntamento in cui accettiamo prenotazioni.",
        maxDays: "Finestra (giorni)",
        maxDaysHint: "Fino a quanti giorni in avanti si può prenotare.",
        cancellationHours: "Annullamento (ore)",
        cancellationHint: "Ore minime prima dell’appuntamento per annullare online.",
        slotInterval: "Slot (min)",
        slotHint: "Griglia di orari mostrata al cliente (es. ogni 15 min).",
        requireConfirm: "Richiedi conferma manuale per ogni prenotazione",
        save: "Salva impostazioni",
        saving: "Salvataggio…",
      },
    },
  },
  header: {
    account: "Account",
    signIn: "Accedi",
  },
};

const en: Dictionary = {
  meta: {
    title: "Doctor Cuts — The art of the cut · Macerata",
    description:
      "Doctor Cuts is a men’s grooming studio in Macerata. Precise cuts, considered details. Via Antelmo Severini, 4/C.",
  },
  nav: {
    services: "Services",
    gallery: "Gallery",
    about: "About",
    contact: "Contact",
    book: "Book",
    menu: "Menu",
    close: "Close",
    language: "Language",
  },
  lang: {
    it: "Italiano",
    en: "English",
  },
  hero: {
    kicker: "EST. 2026",
    lines: ["THE ART", "OF THE", "CUT."],
    sub: "Precision grooming for modern men.",
    cta: "Book appointment",
    scroll: "Explore",
    imageAlt: "A cut in progress at Doctor Cuts",
  },
  statement: {
    lines: ["NOT JUST", "A HAIRCUT.", "A PLACE TO", "RESET."],
    body: "Precise cuts, considered details, and an experience built around you.",
  },
  services: {
    kicker: "Services",
    viewAll: "View all services",
    minutes: "MIN",
    items: {
      haircut: {
        name: "Haircut",
        blurb: "Precision cut",
        detail:
          "Consultation, wash, scissor or clipper cut, and finishing style. Built around head shape and natural hair direction.",
        includes: [
          "Personal consultation",
          "Wash",
          "Scissor or clipper cut",
          "Finishing style",
        ],
        ideal: "For a clean, well-finished cut.",
      },
      "beard-fade": {
        name: "Beard Fade",
        blurb: "Precise beard fade",
        detail:
          "A clean beard fade with sharp transitions and tidy edges. Defined work, nothing excessive.",
        includes: [
          "Beard fade",
          "Edge refinement",
          "Symmetry check",
          "Product finish",
        ],
        ideal: "For a neat, faded beard.",
      },
      "face-mask": {
        name: "Face Mask",
        blurb: "Refreshing facial treatment",
        detail:
          "A face mask to cleanse and revive the skin. A short care ritual on its own, or paired with a cut.",
        includes: [
          "Skin cleanse",
          "Mask application",
          "Processing time",
          "Remove and finish",
        ],
        ideal: "For fresher, cared-for skin.",
      },
      "face-massage": {
        name: "Face Massage",
        blurb: "Relaxing facial massage",
        detail:
          "A full face massage to ease tension, support circulation, and leave the skin softer and more rested.",
        includes: [
          "Skin preparation",
          "Full face massage",
          "Pressure and release",
          "Cream or oil finish",
        ],
        ideal: "For relaxation and a rested face.",
      },
    },
  },
  cta: {
    lines: ["YOUR NEXT", "BEST LOOK", "STARTS HERE."],
    button: "Book now",
    imageAlt: "Leaving the studio at dusk",
  },
  gallery: {
    kicker: "Gallery",
    open: "Open image",
    close: "Close",
    prev: "Previous",
    next: "Next",
    filters: {
      all: "All",
      cuts: "Cuts",
      fade: "Fade",
      beard: "Beard",
      style: "Style",
      studio: "Studio",
    },
  },
  experience: {
    kicker: "The experience",
    items: [
      { n: "01", title: "Arrive", line: "Leave the noise outside.", imageAlt: "Studio interior" },
      { n: "02", title: "Reset", line: "Sit back. Slow down.", imageAlt: "Tools laid out with care" },
      { n: "03", title: "Craft", line: "Precision in every detail.", imageAlt: "Close detail of a cut" },
      { n: "04", title: "Leave sharp", line: "Walk out different.", imageAlt: "Leaving the studio" },
    ],
  },
  about: {
    kicker: "About",
    lines: ["BUILT AROUND", "GOOD TASTE."],
    body: "Doctor Cuts was created for people who notice the details. A studio in Macerata, cut out of the noise: low light, tools in place, a cut that holds.",
    yearLabel: "Established",
    locationLabel: "Location",
    imageAlt: "Doctor Cuts interior in Macerata",
  },
  testimonials: {
    kicker: "Notes",
    items: [
      { quote: "The best cut I’ve had in years.", name: "Marco R." },
      { quote: "Quiet, precise, no theatre. You leave put together.", name: "Luca B." },
      { quote: "A studio that still treats cutting as a craft.", name: "Andrea V." },
    ],
  },
  location: {
    kicker: "Find us",
    addressTitle: "Address",
    hoursTitle: "Opening hours",
    contactsTitle: "Contacts",
    directions: "Directions",
    phone: "Phone",
    whatsapp: "WhatsApp",
    mapReveal: "Show map",
    mapAlt: "Map showing Doctor Cuts in Macerata",
  },
  footer: {
    rights: "All rights reserved.",
  },
  bookBar: {
    label: "Haircut",
    cta: "Book",
  },
  pages: {
    servizi: {
      kicker: "Services",
      title: ["FOUR WAYS", "TO LEAVE DIFFERENT."],
      intro:
        "Every service is a ritual, not a list. Prices in euros, real durations. Booking takes a few steps.",
      metaTitle: "Services — Doctor Cuts",
      metaDescription:
        "Cuts, fades, beard work, and the full ritual. Men’s grooming services in Macerata.",
    },
    serviceDetail: {
      back: "Back to services",
      durationLabel: "Duration",
      priceLabel: "Price",
      includesLabel: "What’s included",
      idealLabel: "Ideal for",
      bookCta: "Book this service",
      relatedLabel: "Other services",
    },
    galleria: {
      kicker: "Gallery",
      title: ["INSIDE", "THE STUDIO."],
      intro:
        "A selection of cuts, details, and spaces. Tap any image to view it full-screen.",
      metaTitle: "Gallery — Doctor Cuts",
      metaDescription:
        "Selected cuts, fades, beard work, and interiors from Doctor Cuts in Macerata.",
    },
    storia: {
      kicker: "About",
      title: ["BUILT AROUND", "GOOD TASTE."],
      lead: "Doctor Cuts is a studio in Macerata for people who treat their look as part of a personal style.",
      sections: [
        {
          title: "The idea",
          body: "A small space, a few things done well: dark wood, warm light, tools in view. No noise, no shelves of products we don’t use.",
          imageAlt: "Doctor Cuts studio interior",
        },
        {
          title: "The craft",
          body: "Consultation before the cut. Scissors, clippers, or razor depending on the head. Dedicated products, measured gestures. The cut has to hold the next day too.",
          imageAlt: "Razor in the barber’s hand",
        },
        {
          title: "Time",
          body: "Every appointment takes its real time. No overlap, no rush: when you sit down, the chair is yours.",
          imageAlt: "Barber chair inside the studio",
        },
      ],
      values: [
        { label: "Precision", body: "Detail is not decoration." },
        { label: "Discretion", body: "The studio’s time is yours." },
        { label: "Care", body: "Products and tools chosen one by one." },
      ],
      valuesTitle: "Values",
      metaTitle: "About — Doctor Cuts",
      metaDescription:
        "How Doctor Cuts came to be in Macerata: a studio for people who treat their look as part of a personal style.",
    },
    contatti: {
      kicker: "Contact",
      title: ["WRITE,", "CALL,", "COME IN."],
      lead: "Bookings by app, phone, or WhatsApp. We reply during opening hours.",
      channelsTitle: "Channels",
      hoursTitle: "Hours",
      addressTitle: "Address",
      metaTitle: "Contact — Doctor Cuts",
      metaDescription: "Address, phone, and channels to reach Doctor Cuts in Macerata.",
    },
    prenota: {
      kicker: "Bookings",
      title: ["BOOK", "ONLINE."],
      lead: "Pick a service, a date, and a time. No account needed — confirmation lands in your inbox.",
      note: "Book up to 30 days in advance.",
      contactCta: "Call the studio",
      whatsappCta: "Message on WhatsApp",
      soon: "Coming soon",
      metaTitle: "Book — Doctor Cuts",
      metaDescription:
        "Book your appointment at Doctor Cuts in Macerata: pick a service, date, and time in seconds.",
      steps: {
        service: { title: "01 · Service", lead: "Choose your experience." },
        date: { title: "02 · Date", lead: "Pick a day from the calendar." },
        calendar: {
          prevMonth: "Previous month",
          nextMonth: "Next month",
          today: "Today",
          weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          gridLabel: "Booking calendar",
        },
        time: {
          title: "03 · Time",
          lead: "Open slots based on your service.",
          loading: "Loading available times…",
          empty: "No open slots on this day. Try another date.",
          pickDateFirst: "Select a date to see available times.",
          pickSlot: "Tap a time to continue.",
          selectedLead: "Appointment at",
          groups: {
            morning: "Morning",
            afternoon: "Afternoon",
            evening: "Evening",
          },
          slotsAvailable: "{count} slots available",
          selected: "Selected: {time}",
          timezoneNote: "Times shown in Europe/Rome (Macerata)",
        },
      },
      notesLabel: "Notes for the barber (optional)",
      notesPlaceholder: "e.g. style preferences, allergies, requests…",
      confirm: "Confirm booking",
      submitting: "Confirming…",
      signInToBook: "Sign in to confirm",
      guest: {
        title: "04 · Your details",
        lead: "No account needed. We’ll email the confirmation.",
        name: "Name",
        email: "Email",
        phone: "Phone (optional)",
        haveAccount: "Already have an account?",
        signInLink: "Sign in",
      },
      summary: { service: "Service", date: "Date", time: "Time", total: "Total" },
      assist: { lead: "Need a hand?" },
      states: {
        notConfiguredTitle: "Online bookings not connected yet",
        notConfiguredLead:
          "The booking system isn’t connected to the database. In the meantime, reach us directly.",
        emptyTitle: "No services available",
        emptyLead:
          "We can’t find any active services in the database. If you just linked Supabase, run supabase/seed.sql in the SQL Editor.",
      },
      success: {
        kicker: "Confirmed",
        title: "SEE YOU SOON.",
        body: "We’ve reserved your seat for {service}. Details are on their way to your inbox.",
        dateLabel: "Date & time",
        referenceLabel: "Reference",
        manageCta: "Manage booking",
        homeCta: "Back to home",
      },
      errors: {
        notConfigured:
          "Bookings aren’t connected yet. Reach the studio on WhatsApp or by phone.",
        unknownService: "Service not found. Refresh and try again.",
        slotsFailed: "Couldn’t load available times. Try again in a moment.",
        slotTaken: "Someone just took this slot. Pick another.",
        authRequired: "Sign in to confirm the booking.",
        guestRequired: "Add your name and email to confirm as a guest.",
        createFailed: "We couldn’t complete the booking. Try again.",
      },
    },
    gestisci: {
      kicker: "Booking",
      title: "Your appointment",
      lead: "Review or cancel this booking from this page.",
      missing: "Booking not found.",
      missingLead:
        "This link is invalid or expired. Check the confirmation email or get in touch.",
      cancelled: "Booking cancelled.",
      cancel: "Cancel booking",
      confirmCancel: "Cancel this appointment?",
      tooLate: "It’s too late to cancel online. Please contact the studio.",
      home: "Back to home",
      bookAgain: "Book again",
      metaTitle: "Manage booking — Doctor Cuts",
      metaDescription: "Review or cancel your Doctor Cuts appointment.",
    },
    auth: {
      signIn: {
        kicker: "Sign in",
        title: ["WELCOME", "BACK."],
        lead: "Sign in with your email to manage your appointments.",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "Sign in",
        pendingSubmit: "Signing in…",
        noAccountPrompt: "Don’t have an account yet?",
        noAccountLink: "Create one",
        metaTitle: "Sign in — Doctor Cuts",
        metaDescription: "Access your Doctor Cuts account.",
      },
      signUp: {
        kicker: "Create account",
        title: ["CREATE YOUR", "ACCOUNT."],
        lead: "Name, email, a password. Phone number stays with us and is only used if we need to reach you about an appointment.",
        nameLabel: "Full name",
        phoneLabel: "Phone",
        emailLabel: "Email",
        passwordLabel: "Password (min. 8 characters)",
        submit: "Create account",
        pendingSubmit: "Creating…",
        haveAccountPrompt: "Already have an account?",
        haveAccountLink: "Sign in",
        checkEmail: "Check your inbox to confirm your address.",
        metaTitle: "Create account — Doctor Cuts",
        metaDescription: "Create your Doctor Cuts account.",
      },
      errors: {
        genericSignIn: "Invalid credentials. Try again.",
        genericSignUp: "We couldn’t create your account. Try again.",
        notConfigured:
          "Supabase isn’t configured yet. Set the env variables in .env.local (see README).",
        tooMany: "Too many attempts. Try again in a few minutes.",
      },
    },
    account: {
      kicker: "Account",
      title: ["HELLO,", ""],
      lead: "Manage your bookings, preferences, and contact details.",
      greeting: "Hello",
      signOut: "Sign out",
      emailLabel: "Email",
      roleLabel: "Role",
      joinedLabel: "Member since",
      adminPanelCta: "Open admin panel",
      appointmentsCta: "Your appointments",
      metaTitle: "Account — Doctor Cuts",
      metaDescription: "Doctor Cuts personal area.",
      appointments: {
        kicker: "Appointments",
        title: ["YOUR", "APPOINTMENTS."],
        lead: "Manage your past and upcoming bookings.",
        backToAccount: "Back to account",
        upcomingTitle: "Upcoming",
        pastTitle: "History",
        emptyUpcomingLead:
          "You don’t have any upcoming appointments. Book your next cut in seconds.",
        emptyPastLead: "No past appointments yet.",
        bookCta: "Book now",
        cancel: "Cancel",
        confirmCancel: "Are you sure you want to cancel this appointment?",
        statuses: {
          pending: "Pending",
          confirmed: "Confirmed",
          arrived: "Arrived",
          completed: "Completed",
          cancelled: "Cancelled",
          noShow: "No-show",
        },
        errors: {
          tooLate:
            "It’s too late to cancel online. Please reach us on WhatsApp or by phone.",
          notFound: "Appointment not found.",
          generic: "We couldn’t cancel. Try again.",
        },
        metaTitle: "Your appointments — Doctor Cuts",
        metaDescription: "Manage your Doctor Cuts bookings.",
      },
    },
    notFound: {
      kicker: "Error 404",
      title: "Page not found.",
      lead: "The page you're looking for doesn't exist or has been moved.",
      home: "Back to home",
      services: "View services",
    },
    error: {
      kicker: "Something went wrong",
      title: "An unexpected error.",
      lead: "Please try again in a moment. If the issue persists, contact us directly.",
      reference: "Reference code:",
      retry: "Try again",
      home: "Back to home",
    },
    admin: {
      kicker: "Admin",
      title: ["ADMIN", "PANEL."],
      lead: "Run services, appointments, hours, and gallery from one place.",
      metaTitle: "Admin — Doctor Cuts",
      metaDescription: "Doctor Cuts admin panel.",
      nav: {
        section: "Admin",
        backToSite: "Back to site",
        overview: "Overview",
        appointments: "Appointments",
        services: "Services",
        hours: "Hours",
        customers: "Customers",
        gallery: "Gallery",
        reviews: "Reviews",
        settings: "Settings",
      },
      overview: {
        kicker: "Overview",
        lead: "The studio at a glance.",
        viewAll: "All appointments",
        today: "Today",
        todayHint: "Active bookings for today",
        upcoming: "Upcoming",
        upcomingHint: "Confirmed or pending",
        pending: "To confirm",
        pendingHint: "Waiting on your approval",
        todaySchedule: "Today’s schedule",
        emptyToday: "Nothing on the schedule today.",
      },
      appointments: {
        kicker: "Appointments",
        title: "Bookings",
        lead: "Filter, search, and update the studio’s bookings.",
        metaTitle: "Appointments · Admin — Doctor Cuts",
        ranges: { today: "Today", week: "7 days", month: "30 days", all: "All" },
        allStatuses: "All",
        searchPlaceholder: "Search by name, email, phone, or reference…",
        search: "Search",
        clear: "Clear",
        empty: "No bookings match these filters.",
        unknownCustomer: "Unknown customer",
        guestBadge: "Guest",
        customerNotesLabel: "Customer notes",
        internalNotesLabel: "Internal notes",
        internalNotesPlaceholder: "For the studio only (preferences, allergies, reminders).",
        statusLabel: "Status",
        saveNotes: "Save notes",
        close: "Close",
      },
      services: {
        kicker: "Services",
        title: "Menu",
        lead: "Edit prices, durations, and visibility of your services.",
        metaTitle: "Services · Admin — Doctor Cuts",
        new: "New service",
        newLead: "Add a new service to the menu.",
        edit: "Edit",
        editLead: "Edit service details.",
        active: "Active",
        empty: "No services yet.",
        form: {
          name: "Name",
          slug: "URL slug",
          slugHint: "Leave empty to generate from the name.",
          price: "Price (€)",
          duration: "Duration (min)",
          image: "Image URL",
          imageHint: "A /images path or a Supabase Storage URL.",
          description: "Description",
          sortOrder: "Order",
          active: "Visible to customers",
          saveNew: "Create service",
          saveEdit: "Save changes",
          saving: "Saving…",
        },
      },
      hours: {
        kicker: "Hours",
        title: "Hours & closures",
        lead: "Update weekly hours, breaks, and blocked days. Changes update booking and the contact page.",
        open: "Open",
        close: "Close",
        closed: "Closed",
        saveHours: "Save hours",
        blockedTitle: "Blocked dates",
        blockedLead: "Holidays, breaks, or single days the studio is closed.",
        date: "Date",
        reason: "Reason",
        reasonPlaceholder: "e.g. summer holiday, public holiday",
        addBlocked: "Add",
        blockedEmpty: "No blocked dates.",
        remove: "Remove",
        breaksTitle: "Breaks",
        breaksLead: "Intervals when bookings are not accepted (e.g. lunch).",
        breakDay: "Day",
        breakDayAll: "Every day",
        breakStart: "Start",
        breakEnd: "End",
        breakLabel: "Label",
        breakLabelPlaceholder: "e.g. Lunch",
        addBreak: "Add break",
        breaksEmpty: "No breaks configured.",
      },
      customers: {
        kicker: "Customers",
        title: "Registered customers",
        lead: "Anyone with an account can see and book their appointments.",
        total: "customers",
        name: "Name",
        email: "Email",
        phone: "Phone",
        role: "Role",
        bookings: "Bookings",
        last: "Last",
        joined: "Joined",
        empty: "No customers yet.",
      },
      gallery: {
        kicker: "Gallery",
        title: "Studio photos",
        lead: "Upload, reorder, and feature photos for the public gallery. Changes appear on the site immediately.",
        file: "File",
        titleField: "Title",
        category: "Category",
        sortOrder: "Order",
        upload: "Upload",
        uploading: "Uploading…",
        featured: "Featured",
        remove: "Remove",
        empty: "No photos yet. Upload one above.",
        saveItem: "Save",
      },
      reviews: {
        kicker: "Reviews",
        title: "Moderation",
        lead: "Approve or reject customer reviews before they go live.",
        empty: "No reviews yet.",
        featured: "Featured",
        remove: "Delete",
        statuses: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
      },
      settings: {
        kicker: "Settings",
        title: "Studio settings",
        lead: "Contact info, channels, and booking rules.",
        identity: "Identity",
        businessName: "Business name",
        email: "Public email",
        address: "Address",
        phone: "Phone",
        whatsapp: "WhatsApp (URL)",
        instagram: "Instagram (URL)",
        facebook: "Facebook (URL)",
        bookingRules: "Booking rules",
        noticeHours: "Notice (hours)",
        noticeHint: "Minimum hours ahead we accept a booking.",
        maxDays: "Window (days)",
        maxDaysHint: "How far ahead customers can book.",
        cancellationHours: "Cancellation (hours)",
        cancellationHint: "Minimum hours ahead to cancel online.",
        slotInterval: "Slot (min)",
        slotHint: "Grid the client sees (e.g. every 15 min).",
        requireConfirm: "Require manual confirmation for every booking",
        save: "Save settings",
        saving: "Saving…",
      },
    },
  },
  header: {
    account: "Account",
    signIn: "Sign in",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { it, en };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
