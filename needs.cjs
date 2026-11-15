const D = 'Direct answer', C = 'Supporting context', S = 'Signpost', U = 'Unverified destination', H = 'Historical guidance';
const definitions = [];
function need(id, title, audience, category, statement, success, coverage, assessment, sources, section, owner, action, priority = 2, hypothesis = false, gapSearch = null) {
  definitions.push({ id:'need-'+id, title, audience:audience.split('|'), category, statement, success, coverage, assessment, sources, section, owner, action, priority,
    basis:hypothesis ? 'Hypothesised need' : 'Content-derived need',
    validation:'Analyst-inferred; not validated through user research', gapSearch });
}
need('ai-basics','Understand what GenAI can and cannot do','Everyone','AI literacy',
  'I need to understand the limits of GenAI so that I can decide whether it is suitable for my task.',
  'The user can explain relevant capabilities and limitations without assuming generated output is reliable.',
  'Addressed','Introductory explanations occur on several learning surfaces; the contexts differ, but the basic answer can be shared.',
  [['literacy',D,'Foundational educational explanation.'],['students',D,'Explains accuracy, bias and learning limitations.'],['library-genai',D,'Introduces research-oriented capabilities and limitations.'],['spark-use',C,'Academic-skills learning context.']],
  'start','Teaching & Learning + Libraries','Reuse one concise basics explanation; preserve contextual learning examples.');
need('course-permission','Know whether I may use AI for this assessment','Students','Academic integrity',
  'I need to determine whether a particular AI use is permitted for my assessment so that I do not breach my course requirements.',
  'The user obtains an unambiguous owner-approved interpretation and knows which course/assessment instructions apply.',
  'Conflicting answers','Central student guidance uses an allowed-unless-prohibited default, while faculty and Library wording requires authorisation. More content does not resolve the inconsistency.',
  [['students',D,'Explicit allowed-unless-prohibited framing.','By default'],['laps',D,'Quotes the explicit-permission framing.','To promote clear'],['laps-integrity',D,'Student-facing permission framing.'],['library-permission',D,'Authorisation-based policy interpretation.','has not authorized'],['library-cite-chapter',D,'Repeats authorisation-based interpretation.'],['integrity-students',D,'Explains course/assignment-specific requirements.'],['policy',C,'Formal policy authority; interpretation requires its owner.'],['senate-2023',H,'Historical, explicitly non-policy statement.']],
  'teaching','Academic integrity office + Senate policy owner','Resolve the common answer before consolidation; reuse it everywhere with course-level qualifications.',0);
need('set-expectations','Communicate permitted AI use in my assessment','Instructors|Teaching assistants','Teaching',
  'I need to communicate my assessment AI-use expectations so that students know what assistance is permitted.',
  'A student can identify the applicable restrictions and disclosure requirements from the assessment instructions.',
  'Addressed','Several instructor resources address communicating expectations; faculty examples can support one maintained common framework.',
  [['integrity-instructors',D,'Dedicated instructor communication guidance.','Communicating Expectations'],['faculty',D,'Faculty-facing educational guidance.'],['laps-scaffold',D,'Course and assessment policy examples.'],['policy',C,'Formal responsibilities and policy scope.']],
  'teaching','Academic integrity office + Teaching & Learning','Share an approved course-statement framework and retain discipline-specific examples.');
need('disclose-use','Explain how AI contributed to my work','Students|Researchers|Staff','Disclosure',
  'I need to disclose the role AI played in my work so that others can judge its provenance and my contribution.',
  'The disclosure identifies the assistance used and follows the requirements of the relevant course, research or work context.',
  'Addressed','Transparency and disclosure are repeated across educational, research and operational contexts; the common concept is shared, but obligations remain scope-specific.',
  [['teaching',D,'Transparency principle.'],['integrity-students',D,'Acknowledgement/documentation guidance for students.'],['integrity-instructors',D,'Declaration materials and expectations.'],['graduate',D,'Graduate research documentation.'],['guidelines',D,'Outward-facing operational communication disclosure.']],
  'teaching','Academic integrity office + Graduate Studies + UIT','Provide a shared disclosure entry point with clearly separated course, research and operational requirements.');
need('cite-ai','Format a reference to AI-generated material','Students|Researchers','Citation',
  'I need to cite AI-generated material in the required citation style so that my references meet academic expectations.',
  'The user can apply the required style to the relevant AI material; citation is not mistaken for permission to use AI.',
  'Addressed','Multiple Library and skills resources serve the same citation-formatting need.',
  [['citation-guide',D,'AI chapter in the general citation guide.'],['library-cite-chapter',D,'GenAI guide with APA, MLA and Chicago routes.'],['spark-cite',D,'Citation-skills learning material.'],['library-citing',S,'Library citation entry point.'],['laps-checklist',S,'Checklist refers readers to citation help.']],
  'teaching','Libraries','Select one maintained style-guidance destination; make permission and disclosure separate linked needs.');
need('verify-claims','Check whether an AI-generated claim is trustworthy','Students|Researchers|Staff','Verification',
  'I need to verify an AI-generated claim before relying on it so that inaccurate output does not enter my work.',
  'The user can check the claim against suitable independent evidence and recognise when verification is not possible.',
  'Addressed','Practical verification advice complements general warnings about hallucination and human oversight.',
  [['library-verify',D,'Concrete verification strategies.'],['laps-checklist',D,'Before/during/after checking steps.'],['students',D,'Checks against reliable sources and existing knowledge.'],['guidelines',C,'Human responsibility for operational outputs.']],
  'research','Libraries + relevant domain experts','Promote practical verification steps instead of repeating warnings without a next action.');
need('verify-citations','Check that an AI-generated reference exists','Students|Researchers','Verification',
  'I need to verify a reference suggested by AI so that I do not cite a fabricated or misidentified source.',
  'The user locates the actual source and checks its bibliographic details and relevance.',
  'Addressed','A specific Library chapter directly addresses fabricated citations; this is distinct from formatting a reference.',
  [['library-verify',D,'Explicit strategies for hallucinated citations.','Check citations'],['library-workflow',C,'Scholarly-resource coverage and workflow caveats.']],
  'research','Libraries','Expose this as a distinct check in research and citation pathways.');
need('learn-independently','Use AI without replacing the learning I need to do','Students','Student learning',
  'I need to keep developing my own understanding when AI is available so that assistance does not replace the skills my course is meant to build.',
  'The user can distinguish supportive learning activity from outsourcing the learning or assessment task.',
  'Addressed','Student guidance and a faculty checklist discuss critical thinking, dependency and retaining one own contribution.',
  [['students',D,'Learner independence and tutoring uses.'],['laps-checklist',D,'Reflection and own-work checks.'],['laps-integrity',D,'Student concerns about dependency and skill development.']],
  'teaching','Teaching & Learning + student learning support','Consolidate common learning advice and retain course-specific practice examples.');
need('ethical-fit','Decide whether an AI use aligns with my values','Everyone','Ethics',
  'I need to assess the ethical implications of a proposed AI use so that I can make an informed choice about using it.',
  'The user can identify relevant bias, equity, copyright, accessibility and sustainability considerations for the proposed use.',
  'Addressed','Ethics material supplies a reflective lens, not a blanket approval or prohibition for every use case.',
  [['ethics',D,'Educational ethics organised through York values.'],['teaching',D,'Choice and values principles.'],['guidelines',C,'Operational principles within a defined scope.']],
  'start','Teaching & Learning + relevant policy/domain owners','Reuse the ethics lens; keep enforceable rules and use-case approvals distinct.');
need('choose-tool','Identify a York-approved tool for my intended task','Staff|Instructors|Researchers','Tools & data',
  'I need to identify an approved AI tool for my intended task so that I do not assume any publicly available product is authorised.',
  'A tool record identifies the specific product/licence, eligibility, scope and applicable approval conditions.',
  'Partially addressed','Approved-tool and service lists exist, but task, licence, authentication and data conditions are distributed across pages.',
  [['tools',D,'York AI services and access descriptions.'],['operations',D,'Tool list and classification presentation.'],['github',D,'York enterprise coding-assistant service.'],['data',C,'Related Microsoft 365 data conditions.']],
  'tools','UIT service owners + Information Security','Maintain one task-filtered tool register; listing a product must not imply approval for all uses.',1);
need('classify-data','Determine the classification of information I want to use','Staff|Researchers|Instructors','Tools & data',
  'I need to classify the information in my task so that I can apply the right AI data-handling restrictions.',
  'The user can distinguish public, internal, confidential and regulated information using the authoritative classification definitions.',
  'Addressed','The formal standard and service guidance explain classifications; the standard is not itself a tool approval matrix.',
  [['classification',D,'Authoritative information categories.','Information Security Classification Categories'],['data',D,'Applied definitions and examples for Microsoft 365.'],['operations',C,'AI use of category labels.']],
  'tools','Information Security','Link the formal definitions from a single data decision guide.');
need('input-permission','Determine whether I may put particular data into a tool','Staff|Researchers|Instructors','Tools & data',
  'I need to determine whether my information may be entered into a specific AI service so that I do not disclose it through an unsuitable tool.',
  'The user can match data class, purpose, licence, sign-in state and configuration to an approved handling rule.',
  'Partially addressed','Rules and matrices are present, but not unified; the audit could not establish all visual allow/deny states or live configurations.',
  [['data',D,'Service-level data handling guidance.'],['operations',D,'AI tool/data-class matrix presentation.'],['tools',D,'Public-platform warning and sanctioned-service guidance.'],['guidelines',D,'Assessment-dependent handling restrictions.'],['classification',C,'Category definitions.']],
  'tools','Information Security + privacy office + UIT','Publish one accessible, owner-approved decision route with explicit conditions; do not infer permissions from the number of sources.',0);
need('retention','Know what happens to my AI inputs after use','Staff|Students|Researchers','Privacy',
  'I need to know how my AI inputs are retained or accessed so that I can make an informed privacy decision.',
  'The relevant service record provides current retention, access and model-training conditions for the actual licence/configuration.',
  'Partially addressed','UIT and SAVY make privacy statements, including absolute assertions; the audit did not verify current service configurations or vendor conditions.',
  [['tools',D,'Retention, administrator-visibility and model-training FAQ claims.'],['savy',D,'Student assistant privacy claims.'],['assistants',C,'Administrative meeting-content risks.']],
  'tools','Privacy office + UIT service owners + Student Services','Review each claim against the actual enterprise configuration and publish scoped, dated conditions.',0);
need('access-tool','Obtain access to an AI tool I am eligible to use','Staff|Instructors|Researchers','Tool access',
  'I need an actionable access route for an eligible AI service so that I can start using the sanctioned service.',
  'The user can identify the sign-in or request route and any eligibility conditions for the selected service.',
  'Partially addressed','Service access routes exist, but some destinations could not be inspected and the routes differ by product.',
  [['tools',D,'Copilot sign-in and licence-request routes.'],['github',D,'Enterprise coding service access.'],['zoom-help',U,'Linked activation instructions could not be retrieved.']],
  'tools','UIT service owners','Expose one product-specific access action per tool and verify each destination.',1);
need('licence-cost','Know the cost of the AI licence I need','Staff|Managers','Tool access',
  'I need to know the cost and charging basis of a required AI licence so that I can obtain the necessary budget approval.',
  'The user can locate current owner-reviewed price, charging period and applicable purchasing conditions for the selected licence.',
  'Partially addressed','The services page gives Microsoft 365 Copilot pricing, but this is not a comprehensive or independently price-validated catalogue.',
  [['tools',D,'Microsoft 365 Copilot pricing and charging conditions.'],['github',C,'A different enterprise service whose terms should not be inferred from M365.']],
  'tools','UIT service owners + relevant budget owner','Store time-sensitive licence costs in owner-maintained tool records with review dates.');
need('enterprise-coding','Identify which coding-assistant licence is permitted for York work','Developers|Staff|Instructors','Tool access',
  'I need to identify the appropriate coding-assistant licence so that a personal subscription is not mistaken for York enterprise approval.',
  'The user distinguishes GitHub Copilot Enterprise from personal GitHub Copilot and from Microsoft 365 Copilot.',
  'Addressed','Dedicated enterprise service information and the initiative page distinguish institutional and personal licensing.',
  [['github',D,'Enterprise GitHub Copilot service.'],['operations',D,'Explicit warning about personal licences.','Personal GitHub Copilot licenses'],['tools',S,'Routes to the coding service.']],
  'tools','UIT GitHub service owner','Present the coding product as a distinct catalogue entry with institutional-use conditions.',1);
need('meeting-consent','Know whether I may enable an AI assistant in this meeting','Staff|Managers','Meetings',
  'I need to determine whether an AI assistant may be enabled in an administrative meeting so that the participants and meeting context are respected.',
  'The organiser can apply approval, participant consent and meeting-sensitivity requirements before enabling the assistant.',
  'Addressed','The administrative supplement addresses this need, but activation guidance is elsewhere and the scope must remain non-academic.',
  [['assistants',D,'Administrative meeting approval and consent requirements.','Meeting Participant Consent'],['tools',S,'Tool description and activation route.'],['zoom-security',C,'General meeting security guidance.']],
  'tools','VPFA guideline owner + UIT + privacy office','Place the scoped consent checklist directly beside activation instructions.',1);
need('meeting-object','Decline AI capture of an administrative meeting','Staff|Managers','Meetings',
  'I need to know what happens if I object to an AI meeting assistant so that my objection can be respected.',
  'The participant can identify the administrative guideline requirement that the assistant not be used if any participant objects.',
  'Addressed','The administrative supplement directly states the effect of an objection; this does not establish a general academic recording rule.',
  [['assistants',D,'Explicit participant objection condition.','objects to its use'],['teaching',C,'Educational choice is related but has a different scope.']],
  'tools','VPFA guideline owner + meeting organiser','Make the objection rule visible to participants before the meeting.');
need('meeting-summary','Handle an AI-generated meeting summary appropriately','Staff|Managers','Meetings',
  'I need to handle an AI meeting summary appropriately so that inaccurate or sensitive meeting information is not distributed carelessly.',
  'The organiser can apply the administrative guideline requirements for verifying and sharing the generated summary.',
  'Addressed','The administrative supplement supplies summary-management guidance; generic product capability descriptions are not a substitute.',
  [['assistants',D,'Generated summary verification and management.','Generated Summary Verification'],['tools',C,'Product features and general assurances.']],
  'tools','VPFA guideline owner + meeting organiser + privacy office','Expose the summary-handling instructions in the meeting-assistant task route.');
need('operational-oversight','Know when my proposed AI use requires oversight','Staff|Managers','Governance',
  'I need to determine the oversight required for a proposed operational AI use so that I do not make a consequential use without appropriate review.',
  'The user can distinguish generally permissible, oversight-required and impermissible uses within the guideline scope.',
  'Addressed','Operational guidelines and initiative examples address the same decision need.',
  [['guidelines',D,'Use-case assessment and management review.'],['operations',D,'Operational use-case assessment examples.'],['assistants',C,'Additional rules for administrative assistants.']],
  'about','VPFA guideline owner + relevant manager','Provide one scoped use-case assessment route and link additional specialist requirements.',1);
need('request-approval','Find how to request approval for a new AI assistant','Staff|Managers','Governance',
  'I need to find the approval route for a proposed new AI assistant so that I do not deploy an unapproved tool.',
  'The requester can reach the correct assessment intake and understand the information needed for that request.',
  'Partially addressed','The administrative supplement directs users to CTRA, but the intake and its full requirements were not inspected in this audit.',
  [['assistants',S,'Names the CTRA intake route for new assistants.','CTRA intake form'],['operations',C,'General cybersecurity assessment expectations.']],
  'tools','Information Security + UIT assessment owners','Expose the verified intake action and publish a public preparation checklist; confirm scope beyond administrative assistants.',1);
need('current-rule','Identify the current rule that applies to my AI use','Everyone','Governance',
  'I need to identify the current authoritative rule for my context so that I do not act on a superseded draft or a rule for a different activity.',
  'The user can distinguish authority, scope, effective date and historical status of relevant policy or guidance.',
  'Conflicting answers','Current routes expose differently dated operational documents, and historical academic wording still appears in current guidance.',
  [['governance',S,'Links the governance-selected operational documents.'],['guidelines',D,'Approved/revised administrative guideline metadata.'],['policy',D,'Formal academic policy and dates.'],['draft',H,'Older DRAFT-named edition still reachable and linked.'],['senate-2023',H,'Historical committee statement, not a policy.'],['laps',C,'A current route to older guidance.']],
  'about','Relevant policy authorities + central web owner','Publish a policy register with explicit scope, authority and supersession confirmed by each owner.',0);
need('assessment-design','Preserve intended learning outcomes in assessment design','Instructors','Teaching',
  'I need to design assessment for the presence of AI so that the assessed work still demonstrates the intended learning.',
  'The instructor can choose an assessment approach justified by the learning outcomes rather than a blanket assumption about AI.',
  'Addressed','Commons, central instructor guidance and LA&PS provide overlapping but contextually useful pedagogical resources.',
  [['integrity-instructors',D,'Assessment approaches and learning-oriented responses.'],['faculty',D,'Instructor educational guidance.'],['tc-resources',D,'Assessment examples and critical pedagogical resources.'],['laps-scaffold',D,'Scaffolded AI and assessment practice.']],
  'teaching','Teaching Commons + academic integrity office + faculty teaching leads','Index pedagogical examples by the learning need; reuse common policy guidance.');
need('course-design','Use AI to prototype a course component','Instructors','Teaching',
  'I need to prototype a course component with AI so that I can evaluate a draft before deciding what belongs in my teaching.',
  'The instructor can adapt and critically review a relevant example without treating the generated draft as final course content.',
  'Addressed','The LA&PS toolkit and Commons resources provide practical examples, not just high-level principles.',
  [['laps-design',D,'Course-design prompts, learning goals and rubric examples.'],['tc-resources',D,'Pedagogical examples and frameworks.'],['ethics',C,'Ethical review context.']],
  'teaching','Faculty teaching leads + Teaching Commons','Retain practical examples, tagged to the task and learning context.');
need('prompting','Express my task effectively in an AI prompt','Students|Researchers|Staff|Instructors','AI literacy',
  'I need to express my task clearly to an AI tool so that I can critically evaluate a more relevant response.',
  'The user can form a prompt with context, goal and constraints appropriate to the task.',
  'Addressed','UIT templates, research prompting and course-design examples serve one general skill with different contexts.',
  [['prompts',D,'Operational prompt collection.'],['library-prompts',D,'Research-oriented strategies.','CLEAR'],['laps-design',D,'Course-design prompt examples.']],
  'learn','UIT + Libraries + teaching leads','Share the prompting basics and preserve specialised examples in one indexed collection.');
need('teaching-development','Find professional development for teaching with AI','Instructors|Teaching assistants','Learning & support',
  'I need to find suitable AI teaching development so that I can improve my educational practice.',
  'The user can identify a relevant workshop, course, certificate or self-paced resource and its access route.',
  'Addressed','Teaching Commons has a dedicated development offer; central and faculty pages can point to it rather than reproduce calendars.',
  [['tc',D,'Teaching development and community entry point.'],['tc-self',D,'Self-paced teaching learning.'],['tc-resources',S,'Resource and recording collection.']],
  'learn','Teaching Commons','Syndicate offerings into a common learning catalogue with format and eligibility.');
need('staff-training','Find AI training relevant to my staff role','Staff|Managers','Learning & support',
  'I need to identify suitable AI training for my work role so that I can use the tools responsibly.',
  'The user can confirm the relevant offering, eligibility and access route.',
  'Unverified coverage','Public pages name staff and manager packages, but both YU Learn destinations returned HTTP 500 and their contents were not inspected.',
  [['tools',S,'Public descriptions and links to training.'],['operations',S,'Public learning-resource routes.'],['staff-learning',U,'Package content not inspected.'],['manager-learning',U,'Manager recording content not inspected.']],
  'learn','HR learning + UIT','Verify the destinations and publish useful public abstracts without claiming the training is absent.',1);
need('graduate-agreement','Agree acceptable AI use in my thesis or dissertation','Graduate researchers|Supervisors','Research practice',
  'I need to agree acceptable AI use with my supervisory team so that my thesis or dissertation meets disciplinary expectations.',
  'The student and supervisory team establish an explicit understanding before the relevant research or writing activity.',
  'Addressed','Graduate-specific guidance is present but hosted under the educational site and also referenced by research information.',
  [['graduate',D,'Explicit advice to consult the supervisor/supervisory committee.','Talk to your supervisor'],['research',S,'Routes to graduate research guidance.'],['policy',C,'Academic conduct context.']],
  'research','Graduate Studies + graduate programmes','Expose one canonical graduate decision pathway from both teaching and research.');
need('scholarly-tools','Choose a suitable AI scholarly-discovery tool','Students|Researchers','Research practice',
  'I need to assess an AI scholarly-discovery tool so that its coverage and limitations suit my research task.',
  'The user can assess scholarly coverage, cost and limitations without mistaking a Library description for enterprise approval.',
  'Addressed','A dedicated Library workflow chapter supplies the research-task perspective.',
  [['library-workflow',D,'Research discovery/workflow tools and caveats.'],['library-genai',S,'Guide entry point.'],['tools',C,'Separate institutionally sanctioned service context.']],
  'research','Libraries + research support','Keep research-tool evaluation distinct from University data/approval decisions.');
need('funder-rules','Determine a funder AI restriction for my proposal','Researchers','Research practice',
  'I need to determine the applicable funder rule on AI use in my proposal so that the submission complies with that funder requirements.',
  'The researcher locates the current applicable funder statement and knows which part of the proposal process it governs.',
  'Partially addressed','York pages signpost external funder material; those external rules and their current status were not audited.',
  [['research',S,'Links external funding-agency AI guidance.'],['graduate',S,'Links research-sector guidance.']],
  'research','Research & Innovation','Maintain a dated external-rule signpost with explicit scope; verify external content before summarising it.',1);
need('research-expertise','Find York expertise relevant to my AI research question','Researchers|Partners|Prospective students','Research discovery',
  'I need to find relevant York AI research expertise so that I can identify a suitable collaborator or research environment.',
  'The user can identify a relevant centre/lab and follow its authoritative expertise/contact route.',
  'Addressed','Several directories and centre sites support discovery, but have different disciplinary scopes.',
  [['research',D,'University research landscape.'],['cais',D,'Interdisciplinary AI and society centre.'],['minds',D,'Human and machine systems initiative.'],['bccc',D,'AI-related cybersecurity research.'],['labs',D,'EECS lab directory.'],['facilities',D,'Engineering centres/facilities.'],['responsible-lab',D,'Responsible-AI research lab.'],['its',C,'Broader critical technoscience research.'],['library-ai',S,'Related York research pointers.']],
  'research','Research & Innovation + centre/lab owners','Maintain one searchable expertise index while keeping detailed research sites with their owners.');
need('ai-subject-research','Find scholarly sources about AI as a subject','Students|Researchers','Research discovery',
  'I need to find scholarly literature about AI so that I can investigate an AI-related research question.',
  'The user can locate appropriate disciplinary databases, books or journals without confusing this with advice on using AI to do research.',
  'Addressed','The Library AI subject guide is a distinct answer from the guide to research with GenAI.',
  [['library-ai',D,'Subject bibliography across disciplines.','About This Guide'],['library-genai',C,'A different guide for using AI in the research process.']],
  'research','Libraries','Label research ON AI separately from research WITH AI.');
need('research-funding','Find an AI-related research funding opportunity','Researchers|Graduate researchers','Research discovery',
  'I need to find a relevant AI-related research funding opportunity so that I can assess whether to apply.',
  'The user can reach the opportunity owner and verify current eligibility, deadline and application instructions.',
  'Partially addressed','Connected Minds supplies opportunity routes, but not every individual funding record was analyst-reviewed and one scholarship destination failed retrieval.',
  [['minds',S,'Initiative routes to awards and opportunities.'],['research',C,'University research landscape context.']],
  'research','Connected Minds + Research & Innovation','Aggregate opportunity metadata from owners; do not infer that a listed call remains open.');
need('degree-pathway','Find a York degree pathway relevant to my AI goals','Prospective students','Study & careers',
  'I need to identify a suitable AI-related degree pathway so that I can make an informed study choice.',
  'The user can reach the programme owner for current curriculum, admission and application requirements.',
  'Partially addressed','Multiple MMAI surfaces address the same choice, while a legacy EECS specialisation link no longer lands on the intended programme.',
  [['mmai',D,'MMAI programme home.'],['mmai-admissions',D,'Admissions overview for the same degree.'],['mmai-campaign',D,'Marketing route for the same degree.'],['mban',D,'Related analytics degree, not identical to an AI degree.'],['eecs-old',U,'Legacy specialisation destination is generic.'],['research',S,'Programme links in research landscape.'],['library-ai',S,'Repeated programme pointers.']],
  'study','Admissions + relevant Faculties','Use canonical programme metadata and preserve distinct application journeys.');
need('professional-credential','Find an AI-related professional credential','Professionals|Prospective students','Study & careers',
  'I need to find a suitable AI-related professional credential so that I can develop skills relevant to my work.',
  'The user can distinguish programme purpose and confirm current enrolment details with the provider.',
  'Partially addressed','AI Governance and data-learning programmes are described; a Machine Learning programme link returned 404.',
  [['ai-governance-course',D,'AI governance credential.'],['bigdata',D,'Related professional data-learning pathways.'],['ml-broken',U,'Linked Machine Learning programme destination returned 404.'],['research',S,'Repeated certificate directory links.']],
  'study','Continuing Studies','Keep programme status current; distinguish fee-based credentials from internal staff training and internal policy.');
need('commercialisation','Find support to commercialise an AI-related idea','Researchers|Students|Partners','Innovation',
  'I need to find entrepreneurship support for an AI-related idea so that I can assess a route towards application or commercialisation.',
  'The user can identify a relevant support programme and follow its intake/eligibility route.',
  'Addressed','Research information signposts the existing entrepreneurship ecosystem rather than providing a separate AI-only service.',
  [['best',D,'Entrepreneurship support destination.'],['research',S,'AI entrepreneurship entry point.'],['minds',C,'Related research collaboration context.']],
  'research','Innovation/entrepreneurship service owners','Use a shared innovation-support entry and keep actual service intake at source.');
need('ip-support','Find specialist help for an AI-related IP question','Researchers|Entrepreneurs|Partners','Innovation',
  'I need to find specialist intellectual-property support for my AI-related work so that I can obtain advice through the appropriate service.',
  'The user reaches a qualified service and can check its eligibility and intake, without treating the hub as legal advice.',
  'Addressed','The IP Innovation Clinic is a specialist destination; general ethics information is not a substitute.',
  [['ip',D,'Specialist IP clinic and service route.'],['research',S,'Entrepreneurship signpost.'],['ethics',C,'General copyright/ethical context.']],
  'research','IP Innovation Clinic + innovation support','Retain the specialist service and publish a clear eligibility-aware pointer.');
need('legal-research','Find AI-use guidance specific to legal research','Law students|Researchers','Research practice',
  'I need to find discipline-specific AI-use guidance for legal research so that I can apply the relevant professional and academic expectations.',
  'The user reaches current law-library guidance appropriate to the jurisdiction and research task.',
  'Unverified coverage','The York research page describes a relevant law guide, but that destination returned 404. General AI-and-law commentary does not verify replacement guidance.',
  [['research',S,'Describes the intended law-specific guidance.'],['osgoode-broken',U,'Described guide returned 404.']],
  'research','Osgoode law library + Research & Innovation web owner','Confirm the intended replacement with the law library; do not declare the underlying need institution-wide unmet.',1);
need('student-navigation','Find the correct York student-service information','Students','Learning & support',
  'I need to locate the relevant student service so that I can take the next step on a University administrative question.',
  'The user knows which questions SAVY can address and when a human service or another channel is needed.',
  'Addressed','The SAVY service page explains its role and limits; it does not replace an adviser.',
  [['savy',D,'Student assistant scope, exclusions and support context.','SAVY serves'],['tools',S,'Describes SAVY as an AURA agent.']],
  'tools','Student Services + UIT','Preserve the student-facing service explanation and reference it from the tool catalogue.');
need('technical-help','Find technical support for an AI service problem','Staff|Instructors|Students','Learning & support',
  'I need to reach support for an AI service problem so that I can get help through the appropriate service channel.',
  'The user can identify the support/request route for the affected service.',
  'Addressed','UIT publishes service support routes and SAVY has its own support context; the actual ticket workflows were not inspected.',
  [['tools',D,'Public service request and contact routes.'],['savy',D,'Virtual assistant technical help route.'],['github',C,'Product-specific access/support information.']],
  'learn','UIT support + Student Services','Put the relevant support action on each service record; do not equate generic technical support with an AI-harm complaint process.');
need('non-ai-alternative','Obtain a non-AI learning route without disadvantage','Students','Choice & access',
  'I need an appropriate non-AI alternative when AI use is proposed for learning so that my choice not to use it does not disadvantage me.',
  'The user understands the choice principle and can identify how to arrange a suitable alternative in the relevant course.',
  'Partially addressed','The educational choice principle explicitly supports alternatives, but a universal request/escalation process was not established in the reviewed guidance.',
  [['teaching',D,'Explicit non-AI option and no-disadvantage principle.','Opting out'],['ethics',C,'Educational access/values context.'],['students',C,'Student learning context.']],
  'teaching','Teaching & Learning + course instructor','Add an actionable course-level request route and clarify where unresolved requests go.');
need('french-guidance','Understand applicable York AI guidance in French','Students|Staff|Instructors','Choice & access',
  'I need to understand applicable York AI guidance in French so that language does not prevent me from finding the right answer.',
  'A French-speaking user can reach equivalent, current guidance for the same core task.',
  'Unverified coverage','French SPARK routes were retrieved, but full French-language parity across policy explanations and tool tasks was not audited.',
  [['spark-cite',S,'Related French-language citation route discovered.'],['spark-use',S,'Related French-language responsible-use route discovered.'],['teaching',C,'Access and choice principles provide context, not proof of translation parity.']],
  'start','Central web owner + bilingual content owners','Validate priority French-language needs and audit task-by-task parity before calling any translation absent.',2,true);
need('ai-harm-report','Report harmful behaviour from a York AI service','Everyone','Recourse & incidents',
  'I need to report harmful behaviour from a York AI service so that an accountable owner can investigate it.',
  'The user can identify a reporting route, required information and the responsible follow-up owner for AI-related harm.',
  'Potential gap','Generic service support and ethical cautions were found, but no dedicated AI-harm reporting workflow was identified in the reviewed AI guidance. Another institutional process may exist outside the corpus.',
  [['tools',C,'Generic technical service request is a possible entry point, not verified harm handling.'],['ethics',C,'Recognises AI risks but does not establish a complaint workflow.'],['guidelines',C,'Accountability principles are relevant but are not an end-user reporting procedure.']],
  'learn','Proposed: hub owner + UIT + relevant equity/privacy/service owners','Confirm existing reporting processes and user demand; publish one scope-aware entry route if a gap is confirmed.',1,true,
  { scopeIds:['tools','savy','ethics','guidelines','assistants','operations','students','integrity-students'], terms:['complaint','report harm','harmful','incident','support'], limitation:'Keyword hits were inspected as context; a generic support link or an IT incident-automation roadmap is not proof of an AI-harm complaint workflow.' });
need('data-disclosure-response','Know the immediate response to accidental disclosure through AI','Staff|Researchers|Instructors','Recourse & incidents',
  'I need to know the immediate response after accidentally putting sensitive information into an AI tool so that the disclosure can be contained and assessed.',
  'The user can identify whom to notify and the immediate approved steps for a suspected AI-related data disclosure.',
  'Potential gap','Preventive data-handling guidance is present; an AI-specific first-response route was not identified in the reviewed AI content. Existing Information Security or privacy incident procedures may already cover this.',
  [['tools',C,'Prevention warnings and generic support routes.'],['guidelines',C,'Data protection obligations, not a verified first-response procedure.'],['data',C,'Handling rules, not incident instructions.'],['classification',C,'Data categories help assess the concern but do not supply response steps.']],
  'tools','Proposed: Information Security + privacy office + UIT support','Check the existing incident process first; surface its approved first-response instructions in the AI data task route.',1,true,
  { scopeIds:['tools','operations','guidelines','assistants','data','classification','savy'], terms:['incident','accidental','breach','report','notify'], limitation:'The broader Information Security website and protected response procedures were not exhaustively audited; this is a discoverability/content hypothesis, not proof that no incident process exists.' });
need('human-review','Request human review of an AI-informed decision affecting me','Students|Staff','Recourse & incidents',
  'I need to request human review of an AI-informed decision that affects me so that I can challenge an inappropriate outcome.',
  'The affected person can identify an applicable review/appeal route and its accountable human decision owner.',
  'Potential gap','Guidance requires human oversight and limits consequential uses, but no AI-specific affected-person recourse route was identified in the reviewed content. General academic/employment appeals may apply.',
  [['guidelines',C,'Human oversight and prohibited consequential uses.'],['operations',C,'Use-case restrictions and oversight examples.'],['policy',C,'Academic procedures exist, but this does not establish a general AI decision-appeal process.']],
  'about','Proposed: relevant decision owner + appropriate academic/administrative policy authority','Validate actual decision contexts and existing appeal processes before creating a new route; make applicable recourse discoverable.',1,true,
  { scopeIds:['guidelines','operations','assistants','tools','students','policy'], terms:['human oversight','appeal','reconsider','contest','review'], limitation:'Academic appeal and review keyword hits do not by themselves establish recourse for all AI-informed decisions. The audit did not establish that such decisions are actually being made.' });
need('governance-contact','Understand who coordinates York approach to AI','Everyone','Governance',
  'I need to understand who coordinates York approach to AI so that I can locate the relevant institutional governance context.',
  'The user can distinguish institutional coordination from the formal approval authority for a particular rule or tool.',
  'Addressed','AI @ York explains the Roundtable, while UIT supplies an IT governance context. Neither should be assumed to approve every policy.',
  [['hub',D,'AI Roundtable coordination description.'],['governance',D,'IT governance context.'],['taskforce',U,'Historical task-force destination is not the current coordinating body.']],
  'about','Central AI web owner + relevant governance bodies','Publish a concise governance map distinguishing coordination, content ownership and formal approval.');

const coverageOrder = ['Conflicting answers','Potential gap','Unverified coverage','Partially addressed','Addressed'];
const roles = [D,C,S,U,H];
const normalise = value => String(value || '').replace(/\s+/g,' ').trim();
function buildNeeds(records, texts, needDefinitions = definitions) {
  const byId = new Map(records.map(r=>[r.id,r]));
  const ids = new Set();
  return needDefinitions.map(def => {
    if(ids.has(def.id)) throw new Error('Duplicate need ID: '+def.id);
    ids.add(def.id);
    if(!coverageOrder.includes(def.coverage)) throw new Error('Invalid need coverage: '+def.id);
    const mapped = new Set();
    const mappings = def.sources.map(([resourceId,role,rationale,term])=>{
      const resource = byId.get(resourceId);
      if(!resource) throw new Error('Unknown need resource: '+resourceId);
      if(mapped.has(resourceId)) throw new Error('Duplicate resource mapping: '+def.id+' / '+resourceId);
      mapped.add(resourceId);
      if(!roles.includes(role) || !rationale) throw new Error('Invalid mapping role/rationale: '+def.id);
      if(role === D && (!resource.curated || !resource.excerpt)) throw new Error('Unverified or untriaged resource cannot directly answer a need: '+resourceId);
      if(role === U && resource.excerpt) throw new Error('Verified content incorrectly marked unverified: '+resourceId);
      const text = normalise(texts.get(resourceId));
      let quote = '';
      if(term) {
        const index = text.toLowerCase().indexOf(term.toLowerCase());
        if(index<0) throw new Error('Need evidence anchor missing: '+def.id+' / '+resourceId+' / '+term);
        const start=Math.max(0,index-50),end=Math.min(text.length,index+300);
        quote=(start?'...':'')+text.slice(start,end)+(end<text.length?'...':'');
      }
      return {resourceId,role,rationale,quote};
    });
    const directCount = mappings.filter(m=>m.role===D).length;
    if(def.coverage==='Addressed' && directCount===0) throw new Error('Addressed need has no verified direct answer: '+def.id);
    if(def.coverage==='Conflicting answers' && directCount<2) throw new Error('Conflict needs at least two direct answer instances: '+def.id);
    if(def.coverage==='Potential gap' && (directCount || !def.gapSearch || def.basis!=='Hypothesised need')) throw new Error('Gap needs bounded search evidence and no verified direct answer: '+def.id);
    if(def.gapSearch && (!Array.isArray(def.gapSearch.scopeIds) || !def.gapSearch.scopeIds.length || !Array.isArray(def.gapSearch.terms) || !def.gapSearch.terms.length || !def.gapSearch.limitation)) throw new Error('Gap search must specify sources, terms and limitations: '+def.id);
    const search=def.gapSearch ? {
      ...def.gapSearch,
      results:def.gapSearch.terms.map(term=>({term,resourceIds:def.gapSearch.scopeIds.filter(id=>{
        if(!byId.has(id)) throw new Error('Unknown gap-search source: '+id);
        return normalise(texts.get(id)).toLowerCase().includes(term.toLowerCase());
      })}))
    } : null;
    const {sources,gapSearch,...rest}=def;
    return {...rest,mappings,directCount,contentCount:mappings.length,gapSearch:search};
  });
}
module.exports = {buildNeeds,coverageOrder};
