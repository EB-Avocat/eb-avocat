/**
 * Checks `copy.ts` against the editorial guide (spec §3, guide §8) and against `copy.md`.
 *
 *   bun .orchestrator/features/redesign-copywriting-proof-and-editorial/check-copy.ts [--self-test]
 *
 * Prints one line per failure (`rule key: detail`) and exits 1 if there is any. `--self-test` runs
 * each rule on a small bad fixture and fails if a rule does not fire.
 *
 * Rules
 * - acronym     a GLOSSARY acronym used on a page before its inline gloss on that page; an h1 or meta
 *               may use it when the page's lead (first paragraph) glosses it (guide §4.1 rule 2)
 * - nav-length  nav label > 12 characters
 * - cta-length  CTA / button label > 22 characters
 * - cta-rdv     « rendez-vous » or « rdv » in a CTA
 * - meta-length meta title > 60, meta description > 155 characters
 * - nbsp        no U+00A0 before » : ; ? ! or after «
 * - third-person « Eva », « Biezunski », « Mme », « Maître » outside the identification places, and
 *               « nous / notre / nos » anywhere but the legal pages (guide §1.1; « nous » is allowed
 *               when it means « vous et moi »)
 * - word-list   « e-mail », « courriel », « clientèle/patientèle », « Cabinet », « n’hésitez pas »,
 *               « cliquez ici » outside the legal pages (guide §2, §8)
 * - link-label  « en savoir plus », « lire la suite », « découvrir », « ici » as a whole label
 * - marker      `[À CONFIRMER` left
 * - apostrophe  straight ' in French text
 * - unmapped    a copy key that belongs to no page (so no rule would see it)
 * - md-parity   a `copy.md` quote block that differs from copy.ts, or a copy.ts key with no block
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import * as COPY from "./copy.ts";

type Copy = Record<string, unknown>;
type Leaf = { path: string; text: string };
type Glossary = readonly { term: string; inline: string; acronym: boolean }[];
type Failure = { rule: string; key: string; detail: string };
/** A page: patterns of keys in reading order. `head` = meta + h1, `lead` = first paragraph. */
type Page = { name: string; head: string[]; lead?: string; body: string[] };

const NBSP = "\u00A0";

// ---------------------------------------------------------------------------------------------
// Flattening

/** Placeholder args for runtime functions: `({ date }) => …` gives `{{date}}`, as in copy.md. */
const PLACEHOLDERS = new Proxy({}, { get: (_t, k) => `{{${String(k)}}}` });

/** Not copy: values no rule applies to (URLs, colours, ids, raw contact data). */
const NON_COPY = [
	/\.(slug|href|url|variant)$/,
	/^BRAND_COLORS\./,
	/^(REVIEW_URL|LINKEDIN_URL)$/,
	/^CONTACT\.(phone|email)$/,
];

/** Every string leaf, with its copy.md-style key: arrays of objects with a slug use `[slug]`. */
function flatten(value: unknown, path: string, out: Leaf[]): Leaf[] {
	if (typeof value === "function") return flatten(value(PLACEHOLDERS), path, out);
	if (typeof value === "string") {
		if (!NON_COPY.some((re) => re.test(path))) out.push({ path, text: value });
	} else if (Array.isArray(value)) {
		value.forEach((v, i) => {
			const slug = v && typeof v === "object" && "slug" in v ? (v as { slug: string }).slug : i;
			flatten(v, `${path}[${slug}]`, out);
		});
	} else if (value && typeof value === "object") {
		for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
	}
	return out;
}

/** `pattern` covers `path` if it is the same key or a parent of it; `[*]` matches any index. */
const coverRes = new Map<string, RegExp>();
function covers(pattern: string, path: string): boolean {
	let re = coverRes.get(pattern);
	if (!re) {
		const src = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[\\\*\\\]/g, "\\[[^\\]]+\\]");
		re = new RegExp(`^${src}(?=$|[.[])`);
		coverRes.set(pattern, re);
	}
	return re.test(path);
}

const select = (leaves: Leaf[], patterns: string[]) => {
	const seen = new Set<string>();
	const out: Leaf[] = [];
	for (const p of patterns)
		for (const l of leaves)
			if (!seen.has(l.path) && covers(p, l.path)) {
				seen.add(l.path);
				out.push(l);
			}
	return out;
};

// ---------------------------------------------------------------------------------------------
// Pages (reading order, copy.md §1–§12 and IA page orders)

function buildPages(copy: Copy): Page[] {
	const slugs = (copy.DOMAINES as { items: readonly { slug: string }[] }).items.map((d) => d.slug);
	const band = (line: string) => ["CONTACT_BAND.heading", `CONTACT_BAND.lines.${line}`, "CONTACT_BAND.cta", "CONTACT_BAND.phoneLead"];
	const domainePage = (s: string): Page => {
		const d = `DOMAINES.items[${s}]`;
		return {
			name: `/domaines/${s}`,
			head: [`${d}.metaTitle`, `${d}.metaDescription`, `${d}.h1`],
			lead: `${d}.lead`,
			body: [
				`${d}.label`,
				`${d}.lead`,
				"DOMAINES.template.forWhom",
				`${d}.forWhom`,
				"DOMAINES.template.whatIDo",
				`${d}.whatIDo`,
				`${d}.forms`,
				`${d}.contentieux`,
				"DOMAINES.template.how",
				`${d}.how`,
				"DOMAINES.template.situations",
				"DOMAINES.template.exampleLabel",
				`${d}.situations`,
				"DOMAINES.template.faq",
				`${d}.faq`,
				"DOMAINES.template.related",
				"DOMAINES.template.others",
				...slugs.filter((o) => o !== s).map((o) => `DOMAINES.items[${o}].label`),
				`${d}.band`,
				...band(s),
			],
		};
	};
	return [
		{
			name: "global (header, footer, breadcrumb, review links)",
			head: ["SITE.name", "SITE.titleSuffix"],
			body: ["HEADER", "NAV_LINKS", "BREADCRUMB", "DOMAINES.items[*].label", "FOOTER", "REVIEW"],
		},
		{
			name: "/",
			head: ["SITE.title", "SITE.description", "HOME.metaTitle", "HOME.metaDescription", "HERO.heading"],
			lead: "HERO.subheading",
			body: [
				"HERO",
				"HOME.domaines.heading",
				"DOMAINES.items[*].label",
				"DOMAINES.items[*].card",
				"HOME.domaines",
				"HOME.proof",
				"PROOF",
				"HOME.publications",
				"FIRST_CONTACT",
				...band("home"),
			],
		},
		{
			name: "/domaines",
			head: ["DOMAINES.hub.metaTitle", "DOMAINES.hub.metaDescription", "DOMAINES.hub.h1"],
			lead: "DOMAINES.hub.lead",
			body: [
				"DOMAINES.hub.lead",
				"DOMAINES.hub.forWhom",
				// Each card, or its hub section if the page missed the launch gate (copy.md §3.4).
				...slugs.flatMap((s) => [`DOMAINES.items[${s}].label`, `DOMAINES.items[${s}].card`, `DOMAINES.items[${s}].hubSection`]),
				...band("domaines"),
			],
		},
		...slugs.map(domainePage),
		{
			name: "/a-propos",
			head: ["ABOUT.metaTitle", "ABOUT.metaDescription", "ABOUT.h1"],
			lead: "ABOUT.lead",
			body: ["ABOUT.lead", "ABOUT.portrait", "ABOUT.parcours", "ABOUT.approche", "ABOUT.paragraphs", "ABOUT.sectionTitle", "PROOF.reviews", "PROOF.rating", "ABOUT.publications", ...band("aPropos")],
		},
		{
			name: "/contact",
			head: ["CONTACT.metaTitle", "CONTACT.metaDescription", "CONTACT.h1"],
			lead: "CONTACT.intro",
			body: ["CONTACT", "OTHER_SUBJECT"],
		},
		{
			name: "/publications",
			head: ["PUBLICATIONS.metaTitle", "PUBLICATIONS.metaDescription", "PUBLICATIONS.h1"],
			lead: "PUBLICATIONS.intro",
			body: ["PUBLICATIONS", ...band("publications")],
		},
		{
			name: "/publications/<article>",
			head: [],
			body: ["ARTICLE", "PUBLICATIONS.by", "PUBLICATIONS.categoriesLabel", "REVIEW.articleLine", "REVIEW.footerLink", "HEADER.cta"],
		},
		{ name: "404", head: ["NOT_FOUND.metaTitle"], body: ["NOT_FOUND"] },
		{ name: "error", head: [], body: ["ERROR_PAGE"] },
		{ name: "global-error", head: [], body: ["GLOBAL_ERROR"] },
		{ name: "/carte", head: ["QR_CARD.metaTitle"], body: ["QR_CARD"] },
		{ name: "/politique-de-confidentialite", head: [], body: ["PRIVACY"] },
		{ name: "glossary (tooltips)", head: [], body: ["GLOSSARY"] },
	];
}

// ---------------------------------------------------------------------------------------------
// Rules

const NAV_KEYS = [/^HEADER\.nav\./, /^NAV_LINKS\[\d+\]\.label$/];
const CTA_KEYS = [/(^|\.)[a-zA-Z]*[cC]ta$/, /^CONTACT\.formFields\.submit$/, /^QR_CARD\.(saveContact|visitWebsite)$/, /^HEADER\.call\.label$/];
const META_TITLE = [/\.metaTitle$/, /^SITE\.title$/];
const META_DESCRIPTION = [/\.metaDescription$/, /^SITE\.description$/];

/** Places where Eva is named in the third person (identification only, guide §1.1). */
const THIRD_PERSON_OK = [
	/\.(metaTitle|metaDescription)$/,
	/^SITE\./,
	/^HEADER\.logoLabel$/,
	/^FOOTER\.copyright$/,
	/^ARTICLE\.(byline|authorCard\.)/,
	/portrait\.alt$/,
	/^QR_CARD\.(title|metaTitle)$/,
	/^PRIVACY\./,
];
/** Approved sentences where « nous » means « vous et moi » without « ensemble » (guide §1.1). Matched
 * as whole sentences, so editing one needs a new review. */
const NOUS_YOU_AND_I = new Set([
	"Nous faisons le point sur votre profession, votre projet et vos associés éventuels.",
	"Vous relisez, nous ajustons.",
]);
/** Legal pages keep their own register (« le Cabinet », « nos sous-traitants », copy.md R4). */
const LEGAL = [/^PRIVACY\./];

/** Word list and fillers (guide §1.4, §2, §8), matched on `norm`ed text. */
const BANNED = [
	{ re: /(?<![\p{L}\p{N}])e-mail/u, what: "« e-mail » (use « email »)" },
	{ re: /(?<![\p{L}\p{N}])courriel/u, what: "« courriel » (use « email »)" },
	{ re: /clientèle\s*\/\s*patientèle|patientèle\s*\/\s*clientèle/u, what: "« clientèle/patientèle » (use « clientèle ou patientèle »)" },
	{ re: /n'hésitez pas/u, what: "« n’hésitez pas »" },
	{ re: /cliquez ici/u, what: "« cliquez ici »" },
];
/** Generic link labels, banned as a whole label (guide §2, §3.2). */
const GENERIC_LINK = /^(en savoir plus|lire la suite|découvrir|ici)$/u;

const word = (w: string, flags = "u") => new RegExp(`(?<![\\p{L}\\p{N}])(?:${w})(?![\\p{L}\\p{N}])`, flags);
const THIRD_PERSON = word("Eva|Biezunski|Mme|Maître");
const NOUS = word("nous|notre|nos", "iu");
const CABINET = word("Cabinet");
const RDV = word("rendez-vous|rdv", "iu");
/** Matching ignores case, apostrophe style and space style. */
const norm = (s: string) => s.replace(/’/g, "'").replace(/\u00A0/g, " ").toLowerCase();
const any = (res: RegExp[], path: string) => res.some((re) => re.test(path));

function checkAcronyms(page: Page, leaves: Leaf[], glossary: Glossary, fail: (f: Failure) => void) {
	// The glossary's own definitions are not uses.
	leaves = leaves.filter((l) => !covers("GLOSSARY", l.path));
	const head = select(leaves, page.head);
	const headPaths = new Set(head.map((l) => l.path));
	const body = select(leaves, page.body).filter((l) => !headPaths.has(l.path));
	const lead = page.lead ? leaves.find((l) => l.path === page.lead) : undefined;
	for (const g of glossary) {
		if (!g.acronym) continue;
		const re = word(g.term);
		const full = norm(g.inline.replace(` (${g.term})`, ""));
		const glossed = (text: string) => {
			const m = re.exec(text);
			return !!m && norm(text.slice(0, m.index)).endsWith(`${full} (`);
		};
		for (const l of head)
			if (re.test(l.text) && !(lead && glossed(lead.text)))
				fail({ rule: "acronym", key: l.path, detail: `${page.name}: « ${g.term} » in a heading or meta, but the lead does not gloss it as « ${g.inline} »` });
		const first = body.find((l) => re.test(l.text));
		if (first && !glossed(first.text))
			fail({ rule: "acronym", key: first.path, detail: `${page.name}: first use of « ${g.term} » is not glossed as « ${g.inline} »` });
	}
}

function runRules(copy: Copy, pages: Page[], leaves = flatten(copy, "", [])): Failure[] {
	const failures: Failure[] = [];
	const fail = (f: Failure) => failures.push(f);

	for (const { path, text } of leaves) {
		const len = [...text].length;
		if (any(NAV_KEYS, path) && len > 12) fail({ rule: "nav-length", key: path, detail: `${len} > 12 characters` });
		if (any(CTA_KEYS, path)) {
			if (len > 22) fail({ rule: "cta-length", key: path, detail: `${len} > 22 characters` });
			if (RDV.test(text)) fail({ rule: "cta-rdv", key: path, detail: "« rendez-vous » in a CTA" });
		}
		if (any(META_TITLE, path) && len > 60) fail({ rule: "meta-length", key: path, detail: `title ${len} > 60 characters` });
		if (any(META_DESCRIPTION, path) && len > 155) fail({ rule: "meta-length", key: path, detail: `description ${len} > 155 characters` });
		const sp = /(^|[^\u00A0])([:;?!»])|«(?!\u00A0)/.exec(text);
		if (sp) fail({ rule: "nbsp", key: path, detail: `no U+00A0 at « ${text.slice(Math.max(0, sp.index - 12), sp.index + 3).replace(/\u00A0/g, "⍽")} »` });
		if (!any(THIRD_PERSON_OK, path)) {
			const m = THIRD_PERSON.exec(text);
			if (m) fail({ rule: "third-person", key: path, detail: `« ${m[0]} » outside the identification places` });
		}
		// « nous » is banned everywhere, identification places included (the site has no team); only
		// the legal pages keep it.
		if (!any(LEGAL, path)) {
			for (const sentence of text.split(/(?<=[.?!…])\s+/)) {
				const n = NOUS.exec(sentence);
				if (n && !NOUS_YOU_AND_I.has(sentence) && !/ensemble/i.test(sentence)) fail({ rule: "third-person", key: path, detail: `« ${n[0]} »: the site has no team; use « je »` });
			}
			const n = norm(text);
			for (const b of BANNED) if (b.re.test(n)) fail({ rule: "word-list", key: path, detail: b.what });
			if (CABINET.test(text)) fail({ rule: "word-list", key: path, detail: "« Cabinet » with a capital C (use « le cabinet »)" });
			if (GENERIC_LINK.test(n.trim())) fail({ rule: "link-label", key: path, detail: `generic link label « ${text} »` });
		}
		if (text.includes("[À CONFIRMER")) fail({ rule: "marker", key: path, detail: "unresolved [À CONFIRMER marker" });
		if (text.includes("'")) fail({ rule: "apostrophe", key: path, detail: "straight apostrophe, use ’" });
	}

	const mapped = new Set(pages.flatMap((p) => select(leaves, [...p.head, ...p.body]).map((l) => l.path)));
	for (const l of leaves) if (!mapped.has(l.path)) fail({ rule: "unmapped", key: l.path, detail: "belongs to no page in buildPages()" });

	const glossary = (copy.GLOSSARY ?? []) as Glossary;
	for (const page of pages) checkAcronyms(page, leaves, glossary, fail);
	return failures;
}

// ---------------------------------------------------------------------------------------------
// Parity with copy.md

/** copy.ts keys with neither a quote block nor an `A = B` reference in copy.md: not compared. */
const NOT_IN_MD = [
	"ABOUT.parcours.items", // PROOF.credentials.items, then PROOF.professions
	"NAV_LINKS", // HEADER.nav with the #67 routes
	"OTHER_SUBJECT", // last of CONTACT.subjectOptions
	"CONTACT.address", // data (constants.ts)
	"CONTACT.addressParts",
	"CONTACT.phoneDisplay",
	"GLOSSARY", // editorial-guide §4
	// Unchanged keys, listed as prose (no quote block) in a note of copy.md §10.1:
	...["empty", "viewAll", "allCategories", "filterLabel", "moreCategories", "categoriesLabel", "readMore", "by", "previousPage", "nextPage", "pageLabel"].map((k) => `PUBLICATIONS.${k}`),
];

/** copy.md references `` `A` = `B` `` (copy.md §0): A must hold the same strings as B. */
function parseRefs(md: string) {
	const refs: { from: string; to: string }[] = [];
	for (const m of md.matchAll(/`([A-Z][A-Z_]*\.[^`]+)` = `([A-Z][A-Z_]*\.[^`]+)`(?!, then)/g)) refs.push({ from: m[1], to: m[2] });
	return refs;
}

/** `{ key, lines }` for every key followed by a quote block (copy.md §0 format). */
function parseMd(md: string) {
	const lines = md.split("\n");
	const blocks: { key: string; line: number; lines: string[] }[] = [];
	for (let i = 0; i < lines.length; i++) {
		const m = /^`([A-Z][A-Z_]*\.[^`]+)`/.exec(lines[i]);
		if (!m) continue;
		let j = i + 1;
		// The key's note may wrap onto more lines before the blank line and the quote.
		while (j < lines.length && lines[j].trim() !== "" && !lines[j].startsWith(">")) j++;
		while (j < lines.length && lines[j].trim() === "") j++;
		if (!lines[j]?.startsWith(">")) continue;
		const quote: string[] = [];
		for (; j < lines.length && lines[j].startsWith(">"); j++) {
			const t = lines[j].replace(/^> ?/, "");
			if (t !== "") quote.push(t);
		}
		blocks.push({ key: m[1], line: i + 1, lines: quote });
	}
	return blocks;
}

function runParity(copy: Copy, md: string, leaves = flatten(copy, "", [])): Failure[] {
	const failures: Failure[] = [];
	const fail = (f: Failure) => failures.push(f);
	const c = copy as { CONTACT: { phoneDisplay: string; email: string; address: string }; CONTACT_LIMITS: Record<string, number> };
	const resolve = (s: string) =>
		s
			.replace(/\{\{phoneDisplay\}\}/g, c.CONTACT.phoneDisplay)
			.replace(/\{\{email\}\}/g, c.CONTACT.email)
			.replace(/\{\{address\}\}/g, c.CONTACT.address)
			.replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
			// An unknown limit stays `{{limit.x}}`, so it shows up as a difference instead of a crash.
			.replace(/\{\{limit\.(\w+)\}\}/g, (m, k: string) => (k in c.CONTACT_LIMITS ? c.CONTACT_LIMITS[k].toLocaleString("fr-FR").replace(/\s/g, NBSP) : m));
	// Leading / trailing ordinary spaces are lost in Markdown: ignored for these keys only.
	const SPACED = new Set(["SITE.titleSuffix", "FOOTER.credit.prefix"]);
	const same = (mdLine: string, l: Leaf) => (SPACED.has(l.path) ? resolve(mdLine).trim() === l.text.trim() : resolve(mdLine) === l.text);
	const show = (s: string) => JSON.stringify(s).replace(/\u00A0/g, "\\u00A0");
	const covered = new Set<string>();
	for (const b of parseMd(md)) {
		const got = leaves.filter((l) => covers(b.key, l.path));
		if (got.length === 0) {
			fail({ rule: "md-parity", key: b.key, detail: `copy.md l.${b.line}: key missing in copy.ts` });
			continue;
		}
		for (const l of got) covered.add(l.path);
		if (got.length !== b.lines.length) {
			fail({ rule: "md-parity", key: b.key, detail: `copy.md l.${b.line}: ${b.lines.length} line(s) in copy.md, ${got.length} string(s) in copy.ts` });
			continue;
		}
		b.lines.forEach((mdLine, i) => {
			if (!same(mdLine, got[i]))
				fail({ rule: "md-parity", key: got[i].path, detail: `copy.md l.${b.line}: differs\n    md: ${show(resolve(mdLine))}\n    ts: ${show(got[i].text)}` });
		});
	}
	for (const r of parseRefs(md)) {
		const from = leaves.filter((l) => covers(r.from, l.path));
		const to = leaves.filter((l) => covers(r.to, l.path)).map((l) => l.text);
		for (const l of from) covered.add(l.path);
		if (from.length && from.map((l) => l.text).join("\n") !== to.join("\n"))
			fail({ rule: "md-parity", key: r.from, detail: `copy.md says it equals ${r.to}, but the strings differ` });
	}
	for (const l of leaves)
		if (!covered.has(l.path) && !NOT_IN_MD.some((p) => covers(p, l.path)))
			fail({ rule: "md-parity", key: l.path, detail: "no quote block in copy.md (add one, or list it in NOT_IN_MD)" });
	return failures;
}

// ---------------------------------------------------------------------------------------------
// Self-test: each rule must fire on its bad fixture, and a clean fixture must pass.

function selfTest(): string[] {
	const glossary = [{ term: "SEL", acronym: true, inline: "société d’exercice libéral (SEL)" }];
	const page = (body: string[], head: string[] = [], lead?: string): Page[] => [{ name: "test", head, lead, body }];
	const clean = {
		GLOSSARY: glossary,
		HEADER: { nav: { aPropos: "À propos" }, cta: "Contacter le cabinet" },
		T: {
			metaTitle: "Créer une SEL | Eva Biezunski",
			lead: "Une société d’exercice libéral (SEL), puis la SEL.",
			band: "Vous hésitez\u00A0? Écrivez-moi, nous la regarderons ensemble.",
			quote: "«\u00A0Exemple\u00A0»",
		},
	};
	const cleanPages = page(["GLOSSARY", "HEADER", "T.lead", "T.band", "T.quote"], ["T.metaTitle"], "T.lead");
	const cases: { rule: string; copy: Copy; pages: Page[] }[] = [
		{ rule: "acronym", copy: { GLOSSARY: glossary, T: { text: "Je crée votre SEL." } }, pages: page(["T"]) },
		{ rule: "acronym", copy: { GLOSSARY: glossary, T: { h1: "Créer une SEL", lead: "Je crée votre société." } }, pages: page(["T.lead"], ["T.h1"], "T.lead") },
		{ rule: "acronym", copy: { GLOSSARY: glossary, T: { a: "Votre SEL.", b: "Une société d’exercice libéral (SEL)." } }, pages: page(["T.a", "T.b"]) },
		{ rule: "nav-length", copy: { HEADER: { nav: { domaines: "Domaines d’intervention" } } }, pages: page(["HEADER"]) },
		{ rule: "cta-length", copy: { HERO: { cta: "Contacter le cabinet d’avocat" } }, pages: page(["HERO"]) },
		{ rule: "cta-rdv", copy: { HERO: { cta: "Prendre rendez-vous" } }, pages: page(["HERO"]) },
		{ rule: "cta-rdv", copy: { HERO: { cta: "Prendre un RDV" } }, pages: page(["HERO"]) },
		{ rule: "meta-length", copy: { T: { metaTitle: "x".repeat(61) } }, pages: page([], ["T"]) },
		{ rule: "meta-length", copy: { T: { metaDescription: "x".repeat(156) } }, pages: page([], ["T"]) },
		{ rule: "nbsp", copy: { T: { text: "Une question ?" } }, pages: page(["T"]) },
		{ rule: "nbsp", copy: { T: { text: "Appelez-moi:" } }, pages: page(["T"]) },
		{ rule: "nbsp", copy: { T: { text: "« Exemple\u00A0»" } }, pages: page(["T"]) }, // none after «
		{ rule: "nbsp", copy: { T: { text: "«\u00A0Exemple »" } }, pages: page(["T"]) }, // none before »
		{ rule: "third-person", copy: { T: { text: "Eva vous répond." } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { contactCta: "Nous contacter" } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { text: "Notre cabinet vous répond." } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { metaDescription: "Nous accompagnons les professionnels libéraux." } }, pages: page([], ["T"]) },
		{ rule: "word-list", copy: { T: { text: "Envoyez-moi un e-mail." } }, pages: page(["T"]) },
		{ rule: "word-list", copy: { T: { text: "N'hésitez pas à m’écrire." } }, pages: page(["T"]) },
		{ rule: "word-list", copy: { T: { text: "Le Cabinet vous répond." } }, pages: page(["T"]) },
		{ rule: "link-label", copy: { T: { link: "En savoir plus" } }, pages: page(["T"]) },
		{ rule: "marker", copy: { T: { text: "Depuis [À CONFIRMER : année]" } }, pages: page(["T"]) },
		{ rule: "apostrophe", copy: { T: { text: "Je vous réponds dès aujourd'hui." } }, pages: page(["T"]) },
		{ rule: "unmapped", copy: { T: { text: "Texte." }, U: { text: "Orphelin." } }, pages: page(["T"]) },
	];
	const errors: string[] = [];
	const cleanFailures = runRules(clean, cleanPages);
	if (cleanFailures.length) errors.push(`clean fixture failed: ${cleanFailures.map((f) => `${f.rule} ${f.key}`).join(", ")}`);
	for (const c of cases) {
		const fired = runRules(c.copy, c.pages).map((f) => f.rule);
		if (!fired.includes(c.rule)) errors.push(`rule ${c.rule} did not fire on ${JSON.stringify(c.copy)}`);
	}
	const md = "`T.a`\n> Bonjour\n\n`T.b`\n> Autre texte\n\n`T.d`\n> Absent\n\n`T.e`\n> Une ligne\n\n`T.f`\n> Fin\n\n`T.g`\n> {{limit.inconnu}}\n";
	const parity = runParity(
		{ CONTACT: { phoneDisplay: "", email: "", address: "" }, CONTACT_LIMITS: {}, T: { a: "Bonjour", b: "Autre", c: "Sans bloc", e: ["Une ligne", "Deux"], f: "Fin ", g: "5" } },
		md,
	);
	for (const key of ["T.b", "T.c", "T.d", "T.e", "T.f", "T.g"]) if (!parity.some((f) => f.key === key)) errors.push(`rule md-parity did not fire on ${key}`);
	return errors;
}

// ---------------------------------------------------------------------------------------------

if (process.argv.includes("--self-test")) {
	const errors = selfTest();
	for (const e of errors) console.log(`FAIL self-test: ${e}`);
	console.log(errors.length ? `${errors.length} self-test failure(s)` : "self-test OK: every rule fires on its fixture");
	process.exit(errors.length ? 1 : 0);
}

const copy = COPY as unknown as Copy;
const md = readFileSync(join(import.meta.dir, "copy.md"), "utf8");
const leaves = flatten(copy, "", []);
const failures = [...runRules(copy, buildPages(copy), leaves), ...runParity(copy, md, leaves)];
for (const f of failures) console.log(`${f.rule} ${f.key}: ${f.detail}`);
console.log(failures.length ? `\n${failures.length} failure(s)` : `copy.ts OK (${leaves.length} strings checked)`);
process.exit(failures.length ? 1 : 0);
