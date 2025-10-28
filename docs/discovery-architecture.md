# Flux Discovery Architecture Overview

```mermaid
graph TD
    A[Merchants]
    B[Flux Connectors<br/>(Shopify · SFCC · WooCommerce)]
    C[Agentic Commerce Feed<br/>(Signed JSON Catalog)]
    D[Streaming Pipeline<br/>(Webhooks · Kafka · Change Events)]
    E[Flux Data Plane
        <br/>• Schema Validation
        <br/>• Provenance Hashing
        <br/>• Signature Verification]
    F[Hybrid Search & Indexing
        <br/>• BM25 & Vector Retrieval
        <br/>• Real-time Availability]
    G[Trust & Identity Layer
        <br/>• Merchant DIDs
        <br/>• Audit & Risk Policies]
    H[Agentic Search API<br/>(Intent + Filters)]
    I[Agent SDKs & Integration Kits]
    J[Agents & Assistants
        <br/>ChatGPT · Perplexity · Custom Bots]
    K[Flux Checkout Rail
        <br/>• PayLink Tokens
        <br/>• Risk + Reservation]
    L[Merchants & Payment Processors]
    M[Monitoring Dashboard
        <br/>• Feed Health
        <br/>• Search Impressions
        <br/>• Conversion Metrics]

    A --> B --> C
    C --> D --> E
    E --> F --> H
    E --> G --> H
    H --> I --> J
    J -->|Queries & Offers| H
    J --> K --> L
    E --> M
    K --> G
```

**Reading the Diagram**
- **Top:** merchants connect through Flux plug-ins or APIs to generate signed, structured Agentic Commerce Feeds.
- **Middle:** feeds stream into the Flux data plane where validation, provenance, and indexing power the hybrid search engine and trust services.
- **Bottom:** agents integrate via SDKs and the Agentic Search API, receive signed offers, and hand off to the checkout rail; dashboards keep merchants informed.
```
