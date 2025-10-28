# Flux Product Vision

Flux is the agentic commerce infrastructure layer that turns the open web into a machine-readable, agent-safe, transaction-ready network. Flux gives AI agents the same level of structured access to inventory, pricing, and checkout that Stripe provided for payments and Shopify provided for merchants.

## Core Thesis
- Autonomous agents acting on behalf of users and businesses will increasingly search, recommend, and execute purchases.
- The current web stack is tuned for humans and browsers, not machine actors.
- Flux supplies the rails that make commerce agent-native, safe, and verifiable.
- Analogy: Flux is to agent transactions what Stripe is to payments and Shopify is to online storefronts.

## 1. The Problem

| Today | Tomorrow with Flux |
|-------|--------------------|
| Agents scrape unstructured pages and SEO data. | Agents query trusted, structured Agentic Commerce Feeds (ACF). |
| No standard product APIs or checkout flow. | Unified Agentic Commerce Protocol (ACP) from discovery through checkout. |
| High risk of spoofing, prompt-injection, and mis-intent. | Signed, verified actions with cryptographic provenance. |
| Existing payment APIs (Stripe, PayPal, Shopify) are not agent-first. | Flux provides agent-native search, verification, and payment rails. |

Without Flux, every agent developer and every retailer must rebuild these primitives independently, leading to inconsistent UX, higher risk, and limited scalability.

## 2. The Solution
Flux delivers an end-to-end protocol and platform for agentic commerce:

### A. Agentic Commerce Feed (ACF)
- Structured, signed JSON feeds exposing products, offers, and availability based on the ACP spec.
- Real-time synchronization via plug-ins for Shopify, Salesforce Commerce Cloud, BigCommerce, WooCommerce, and custom stacks.
- Eliminates scraping while providing tamper-evident data to agents.

### B. Agentic Search API
- Hybrid vector + keyword search across merchant feeds.
- Returns ranked, signed offers with provenance metadata.
- Example query: `Find white Nike Air Force 1s under $150 near SoMa.`

### C. Agentic Checkout Rail
- Secure transaction protocol with Flux PayLink and optional external processors (Stripe, Adyen, Apple Pay, etc.).
- Built-in reservation, risk, and provenance verification.
- Anti-injection guardrails using action hashes and policy hints.

### D. Flux Trust & Identity Layer
- Merchant decentralized identifiers and JWS signing for authenticity.
- Buyer and agent identity plus consent proofs.
- Tamper-evident audit trail for regulators and risk engines.

## 3. Target Customers
1. **Phase 1 – Developer-led adoption**
   - AI agent platforms (OpenAI GPTs, Humane, Rabbit, Perplexity, Hugging Face agents).
   - LLM infrastructure providers (LangChain, Dust, Cognition Labs).
   - Early retailers eager to become “agent-ready.”
2. **Phase 2 – Merchant ecosystem**
   - Shopify and SFCC merchants installing the Flux app to expose feeds and accept agent checkouts.
3. **Phase 3 – Platforms**
   - Marketplaces (Amazon, Etsy, Uber Eats, DoorDash) adopting ACP to make inventory agent-discoverable.

## 4. Business Model
- **API Platform Pricing:** Usage-based pricing (e.g., $X per 1,000 search calls).
- **Flux PayLink:** 1% transaction fee for purchases cleared through Flux rails.
- **Merchant SaaS Tier:** $49–$499 per month for feed hosting, analytics, and verification badges.
- **Enterprise Licensing:** Dedicated ACP nodes for large retailers (Nike, Walmart, etc.).
- **Optional Monetization:** Flux Verified trust badge and risk scoring services.

## 5. Why Now
- Agents such as ChatGPT, Gemini 2.5, Claude, and Perplexity are gaining purchasing capabilities.
- No standard exists for machine-to-merchant commerce; Flux fills the gap.
- Regulators emphasize provenance and safety (EU AI Act, FTC AI labeling), increasing demand for signed actions.
- Retailers already surface schema.org data; Flux requires only incremental work for adoption.

## 6. Competitive Moat

| Category | Incumbents | Why Flux Wins |
|----------|------------|---------------|
| Payments | Stripe, Adyen | They process money but lack intent provenance and inventory feeds. |
| Marketplaces | Amazon, Google Shopping | Closed ecosystems; Flux remains open and interoperable. |
| Agent Platforms | OpenAI, Perplexity | These platforms consume Flux feeds; Flux owns the infra layer. |
| Web Standards | W3C, Schema.org | Flux operationalizes and extends existing standards with cryptographic accountability. |

Flux becomes the connective tissue between merchants and agents across ecosystems, compounding value as the network grows.

## 7. Flywheel Dynamics
1. Merchant installs Flux → exposes agentic feed.
2. Agents integrate Flux Search → access richer inventory.
3. Increased transactions → stronger Flux Pay adoption.
4. Trust badges and risk scoring reinforce compliance and merchant preference.
5. Network effect accelerates as agents prefer Flux-verified merchants and vice versa.

## 8. 12-Month Roadmap

| Quarter | Focus |
|---------|-------|
| Q1 | Publish ACP v1 spec and open-source SDKs (Python, JavaScript, Go). |
| Q2 | Launch Flux Pay sandbox and Shopify App connector. |
| Q3 | Conduct first merchant pilots (Nike, Allbirds, Shopify Plus brands). |
| Q4 | Release trust & provenance dashboard and agent analytics API. |

## 9. Vision Statement
Flux makes commerce machine-readable, trust-verifiable, and frictionless for autonomous agents. Just as Stripe connected the internet to payments, Flux connects the agentic web to commerce.

