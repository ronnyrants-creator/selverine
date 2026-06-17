import { prisma } from '@/lib/prisma';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new:       { label: 'Nouvelle',  color: '#2563eb' },
  confirmed: { label: 'Confirmée', color: '#d97706' },
  delivered: { label: 'Livrée',    color: '#16a34a' },
  cancelled: { label: 'Annulée',   color: '#dc2626' },
};

async function updateStatus(formData: FormData) {
  'use server';
  const id     = Number(formData.get('id'));
  const status = formData.get('status') as string;
  await prisma.order.update({ where: { id }, data: { status } });
}

export default async function AdminPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });

  const counts = {
    total:     orders.length,
    new:       orders.filter(o => o.status === 'new').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  return (
    <div style={{ fontFamily: 'Inter, sans-serif', background: '#f5f0ea', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', color: '#18382F', margin: 0 }}>
              SELVERINE — Admin
            </h1>
            <p style={{ color: '#6b6b6b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Tableau de bord des commandes
            </p>
          </div>
          <a href="/" style={{ fontSize: '0.8rem', color: '#18382F', textDecoration: 'underline' }}>
            ← Retour au site
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total',      value: counts.total,     bg: '#18382F', color: '#fff' },
            { label: 'Nouvelles',  value: counts.new,       bg: '#fff',    color: '#2563eb' },
            { label: 'Confirmées', value: counts.confirmed, bg: '#fff',    color: '#d97706' },
            { label: 'Livrées',    value: counts.delivered, bg: '#fff',    color: '#16a34a' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: 8,
              padding: '1.2rem 1.5rem',
              border: '1px solid #e8e3dc',
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 600, color: stat.color, lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '0.78rem', color: stat.bg === '#18382F' ? 'rgba(255,255,255,0.6)' : '#6b6b6b', marginTop: '0.3rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e8e3dc', overflow: 'hidden' }}>
          {orders.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', color: '#a0a0a0' }}>
              Aucune commande pour le moment.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e8e3dc', background: '#fafaf8' }}>
                  {['Réf.', 'Nom', 'Téléphone', 'Ville', 'Flacons', 'Total', 'Statut', 'Date', 'Action'].map(h => (
                    <th key={h} style={{
                      padding: '0.85rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: '#6b6b6b',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const s = STATUS_LABELS[order.status] ?? { label: order.status, color: '#6b6b6b' };
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f0ebe4', background: i % 2 === 0 ? '#fff' : '#fdfcfb' }}>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.78rem', fontFamily: 'monospace', color: '#18382F', fontWeight: 600 }}>
                        {order.ref}
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#2a2a2a' }}>{order.name}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#2a2a2a' }}>{order.phone}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#2a2a2a' }}>{order.city}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', textAlign: 'center' }}>{order.bundle}</td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#18382F' }}>
                        {order.total > 0 ? `${order.total} DH` : '—'}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.7rem',
                          borderRadius: 20,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          background: s.color + '18',
                          color: s.color,
                          border: `1px solid ${s.color}40`,
                        }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', color: '#a0a0a0', whiteSpace: 'nowrap' }}>
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit', month: '2-digit', year: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <form action={updateStatus}>
                          <input type="hidden" name="id" value={order.id} />
                          <select
                            name="status"
                            defaultValue={order.status}
                            style={{
                              fontSize: '0.75rem',
                              padding: '0.3rem 0.5rem',
                              borderRadius: 4,
                              border: '1px solid #e8e3dc',
                              background: '#fff',
                              marginRight: '0.4rem',
                            }}
                          >
                            <option value="new">Nouvelle</option>
                            <option value="confirmed">Confirmée</option>
                            <option value="delivered">Livrée</option>
                            <option value="cancelled">Annulée</option>
                          </select>
                          <button
                            type="submit"
                            style={{
                              fontSize: '0.7rem',
                              padding: '0.3rem 0.7rem',
                              background: '#18382F',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 4,
                              cursor: 'pointer',
                            }}
                          >
                            ✓
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}
