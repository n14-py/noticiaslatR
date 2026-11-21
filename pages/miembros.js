import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

const SUPPORTERS_URL = 'https://api.noticias.lat/api/member/supporters';

const TIERS = [
    {
        key: 'socio-fundador',
        name: 'Socio Fundador',
        emoji: '👑',
        price: 'USD 9.99 por mes',
        message: 'El apoyo más cercano. Hacen posible que Noticias.lat exista y siga creciendo.',
    },
    {
        key: 'impulsor',
        name: 'Impulsor',
        emoji: '🚀',
        price: 'USD 5.49 por mes',
        message: 'Le dan impulso a la redacción y mantienen el ritmo de la cobertura.',
    },
    {
        key: 'aliado',
        name: 'Aliado',
        emoji: '💙',
        price: 'USD 2.79 por mes',
        message: 'Caminan junto al proyecto y sostienen las noticias de cada día.',
    },
    {
        key: 'colaborador',
        name: 'Colaborador',
        emoji: '🐱',
        price: 'USD 0.69 por mes',
        message: 'Dan el primer paso y ya son parte de quienes mantienen este medio.',
    },
];

const FALLBACK_CHANNELS = [
    {
        id: 'UCwpj-DPIUx2hVDlc_gR2uKQ',
        name: 'Noticias LAT',
        handle: '@noticias-lat',
        url: 'https://www.youtube.com/@noticias-lat',
        joinUrl: 'https://www.youtube.com/channel/UCwpj-DPIUx2hVDlc_gR2uKQ/join',
        avatar: 'https://yt3.ggpht.com/pBRReNGx7ZoUw9UTluPv_mCibQOUJykz2xg0InZ-UCje9kiPmZfcqcoOL25yh1o4Tv1qSkOhDQ=s240-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UCMmKU1g6g5JWdLtzLxs5NKg',
        name: 'Noticias LAT | Última Hora',
        handle: '@NoticiasLat1',
        url: 'https://www.youtube.com/@NoticiasLat1',
        joinUrl: 'https://www.youtube.com/channel/UCMmKU1g6g5JWdLtzLxs5NKg/join',
        avatar: 'https://yt3.ggpht.com/_1Sc60PmDAgWmZ_CZhxftL7c5UPL1P1pI2us_aciXzDMww41KgQdlt2hRqSCFoyqLXjy33haRg=s240-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UC1oqIJVGLAa1CB5yAH5fDyA',
        name: 'Noticias LAT | AHORA',
        handle: '@NoticiasLat-2',
        url: 'https://www.youtube.com/@NoticiasLat-2',
        joinUrl: 'https://www.youtube.com/channel/UC1oqIJVGLAa1CB5yAH5fDyA/join',
        avatar: 'https://yt3.ggpht.com/UxSsLc9Nj-dI8uJIgH-DqmMviKrTwkzeNISaeSwyDuw0hYXz--fw4T7GJBQez4yIlJUk0obpIA=s240-c-k-c0x00ffffff-no-rj',
    },
    {
        id: 'UCOW3IHGU3XK9oS-o8HnPtpw',
        name: 'Noticias LAT | HOY',
        handle: '@Noticiaslat-3',
        url: 'https://www.youtube.com/@Noticiaslat-3',
        joinUrl: 'https://www.youtube.com/channel/UCOW3IHGU3XK9oS-o8HnPtpw/join',
        avatar: 'https://yt3.ggpht.com/jA7iOMTi5OZZlaKhTDpF5OMt2rEBsVKDLUXbFZvBMTvDCTGAJsjgTe2l4sSEOd7uy3dabLha3Q=s240-c-k-c0x00ffffff-no-rj',
    },
];

function httpsUrl(value) {
    return typeof value === 'string' && value.startsWith('https://') ? value : '';
}

function sanitizeMembers(list) {
    if (!Array.isArray(list)) return [];
    return list
        .filter((member) => member && typeof member.name === 'string' && member.name.trim())
        .map((member) => ({
            id: String(member.id || member.name),
            name: member.name.trim(),
            avatar: httpsUrl(member.avatar),
            url: httpsUrl(member.url),
            tier: typeof member.tier === 'string' ? member.tier : 'miembro',
            tierName: typeof member.tierName === 'string' && member.tierName.trim() ? member.tierName.trim() : 'Miembro',
            since: member.since || null,
            months: Number(member.months) || 0,
            channels: Array.isArray(member.channels)
                ? member.channels.filter((channel) => typeof channel === 'string' && channel.trim())
                : [],
        }));
}

function sanitizeChannels(list) {
    if (!Array.isArray(list) || list.length === 0) return FALLBACK_CHANNELS;
    const channels = list
        .filter((channel) => channel && typeof channel.name === 'string' && channel.name.trim())
        .map((channel) => ({
            id: channel.id || channel.name,
            name: channel.name.trim(),
            handle: typeof channel.handle === 'string' ? channel.handle : '',
            url: httpsUrl(channel.url),
            joinUrl: httpsUrl(channel.joinUrl) || httpsUrl(channel.url),
            avatar: httpsUrl(channel.avatar),
            subscribers: Number(channel.subscribers) || 0,
        }))
        .filter((channel) => channel.joinUrl || channel.url);
    return channels.length ? channels : FALLBACK_CHANNELS;
}

function groupMembers(members) {
    const buckets = new Map();
    members.forEach((member) => {
        const key = member.tier || 'miembro';
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push(member);
    });

    const known = TIERS
        .filter((tier) => buckets.has(tier.key))
        .map((tier) => ({ ...tier, members: buckets.get(tier.key) }));

    const extra = [...buckets.entries()]
        .filter(([key]) => !TIERS.some((tier) => tier.key === key))
        .map(([key, people]) => ({
            key,
            name: people[0]?.tierName || 'Miembros',
            emoji: '⭐',
            price: '',
            message: 'También sostienen Noticias.lat con una membresía activa.',
            members: people,
        }));

    return known.concat(extra);
}

function initials(name) {
    const parts = String(name || '').trim().split(/\s+/).slice(0, 2);
    const letters = parts.map((part) => part[0] || '').join('').toUpperCase();
    return letters || '•';
}

function sinceLabel(member) {
    if (member.since) {
        const date = new Date(member.since);
        if (!Number.isNaN(date.getTime())) {
            const formatted = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            return `Apoya desde ${formatted}`;
        }
    }
    if (member.months === 1) return 'Apoya desde hace 1 mes';
    if (member.months > 1) return `Apoya desde hace ${member.months} meses`;
    return 'Membresía activa';
}

function countLabel(total) {
    if (total === 1) return '1 persona apoya Noticias.lat';
    return `${total} personas apoyan Noticias.lat`;
}

function subscriberLabel(value) {
    const total = Number(value);
    if (!Number.isFinite(total) || total <= 0) return '';
    if (total >= 1000000) {
        const millions = total / 1000000;
        const text = millions >= 10 ? String(Math.round(millions)) : millions.toFixed(1).replace('.', ',');
        return `${text} mill. suscriptores`;
    }
    if (total >= 1000) {
        const thousands = total / 1000;
        const text = thousands >= 10 ? String(Math.round(thousands)) : thousands.toFixed(1).replace('.', ',');
        return `${text} mil suscriptores`;
    }
    return `${total.toLocaleString('es-ES')} suscriptores`;
}

function Avatar({ name, src, className, fallbackClass }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return <span className={fallbackClass} aria-hidden="true">{initials(name)}</span>;
    }
    return (
        <img
            className={className}
            src={src}
            alt=""
            onError={() => setFailed(true)}
        />
    );
}

function ChannelAvatar({ name, src }) {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return <span className="channel-join-fallback" aria-hidden="true"><i className="fab fa-youtube"></i></span>;
    }
    return <img src={src} alt="" onError={() => setFailed(true)} />;
}

export default function Miembros() {
    const [members, setMembers] = useState([]);
    const [channels, setChannels] = useState(FALLBACK_CHANNELS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);

        fetch(SUPPORTERS_URL, { signal: controller.signal })
            .then((response) => {
                if (!response.ok) throw new Error('supporters');
                return response.json();
            })
            .then((data) => {
                if (cancelled) return;
                setMembers(sanitizeMembers(data && data.members));
                setChannels(sanitizeChannels(data && data.channels));
            })
            .catch(() => {
                if (cancelled) return;
                setMembers([]);
                setChannels(FALLBACK_CHANNELS);
            })
            .finally(() => {
                clearTimeout(timer);
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
            clearTimeout(timer);
            controller.abort();
        };
    }, []);

    const groups = groupMembers(members);
    const total = members.length;

    return (
        <Layout>
            <Head>
                <title>Miembros que apoyan Noticias.lat</title>
                <meta name="description" content="Gracias a las personas con membresía activa que sostienen Noticias.lat. Socios fundadores, impulsores, aliados y colaboradores de nuestros canales." />
                <meta property="og:title" content="Miembros que apoyan Noticias.lat" />
                <meta property="og:description" content="Estas personas tienen una membresía activa y hacen posible las noticias, el audio y el video de Noticias.lat." />
                <meta property="og:url" content="https://www.noticias.lat/miembros" />
                <link rel="canonical" href="https://www.noticias.lat/miembros" />
            </Head>

            <div className="supporters-page">
                <header className="supporters-hero">
                    <div className="container">
                        <span className="supporters-kicker">Quienes apoyan</span>
                        <h1>Gracias por sostener <span>Noticias.lat</span></h1>
                        <p className="supporters-lead">
                            Cada persona de esta lista tiene una membresía activa en nuestros canales de YouTube.
                            Con ese apoyo siguen al aire las noticias, el audio y los videos para toda Latinoamérica.
                        </p>
                        {total > 0 && (
                            <p className="supporters-count">{countLabel(total)}</p>
                        )}
                    </div>
                </header>

                <div className="supporters-wrap">
                    <p className="sr-only" role="status">
                        {loading ? 'Cargando la lista de miembros.' : countLabel(total)}
                    </p>

                    <section aria-label="Niveles de la membresía">
                        <div className="tier-legend">
                            {TIERS.map((tier) => {
                                const count = members.filter((member) => member.tier === tier.key).length;
                                const className = `tier-legend-card tier-${tier.key}`;
                                const body = (
                                    <>
                                        <span className="tier-emoji" aria-hidden="true">{tier.emoji}</span>
                                        <strong>{tier.name}</strong>
                                        <span className="tier-price">{tier.price}</span>
                                        <p>{tier.message}</p>
                                        {count > 0 && (
                                            <span className="tier-legend-count">
                                                {count === 1 ? '1 miembro' : `${count} miembros`}
                                            </span>
                                        )}
                                    </>
                                );
                                if (count > 0) {
                                    return <a key={tier.key} className={className} href={`#nivel-${tier.key}`}>{body}</a>;
                                }
                                return <article key={tier.key} className={className}>{body}</article>;
                            })}
                        </div>
                        {!loading && total === 0 && (
                            <p className="supporters-note">
                                La lista se actualiza sola con las membresías activas de YouTube.
                                Si acabas de unirte, tu nombre aparece en cuanto el canal confirma el apoyo.
                            </p>
                        )}
                    </section>

                    {loading && (
                        <div className="supporter-grid" style={{ marginTop: '1.5rem' }} aria-hidden="true">
                            {Array.from({ length: 8 }).map((_, index) => (
                                <div key={index} className="supporter-skeleton" />
                            ))}
                        </div>
                    )}

                    {groups.map((group) => (
                        <section
                            key={group.key}
                            id={`nivel-${group.key}`}
                            className={`tier-section tier-${TIERS.some((tier) => tier.key === group.key) ? group.key : 'miembro'}`}
                        >
                            <div className="tier-head">
                                <div className="tier-head-copy">
                                    <span className="tier-emoji" aria-hidden="true">{group.emoji}</span>
                                    <div>
                                        <h2>{group.name}</h2>
                                        <p>{group.message}</p>
                                    </div>
                                </div>
                                <span className="tier-head-count">{group.members.length}</span>
                            </div>
                            <div className="supporter-grid">
                                {group.members.map((member) => {
                                    const content = (
                                        <>
                                            <Avatar
                                                name={member.name}
                                                src={member.avatar}
                                                className="supporter-avatar"
                                                fallbackClass="supporter-fallback"
                                            />
                                            <span>
                                                <span className="supporter-name">{member.name}</span>
                                                <span className="supporter-meta" style={{ display: 'block' }}>{sinceLabel(member)}</span>
                                                {member.channels.length > 0 && (
                                                    <span className="supporter-channels" style={{ display: 'block' }}>
                                                        {member.channels.join(' · ')}
                                                    </span>
                                                )}
                                            </span>
                                        </>
                                    );
                                    if (member.url) {
                                        return (
                                            <a
                                                key={`${group.key}-${member.id}`}
                                                className="supporter-card"
                                                href={member.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                {content}
                                            </a>
                                        );
                                    }
                                    return (
                                        <div key={`${group.key}-${member.id}`} className="supporter-card">
                                            {content}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}

                    <section className="supporters-channels" aria-labelledby="canales-titulo">
                        <h2 id="canales-titulo">Únete desde cualquiera de los 4 canales</h2>
                        <p className="section-lead">
                            La membresía se activa en YouTube. Elige el canal que miras y apoya a Noticias.lat con el nivel que quieras.
                        </p>
                        <div className="channel-join-grid">
                            {channels.map((channel) => (
                                <article key={channel.id} className="channel-join-card">
                                    <ChannelAvatar name={channel.name} src={channel.avatar} />
                                    <h3>{channel.name}</h3>
                                    {channel.handle && <p className="handle">{channel.handle}</p>}
                                    {subscriberLabel(channel.subscribers) && (
                                        <p className="subs">{subscriberLabel(channel.subscribers)}</p>
                                    )}
                                    <a
                                        className="channel-join-btn"
                                        href={channel.joinUrl || channel.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Hacerse miembro
                                    </a>
                                </article>
                            ))}
                        </div>
                        <p className="supporters-footnote">
                            Puedes cancelar cuando quieras desde YouTube.
                            Si ya tienes una membresía, también puedes <Link href="/publicar">publicar una noticia</Link>.
                        </p>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
