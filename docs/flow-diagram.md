# Flux Experience Flow

```mermaid
graph LR
    subgraph Merchant Side
        M1[Merchant Catalog]
        M2[Flux ACF Plug-in]
        M1 --> M2
    end

    subgraph Flux Platform
        F1[Signed Agentic Commerce Feed]
        F2[Agentic Search API]
        F3[Trust & Identity Layer]
        F4[Flux Checkout Rail]
        M2 --> F1
        F1 --> F2
        F2 --> F3
        F3 --> F4
    end

    subgraph Agent Side
        A1[AI Agent]
        A2[User Intent]
        A2 --> A1
    end

    A1 -->|Query| F2
    F2 -->|Ranked Offers + Provenance| A1
    A1 -->|Selected Offer| F4
    F4 -->|Secure Transaction| P[Payment Processor / Merchant]
    F4 -->|Audit Trail| F3
```

**How to read it**
- **Merchant Side:** Flux plug-ins turn raw catalogs into signed Agentic Commerce Feeds.
- **Flux Platform:** Feeds flow into search, trust, and checkout layers, preserving provenance at every step.
- **Agent Side:** Agents convert user intent into structured queries and receive signed, verifiable offers before executing checkout.
- **Checkout:** Flux handles the secure transaction while recording audit trails for compliance and trust badges.

Use this diagram during pitches to quickly walk investors through the end-to-end loop without diving into implementation details.
