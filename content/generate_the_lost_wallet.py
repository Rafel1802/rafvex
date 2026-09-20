#!/usr/bin/env python3
import json
import os
import sys

# Article metadata
article_id = 64
title = "The Lost Wallet: An Inspiring English Story About Honesty and Kindness"
slug = "the-lost-wallet-inspiring-english-story"
category = "English Reading Stories"
subcategory = "Short Stories"
video_url = "https://www.youtube.com/watch?v=xiEMUYbar5k"
seo_meta_title = "The Lost Wallet: An Inspiring English Story About Honesty and Kindness"
meta_description = "Read 'The Lost Wallet', an inspiring English story about honesty, empathy, and doing the right thing. Includes video narration, vocabulary definitions, and comprehension questions."
primary_keyword = "the lost wallet english story honesty reading listening comprehension"

html_content = """<div class=\"topic-cluster-banner mb-8\">
  <div class=\"cluster-icon\">
    <svg class=\"w-4 h-4\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z\"></path><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M21 12a9 9 0 11-18 0 9 9 0 0118 0z\"></path></svg>
  </div>
  <div>
    <span class=\"text-xs font-bold uppercase tracking-wider text-red-600 block mb-0.5\">English Reading &amp; Listening Series</span>
    <p class=\"text-xs sm:text-sm text-slate-700 dark:text-slate-300 m-0\">Improve your English comprehension and listening skills. Follow along with the text below while listening to the video narration.</p>
  </div>
</div>

<div class=\"my-8 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800 bg-slate-950\">
  <div class=\"aspect-video w-full\">
    <iframe class=\"w-full h-full\" src=\"https://www.youtube-nocookie.com/embed/xiEMUYbar5k?rel=0&amp;modestbranding=1\" title=\"The Lost Wallet - English Reading Story\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>
  </div>
  <div class=\"px-4 py-3 bg-slate-900 text-slate-300 text-xs sm:text-sm flex flex-wrap items-center justify-between gap-2 border-t border-slate-800\">
    <span class=\"flex items-center gap-2\">
      <span class=\"w-2 h-2 rounded-full bg-red-500 animate-pulse\"></span>
      <span>Official Video &amp; Audio Narration (Listen &amp; Practice)</span>
    </span>
    <a href=\"https://www.youtube.com/watch?v=xiEMUYbar5k\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"text-red-400 hover:text-red-300 font-semibold underline transition-colors\">Watch directly on YouTube &rarr;</a>
  </div>
</div>

<h2 class=\"text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 font-['Outfit']\">1. Narrative Overview: The Moral Power of Simple Choices</h2>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">In language acquisition and literature, storytelling serves as one of the most effective tools for mastering vocabulary, natural sentence rhythm, and listening fluency. When learners connect emotionally with characters facing genuine human dilemmas, new vocabulary and grammar patterns are retained with lasting clarity.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Presented below is <em>The Lost Wallet</em>, an uplifting story of honesty, empathy, and unexpected friendship. Read the complete story below, listen along to the audio version in the video player above, and complete the reading comprehension exercises at the end to evaluate your mastery.</p>

<hr class=\"my-10 border-slate-200 dark:border-slate-800\" />

<h3 class=\"text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-8 mb-4 font-['Outfit']\">The Lost Wallet: A Story of Honesty and Kindness</h3>

<h4 class=\"text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Chapter I: A Simple Life in a Quiet Town</h4>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom was a young man who lived in a small town. The town was quiet and friendly. It had a small park, a library, a train station, a supermarket, and many little shops. In the center of town stood a small coffee shop called <strong>Morning Coffee</strong>. Tom worked there.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Every morning, Tom woke up at 7:00 AM. He made a warm cup of coffee and ate two pieces of bread for breakfast. Then he put on his jacket and walked to work. Tom did not have a lot of money, but he was happy with his simple life. He liked his job, his friends, and his small home.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Still, Tom had everyday worries. His smartphone was old, with a large crack across the screen. Sometimes, it turned off by itself without warning. Tom knew he needed a new phone, but he could not afford one yet.</p>

<h4 class=\"text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Chapter II: The Discovery by the Tree</h4>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">One Monday morning, Tom walked to work as usual. The sun was bright and the sky was blue. Suddenly, Tom saw something on the ground. He stopped. There was a black leather wallet resting near the roots of a tree.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom looked around. There was nobody near him. He bent down and picked it up carefully. Inside, there was a substantial sum of money, a bank card, an ID card, and a small family photograph. Tom took the photograph out. An older man, a woman, and a little girl stood together, smiling warmly at the camera.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\"><em>\"This must be very important to someone,\"</em> Tom said softly.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Then Tom looked at the money. There was quite a lot of it. For a moment, Tom started thinking about his own problems. His phone was broken. His shoes were old. He had an overdue electricity bill to pay. The money could solve all his immediate troubles. Nobody was watching him. Nobody knew that he had found it.</p>

<h4 class=\"text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Chapter III: Choosing What is Right</h4>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">For a brief moment, Tom considered keeping the wallet. But then he looked at the family photograph again. He thought about the man who lost it. Maybe the man was searching frantically for it. Maybe he needed the money for food. Maybe he needed it for medical care.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom took a deep breath. <em>\"No,\"</em> Tom said firmly. <em>\"This is not my money. I need to find the owner.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">He examined the ID card. The owner's name was <strong>David Miller</strong>, and the address was in a quiet neighborhood not far from Tom's home. Tom checked his watch. <em>\"I have to go to work now. I will find David after work.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">When Tom arrived at Morning Coffee, his manager, Anna, was opening the shop. <em>\"Good morning, Tom. You look serious today. Is everything okay?\"</em> Tom told her about the wallet. Anna smiled with genuine respect: <em>\"That is good, Tom. You can return it after your shift. That is the right thing to do.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Throughout the busy day, Tom made coffee, served food, and cleaned tables, but in quiet moments, his thoughts kept returning to David Miller.</p>

<h4 class=\"text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Chapter IV: The Relieved Stranger</h4>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">At 6:00 PM, Tom finished work, said goodbye to Anna, and set out. He passed the town park, crossed a small bridge, and walked down a quiet residential lane until he reached a neat white house with a front garden.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">An older gentleman was standing outside, pacing back and forth anxiously. The man repeatedly checked his empty pockets, looking down the road with visible worry. Tom walked toward him gently.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\"><em>\"Excuse me, sir,\"</em> Tom said. <em>\"Are you David Miller?\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">The man's eyes widened. <em>\"Yes! I am David.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom pulled the black wallet from his jacket. <em>\"Did you lose this?\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">David froze in stunned disbelief, then took the wallet into his trembling hands. He opened it immediately: the money was there, the cards were untouched, and the photograph of his wife and daughter was safe. He let out a long, trembling breath of relief. <em>\"Everything is here!\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Then David looked at Tom with tears welling in his eyes. <em>\"Young man... this money is for my wife's medicine. She is very ill and needs her prescription every single day. I was devastated because without this money, I could not afford her treatment.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">David immediately tried to hand Tom a generous cash reward. But Tom smiled and gently shook his head. <em>\"No, thank you, sir. I cannot take your money. It belongs to your wife's healthcare. I don't need money for helping someone.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">David looked at Tom with profound gratitude. <em>\"You are a truly good person, Tom.\"</em></p>

<h4 class=\"text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Chapter V: An Unexpected Gift</h4>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">The next morning at 7:00 AM, Tom got dressed and walked to work as usual. As he approached Morning Coffee, he saw someone standing outside by the entrance. It was David, holding a small box wrapped neatly with a bow.</p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\"><em>\"Good morning, Tom,\"</em> David said warmly. <em>\"I brought something for you. Open it.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom opened the box. Inside lay a brand-new smartphone. Tom gasped. <em>\"Oh no, David! I cannot accept this. It is far too expensive!\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">David shook his head with a gentle smile. <em>\"This is not a payment, Tom. It is a gift. When I returned home and told my wife everything, she insisted on thanking you properly. Please, take it.\"</em></p>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Tom looked down at his own cracked, malfunctioning phone, then at David's sincere smile. He accepted the gift with heartfelt gratitude. From that day on, Tom and David became close friends, sharing coffee and conversations about family, dreams, and life.</p>

<hr class=\"my-10 border-slate-200 dark:border-slate-800\" />

<h2 class=\"text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 font-['Outfit']\">2. Essential Vocabulary in Context</h2>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Mastering key terms used in this story will expand your vocabulary for daily conversation and academic reading:</p>

<ol class=\"list-decimal pl-6 my-6 text-slate-700 dark:text-slate-300 space-y-4 text-base sm:text-lg\">
  <li class=\"mb-3.5 pl-1 leading-relaxed\">
    <div class=\"text-slate-800 dark:text-slate-200 font-normal\">
      <strong>Integrity (<code class=\"px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700\">/ɪnˈteɡ.rə.ti/</code>)</strong> &mdash; <em>Noun</em>: The quality of being honest and having strong moral principles that you refuse to change.
    </div>
    <ul class=\"list-disc pl-5 mt-2 mb-1 space-y-1\">
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Etymology</em>: From Latin <em>integritas</em> (wholeness, completeness, purity).</li>
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Contextual Example</em>: \"Tom displayed exemplary <strong>integrity</strong> by returning the wallet without taking a single dollar.\"</li>
    </ul>
  </li>
  <li class=\"mb-3.5 pl-1 leading-relaxed\">
    <div class=\"text-slate-800 dark:text-slate-200 font-normal\">
      <strong>Temptation (<code class=\"px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700\">/tempˈteɪ.ʃən/</code>)</strong> &mdash; <em>Noun</em>: A strong urge or desire to do something, especially something unwise or morally questionable.
    </div>
    <ul class=\"list-disc pl-5 mt-2 mb-1 space-y-1\">
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Etymology</em>: From Latin <em>temptare</em> (to feel, try, or test).</li>
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Contextual Example</em>: \"Despite his unpaid electricity bill, Tom overcame the <strong>temptation</strong> to keep the money.\"</li>
    </ul>
  </li>
  <li class=\"mb-3.5 pl-1 leading-relaxed\">
    <div class=\"text-slate-800 dark:text-slate-200 font-normal\">
      <strong>Relief (<code class=\"px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700\">/rɪˈliːf/</code>)</strong> &mdash; <em>Noun</em>: A feeling of reassurance and relaxation following release from anxiety or distress.
    </div>
    <ul class=\"list-disc pl-5 mt-2 mb-1 space-y-1\">
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Etymology</em>: From Old French <em>relief</em>, from Latin <em>relevare</em> (to raise up, lighten a burden).</li>
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Contextual Example</em>: \"David let out a profound sigh of <strong>relief</strong> when he confirmed the medicine money was safe.\"</li>
    </ul>
  </li>
  <li class=\"mb-3.5 pl-1 leading-relaxed\">
    <div class=\"text-slate-800 dark:text-slate-200 font-normal\">
      <strong>Afford (<code class=\"px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700\">/əˈfɔːd/</code>)</strong> &mdash; <em>Verb</em>: To have enough money or resources to be able to buy or do something.
    </div>
    <ul class=\"list-disc pl-5 mt-2 mb-1 space-y-1\">
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Etymology</em>: Middle English <em>aforthi</em> (to promote, carry out, provide).</li>
      <li class=\"text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed\"><em>Contextual Example</em>: \"Tom wanted a new smartphone, but he could not <strong>afford</strong> one on his current barista wages.\"</li>
    </ul>
  </li>
</ol>

<h2 class=\"text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 font-['Outfit']\">3. Thematic Contrast: Short-Term Gain vs. Long-Term Integrity</h2>

<div class=\"overflow-x-auto my-8 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900\">
  <table class=\"w-full text-left border-collapse\">
    <thead>
      <tr>
        <th class=\"px-4 py-3 bg-slate-100/80 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-700 whitespace-nowrap\">Dimension</th>
        <th class=\"px-4 py-3 bg-slate-100/80 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-700 whitespace-nowrap\">If Tom Kept the Wallet (Immediate Self-Interest)</th>
        <th class=\"px-4 py-3 bg-slate-100/80 dark:bg-slate-800 font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm border-b border-slate-200 dark:border-slate-700 whitespace-nowrap\">Tom Returning the Wallet (Moral Integrity)</th>
      </tr>
    </thead>
    <tbody>
      <tr class=\"hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors\">
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold\">Immediate Outcome</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">Quick cash to pay bills and buy shoes.</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">Saved a sick woman's life by protecting her medicine funds.</td>
      </tr>
      <tr class=\"hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors\">
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold\">Psychological State</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">Lingering guilt, anxiety of being caught, erosion of self-respect.</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">Peace of mind, clean conscience, reinforced self-respect.</td>
      </tr>
      <tr class=\"hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors\">
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 font-semibold\">Long-Term Reward</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">None; money spent quickly, leaving no lasting value.</td>
        <td class=\"px-4 py-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800\">A brand-new phone given freely, plus a loyal, lifelong friend.</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 class=\"text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-12 mb-5 font-['Outfit']\">4. Reading Comprehension &amp; Study Questions</h2>

<p class=\"mb-6 leading-relaxed text-slate-700 dark:text-slate-300 text-base sm:text-lg font-normal\">Test your understanding of the story with these comprehension and discussion questions:</p>

<h3 class=\"text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Section A: Multiple Choice Questions</h3>

<ol class=\"list-decimal pl-6 my-6 text-slate-700 dark:text-slate-300 space-y-4 text-base sm:text-lg\">
  <li class=\"mb-3 pl-1 leading-relaxed\">
    <strong>What was wrong with Tom's old smartphone?</strong><br />
    <span class=\"block text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1\">
      A) It had water damage<br />
      B) It had a large crack across the screen and shut down unexpectedly<br />
      C) It was lost on the subway train<br />
      D) The battery wouldn't charge at all
    </span>
  </li>
  <li class=\"mb-3 pl-1 leading-relaxed\">
    <strong>What made Tom change his mind about keeping the money?</strong><br />
    <span class=\"block text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1\">
      A) A police officer walked past him<br />
      B) Looking at the smiling family photograph and imagining the owner's hardship<br />
      C) His manager Anna warned him not to keep it<br />
      D) He realized the cash was counterfeit
    </span>
  </li>
  <li class=\"mb-3 pl-1 leading-relaxed\">
    <strong>Why did David Miller need the money urgently?</strong><br />
    <span class=\"block text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1\">
      A) To pay for his home repair<br />
      B) To buy tickets for a family vacation<br />
      C) To purchase essential daily medicine for his sick wife<br />
      D) To invest in a neighborhood business
    </span>
  </li>
  <li class=\"mb-3 pl-1 leading-relaxed\">
    <strong>How did David thank Tom the next morning?</strong><br />
    <span class=\"block text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1\">
      A) By offering him an envelope of cash<br />
      B) By bringing him a brand-new smartphone as a sincere gift<br />
      C) By buying coffee for everyone in town<br />
      D) By offering him a new job in an office
    </span>
  </li>
</ol>

<h3 class=\"text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-6 mb-3 font-['Outfit']\">Section B: Reflection &amp; Discussion Prompts</h3>

<ul class=\"list-disc pl-6 my-6 text-slate-700 dark:text-slate-300 space-y-3 text-base sm:text-lg\">
  <li class=\"leading-relaxed\"><strong>Prompt 1:</strong> Why do you think David and his wife gave Tom a <em>smartphone</em> rather than offering cash a second time?</li>
  <li class=\"leading-relaxed\"><strong>Prompt 2:</strong> Have you ever experienced a moment where doing the right thing was difficult? How did you feel afterward?</li>
  <li class=\"leading-relaxed\"><strong>Prompt 3:</strong> Share your thoughts and reflections in the comments on our YouTube video!</li>
</ul>

<div class=\"my-8 p-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700\">
  <h4 class=\"text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 font-['Outfit']\">Answer Key</h4>
  <p class=\"text-sm text-slate-600 dark:text-slate-300 mb-2\"><strong>1. B</strong> &mdash; It had a large crack across the screen and shut down unexpectedly.</p>
  <p class=\"text-sm text-slate-600 dark:text-slate-300 mb-2\"><strong>2. B</strong> &mdash; Looking at the smiling family photograph and imagining the owner's hardship.</p>
  <p class=\"text-sm text-slate-600 dark:text-slate-300 mb-2\"><strong>3. C</strong> &mdash; To purchase essential daily medicine for his sick wife.</p>
  <p class=\"text-sm text-slate-600 dark:text-slate-300 m-0\"><strong>4. B</strong> &mdash; By bringing him a brand-new smartphone as a sincere gift.</p>
</div>

<hr class=\"my-10 border-slate-200 dark:border-slate-800\" />

<div class=\"p-6 sm:p-8 bg-gradient-to-br from-red-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border border-red-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-6\">
  <div>
    <h3 class=\"text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 font-['Outfit']\">Enjoying this story?</h3>
    <p class=\"text-sm text-slate-600 dark:text-slate-300 m-0\">Watch more inspiring stories, audiobooks, and English listening practice sessions on our YouTube channel.</p>
  </div>
  <a href=\"https://www.youtube.com/watch?v=xiEMUYbar5k\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all shrink-0\">
    <svg class=\"w-5 h-5 fill-current\" viewBox=\"0 0 24 24\"><path d=\"M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z\"/></svg>
    <span>Watch on YouTube</span>
  </a>
</div>
"""

article_data = {
    "id": article_id,
    "title": title,
    "slug": slug,
    "category": category,
    "subcategory": subcategory,
    "primary_keyword": primary_keyword,
    "seo_meta_title": seo_meta_title,
    "meta_description": meta_description,
    "cover_image_url": "/blog/english-reading-stories/short-stories/the-lantern-maker/the-lantern-maker-1.webp",
    "cover_image_alt": "Figure 1: Illustration of Tom finding the lost wallet near a tree in a quiet town.",
    "video_url": video_url,
    "is_pillar": False,
    "pillar_slug": "the-lantern-maker-inspiring-english-reading-story",
    "html_content": html_content
}

# 1. Write dedicated article json in content/articles/
with open("content/articles/the_lost_wallet.json", "w", encoding="utf-8") as f:
    json.dump(article_data, f, indent=2, ensure_ascii=False)
print("Saved content/articles/the_lost_wallet.json")

# 2. Update compiled_articles_cache.json
cache_file = "content/compiled_articles_cache.json"
if os.path.exists(cache_file):
    with open(cache_file, "r", encoding="utf-8") as f:
        cache = json.load(f)
    
    # Remove existing by slug if already present
    cache = [a for a in cache if a.get("slug") != slug]
    cache.append(article_data)
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)
    print(f"Updated {cache_file} (Total: {len(cache)} articles)")

# 3. Update articles_manifest.json
manifest_file = "content/articles_manifest.json"
if os.path.exists(manifest_file):
    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)
    
    manifest_entry = {
        "id": article_id,
        "slug": slug,
        "title": title,
        "category": category,
        "subcategory": subcategory,
        "seo_meta_title": seo_meta_title,
        "meta_description": meta_description,
        "cover_image_url": article_data["cover_image_url"],
        "cover_image_alt": article_data["cover_image_alt"],
        "video_url": video_url,
        "is_pillar": False,
        "cluster_name": "English Reading Stories",
        "pillar_slug": "the-lantern-maker-inspiring-english-reading-story"
    }
    manifest = [m for m in manifest if m.get("slug") != slug]
    manifest.append(manifest_entry)
    with open(manifest_file, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"Updated {manifest_file} (Total: {len(manifest)} articles)")

print("Article generation complete!")
