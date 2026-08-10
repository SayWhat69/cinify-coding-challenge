/**
 * Diese Interfaces beschreiben nur die Schnittstelle, die die UI-Komponenten
 * erwarten. Das Laden/Bereinigen/Berechnen der echten Termindaten ist bewusst
 * nicht Teil dieses Frontends — hier gibt es nur Mock-Daten in derselben Form.
 */

export interface Wochenstatistik {
  woche: string;
  zeitraumLabel: string;
  gebuchtProzent: number;
  realisiertProzent: number;
}

export interface ArztStatistik {
  arzt: string;
  auslastungProzent: number;
}

export interface BehandlungsartStatistik {
  behandlungsart: string;
  anzahl: number;
}

export interface Ausschluss {
  termin_id: string;
  grund: string;
  datum: string;
}

export interface DashboardDaten {
  praxis: string;
  zeitraumLabel: string;
  oeffnungszeitenHinweis: string;
  gesamt: {
    gebuchtProzent: number;
    realisiertProzent: number;
    lueckeProzent: number;
    noShowQuoteProzent: number;
    anzahlTermineGesamt: number;
    anzahlNoShow: number;
  };
  wochen: Wochenstatistik[];
  aerzte: ArztStatistik[];
  behandlungsarten: BehandlungsartStatistik[];
  ausschluesse: Ausschluss[];
  fehlenderStatus: number;
  korrigierteDauerAnzahl: number;
}
