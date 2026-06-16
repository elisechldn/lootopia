import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-card py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Conditions générales d&apos;utilisation
        </h1>
        <p className="text-sm text-foreground/60 mb-10">
          Dernière mise à jour : 16 juin 2026
        </p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            1. Objet et acceptation
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Les présentes conditions générales d&apos;utilisation (CGU)
            régissent l&apos;accès et l&apos;utilisation de la plateforme
            Lootopia, accessible via le site web et l&apos;application mobile.
            En créant un compte ou en utilisant le service, vous acceptez
            pleinement et sans réserve les présentes CGU. Si vous n&apos;en
            acceptez pas les termes, vous devez cesser d&apos;utiliser le
            service immédiatement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            2. Description du service
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Lootopia est une plateforme SaaS permettant à des partenaires
            (entreprises, collectivités, organisateurs d&apos;événements) de
            créer et gérer des chasses au trésor géolocalisées en réalité
            augmentée. Les joueurs participent à ces chasses via des QR codes,
            progressent d&apos;étape en étape grâce à des indices géolocalisés,
            et collectent des récompenses virtuelles en capturant des objets AR.
            Lootopia se positionne en tant qu&apos;intermédiaire technique
            entre les partenaires et les joueurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            3. Inscription et compte utilisateur
          </h2>
          <div className="text-foreground/80 leading-relaxed space-y-3">
            <p>
              L&apos;accès au service nécessite la création d&apos;un compte.
              Vous devez avoir au minimum <strong>13 ans</strong> pour vous
              inscrire. Les mineurs de moins de 16 ans doivent disposer du
              consentement parental conformément au RGPD.
            </p>
            <p>
              Vous vous engagez à fournir des informations exactes, complètes et
              à jour lors de votre inscription et à les maintenir à jour. Vous
              êtes seul responsable de la confidentialité de votre mot de passe
              et de toute activité effectuée depuis votre compte.
            </p>
            <p>
              Lootopia se réserve le droit de suspendre ou supprimer tout compte
              en cas de violation des présentes CGU, sans préavis ni indemnité.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            4. Utilisation acceptable
          </h2>
          <p className="text-foreground/80 leading-relaxed mb-3">
            En utilisant Lootopia, vous vous engagez à :
          </p>
          <ul className="list-disc list-inside text-foreground/80 space-y-2 leading-relaxed">
            <li>
              Ne pas falsifier votre localisation GPS pour contourner les
              conditions de validation des étapes.
            </li>
            <li>
              Respecter les lieux, propriétés privées et réglementations locales
              lors de votre participation aux chasses au trésor.
            </li>
            <li>
              Ne pas tenter d&apos;accéder à des fonctionnalités, données ou
              comptes auxquels vous n&apos;êtes pas autorisé.
            </li>
            <li>
              Ne pas diffuser de contenus illicites, offensants ou portant
              atteinte aux droits de tiers via la plateforme.
            </li>
            <li>
              Ne pas utiliser de scripts, bots ou outils automatisés pour
              interagir avec le service.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            5. Propriété intellectuelle
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            L&apos;ensemble des éléments constitutifs de la plateforme Lootopia
            (logo, interface, textes, code source, objets AR, sons) sont
            protégés par le droit de la propriété intellectuelle et restent la
            propriété exclusive de Lootopia. Toute reproduction, représentation,
            modification ou exploitation non autorisée est interdite. Les
            contenus créés par les partenaires (parcours, indices, récompenses)
            restent la propriété de ces derniers ; ils accordent à Lootopia une
            licence non exclusive et limitée à la durée du contrat partenaire
            pour les héberger et les diffuser.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            6. Limitation de responsabilité
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Lootopia est un projet pédagogique fourni &quot;en l&apos;état&quot;,
            sans garantie d&apos;aucune sorte, expresse ou implicite. Lootopia
            ne saurait être tenu responsable de dommages directs ou indirects
            résultant de l&apos;utilisation ou de l&apos;impossibilité
            d&apos;utiliser le service, de pertes de données, de dommages
            corporels survenant lors de la participation physique aux chasses au
            trésor, ou de tout préjudice lié à un contenu partenaire. La
            participation aux chasses au trésor s&apos;effectue sous votre
            entière responsabilité.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            7. Modification des CGU
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Lootopia se réserve le droit de modifier les présentes CGU à tout
            moment. Toute modification substantielle sera notifiée par e-mail
            avec un préavis minimum de <strong>30 jours</strong>. La poursuite
            de l&apos;utilisation du service après ce délai vaut acceptation des
            nouvelles CGU. En cas de refus, vous devez supprimer votre compte
            avant l&apos;entrée en vigueur des modifications.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-3">
            8. Droit applicable et juridiction
          </h2>
          <p className="text-foreground/80 leading-relaxed">
            Les présentes CGU sont soumises au droit français. En cas de litige,
            et à défaut de résolution amiable, les tribunaux compétents seront
            ceux du ressort de Paris, France.
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
