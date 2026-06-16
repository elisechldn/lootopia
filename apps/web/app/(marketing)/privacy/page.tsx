import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-card py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Politique de confidentialité
        </h1>
        <p className="text-sm text-foreground/60 mb-10">
          Dernière mise à jour : 16 juin 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            1. Responsable du traitement
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Lootopia est un projet pédagogique réalisé dans le cadre d&apos;un
            cursus à SUP DE VINCI. Le responsable du traitement des données est
            l&apos;équipe projet Lootopia, joignable à l&apos;adresse :{" "}
            <a
              href="mailto:privacy@lootopia.fr"
              className="underline hover:text-foreground transition-colors"
            >
              privacy@lootopia.fr
            </a>
            .
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            2. Données collectées
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            Dans le cadre de la fourniture du service, nous collectons les
            données suivantes :
          </p>
          <ul className="list-disc list-inside text-foreground/80 space-y-1 leading-relaxed">
            <li>
              <strong>Données d&apos;identification :</strong> nom, adresse
              e-mail, mot de passe (stocké sous forme hachée).
            </li>
            <li>
              <strong>Données de localisation GPS :</strong> collectées
              uniquement lors de la participation active à une chasse au trésor,
              afin de valider les zones géographiques des étapes.
            </li>
            <li>
              <strong>Données d&apos;utilisation :</strong> progression dans les
              chasses, récompenses obtenues, historique de participation.
            </li>
            <li>
              <strong>Données techniques :</strong> adresse IP, type de
              navigateur, identifiants de session (token JWT).
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            3. Finalités et bases légales
          </h2>
          <div className="text-foreground/80 leading-relaxed space-y-3">
            <p>
              <strong>Exécution du contrat (art. 6.1.b RGPD) :</strong>{" "}
              traitement des données d&apos;identification et de progression
              pour fournir le service de chasses au trésor.
            </p>
            <p>
              <strong>Consentement (art. 6.1.a RGPD) :</strong> collecte de la
              localisation GPS. Vous pouvez retirer ce consentement à tout
              moment en cessant d&apos;utiliser le service de géolocalisation,
              sans que cela n&apos;affecte les traitements déjà effectués.
            </p>
            <p>
              <strong>Intérêt légitime (art. 6.1.f RGPD) :</strong> journaux
              techniques pour assurer la sécurité et la stabilité de la
              plateforme.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            4. Durée de conservation
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Vos données personnelles sont conservées pendant toute la durée
            d&apos;activité de votre compte. En cas de suppression du compte,
            l&apos;ensemble des données est effacé dans un délai de 30 jours,
            sauf obligation légale contraire. Les journaux techniques sont
            conservés 12 mois.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            5. Vos droits (RGPD)
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD — Règlement UE 2016/679), vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-foreground/80 space-y-1 leading-relaxed">
            <li>
              <strong>Droit d&apos;accès</strong> : obtenir une copie de vos
              données.
            </li>
            <li>
              <strong>Droit de rectification</strong> : corriger des données
              inexactes.
            </li>
            <li>
              <strong>Droit à l&apos;effacement</strong> : demander la
              suppression de vos données.
            </li>
            <li>
              <strong>Droit à la portabilité</strong> : recevoir vos données
              dans un format structuré.
            </li>
            <li>
              <strong>Droit d&apos;opposition</strong> : vous opposer à un
              traitement basé sur l&apos;intérêt légitime.
            </li>
            <li>
              <strong>Droit à la limitation</strong> : restreindre
              temporairement un traitement.
            </li>
          </ul>
          <p className="text-foreground/80 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à{" "}
            <a
              href="mailto:privacy@lootopia.fr"
              className="underline hover:text-foreground transition-colors"
            >
              privacy@lootopia.fr
            </a>
            . Vous avez également le droit d&apos;introduire une réclamation
            auprès de la CNIL (
            <span className="font-medium">www.cnil.fr</span>).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            6. Hébergement et transferts
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Les données sont hébergées sur des serveurs Microsoft Azure situés
            dans l&apos;Union Européenne (région Europe de l&apos;Ouest). Aucun
            transfert de données vers des pays tiers n&apos;est effectué.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            7. Cookies et traceurs
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Lootopia utilise uniquement des cookies techniques strictement
            nécessaires au fonctionnement du service (token de session JWT).
            Aucun cookie publicitaire ou de profilage n&apos;est utilisé. Ces
            cookies ne nécessitent pas de consentement préalable au sens de
            l&apos;article 82 de la loi Informatique et Libertés.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            8. Modifications de la présente politique
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Nous nous réservons le droit de modifier cette politique à tout
            moment. Toute modification substantielle sera notifiée par e-mail
            avec un préavis de 30 jours. La date de dernière mise à jour est
            indiquée en haut de cette page.
          </p>
        </section>

        <Link
          href="/"
          className="text-sm text-foreground/60 underline hover:text-foreground transition-colors"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
