import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { useLocalizedDynamicText } from '../hooks/useLocalizedDynamicText'

interface SourceInfo {
    name: string
    stat: string
    badge: string
    badgeColor: string
    headerColor: string
    description: string
    note?: string
}

const SOURCES: SourceInfo[] = [
    {
        name: 'Google Cloud AI Use Cases',
        stat: '933 use cases',
        badge: 'PRIMARY SOURCE',
        badgeColor: 'var(--score-high)',
        headerColor: '#4285F4',
        description: "Google Cloud's official AI use case compendium including 1001 Use Cases. Each record includes company name, AI solution, and measurable business outcomes. 100% source URLs stored.",
    },
    {
        name: 'IBM watsonx',
        stat: '47 use cases',
        badge: 'PRIMARY SOURCE',
        badgeColor: 'var(--score-high)',
        headerColor: '#0043CE',
        description: "IBM's official watsonx enterprise AI use case library. Covers AIOps, document processing, asset management, customer service. Cross-industry patterns.",
    },
    {
        name: 'Salesforce AI',
        stat: '57 use cases',
        badge: 'PRIMARY SOURCE',
        badgeColor: 'var(--score-high)',
        headerColor: '#00A1E0',
        description: 'Salesforce AI use case library focused on customer-facing applications: recommendation engines, next best action (NBA), conversational AI, CRM automation.',
    },
    {
        name: 'Google Cloud Blueprints',
        stat: '31 use cases',
        badge: 'PRIMARY SOURCE',
        badgeColor: 'var(--score-high)',
        headerColor: '#4285F4',
        description: 'Architectural blueprints with end-to-end AI solution patterns. Includes infrastructure guidance and implementation templates per industry.',
    },
    {
        name: 'McKinsey & Company',
        stat: 'Benchmark reference',
        badge: 'CALIBRATION ONLY',
        badgeColor: 'var(--dxc-orange)',
        headerColor: '#1C1C1C',
        description: 'State of AI 2024/2025 industry reports used to calibrate Market Momentum scores per archetype. Not scraped and used as benchmark calibration data only.',
        note: 'Content not scraped. Used only for score calibration.',
    },
    {
        name: 'NVIDIA / MIT (Planned)',
        stat: 'Planned V2',
        badge: 'COMING V2',
        badgeColor: 'var(--accent-purple)',
        headerColor: '#76B900',
        description: "NVIDIA's AI use case library and MIT Technology Review will be added in V2 via Playwright (JS-rendered pages).",
    },
]

interface CriterionInfo {
    title: string
    weight: string
    color: string
    definition: string
    howCalculated: string
}

const CRITERIA: CriterionInfo[] = [
    {
        title: 'Trend Strength',
        weight: '25%',
        color: 'var(--dxc-blue)',
        definition: 'How strong is the current AI signal for this use case pattern?',
        howCalculated: 'Pre-scored by archetype using keyword frequency analysis across 24 AI archetypes. Calibrated against publication recency in source documents. Scale: 1-10.',
    },
    {
        title: 'Client Relevance',
        weight: '30%',
        color: 'var(--dxc-orange)',
        definition: "How well does this use case match the specific client's context?",
        howCalculated: 'Client profile text (sector + name + objectives) is embedded into a 1,024-dimensional vector. Cosine similarity is computed against each use case vector in Qdrant.',
    },
    {
        title: 'Capability Match',
        weight: '25%',
        color: 'var(--accent-emerald)',
        definition: "Can DXC deliver this with the client's selected AI capabilities?",
        howCalculated: 'Intersection between capabilities selected in onboarding and the required_capabilities field. Score = (matched / total_required) x 10.',
    },
    {
        title: 'Market Momentum',
        weight: '20%',
        color: 'var(--accent-purple)',
        definition: 'Is this use case gaining real industry adoption right now?',
        howCalculated: 'Pre-calibrated per archetype using McKinsey State of AI 2024/2025 adoption rates and Gartner maturity benchmarks.',
    },
]

const RULES = [
    {
        num: '01',
        title: 'Every Data Point Has a Source URL',
        text: 'No field value is invented, estimated, or hallucinated. Every title, description, company example, and benefit traces to a real public URL stored in the database.',
    },
    {
        num: '02',
        title: 'Scraped Data and Computed Scores Are Separated',
        text: 'Tier 1 immutable fields remain as scraped. Tier 2 scoring fields are computed fresh for each session.',
    },
    {
        num: '03',
        title: 'Only Public and ToS-Compliant Sources',
        text: 'Only sources that explicitly permit public automated access were included. No paywalled or login-only content.',
    },
    {
        num: '04',
        title: 'Same Inputs Produce Same Outputs',
        text: 'The ranking formula is deterministic. Same client profile and settings produce the same ranked results.',
    },
    {
        num: '05',
        title: 'Justifications Are Contextualized',
        text: "Justification text is generated per use case and contextualized to the client's sector, profile, and selected capabilities.",
    },
]

const ARCHETYPE_GROUPS = [
    {
        label: 'Core Operations',
        color: 'var(--dxc-blue)',
        items: ['fraud_detection', 'quality_control', 'predictive_maintenance', 'demand_forecasting', 'supply_chain_optimization', 'energy_optimization'],
    },
    {
        label: 'Customer-Facing',
        color: 'var(--dxc-orange)',
        items: ['customer_chatbot', 'personalization_engine', 'churn_prediction', 'pricing_optimization', 'clinical_documentation', 'hr_automation'],
    },
    {
        label: 'Knowledge and Documents',
        color: 'var(--accent-emerald)',
        items: ['document_processing', 'nlp_search', 'contract_analysis', 'financial_reporting', 'kyc_automation', 'employee_productivity_genai'],
    },
    {
        label: 'Infrastructure and AI Ops',
        color: 'var(--accent-purple)',
        items: ['agentic_workflow', 'data_governance', 'it_operations_aiops', 'code_generation', 'computer_vision_inspection', 'sustainability_reporting'],
    },
]

const STACK_ROWS = [
    {
        label: 'DATA LAYER',
        items: [
            { name: 'PostgreSQL', desc: '1,068 use cases and structured records', color: '#336791' },
            { name: 'Qdrant Vector DB', desc: '1,024-dimensional vectors and cosine search', color: '#DC382D' },
            { name: 'Redis Cache', desc: 'LLM responses with 1h TTL', color: '#D92B21' },
        ],
    },
    {
        label: 'AI LAYER',
        items: [
            { name: 'Qwen3-Embedding-0.6B', desc: 'Local multilingual embeddings', color: 'var(--dxc-blue)' },
            { name: 'Mistral Small LLM', desc: 'Contextual justifications', color: 'var(--dxc-orange)' },
            { name: 'RAG Engine', desc: 'Top-K retrieval with sector filtering', color: 'var(--accent-emerald)' },
        ],
    },
    {
        label: 'API LAYER',
        items: [{ name: 'FastAPI Python', desc: 'Async APIs with Pydantic v2', color: '#009688' }],
    },
    {
        label: 'OUTPUT LAYER',
        items: [
            { name: 'React Frontend', desc: 'TypeScript and Vite', color: '#61DAFB' },
            { name: 'PDF Export', desc: 'WeasyPrint and Jinja2 templates', color: 'var(--dxc-orange)' },
            { name: 'ECharts Radar', desc: '5-axis interactive visualization', color: 'var(--accent-purple)' },
        ],
    },
]

function LocalizedText({ text }: { text: string }) {
    const { text: localizedText } = useLocalizedDynamicText(text)
    return <>{localizedText || text}</>
}

function SectionTitle({ step, title, subtitle }: { step: string; title: string; subtitle: string }) {
    return (
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="section-label" style={{ textAlign: 'center' }}>
                <LocalizedText text={step} />
            </div>
            <h2 style={{
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.03em',
                marginBottom: 10,
                lineHeight: 1.1,
            }}>
                <LocalizedText text={title} />
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 760, margin: '0 auto', lineHeight: 1.7 }}>
                <LocalizedText text={subtitle} />
            </p>
        </div>
    )
}

function SourceCard({ source, delay }: { source: SourceInfo; delay: number }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="card"
            style={{
                background: 'var(--bg-white)',
                overflow: 'hidden',
                border: '1px solid var(--border-light)',
                height: '100%',
            }}
        >
            <div style={{ height: 4, background: source.headerColor }} />
            <div style={{ padding: 22 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', color: 'var(--text-primary)', overflowWrap: 'anywhere' }}>
                        <LocalizedText text={source.name} />
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{
                            display: 'inline-block',
                            background: `${source.headerColor}15`,
                            color: source.headerColor,
                            fontSize: 12,
                            fontWeight: 700,
                            borderRadius: 10,
                            padding: '6px 10px',
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                            lineHeight: 1.2,
                        }}>
                            <LocalizedText text={source.stat} />
                        </span>
                        <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            color: source.badgeColor,
                            background: `${source.badgeColor}15`,
                            borderRadius: 999,
                            padding: '6px 10px',
                            lineHeight: 1.2,
                            whiteSpace: 'normal',
                            overflowWrap: 'anywhere',
                        }}>
                            <LocalizedText text={source.badge} />
                        </span>
                    </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--text-secondary)' }}>
                    <LocalizedText text={source.description} />
                </p>
                {source.note && (
                    <div style={{
                        marginTop: 12,
                        background: 'var(--dxc-orange-light)',
                        borderLeft: '3px solid var(--dxc-orange)',
                        borderRadius: '0 8px 8px 0',
                        padding: '10px 12px',
                        fontSize: 12,
                        color: 'var(--dxc-orange)',
                        lineHeight: 1.6,
                    }}>
                        <LocalizedText text={source.note} />
                    </div>
                )}
            </div>
        </motion.article>
    )
}

export default function HowItWorksPage() {
    const navigate = useNavigate()

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />

            <section style={{ padding: 'clamp(48px, 8vw, 88px) clamp(20px, 5vw, 56px) 48px', background: 'linear-gradient(180deg, var(--bg-white), var(--bg-soft))' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                            <LocalizedText text="Platform Methodology" />
                        </p>
                        <h1 style={{
                            fontSize: 'clamp(36px, 8vw, 84px)',
                            fontWeight: 900,
                            lineHeight: 0.98,
                            marginBottom: 20,
                            letterSpacing: '-0.04em',
                        }}>
                            <span className="gradient-text-animated">
                                <LocalizedText text="Transparent by Design" />
                            </span>
                        </h1>
                        <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 820, margin: '0 auto', lineHeight: 1.8 }}>
                            <LocalizedText text="A complete view of data sources, scoring logic, architecture, and quality controls behind every recommendation." />
                        </p>
                    </motion.div>
                </div>
            </section>

            <section style={{ padding: 'clamp(52px, 7vw, 96px) clamp(20px, 5vw, 56px)', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <SectionTitle
                        step="01 KNOWLEDGE BASE"
                        title="1,068 Real-World AI Use Cases"
                        subtitle="Every record is source-backed and references publicly available information."
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, alignItems: 'stretch' }}>
                        {SOURCES.map((src, i) => (
                            <SourceCard key={src.name} source={src} delay={i * 0.04} />
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: 'clamp(52px, 7vw, 96px) clamp(20px, 5vw, 56px)' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <SectionTitle
                        step="02 SCORING"
                        title="Weighted and Explainable Scoring"
                        subtitle="No black box behavior: criteria, weights, and formulas are explicit and auditable."
                    />

                    <div style={{
                        background: 'var(--bg-soft)',
                        border: '1px solid var(--border-light)',
                        borderRadius: 14,
                        padding: '24px clamp(18px, 4vw, 34px)',
                        maxWidth: 760,
                        margin: '0 auto 30px',
                    }}>
                        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 18, color: 'var(--text-primary)' }}>
                            <LocalizedText text="Radar Score" />
                        </div>
                        {CRITERIA.map((c) => (
                            <div key={c.title} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) auto auto', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 14, color: 'var(--text-secondary)', whiteSpace: 'normal', wordBreak: 'normal' }}>
                                    <LocalizedText text={c.title} />
                                </span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-dim)' }}>x {c.weight}</span>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-dim)' }}>
                                    <LocalizedText text="weighted" />
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                        {CRITERIA.map((c, i) => (
                            <motion.article
                                key={c.title}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.35, delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="card"
                                style={{ background: 'var(--bg-white)', borderTop: `4px solid ${c.color}`, padding: 22 }}
                            >
                                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.2 }}>
                                    <LocalizedText text={c.title} /> <span style={{ color: 'var(--text-dim)' }}>({c.weight})</span>
                                </h3>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.7, marginBottom: 12 }}>
                                    <LocalizedText text={c.definition} />
                                </p>
                                <div style={{ background: 'var(--dxc-blue-light)', borderRadius: 8, padding: '10px 12px' }}>
                                    <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--dxc-blue)', letterSpacing: '0.08em', marginBottom: 4 }}>
                                        <LocalizedText text="HOW IT IS CALCULATED" />
                                    </p>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                        <LocalizedText text={c.howCalculated} />
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: 'clamp(52px, 7vw, 96px) clamp(20px, 5vw, 56px)', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <SectionTitle
                        step="03 TECH STACK"
                        title="Enterprise-Grade Infrastructure"
                        subtitle="Open architecture, reproducible pipelines, and production-ready interfaces."
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {STACK_ROWS.map((row) => (
                            <div key={row.label}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--dxc-blue)', letterSpacing: '0.12em', marginBottom: 10 }}>
                                    <LocalizedText text={row.label} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                                    {row.items.map((item) => (
                                        <article key={item.name} className="card" style={{ padding: 16, background: 'var(--bg-white)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <span style={{ width: 8, height: 8, borderRadius: 999, background: item.color, display: 'inline-block' }} />
                                                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{item.name}</strong>
                                            </div>
                                            <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}><LocalizedText text={item.desc} /></p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: 'clamp(52px, 7vw, 96px) clamp(20px, 5vw, 56px)' }}>
                <div style={{ maxWidth: 980, margin: '0 auto' }}>
                    <SectionTitle
                        step="04 DATA QUALITY"
                        title="Strict Quality Controls"
                        subtitle="Trustworthy recommendations rely on verifiable data and deterministic computation."
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                        {RULES.map((rule, i) => (
                            <motion.article
                                key={rule.num}
                                initial={{ opacity: 0, x: -12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                                viewport={{ once: true }}
                                className="card"
                                style={{
                                    padding: 20,
                                    background: 'var(--bg-white)',
                                    display: 'grid',
                                    gridTemplateColumns: '56px 1fr',
                                    gap: 16,
                                    alignItems: 'start',
                                }}
                            >
                                <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: 'var(--border-light)' }}>{rule.num}</span>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}><LocalizedText text={rule.title} /></h3>
                                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.75 }}><LocalizedText text={rule.text} /></p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: 'clamp(52px, 7vw, 96px) clamp(20px, 5vw, 56px)', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 1180, margin: '0 auto' }}>
                    <SectionTitle
                        step="05 ARCHETYPES"
                        title="24 Proven AI Archetypes"
                        subtitle="Grouped patterns derived from industry frameworks to standardize opportunity discovery."
                    />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        {ARCHETYPE_GROUPS.map((group) => (
                            <div key={group.label}>
                                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: group.color, textTransform: 'uppercase', marginBottom: 10 }}>
                                    <LocalizedText text={group.label} />
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {group.items.map((item) => (
                                        <span
                                            key={item}
                                            style={{
                                                background: 'var(--bg-white)',
                                                border: '1px solid var(--border-light)',
                                                borderLeft: `3px solid ${group.color}`,
                                                borderRadius: 999,
                                                fontSize: 12,
                                                color: 'var(--text-secondary)',
                                                padding: '7px 12px',
                                            }}
                                        >
                                            <LocalizedText text={item.replace(/_/g, ' ')} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '70px 20px 86px', textAlign: 'center', background: 'linear-gradient(180deg, var(--bg-soft), var(--bg-page))' }}>
                <motion.button
                    className="btn btn-brand"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/onboarding')}
                    style={{
                        fontWeight: 800,
                        fontSize: 16,
                        borderRadius: 12,
                        padding: '14px 34px',
                    }}
                >
                    <LocalizedText text="Start Analysis" />
                </motion.button>
            </section>

            <Footer />
        </motion.div>
    )
}
