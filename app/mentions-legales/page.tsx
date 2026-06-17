import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales — SELVERINE',
  description: 'Mentions légales de SELVERINE — Rituel Capillaire Premium.',
};

export default function MentionsLegalesPage() {
  return (
    <main className="legal-page">
      <div className="container">
        <Link href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Retour à l&apos;accueil
        </Link>

        <h1>Mentions légales</h1>
        <span className="legal-date">Dernière mise à jour : juin 2026</span>

        <h2>1. Éditeur du site</h2>
        <p>Le site <strong>selverine.com</strong> est édité par la société <strong>SELVERINE</strong>, entreprise spécialisée dans la cosmétique capillaire premium.</p>
        <ul>
          <li><strong>Dénomination :</strong> SELVERINE</li>
          <li><strong>E-mail :</strong> <a href="mailto:contact@selverine.com">contact@selverine.com</a></li>
          <li><strong>Activité :</strong> Vente de produits cosmétiques capillaires</li>
        </ul>

        <h2>2. Directeur de la publication</h2>
        <p>Le directeur de la publication est le représentant légal de la société SELVERINE.</p>

        <h2>3. Hébergement</h2>
        <p>Ce site est hébergé par un prestataire tiers. Pour toute question relative à l&apos;hébergement, contactez-nous à l&apos;adresse <a href="mailto:contact@selverine.com">contact@selverine.com</a>.</p>

        <h2>4. Propriété intellectuelle</h2>
        <p>L&apos;ensemble du contenu de ce site (textes, images, logos, visuels, mise en page) est protégé par le droit d&apos;auteur et appartient à SELVERINE ou à ses partenaires. Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.</p>

        <h2>5. Limitation de responsabilité</h2>
        <p>SELVERINE s&apos;efforce de maintenir les informations de ce site à jour et exactes. Toutefois, nous ne pouvons garantir l&apos;exhaustivité ni l&apos;exactitude de toutes les informations publiées. SELVERINE décline toute responsabilité pour les dommages résultant de l&apos;utilisation du site.</p>

        <h2>6. Données personnelles</h2>
        <p>Pour toute question concernant la collecte et le traitement de vos données personnelles, veuillez consulter notre <Link href="/confidentialite">Politique de confidentialité</Link>.</p>

        <h2>7. Contact</h2>
        <p>Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter par e-mail à l&apos;adresse : <a href="mailto:contact@selverine.com">contact@selverine.com</a>.</p>
      </div>
    </main>
  );
}
