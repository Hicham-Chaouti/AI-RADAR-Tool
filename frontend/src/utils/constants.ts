export const ARCHETYPE_COLORS: Record<string, string> = {
    customer_chatbot: '#FF9259',
    employee_productivity_genai: '#6198F3',
    fraud_detection: '#E98166',
    document_processing: '#4ade80',
    code_generation: '#9b8aff',
    ai_search_discovery: '#6198F3',
    security_soc_automation: '#E98166',
    education_ai: '#4ade80',
    predictive_maintenance: '#FF9259',
    supply_chain_optimization: '#9b8aff',
}

export const DEFAULT_NODE_COLOR = '#6198F3'

export function getArchetypeColor(archetype: string | null | undefined): string {
    if (!archetype) return DEFAULT_NODE_COLOR
    return ARCHETYPE_COLORS[archetype] || DEFAULT_NODE_COLOR
}

export const SECTORS = [
    { id: 'banking_finance', label: 'Banking & Finance', num: '01', color: '#FF9259', count: 214 },
    { id: 'healthcare', label: 'Healthcare', num: '02', color: '#4ade80', count: 189 },
    { id: 'retail_ecommerce', label: 'Retail & E-Commerce', num: '03', color: '#6198F3', count: 231 },
    { id: 'energy_utilities', label: 'Energy & Utilities', num: '04', color: '#E98166', count: 178 },
    { id: 'manufacturing', label: 'Manufacturing', num: '05', color: '#9b8aff', count: 256 },
] as const

export const INDUSTRIES = [
    'Agriculture & Food',
    'Automotive & Mobility',
    'Banking & Financial Services',
    'Construction & Real Estate',
    'Consumer Goods & Retail',
    'Education & Research',
    'Energy & Utilities',
    'Government & Public Sector',
    'Healthcare & Life Sciences',
    'Insurance',
    'Logistics & Supply Chain',
    'Manufacturing & Industry 4.0',
    'Media & Entertainment',
    'Mining & Natural Resources',
    'Professional Services',
    'Telecommunications',
    'Travel & Hospitality',
] as const

export const CAPABILITIES = [
    { value: 'AI', label: 'AI (Artificial Intelligence)' },
    { value: 'Agentic AI', label: 'Agentic AI' },
    { value: 'Cloud', label: 'Cloud Infrastructure' },
    { value: 'Computer Vision', label: 'Computer Vision' },
    { value: 'Data', label: 'Data & Analytics' },
    { value: 'Dev', label: 'Dev / Software Engineering' },
    { value: 'GenAI', label: 'GenAI (Generative AI)' },
    { value: 'IoT', label: 'IoT & Edge Computing' },
    { value: 'ML', label: 'Machine Learning' },
    { value: 'NLP', label: 'Natural Language Processing' },
    { value: 'RPA', label: 'Robotic Process Automation (RPA)' },
    { value: 'Security', label: 'Security & Compliance AI' },
] as const
