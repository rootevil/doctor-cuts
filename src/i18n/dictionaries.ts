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
    reviews: string;
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
  };
  gallery: {
    kicker: string;
    open: string;
    close: string;
    prev: string;
    next: string;
    filters: Record<GalleryFilter, string>;
  };
  about: {
    kicker: string;
    lines: [string, string];
    body: string;
    yearLabel: string;
    locationLabel: string;
    findUs: string;
    imageAlt: string;
  };
  testimonials: {
    kicker: string;
    title: string;
    viaGoogle: string;
    moreOnGoogle: string;
    opensNew: string;
    starsLabel: string;
  };
  location: {
    kicker: string;
    addressTitle: string;
    hoursTitle: string;
    contactsTitle: string;
    directions: string;
    phone: string;
    whatsapp: string;
    email: string;
    mapReveal: string;
    mapAlt: string;
  };
  footer: {
    rights: string;
    backToTop: string;
    navLabel: string;
  };
  pages: {
    servizi: {
      kicker: string;
      title: [string, string];
      intro: string;
      listLabel: string;
      priceCol: string;
      durationCol: string;
      detailsHint: string;
      bookCta: string;
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
      bookHint: string;
      relatedLabel: string;
      viewAllServices: string;
    };
    galleria: {
      kicker: string;
      title: [string, string];
      intro: string;
      heroImageAlt: string;
      filterLabel: string;
      empty: string;
      bookCta: string;
      metaTitle: string;
      metaDescription: string;
    };
    storia: {
      kicker: string;
      title: [string, string];
      lead: string;
      heroImageAlt: string;
      storyLabel: string;
      sections: {
        title: string;
        body: string;
        imageAlt: string;
      }[];
      values: { label: string; body: string }[];
      valuesTitle: string;
      visitTitle: string;
      visitLead: string;
      bookCta: string;
      findUsCta: string;
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
      bookCta: string;
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
          legendAvailable: string;
          legendBooked: string;
          legendUnavailable: string;
          booked: string;
          unavailable: string;
          legendLabel: string;
        };
      };
      notesLabel: string;
      notesPlaceholder: string;
      confirm: string;
      confirmReschedule: string;
      submitting: string;
      submittingReschedule: string;
      signInToBook: string;
      reschedule: {
        kicker: string;
        title: string;
        lead: string;
        lockedService: string;
        successTitle: string;
        successBody: string;
      };
      nextHint: {
        pickService: string;
        pickDate: string;
        pickTime: string;
        addDetails: string;
        ready: string;
        readyReschedule: string;
      };
      locked: {
        needService: string;
        needDate: string;
        needTime: string;
      };
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
        closedTitle: string;
        closedLead: string;
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
        bookingsClosed: string;
        paymentFailed: string;
      };
      payment: {
        stepTitle: string;
        stepLead: string;
        banner: string;
        servicePrice: string;
        payNow: string;
        payInShop: string;
        payInShopZero: string;
        holdNote: string;
        trustProvider: string;
        trustSecure: string;
        cta: string;
        submitting: string;
        nextHint: string;
        summaryNow: string;
        result: {
          processingTitle: string;
          processingLead: string;
          unpaidTitle: string;
          unpaidLead: string;
          retry: string;
          missingTitle: string;
          missingLead: string;
        };
      };
      a11y: {
        progress: string;
        slotLegend: string;
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
      reschedule: string;
      confirmCancel: string;
      confirmCancelPaid: string;
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
        showPassword: string;
        hidePassword: string;
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
        showPassword: string;
        hidePassword: string;
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
      phoneLabel: string;
      roleLabel: string;
      joinedLabel: string;
      detailsTitle: string;
      adminRole: string;
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
        reschedule: string;
        confirmCancel: string;
        confirmCancelPaid: string;
        tooLateHint: string;
        depositPaid: string;
        refLabel: string;
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
      contact: string;
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
        completed: string;
        completedHint: string;
        todaySchedule: string;
        emptyToday: string;
        recentTitle: string;
        recentLead: string;
        emptyRecent: string;
        upcomingSchedule: string;
        emptyUpcoming: string;
        quickActions: string;
        actionAppointments: string;
        actionServices: string;
        actionHours: string;
        actionSettings: string;
        attention: string;
        attentionLead: string;
        emptyPending: string;
        nextUp: string;
        scheduleCount: string;
      };
      appointments: {
        kicker: string;
        title: string;
        lead: string;
        metaTitle: string;
        ranges: { today: string; week: string; month: string; all: string };
        rangeLabel: string;
        allStatuses: string;
        searchPlaceholder: string;
        search: string;
        clear: string;
        empty: string;
        unknownCustomer: string;
        guestBadge: string;
        depositPaid: string;
        waitingLabel: string;
        cancelAndRefund: string;
        confirmCancelRefund: string;
        refundedBadge: string;
        refundFailed: string;
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
        sources: { site: string; google: string };
        addTitle: string;
        addLead: string;
        authorLabel: string;
        authorHint: string;
        ratingLabel: string;
        commentLabel: string;
        commentHint: string;
        featuredLabel: string;
        submit: string;
        success: string;
        errorInvalid: string;
        errorFeaturedLimit: string;
        errorGeneric: string;
        featuredCount: string;
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
        requireConfirmHint: string;
        bookingsEnabled: string;
        bookingsEnabledHint: string;
        depositRequired: string;
        depositRequiredHint: string;
        depositAmount: string;
        depositAmountHint: string;
        save: string;
        saving: string;
      };
      messages: {
        invalid: string;
        slugTaken: string;
        selectImage: string;
        imageTooLarge: string;
        uploaded: string;
        saved: string;
      };
      roles: {
        admin: string;
        customer: string;
      };
      delete: string;
    };
  };
  header: {
    account: string;
    signIn: string;
  };
};

const it: Dictionary = {
  meta: {
    title: "Doctor Cuts",
    description:
      "Doctor Cuts, studio di cura maschile a Macerata. Tagli precisi, dettagli considerati. Via Antelmo Severini, 4/C.",
  },
  nav: {
    services: "Servizi",
    gallery: "Galleria",
    about: "Storia",
    reviews: "Recensioni",
    contact: "Contatti",
    book: "Prenota ora",
    menu: "Menu",
    close: "Chiudi",
    language: "Lingua",
  },
  lang: {
    it: "Italiano",
    en: "English",
  },
  hero: {
    kicker: "EST. 2025",
    lines: ["L’ARTE", "DEL", "TAGLIO."],
    sub: "Precisione e cura per l’uomo contemporaneo.",
    cta: "Prenota ora",
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
    minutes: "min",
    items: {
      haircut: {
        name: "Taglio",
        blurb: "Taglio di precisione",
        detail:
          "Consulenza, lavaggio, taglio a forbice o macchina e messa in piega. Pensato sulla forma della testa e sulla direzione naturale del capello.",
        includes: [
          "Consulenza personale",
          "Lavaggio",
          "Taglio a forbice o macchina",
          "Messa in piega",
        ],
        ideal: "Per chi cerca un taglio pulito e curato.",
      },
      "beard-fade": {
        name: "Sfumatura barba",
        blurb: "Sfumatura barba precisa",
        detail:
          "Sfumatura della barba con transizioni nette e rifinitura dei contorni. Un lavoro definito, senza eccessi.",
        includes: [
          "Sfumatura barba",
          "Rifinitura contorni",
          "Controllo simmetria",
          "Finitura con prodotto",
        ],
        ideal: "Per chi vuole una barba sfumata e ordinata.",
      },
      "baby-cut": {
        name: "Taglio bambino (sotto i 10 anni)",
        blurb: "Taglio per bambini sotto i 10 anni",
        detail:
          "Taglio gentile e rapido per i più piccoli, con pazienza e attenzione. Pensato per bambini sotto i 10 anni.",
        includes: [
          "Accoglienza del bambino",
          "Taglio a forbice o macchina",
          "Rifinitura",
          "Consiglio ai genitori",
        ],
        ideal: "Per bambini sotto i 10 anni.",
      },
      "face-threading": {
        name: "Filo viso",
        blurb: "Depilazione del viso con filo",
        detail:
          "Depilazione del viso con il filo: precisa, pulita e delicata sulla pelle. Ideale per definire e rifinire.",
        includes: [
          "Preparazione della pelle",
          "Depilazione con filo",
          "Rifinitura",
          "Cura dopo il trattamento",
        ],
        ideal: "Per chi vuole un viso netto e definito.",
      },
      "eyebrows-threading": {
        name: "Filo sopracciglia",
        blurb: "Definizione sopracciglia con filo",
        detail:
          "Definizione e pulizia delle sopracciglia con il filo. Forma naturale, linee ordinate.",
        includes: [
          "Analisi della forma",
          "Depilazione con filo",
          "Simmetria",
          "Finitura",
        ],
        ideal: "Per sopracciglia ordinate e naturali.",
      },
      "hair-shampoo": {
        name: "Shampoo",
        blurb: "Lavaggio capelli",
        detail:
          "Lavaggio dei capelli con prodotti dedicati. Freschezza e cura prima di un taglio o come servizio a sé.",
        includes: ["Lavaggio", "Massaggio del cuoio capelluto", "Risciacquo", "Asciugatura leggera"],
        ideal: "Per un lavaggio rapido e curato.",
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
          "Rimozione e finitura",
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
    lines: ["IL TUO PROSSIMO", "MIGLIOR STILE", "INIZIA QUI."],
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
      fade: "Sfumature",
      beard: "Barba",
      style: "Stile",
      studio: "Studio",
    },
  },
  about: {
    kicker: "Storia",
    lines: ["COSTRUITO INTORNO", "AL BUON GUSTO."],
    body: "Doctor Cuts esiste per chi nota i dettagli. Uno studio a Macerata, pensato come un ritaglio di calma: luce bassa, attrezzi a posto, un taglio che tiene.",
    yearLabel: "Aperto",
    locationLabel: "Sede",
    findUs: "Come trovarci",
    imageAlt: "Interno Doctor Cuts a Macerata",
  },
  testimonials: {
    kicker: "Recensioni",
    title: "Dicono i clienti",
    viaGoogle: "Google",
    moreOnGoogle: "altre su Google",
    opensNew: "si apre in una nuova scheda",
    starsLabel: "{n} stelle su 5",
  },
  location: {
    kicker: "Trovaci",
    addressTitle: "Indirizzo",
    hoursTitle: "Orari",
    contactsTitle: "Contatti",
    directions: "Indicazioni",
    phone: "Telefono",
    whatsapp: "WhatsApp",
    email: "Email",
    mapReveal: "Mostra mappa",
    mapAlt: "Mappa della sede Doctor Cuts a Macerata",
  },
  footer: {
    rights: "Tutti i diritti riservati.",
    backToTop: "Torna su",
    navLabel: "Navigazione",
  },
  pages: {
    servizi: {
      kicker: "Servizi",
      title: ["OGNI SERVIZIO,", "UN DETTAGLIO IN PIÙ."],
      intro:
        "Ogni servizio è un rituale, non una lista. Prezzi chiari — tocca un servizio per prenotare.",
      listLabel: "Menu servizi",
      priceCol: "Prezzo",
      durationCol: "Durata",
      detailsHint: "Prenota",
      bookCta: "Prenota ora",
      metaTitle: "Servizi — Doctor Cuts",
      metaDescription:
        "Tagli, sfumature, barba, filo e trattamenti. Servizi di cura maschile a Macerata da Doctor Cuts.",
    },
    serviceDetail: {
      back: "Torna ai servizi",
      durationLabel: "Durata",
      priceLabel: "Prezzo",
      includesLabel: "Cosa è compreso",
      idealLabel: "Per chi è",
      bookCta: "Prenota ora",
      bookHint: "Scegli data e ora online — questo servizio sarà già selezionato.",
      relatedLabel: "Altri servizi",
      viewAllServices: "Vedi tutti",
    },
    galleria: {
      kicker: "Galleria",
      title: ["DENTRO", "LO STUDIO."],
      intro:
        "Tagli, dettagli e ambienti. Filtra per categoria, tocca una foto per aprirla a schermo intero.",
      heroImageAlt: "Interno dello studio Doctor Cuts a Macerata",
      filterLabel: "Filtra per",
      empty: "Nessuna foto in questa categoria.",
      bookCta: "Prenota ora",
      metaTitle: "Galleria — Doctor Cuts",
      metaDescription:
        "Selezione di tagli, sfumature, barba e interni dello studio Doctor Cuts a Macerata.",
    },
    storia: {
      kicker: "Storia",
      title: ["COSTRUITO INTORNO", "AL BUON GUSTO."],
      lead: "Uno studio a Macerata per chi tratta il proprio aspetto come parte dello stile — non una corsa al prossimo cliente.",
      heroImageAlt: "Interno dello studio Doctor Cuts",
      storyLabel: "Come lavoriamo",
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
      visitTitle: "Vieni in studio",
      visitLead: "Prenota online o passaci a trovare a Macerata.",
      bookCta: "Prenota ora",
      findUsCta: "Trovaci",
      metaTitle: "Storia — Doctor Cuts",
      metaDescription:
        "Come nasce Doctor Cuts a Macerata: uno studio pensato per chi tratta il proprio aspetto come parte di uno stile personale.",
    },
    contatti: {
      kicker: "Contatti",
      title: ["SCRIVICI,", "CHIAMACI,", "PASSA."],
      lead: "Prenota online, chiamaci o scrivi su WhatsApp. Rispondiamo negli orari di apertura.",
      channelsTitle: "Canali",
      hoursTitle: "Orari",
      addressTitle: "Indirizzo",
      bookCta: "Prenota ora",
      metaTitle: "Contatti — Doctor Cuts",
      metaDescription:
        "Indirizzo, telefono e canali per raggiungere Doctor Cuts a Macerata.",
    },
    prenota: {
      kicker: "Prenotazioni",
      title: ["PRENOTA", "ONLINE."],
      lead: "Scegli servizio, data e orario. Conferma via email — senza account.",
      note: "Prenotazioni disponibili fino a 30 giorni in anticipo.",
      contactCta: "Chiama lo studio",
      whatsappCta: "Scrivi su WhatsApp",
      soon: "In arrivo",
      metaTitle: "Prenota — Doctor Cuts",
      metaDescription:
        "Prenota il tuo appuntamento da Doctor Cuts a Macerata: scegli servizio, data e orario in pochi secondi.",
      steps: {
        service: { title: "Servizio", lead: "Cosa vuoi prenotare." },
        date: { title: "Data", lead: "Scegli un giorno disponibile." },
        calendar: {
          prevMonth: "Mese precedente",
          nextMonth: "Mese successivo",
          today: "Oggi",
          weekdays: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
          gridLabel: "Calendario prenotazioni",
        },
        time: {
          title: "Orario",
          lead: "Solo orari ancora liberi.",
          loading: "Cerco orari disponibili…",
          empty: "Nessun orario libero in questa data. Prova un altro giorno.",
          pickDateFirst: "Prima scegli una data.",
          pickSlot: "Tocca un orario.",
          selectedLead: "Appuntamento alle",
          groups: {
            morning: "Mattina",
            afternoon: "Pomeriggio",
            evening: "Sera",
          },
          slotsAvailable: "{count} disponibili",
          selected: "Selezionato: {time}",
          timezoneNote: "Orari · Macerata",
          legendAvailable: "Disponibile",
          legendBooked: "Occupato",
          legendUnavailable: "Chiuso",
          booked: "Occupato",
          unavailable: "Non disponibile",
          legendLabel: "Legenda orari",
        },
      },
      notesLabel: "Note (opzionale)",
      notesPlaceholder: "Preferenze, allergie, richieste…",
      confirm: "Conferma prenotazione",
      confirmReschedule: "Conferma nuovo orario",
      submitting: "Conferma in corso…",
      submittingReschedule: "Aggiorno l’appuntamento…",
      signInToBook: "Accedi per confermare",
      reschedule: {
        kicker: "Riprogramma",
        title: "SCEGLI UN NUOVO ORARIO.",
        lead: "L’acconto già pagato resta valido. Cambia solo data e ora.",
        lockedService: "Servizio bloccato per questa riprogrammazione.",
        successTitle: "ORARIO AGGIORNATO.",
        successBody: "Il tuo appuntamento per {service} è stato spostato. Ti abbiamo inviato una mail.",
      },
      nextHint: {
        pickService: "Scegli un servizio",
        pickDate: "Scegli una data",
        pickTime: "Scegli un orario",
        addDetails: "Inserisci nome e email",
        ready: "Pronto per confermare",
        readyReschedule: "Pronto per confermare il nuovo orario",
      },
      locked: {
        needService: "Prima scegli un servizio.",
        needDate: "Prima scegli una data.",
        needTime: "Prima scegli un orario.",
      },
      guest: {
        title: "I tuoi dati",
        lead: "Conferma via email — account non obbligatorio.",
        name: "Nome",
        email: "Email",
        phone: "Telefono (opzionale)",
        haveAccount: "Hai già un account?",
        signInLink: "Accedi",
      },
      summary: { service: "Servizio", date: "Data", time: "Ora", total: "Totale" },
      assist: { lead: "Serve aiuto?" },
      states: {
        notConfiguredTitle: "Prenotazioni online in configurazione",
        notConfiguredLead:
          "Il sistema di prenotazione non è ancora collegato al database. Nel frattempo puoi contattarci direttamente.",
        emptyTitle: "Nessun servizio disponibile",
        emptyLead:
          "Non troviamo servizi attivi nel database. Se hai appena collegato Supabase, esegui supabase/seed.sql dal SQL Editor.",
        closedTitle: "Prenotazioni sospese",
        closedLead:
          "Le prenotazioni online sono temporaneamente chiuse. Contattaci via WhatsApp o telefono.",
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
        bookingsClosed:
          "Le prenotazioni online sono sospese. Contatta lo studio via WhatsApp o telefono.",
        paymentFailed:
          "Il pagamento non è partito. Riprova o scrivici su WhatsApp.",
      },
      payment: {
        stepTitle: "Conferma",
        stepLead: "Un acconto blocca l’orario. Il resto lo saldi in studio.",
        banner: "Per confermare paghi un acconto ora. Niente sorprese: il resto in cassa.",
        servicePrice: "Prezzo del servizio",
        payNow: "Paga ora per confermare",
        payInShop: "In studio",
        payInShopZero: "Niente da saldare in studio",
        holdNote: "L’orario resta tuo per 30 minuti mentre paghi.",
        trustProvider: "Pagamento sicuro con Stripe",
        trustSecure: "La banca può chiedere un codice (3D Secure).",
        cta: "Paga {amount} e conferma",
        submitting: "Apro il pagamento sicuro…",
        nextHint: "Controlla il riepilogo e paga per confermare",
        summaryNow: "Ora",
        result: {
          processingTitle: "Stiamo confermando il pagamento",
          processingLead:
            "Se hai già pagato, attendi qualche secondo e aggiorna la pagina. Se hai chiuso Stripe, puoi riprovare qui sotto.",
          unpaidTitle: "Prenotazione non confermata",
          unpaidLead:
            "Il pagamento non è andato a buon fine o è stato annullato. L’orario è ancora tuo per pochi minuti.",
          retry: "Riprova il pagamento",
          missingTitle: "Link non valido",
          missingLead: "Questo link di pagamento è scaduto o non è corretto. Prenota di nuovo.",
        },
      },
      a11y: {
        progress: "Avanzamento prenotazione",
        slotLegend: "Legenda orari",
      },
    },
    gestisci: {
      kicker: "Prenotazione",
      title: "La tua prenotazione",
      lead: "Da qui puoi riprogrammare o cancellare l’appuntamento.",
      missing: "Prenotazione non trovata.",
      missingLead:
        "Il link non è valido o è scaduto. Controlla l’email di conferma o scrivici.",
      cancelled: "Prenotazione annullata.",
      cancel: "Annulla prenotazione",
      reschedule: "Riprogramma",
      confirmCancel: "Confermi l’annullamento?",
      confirmCancelPaid:
        "Annullare la prenotazione? L’acconto di €5 verrà rimborsato.",
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
        lead: "Inserisci email e password per vedere e gestire i tuoi appuntamenti.",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "Accedi",
        pendingSubmit: "Accesso in corso…",
        noAccountPrompt: "Non hai ancora un account?",
        noAccountLink: "Crea un account",
        showPassword: "Mostra password",
        hidePassword: "Nascondi password",
        metaTitle: "Accedi — Doctor Cuts",
        metaDescription: "Accedi all’area personale di Doctor Cuts.",
      },
      signUp: {
        kicker: "Registrati",
        title: ["CREA IL", "TUO ACCOUNT."],
        lead: "Compila i campi qui sotto. Ti serve per prenotare e gestire gli appuntamenti.",
        nameLabel: "Nome e cognome",
        phoneLabel: "Telefono",
        emailLabel: "Email",
        passwordLabel: "Password (min. 8 caratteri)",
        submit: "Crea account",
        pendingSubmit: "Creazione…",
        haveAccountPrompt: "Hai già un account?",
        haveAccountLink: "Accedi",
        checkEmail: "Controlla la casella email per confermare la registrazione.",
        showPassword: "Mostra password",
        hidePassword: "Nascondi password",
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
      lead: "I tuoi appuntamenti e i dati del profilo, tutto in un’unica pagina.",
      greeting: "Ciao",
      signOut: "Esci",
      emailLabel: "Email",
      phoneLabel: "Telefono",
      roleLabel: "Ruolo",
      joinedLabel: "Iscritto dal",
      detailsTitle: "I tuoi dati",
      adminRole: "Amministratore",
      adminPanelCta: "Pannello gestione",
      appointmentsCta: "I tuoi appuntamenti",
      metaTitle: "Account — Doctor Cuts",
      metaDescription: "Area personale Doctor Cuts.",
      appointments: {
        kicker: "Appuntamenti",
        title: ["I TUOI", "APPUNTAMENTI."],
        lead: "Gestisci le tue prenotazioni passate e future.",
        backToAccount: "Torna all’account",
        upcomingTitle: "Prossimi appuntamenti",
        pastTitle: "Storico",
        emptyUpcomingLead:
          "Non hai appuntamenti in arrivo. Prenota il prossimo taglio in pochi secondi.",
        emptyPastLead: "Nessun appuntamento nello storico.",
        bookCta: "Prenota ora",
        cancel: "Annulla",
        reschedule: "Riprogramma",
        confirmCancel: "Sei sicuro di voler annullare questo appuntamento?",
        confirmCancelPaid:
          "Annullare l’appuntamento? L’acconto di €5 verrà rimborsato.",
        tooLateHint:
          "Troppo tardi per modificare online. Contatta lo studio via WhatsApp o telefono.",
        depositPaid: "Acconto pagato",
        refLabel: "Rif.",
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
      contact: "Contatti",
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
      kicker: "Amministrazione",
      title: ["PANNELLO", "GESTIONE."],
      lead: "Gestisci servizi, appuntamenti, orari e galleria.",
      metaTitle: "Amministrazione — Doctor Cuts",
      metaDescription: "Pannello amministrativo Doctor Cuts.",
      nav: {
        section: "Amministrazione",
        backToSite: "Torna al sito",
        overview: "Panoramica",
        appointments: "Appuntamenti",
        services: "Servizi",
        hours: "Orari",
        customers: "Clienti",
        gallery: "Galleria",
        reviews: "Recensioni",
        settings: "Impostazioni",
      },
      overview: {
        kicker: "Panoramica",
        lead: "Agenda di oggi, chi è ancora in attesa, e chi ha già fatto.",
        viewAll: "Tutti gli appuntamenti",
        today: "Oggi",
        todayHint: "Prenotazioni pagate oggi",
        upcoming: "In arrivo",
        upcomingHint: "Dopo oggi",
        pending: "In attesa",
        pendingHint: "Acconto pagato, orario ancora da fare",
        completed: "Completati",
        completedHint: "Fatti negli ultimi 7 giorni",
        todaySchedule: "Agenda di oggi",
        emptyToday: "Nessun appuntamento oggi.",
        recentTitle: "Ultime prenotazioni",
        recentLead: "Create negli ultimi 7 giorni — restano visibili anche se l’orario è già passato.",
        emptyRecent: "Nessuna prenotazione recente.",
        upcomingSchedule: "Prossimi giorni",
        emptyUpcoming: "Niente in arrivo nei prossimi giorni.",
        quickActions: "Scorciatoie",
        actionAppointments: "Appuntamenti",
        actionServices: "Servizi",
        actionHours: "Orari",
        actionSettings: "Impostazioni",
        attention: "In attesa",
        attentionLead: "Acconto pagato, in attesa della data e dell’orario.",
        emptyPending: "Nessuna richiesta in attesa.",
        nextUp: "Prossimo",
        scheduleCount: "{count} in lista",
      },
      appointments: {
        kicker: "Appuntamenti",
        title: "Prenotazioni",
        lead: "In attesa = acconto pagato, orario ancora da fare. Completati = lo slot è passato. Annullati = rimborsati.",
        metaTitle: "Appuntamenti · Amministrazione — Doctor Cuts",
        ranges: { today: "Oggi", week: "7 giorni", month: "30 giorni", all: "Tutti" },
        rangeLabel: "Periodo",
        allStatuses: "Tutti",
        searchPlaceholder: "Cerca per nome, email, telefono o riferimento…",
        search: "Cerca",
        clear: "Pulisci",
        empty: "Nessun appuntamento con questi filtri.",
        unknownCustomer: "Cliente sconosciuto",
        guestBadge: "Ospite",
        depositPaid: "Acconto pagato",
        waitingLabel: "In attesa",
        cancelAndRefund: "Annulla e rimborsa",
        confirmCancelRefund: "Annullare l’appuntamento e rimborsare l’acconto?",
        refundedBadge: "Rimborsato",
        refundFailed: "Rimborso non riuscito. Riprova o controlla Stripe.",
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
        metaTitle: "Servizi · Amministrazione — Doctor Cuts",
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
        title: "Recensioni",
        lead: "Incolla fino a 5 recensioni da Google Maps per la homepage. Approva o togli quelle in evidenza quando vuoi.",
        empty: "Nessuna recensione ancora. Aggiungine una da Google qui sopra.",
        featured: "In evidenza",
        remove: "Elimina",
        statuses: { pending: "In attesa", approved: "Approvata", rejected: "Rifiutata" },
        sources: { site: "Sito", google: "Google" },
        addTitle: "Aggiungi da Google",
        addLead:
          "Apri la scheda Google del salone, copia nome e testo di una recensione vera, e salvala qui. Comparirà in homepage se è “in evidenza”.",
        authorLabel: "Nome",
        authorHint: "Come su Google (es. Marco R.)",
        ratingLabel: "Stelle",
        commentLabel: "Testo",
        commentHint: "Incolla il testo della recensione, senza inventarlo.",
        featuredLabel: "Mostra in homepage (max 5)",
        submit: "Salva recensione",
        success: "Recensione salvata.",
        errorInvalid: "Controlla nome, stelle e testo (min. 8 caratteri).",
        errorFeaturedLimit:
          "Hai già 5 recensioni in evidenza. Togline una prima di aggiungerne un’altra.",
        errorGeneric: "Salvataggio non riuscito. Riprova.",
        featuredCount: "In evidenza homepage: {count} / 5",
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
        requireConfirm: "Richiedi approvazione admin (altrimenti conferma automatica)",
        requireConfirmHint:
          "Se attivo, le prenotazioni restano in attesa finché non le confermi dal pannello.",
        bookingsEnabled: "Accetta prenotazioni online",
        bookingsEnabledHint:
          "Disattiva per sospendere le nuove prenotazioni. Gli slot liberati dalle cancellazioni tornano disponibili.",
        depositRequired: "Acconto di conferma (Stripe)",
        depositRequiredHint:
          "Se attivo e Stripe è configurato, il cliente paga l’acconto online per confermare. Senza chiavi il sito resta gratuito.",
        depositAmount: "Acconto (centesimi di euro)",
        depositAmountHint: "500 = € 5,00. Non può superare il prezzo del servizio.",
        save: "Salva impostazioni",
        saving: "Salvataggio…",
      },
      messages: {
        invalid: "Dati non validi.",
        slugTaken: 'Slug già in uso: "{slug}". Scegli uno slug diverso.',
        selectImage: "Seleziona un file immagine.",
        imageTooLarge: "Immagine troppo grande (max 10 MB).",
        uploaded: "Caricata.",
        saved: "Salvato.",
      },
      roles: {
        admin: "Amministratore",
        customer: "Cliente",
      },
      delete: "Elimina",
    },
  },
  header: {
    account: "Account",
    signIn: "Accedi",
  },
};

const en: Dictionary = {
  meta: {
    title: "Doctor Cuts",
    description:
      "Doctor Cuts is a men’s grooming studio in Macerata. Precise cuts, considered details. Via Antelmo Severini, 4/C.",
  },
  nav: {
    services: "Services",
    gallery: "Gallery",
    about: "About",
    reviews: "Reviews",
    contact: "Contact",
    book: "Book now",
    menu: "Menu",
    close: "Close",
    language: "Language",
  },
  lang: {
    it: "Italiano",
    en: "English",
  },
  hero: {
    kicker: "EST. 2025",
    lines: ["THE ART", "OF THE", "CUT."],
    sub: "Precision grooming for modern men.",
    cta: "Book now",
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
    minutes: "min",
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
        name: "Beard fade",
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
      "baby-cut": {
        name: "Kids’ cut (under 10)",
        blurb: "Haircut for children under 10",
        detail:
          "A gentle, efficient cut for younger clients, with patience and care. Designed for children under 10.",
        includes: [
          "Warm welcome",
          "Scissor or clipper cut",
          "Finishing",
          "Guidance for parents",
        ],
        ideal: "For children under 10.",
      },
      "face-threading": {
        name: "Face threading",
        blurb: "Thread hair removal for the face",
        detail:
          "Precise face threading: clean, controlled, and gentle on the skin. Ideal for definition and tidy lines.",
        includes: [
          "Skin preparation",
          "Thread hair removal",
          "Finishing",
          "Aftercare",
        ],
        ideal: "For a clean, defined face.",
      },
      "eyebrows-threading": {
        name: "Eyebrow threading",
        blurb: "Threaded brow definition",
        detail:
          "Brow definition and clean-up with threading. Natural shape, orderly lines.",
        includes: [
          "Shape assessment",
          "Thread hair removal",
          "Symmetry",
          "Finish",
        ],
        ideal: "For neat, natural brows.",
      },
      "hair-shampoo": {
        name: "Shampoo",
        blurb: "Hair wash",
        detail:
          "A dedicated hair wash. Freshness and care before a cut, or as a stand-alone service.",
        includes: ["Wash", "Scalp massage", "Rinse", "Light dry"],
        ideal: "For a quick, careful wash.",
      },
      "face-mask": {
        name: "Face mask",
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
        name: "Face massage",
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
      fade: "Fades",
      beard: "Beard",
      style: "Style",
      studio: "Studio",
    },
  },
  about: {
    kicker: "About",
    lines: ["BUILT AROUND", "GOOD TASTE."],
    body: "Doctor Cuts was created for people who notice the details. A studio in Macerata, cut out of the noise: low light, tools in place, a cut that holds.",
    yearLabel: "Established",
    locationLabel: "Location",
    findUs: "Find us",
    imageAlt: "Doctor Cuts interior in Macerata",
  },
  testimonials: {
    kicker: "Reviews",
    title: "What clients say",
    viaGoogle: "Google",
    moreOnGoogle: "more on Google",
    opensNew: "opens in a new tab",
    starsLabel: "{n} out of 5 stars",
  },
  location: {
    kicker: "Find us",
    addressTitle: "Address",
    hoursTitle: "Opening hours",
    contactsTitle: "Contacts",
    directions: "Directions",
    phone: "Phone",
    whatsapp: "WhatsApp",
    email: "Email",
    mapReveal: "Show map",
    mapAlt: "Map showing Doctor Cuts in Macerata",
  },
  footer: {
    rights: "All rights reserved.",
    backToTop: "Back to top",
    navLabel: "Navigation",
  },
  pages: {
    servizi: {
      kicker: "Services",
      title: ["EVERY SERVICE,", "ONE MORE DETAIL."],
      intro:
        "Every service is a ritual, not a list. Clear prices — tap a service to book now.",
      listLabel: "Service menu",
      priceCol: "Price",
      durationCol: "Duration",
      detailsHint: "Book",
      bookCta: "Book now",
      metaTitle: "Services — Doctor Cuts",
      metaDescription:
        "Cuts, fades, beard work, threading, and treatments. Men’s grooming services in Macerata.",
    },
    serviceDetail: {
      back: "Back to services",
      durationLabel: "Duration",
      priceLabel: "Price",
      includesLabel: "What’s included",
      idealLabel: "Ideal for",
      bookCta: "Book now",
      bookHint: "Pick a date and time online — this service is pre-selected.",
      relatedLabel: "Other services",
      viewAllServices: "View all",
    },
    galleria: {
      kicker: "Gallery",
      title: ["INSIDE", "THE STUDIO."],
      intro:
        "Cuts, details, and the room. Filter by category, tap a photo to open it full-screen.",
      heroImageAlt: "Doctor Cuts studio interior in Macerata",
      filterLabel: "Filter by",
      empty: "No photos in this category.",
      bookCta: "Book now",
      metaTitle: "Gallery — Doctor Cuts",
      metaDescription:
        "Selected cuts, fades, beard work, and interiors from Doctor Cuts in Macerata.",
    },
    storia: {
      kicker: "About",
      title: ["BUILT AROUND", "GOOD TASTE."],
      lead: "A studio in Macerata for people who treat their look as part of personal style — not a rush to the next chair.",
      heroImageAlt: "Doctor Cuts studio interior",
      storyLabel: "How we work",
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
      visitTitle: "Visit the studio",
      visitLead: "Book online or find us in Macerata.",
      bookCta: "Book now",
      findUsCta: "Find us",
      metaTitle: "About — Doctor Cuts",
      metaDescription:
        "How Doctor Cuts came to be in Macerata: a studio for people who treat their look as part of a personal style.",
    },
    contatti: {
      kicker: "Contact",
      title: ["WRITE,", "CALL,", "COME IN."],
      lead: "Book online, call, or message on WhatsApp. We reply during opening hours.",
      channelsTitle: "Channels",
      hoursTitle: "Hours",
      addressTitle: "Address",
      bookCta: "Book now",
      metaTitle: "Contact — Doctor Cuts",
      metaDescription: "Address, phone, and channels to reach Doctor Cuts in Macerata.",
    },
    prenota: {
      kicker: "Bookings",
      title: ["BOOK", "ONLINE."],
      lead: "Choose service, date, and time. Email confirmation — no account needed.",
      note: "Book up to 30 days in advance.",
      contactCta: "Call the studio",
      whatsappCta: "Message on WhatsApp",
      soon: "Coming soon",
      metaTitle: "Book — Doctor Cuts",
      metaDescription:
        "Book your appointment at Doctor Cuts in Macerata: pick a service, date, and time in seconds.",
      steps: {
        service: { title: "Service", lead: "What would you like?" },
        date: { title: "Date", lead: "Pick an available day." },
        calendar: {
          prevMonth: "Previous month",
          nextMonth: "Next month",
          today: "Today",
          weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          gridLabel: "Booking calendar",
        },
        time: {
          title: "Time",
          lead: "Only open slots are shown.",
          loading: "Loading available times…",
          empty: "No open slots on this day. Try another date.",
          pickDateFirst: "Pick a date first.",
          pickSlot: "Tap a time.",
          selectedLead: "Appointment at",
          groups: {
            morning: "Morning",
            afternoon: "Afternoon",
            evening: "Evening",
          },
          slotsAvailable: "{count} open",
          selected: "Selected: {time}",
          timezoneNote: "Times · Macerata",
          legendAvailable: "Open",
          legendBooked: "Taken",
          legendUnavailable: "Closed",
          booked: "Booked",
          unavailable: "Unavailable",
          legendLabel: "Time slot legend",
        },
      },
      notesLabel: "Notes (optional)",
      notesPlaceholder: "Style preferences, allergies, requests…",
      confirm: "Confirm booking",
      confirmReschedule: "Confirm new time",
      submitting: "Confirming…",
      submittingReschedule: "Updating appointment…",
      signInToBook: "Sign in to confirm",
      reschedule: {
        kicker: "Reschedule",
        title: "PICK A NEW TIME.",
        lead: "Your deposit stays valid. Only the date and time change.",
        lockedService: "Service is locked for this reschedule.",
        successTitle: "TIME UPDATED.",
        successBody: "Your appointment for {service} has been moved. We sent you an email.",
      },
      nextHint: {
        pickService: "Choose a service",
        pickDate: "Pick a date",
        pickTime: "Choose a time",
        addDetails: "Add your name and email",
        ready: "Ready to confirm",
        readyReschedule: "Ready to confirm the new time",
      },
      locked: {
        needService: "Choose a service first.",
        needDate: "Pick a date first.",
        needTime: "Choose a time first.",
      },
      guest: {
        title: "Your details",
        lead: "Confirmation by email — no account required.",
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
        closedTitle: "Bookings paused",
        closedLead:
          "Online booking is temporarily closed. Reach us on WhatsApp or by phone.",
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
        bookingsClosed:
          "Online booking is paused. Reach the studio on WhatsApp or by phone.",
        paymentFailed: "Payment didn’t start. Try again or message us on WhatsApp.",
      },
      payment: {
        stepTitle: "Confirm",
        stepLead: "A small deposit holds the time. You pay the rest in the studio.",
        banner: "To confirm, you pay a deposit now. The rest is at the till — no surprises.",
        servicePrice: "Service price",
        payNow: "Pay now to confirm",
        payInShop: "In studio",
        payInShopZero: "Nothing left to pay in studio",
        holdNote: "This time is held for 30 minutes while you pay.",
        trustProvider: "Secure payment with Stripe",
        trustSecure: "Your bank may ask for a one-time code (3D Secure).",
        cta: "Pay {amount} and confirm",
        submitting: "Opening secure payment…",
        nextHint: "Check the summary and pay to confirm",
        summaryNow: "Now",
        result: {
          processingTitle: "Confirming your payment",
          processingLead:
            "If you’ve already paid, wait a few seconds and refresh. If you closed Stripe, you can try again below.",
          unpaidTitle: "Booking not confirmed",
          unpaidLead:
            "Payment didn’t go through or was cancelled. The slot is still yours for a few minutes.",
          retry: "Try payment again",
          missingTitle: "Link not valid",
          missingLead: "This payment link is expired or incorrect. Please book again.",
        },
      },
      a11y: {
        progress: "Booking progress",
        slotLegend: "Time slot legend",
      },
    },
    gestisci: {
      kicker: "Booking",
      title: "Your appointment",
      lead: "Reschedule or cancel this booking from this page.",
      missing: "Booking not found.",
      missingLead:
        "This link is invalid or expired. Check the confirmation email or get in touch.",
      cancelled: "Booking cancelled.",
      cancel: "Cancel booking",
      reschedule: "Reschedule",
      confirmCancel: "Cancel this appointment?",
      confirmCancelPaid:
        "Cancel this booking? Your €5 deposit will be refunded.",
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
        lead: "Enter your email and password to view and manage your appointments.",
        emailLabel: "Email",
        passwordLabel: "Password",
        submit: "Sign in",
        pendingSubmit: "Signing in…",
        noAccountPrompt: "Don’t have an account?",
        noAccountLink: "Create an account",
        showPassword: "Show password",
        hidePassword: "Hide password",
        metaTitle: "Sign in — Doctor Cuts",
        metaDescription: "Access your Doctor Cuts account.",
      },
      signUp: {
        kicker: "Create account",
        title: ["CREATE YOUR", "ACCOUNT."],
        lead: "Fill in the fields below. You’ll use this to book and manage appointments.",
        nameLabel: "Full name",
        phoneLabel: "Phone",
        emailLabel: "Email",
        passwordLabel: "Password (min. 8 characters)",
        submit: "Create account",
        pendingSubmit: "Creating…",
        haveAccountPrompt: "Already have an account?",
        haveAccountLink: "Sign in",
        checkEmail: "Check your inbox to confirm your address.",
        showPassword: "Show password",
        hidePassword: "Hide password",
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
      lead: "Your appointments and profile details — all on one page.",
      greeting: "Hello",
      signOut: "Sign out",
      emailLabel: "Email",
      phoneLabel: "Phone",
      roleLabel: "Role",
      joinedLabel: "Member since",
      detailsTitle: "Your details",
      adminRole: "Admin",
      adminPanelCta: "Admin panel",
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
        reschedule: "Reschedule",
        confirmCancel: "Are you sure you want to cancel this appointment?",
        confirmCancelPaid:
          "Cancel this appointment? Your €5 deposit will be refunded.",
        tooLateHint:
          "It’s too late to change this online. Reach us on WhatsApp or by phone.",
        depositPaid: "Deposit paid",
        refLabel: "Ref.",
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
      contact: "Contact",
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
        lead: "Today’s chair, who is still waiting, and who already came in.",
        viewAll: "All appointments",
        today: "Today",
        todayHint: "Paid bookings today",
        upcoming: "Upcoming",
        upcomingHint: "After today",
        pending: "Waiting",
        pendingHint: "Deposit paid, slot still ahead",
        completed: "Completed",
        completedHint: "Done in the last 7 days",
        todaySchedule: "Today’s schedule",
        emptyToday: "Nothing on the schedule today.",
        recentTitle: "Latest bookings",
        recentLead: "Created in the last 7 days — still listed after the chair time has passed.",
        emptyRecent: "No recent bookings.",
        upcomingSchedule: "Coming up",
        emptyUpcoming: "Nothing booked in the next days.",
        quickActions: "Shortcuts",
        actionAppointments: "Appointments",
        actionServices: "Services",
        actionHours: "Hours",
        actionSettings: "Settings",
        attention: "Waiting",
        attentionLead: "Deposit paid, waiting for their date and time.",
        emptyPending: "No pending requests.",
        nextUp: "Next up",
        scheduleCount: "{count} listed",
      },
      appointments: {
        kicker: "Appointments",
        title: "Bookings",
        lead: "Waiting = deposit paid, time still ahead. Completed = the slot has passed. Cancelled = refunded.",
        metaTitle: "Appointments · Admin — Doctor Cuts",
        ranges: { today: "Today", week: "7 days", month: "30 days", all: "All" },
        rangeLabel: "When",
        allStatuses: "All",
        searchPlaceholder: "Search by name, email, phone, or reference…",
        search: "Search",
        clear: "Clear",
        empty: "No bookings match these filters.",
        unknownCustomer: "Unknown customer",
        guestBadge: "Guest",
        depositPaid: "Deposit paid",
        waitingLabel: "Waiting",
        cancelAndRefund: "Cancel and refund",
        confirmCancelRefund: "Cancel this appointment and refund the deposit?",
        refundedBadge: "Refunded",
        refundFailed: "Refund failed. Try again or check Stripe.",
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
        title: "Reviews",
        lead: "Paste up to 5 Google Maps reviews for the homepage. Feature or unfeature anytime.",
        empty: "No reviews yet. Add one from Google above.",
        featured: "Featured",
        remove: "Delete",
        statuses: { pending: "Pending", approved: "Approved", rejected: "Rejected" },
        sources: { site: "Site", google: "Google" },
        addTitle: "Add from Google",
        addLead:
          "Open the shop’s Google place, copy a real reviewer’s name and text, and save it here. It appears on the homepage when featured.",
        authorLabel: "Name",
        authorHint: "As on Google (e.g. Marco R.)",
        ratingLabel: "Stars",
        commentLabel: "Review text",
        commentHint: "Paste the review text — don’t invent it.",
        featuredLabel: "Show on homepage (max 5)",
        submit: "Save review",
        success: "Review saved.",
        errorInvalid: "Check name, stars, and text (min. 8 characters).",
        errorFeaturedLimit: "You already have 5 featured reviews. Unfeature one first.",
        errorGeneric: "Couldn’t save. Try again.",
        featuredCount: "Featured on homepage: {count} / 5",
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
        requireConfirm: "Require admin approval (otherwise auto-confirm)",
        requireConfirmHint:
          "When on, bookings stay pending until you confirm them in admin.",
        bookingsEnabled: "Accept online bookings",
        bookingsEnabledHint:
          "Turn off to pause new bookings. Cancelled appointments free their slots again.",
        depositRequired: "Confirmation deposit (Stripe)",
        depositRequiredHint:
          "When on and Stripe is configured, customers pay the deposit online to confirm. Without keys, booking stays free.",
        depositAmount: "Deposit (euro cents)",
        depositAmountHint: "500 = €5.00. Never more than the service price.",
        save: "Save settings",
        saving: "Saving…",
      },
      messages: {
        invalid: "Invalid details.",
        slugTaken: 'Slug already in use: "{slug}". Choose a different slug.',
        selectImage: "Select an image file.",
        imageTooLarge: "Image too large (max 10 MB).",
        uploaded: "Uploaded.",
        saved: "Saved.",
      },
      roles: {
        admin: "Admin",
        customer: "Customer",
      },
      delete: "Delete",
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
