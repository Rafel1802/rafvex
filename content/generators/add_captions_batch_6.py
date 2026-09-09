# content/generators/add_captions_batch_6.py
import json

BATCH_6_CAPTIONS = {
    36: {
        "image_captions": {
            "img1": "Figure 1: Close-up studio photography of a smartphone displaying time-based one-time password (TOTP) codes beside a hardware security key.",
            "img2": "Figure 2: Protocol architecture diagram contrasting vulnerable SS7 SMS cellular routing against local HMAC-SHA1 cryptographic TOTP token generation.",
            "img3": "Figure 3: Mobile authenticator interface demonstrating biometric-protected cloud-synced 2FA accounts and QR code enrollment.",
            "img4": "Figure 4: Security decision matrix mapping account value tiers against recommended two-factor authentication modalities."
        },
        "comparison_cards": {
            "img2": {
                "title": "Two-Factor Authentication: Insecure SMS Verification vs. Cryptographic TOTP Apps",
                "point1": "SMS Text Verification: Vulnerable to SIM-swapping, SS7 cellular network eavesdropping, and phishing proxy interception; ties authentication to an unencrypted cellular carrier protocol.",
                "point2": "Authenticator Apps (RFC 6238 TOTP): Generates local 30-second cryptographic tokens via shared HMAC-SHA1 secret seeds; immune to cellular network intercepts and SIM swaps."
            }
        }
    },
    37: {
        "image_captions": {
            "img1": "Figure 1: High-resolution display of a forensic email analysis dashboard inspecting raw SMTP headers and MIME boundaries.",
            "img2": "Figure 2: Architectural diagram illustrating DKIM cryptographic signatures, SPF IP verification, and DMARC alignment enforcement.",
            "img3": "Figure 3: Terminal interface executing dig and whois queries to audit sender domain age, DNS MX records, and SSL certificate validity.",
            "img4": "Figure 4: Visual decision flowchart guiding users through forensic verification before clicking suspicious hyperlinks or email attachments."
        },
        "comparison_cards": {
            "img2": {
                "title": "Email Security Protocols: Superficial Sender Display vs. Cryptographic Domain Alignment",
                "point1": "Spoofed Sender Display: Displays deceptive brand logos and forged 'From:' display names; easily manipulated by attackers using open SMTP relay servers.",
                "point2": "Cryptographic Alignment (SPF/DKIM/DMARC): Enforces mathematical domain verification; cryptographically signs email headers to guarantee origin authenticity."
            }
        }
    },
    38: {
        "image_captions": {
            "img1": "Figure 1: Modern academic study workstation featuring an open laptop displaying an interactive Socratic AI tutoring session.",
            "img2": "Figure 2: Pedagogical flowchart illustrating the Socratic Inquiry Loop versus passive rote memorization and direct answer generation.",
            "img3": "Figure 3: Terminal interface executing a local private Socratic tutoring assistant via Python and local foundation models.",
            "img4": "Figure 4: Spaced retrieval concept dependency graph illustrating hierarchical mastery across complex scientific and mathematical domains."
        },
        "comparison_cards": {
            "img2": {
                "title": "Learning Paradigms: Passive Answer Delegation vs. Active Socratic Interrogation",
                "point1": "Passive Answer Generation: Outsourcing homework problems directly to LLMs; bypasses cognitive friction, creating an illusion of competence while yielding zero synaptic retention.",
                "point2": "Synthetic Socratic Mentoring: Enforces first-principles inquiry and adversarial thesis defense; stimulates prefrontal cortex engagement, cementing permanent mental models."
            }
        }
    },
    39: {
        "image_captions": {
            "img1": "Figure 1: Open research notebook with highlighted academic literature beside a tablet displaying spaced repetition flashcards.",
            "img2": "Figure 2: Mathematical forgetting curve comparison contrasting legacy SM-2 exponential intervals against modern FSRS-4.5 three-dimensional retention states.",
            "img3": "Figure 3: Terminal script executing automated PDF-to-cloze extraction pipeline and synchronizing decks to Anki via local APIs.",
            "img4": "Figure 4: Hierarchical study deck structure demonstrating optimal card tagging, leech isolation, and interleaved retrieval practice."
        },
        "comparison_cards": {
            "img2": {
                "title": "Spaced Repetition Algorithms: Legacy SM-2 vs. Modern Free Spaced Repetition Scheduler (FSRS)",
                "point1": "Legacy SM-2 Algorithm: Assumes static exponential decay curves; traps students in 'Ease Hell' with hundreds of redundant reviews and inflexible intervals.",
                "point2": "Modern FSRS-4.5 Algorithm: Models memory as a 3D state space (Stability, Retrievability, Difficulty); eliminates 30% of redundant reviews while maintaining target 90% retention."
            }
        }
    },
    40: {
        "image_captions": {
            "img1": "Figure 1: Minimalist executive writing desk with dual monitors displaying Markdown literature notes and automated static site deployment pipelines.",
            "img2": "Figure 2: Continuous publishing architecture diagram illustrating markdown note ingestion, automated LLM auditing, and static site generator deployment.",
            "img3": "Figure 3: Terminal interface executing automated Python Markdown frontmatter validation and local semantic vector embeddings.",
            "img4": "Figure 4: Analytics dashboard tracking long-form research publication reach, referral domains, and search engine organic impressions."
        },
        "comparison_cards": {
            "img2": {
                "title": "Publishing Architectures: Monolithic CMS vs. Sovereign Markdown & Static Site Generators",
                "point1": "Monolithic Legacy CMS (WordPress): Heavy relational database queries, bloated PHP plugins, vulnerable to automated injection attacks, and locked behind monthly hosting fees.",
                "point2": "Sovereign Markdown Pipelines (Next.js / Astro): Version-controlled Git repositories, sub-second static page loads, absolute data sovereignty, and zero runtime database vulnerabilities."
            }
        }
    },
    41: {
        "image_captions": {
            "img1": "Figure 1: Atmospheric studio illustration of Master Tenzin's river workshop illuminated by warm glowing hexagonal lanterns on a misty morning.",
            "img2": "Figure 2: Woodworking anatomy diagram illustrating hand-cut bamboo ribs, mulberry parchment fibers, and persimmon juice weatherproofing seals.",
            "img3": "Figure 3: Mountain blizzard rescue scene showing Julian holding the glowing amber lantern high above the icy precipice to guide lost pilgrims.",
            "img4": "Figure 4: Detailed lexical etymology chart and reading comprehension matrix for advanced language scholars and close-reading analysis."
        },
        "comparison_cards": {
            "img2": {
                "title": "Craftsmanship Philosophy: Industrial Haste vs. Patient Structural Mastery",
                "point1": "Industrial Haste (Tin Lamps): Prioritizes rapid output, superficial appearances, and low cost; results in fragile contrivances that fail catastrophically in freezing blizzards.",
                "point2": "Patient Craftsmanship (Mulberry Lanterns): Respects the natural grain and biological nodes of the bamboo; yields flexible tensile ribs that absorb violent gusts and protect the flame."
            }
        }
    },
    42: {
        "image_captions": {
            "img1": "Figure 1: Minimalist botanical still life with vintage leatherbound journal, antique fountain pen, and sunlight streaming across parchment.",
            "img2": "Figure 2: Lexical taxonomy diagram illustrating emotional nuances, historical etymologies, and semantic collocations across ten rare English words.",
            "img3": "Figure 3: Creative writing workbench with annotated literature excerpts demonstrating syntactic pacing and sensory imagery.",
            "img4": "Figure 4: Mind-map diagram connecting emotional vocabulary terms to psychological resilience, reflective journaling, and expressive prose eloquence."
        },
        "comparison_cards": {
            "img2": {
                "title": "Linguistic Precision: Generic Emotional Vocabulary vs. Precise Evocative Diction",
                "point1": "Generic Emotional Vocabulary: Relies on broad, overused adjectives ('sad', 'happy', 'overwhelmed'); flattens complex psychological realities and blunts reader empathy.",
                "point2": "Precise Evocative Diction: Deploys rich sensory and philosophical vocabulary ('sonder', 'petrichor', 'vellichor'); captures subtle emotional contours with profound resonance."
            }
        }
    }
}

with open("content/articles/batch_6.json") as f:
    b6 = json.load(f)

for a in b6:
    aid = a["id"]
    if aid in BATCH_6_CAPTIONS:
        a["image_captions"] = BATCH_6_CAPTIONS[aid]["image_captions"]
        a["comparison_cards"] = BATCH_6_CAPTIONS[aid]["comparison_cards"]
        print(f"Added captions and comparison to Article #{aid}: {a['title']}")

with open("content/articles/batch_6.json", "w") as f:
    json.dump(b6, f, indent=2)

print("✓ Batch 6 captions and comparison cards successfully updated!")
