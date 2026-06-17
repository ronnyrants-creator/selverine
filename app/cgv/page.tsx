import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — SELVERINE',
  description: 'Conditions Générales de Vente (CGV) de SELVERINE — Rituel Capillaire Premium.',
};

export default function CGVPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <Link href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à l&apos;accueil
        </Link>

        <h1>Conditions Générales de Vente</h1>
        <span className="legal-date">Dernière mise à jour : juin 2026</span>

        <h2>1. Objet</h2>
        <p>Les présentes Conditions Générales de Vente (CGV) régissent l&apos;ensemble des transactions conclues entre <strong>SELVERINE</strong> et ses clients à l&apos;occasion de la vente de produits cosmétiques capillaires proposés sur le site.</p>

        <h2>2. Produits</h2>
        <p>SELVERINE commercialise des produits de soin capillaire premium. Les caractéristiques essentielles des produits sont présentées sur le site. Les photographies ne sont pas contractuelles.</p>

        <h2>3. Prix</h2>
        <p>Les prix sont indiqués en Dirhams marocains (DH), toutes taxes comprises. SELVERINE se réserve le droit de modifier ses prix à tout moment, étant entendu que le prix applicable à la commande est celui en vigueur au moment de la validation de la commande.</p>

        <h2>4. Commandes</h2>
        <p>Toute commande implique l&apos;acceptation des présentes CGV. Le processus de commande se déroule comme suit :</p>
        <ul>
          <li>Le client remplit le formulaire de commande avec ses coordonnées</li>
          <li>Un conseiller SELVERINE le contacte dans les 2 heures pour confirmer la commande</li>
          <li>La commande est expédiée après confirmation téléphonique</li>
        </ul>

        <h2>5. Paiement</h2>
        <p>Le paiement s&apos;effectue <strong>à la livraison</strong>, en espèces, au moment de la réception du colis. Aucun paiement en ligne n&apos;est requis lors de la passation de commande.</p>

        <h2>6. Livraison</h2>
        <p>La livraison est assurée partout au Maroc dans un délai de <strong>24 à 48 heures</strong> ouvrées après confirmation de la commande. Les frais de livraison varient selon le montant de la commande :</p>
        <ul>
          <li>Livraison offerte à partir de 2 flacons commandés</li>
          <li>Livraison payante pour 1 flacon (frais indiqués au moment de la commande)</li>
        </ul>

        <h2>7. Droit de retour et remboursement</h2>
        <p>SELVERINE offre une <strong>garantie satisfaite ou remboursée de 30 jours</strong>. Si vous avez utilisé le produit quotidiennement pendant 30 jours et que vous n&apos;êtes pas satisfaite des résultats, nous vous remboursons intégralement, sans condition ni question.</p>
        <p>Pour initier un retour, contactez-nous à : <a href="mailto:contact@selverine.com">contact@selverine.com</a>.</p>

        <h2>8. Service client</h2>
        <p>Notre équipe est disponible 7j/7, de 9h à 21h pour répondre à toutes vos questions :</p>
        <ul>
          <li>E-mail : <a href="mailto:contact@selverine.com">contact@selverine.com</a></li>
        </ul>

        <h2>9. Responsabilité</h2>
        <p>Les produits SELVERINE sont formulés pour un usage topique externe. En cas de réaction allergique, cessez immédiatement l&apos;utilisation et consultez un médecin. SELVERINE décline toute responsabilité pour une utilisation non conforme aux instructions.</p>

        <h2>10. Droit applicable</h2>
        <p>Les présentes CGV sont soumises au droit marocain. En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, les tribunaux compétents seront ceux du siège social de SELVERINE.</p>

        <h2>11. Modification des CGV</h2>
        <p>SELVERINE se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur au moment de la passation de la commande.</p>

        <h2>12. Contact</h2>
        <p>Pour toute question relative aux présentes CGV : <a href="mailto:contact@selverine.com">contact@selverine.com</a></p>
      </div>
    </main>
  );
}
