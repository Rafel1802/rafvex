# content/generators/deepen_batch_3.py
import json
import re
import sys
sys.path.append('content/generators')
import gen_batch_3

def enrich_batch_3():
    arts = gen_batch_3.get_batch_3()
    enriched = []

    for art in arts:
        aid = art['id']
        content = art['content']

        if aid == 16:
            # Article 16: Hardware Security Keys (Target: >2,250 words)
            s2_extra = """At the silicon coprocessor level, modern security tokens execute asymmetric cryptography using dedicated hardware cryptographic accelerators. When generating a credential for a relying party, the token executes an on-chip elliptic curve key generation routine over the `secp256r1` (NIST P-256) or `ed25519` curve. The private scalar is permanently retained within a tamper-resistant EEPROM security boundary protected against physical differential power analysis (DPA) and focused ion beam (FIB) micro-probing.

Furthermore, WebAuthn supports **FIDO Attestation**. During initial token registration, the security key can provide an attestation statement cryptographically signed by an intermediate certificate batch-programmed into the hardware during factory manufacturing. This allows enterprise and government defense organizations to enforce strict cryptographic device whitelist policies, ensuring that authentication ceremonies are accepted exclusively from government-certified FIDO Level 3+ tokens (such as FIPS 140-3 validated YubiKeys) while rejecting software-emulated virtual authenticators."""
            s3_extra = """In addition to web authentication, modern hardware security tokens revolutionize developer and administrator operational security through **FIDO2-backed OpenSSH keys**. Historically, developers stored unencrypted SSH private keys (`id_rsa` or `id_ed25519`) in their local home directory (`~/.ssh/`), leaving keys acutely vulnerable to infostealer malware and compromised developer dependencies.

With OpenSSH 8.2 and later, administrators can generate hardware-backed resident keys via `ssh-keygen -t ed25519-sk -O resident`. In this architecture, the private key material remains permanently sealed inside the physical YubiKey; only a lightweight public key handle is stored on disk. Whenever an SSH connection is initiated, the terminal prompts the user to physically touch the token. Even if malicious malware attains root access on the developer's workstation, it is physically impossible for the adversary to steal the private key or establish silent SSH sessions without physical human contact with the USB token."""
            s5_extra = """When designing enterprise authentication policies, security architects must understand WebAuthn's **User Verification (UV)** flags: `preferred`, `discouraged`, or `required`. While User Presence (UP) merely requires a physical capacitive tap to prove human existence, User Verification requires inputting the hardware PIN or biometric fingerprint directly to the token. Mandating `uv=required` ensures that even if an attacker physically steals a researcher's YubiKey from their desk, the token is inert without the 8-digit hardware PIN, which automatically locks and zeroizes after three consecutive incorrect attempts."""

            content = content.replace("**2. The FIDO2, WebAuthn, and CTAP2 Cryptographic Architecture**", "**2. The FIDO2, WebAuthn, and CTAP2 Cryptographic Architecture**\n\n" + s2_extra)
            content = content.replace("**3. Hardware Security Key Deployment & OpenPGP Configuration**", "**3. Hardware Security Key Deployment & OpenPGP Configuration**\n\n" + s3_extra)
            content = content.replace("**5. Advanced Hardening: Resident Credentials (Passkeys)", "**5. Advanced Hardening: Resident Credentials (Passkeys)\n\n" + s5_extra)

        elif aid == 17:
            # Article 17: Threat Modeling for Researchers (Target: >2,250 words)
            s1_extra = """Historical precedents across academia demonstrate the devastating real-world cost of un-modeled security architectures. In 2018, the US Department of Justice unsealed indictments against the Mabna Institute, a state-sponsored threat group that methodically compromised over 300 universities worldwide, exfiltrating over 31 terabytes of academic intellectual property, nuclear engineering dissertations, and biomedical patents. The attackers did not deploy exotic zero-day exploits against hardened server kernels; they executed trivial, automated spear-phishing campaigns against academic faculty who reused passwords across personal and university accounts.

Similarly, in modern clinical research, multiple academic hospital networks and clinical trial consortia have been paralyzed by targeted ransomware syndicates (such as Ryuk and LockBit). Laboratories operating without verified air-gapped backups experienced total loss of longitudinal oncology data, forcing researchers to abort multi-year patient trials and forfeit millions of dollars in federal research grants. These catastrophic failures occurred not because researchers lacked technical brilliance in biology or physics, but because their operational security lacked systematic, formal threat modeling."""
            s2_extra = """In quantitative research environments handling human subjects, epidemiological tracking, or sociological surveys, standard security models fail because they overlook **Data Linkability**. Under the LINDDUN framework, analysts evaluate how pseudo-anonymized research records can be cross-referenced with external public registries (such as voter registration lists or commercial credit bureaus) to re-identify confidential research subjects.

By applying $k$-anonymity, $l$-diversity, and differential privacy ($(\epsilon, \delta)$-differential privacy) algorithms directly during data pipeline modeling, researchers mathematically bound the maximum probability that an adversary can infer the presence or private attributes of an individual respondent from published research summaries."""
            s5_extra = """In modern high-performance computational research, laboratories increasingly deploy containerized multi-tenant environments—such as Kubernetes clusters running JupyterHub for collaborative machine learning. Threat modeling these shared environments requires strict evaluation of container escape vulnerabilities and shared kernel namespace isolation.

Security teams must enforce immutable root filesystems, disable root privileges (`runAsNonRoot: true`), and deploy eBPF-based runtime monitoring tools (such as Cilium Tetragon) to intercept suspicious kernel syscalls (e.g., unexpected network socket creation by Python analysis scripts). Modeling these trust perimeters ensures that a compromised student container cannot escalate privileges to inspect proprietary datasets stored on adjacent worker nodes."""
            s6_extra = """Furthermore, institutional threat modeling must be integrated into recurring laboratory project management cycles. During bi-weekly research sprint retrospectives, principal investigators should reserve ten minutes to review infrastructure alterations: new cloud integrations, updated data sharing agreements with external universities, or newly onboarded research assistants. Maintaining an auditable Git log of threat model revisions ensures that compliance with federal funding agency security mandates (such as NIST SP 800-171 controls) is verifiable during institutional audits."""

            content = content.replace("**1. The Epistemological Limits of Generic Security Advice", "**1. The Epistemological Limits of Generic Security Advice\n\n" + s1_extra)
            content = content.replace("**2. Core Threat Modeling Methodologies: STRIDE vs. PASTA vs. LINDDUN**", "**2. Core Threat Modeling Methodologies: STRIDE vs. PASTA vs. LINDDUN**\n\n" + s2_extra)
            content = content.replace("**5. Operationalizing Threat Models: Integrating CI/CD", "**5. Operationalizing Threat Models: Integrating CI/CD\n\n" + s5_extra)
            content = content.replace("**6. Operational Threat Modeling Protocol & Synthesis**", "**6. Operational Threat Modeling Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 18:
            # Article 18: Academic Integrity & AI Policies (Target: >2,250 words)
            s1_extra = """A landmark 2023 empirical study conducted by computational linguistics researchers at Stanford University revealed the severe systemic bias inherent in commercial AI text detectors. The researchers evaluated seven widely deployed probabilistic detectors against standard TOEFL essays authored by international non-native English students and essays authored by native English eighth-graders. The results were damning: commercial detectors misclassified over 61% of authentic non-native English essays as 'AI-generated,' while native English student essays were correctly identified as human with 97% accuracy.

The mathematical mechanism behind this failure is straightforward: probabilistic detectors evaluate text based on **perplexity** (a metric of vocabulary predictability) and **burstiness** (the statistical variation in sentence length and syntactic structure). Non-native English speakers naturally utilize more formal, repetitive, and limited lexicons, exhibiting lower perplexity and standardized sentence cadence. When universities deploy commercial detectors to police academic integrity, they inadvertently construct an automated algorithmic pipeline that disproportionately penalizes international, immigrant, and neurodivergent students while allowing sophisticated users who paraphrase with advanced prompting to evade detection effortlessly."""
            s3_extra = """To operationalize transparent AI usage across differing academic disciplines, syllabus committees must tailor attribution requirements to pedagogical goals. In an introductory computer programming course, the learning objective is mastering algorithmic syntax and computational debugging; permitting zero-shot AI generation completely circumvents this cognitive milestone.

Conversely, in an advanced doctoral seminar on computational genomics, writing boilerplate Python data-cleaning scripts is trivial administrative overhead; the intellectual contribution lies in formulating biological hypotheses and interpreting statistical variance. Academic policies must therefore avoid monolithic institutional edicts and empower individual departments to calibrate attribution requirements based on the specific cognitive skills being assessed."""
            s5_extra = """To institutionalize authentic process-based grading, universities are increasingly adopting **Inquiry-Driven Scaffolded Milestones**. Rather than assigning a single terminal term paper due during the final week of the semester, faculty break assignments into four mandatory, chronological milestones:
1. *Milestone 1 (Week 4)*: Formal pre-registration of hypotheses and experimental methodology submitted to an institutional repository.
2. *Milestone 2 (Week 7)*: Submission of raw empirical data, laboratory notebooks, and qualitative interview audio transcripts.
3. *Milestone 3 (Week 10)*: Dialectical AI audit appendix documenting specific prompt interactions, model hallucinations detected, and primary source literature cross-checks.
4. *Milestone 4 (Week 14)*: Final synthesized research report accompanied by a brief Socratic oral presentation.

Under this pedagogical scaffolding, even if a student utilizes an LLM to assist with drafting, the integrity of the research is fully guaranteed because the underlying hypotheses, empirical data, and critical verification remain authentically human."""
            s6_extra = """Finally, successful institutional transformation requires comprehensive faculty development rather than top-down punitive decrees. Universities must sponsor hands-on workshops where educators experiment directly with state-of-the-art foundation models, learning to design prompts that reveal hallucinations and constructing assignments that emphasize metacognitive reflection. Establishing an institutional AI Literacy Center provides ongoing guidance for both faculty and students, replacing fear and suspicion with ethical, rigorous digital literacy."""

            content = content.replace("**1. The Epistemological Crisis of Generative Models", "**1. The Epistemological Crisis of Generative Models\n\n" + s1_extra)
            content = content.replace("**3. Constructing Transparent Syllabus Statements", "**3. Constructing Transparent Syllabus Statements\n\n" + s3_extra)
            content = content.replace("**5. Redesigning Assessments: Defeating Zero-Shot Generation", "**5. Redesigning Assessments: Defeating Zero-Shot Generation\n\n" + s5_extra)
            content = content.replace("**6. Institutional Implementation Protocol & Synthesis**", "**6. Institutional Implementation Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 19:
            # Article 19: Automated Preprint Tracking (Target: >2,250 words)
            s1_extra = """The macro-economic shift toward open preprint distribution reflects the accelerating velocity of modern empirical science. In the biological and biomedical sciences alone, bioRxiv and medRxiv have published over 250,000 preprints since their inception, providing instantaneous global access to clinical epidemiology, genomic sequencing breakthroughs, and synthetic biology protocols months before formal journal review concludes.

However, the complete absence of traditional editorial gatekeeping shifts the burden of critical evaluation entirely onto the individual researcher. Without journal impact factors or editorial triage, researchers must sift through hundreds of unvetted manuscripts, separating transformative methodological discoveries from mathematically flawed or irreproducible studies. Relying on manual web browsing in this hyper-abundant information ecosystem leads to severe attentional fragmentation, reducing the deep cognitive focus required for sustained scientific discovery."""
            s2_extra = """At the mathematical level, dense vector semantic scoring operates by mapping text into a high-dimensional geometric hypersphere. When a transformer model (such as `allenai/specter2`) encodes an academic abstract, it projects semantic and conceptual relationships into a 768-dimensional embedding space. Semantically similar concepts—such as 'stochastic gradient descent optimization' and 'adaptive learning rate algorithms'—cluster closely together, separated by tiny angular distances.

By computing the **cosine similarity** between the normalized vector of a newly harvested preprint ($\vec{u}$) and the researcher's laboratory interest profile ($\vec{v}$):

$$\text{Cosine Similarity} = \frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\|_2 \|\vec{v}\|_2}$$

The ingestion daemon evaluates conceptual relevance independent of specific keyword matches. Even if a paper introduces novel terminology that the researcher has never searched for, the model recognizes its underlying semantic proximity to the laboratory's ongoing work, ensuring that groundbreaking interdisciplinary analogical discoveries are never missed."""
            s4_extra = """Beyond abstract analysis, advanced pipelines incorporate automated full-text ingestion using open-source PDF parsing engines like **GROBID** or **PyMuPDF**. While abstracts provide a high-level summary, the true methodological rigor of a paper resides in its 'Methods' and 'Experimental Setup' sections. An advanced Python daemon automatically downloads the candidate PDF, extracts the specific statistical tables and software repository URLs from the methods section, and feeds these granular parameters to the local LLM. This enables the model to identify whether the authors evaluated their algorithm on standard benchmark datasets or utilized cherry-picked private splits, providing instant insight into empirical reproducibility."""
            s5_extra = """For laboratories maintaining large-scale research graphs across multiple investigators, exported Markdown notes can be ingested into a central **Neo4j Graph Database** or queried via **Obsidian Dataview DQL**. This allows researchers to write complex analytical queries across their entire monitored literature corpus:

```sql
TABLE core_novelty, potential_limitation, relevance
FROM #type/preprint
WHERE relevance >= 8 AND contains(file.tags, "deep-learning")
SORT relevance DESC
```

By querying the aggregated literature database, research groups can conduct weekly laboratory journal clubs, review competitive landscape shifts, and compile automated literature reviews for ongoing grant applications in minutes rather than weeks."""

            s6_extra = """To maximize team productivity, research laboratories should designate an automated daily literature review rota. Rather than every postdoctoral researcher independently scanning feeds, the centralized daemon posts filtered, high-relevance summaries to an internal communication channel (such as a private Matrix room or Slack channel) at 08:00 every morning. Laboratory members can asynchronously react with emoji tags to claim papers for weekly journal clubs, eliminating redundant reading and fostering interdisciplinary discussions across the entire research group.

Furthermore, integrating pre-calculated vector similarity scores directly into laboratory knowledge graphs creates an organizational memory that survives graduate student turnover. When a new doctoral candidate joins the laboratory, they can instantly query historical preprint digests across preceding years, rapidly identifying seminal algorithmic foundations without retracing literature paths already explored by senior colleagues."""

            content = content.replace("**1. The Deluge of Scholarly Preprints", "**1. The Deluge of Scholarly Preprints\n\n" + s1_extra)
            content = content.replace("**2. Architectural Pipeline: RSS Ingestion,", "**2. Architectural Pipeline: RSS Ingestion,\n\n" + s2_extra)
            content = content.replace("**4. Comparative Ingestion Architecture Matrix**", "**4. Comparative Ingestion Architecture Matrix**\n\n" + s4_extra)
            content = content.replace("**5. Advanced Integration: Syncing to Obsidian", "**5. Advanced Integration: Syncing to Obsidian\n\n" + s5_extra)
            content = content.replace("**6. Operational Literature Daemon Protocol & Synthesis**", "**6. Operational Literature Daemon Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 20:
            # Article 20: Grant Proposal Stress-Testing (Target: >2,250 words)
            s1_extra = """To understand how to defeat grant study section triage, one must understand the statistical distribution of peer review scoring. In the NIH peer review system, each member of a Scientific Review Group (SRG) assigns an initial priority score from 1 (Exceptional) to 9 (Poor). The bottom 50% of submitted proposals are streamlined ('triaged') during the preliminary evaluation phase and never receive a formal discussion or percentile score at the study section meeting.

For proposals that escape triage and are discussed, securing a fundable percentile (typically top 8% to 12% depending on the NIH institute) requires near-unanimous enthusiasm from all three primary assigned reviewers. A single reviewer who raises an unaddressed statistical concern or notes that 'Aim 2 has no backup strategy if Assay X fails' can drag the composite priority score from 18 to 35, instantly pushing the proposal into the unfunded zone. Grant red-teaming is specifically designed to eliminate these fatal scoring anchors before the study section convenes."""
            s2_extra = """An advanced technique in AI grant stress-testing is **Multi-Agent Dialectical Debate**. Rather than relying on a single prompt interaction, researchers configure a multi-agent simulation where two distinct LLM personas debate the merits of the proposal in an automated dialogue loop.

One agent is parameterized as the 'Enthusiastic Proposer' defending the transformative novelty of the research, while the second agent is parameterized as the 'Hostile Methodological Auditor' systematically attacking statistical assumptions, control groups, and timeline feasibility. Observing the multi-round transcript of this simulated debate exposes subtle defensive vulnerabilities and allows investigators to draft airtight counter-arguments in the 'Research Strategy' narrative before formal submission."""
            s4_extra = """In study section deliberations, the physical presentation of information strongly influences reviewer cognitive load. Study section members frequently review proposals on airline flights or in hotel rooms after long clinical shifts. If critical contingency plans or statistical justifications are buried inside dense, unbroken blocks of ten-point text, the reviewer will overlook them and write 'Investigator failed to provide contingency assays' in their summary statement. By utilizing structured callout boxes, explicit decision-tree diagrams, and pre-emptive 'Pitfalls and Alternative Approaches' subsections at the conclusion of each specific aim, the author ensures that hostile reviewers cannot claim crucial safeguards were omitted."""
            s5_extra = """Furthermore, researchers must adhere strictly to federal research data security and confidentiality mandates during proposal preparation. In late 2023, both the NIH and NSF issued formal guidance clarifying that uploading unpublished, proprietary grant proposals to commercial public artificial intelligence platforms violates peer review integrity policies and institutional intellectual property protections.

Executing adversarial red-teaming pipelines exclusively on local, air-gapped workstations using quantized open-weight models (such as Llama-3.1-70B running via `llama.cpp` or Ollama) ensures that preliminary data, novel molecular structures, and proprietary experimental designs remain completely sovereign and compliant with federal export and privacy regulations."""
            s6_extra = """Following proposal hardening, research teams should conduct an internal mock study section with senior colleagues who have served on relevant study sections. By presenting a proposal that has already been stress-tested against algorithmic red-teaming, human reviewers can focus on high-level strategic alignment and institutional significance rather than pointing out trivial methodological flaws, dramatically elevating the likelihood of securing an award."""

            content = content.replace("**1. The High-Stakes Calculus of Competitive Research Grant Peer Review**", "**1. The High-Stakes Calculus of Competitive Research Grant Peer Review**\n\n" + s1_extra)
            content = content.replace("**2. The Dialectical Red-Teaming Paradigm: Simulating Hostile Study Sections**", "**2. The Dialectical Red-Teaming Paradigm: Simulating Hostile Study Sections**\n\n" + s2_extra)
            content = content.replace("**4. Comparative Grant Review Hardening Matrix**", "**4. Comparative Grant Review Hardening Matrix**\n\n" + s4_extra)
            content = content.replace("**5. Scripting the Grant Stress-Test via Local Python Workflows**", "**5. Scripting the Grant Stress-Test via Local Python Workflows**\n\n" + s5_extra)
            content = content.replace("**6. Operational Grant Hardening Protocol & Synthesis**", "**6. Operational Grant Hardening Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 21:
            # Article 21: Termux and Tasker (Target: >2,250 words)
            s1_extra = """In extreme physical fieldwork, power management and thermal dynamics represent the fundamental laws governing computational reliability. Consumer laptops draw between 45 and 95 watts under compute load, requiring heavy 200-watt solar arrays and bulky lead-acid or lithium-iron-phosphate (LiFePO4) battery generators to sustain continuous daily operation. In tropical rainforests, ambient relative humidity exceeding 95% combined with daily 38°C temperatures causes active cooling fans in laptops to suck moisture directly across motherboard solder traces, inducing catastrophic electrical short circuits within weeks.

Modern IP68-rated smartphones completely transform field edge computing physics. Operating with passive silicon heat dissipation, sealed vapor chambers, and zero moving parts, an IP68 handset can be dropped in a muddy river, submerged under two meters of water for an hour, washed off in a stream, and continue running Linux daemon processes without interruption. Drawing less than 3 to 5 watts under full computational load, an entire multi-week research expedition can be powered by two ultralight 15-watt foldable solar panels and a single 20,000 mAh rugged power bank."""
            s2_extra = """To ensure that background Linux daemons continue executing reliably when the phone's screen is locked and in the researcher's pack, field engineers must bypass Android's aggressive battery management subsystem (Doze Mode). Under standard Android behavior, when the device screen is powered off for several minutes, the Android framework restricts CPU cycles, suspends network access, and defers alarm timers to conserve battery life.

To maintain continuous 24/7 background scientific logging in Termux, execute two critical administrative overrides:
1. **Acquire Termux Wake-Lock**: Run `termux-wake-lock` from the terminal. This registers an Android system partial wake-lock, instructing the Linux kernel to keep ARM64 CPU cores operational even when the display is dark.
2. **Disable Battery Optimization**: In Android system settings (`Settings > Apps > Termux > Battery`), set the power policy to **Unrestricted**. This prevents the Android ActivityManager from terminating background Python or bash daemons when system RAM experiences pressure from camera or navigation apps."""
            s5_extra = """For long-duration field deployments monitoring dozens of external wireless sensors (such as acoustic bat monitors or soil moisture arrays), researchers can integrate **LoRa (Long Range) mesh networking** directly with Termux. By connecting a lightweight USB-C LoRa transceiver (such as a Meshtastic or LilyGO T-Beam node) to the smartphone, Termux Python scripts can listen on local serial interfaces (`/dev/ttyACM0`), receiving telemetry packets transmitted across tens of kilometers of mountainous terrain without cellular or satellite connections.

The received telemetry is unpacked, verified against cryptographic checksums, and written to the local SQLite database in real time, turning the field researcher's pocket handset into a localized regional IoT telemetry hub."""

            content = content.replace("**1. The Operational Reality of Austere Field Research", "**1. The Operational Reality of Austere Field Research\n\n" + s1_extra)
            content = content.replace("**2. Architecture: Linux User-Space on Unrooted Android", "**2. Architecture: Linux User-Space on Unrooted Android\n\n" + s2_extra)
            content = content.replace("**5. Advanced Hardening: SQLite WAL Mode", "**5. Advanced Hardening: SQLite WAL Mode\n\n" + s5_extra)

        art['content'] = content
        words = len(re.findall(r'\b\w+\b', content))
        print(f"Enriched Article #{aid}: {art['title']} -> {words} words")
        enriched.append(art)

    with open('content/articles/batch_3.json', 'w') as f:
        json.dump(enriched, f, indent=2)
    print("Successfully saved enriched Batch 3 to content/articles/batch_3.json")

if __name__ == '__main__':
    enrich_batch_3()
