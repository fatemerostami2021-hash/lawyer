export type Insight = {
  slug: string;
  category: string;
  title: string;
  titleFa: string;
  deck: string;
  date: string;
  readTime: string;
  accent: string;
  paragraphs: string[];
  points: string[];
  sources: { title: string; url: string }[];
  caveat: string;
};

export const insights: Insight[] = [
  {
    slug: "corporate-governance-in-iran",
    category: "Corporate law",
    title: "The architecture of corporate governance in Iran",
    titleFa: "معماری حاکمیت شرکتی در ایران",
    deck: "What the charter, general meetings, board and statutory inspectors mean for a company built to last.",
    date: "24 OCT 2026",
    readTime: "7 min read",
    accent: "01",
    paragraphs: [
      "In Iran, the legal architecture of a joint-stock company is built around three connected organs: the general meetings, the board of directors and the statutory inspectors. The charter translates that architecture into the company's working rules, but it cannot override mandatory provisions of the Commercial Code or the Amending Bill of 1967.",
      "Founding documentation, registration and publication of material changes are not merely administrative rituals. They create a public record of the company's legal identity, its directors, its capital and the changes that third parties may need to rely on. The Official Gazette and the Companies Registration portal are therefore part of the practical governance map.",
      "For a company entering a new phase, the important question is not only whether a document exists. It is whether the decision was taken by the correct organ, within its authority, with the correct notice and minutes, and then registered or published where the law requires it.",
    ],
    points: [
      "The Amending Bill of the Commercial Code governs the specialised rules for joint-stock companies.",
      "Ordinary and extraordinary general meetings have different subject-matter responsibilities.",
      "The board manages the company within the law and the charter; inspectors provide an independent statutory review role.",
      "Registration and Official Gazette publication make key corporate events more reliable and opposable to third parties.",
    ],
    sources: [
      { title: "Amending Bill of the Commercial Code 1967 — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/96314" },
      { title: "Commercial Code — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/92349" },
      { title: "Official Gazette of the Islamic Republic of Iran", url: "https://rrk.ir/" },
    ],
    caveat: "This is general educational information, not advice on a specific company, filing or dispute. Current regulations, registration practice and the company's documents should be reviewed for any real decision.",
  },
  {
    slug: "commercial-contracts-in-iran",
    category: "Commercial contracts",
    title: "Commercial contracts: from promise to executable position",
    titleFa: "قرارداد تجاری؛ از توافق تا موضع قابل اجرا",
    deck: "A practical reading of freedom of contract, certainty, performance and risk allocation under Iranian law.",
    date: "24 OCT 2026",
    readTime: "8 min read",
    accent: "02",
    paragraphs: [
      "Article 10 of the Civil Code recognises private agreements, provided they do not conflict with an express rule of law. That freedom is real, but it is not unlimited. A commercial contract still needs valid consent, capacity, a defined subject and a lawful basis under Article 190.",
      "Once a valid contract is formed, Article 219 expresses the principle of binding force. The agreement is not simply a record of what the parties hoped would happen; it becomes a framework of obligations, including consequences that may arise from law, custom and the ordinary meaning of its words under Articles 220 to 225.",
      "Good drafting is less about adding volume and more about removing avoidable ambiguity: who must do what, by when, against which evidence, with which notice, and what the parties have agreed will happen if performance fails. A force-majeure clause, a clear notice mechanism and a carefully drafted liquidated-damages clause can make the difference between a position that is understandable and one that is executable.",
    ],
    points: [
      "Freedom of contract operates within mandatory rules, public order and sector-specific regulation.",
      "The validity of a contract depends on intention and consent, capacity, a certain subject and a lawful basis.",
      "Binding force does not remove the need to prove performance, breach, notice and causation.",
      "Risk allocation should match the transaction's timing, evidence, approvals and commercial dependencies.",
    ],
    sources: [
      { title: "Civil Code — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/97937" },
      { title: "Civil Code of Iran — FAOLEX translation", url: "https://faolex.fao.org/docs/pdf/ira206827.pdf" },
      { title: "Commercial Code — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/92349" },
    ],
    caveat: "This article is general information. The legal effect of a particular clause depends on its wording, the evidence, applicable sector rules and the facts of the relationship.",
  },
  {
    slug: "foreign-investment-fippa",
    category: "Market entry",
    title: "FIPPA and the disciplined route into Iran",
    titleFa: "قانون FIPPA و مسیر منضبط ورود به ایران",
    deck: "Why foreign investment approval is a protection framework, not a substitute for every operating licence.",
    date: "24 OCT 2026",
    readTime: "9 min read",
    accent: "03",
    paragraphs: [
      "Iran's Foreign Investment Promotion and Protection Act, commonly known as FIPPA, provides a framework for admitting and protecting qualifying foreign investment. It can cover direct participation and contractual arrangements such as civil partnership, buy-back, BOT and similar structures, subject to the law and the terms of the relevant approval.",
      "The protection is meaningful but specific. A FIPPA licence does not replace company registration, sector approvals, tax, customs, labour, immigration, environmental or banking requirements. The project still needs a route through the rules that govern its industry and its chosen structure.",
      "The official investment process is best understood as a sequence: assess the project, obtain the relevant preliminary view from the specialist authority, apply for FIPPA approval, complete the investment registration and bring in the approved capital in accordance with the applicable rules. Early legal mapping helps prevent the investment approval from being treated as a universal operating permit.",
    ],
    points: [
      "FIPPA can support direct and contractual investment structures, including non-cash contributions in qualifying cases.",
      "The legal framework provides protections around capital, returns and expropriation subject to its conditions.",
      "The Investment Organization and its one-stop centre coordinate the process but do not erase specialist approvals.",
      "Sector restrictions, national-interest considerations and project-specific licences must be assessed separately.",
    ],
    sources: [
      { title: "Foreign Investment Promotion and Protection Act — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/133816" },
      { title: "Executive Regulations of FIPPA — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/122368" },
      { title: "Invest in Iran — Investment Organization of Iran", url: "https://investiniran.ir/" },
    ],
    caveat: "This is a high-level overview. Any project needs current review of its ownership, sector, approvals, funding route, tax, customs, labour, immigration and foreign-exchange requirements.",
  },
  {
    slug: "commercial-arbitration",
    category: "Dispute resolution",
    title: "Commercial arbitration: design the route before the dispute",
    titleFa: "داوری تجاری؛ مسیر حل اختلاف را پیش از اختلاف طراحی کنید",
    deck: "The clause, the scope, the seat and the enforcement path all matter before a tribunal is ever formed.",
    date: "24 OCT 2026",
    readTime: "8 min read",
    accent: "04",
    paragraphs: [
      "Under Article 454 of Iran's Civil Procedure Code, parties with capacity to bring a claim may agree to refer an existing or future dispute to arbitration. That agreement is the beginning of the route, not the end of the analysis. The subject, duration and identity of the arbitrator or arbitrators must be clear enough to avoid uncertainty under Article 458.",
      "Enforcement is part of drafting. In domestic matters, the code provides a route to execution after the award is served and not voluntarily performed, while also identifying circumstances in which an award may be invalid or unenforceable. Time limits for seeking annulment and the effect of a request to set aside the award should be mapped at the outset.",
      "For international commercial arbitration, the International Commercial Arbitration Act creates a separate framework. The New York Convention and UNCITRAL materials also provide the wider international context, but the result depends on the chosen seat, the arbitration agreement, the applicable law and the enforcement jurisdiction.",
    ],
    points: [
      "A clause should identify the disputes covered, the institution or appointment method, the seat and the language where appropriate.",
      "The arbitrator's authority is bounded by the agreement and mandatory rules.",
      "Domestic and international commercial arbitration are related but not interchangeable regimes.",
      "Enforcement and challenge timelines should be considered before the clause is signed.",
    ],
    sources: [
      { title: "Civil Procedure Code — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/93305" },
      { title: "UNCITRAL Arbitration and Conciliation", url: "https://uncitral.un.org/en/texts/arbitration" },
      { title: "New York Convention — UNCITRAL", url: "https://uncitral.un.org/en/texts/arbitration/conventions/foreign_arbitral_awards" },
    ],
    caveat: "This article is general educational information. The validity, challenge and enforcement of a particular award depend on the agreement, facts, seat, applicable law and procedural history.",
  },
  {
    slug: "brand-trademark-ip",
    category: "Intellectual property",
    title: "A brand is not yet a trademark",
    titleFa: "برند هنوز علامت تجاری نیست",
    deck: "How distinctiveness, goods and services, publication and renewal shape protection under Iran's 2024 industrial property law.",
    date: "24 OCT 2026",
    readTime: "8 min read",
    accent: "05",
    paragraphs: [
      "A brand is a business asset and a market promise; a trademark is the legally recognised sign that distinguishes goods or services. Iran's Industrial Property Protection Act 2024 treats visible signs, collective marks, certification marks, trade names and trade secrets as distinct legal subjects with different protection routes.",
      "Registration is scoped. A registered mark protects the goods and services for which it is registered, which makes the specification and classification decision commercially important. The application should identify the sign, the goods or services and the applicant's supporting documents with enough precision for the examination and publication process.",
      "The law also recognises objections and refusal grounds, including lack of distinctiveness, misleading signs and confusing similarity. A serious brand launch therefore begins before the logo is published: search the relevant classes, assess earlier marks and trade names, and decide how the mark will be used and renewed across the markets that matter.",
    ],
    points: [
      "Distinctiveness and the correct goods/services scope are central to a registration strategy.",
      "Publication creates a period in which eligible third parties can object before final registration.",
      "A trademark right is different from a trade name and from confidential know-how or trade secrets.",
      "Renewal, use evidence and enforcement planning should be considered as part of the launch plan.",
    ],
    sources: [
      { title: "Industrial Property Protection Act 2024 — Majlis Research Center", url: "https://rc.majlis.ir/fa/law/show/1809131" },
      { title: "Act on the Protection of Industrial Property 2024 — WIPO Lex", url: "https://www.wipo.int/wipolex/en/legislation/details/23341" },
      { title: "Iran Country Profile — WIPO", url: "https://www.wipo.int/en/web/country-profiles/IR" },
    ],
    caveat: "This is general information, not a clearance opinion or infringement analysis. Similarity, confusion, bad faith and enforceability are fact-sensitive questions that require current searches and evidence.",
  },
];

export const insightBySlug = (slug: string) => insights.find(item => item.slug === slug);
