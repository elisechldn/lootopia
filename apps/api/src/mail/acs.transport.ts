import { EmailClient, type EmailContent } from '@azure/communication-email';
import type { Transport } from 'nodemailer';
import type MailMessage from 'nodemailer/lib/mailer/mail-message';

type Addressable =
  | string
  | { address?: string; name?: string }
  | Array<string | { address?: string; name?: string }>
  | undefined;

/**
 * Extrait les adresses email d'un champ nodemailer (string, objet, ou tableau).
 * Gère le format "Nom <email@domaine>" et les objets { address }.
 */
function extractAddresses(value: Addressable): string[] {
  if (!value) return [];
  const items = Array.isArray(value) ? value : [value];
  const result: string[] = [];

  for (const item of items) {
    if (typeof item === 'string') {
      const match = item.match(/<([^>]+)>/);
      const addr = (match?.[1] ?? item).trim();
      if (addr) result.push(addr);
    } else if (item?.address) {
      result.push(item.address.trim());
    }
  }
  return result;
}

/**
 * Transport nodemailer custom qui envoie via Azure Communication Services Email.
 * Permet de conserver @nestjs-modules/mailer (rendu Handlebars) en remplaçant
 * uniquement la couche d'envoi — aucune authentification Entra requise (clé ACS).
 */
export function createAcsTransport(connectionString: string): Transport {
  const client = new EmailClient(connectionString);

  return {
    name: 'azure-communication-email',
    version: '1.0.0',

    send(
      mail: MailMessage,
      callback: (err: Error | null, info?: unknown) => void,
    ): void {
      const data = mail.data;

      const senderAddress = extractAddresses(data.from as Addressable)[0];
      const to = extractAddresses(data.to as Addressable).map((address) => ({
        address,
      }));
      const cc = extractAddresses(data.cc as Addressable).map((address) => ({
        address,
      }));
      const bcc = extractAddresses(data.bcc as Addressable).map((address) => ({
        address,
      }));

      if (!senderAddress) {
        callback(
          new Error('ACS transport: adresse expéditeur (from) manquante'),
        );
        return;
      }
      if (to.length === 0) {
        callback(new Error('ACS transport: aucun destinataire (to)'));
        return;
      }

      const html = typeof data.html === 'string' ? data.html : undefined;
      const plainText = typeof data.text === 'string' ? data.text : undefined;

      const subject = data.subject ?? '';
      const content: EmailContent = html
        ? { subject, html, ...(plainText ? { plainText } : {}) }
        : { subject, plainText: plainText ?? '' };

      client
        .beginSend({
          senderAddress,
          content,
          recipients: {
            to,
            ...(cc.length ? { cc } : {}),
            ...(bcc.length ? { bcc } : {}),
          },
        })
        .then((poller) => poller.pollUntilDone())
        .then((result) =>
          callback(null, { messageId: result.id, response: result.status }),
        )
        .catch((err: unknown) =>
          callback(err instanceof Error ? err : new Error(String(err))),
        );
    },
  };
}
