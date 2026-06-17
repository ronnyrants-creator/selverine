import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — SELVERINE',
  description: 'Politique de confidentialité de SELVERINE — comment nous protégeons vos données personnelles.',
};

export default function ConfidentialitePage() {
  return (
    <main className="legal-page">
      <div className="container">
        <Link href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à l&apos;accueil
        </Link>

        <h1>Politique de confidentialité</h1>
        <span className="legal-date">Dernière mise à jour : juin 2026</span>

        <h2>1. Responsable du traitement</h2>
        <p>Le responsable du traitement des données personnelles collectées sur ce site est <strong>SELVERINE</strong>.</p>
        <p>Contact : <a href="mailto:contact@selverine.com">contact@selverine.com</a></p>

        <h2>2. Données collectées</h2>
        <p>Dans le cadre de la passation de commandes et de nos communications, nous collectons les données suivantes :</p>
        <ul>
          <li>Nom et prénom</li>
          <li>Numéro de téléphone</li>
          <li>Ville de livraison</li>
        </ul>
        <p>Ces données sont collectées exclusivement dans le but de traiter votre commande et vous contacter pour confirmer la livraison.</p>

        <h2>3. Finalité du traitement</h2>
        <p>Les données personnelles collectées sont utilisées pour :</p>
        <ul>
          <li>Traiter et confirmer vos commandes</li>
          <li>Organiser la livraison de vos produits</li>
          <li>Vous contacter pour le suivi de commande par téléphone ou e-mail</li>
        </ul>
        <p>Nous ne vendons, n&apos;échangeons ni ne louons jamais vos données personnelles à des tiers.</p>

        <h2>4. Durée de conservation</h2>
        <p>Vos données sont conservées pendant une durée maximale de 3 ans à compter de votre dernière commande, conformément aux obligations légales en vigueur.</p>

        <h2>5. Vos droits</h2>
        <p>Conformément à la réglementation applicable, vous disposez des droits suivants concernant vos données personnelles :</p>
        <ul>
          <li><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</li>
          <li><strong>Droit de rectification :</strong> corriger des données inexactes</li>
          <li><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</li>
          <li><strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à l&apos;adresse : <a href="mailto:contact@selverine.com">contact@selverine.com</a></p>

        <h2>6. Cookies</h2>
        <p>Ce site peut utiliser des cookies techniques nécessaires au bon fonctionnement de la navigation. Aucun cookie de traçage publicitaire n&apos;est utilisé sans votre consentement préalable.</p>

        <h2>7. Sécurité des données</h2>
        <p>SELVERINE met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte ou divulgation.</p>

        <h2>8. Contact</h2>
        <p>Pour toute question relative à notre politique de confidentialité : <a href="mailto:contact@selverine.com">contact@selverine.com</a></p>
      </div>
    </main>
  );
}
