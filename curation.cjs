const Y = 'https://www.yorku.ca/';
const L = 'https://researchguides.library.yorku.ca/';
const rows = [];
function add(key, url, title, summary, addresses, topics, audience, action, priority, target, note, term) {
  rows.push({ key, url: url.startsWith('http') ? url : Y + url, title, summary, addresses, topics: topics.split('|'), audience: audience.split('|'), action, priority, target, note, term });
}
add('hub','ai-at-york/','AI @ York: central hub',
  'University-wide front door with an AI Roundtable description and three onward routes: teaching and learning, research, and university operations. It does not itself provide a consolidated task-based directory.',
  'Where should I start? Who coordinates York AI activity?',
  'Strategy|Governance|Discovery','Everyone','Expand',2,'AI @ York / Start here',
  'Retain this URL as the main entry point; add task navigation, a shared resource catalogue, clear policy hierarchy and owner-reviewed answer panels. Keep specialist detail federated.','The Central Hub');
add('teaching','teachingandlearning/gen-ai/','GenAI in Teaching and Learning',
  'Sets out five educational principles: transparency, AI literacy, choice, academic integrity and alignment with York values. Routes students, faculty and graduate researchers to separate guidance.',
  'What principles should guide educational use of GenAI?',
  'Teaching|Ethics|AI literacy','Students|Instructors|Graduate researchers','Merge',2,'AI @ York / Teaching & learning',
  'Bring the principles and audience pathways into the hub as one maintained educational content collection, not an independently copied landing page.','Guiding Principles');
add('literacy','teachingandlearning/gen-ai/gen-ai-101/','GenAI 101',
  'Explains AI and GenAI foundations, capabilities and limitations for a non-specialist educational audience.',
  'What is GenAI, and what are its capabilities and limitations?',
  'AI literacy|Responsible use','Everyone','Reuse',3,'AI @ York / Start here / AI basics',
  'Use as the central introductory explanation; link subject-specific Library readings rather than reproducing another AI 101.','');
add('ethics','teachingandlearning/gen-ai/ethics/','Ethics of GenAI in teaching and learning',
  'Examines AI through educational excellence, DEDI, sustainable development, accessibility and experiential education, including bias, misinformation, copyright and privacy.',
  'What ethical trade-offs should I consider before using AI?',
  'Ethics|Privacy|Accessibility|Sustainability','Students|Instructors|Staff','Reuse',2,'AI @ York / Responsible use / Ethics',
  'Retain the educational context. Cross-reference the operational guidelines rather than treating educational values and administrative rules as identical.','');
add('students','teachingandlearning/gen-ai/for-students/','For Students: GenAI learning and course-use guidance',
  'Discusses academic conduct, learning uses, limitations and AI literacy. Explicitly states that documented use is not a breach by default unless an instructor has prohibited it.',
  'Can I use GenAI for coursework, and what must I disclose?',
  'Academic integrity|Student guidance|AI literacy','Students','Resolve',0,'AI @ York / Teaching & learning / Students',
  'Resolve the default-permission wording with the academic integrity office and Senate policy owner before reusing it. Do not silently choose between conflicting interpretations.','By default');
add('faculty','teachingandlearning/gen-ai/for-faculty/','For Faculty: teaching with GenAI',
  'Educational guidance for instructors on AI use, course expectations, assessment and support, linking to academic integrity and Teaching Commons resources.',
  'How do I set expectations and design learning in the presence of GenAI?',
  'Teaching|Assessment|Academic integrity','Instructors','Merge',2,'AI @ York / Teaching & learning / Instructors',
  'Use one instructor landing page with distinct policy, assessment, practical toolkit and professional-development sections.','');
add('graduate','teachingandlearning/gen-ai/graduate-studies-resources/','Graduate Studies: AI in theses and dissertations',
  'Guidance for graduate students and supervisors on discussing acceptable AI use, documenting methods, protecting research and applying disciplinary norms in theses and dissertations.',
  'How should a graduate student and supervisor agree on and document AI use?',
  'Graduate research|Research practice|Disclosure','Graduate researchers|Supervisors','Reuse',1,'AI @ York / Research / Graduate research',
  'Expose from both Research and Teaching pathways using one canonical record, not two copies. Retain graduate-specific advice.','supervisor');
add('research','research/use-of-artificial-intelligence-york/','Use of AI @ York: Research & Innovation',
  'Mixes responsible-use links, external funding guidance, graduate advice, degree and certificate links, research centres and entrepreneurship. Several linked historical resources failed retrieval or led to a generic destination.',
  'How do I use AI in research, and where does York conduct AI research?',
  'Research practice|Research discovery|Programs','Researchers|Graduate researchers|Partners','Merge',1,'AI @ York / Research',
  'Separate "Use AI in research" from "Discover AI research"; share programme records with the study directory and repair verified broken links.','Responsible Use');
add('operations','uit/cio/artificial-intelligence-initiative/','UIT: Artificial Intelligence Initiative',
  'Combines AI strategy, a tool/data-classification presentation, operating guidelines, use-case oversight, projects, training and leadership. Some tool permissions depend on visual styling not preserved in plain-text extraction.',
  'Which operational AI initiatives, guardrails, tools and support routes exist?',
  'Approved tools|Data handling|Responsible use|Strategy','Staff|Instructors|Researchers','Merge',1,'AI @ York / Tools & data; About & governance',
  'Split marketing/roadmap content from authoritative tool records and guidance. Publish an accessible text-based permission matrix; do not infer allowed data from extracted category labels alone.','Usage Guidelines');
add('governance','uit/cio/governancepolicies/','UIT: Governance & Policies',
  'IT governance index that links the July 2025 revised GenAI guidelines and the February 2026 administrative chatbots and assistants guidelines.',
  'Where are the governing AI documents and approval bodies?',
  'Governance|Policy','Staff|Instructors|Researchers','Link',1,'AI @ York / Responsible use / Policy register',
  'Create a dedicated AI policy register with authority, scope, effective date and supersession. Keep broader IT governance here.','Artificial Intelligence');
add('tools','uit/faculty-and-staff-services/ai/','UIT AI services: AURA, Copilot, GitHub and Zoom',
  'Service catalogue with access routes, licensing, tool descriptions, training and FAQs. Contains strong privacy/retention claims that should be reviewed against current enterprise settings and approved documentation.',
  'Which AI service can I use, how do I obtain it and what protection applies?',
  'Approved tools|Data handling|Privacy|Training','Staff|Instructors|Researchers','Resolve',0,'AI @ York / Tools & data / Tool catalogue',
  'Make this service owner the source of tool facts, but review absolute retention and administrator-visibility claims. Feed the hub from one versioned catalogue, keyed by product, licence, authentication, data class and purpose.','Microsoft doesn');
add('prompts','uit/faculty-and-staff-services/ai/prompt-library/','UIT AI Prompt Library',
  'A reusable prompting collection accessed from the AI services page; overlaps at the topic level with Library prompt guidance and LA&PS course-design prompts.',
  'Where can I find practical prompt examples?',
  'Prompting|AI literacy|Approved tools','Staff|Instructors','Federate',2,'AI @ York / Learn & get help / Prompt collection',
  'Use a single searchable index with source, audience, task, approved-tool caveats and contributor ownership. Keep specialist examples rather than flattening every prompt into a generic list.','');
add('github','uit/faculty-and-staff-services/github/','UIT GitHub and enterprise GitHub Copilot',
  'Dedicated service page for York GitHub access and enterprise AI coding assistance, distinct from Microsoft 365 Copilot.',
  'How do I get York enterprise GitHub Copilot for development?',
  'Approved tools|Coding|Access','Staff|Instructors|Developers','Link',1,'AI @ York / Tools & data / GitHub Copilot',
  'Keep service provisioning here. Distinguish GitHub Copilot, Microsoft Copilot web and Microsoft 365 Copilot in the shared tool catalogue.','Copilot');
add('data','uit/faculty-and-staff-services/microsoft-365-for-faculty-and-staff/handling-university-data-in-microsoft-365/','Handling University Data in Microsoft 365',
  'Defines public, internal, confidential and regulated data categories and presents Microsoft 365 service handling guidance, including Copilot links.',
  'What institutional data can be handled in which Microsoft 365 service?',
  'Data handling|Privacy|Approved tools','Staff|Instructors|Researchers','Reuse',1,'AI @ York / Tools & data / Data decision guide',
  'Map the AI catalogue to this classification guidance and the formal classification standard; clarify licence- and configuration-dependent permissions.','Data Classification');
add('tc','teachingcommons/artificial-intelligence-ai-pedagogies/','Teaching Commons: AI pedagogies and professional development',
  'Faculty development landing page for AI pedagogy certificates, a community of practice, workshops and other learning opportunities.',
  'How can I develop my teaching practice and connect with colleagues?',
  'Teaching|Training|Community','Instructors','Federate',2,'AI @ York / Learn & get help / Teaching development',
  'Surface live offerings through one training directory; retain Teaching Commons as the owner of teaching development and registration.','certificate');
add('tc-resources','teachingcommons/resources-by-topic/artificial-intelligence-ai-pedagogical-resources/','Teaching Commons: AI pedagogical resources',
  'Large resource collection including the SHARE co-writing framework, self-paced AI and education learning, readings, recordings, assessment examples and downloadable workshop material.',
  'What practical and critical resources can support my AI teaching practice?',
  'Teaching|Assessment|Training|Prompting','Instructors','Federate',2,'AI @ York / Teaching & learning / Resource collection',
  'Index individual resources by task and format, with pedagogical expertise remaining at Teaching Commons. Replace repeated link lists with a shared feed.','SHARE');
add('integrity-students','unit/vpacad/academic-integrity/ai-technology-academic-integrity/','Academic integrity: AI guidance for students',
  'Explains checking course and assignment expectations, risks, asking for clarification and acknowledging AI assistance. This is the student-oriented academic integrity guidance, not the similarly named instructor page.',
  'How do I avoid academic misconduct when using AI?',
  'Academic integrity|Student guidance|Disclosure','Students','Reuse',0,'AI @ York / Teaching & learning / Academic integrity',
  'Use one approved policy interpretation maintained by the academic integrity office; distinguish student and instructor routes with clear titles.','According to');
add('integrity-instructors','unit/vpacad/academic-integrity/ai-technology-and-academic-integrity/','Academic integrity: AI guidance for instructors and TAs',
  'Guidance on communicating AI expectations, academic conduct and assessment responses. Links practical student surveys, AI use declarations and reflection materials.',
  'How do I communicate permitted AI use and respond to concerns?',
  'Academic integrity|Assessment|Disclosure','Instructors|Teaching assistants','Reuse',1,'AI @ York / Teaching & learning / Instructor expectations',
  'Retain academic integrity expertise and make reusable disclosure/declaration templates visible from the hub. Avoid a second independent policy summary.','Communicating Expectations');
add('policy','secretariat/policies/policies/academic-conduct-policy-and-procedures/','Senate Academic Conduct Policy and Procedures',
  'Authoritative Senate policy. Section 5.2a identifies undocumented content generators and instructor-restricted assistance as breaches; section 6 addresses responsibilities. The retrieved page displays a September 2024 effective date and April 2025 revision.',
  'What does York formal academic conduct policy actually say?',
  'Policy|Academic integrity','Students|Instructors|Supervisors','Keep',0,'AI @ York / Responsible use / Policy register',
  'Never relocate or paraphrase this as a competing policy. Link to the authoritative version and have its owner approve the hub explanation.','5.2 Breaches');
add('library-citing','https://www.library.yorku.ca/web/research-learn/artificial-intelligence-citing-academic-integrity/','Libraries: AI citing and academic integrity',
  'A Library entry point to guidance on citing AI and maintaining academic integrity, with onward links to citation guides, academic conduct and SPARK.',
  'Where are Library citation and integrity resources?',
  'Citation|Academic integrity','Students|Instructors|Researchers','Merge',2,'AI @ York / Teaching & learning / Cite & disclose',
  'Keep one clearly titled Library citation destination; avoid several near-identical navigation pages, while preserving detailed style guidance.','');
add('library-ai','https://researchguides.library.yorku.ca/AI','Libraries: research ON artificial intelligence',
  'Subject guide to books, journals, databases and AI-related research across STEM, business, humanities, law and society. Includes York programmes and research-centre pointers.',
  'How do I research AI as a subject?',
  'Research discovery|AI literacy|Programs','Students|Researchers|Instructors','Link',2,'AI @ York / Research / Research about AI',
  'Distinguish this subject bibliography from the separate guide on doing research with GenAI. Stop manually repeating programme counts and programme links.','About This Guide');
add('library-genai','https://researchguides.library.yorku.ca/genairesearch','Libraries: using GenAI TO DO research',
  'Student-focused guide covering tool types, benefits and limits, responsible use, prompting, output verification, scholarly discovery/workflow tools and citation.',
  'How can GenAI assist research, and how do I check its outputs?',
  'Research practice|Prompting|Citation|AI literacy','Students|Graduate researchers|Researchers','Reuse',1,'AI @ York / Research / Use AI in research',
  'Use this as the practical Library guide; retain its detailed chapters. Align policy wording with the academic integrity owner.','Purpose of this Guide');
add('osgoode-broken','https://researchguides.library.yorku.ca/c.php?g=734320&p=5330448','Osgoode AI and law guide: linked destination returned 404',
  'Research & Innovation describes this destination as legal research, writing and court-use guidance. Direct retrieval returned HTTP 404; its underlying content was not verified.',
  'Where is discipline-specific guidance on AI for legal research?',
  'Law|Research practice|Link health','Law students|Researchers','Repair',1,'AI @ York / Research / Discipline-specific guidance',
  'Ask the law library to supply the current canonical guide. Do not substitute general legal commentary for student-use guidance.','');
add('cais','research/cais/','Centre for Artificial Intelligence & Society (CAIS)',
  'Research-centre presence for interdisciplinary AI systems, law, governance and societal impacts, separate from institutional AI-use guidance.',
  'Who conducts AI research and what themes does CAIS cover?',
  'Research discovery|Ethics|Partnerships','Researchers|Partners|Prospective students','Link',2,'AI @ York / Research / Centres & expertise',
  'Keep centre operations and detailed research here; publish one maintained profile in the hub research directory.','');
add('minds','research/connected-minds/','Connected Minds',
  'Research initiative about human and machine systems, with project news, awards, funding, co-creation resources and research-community information.',
  'Where can I find Connected Minds research and opportunities?',
  'Research discovery|Funding|Partnerships','Researchers|Graduate researchers|Partners','Link',2,'AI @ York / Research / Centres & initiatives',
  'Retain the initiative site and funding application detail. Aggregate its opportunities and tagged news instead of copying entire pages to the hub.','');
add('taskforce','research/artificial-intelligence-and-society-task-force/','AI and Society Task Force: linked destination returned 404',
  'A task-force/report destination linked from the Research AI page. Retrieval returned HTTP 404, so the report itself could not be inspected.',
  'Where is the historical task-force report?',
  'Strategy|Governance|Link health','Everyone','Repair',1,'AI @ York / About & governance / History',
  'Locate an authoritative archived report and label its date and historical status. Do not present a task force as the current AI Roundtable.','');
add('its','research/its/','Institute for Technoscience and Society',
  'Interdisciplinary research on technoscience and society, relevant to critical AI inquiry but broader than AI.',
  'Where is York critical and social research on technology?',
  'Research discovery|Ethics','Researchers|Partners','Link',3,'AI @ York / Research / Related centres',
  'Tag as AI-adjacent, not as an AI policy source or an exclusively AI research unit.','');
add('mmai-admissions','https://futurestudents.yorku.ca/graduate/programs/artificial-intelligence','Graduate admissions: Artificial Intelligence Management',
  'Prospective-student overview of Schulich Master of Management in Artificial Intelligence, including curriculum and admissions-oriented information.',
  'Where can I study AI management at York?',
  'Programs|Admissions','Prospective students','Federate',2,'AI @ York / Study & careers / Programme directory',
  'Reuse one programme record shared with Schulich. Keep the admissions journey rather than redirecting all prospective-student pages to an internal-resource hub.','');
add('eecs-old','https://eecs.gradstudies.yorku.ca/ai/','EECS AI specialisation: legacy destination is generic WordPress page',
  'The research AI landing page links here as an AI specialisation. The request completed with a generic York WordPress-service page, not the intended programme information.',
  'Where is the current EECS AI specialisation information?',
  'Programs|Link health','Prospective students|Graduate researchers','Repair',1,'AI @ York / Study & careers / Programme directory',
  'Confirm the replacement with EECS/Graduate Studies. A 200 response is not proof that the original resource still exists.','');
add('mmai','https://schulich.yorku.ca/programs/mmai/','Schulich Master of Management in Artificial Intelligence',
  'Programme home for the MMAI degree, including a management/technical curriculum and AI consulting project.',
  'What does the MMAI degree cover and how do I apply?',
  'Programs|Admissions','Prospective students|Partners','Keep',2,'AI @ York / Study & careers / MMAI',
  'Use as the proposed programme source of truth, subject to Schulich confirmation; feed hub facts rather than copying curriculum and dates.','');
add('mmai-campaign','https://schulich.yorku.ca/achieve/master-management-artificial-intelligence-mmai/','Schulich MMAI marketing landing page',
  'A second prospective-student marketing surface for the same MMAI degree, describing the curriculum, career preparation and consulting project.',
  'Why choose the MMAI programme?',
  'Programs|Admissions','Prospective students','Federate',3,'AI @ York / Study & careers / MMAI',
  'Retain campaign-specific conversion needs if justified, but pull shared facts from the main programme record and audit canonical/search behaviour.','');
add('mban','https://schulich.yorku.ca/programs/mban/','Schulich Master of Business Analytics',
  'Business analytics degree linked from York research AI information; relevant to the broader data/AI study landscape, not institutional AI-use policy.',
  'Which business analytics study pathways are available?',
  'Programs|Admissions','Prospective students','Link',3,'AI @ York / Study & careers / Related programmes',
  'Include as an explicitly AI-related programme; avoid implying that every analytics programme is an AI degree.','');
add('ml-broken','https://continue.yorku.ca/programs/certificate-in-machine-learning/','Machine Learning certificate: linked programme URL returned 404',
  'The research page and Library AI guide link to this certificate URL. It returned HTTP 404 even though separate information-session pages still discuss the certificate.',
  'Where is current Machine Learning certificate information?',
  'Programs|Link health','Prospective students|Professionals','Repair',1,'AI @ York / Study & careers / Professional learning',
  'Ask Continuing Studies to confirm the programme status and canonical page. An old event listing is not proof of current enrolment availability.','');
add('ai-governance-course','https://continue.yorku.ca/programs/certificate-in-ai-governance/','Continuing Studies Certificate in AI Governance',
  'Professional certificate about governing AI systems: legal and ethical foundations, trustworthy design, deployment, monitoring and lifecycle governance.',
  'Where can professionals learn AI governance?',
  'Programs|Training|Governance','Professionals|Prospective students','Link',2,'AI @ York / Study & careers / Professional learning',
  'Label as an educational offering, not the University internal AI governance policy. Keep programme detail and registration with Continuing Studies.','');
add('bigdata','https://continue.yorku.ca/programs/big-data/','Continuing Studies Big Data programmes',
  'Professional data-learning pathways referenced by the research AI page, adjacent to AI and analytics.',
  'What related data skills programmes are available?',
  'Programs|Training','Professionals|Prospective students','Link',3,'AI @ York / Study & careers / Related programmes',
  'Use a maintained programme listing and describe its relationship to AI rather than reproducing promotional copy.','');
add('labs','https://lassonde.yorku.ca/eecs/research/research-labs/','Lassonde EECS research labs',
  'Directory of EECS research labs, providing specialist destinations for computing and AI-related expertise.',
  'Where do I find relevant computing and AI labs?',
  'Research discovery|Partnerships','Researchers|Partners|Prospective students','Link',3,'AI @ York / Research / Labs & expertise',
  'Keep the disciplinary directory and surface only appropriately tagged AI labs in the central index.','');
add('facilities','https://lassonde.yorku.ca/research/research-facilities-and-centres','Lassonde research centres and facilities',
  'Engineering research facilities and centre directory linked by the research AI landing page.',
  'What research infrastructure and centres support related work?',
  'Research discovery|Partnerships','Researchers|Partners','Link',3,'AI @ York / Research / Facilities',
  'Preserve the engineering directory; do not treat all centres as AI-specific.','');
add('best','https://lassonde.yorku.ca/best/','BEST: entrepreneurship and commercialisation',
  'Lassonde entrepreneurship support highlighted by York research AI information as part of the commercialisation ecosystem.',
  'Where can AI innovators find entrepreneurship support?',
  'Innovation|Partnerships','Students|Researchers|Partners','Link',3,'AI @ York / Research / Innovation & partnerships',
  'Route users to the existing entrepreneurship service; avoid copying application and incubator information.','');
add('ip','osgoode/ip-innovation-clinic/','Osgoode IP Innovation Clinic',
  'Pro bono intellectual-property clinic connected to York AI entrepreneurship information.',
  'Where can innovators find intellectual-property support?',
  'Innovation|Law','Researchers|Partners|Entrepreneurs','Link',3,'AI @ York / Research / Innovation & partnerships',
  'Present as specialist support with its own eligibility and intake, not general legal advice supplied by the AI hub.','');
add('savy','https://students.yorku.ca/savy-gpt','SAVY: GPT-powered student virtual assistant',
  'Public student-service page describing SAVY scope, exclusions, access and privacy claims. It says SAVY supports navigation and referrals and does not replace advising staff.',
  'What can SAVY answer, who can access it and where do I get help?',
  'Approved tools|Student services|Privacy','Students','Link',2,'AI @ York / Tools & data / Student assistants',
  'Maintain the service page with Student Services and reference its approved description from the tool inventory. Reconcile platform/privacy statements with UIT.','SAVY serves');
add('zoom-help','https://lthelp.yorku.ca/ai-companion/introduction-to-zoom-ai-companion','Zoom AI Companion: enabling instructions',
  'UIT AI services links here for enabling Zoom AI Companion. Both direct collection and the alternate fetch failed at the transport layer; destination instructions were not inspected.',
  'How do I enable Zoom AI Companion?',
  'Approved tools|Access|Meetings','Staff|Instructors','Verify',1,'AI @ York / Tools & data / Zoom AI Companion',
  'Retest from a normal York-supported browser/network. A transport failure in this audit is not proof that the page is broken for users.','');
add('staff-learning','https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1651','YU Learn: GenAI at York learning package',
  'Named and linked by UIT as a staff learning package containing recordings, guides and FAQs. The learning-page request returned HTTP 500 in this audit; the package content was not inspected.',
  'Where is staff training on AURA and Copilot?',
  'Training|Approved tools','Staff','Verify',2,'AI @ York / Learn & get help / Staff learning',
  'Show a public abstract, eligibility and any sign-in requirement; leave enrolment/materials in YU Learn and retest the destination.','');
add('manager-learning','https://yulearn.yorku.ca/local/yulearn/learning_opportunity.php?id=1620','YU Learn: GenAI in the workplace for people managers',
  'UIT-linked manager-focused learning recording. The destination returned HTTP 500 in this audit; its content and access requirements were not independently verified.',
  'What AI training is available to people managers?',
  'Training|Responsible use','Staff|Managers','Verify',2,'AI @ York / Learn & get help / Managers',
  'Index as manager learning with a public description and confirmed access conditions. Do not label an HTTP 500 as proof of authentication gating.','');
add('draft','uit/cio/wp-content/uploads/sites/936/2024/11/20241001-DRAFT-Generative-AI-Guidelines_r2.1.pdf','GenAI principles and guidelines: older DRAFT-named PDF',
  'Reachable administrative/operational guideline PDF with a DRAFT filename, blank approval date and October 1, 2024 effective date. LA&PS still links this version.',
  'Which version of the operational GenAI guidelines am I reading?',
  'Policy|Governance|Version drift','Staff|Instructors','Replace',0,'AI @ York / Responsible use / Operational guidelines',
  'Have VPFA/UIT confirm supersession, replace incoming links with the approved stable landing page, and retain an explicitly historical archive if required.','Approval Authority');
add('guidelines','uit/cio/wp-content/uploads/sites/936/2025/07/Generative-AI-Guidelines_r2.1_July_2_2025.pdf','GenAI principles and guidelines: July 2025 revision',
  'UIT governance-linked administrative/operational guideline PDF. Header identifies VPFA approval on November 19, 2024, effect from December 1, 2024 and revision July 2, 2025.',
  'What operational AI-use guidelines does UIT governance currently link?',
  'Policy|Responsible use|Data handling','Staff|Instructors','Keep',0,'AI @ York / Responsible use / Operational guidelines',
  'Proposed authoritative operational baseline because it is linked by governance and carries approval metadata; confirm with its owner. Publish an accessible HTML landing page and version history.','Approval Authority');
add('assistants','uit/cio/wp-content/uploads/sites/936/2026/02/Guidelines-AI-Chatbots-Assistants.pdf','Administrative AI chatbots and meeting assistants guidelines (2026)',
  'VPFA-approved February 23, 2026 supplement for non-academic administrative/operational use. Addresses approved tools, notification and participant consent, objection, sensitive meetings and summary handling.',
  'When can an administrative meeting be transcribed or summarised by AI?',
  'Policy|Meetings|Privacy|Responsible use','Staff|Managers','Reuse',0,'AI @ York / Tools & data / Meeting assistants',
  'Put consent and scope beside activation instructions and tool cards. Do not generalise this administrative guideline into an academic recording rule without owner confirmation.','Meeting Participant Consent');
add('library-index','https://www.library.yorku.ca/web/research-learn/artificial-intelligence-workshops-guides-more/','Libraries: AI workshops, guides and more',
  'A Library-level AI landing page for workshops and research/learning guides, adding another discovery layer between the main hub and detailed Library resources.',
  'Which AI learning and research support can the Library provide?',
  'AI literacy|Training|Research practice','Students|Researchers|Instructors','Federate',2,'AI @ York / Learn & get help / Library support',
  'Keep Library service identity but syndicate its resource and workshop entries into the shared catalogue.','');
add('front-door','uit/cio/ai','UIT AI Front Door: password-protected landing page',
  'The retrieved page is titled "Protected: AI Front Door". It is referenced by glossary links on the public AI initiative page, but protected content could not be reviewed.',
  'Where are the definitions referenced by the tool/data labels?',
  'Data handling|Access|Link health','Staff','Repair',1,'AI @ York / Tools & data / Glossary',
  'Make any definitions required to interpret the public permission matrix publicly accessible, or replace these links with a public glossary.','');
add('tc-self','teachingcommons/resources-by-topic/artificial-intelligence-ai-pedagogical-resources/generative-ai-in-teaching-self-paced-learning/','Teaching Commons: self-paced AI teaching learning',
  'Self-paced teaching development resource linked from Teaching Commons pedagogical resources.',
  'Can I learn about AI teaching at my own pace?',
  'Training|Teaching','Instructors','Link',3,'AI @ York / Learn & get help / Self-paced',
  'Keep course delivery with Teaching Commons/eClass and index format, workload, audience and access in the hub.','');
add('citation-guide','https://researchguides.library.yorku.ca/c.php?g=679413&p=5316500','Libraries Citing Your Work: AI tools',
  'AI-specific chapter in the general citation guide. It is also linked from LA&PS checklists and academic integrity resources.',
  'How do I cite AI output or acknowledge assistance in the required style?',
  'Citation|Disclosure','Students|Researchers|Instructors','Reuse',2,'AI @ York / Teaching & learning / Cite & disclose',
  'Choose one Library-maintained style guide as the canonical practical reference. Keep policy approval questions separate from citation formatting.','');
add('spark-cite','https://spark.library.yorku.ca/creating-bibliographies-citing-and-ai-based-tools/','SPARK: citing AI-based tools',
  'Academic-skills learning material about bibliographies and citing AI, with a French-language route also discovered.',
  'How do citation and AI fit into academic writing skills?',
  'Citation|AI literacy','Students','Federate',3,'AI @ York / Teaching & learning / Cite & disclose',
  'Retain the skills-learning format and French counterpart; share current policy/citation references rather than independently maintain the same rules.','');
add('spark-use','https://spark.library.yorku.ca/using-ai-based-tools-responsibly/','SPARK: using AI-based tools responsibly',
  'Student academic-skills resource on responsible AI use, with a French-language route also retrieved.',
  'How can I approach AI responsibly while developing my academic skills?',
  'Responsible use|Student guidance|AI literacy','Students','Federate',3,'AI @ York / Start here / Student AI literacy',
  'Preserve the learning module and bilingual access; reuse approved policy wording and connect it to the central decision pathway.','');
add('responsible-lab','https://responsibleai.eecs.yorku.ca/','Responsible AI Lab',
  'Research-lab destination linked from the Library AI subject guide; distinct from institution-wide responsible-use policies.',
  'Where is research on responsible AI?',
  'Research discovery|Ethics','Researchers|Partners|Prospective students','Link',3,'AI @ York / Research / Labs & expertise',
  'Use a research-directory profile and make the distinction between responsible-AI research and York compliance requirements explicit.','');
add('laps','laps/teaching-hub/gen-ai/','LA&PS: Gen AI and the Classroom',
  'Faculty teaching hub with course-design guidance, links to central resources and a quoted 2023 Senate committee statement saying student AI use requires explicit permission. It also links the older DRAFT-named operational PDF.',
  'How should LA&PS instructors approach AI policy and classroom practice?',
  'Teaching|Academic integrity|Version drift','Instructors','Resolve',0,'AI @ York / Teaching & learning / Faculty-specific practice',
  'Resolve conflicting university-wide default-permission language and stale document links. Retain useful faculty examples, but source common rules centrally.','To promote clear');
add('laps-scaffold','laps/teaching-hub/gen-ai/scaffolding/','LA&PS: integrating and scaffolding GenAI',
  'Practical teaching guidance on gradually introducing AI tools, ethical considerations, digital literacy, coursework and course/assessment policy.',
  'How can I scaffold AI use in teaching and assessments?',
  'Teaching|Assessment|AI literacy','Instructors','Federate',2,'AI @ York / Teaching & learning / Practical examples',
  'Preserve concrete teaching scenarios as faculty-contributed resources; reuse common policy text and link the existing central ethics explanation.','Scaffolding AI Tools');
add('laps-design','laps/teaching-hub/gen-ai/course-design/','LA&PS: AI for Course Design toolkit',
  'An instructor toolkit with Universal Design for Learning, conversational prompts, learning goals, assessments, rubrics and planning examples.',
  'How can I use AI to prototype a course, lesson, assessment or rubric?',
  'Teaching|Assessment|Prompting|Accessibility','Instructors','Federate',2,'AI @ York / Teaching & learning / Course design',
  'Keep specialist examples and local support, and tag them in a common prompt/resource catalogue instead of rebuilding a generic faculty AI landing page.','Universal Design');
add('laps-integrity','laps/decisions-petitions/academic-honesty/gen-ai/','LA&PS: GenAI and Academic Honesty',
  'Student-facing faculty guidance on course expectations, learning risks and responsible use. Includes a university-wide statement requiring instructor permission or knowledge.',
  'How should LA&PS students check permission and maintain academic integrity?',
  'Academic integrity|Student guidance','Students','Resolve',0,'AI @ York / Teaching & learning / Students',
  'Align common permission rules with the central academic integrity explanation; keep faculty support and student examples.','York University prohibits');
add('laps-checklist','laps/decisions-petitions/academic-honesty/gen-ai/checklist/','LA&PS: GenAI student checklist (HTML)',
  'Before/during/after checklist: consult course instructions, ask the instructor, check tool terms/privacy, verify outputs, keep records and cite AI use. Also distributed as a PDF.',
  'What should I check before, while and after using GenAI for an assignment?',
  'Student guidance|Academic integrity|Citation|Privacy','Students','Reuse',2,'AI @ York / Teaching & learning / Student checklist',
  'Offer one reusable accessible checklist, with the downloadable edition generated from the same source and approved policy wording.','Before using Gen AI');
add('laps-pdf','laps/wp-content/uploads/sites/44/2024/10/Gen-AI-Checklist.pdf','LA&PS: GenAI student checklist (PDF)',
  'Downloadable companion to the HTML student checklist. A format duplicate for the same student task, not a separate policy.',
  'Can I download the student AI checklist?',
  'Student guidance|Academic integrity|Citation','Students','Merge',2,'AI @ York / Teaching & learning / Student checklist',
  'Keep a printable version if needed but generate it from the maintained HTML/checklist content to prevent drift.','');
add('senate-2023','unit/vpacad/academic-integrity/wp-content/uploads/sites/576/2023/03/Senate-ASCStatement_Academic-Integrity-and-AI-Technology.pdf','Senate committee AI statement (February 2023)',
  'Historical committee statement explicitly says it is not a policy document. It predates the current Academic Conduct Policy and contains the explicit-permission wording still quoted by LA&PS.',
  'What did the 2023 academic integrity committee communicate about AI?',
  'Academic integrity|Policy|Version drift','Instructors|Students','Replace',0,'AI @ York / Responsible use / Historical guidance',
  'Ask the academic policy owner to label historical status and determine supersession; replace current-use quotations with owner-approved current guidance.','It is not a policy document');
add('tc-hub-pointer','teachingcommons/resource/aiyork-the-central-hub-for-ai-at-york-university/','Teaching Commons resource pointer to AI @ York',
  'A short catalogue-style resource record pointing visitors back to the central AI hub, rather than a separate body of AI guidance.',
  'Where is the central AI hub?',
  'Discovery','Instructors','Keep',3,'AI @ York / Distributed navigation',
  'This is useful signposting, not harmful content duplication. Retain the pointer if the resource catalogue still needs it.','');
add('classification','secretariat/policies/policies/information-security-classification-standard/','Information Security Classification Standard',
  'Formal York standard defining public, internal-use, confidential and regulated information. It is not an AI approval matrix.',
  'How does York formally classify University information?',
  'Policy|Data handling|Privacy','Staff|Researchers|Instructors','Keep',1,'AI @ York / Tools & data / Classification',
  'Keep the standard authoritative at the Secretariat; map service-level AI permissions to these categories rather than create competing definitions.','Information Security Classification Categories');
add('zoom-security','uit/infosec/zoom-privacy-and-security/','Information Security: Zoom privacy and security',
  'General Zoom security/privacy guidance that complements, but does not replace, AI assistant approval and administrative consent guidance.',
  'What security and privacy considerations apply to Zoom?',
  'Privacy|Meetings','Staff|Instructors','Link',2,'AI @ York / Tools & data / Meeting assistants',
  'Link as supporting security guidance; put AI-specific consent and data rules on the tool record with scope clearly labelled.','');
add('bccc','research/bccc/','Behaviour-Centric Cybersecurity Center (BCCC)',
  'Research on behaviour-based cybersecurity using AI, machine learning and analytics, including secure and trustworthy AI. Found through targeted search rather than the three main AI hub branches.',
  'Where is York research on AI-enabled cybersecurity and secure AI?',
  'Research discovery|Partnerships|Coding','Researchers|Partners|Prospective students','Link',2,'AI @ York / Research / Centres & expertise',
  'Include as an AI-related research directory entry, maintained by the centre. This is not a source of general University AI-use policy.','trustworthy AI');
add('library-permission',L+'c.php?g=740624&p=5347338','Libraries GenAI research: guidelines and considerations',
  'Research-use guidance says using AI in a course where an instructor has not authorised it is a breach. This differs in default framing from the central student page.',
  'How do course permissions affect using GenAI during student research?',
  'Research practice|Academic integrity|Student guidance','Students|Graduate researchers','Resolve',0,'AI @ York / Teaching & learning / Academic integrity',
  'Have the academic integrity owner approve the common permission explanation and reuse it across both teaching and Library research guidance.','has not authorized');
add('library-cite-chapter',L+'c.php?g=740624&p=5345768','Libraries GenAI research: citing GenAI tools',
  'APA, MLA and Chicago citation entry point within the GenAI research guide, also repeating the instructor-authorisation framing of academic conduct.',
  'How should I cite GenAI in a research assignment?',
  'Citation|Academic integrity|Disclosure','Students|Researchers','Resolve',0,'AI @ York / Teaching & learning / Cite & disclose',
  'Resolve repeated permission wording and select a single canonical Library citation guide for shared style examples.','has not authorized');
add('library-verify',L+'c.php?g=740624&p=5347346','Libraries GenAI research: verifying findings and citations',
  'Practical advice on comparing AI output with scholarly sources and checking generated citations for hallucinations.',
  'How do I verify AI claims and bibliographies?',
  'Research practice|AI literacy|Citation','Students|Researchers','Reuse',2,'AI @ York / Research / Verify AI output',
  'Keep this practical chapter; surface it from student learning, research and AI literacy without copying its body.','Check citations');
add('library-prompts',L+'c.php?g=740624&p=5345766','Libraries GenAI research: effective prompt strategies',
  'Prompting advice, examples and the CLEAR framework for student research, including context, role, goals, constraints and output formatting.',
  'How can I write better prompts for research tasks?',
  'Prompting|Research practice|AI literacy','Students|Researchers','Federate',2,'AI @ York / Learn & get help / Prompt collection',
  'Index as research prompting, separate from operational templates and course-design prompts, with a shared tag model.','CLEAR');
add('library-workflow',L+'c.php?g=740624&p=5345767','Libraries: research discovery and workflow AI tools',
  'Explains scholarly discovery/workflow tools, their use in literature mapping and document analysis, and cautions about coverage, costs and use conditions.',
  'Which scholarly AI tools can assist a literature review?',
  'Research practice|Approved tools','Students|Researchers','Link',1,'AI @ York / Research / Scholarly tools',
  'Clearly distinguish a Library description of a tool from York enterprise approval. Cross-link tool/data permissions without labelling every mentioned tool as approved.','Research Discovery');

const findings = [
  { id:'permission', title:'Conflicting answers to "May I use AI in coursework?"', severity:'Critical', kind:'Conflicting guidance', owner:'Academic integrity office + Senate policy owner, with LA&PS and Libraries', keys:['students','laps','laps-integrity','library-permission','library-cite-chapter','policy','senate-2023'], evidence:[['students','By default'],['laps','To promote clear'],['library-permission','has not authorized'],['policy','5.2 Breaches']], observation:'The central student page frames documented use as allowed unless prohibited; LA&PS quotes explicit permission as the default, and Library research chapters say use without authorisation is a breach. The 2023 statement itself is explicitly not a policy document. These are materially different user-facing answers, not simply repeated links.', decision:'Obtain a single approved explanation of the current policy and course-level discretion. Reuse it as a shared content component with version/effective date. Until resolved, point users to the formal policy and their instructor; this audit does not adjudicate permission.', target:'Teaching & learning / Can I use AI in my course?', measure:'No conflicting default-permission statements across identified pages; all common explanations link the same owner-approved answer.' },
  { id:'versions', title:'An older draft PDF remains in the current guidance path', severity:'Critical', kind:'Version drift', owner:'VPFA / UIT document owner + LA&PS web editor', keys:['draft','guidelines','laps','governance'], evidence:[['draft','Approval Authority'],['guidelines','Approval Authority']], observation:'LA&PS links the reachable DRAFT-named 2024 document; UIT governance links a July 2025 revision with populated approval metadata. A user can reach two differently dated editions without a clear supersession notice.', decision:'Confirm supersession, use a stable HTML document landing page, replace current-use links and label historical copies. Do not silently delete official records or redirect a document without retention-owner approval.', target:'Responsible use / Operational guidelines', measure:'All current-use links resolve to the confirmed current edition; old editions carry a historical/superseded label.' },
  { id:'tools', title:'Tool approval and data permissions have several competing surfaces', severity:'High', kind:'Overlapping guidance / verification risk', owner:'UIT service owners + Information Security + privacy office', keys:['operations','tools','data','classification','github','front-door'], evidence:[['tools','Microsoft doesn'],['operations','Personal GitHub Copilot licenses']], observation:'The initiative page combines many products and data-class labels, the AI services page contains access/FAQ claims, M365 has a handling matrix, and the formal classification standard defines categories. The services FAQ makes absolute claims about Copilot history, retention and admin visibility. Plain-text extraction does not establish the initiative matrix visual allow/deny state.', decision:'Create one approved tool register, distinguishing product, licence, authentication, data class, purpose, settings and review date. Verify privacy/retention assertions against current configurations. Publish permissions as accessible text and make required glossary definitions public.', target:'Tools & data / Which tool can I use?', measure:'One owner-maintained permission record per tool/licence; no unreviewed blanket privacy promises or visual-only permission indicators.' },
  { id:'meetings', title:'Meeting-assistant consent is separated from activation guidance', severity:'High', kind:'Fragmented task journey', owner:'UIT collaboration service owner + VPFA / privacy office', keys:['tools','assistants','zoom-help','zoom-security'], evidence:[['assistants','Meeting Participant Consent'],['tools','approved for use with York University content']], observation:'UIT services promotes and links activation for Zoom AI Companion, while consent, objection and sensitive-meeting guidance lives in a separate February 2026 administrative-use PDF. The activation destination could not be reached by this audit. Tool approval is not unconditional permission for every meeting.', decision:'Show scope-specific consent and summary-handling requirements beside the meeting-assistant tool card and activation path. Keep the non-academic scope explicit; obtain separate academic guidance where needed.', target:'Tools & data / Meetings & transcription', measure:'Every administrative activation route exposes consent, objection, sensitive-meeting and summary-handling guidance before use.' },
  { id:'citations', title:'Citation and disclosure help is scattered across multiple entry points', severity:'Medium', kind:'Topic overlap, mostly complementary', owner:'Libraries + academic integrity office', keys:['library-citing','citation-guide','library-cite-chapter','spark-cite','integrity-students','laps-checklist'], evidence:[['library-cite-chapter','Citing Generative AI Using Style Guidelines']], observation:'Library landing pages, two guide chapters, SPARK, academic integrity pages and a faculty checklist all address citing or acknowledging AI. Skills instruction, citation style and policy obligations are related but not interchangeable.', decision:'Create one "Cite and disclose AI" task entry: approved policy explanation, reusable disclosure/declaration templates, then canonical Library style guidance and optional SPARK learning. Keep each specialist format where it adds value.', target:'Teaching & learning / Cite & disclose', measure:'One discoverable task route with no separately maintained duplicate style/policy examples.' },
  { id:'teaching', title:'Instructors must choose between several AI teaching hubs', severity:'Medium', kind:'Repeated navigation and resource lists', owner:'Teaching & Learning + Teaching Commons + Faculty teaching leads', keys:['teaching','faculty','tc','tc-resources','laps','laps-scaffold','laps-design','tc-self'], evidence:[['laps-design','Universal Design'],['tc-resources','SHARE']], observation:'The central educational site, Teaching Commons and LA&PS all have AI landing pages, practical resources, course-design material and support pointers. Their useful contributions differ: principles, professional development and discipline-specific examples.', decision:'Publish one instructor pathway with a federated resource collection. Centralise principles and common rules, keep Commons training and faculty examples, and replace repeated generic link lists with a shared catalogue feed.', target:'Teaching & learning / Instructors', measure:'Instructors reach course rules, assessment practice, templates and professional development from one task landing page.' },
  { id:'research', title:'Research ABOUT AI and research WITH AI are mixed together', severity:'Medium', kind:'Information architecture overlap', owner:'Research & Innovation + Libraries + Graduate Studies', keys:['research','library-ai','library-genai','graduate','cais','minds','bccc','responsible-lab'], evidence:[['library-ai','About This Guide'],['library-genai','Purpose of this Guide']], observation:'Research & Innovation combines responsible-use resources, programmes, centres and entrepreneurship. Libraries separately provides an AI subject guide and a guide to using GenAI. Graduate research advice lives under Teaching & Learning; BCCC was found outside the hub branches.', decision:'Split the hub research section into "Use AI in research" and "Discover AI research". Cross-tag graduate guidance once. Maintain centre/lab profiles and opportunities as directory records, not copied microsites.', target:'Research / Use AI; Research / Discover expertise', measure:'Users can distinguish research conduct guidance from research expertise and find graduate-specific advice without knowing its current host.' },
  { id:'prompts', title:'Prompt collections overlap, but their contexts are worth preserving', severity:'Medium', kind:'Related content, not proven duplicates', owner:'UIT + Libraries + LA&PS / Teaching Commons', keys:['prompts','library-prompts','laps-design','tc-resources'], evidence:[['library-prompts','BASIC TIPS'],['laps-design','Conversational Prompting']], observation:'UIT has a prompt library, Libraries teaches research prompting, and LA&PS offers course-design examples. They serve different jobs despite sharing prompt-literacy basics.', decision:'Create a single indexed prompt collection with audience, task, discipline, tool, source owner and review date. Reuse the basics; retain specialist examples and include data-handling and permission caveats.', target:'Learn & get help / Prompts & practical examples', measure:'Every listed prompt has a clear audience/task and an accountable source, with one common basics explanation.' },
  { id:'programs', title:'Programme descriptions and AI capability claims are repeated', severity:'Medium', kind:'Intentional marketing overlap / stale-link risk', owner:'Schulich + Graduate Admissions + Continuing Studies + Research & Libraries', keys:['mmai','mmai-admissions','mmai-campaign','ai-governance-course','ml-broken','research','library-ai','mban'], evidence:[['library-ai','80 AI-related'],['research','80+ AI-related']], observation:'MMAI appears on its programme page, admissions page and campaign page. Research and Library pages repeat course/faculty counts and programme lists, including a certificate URL that returned 404. This audit does not verify the repeated institutional counts.', decision:'Use maintained programme metadata supplied by admissions/programme owners; link to existing application journeys. Date and source aggregate AI statistics. Do not confuse an AI governance certificate with internal governance policy.', target:'Study & careers / Programmes and professional learning', measure:'Programme names/status/dates update in one source and propagate; no stale certificate links or undated unsupported aggregate counts.' },
  { id:'link-health', title:'Some central research routes are dead or no longer the intended resource', severity:'High', kind:'Observed link-health defects', owner:'Research & Innovation web owner + destination owners', keys:['research','osgoode-broken','taskforce','ml-broken','eecs-old'], evidence:[], observation:'Direct requests returned 404 for the linked Osgoode guide, AI and Society task-force page and Machine Learning certificate. The legacy EECS AI specialisation URL returned a generic York WordPress-service page. These are observed outcomes at audit time, not assumptions from old search snippets.', decision:'Confirm replacement URLs and programme/report status with the destination owners; repair the central research page and other identified incoming links. Recheck before publication because responses can change.', target:'Immediate maintenance / Research links', measure:'Every identified current research-path link lands on the intended live resource, or is explicitly retired with an explanation.' },
  { id:'news', title:'News and project stories should feed the hub, not become policy', severity:'Medium', kind:'Distributed publishing / freshness', owner:'Communications + programme and service owners', keys:['minds','bccc','tc','tools'], evidence:[], observation:'YFile, research initiatives, faculty pages and teaching blogs add a long tail of AI news and examples. A newer graduate-funding assistant story illustrates why narrative announcements and the live tool/service register should be reconciled, not treated as equivalent records.', decision:'Aggregate tagged stories and opportunities, keep original publication dates and source sites, and require a separate service-owner review before a news item changes tool status. Preserve editorial archives.', target:'Research & impact / News; Tools / Live register', measure:'One filtered AI news feed; every operational tool shown in it links a current service record or is clearly labelled as a pilot.' },
  { id:'aliases', title:'Multiple URLs do not automatically mean duplicated content', severity:'Medium', kind:'Aliases, pointers and format variants', owner:'Central web team + site owners', keys:['hub','tools','tc','tc-resources','tc-hub-pointer','laps-checklist','laps-pdf'], evidence:[], observation:'The crawl encountered several paths resolving to the same Teaching Commons/UIT destinations, short pointer records and printable PDF companions. A separate ai.yorku.ca entry appeared in search, but direct transport failed, so its redirect/canonical relationship was not verified.', decision:'Treat same-destination aliases, useful pointers, alternate formats and independently maintained duplicate guidance as different cases. Retain useful entry links, confirm canonical/redirect behaviour and generate printable versions from a shared source.', target:'Platform / Canonical URLs and content reuse', measure:'Every alias has a documented canonical destination; no claim of byte-identical content is made from title or topic similarity alone.' }
];

const blueprint = [
  { id:'start', title:'Start here', task:'Understand AI and find my route', subtitle:'Basics, principles and audience pathways', owner:'Central AI web product owner + Teaching & Learning', source:['hub','literacy','ethics'], body:'One short explanation of AI at York, common principles, key questions and pathways for students, instructors, researchers, staff and external partners. Add French-language parity and accessible formats to the publication plan.', keep:'Reuse GenAI 101 and educational ethics. Do not create another standalone AI basics microsite.', topic:'AI literacy' },
  { id:'tools', title:'Tools & data', task:'Choose a tool safely', subtitle:'Approvals, access, licences, data and meetings', owner:'UIT service owners + Information Security + privacy office', source:['tools','data','classification','github','assistants'], body:'Searchable tool records with product/licence, eligibility, authentication, permitted data by purpose, known limitations, activation, support and last approval review. Provide "Can I put this information into this tool?" and scoped meeting-assistant guidance.', keep:'Keep provisioning, security assessments and service tickets in existing systems. The hub displays their approved facts; it must not infer approvals.', topic:'Approved tools' },
  { id:'teaching', title:'Teaching & learning', task:'Use AI in a course', subtitle:'Permission, assessment, citation and templates', owner:'Teaching & Learning + academic integrity office + Libraries', source:['students','integrity-students','integrity-instructors','policy','faculty','tc-resources','laps-design','citation-guide'], body:'A shared owner-approved answer to course permission, with student and instructor task pathways. Include assessment approaches, cite/disclose guidance, accessible checklists, course statements and faculty examples.', keep:'Keep Senate policy authoritative at the Secretariat. Retain specialist Library guides and Teaching Commons resources, surfaced by shared records.', topic:'Teaching' },
  { id:'research', title:'Research', task:'Use AI in research or find expertise', subtitle:'Research conduct, graduate work, centres and innovation', owner:'Research & Innovation + Graduate Studies + Libraries', source:['research','library-genai','library-ai','graduate','cais','minds','bccc','best','ip'], body:'Separate responsible research practice from AI research discovery. Include graduate/supervisor guidance, scholarly tools, output verification, links to current funder requirements, research ethics contacts and centre/lab expertise.', keep:'Keep research-centre sites, grants and external funder policy at source. Date-check external rules before quoting them; this audit did not review external policy content.', topic:'Research practice' },
  { id:'learn', title:'Learn & get help', task:'Build skills and get support', subtitle:'Training, prompts, communities and contacts', owner:'Teaching Commons + Libraries + HR learning + UIT support', source:['tc','tc-self','staff-learning','manager-learning','prompts','library-prompts','library-index'], body:'One calendar/catalogue filtered by audience, task, format, cost, prerequisites and access. Include prompt examples, staff and manager learning, communities of practice and a question-to-owner contact route.', keep:'Keep enrolment and protected materials in YU Learn/eClass. Publish a useful public abstract and honest sign-in/access status.', topic:'Training' },
  { id:'study', title:'Study & careers', task:'Find a programme or credential', subtitle:'Degrees, certificates and professional pathways', owner:'Admissions + Faculties + Continuing Studies', source:['mmai','mmai-admissions','mban','ai-governance-course','bigdata'], body:'A maintained directory of AI and AI-related programmes with credential, audience, mode, owner and canonical admissions link. Clearly separate internal staff development from fee-based professional education.', keep:'Keep applications, curriculum, tuition and campaign pages with programme owners. Reuse metadata and do not duplicate time-sensitive details.', topic:'Programs' },
  { id:'about', title:'About, governance & impact', task:'Understand York direction and accountability', subtitle:'Policy register, Roundtable, roadmap and news', owner:'Named hub product owner + AI Roundtable / appropriate policy authorities', source:['hub','governance','guidelines','assistants','policy','classification'], body:'Explain governance and the distinction between policies, guidelines, principles, draft/historical material and news. Publish owner, scope, authority, effective/review dates and change history for each rule. Aggregate current tagged news and report outcomes.', keep:'Do not make the Roundtable an approval authority unless the relevant governance documents say it is. Keep authoritative formal documents with their owners.', topic:'Governance' }
];
module.exports = { rows, findings, blueprint };
