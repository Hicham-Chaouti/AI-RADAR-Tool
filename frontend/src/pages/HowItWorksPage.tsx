import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

/* ---- Source Card ---- */
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
        description: 'State of AI 2024/2025 industry reports used to calibrate Market Momentum scores per archetype. Not scraped — used as benchmark calibration data.',
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

function SourceCard({ source, delay }: { source: SourceInfo; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="card"
            style={{ overflow: 'hidden', background: 'var(--bg-white)' }}
        >
            <div style={{ height: 4, background: source.headerColor }} />
            <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{source.name}</h4>
                    <span style={{
                        fontSize: 9, letterSpacing: 1, fontWeight: 700,
                        color: source.badgeColor, background: `${source.badgeColor}15`,
                        padding: '3px 8px', borderRadius: 4,
                        whiteSpace: 'nowrap',
                    }}>
                        {source.badge}
                    </span>
                </div>
                <div style={{
                    display: 'inline-block',
                    background: `${source.headerColor}15`, color: source.headerColor,
                    fontSize: 12, fontWeight: 600, padding: '4px 10px',
                    borderRadius: 6, marginBottom: 12,
                }}>
                    {source.stat}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {source.description}
                </p>
                {source.note && (
                    <div style={{
                        background: 'var(--dxc-orange-light)',
                        borderLeft: '3px solid var(--dxc-orange)',
                        padding: '8px 12px', marginTop: 12,
                        borderRadius: '0 6px 6px 0',
                        fontSize: 11, color: 'var(--dxc-orange)', lineHeight: 1.5,
                    }}>
                        {source.note}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

/* ---- Criteria ---- */
interface CriterionInfo {
    title: string; weight: string; color: string; definition: string; howCalculated: string
}

const CRITERIA: CriterionInfo[] = [
    { title: 'Trend Strength', weight: '25%', color: 'var(--dxc-blue)', definition: 'How strong is the current AI signal for this use case pattern?', howCalculated: 'Pre-scored by archetype using keyword frequency analysis across 24 AI archetypes. Calibrated against publication recency in source documents. Scale: 1-10.' },
    { title: 'Client Relevance', weight: '30%', color: 'var(--dxc-orange)', definition: "How well does this use case match the specific client's context?", howCalculated: 'Client profile text (sector + name + objectives) is embedded via Qwen3-Embedding-0.6B into a 1,024-dimensional vector. Cosine similarity is computed against each use case vector in Qdrant.' },
    { title: 'Capability Match', weight: '25%', color: 'var(--accent-emerald)', definition: "Can DXC deliver this with the client's selected AI capabilities?", howCalculated: 'Intersection between capabilities selected in onboarding and the required_capabilities field. Score = (matched / total_required) x 10.' },
    { title: 'Market Momentum', weight: '20%', color: 'var(--accent-purple)', definition: 'Is this use case gaining real industry adoption right now?', howCalculated: 'Pre-calibrated per archetype using McKinsey State of AI 2024/2025 adoption rates and Gartner maturity benchmarks.' },
]

/* ---- Business Rules ---- */
const RULES = [
    { num: '01', title: 'Every Data Point Has a Source URL', text: 'No field value is invented, estimated or hallucinated. Every title, description, company example and benefit traces to a real public URL stored in the database.' },
    { num: '02', title: 'Scraped Data vs Computed Scores are Separated', text: 'Tier 1 (immutable): title, description, company, source URL, benefits — exactly as scraped. Tier 2 (computed fresh per session): all 4 scores.' },
    { num: '03', title: 'Only Public, ToS-Compliant Sources', text: 'Only sources that explicitly permit automated access or public scraping were included. No content behind paywalls or login walls.' },
    { num: '04', title: 'Same Profile = Same Results', text: 'The scoring formula is deterministic, not random. Same client sector + same capabilities + same query will always produce the same ranked results.' },
    { num: '05', title: 'Justifications Are Client-Specific', text: "The justification text for each use case is generated fresh by Mistral Small, explicitly contextualized to the client's sector, name and selected capabilities." },
]

/* ---- Archetypes ---- */
const ARCHETYPE_GROUPS = [
    { label: 'Core Operations', color: 'var(--dxc-blue)', items: ['fraud_detection', 'quality_control', 'predictive_maintenance', 'demand_forecasting', 'supply_chain_optimization', 'energy_optimization'] },
    { label: 'Customer-Facing', color: 'var(--dxc-orange)', items: ['customer_chatbot', 'personalization_engine', 'churn_prediction', 'pricing_optimization', 'clinical_documentation', 'hr_automation'] },
    { label: 'Knowledge & Documents', color: 'var(--accent-emerald)', items: ['document_processing', 'nlp_search', 'contract_analysis', 'financial_reporting', 'kyc_automation', 'employee_productivity_genai'] },
    { label: 'Infrastructure & AI Ops', color: 'var(--accent-purple)', items: ['agentic_workflow', 'data_governance', 'it_operations_aiops', 'code_generation', 'computer_vision_inspection', 'sustainability_reporting'] },
]

/* ---- Tech Stack ---- */
const STACK_ROWS = [
    { label: 'DATA LAYER', items: [{ name: 'PostgreSQL', desc: '1,068 use cases · structured data', color: '#336791' }, { name: 'Qdrant Vector DB', desc: '1,024-dim vectors · cosine similarity', color: '#DC382D' }, { name: 'Redis Cache', desc: 'LLM responses · TTL 1 hour', color: '#D92B21' }] },
    { label: 'AI LAYER', items: [{ name: 'Qwen3-Embedding-0.6B', desc: 'Local embeddings · multilingual, 32K ctx', color: 'var(--dxc-blue)' }, { name: 'Mistral Small LLM', desc: 'Justifications · Mistral API', color: 'var(--dxc-orange)' }, { name: 'RAG Engine', desc: 'Top-K search + sector filter', color: 'var(--accent-emerald)' }] },
    { label: 'API LAYER', items: [{ name: 'FastAPI Python', desc: 'Async, Pydantic v2, < 30s response', color: '#009688' }] },
    { label: 'OUTPUT LAYER', items: [{ name: 'React Frontend', desc: 'TypeScript / Vite', color: '#61DAFB' }, { name: 'PDF Export', desc: 'WeasyPrint + Jinja2', color: 'var(--dxc-orange)' }, { name: 'ECharts Radar', desc: '5-axis visual', color: 'var(--accent-purple)' }] },
]

/* ---- MAIN PAGE ---- */
export default function HowItWorksPage() {
    const navigate = useNavigate()

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} style={{ position: 'relative', zIndex: 1 }}>
            <Navbar />

            {/* HERO */}
            <section style={{ paddingTop: 60, paddingBottom: 80, textAlign: 'center', position: 'relative' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 16 }}>
                        Platform → Methodology
                    </p>
                    <h1 style={{ fontSize: 72, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 20 }}>
                        Not a <span className="gradient-text-animated">Black Box.</span>
                    </h1>
                    <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
                        Full transparency on our data sources, scoring methodology, business rules and the technology stack behind every result.
                    </p>
                </motion.div>
            </section>

            {/* SECTION 1: Knowledge Base */}
            <section style={{ padding: '80px 48px', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ textAlign: 'center' }}>01 — KNOWLEDGE BASE</div>
                        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            <span className="gradient-text-animated" style={{ fontSize: 80, fontWeight: 800, display: 'block', lineHeight: 1.1 }}>
                                1,068
                            </span>
                            Real-World AI Use Cases
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
                            Not invented. Every use case traces to a real public source with a URL.
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        {SOURCES.map((src, i) => (
                            <SourceCard key={src.name} source={src} delay={i * 0.08} />
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 2: Scoring Formula */}
            <section style={{ padding: '100px 48px' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ textAlign: 'center' }}>02 — SCORING</div>
                        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            A Transparent, Weighted Score
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                            4 explicit criteria. Documented weights. No hidden logic.
                        </p>
                    </div>

                    {/* Formula Box */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        style={{
                            background: 'var(--bg-soft)',
                            border: '1px solid var(--border-light)',
                            borderRadius: 12, padding: 40,
                            maxWidth: 700, margin: '0 auto 48px',
                            fontFamily: 'var(--font-mono)',
                        }}
                    >
                        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 24 }}>
                            Radar Score =
                        </div>
                        {[
                            { label: 'Trend Strength', weight: '25%', pts: '2.5', color: 'var(--dxc-blue)' },
                            { label: 'Client Relevance', weight: '30%', pts: '3.0', color: 'var(--dxc-orange)' },
                            { label: 'Capability Match', weight: '25%', pts: '2.5', color: 'var(--accent-emerald)' },
                            { label: 'Market Momentum', weight: '20%', pts: '2.0', color: 'var(--accent-purple)' },
                        ].map(c => (
                            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>
                                <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, display: 'inline-block', flexShrink: 0 }} />
                                <span style={{ width: 180 }}>{c.label}</span>
                                <span style={{ color: 'var(--text-dim)' }}>x {c.weight}</span>
                                <span style={{ marginLeft: 'auto', color: 'var(--text-dim)' }}>= up to {c.pts} pts</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid var(--border-light)', marginTop: 16, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                            <span>Total</span>
                            <span>= 10.0 pts max</span>
                        </div>
                    </motion.div>

                    {/* Criteria cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
                        {CRITERIA.map((c, i) => (
                            <motion.div
                                key={c.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="card"
                                style={{
                                    background: 'var(--bg-white)',
                                    borderTop: `4px solid ${c.color}`,
                                    padding: '24px 28px',
                                }}
                            >
                                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                                    {c.title} — {c.weight}
                                </h4>
                                <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 12 }}>
                                    {c.definition}
                                </p>
                                <div style={{ background: 'var(--dxc-blue-light)', borderRadius: 8, padding: '12px 16px' }}>
                                    <p style={{ fontSize: 12, color: 'var(--dxc-blue)', fontWeight: 600, marginBottom: 4 }}>
                                        HOW IT IS CALCULATED
                                    </p>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                                        {c.howCalculated}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: Technology Stack */}
            <section style={{ padding: '100px 48px', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 900, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <div className="section-label" style={{ textAlign: 'center' }}>03 — TECH STACK</div>
                        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            Enterprise-Grade Infrastructure
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                            Open source. Auditable. Reproducible.
                        </p>
                    </div>
                    {STACK_ROWS.map((row, ri) => (
                        <div key={row.label}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, color: 'var(--dxc-blue)', marginBottom: 12, textAlign: 'center' }}>
                                {row.label}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
                                {row.items.map((item, ii) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: ii * 0.08 }}
                                        viewport={{ once: true }}
                                        className="card"
                                        style={{
                                            background: 'var(--bg-white)',
                                            padding: '16px 24px',
                                            minWidth: row.items.length === 1 ? 300 : 200,
                                            textAlign: 'center',
                                        }}
                                    >
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, margin: '0 auto 8px' }} />
                                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{item.name}</div>
                                        <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{item.desc}</div>
                                    </motion.div>
                                ))}
                            </div>
                            {ri < STACK_ROWS.length - 1 && (
                                <div style={{ textAlign: 'center', padding: '4px 0', color: 'var(--border-light)', fontSize: 18 }}>
                                    ↓
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* SECTION 4: Business Rules */}
            <section style={{ padding: '100px 48px' }}>
                <div style={{ maxWidth: 800, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ textAlign: 'center' }}>04 — DATA QUALITY</div>
                        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            Strict Data Quality Rules
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                            What guarantees your results are trustworthy.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {RULES.map((rule, i) => (
                            <motion.div
                                key={rule.num}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                                viewport={{ once: true }}
                                className="card"
                                style={{
                                    background: 'var(--bg-white)',
                                    padding: '28px 32px',
                                    display: 'flex', gap: 24, alignItems: 'start',
                                }}
                            >
                                <span style={{
                                    fontSize: 32, fontWeight: 800, color: 'var(--border-light)',
                                    lineHeight: 1, flexShrink: 0, minWidth: 48,
                                }}>
                                    {rule.num}
                                </span>
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{rule.title}</h4>
                                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{rule.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 5: 24 AI Archetypes */}
            <section style={{ padding: '100px 48px', background: 'var(--bg-soft)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 48 }}>
                        <div className="section-label" style={{ textAlign: 'center' }}>05 — ARCHETYPES</div>
                        <h2 style={{ fontSize: 40, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                            Structured Around 24 Proven AI Patterns
                        </h2>
                        <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                            Derived from Gartner and McKinsey frameworks.
                        </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                        {ARCHETYPE_GROUPS.map(group => (
                            <div key={group.label}>
                                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: group.color, marginBottom: 12 }}>
                                    {group.label}
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                    {group.items.map((a, i) => (
                                        <motion.div
                                            key={a}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: i * 0.03 }}
                                            viewport={{ once: true }}
                                            style={{
                                                background: 'var(--bg-white)',
                                                border: '1px solid var(--border-light)',
                                                borderLeft: `3px solid ${group.color}`,
                                                borderRadius: 8, padding: '10px 14px',
                                                fontSize: 12, color: 'var(--text-secondary)',
                                                cursor: 'default',
                                                transition: 'border-color 0.2s, box-shadow 0.2s',
                                            }}
                                        >
                                            {a.replace(/_/g, ' ')}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '80px 48px', background: 'var(--bg-soft)', textAlign: 'center' }}>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/onboarding')}
                    style={{
                        background: 'var(--dxc-blue-vibrant)',
                        padding: '18px 48px', borderRadius: 14,
                        border: 'none', color: '#fff', fontSize: 18,
                        fontWeight: 700, cursor: 'pointer',
                        boxShadow: 'var(--shadow-blue)',
                    }}
                >
                    Start Analysis →
                </motion.button>
            </section>

            <Footer />
        </motion.div>
    )
}
