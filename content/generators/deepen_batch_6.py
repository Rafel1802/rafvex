# content/generators/deepen_batch_6.py
import json
import re
import sys
sys.path.append('content/generators')
import gen_batch_6

def count_words(text):
    clean = re.sub(r'<[^>]+>', ' ', text)
    clean = re.sub(r'```.*?```', ' ', clean, flags=re.DOTALL)
    clean = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', clean)
    clean = re.sub(r'[`#*_\-\|]', ' ', clean)
    return len(clean.split())

def enrich_batch_6():
    arts = gen_batch_6.get_batch_6()
    enriched = []

    for art in arts:
        aid = art['id']
        content = art['content']

        if aid == 36:
            # Article 36: Authenticator Apps vs SMS (Target: >2,150 words)
            s1_extra = """From a telecommunications infrastructure perspective, the vulnerability of SMS is rooted in the commercial decentralization of the global cellular carrier ecosystem. When a bank in London or New York dispatches an SMS verification code to an executive traveling in Singapore or Tokyo, that message does not travel across a secure, dedicated fiber line. Instead, it is routed through third-party SMS aggregators, international roaming clearinghouses, and regional cellular gateways.

Each hop in this international routing chain represents an unauthenticated, unmonitored interception point. Malicious actors operating within untrusted foreign networks can lease cheap access to SS7 and Diameter signaling nodes, querying the Home Location Register (HLR) and Visitor Location Register (VLR) to redirect SMS text payloads to attacker-controlled IMSI destinations without alerting either the originating sender or the legitimate subscriber."""

            s5_extra = """To further protect authentication tokens against modern credential theft, the cybersecurity industry is establishing **Cryptographic Token Binding and DPoP (Demonstrating Proof-of-Possession at the Application Layer - RFC 9449)**. In standard web authentication, once a user submits a valid TOTP code, the server issues a bearer token or session cookie. If an attacker steals this bearer cookie via malware or reverse-proxy phishing, they can use it from any computer in the world.

DPoP neutralizes this vulnerability by cryptographically binding the access token to an asymmetric keypair generated inside the client browser's local sandbox. For every subsequent API request, the browser must sign the HTTP header using its private key. Even if an adversary intercepts the session token via a sophisticated phishing proxy, the stolen token is cryptographically useless because the attacker does not possess the matching private key locked within the victim's local browser runtime."""

            content = content.replace("**1. The Architectural Fragility of Telephony-Based Authentication**", "**1. The Architectural Fragility of Telephony-Based Authentication**\n\n" + s1_extra)
            content = content.replace("**5. Advanced Hardening: Neutralizing Reverse-Proxy Phishing and Evilginx**", "**5. Advanced Hardening: Neutralizing Reverse-Proxy Phishing and Evilginx**\n\n" + s5_extra)

        elif aid == 37:
            # Article 37: Spotting Fake Emails & Suspicious Links (Target: >2,150 words)
            s1_extra = """The cognitive psychological architecture underlying modern spear-phishing relies on **Heuristic Priming and Authority Exploitation**. Human beings do not process routine electronic communications with exhaustive analytical scrutiny; doing so would induce cognitive paralysis when managing dozens of emails daily. Instead, the human brain relies on fast, associative mental heuristics: recognizing familiar typography, institutional logos, and authoritative signatures.

Adversaries deliberately engineer their communications to trigger high-cortisol emotional states—urgency, professional vanity, or existential panic (e.g., *"Immediate Account Termination Within 2 Hours"*, or *"Confidential Notice of Grant Audit"*). When an individual experiences sudden acute stress, executive functioning in the prefrontal cortex is suppressed, and cognitive decision-making shifts to rapid, reactive behavioral patterns. The user clicks the embedded link to avert the perceived crisis before their analytical faculties can interrogate the URL structure."""

            s2_extra = """When inspecting complex academic email routing, researchers must also understand **ARC (Authenticated Received Chain - RFC 8617)**. In modern academic collaboration, emails are frequently forwarded through institutional mailing lists, alumni forwarding relays, and departmental alias servers (e.g., forwarding from `alumni.cam.ac.uk` to a personal Gmail account).

Traditional SPF validation inevitably breaks during forwarding because the IP address of the intermediate forwarding server does not match the original sender's SPF record. Furthermore, mailing list software that appends subject prefixes (e.g., `[FACULTY-DISCUSSION]`) or footer disclaimers invalidates the original DKIM cryptographic signature. ARC solves this by creating a cryptographic sequence of custody: each trusted intermediate mail relay validates the inbound message, signs the verification results with its own key, and appends an `ARC-Seal:` header, allowing downstream servers like Google or Microsoft to trace the unbroken chain of trust back to the original author."""

            s5_extra = """In addition to URL inspection, researchers must enforce **Cryptographic DNSSEC (Domain Name System Security Extensions) Validation**. In sophisticated nation-state espionage campaigns, adversaries deploy DNS cache poisoning and rogue BGP route announcements to intercept traffic intended for legitimate university portals. Even if you type the correct URL manually, a compromised local Wi-Fi router in a hotel or airport can return a fraudulent IP address pointing to an AitM reverse proxy.

Enabling DNSSEC ensures that every DNS lookup response is cryptographically signed by parent root servers, guaranteeing that the IP address returned matches the verified authoritative record published by the true domain registrar."""

            content = content.replace("**1. The Industrial Evolution of Academic and Enterprise Social Engineering**", "**1. The Industrial Evolution of Academic and Enterprise Social Engineering**\n\n" + s1_extra)
            content = content.replace("**2. Deep Subsystem Evaluation: Deconstructing Email Authentication Protocols (SPF, DKIM, DMARC)**", "**2. Deep Subsystem Evaluation: Deconstructing Email Authentication Protocols (SPF, DKIM, DMARC)**\n\n" + s2_extra)
            content = content.replace("**5. Advanced Hardening: Automated Sandboxing and Browser Isolation**", "**5. Advanced Hardening: Automated Sandboxing and Browser Isolation**\n\n" + s5_extra)

        elif aid == 38:
            # Article 38: AI Personal Tutor (Target: >2,150 words)
            s1_extra = """From an educational neuroscience perspective, the structural failure of traditional lecture-based instruction lies in the **Passive Consumption Penalty**. When students sit in a three-hundred-person auditorium listening to a professor derive Maxwell's equations or trace metabolic citric acid cycles, the primary sensory modalities engaged are auditory and visual reception. Neuroimaging studies demonstrate that during passive listening, prefrontal cortical metabolic activation remains low; the brain treats incoming sensory streams as ambient narrative noise rather than survival-salient cognitive schemas.

When an individual engages in active Socratic interrogation, however, the prefrontal cortex lights up with intense metabolic activity. The neural effort required to identify an inconsistency, articulate a counter-hypothesis, and defend a mathematical premise against an unyielding intellectual interlocutor stimulates the release of acetylcholine and norepinephrine. These neuromodulators tag active synaptic pathways for long-term potentiation (LTP), transforming ephemeral working memory traces into permanent, retrieval-resilient cerebral architecture.

This computational paradigm directly addresses **Benjamin Bloom's 1984 '2-Sigma Problem'**. Educational researcher Benjamin Bloom demonstrated empirically that an average student paired with a dedicated 1-on-1 private tutor using mastery learning techniques performed two standard deviations (two sigmas) above students taught in standard classrooms—elevating a 50th-percentile student to the 98th percentile. For four decades, the 2-sigma effect remained an unattainable luxury due to the immense economic cost of private human instruction. Fine-tuned conversational foundation models finally solve this institutional bottleneck, providing universal, personalized 2-sigma tutoring at near-zero marginal cost."""

            s2_extra = """Furthermore, deploying AI as a Socratic mentor dismantles the destructive psychological phenomenon known as **Evaluation Anxiety and Classroom Inhibition**. In traditional university seminars, students frequently withhold questions or pretend to comprehend complex theorems because they fear appearing ignorant before peers and professors. This silent confusion compounds across an academic term, culminating in catastrophic exam failures.

A private foundation model operating locally or via private API interfaces provides an emotionally safe, infinitely patient, and ego-free intellectual sparring arena. A student can ask the AI to reframe the derivation of quantum tunneling six consecutive times using differing physical analogies—from hydraulic fluid dynamics to vibrating acoustic membranes—without experiencing shame, social hesitation, or institutional judgment.

Moreover, this dialectical feedback loop stimulates **Metacognitive Self-Regulation**. In conventional learning, learners rarely observe their own thought processes in real-time. By reading their own written explanations reflected and dissected on screen by the synthetic tutor, students develop acute metacognitive sensitivity: they begin to anticipate logical inconsistencies before typing them, naturally accelerating their progression from novice reasoning to expert intuition."""

            s3_extra = """To harness this architecture for programming and software engineering education, deploy the **Socratic Code Review Protocol**. When learning algorithms or data structures, avoid asking the AI to write the code. Instead, submit your own unoptimized, buggy implementation and instruct the model:

```markdown
Analyze my implementation of this balanced binary search tree.
RULES:
1. Do NOT rewrite the code or provide the fixed syntax.
2. Identify the single worst performance bottleneck or edge-case bug in my logic.
3. Formulate a targeted conceptual question that forces me to trace the memory allocation or pointer dereference manually.
4. Once I diagnose the bug, ask me to calculate the algorithmic time and space complexity using Big-O notation.
```

This conversational friction transforms code review into an intense masterclass in algorithmic thinking, instilling cognitive problem-solving patterns that endure long after syntax details are forgotten."""

            s5_extra = """To protect against the cognitive trap of **Metacognitive Miscalibration (The Dunning-Kruger Effect in Self-Directed Study)**, students must establish objective empirical validation metrics. When using conversational AI, the fluid, articulate nature of the model's responses can easily lull a student into believing they have mastered a topic when they have merely recognized its vocabulary.

To defeat this illusion, implement the **Blind Reconstruction Protocol**: once a Socratic study module is complete, close the AI interface completely. Take a blank sheet of paper and an analog pen. Set a 15-minute timer and derive the entire mathematical proof, biochemical pathway, or constitutional law framework from absolute memory with zero external aids. If your pen hesitates or your logic fractures, you have successfully exposed a real knowledge gap to be targeted in your next study cycle."""

            s4_extra = """Analyzing the cognitive architecture of these differing study modalities illustrates why active retrieval triggers superior neurological retention. When an individual engages in passive reading or highlighting, the brain operates in recognition mode: familiar words trigger transient dopaminergic satisfaction without requiring synaptic remodeling.

In stark contrast, Socratic mentoring forces the student to construct mental models actively from foundational principles. By requiring the brain to search semantic memory, evaluate constraints, and formulate structured hypotheses, the student engages the hippocampus and prefrontal cortex in continuous metabolic work, embedding durable cognitive pathways that resist the natural forgetting curve."""

            s6_extra = """To establish an enduring academic study habit, schedule your Socratic AI sessions during your peak circadian alertness windows (typically early morning or post-exercise). Treat the conversational session with the seriousness of an oral examination: sit at a clean, distraction-free desk, speak your answers aloud before typing, and transcribe all final conceptual breakthroughs into an analog, leatherbound journal. When you combine digital Socratic interrogation with physical analog handwriting, you anchor abstract synthetic intelligence in tactile human memory.

Finally, establish a weekly 'Socratic Synthesis Audit'. Every Sunday, select the three most difficult theorems explored during the week and prompt your tutor to administer a timed oral defense. Defending your logic under simulated time pressure builds unshakeable cognitive resilience and transforms theoretical comprehension into permanent operational mastery. True intellectual sovereignty is never given; it is forged in the fire of active, deliberate inquiry."""

            content = content.replace("**1. The Epistemological Revolution of Synthetic Socratic Tutoring**", "**1. The Epistemological Revolution of Synthetic Socratic Tutoring**\n\n" + s1_extra)
            content = content.replace("**2. Deep Pedagogical Architecture: The Four Pillars of Synthetic Mastery**", "**2. Deep Pedagogical Architecture: The Four Pillars of Synthetic Mastery**\n\n" + s2_extra)
            content = content.replace("**3. Step-by-Step Implementation: The Master Socratic Prompt Frameworks**", "**3. Step-by-Step Implementation: The Master Socratic Prompt Frameworks**\n\n" + s3_extra)
            content = content.replace("**4. Comparative Production Benchmark: Study Paradigms Contrast**", "**4. Comparative Production Benchmark: Study Paradigms Contrast**\n\n" + s4_extra)
            content = content.replace("**5. Advanced Cognitive Calibration: Spaced Retrieval and Synthesis Loops**", "**5. Advanced Cognitive Calibration: Spaced Retrieval and Synthesis Loops**\n\n" + s5_extra)
            content = content.replace("**6. Operational AI Tutoring Protocol & Synthesis**", "**6. Operational AI Tutoring Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 39:
            # Article 39: AI Flashcard & Summary Generators (Target: >2,150 words)
            s1_extra = """To understand why spaced retrieval represents a foundational breakthrough in educational psychology, one must analyze the biochemical mechanics of **Synaptic Consolidation and Synaptic Pruning**. During wakeful learning, the hippocampus rapidly encodes temporary episodic memories using flexible, low-threshold synaptic connections. However, the human brain possesses finite metabolic energy and cannot maintain every transient memory trace indefinitely.

During non-rapid eye movement (NREM) slow-wave sleep, the brain executes systematic synaptic pruning: neural pathways that have not been reinforced through active recall are dismantled, their synaptic proteins reabsorbed. When a student forces their brain to retrieve a fact via a spaced flashcard prompt, the hippocampus replays the neural firing pattern, signaling to the neocortex that this specific circuit is vital for operational survival. The neocortex responds by myelinating the axon and cementing structural dendritic spines."""

            s2_extra = """Comparing the mathematical topologies of **SM-2 and FSRS-4.5** illustrates why legacy flashcard systems induce severe student burnout. The legacy SM-2 algorithm assumes that the memory forgetting curve decays at a fixed, uniform exponential rate for all learners and all categories of knowledge. Consequently, when a student encounters a difficult anatomical card or legal precedent that requires multiple repetitions, SM-2 repeatedly halves the interval, trapping the user in 'Ease Hell' where hundreds of redundant reviews accumulate daily.

FSRS, by contrast, models memory as a dynamic three-dimensional state space ($S, R, D$). As you review cards over months, FSRS calculates the exact statistical probability that you will recall a given fact on day $t$. If your target retention is configured to 90%, FSRS schedules the card for review at the precise moment your retrievability probability ($R$) drops to 90%. This eliminates 30% of unnecessary review volume, enabling medical students and researchers to master vast curricula in half the daily study time."""

            s3_extra = """When configuring Anki with automated AI extraction pipelines, managing **Leech Thresholds and Card Hygiene** is critical. In Anki terminology, a 'leech' is a flashcard that you have failed repeatedly (e.g., pressing 'Again' 8 times). In 95% of cases, a leech card is not a failure of student discipline; it is a failure of card design.

The card violates the Minimum Information Principle: it is too long, ambiguous, or lacks contextual anchoring. In your Anki preferences, set **Leech Action** to `Tag Only` rather than `Suspend`. When Anki tags a card as a leech, do not continue brute-forcing it. Feed the failing card back into your AI extraction prompt and command the model: *"This flashcard is failing active recall. Deconstruct this single card into three smaller, more intuitive sub-cloze deletions with distinct contextual hints."*"""

            s4_extra = """From a data sovereignty and software lifecycle perspective, relying on venture-backed commercial study applications introduces severe long-term academic risk. Platforms like Quizlet frequently alter their commercial terms, lock basic spaced repetition features behind monthly paywalls, and restrict bulk data exports. If a proprietary platform shutters or changes its pricing model, a student's multi-year investment of thousands of study cards is held hostage.

By selecting open-source Anki backed by local SQLite databases and community-maintained plugins, students retain 100% data sovereignty. Your study decks exist as local files on your physical hardware, completely accessible offline and permanently safeguarded against vendor bankruptcy or unexpected subscription increases."""

            s5_extra = """To build seamless interoperability between your digital literature reading and spaced repetition, knowledge workers should integrate **Readwise, Obsidian, and Anki**. When reading academic monographs or Kindle books, highlight high-impact passages and append custom tags (e.g., `#cloze` or `#concept`). Using automated API synchronization plugins, these highlights flow directly into your local Obsidian vault as structured markdown literature notes.

A lightweight local script or LLM prompt then audits the tagged notes, extracts verified cloze-deletion parameters, and injects the resulting cards into your master Anki collection via AnkiConnect. This creates an automated, continuous intellectual conveyor belt: reading feeds synthesis, synthesis generates flashcards, and daily spaced repetition cements permanent mastery."""

            s6_extra = """To maintain cognitive stamina across rigorous multi-month examination preparations, cultivate the habit of **Micro-Review Bursts and Interleaved Practice**. Rather than cramming three hundred cards in a single exhausting evening session, break your daily reviews into fifteen-minute Pomodoro bursts distributed throughout the day (e.g., morning commute, post-lunch walk, evening wind-down).

Furthermore, activate deck interleaving in Anki: rather than studying pure pharmacology followed by pure pathology, mix related cards into an interleaved queue. Forcing the brain to switch context dynamically between varying diagnostic domains mimics real-world clinical and engineering problem-solving, dramatically reinforcing cross-synaptic resilience."""

            content = content.replace("**1. The Neurobiology of Spaced Retrieval and the Failure of Rote Flashcards**", "**1. The Neurobiology of Spaced Retrieval and the Failure of Rote Flashcards**\n\n" + s1_extra)
            content = content.replace("**2. Deep Subsystem Evaluation: Algorithmic Spaced Repetition (SM-2 vs. FSRS) and Automated Cloze Parsing**", "**2. Deep Subsystem Evaluation: Algorithmic Spaced Repetition (SM-2 vs. FSRS) and Automated Cloze Parsing**\n\n" + s2_extra)
            content = content.replace("**3. Step-by-Step Implementation: The Automated PDF-to-Anki Pipeline via Python and Local LLMs**", "**3. Step-by-Step Implementation: The Automated PDF-to-Anki Pipeline via Python and Local LLMs**\n\n" + s3_extra)
            content = content.replace("**4. Comparative Production Benchmark: Dedicated AI Study Platforms vs. Local Anki FSRS**", "**4. Comparative Production Benchmark: Dedicated AI Study Platforms vs. Local Anki FSRS**\n\n" + s4_extra)
            content = content.replace("**5. Advanced Cognitive Calibration: The Hierarchical Executive Summary Stack**", "**5. Advanced Cognitive Calibration: The Hierarchical Executive Summary Stack**\n\n" + s5_extra)
            content = content.replace("**6. Operational Revision Protocol & Synthesis**", "**6. Operational Revision Protocol & Synthesis**\n\n" + s6_extra)

        elif aid == 40:
            # Article 40: Practical AI Workflows for Bloggers & Researchers (Target: >2,150 words)
            s1_extra = """The structural transformation reshaping academic and technical publishing is the shift from monolithic, siloed manual workflows to **Computational and Open-Science Publication Architectures**. Historically, the scholarly publishing ecosystem was dominated by commercial oligopolies (such as Elsevier, Springer Nature, and Wiley) that imposed slow, multi-year peer-review cycles and gated public-funded research behind exorbitant individual and institutional paywalls.

Today, independent researchers, research institutions, and technical essayists are bypassing these legacy gatekeepers through the sovereign triumvirate of open preprints (arXiv, bioRxiv), reproducible code repositories (GitHub, Zenodo), and self-hosted, masterclass scientific web publications. By publishing comprehensive, high-cadence technical syntheses directly on the open web, scholars achieve immediate planetary reach, invite collaborative peer review in real time, and establish intellectual primacy months before traditional print journals even assign an associate editor.

This democratization aligns directly with global research initiatives such as **cOAlition S and Plan S**, which mandate that publicly funded scientific research must be made immediately and freely accessible on open-access digital repositories without embargo periods. By pairing open preprint repositories with high-velocity web publishing engines, researchers fulfill international open-science mandates while maximizing the real-world citation velocity of their scholarship."""

            s2_extra = """At the engineering level, building a high-velocity publishing pipeline requires treating text not as static prose, but as **Structured, Version-Controlled Data Assets**. Modern technical publishing pipelines leverage Git version control, static site generators (Next.js, Astro, Hugo), and headless markdown parsing engines (MDX, remark, rehype).

When an author integrates fine-tuned foundation models into this repository framework, the AI operates as an automated continuous integration / continuous deployment (CI/CD) linting assistant. Upon committing a draft, automated GitHub Actions or local pre-commit hooks invoke specialized scripts that verify image aspect ratios, calculate reading times, audit internal cross-reference link graphs, and test terminal code blocks against isolated Docker execution containers before a single page is pushed to production web servers."""

            s3_extra = """In technical publications containing computational figures, automating data visualizations eliminates hours of manual graphic design. Modern publishing workflows pair language models with **Matplotlib, Seaborn, and Mermaid.js**:
- Feed raw empirical CSV datasets into the model and command it to generate publication-grade Python visualization scripts adhering to Edward Tufte's principles of data density and minimal non-data ink.
- Enforce strict graphical aesthetic rubrics: muted color palettes, explicit axis units, high DPI vector output (SVG / PDF), and direct on-chart data labels that eliminate confusing color legends.
- Automatically lint and render the resulting vector figures into the manuscript directory using headless CLI scripts, guaranteeing that every chart is mathematically synchronized with the latest experimental data."""

            s4_extra = """When comparing the operational velocity of automated publishing pipelines against traditional editorial workflows, the primary return on investment lies in **Cognitive Energy Reallocation**. In traditional publishing, an academic researcher expends over 60% of their total publication time on administrative formatting: converting bibliography files, adjusting margin paddings, and manually re-numbering citations after adding a reference.

By delegating these repetitive mechanical workflows to verified computational scripts and local AI extractors, authors reclaim their cognitive reserves for deep, original intellectual work: designing more rigorous experiments, stress-testing theoretical models, and polishing high-cadence narrative prose."""

            s5_extra = """Furthermore, researchers must master the art of **Cross-Disciplinary Translational Storytelling**. One of the greatest tragedies of modern academia is the hyperspecialization of scientific prose: a groundbreaking paper in computational genomics or statistical thermodynamics often remains completely impenetrable to bioinformaticians, software engineers, and venture investors due to dense mathematical shorthand and hyper-specific jargon.

By configuring language models with the 'Ladder of Abstraction' protocol, authors can command the model to generate parallel translational layers for their publication: an executive summary for industry leaders, an intuitive conceptual walkthrough for undergraduate students, and an uncompromising, equation-dense mathematical appendix for peer domain specialists. This multi-tier architecture maximizes citation impact and public intellectual influence."""

            s6_extra = """To complete your publishing pipeline, implement an **Automated Cross-Platform Syndication Workflow**. When a new masterclass article is deployed to your primary canonical domain, trigger automated webhook pipelines that generate summarized threads on Mastodon and Bluesky, archive static DOM snapshots to Archive.today, and submit your verified XML sitemaps to search engine indexing APIs. This guarantees that your research enters the global intellectual discourse immediately upon deployment.

Furthermore, annotate your web publications with **Schema.org ScholarlyArticle JSON-LD Structured Data**. Embedding semantic JSON metadata—including author ORCID identifiers, DOI links, peer-review status, and licensing tags—enables academic search engines (such as Google Scholar, Semantic Scholar, and OpenAlex) to index your technical publications with verified bibliographic authority.

Finally, maintain an immutable local archive of your published scholarly articles in standard PDF/A archival format. By keeping an offline mirror on an external encrypted drive, you guarantee that your research legacy remains sovereign and impervious to cloud outages, platform migrations, or algorithmic takedowns. Knowledge belongs to the human commons; building an automated, sovereign publishing architecture ensures that your contributions will inspire scholars for generations to come."""

            content = content.replace("**1. The Industrial Publishing Bottleneck in Contemporary Knowledge Production**", "**1. The Industrial Publishing Bottleneck in Contemporary Knowledge Production**\n\n" + s1_extra)
            content = content.replace("**2. Deep Subsystem Evaluation: The Four Operational Layers of the AI Publishing Engine**", "**2. Deep Subsystem Evaluation: The Four Operational Layers of the AI Publishing Engine**\n\n" + s2_extra)
            content = content.replace("**3. Step-by-Step Implementation: The Automated Manuscript-to-Publication Pipeline**", "**3. Step-by-Step Implementation: The Automated Manuscript-to-Publication Pipeline**\n\n" + s3_extra)
            content = content.replace("**4. Comparative Production Benchmark: Manual vs. AI-Assisted Publishing Pipelines**", "**4. Comparative Production Benchmark: Manual vs. AI-Assisted Publishing Pipelines**\n\n" + s4_extra)
            content = content.replace("**5. Advanced Dissemination Architecture: Syndication and Link Graph Engineering**", "**5. Advanced Dissemination Architecture: Syndication and Link Graph Engineering**\n\n" + s5_extra)
            content = content.replace("**6. Operational Publishing Protocol & Synthesis**", "**6. Operational Publishing Protocol & Synthesis**\n\n" + s6_extra)

        art['content'] = content
        wc = count_words(content)
        art['word_count'] = wc
        enriched.append(art)
        print(f"Enriched Article #{aid}: {art['title']} -> {wc} words (Pillar: {art.get('is_pillar', False)})")

    with open('content/articles/batch_6.json', 'w', encoding='utf-8') as f:
        json.dump(enriched, f, indent=2, ensure_ascii=False)
    print("Successfully saved deepened Batch 6 to content/articles/batch_6.json")

if __name__ == '__main__':
    enrich_batch_6()
