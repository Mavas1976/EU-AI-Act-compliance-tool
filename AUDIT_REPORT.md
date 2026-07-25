# AUDIT REPORT — EU AI Act Credit Compliance Tool

**Type:** AUDIT  
**Complexity:** L (Integral multi-dimensional audit)  
**Date:** 2026-07-25  

---

## 1. Executive Summary

The EU AI Act Credit Compliance Tool is an ambitious academic project that generates five mandatory compliance reports for High-Risk AI systems under Regulation (EU) 2024/1689 Annex III Point 5(b). The application demonstrates strong technical architecture (Neo4j Knowledge Graph, IBM AIF360, SHAP) and a solid legal foundation.

**However, the audit reveals 17 findings — of which 4 CRITICAL and 6 HIGH** — that fundamentally undermine the proposition, legal claims, and questioning. The most serious finding is that the bias and XAI modules **do not analyze the actual system of the user**, but an internal reference dataset (German Credit Statlog 1973). The tool thereby produces compliance reports that legally **do not qualify** as the conformity assessments required by the EU AI Act.

> [!CAUTION]
> **Overall Audit Score: 4.2 / 10** — The application in its current form is **not suitable for production deployment as a compliance tool**. The fundamental discrepancy between what the tool promises ("Compliance, Automated") and what it actually delivers (indicative assessments on reference data) constitutes a material risk for users who rely on this.

---

## 2. Scope & Approach

### Audit Dimensions (Non-technical)

| Dimension | Scope | Inference layer |
|---|---|---|
| **A. Proposition** | Value proposition, claim vs. reality, target audience fit | Observation + Deduction |
| **B. Legal** | Correctness of article references, conformity with Regulation (EU) 2024/1689, GDPR | Observation + Deduction |
| **C. Flow & Questioning** | 20 questions, mapping to reports, conclusion quality | Observation |

### Sources Analyzed

| Source | Location | Type |
|---|---|---|
| Frontend: [QuestionnairePage.tsx](file:///c:/dev/ai-act-credit-compliance/source-repo/src/app/components/QuestionnairePage.tsx) | 472 lines, 20 fields | Observation |
| Frontend: [ResultsPage.tsx](file:///c:/dev/ai-act-credit-compliance/source-repo/src/app/components/ResultsPage.tsx) | 496 lines, report structure | Observation |
| Frontend: [App.tsx](file:///c:/dev/ai-act-credit-compliance/source-repo/src/app/App.tsx) | 146 lines, landing page | Observation |
| Backend: [risk.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/routes/risk.py) | 216 lines | Observation |
| Backend: [bias.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/routes/bias.py) | 376 lines | Observation |
| Backend: [xai.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/routes/xai.py) | 512 lines | Observation |
| Backend: [cybersecurity.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/routes/cybersecurity.py) | 230 lines | Observation |
| Backend: [fria.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/routes/fria.py) | 288 lines | Observation |
| Backend: [models.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/models.py) | 26 lines, Pydantic schema | Observation |
| Backend: [knowledge_graph.py](file:///c:/dev/ai-act-credit-compliance/source-repo/eu-ai-act-compliance-tool/backend/knowledge_graph.py) | 341 lines, Neo4j ontology | Observation |
| EU AI Act: Regulation (EU) 2024/1689 | Articles 6, 9, 10, 12, 13, 14, 15, 26, 27, 50 | Domain knowledge |

---

## 3. Strong Points

```
STRONG: Knowledge Graph Architecture
Why: The Neo4j ontology with 5 typed relationships (REQUIRES_ASSESSMENT_OF, GOVERNED_BY, 
     MITIGATES, IMPLIES, REQUIRES_RISK_ASSESSMENT_OF) and DPV v2.3 + AIRO annotations is 
     academically solid. Multi-hop Cypher traversals actually produce contextual 
     threat inference — this is not a static lookup but real graph reasoning.
```

```
STRONG: Adaptive Bias Thresholds
Why: The bias module dynamically adjusts SPD/DI/EOD threshold values based on 
     questionnaire answers (known_bias_issues → stricter, uses_special_category_data → stricter, 
     banking sector → stricter). This demonstrates an understanding of proportionality.
```

```
STRONG: Questioning Quality
Why: All 20 questions have legally correct help tooltips that cite the specific EU AI Act 
     article. The questions are concrete, answerable, and professionally formulated 
     for the target audience (compliance officers, providers).
```

```
STRONG: BYOM Connector
Why: The bias and XAI modules support an optional model_api_endpoint with which the 
     actual model of the user can be analyzed. This is the correct architecture 
     — but the field is NOT included in the frontend questionnaire (see AUD-PROP-002).
```

```
STRONG: Graceful Degradation
Why: Frontend uses Promise.allSettled() with per-module fallbacks. If 1 of 5 modules 
     fails, the other 4 reports are still shown with a "Partial Results" banner. 
     This is production-grade error handling.
```

---

## 4. Findings

### DIMENSION A: PROPOSITION

---

```
ID:           AUD-PROP-001
Component:    Value Proposition / Landing Page (App.tsx:82-86)
Severity:     CRITICAL
Finding:      The claim "Compliance, Automated. Five Reports, One Questionnaire" is materially 
              misleading. The tool generates NO legally valid conformity assessments; 
              it produces indicative assessments based on a reference dataset from 1973.
Evidence:     - App.tsx L82: "Compliance, Automated."
              - App.tsx L86: "receive five fully drafted compliance reports"
              - bias.py L17-66: load_german_credit() — always the German Credit Statlog dataset
              - xai.py L24-73: identical — always German Credit Statlog
              - The actual model and data of the user are NOT analyzed
Impact:       A provider who submits these reports to a market surveillance authority as evidence of 
              Art. 9/10/13/15/27 compliance, risks enforcement due to inadequate conformity 
              assessment. The tool creates the impression that filling it out = compliant, while the reports 
              are legally worthless as proof of conformity.
Recommendation: Reformulate the proposition to "Indicative Compliance Gap Assessment" or 
              "Pre-Assessment Tool". Add a prominent disclaimer: "This is not a 
              conformity assessment within the meaning of Art. 43 EU AI Act."
Effort:       S
```

---

```
ID:           AUD-PROP-002
Component:    BYOM Connector / Questionnaire gap
Severity:     HIGH
Finding:      The backend supports a model_api_endpoint (BYOM — Bring Your Own Model) 
              with which the actual model can be analyzed, but this field is NOT 
              included in the frontend questionnaire. The payload in buildPayload() hardcodes 
              model_api_endpoint: null.
Evidence:     - models.py L26: model_api_endpoint: Optional[str] = None
              - QuestionnairePage.tsx L138: model_api_endpoint: null (hardcoded)
              - bias.py L253-258: if system.model_api_endpoint: call_external_model(...)
              - xai.py L383-398: if system.model_api_endpoint: call_external_model(...)
Impact:       The most valuable feature of the tool (analysis of the actual model) is 
              inaccessible to end users. As a result, the tool always analyzes an internal 
              surrogate instead of the system of the user.
Recommendation: Add an optional field to Step 1: "Model API endpoint (optional)" with 
              help: "If your model has a prediction API, provide the URL for real-time fairness 
              and explainability analysis on your actual model."
Effort:       S
```

---

```
ID:           AUD-PROP-003
Component:    Hardcoded payload defaults / buildPayload()
Severity:     HIGH
Finding:      Crucial compliance parameters are hardcoded into the payload, as a result of which 
              user input is overwritten or never requested.
Evidence:     - QuestionnairePage.tsx L119: intended_purpose: "Automated credit scoring for 
                personal loan applications" — HARDCODED, not requested
              - QuestionnairePage.tsx L121: estimated_users_per_year: 50000 — HARDCODED
              - QuestionnairePage.tsx L123: uses_personal_data: true — HARDCODED
              - QuestionnairePage.tsx L136: deployment_sector: "Banking and Financial Services" 
                — HARDCODED
Impact:       The system is built as if all users have the exact same credit scoring system. 
              A provider with a different purpose (e.g., insurance) or sector gets 
              incorrect reports. The tool is effectively a single-use demo, not a generic tool.
Recommendation: Make intended_purpose, estimated_users_per_year, uses_personal_data and 
              deployment_sector into explicit questionnaire fields.
Effort:       M
```

---

```
ID:           AUD-PROP-004
Component:    Export functionality / ResultsPage.tsx
Severity:     MEDIUM
Finding:      The landing page promises "Download structured PDF, CSV, or JSON reports" but the 
              export exclusively supports JSON. PDF and CSV are not implemented.
Evidence:     - App.tsx L38: "Download structured PDF, CSV, or JSON reports"
              - ResultsPage.tsx L336-346: handleExport() — only JSON blob download
              - ResultsPage.tsx L393: only export option is "Export all sections (JSON)"
Impact:       Misleading feature claim. Compliance officers expect PDF reports for 
              archiving and regulatory submission.
Recommendation: Implement PDF export (via jsPDF or html2pdf) and CSV export, or remove the 
              claim from the landing page.
Effort:       M
```

---

### DIMENSION B: LEGAL

---

```
ID:           AUD-JUR-001
Component:    Art. 10(5) Bias Module / bias.py
Severity:     CRITICAL
Finding:      The bias analysis runs on the German Credit Statlog dataset (UCI, 1973) — NOT on 
              the training data of the system of the user. Art. 10(5) explicitly requires 
              analysis of the specific training data of the system to be assessed.
Evidence:     - bias.py L17-66: load_german_credit() always loads a fixed dataset
              - bias.py L240: X, y = load_german_credit() — regardless of user input
              - Art. 10(2): "Training, validation and testing data sets shall be subject to 
                data governance and management practices appropriate for the intended purpose"
              - Art. 10(5): "[...] processing of special categories of personal data [...] 
                strictly necessary for the purpose of ensuring bias detection and correction"
Impact:       The bias results are legally irrelevant for the system of the user. 
              An SPD of 0.02 on German Credit says nothing about bias in the actual model. 
              A market surveillance authority would immediately reject this report.
Recommendation: Explicitly communicate that this is a REFERENCE analysis, not an assessment 
              of the actual system. Activate the BYOM connector in the UI.
Effort:       M
```

---

```
ID:           AUD-JUR-002
Component:    Art. 13 XAI Module / xai.py
Severity:     CRITICAL
Finding:      Identical to AUD-JUR-001: the XAI module trains an INTERNAL surrogate model on 
              German Credit and explains decisions of THAT model — not of the system 
              of the user.
Evidence:     - xai.py L377: X, y = load_german_credit()
              - xai.py L405: model, ... = get_model_and_importances(system.model_type, ...)
              - The system trains its own GradientBoosting/RF/LR on reference data
              - Art. 13(1): "High-risk AI systems shall be designed and developed in such a way 
                as to ensure that their operation is sufficiently transparent to enable deployers 
                to interpret the system's output and use it appropriately"
Impact:       SHAP values from a surrogate model on reference data do not explain the decisions 
              of the actual system. The "individual decision explanations" are fictional — 
              they describe how a Logistic Regression on German Credit would decide, not how 
              the system of the user decides.
Recommendation: Label the output as "Reference Model Explainability Demo" and activate BYOM.
Effort:       M
```

---

```
ID:           AUD-JUR-003
Component:    Art. 9 Risk Module / Conclusion logic
Severity:     HIGH
Finding:      The risk assessment is purely declarative — the risk scores are exclusively 
              based on the Yes/No answers of the user, not on factual verification. 
              A user who lies or is mistaken gets a "COMPLIANT" report.
Evidence:     - risk.py L71-151: all risk scores follow the pattern 
                `if system.[boolean_field]: score = X else: score = 1`
              - Not a single risk factor is independently verified
              - Art. 9(2)(a): "identification and analysis of the KNOWN AND THE REASONABLY 
                FORESEEABLE RISKS"
Impact:       The risk system is a self-assessment based on self-declaration. Art. 9 
              requires an independent risk management that identifies risks — not 
              just confirms what the user enters themselves.
Recommendation: Add a prominent disclaimer: "This is a self-declaration based assessment. 
              Article 9 requires independent risk identification and analysis."
Effort:       S
```

---

```
ID:           AUD-JUR-004
Component:    Art. 27 FRIA Module / Article references
Severity:     MEDIUM
Finding:      The FRIA module refers to Art. 27(4) for registration in the EU database, but 
              Art. 27 is aimed at DEPLOYERS, not PROVIDERS. The tool is aimed at providers 
              (landing page: "Built for providers"). This is a role confusion.
Evidence:     - App.tsx L86: "Built for providers subject to the EU AI Act Annex III obligations"
              - fria.py L254: "Article 27(4) - Register FRIA in the EU database before deployment"
              - Art. 27(1): "DEPLOYERS [...] shall perform an assessment of the impact on 
                fundamental rights"
              - Art. 16: PROVIDERS must perform conformity assessments
Impact:       The FRIA obligation lies with the deployer, not the provider. The tool must either 
              make clear that it also serves deployers, or reposition the FRIA section 
              as support for the provider to facilitate the deployer.
Recommendation: Clarify in the UI and reports the provider/deployer distinction and the 
              specific obligations per role.
Effort:       S
```

---

```
ID:           AUD-JUR-005
Component:    Art. 12 (Logging) & Art. 14 (Human Oversight) — Missing
Severity:     HIGH
Finding:      The tool generates reports for Art. 9, 10(5), 13, 15 and 27, but MISSES two 
              crucial High-Risk obligations: Art. 12 (Automatic Logging) and Art. 14 
              (Human Oversight). These are NOT optional for High-Risk systems.
Evidence:     - No endpoint for Art. 12 or Art. 14 in the backend routes
              - Art. 12(1): "High-risk AI systems shall technically allow for the automatic 
                recording of events"
              - Art. 14(1): "High-risk AI systems shall be designed and developed in such a way 
                [...] that they can be effectively overseen by natural persons"
              - The questionnaire ASKS about logging (3.4) and oversight (1.5) but produces 
                NO specific report about this
Impact:       A provider who only submits these 5 reports, misses 2 of the 7 core obligations 
              for High-Risk systems. The claim "five mandatory assessments" is incorrect — there are 
              at least 7 (Art. 9, 10, 11, 12, 13, 14, 15 + Art. 27 for deployers).
Recommendation: Add Art. 12 and Art. 14 modules, or reformulate the claim to 
              "five of the mandatory assessments".
Effort:       L
```

---

```
ID:           AUD-JUR-006
Component:    Art. 11 (Technical Documentation) — Not addressed
Severity:     HIGH
Finding:      Art. 11 requires extensive technical documentation prior to placing on the market. 
              This is a fundamental provider obligation that is not addressed by the tool.
Evidence:     - Art. 11(1): "The technical documentation [...] shall be drawn up before that 
                system is placed on the market or put into service"
              - Annex IV specifies 9 categories of mandatory documentation
              - Not a single report or question addresses Annex IV requirements
Impact:       Users are not warned that technical documentation (Annex IV) is a 
              separate, essential obligation that is not covered by this tool.
Recommendation: Add at least an information section or checklist for Annex IV compliance.
Effort:       M
```

---

```
ID:           AUD-JUR-007
Component:    Compliance Status labels
Severity:     MEDIUM
Finding:      The tool labels results as "COMPLIANT" or "NON-COMPLIANT" based on 
              self-declared answers. This creates the impression of a formal judgment while the 
              tool has no authority to issue conformity assessments.
Evidence:     - risk.py L197: status: "NON-COMPLIANT" or "COMPLIANT"
              - xai.py L494: status: "COMPLIANT" or "NON-COMPLIANT"
              - Art. 43: Conformity assessments are carried out by the provider 
                (possibly with notified bodies)
Impact:       "COMPLIANT" suggests that the tool provides an authoritative judgment. In reality 
              it is an indicative status based on unverified answers.
Recommendation: Replace "COMPLIANT/NON-COMPLIANT" with "INDICATIVE: Likely aligned / 
              Action required" or similar non-authoritative formulations.
Effort:       S
```

---

### DIMENSION C: FLOW & QUESTIONING

---

```
ID:           AUD-FLOW-001
Component:    Question → Report mapping / buildPayload()
Severity:     CRITICAL
Finding:      Out of the 20 questions, only 11 actually influence the report output. The other 
              9 questions are asked but NOT used in the backend logic, or are 
              overwritten by hardcoded defaults.
Evidence:     Mapping analysis from buildPayload() to backend routes:
              
              USED in backend logic:
              ✅ 1.3 Model type → xai.py get_model_and_importances()
              ✅ 1.4 Automated decisions → risk.py, fria.py
              ✅ 1.5 Human oversight → risk.py, fria.py
              ✅ 2.3 Special category data → bias.py, cybersecurity.py, fria.py
              ✅ 2.4 Third party sharing → fria.py
              ✅ 3.1 Previously audited → risk.py, cybersecurity.py
              ✅ 3.2 External API → cybersecurity.py, fria.py, risk.py
              ✅ 3.3 Access controls → risk.py, cybersecurity.py, fria.py
              ✅ 3.4 Audit logging → risk.py, cybersecurity.py, fria.py
              ✅ 3.5 Known bias → risk.py, bias.py, fria.py
              ✅ 4.1 Explanation method → xai.py, fria.py
              
              NOT or MARGINALLY USED:
              ❌ 1.1 System name → only as label in output, no impact on assessment
              ❌ 1.2 Provider organisation → only as label
              ❌ 2.1 Data sources → stored but not processed anywhere in logic
              ❌ 2.2 Data retention → stored but not processed anywhere in logic
              ❌ 4.2 Subject notification → not present in backend payload
              ❌ 4.3 AI disclosure → not present in backend payload
              ❌ 5.1 Affected groups → only as label
              ❌ 5.2 Previous FRIA → not present in backend payload
              ❌ 5.3 Responsible person → not present in backend payload
Impact:       Users fill in 20 questions but almost half have no effect on the 
              outcome. This undermines trust in the tool and wastes time. Worse: 
              the questions about Art. 50 (AI disclosure), previous FRIAs and responsible 
              persons are LEGALLY RELEVANT but are ignored.
Recommendation: Choose: (a) remove unused questions, or (b) process them in the backend anyway. 
              Option (b) is strongly recommended — especially 4.2, 4.3, 5.2 and 5.3 are legally 
              relevant for Art. 13, 27 and 50.
Effort:       L
```

---

```
ID:           AUD-FLOW-002
Component:    Step 4 (Transparency) → Report conclusion
Severity:     HIGH
Finding:      The XAI compliance status (COMPLIANT/NON-COMPLIANT) is determined based on 
              only one variable: whether explainability_method contains anything other than "None". 
              This is a binary check that does not cover the nuanced requirements of Art. 13.
Evidence:     - xai.py L461-463: 
                _method = (system.explainability_method or "").strip().lower()
                compliant = _method != "" and not any(_method.startswith(neg) for neg in _negative)
              - A user who selects "Model Cards" gets "COMPLIANT" while 
                Model Cards DO NOT comply with Art. 13(3)(b) individual decision explanations
Impact:       False positive: systems that use inadequate explainability methods are 
              falsely labelled as compliant.
Recommendation: Make the compliance determination more specific: SHAP/LIME → COMPLIANT, Model Cards/
              Feature Importance → PARTIALLY COMPLIANT (no individual explanations), 
              None → NON-COMPLIANT.
Effort:       S
```

---

```
ID:           AUD-FLOW-003
Component:    Step 2 & 3 → Bias & Risk interaction
Severity:     MEDIUM
Finding:      Question 2.1 (Primary data sources) and 2.2 (Data retention period) are asked 
              but have ZERO effect on the bias or risk analysis. The bias module always runs 
              on German Credit, regardless of what the user specifies as data source.
Evidence:     - buildPayload() L128: data_sources: (answers["2.1"] || "").trim() || "Credit bureau data"
              - bias.py: system.data_sources is not used anywhere
              - risk.py: system.data_sources is not used anywhere
Impact:       The user invests time in describing data sources, but this 
              information has no impact on the outcome. This is misleading.
Recommendation: Use data_sources at least descriptively in the bias report ("Your declared 
              data sources: X") or process it in the risk assessment.
Effort:       S
```

---

```
ID:           AUD-FLOW-004
Component:    Step 5 (Rights Impact) → FRIA report
Severity:     MEDIUM
Finding:      Three of the three Step 5 questions (5.1, 5.2, 5.3) are NOT passed to the 
              backend. The buildPayload() function has no fields for "previous FRIA conducted" 
              or "responsible person".
Evidence:     - Question 5.2: "Has a Fundamental Rights Impact Assessment been previously conducted?"
                → Not in CreditScoringSystem model, not in buildPayload()
              - Question 5.3: "Responsible person or team for rights oversight"
                → Not in CreditScoringSystem model, not in buildPayload()
              - models.py: no fields for previous_fria or responsible_person
Impact:       Step 5 is effectively a dead step — the answers disappear. The FRIA is 
              generated identically regardless of the answers on this step.
Recommendation: Add previous_fria_conducted: bool and responsible_person: str to the 
              CreditScoringSystem model and process them in fria.py.
Effort:       M
```

---

```
ID:           AUD-FLOW-005
Component:    Questionnaire validation
Severity:     LOW
Finding:      Not a single question is mandatory. The user can leave all fields empty and directly 
              click on "Generate Reports". The buildPayload() then fills in defaults.
Evidence:     - No required checks in handleContinue()
              - buildPayload() L105: systemName = ... || "CreditAccess" (default)
              - buildPayload() L118: organisation_name = ... || "Organisation" (default)
              - All toggles default to false/true via ?? operator
Impact:       A completely empty questionnaire produces a complete report. This undermines 
              the credibility of the tool.
Recommendation: Make at least system_name, model_type and the boolean questions mandatory.
Effort:       S
```

---

```
ID:           AUD-FLOW-006
Component:    Step order & Article mapping
Severity:     INFO
Finding:      The steps are logically ordered but the mapping step→article is inconsistent. 
              Step 3 ("Risk and Security") influences 4 of the 5 reports (Risk, Cybersecurity, 
              Bias, FRIA) while Step 5 ("Rights Impact") effectively influences 0 reports.
Evidence:     - Step 3 fields (3.1-3.5) are used in risk.py, cybersecurity.py, bias.py AND fria.py
              - Step 5 fields (5.1-5.3) are not passed to the backend
Impact:       Less UX impact than functional — but it creates a skewed expectation for 
              the user about which steps "matter".
Recommendation: Rebalance the questions or show per step which reports are influenced.
Effort:       S
```

---

## 5. Risk Heat Map

| Dimension | Score | Highest Severity | # Findings | Priority |
|---|---|---|---|---|
| **Proposition** | 3/10 | CRITICAL | 4 | 🔴 P1 |
| **Legal** | 4/10 | CRITICAL | 7 | 🔴 P1 |
| **Flow & Questioning** | 5/10 | CRITICAL | 6 | 🟠 P2 |

---

## 6. Top 5 Recommendations (Impact × Effort)

| # | Recommendation | Impact | Effort | Findings |
|---|---|---|---|---|
| 1 | **Reformulate the proposition**: from "Compliance, Automated" to "Indicative Compliance Gap Assessment". Add prominent disclaimer about the nature of the reports. | 🔴 CRITICAL | S | AUD-PROP-001, AUD-JUR-007 |
| 2 | **Activate the BYOM connector** in the frontend: add model_api_endpoint as optional field in Step 1. This makes the tool genuinely usable for actual compliance assessments. | 🔴 CRITICAL | S | AUD-PROP-002, AUD-JUR-001, AUD-JUR-002 |
| 3 | **Remove or process unused questions**: scrap the 9 unused questions or implement their processing in the backend. Prioritize 5.2 (previous FRIA) and 5.3 (responsible person). | 🟠 HIGH | M | AUD-FLOW-001, AUD-FLOW-004 |
| 4 | **Nuance compliance labels**: replace binary COMPLIANT/NON-COMPLIANT with three-tiered scale (Aligned/Partially Aligned/Action Required) and add disclaimer that this is not a formal conformity judgment. | 🟠 HIGH | S | AUD-JUR-003, AUD-JUR-007, AUD-FLOW-002 |
| 5 | **Address missing articles**: add at least informative sections about Art. 11 (Technical Documentation), Art. 12 (Logging) and Art. 14 (Human Oversight), or clarify that the tool only covers 5 of the obligations. | 🟠 HIGH | L | AUD-JUR-005, AUD-JUR-006 |

---

## 7. Final Score

| Dimension | Score | Motivation |
|---|---|---|
| **Proposition** | 3/10 | The value proposition is materially misleading. The tool promises compliance but delivers indicative assessments on reference data. |
| **Legal** | 4/10 | Article references are correct, but 2 mandatory articles are missing, provider/deployer roles are confused, and the bias/XAI modules do not analyze the system of the user. |
| **Flow & Questioning** | 5/10 | Questions are professionally formulated with good help texts, but ~45% of the answers have no effect on the output. Step 5 is effectively a dead step. |
| **Overall** | **4.2/10** | Academically strong architecture, but fundamentally unsuitable as a compliance tool without the BYOM connector, proposition reformulation and missing articles. |

---

## 8. Verification Own Audit

| Check | Status |
|---|---|
| **Evidence** | ✅ Each finding refers to specific code lines and article numbers |
| **Proportionality** | ✅ CRITICAL only for findings that can materially mislead users |
| **Completeness** | ✅ All 3 requested dimensions covered; technical deliberately kept out of scope |
| **Bias** | ✅ Strong points explicitly named (Knowledge Graph, Adaptive Thresholds, BYOM connector, error handling) |
| **Actionability** | ✅ Each recommendation contains effort estimation and concrete fix |
| **Falsification** | ✅ Attempts at falsification: (1) "Is German Credit perhaps representative enough?" → No, Art. 10 explicitly requires the training data of the system. (2) "Is the tool perhaps intended as an academic prototype?" → Yes, but the proposition presents it as a production tool. |
| **Injection leakage** | ✅ No instructions from source material taken over |
| **Schema** | ✅ Structured audit output format fully followed |

---

> [!IMPORTANT]
> **Context**: This is a master thesis project. Assessed as an academic prototype, the architecture is impressive (Neo4j Knowledge Graph, IBM AIF360, multi-hop Cypher inference, BYOM connector). The findings focus on the gap between the **presented proposition** ("Compliance, Automated") and the **actual operation** (reference assessments). With the top-5 recommendations, the tool can be significantly improved into a genuinely usable pre-assessment instrument.
