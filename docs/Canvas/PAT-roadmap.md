# PAT v0.5 Road-map & Build Board

> **Purpose** – single living document to keep architecture, tasks, and status in one place.

## 0 · Architecture Snapshot  
```mermaid
graph TD
    subgraph PAT (persona)
        Manager
        Voice
        Memory
        Empathy
    end
    subgraph AMA_Swarm
        AMA_LLM
        AMA_Search
    end
    Manager -->|delegates| AMA_LLM
    Manager -->|delegates| AMA_Search
    Manager --> Voice
```