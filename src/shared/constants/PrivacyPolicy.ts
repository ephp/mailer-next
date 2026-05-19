// Keep this template in sync with App\Service\PrivacyPolicyService::DEFAULT_TEMPLATE on the backend.
export const DEFAULT_PRIVACY_POLICY = `Informativa sulla privacy

Ai sensi del Regolamento (UE) 2016/679 (GDPR) ti informiamo che i dati personali da te forniti (indirizzo email, e facoltativamente nome, cognome e numero di telefono) saranno trattati nel rispetto dei principi di liceità, correttezza e trasparenza.

**Titolare del trattamento**
[[nome_account]]
Email di contatto: [[email_contatto_account]]
[[indirizzo_account]]

**Finalità del trattamento**
I dati raccolti tramite questo form saranno utilizzati esclusivamente da [[nome_account]] per inviarti comunicazioni email a scopo promozionale relative a eventi, iniziative e attività organizzate dal titolare.

**Base giuridica**
Il trattamento si fonda sul tuo consenso esplicito, che puoi revocare in qualsiasi momento senza pregiudicare la liceità del trattamento basato sul consenso prestato prima della revoca.

**Conservazione dei dati**
I dati saranno conservati fino alla revoca del consenso o alla richiesta di cancellazione.

**Disiscrizione e diritti dell'interessato**
Puoi disiscriverti in qualsiasi momento utilizzando il link di disiscrizione presente in ogni email ricevuta. Hai inoltre il diritto di accedere ai tuoi dati, di chiederne la rettifica o la cancellazione, di limitarne o opporti al trattamento, e di proporre reclamo all'Autorità Garante per la protezione dei dati personali. Per esercitare questi diritti puoi scrivere a [[email_contatto_account]].

**Comunicazione e trasferimento dei dati**
I dati non saranno ceduti a terzi né trasferiti al di fuori dello Spazio Economico Europeo, fatto salvo l'utilizzo di servizi tecnici (es. provider di posta elettronica) necessari all'erogazione del servizio.

Spuntando la casella di accettazione confermi di aver letto e compreso questa informativa.`;

export interface PrivacyPlaceholders {
  nome_account?: string | null;
  email_contatto_account?: string | null;
  indirizzo_account?: string | null;
  partita_iva_account?: string | null;
  mail_from_account?: string | null;
  mail_from_name_account?: string | null;
}

export const renderPrivacyPlaceholders = (tpl: string, p: PrivacyPlaceholders): string => {
  const map: Record<string, string> = {
    '[[nome_account]]': p.nome_account ?? '',
    '[[email_contatto_account]]': p.email_contatto_account ?? '',
    '[[indirizzo_account]]': p.indirizzo_account ?? '',
    '[[partita_iva_account]]': p.partita_iva_account ?? '',
    '[[mail_from_account]]': p.mail_from_account ?? '',
    '[[mail_from_name_account]]': p.mail_from_name_account ?? '',
  };
  return Object.entries(map).reduce((acc, [k, v]) => acc.split(k).join(v), tpl);
};
