# Flux Discovery Architecture Overview

```mermaid
graph TD
    A["Merchants"]
    B["Flux Connectors\n(Shopify, SFCC, WooCommerce)"]
    C["Agentic Commerce Feed\n(Signed JSON Catalog)"]
    D["Streaming Pipeline\n(Webhooks, Kafka, Change Events)"]
    E["Flux Data Plane\n- Schema Validation\n- Provenance Hashing\n- Signature Verification"]
    F["Hybrid Search & Indexing\n- BM25 & Vector Retrieval\n- Real-time Availability"]
    G["Trust & Identity Layer\n- Merchant DIDs\n- Audit & Risk Policies"]
    H["Agentic Search API\n(Intent + Filters)"]
    I["Agent SDKs & Integration Kits"]
    J["Agents & Assistants\n(ChatGPT, Perplexity, Custom Bots)"]
    K["Flux Checkout Rail\n- PayLink Tokens\n- Risk + Reservation"]
    L["Merchants & Payment Processors"]
    M["Monitoring Dashboard\n- Feed Health\n- Search Impressions\n- Conversion Metrics"]

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
