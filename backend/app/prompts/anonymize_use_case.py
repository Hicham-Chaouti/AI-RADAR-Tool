"""LLM prompt for smart use case anonymization."""

ANONYMIZE_PROMPT = """You are an AI assistant specialized in rewriting business use cases.

Your task is to clean and anonymize ONLY the specific product or solution name assigned to a use case
(e.g., a custom chatbot name like "Chatify"), while preserving all general technical terms and concepts.

IMPORTANT RULES:

- REMOVE or REPLACE ONLY:
  - Custom solution names (e.g., "Chatify", "SmartAssist", "DocuAI Pro")
  - Internal product names created by a company for this use case

- DO NOT REMOVE:
  - General technologies (e.g., chatbot, AI system, machine learning, NLP)
  - Well-known generic concepts (e.g., CRM, cloud platform, database)
  - Descriptions of functionality

REWRITING INSTRUCTIONS:
- Replace the custom name with a generic functional term:
  - "Chatify" → "AI-powered chatbot"
  - "DocuAI Pro" → "document processing system"
- Rewrite the sentence naturally if needed
- Keep the meaning and business value unchanged
- Keep a professional and clear tone

FORBIDDEN:
- Do NOT remove technical meaning
- Do NOT over-generalize everything
- Do NOT use placeholders like [Tool] or [Name]
- Return ONLY valid JSON — no markdown fences, no preamble, no explanation

INPUT USE CASE:
Title: {title}
Description: {description}

Return exactly this JSON shape:

{{
  "title": "Cleaned, generic title",
  "description": "2-3 lines with the same meaning but without the custom product name"
}}"""
