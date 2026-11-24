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
 * - cta-rdv     « rendez-vous » in a CTA
 * - meta-length meta title > 60, meta description > 155 characters
 * - nbsp        no U+00A0 before » : ; ? ! or after «
 * - third-person « Eva », « Biezunski », « Mme », « Maître », « nous / notre / nos » outside the
 *               allowed places (guide §1.1; « nous » is allowed when it means « vous et moi »)
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
type Failure = { rule: string; key: string; detail: string };
/** A page: patterns of keys in reading order. `head` = meta + h1, `lead` = first paragraph. */
type Page = { name: string; head: string[]; lead?: string; body: string[] };

const NBSP = " ";

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
function covers(pattern: string, path: string): boolean {
	const re = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\[\\\*\\\]/g, "\\[[^\\]]+\\]");
	return new RegExp(`^${re}(?=$|[.[])`).test(path);
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
	const band = (line: string) => [`CONTACT_BAND.heading`, `CONTACT_BAND.lines.${line}`, "CONTACT_BAND.cta", "CONTACT_BAND.phoneLead"];
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
/** « nous » = « vous et moi » without « ensemble » in the sentence (guide §1.1). */
const NOUS_YOU_AND_I = [/^DOMAINES\.items\[creation-de-societe\]\.how\.steps\[(0|2)\]$/];

const word = (w: string, flags = "u") => new RegExp(`(?<![\\p{L}\\p{N}])(?:${w})(?![\\p{L}\\p{N}])`, flags);
const THIRD_PERSON = word("Eva|Biezunski|Mme|Maître");
const NOUS = word("nous|notre|nos", "iu");
/** Matching ignores case, apostrophe style and space style. */
const norm = (s: string) => s.replace(/’/g, "'").replace(/ /g, " ").toLowerCase();
const any = (res: RegExp[], path: string) => res.some((re) => re.test(path));

function checkAcronyms(page: Page, leaves: Leaf[], glossary: readonly { term: string; inline: string; acronym: boolean }[], fail: (f: Failure) => void) {
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

function runRules(copy: Copy, pages: Page[]): Failure[] {
	const failures: Failure[] = [];
	const fail = (f: Failure) => failures.push(f);
	const leaves = flatten(copy, "", []);

	for (const { path, text } of leaves) {
		const len = [...text].length;
		if (any(NAV_KEYS, path) && len > 12) fail({ rule: "nav-length", key: path, detail: `${len} > 12 characters` });
		if (any(CTA_KEYS, path)) {
			if (len > 22) fail({ rule: "cta-length", key: path, detail: `${len} > 22 characters` });
			if (/rendez-vous/i.test(text)) fail({ rule: "cta-rdv", key: path, detail: "« rendez-vous » in a CTA" });
		}
		if (any(META_TITLE, path) && len > 60) fail({ rule: "meta-length", key: path, detail: `title ${len} > 60 characters` });
		if (any(META_DESCRIPTION, path) && len > 155) fail({ rule: "meta-length", key: path, detail: `description ${len} > 155 characters` });
		const sp = /(^|[^ ])([:;?!»])|«(?! )/.exec(text);
		if (sp) fail({ rule: "nbsp", key: path, detail: `no U+00A0 at « ${text.slice(Math.max(0, sp.index - 12), sp.index + 3).replace(/ /g, "⍽")} »` });
		if (!any(THIRD_PERSON_OK, path)) {
			const m = THIRD_PERSON.exec(text);
			if (m) fail({ rule: "third-person", key: path, detail: `« ${m[0]} » outside the identification places` });
			const youAndI = any(NOUS_YOU_AND_I, path);
			for (const sentence of text.split(/(?<=[.?!…])\s+/)) {
				const n = NOUS.exec(sentence);
				if (n && !youAndI && !/ensemble/i.test(sentence)) fail({ rule: "third-person", key: path, detail: `« ${n[0]} »: the site has no team; use « je »` });
			}
		}
		if (text.includes("[À CONFIRMER")) fail({ rule: "marker", key: path, detail: "unresolved [À CONFIRMER marker" });
		if (text.includes("'")) fail({ rule: "apostrophe", key: path, detail: "straight apostrophe, use ’" });
	}

	const mapped = new Set(pages.flatMap((p) => select(leaves, [...p.head, ...(p.lead ? [p.lead] : []), ...p.body]).map((l) => l.path)));
	for (const l of leaves) if (!mapped.has(l.path)) fail({ rule: "unmapped", key: l.path, detail: "belongs to no page in buildPages()" });

	const glossary = (copy.GLOSSARY ?? []) as readonly { term: string; inline: string; acronym: boolean }[];
	for (const page of pages) checkAcronyms(page, leaves, glossary, fail);
	return failures;
}

// ---------------------------------------------------------------------------------------------
// Parity with copy.md

/** copy.ts keys with no quote block of their own in copy.md (references `=`, data, unchanged keys). */
const NOT_IN_MD = [
	"HOME.metaTitle", // = SITE.title
	"HOME.metaDescription", // = SITE.description
	"HOME.publications.viewAll", // = PUBLICATIONS.viewAll
	"DOMAINES.items[*].band", // = CONTACT_BAND.lines.<slug>
	"ABOUT.portrait.alt", // = PROOF.portrait.alt
	"ABOUT.parcours.items", // = PROOF.credentials.items, then PROOF.professions
	"QR_CARD.review", // = REVIEW.footerLink
	"NAV_LINKS", // HEADER.nav with the #67 routes
	"OTHER_SUBJECT", // last of CONTACT.subjectOptions
	"CONTACT.address", // data (constants.ts)
	"CONTACT.addressParts",
	"CONTACT.phoneDisplay",
	"GLOSSARY", // editorial-guide §4
	// Unchanged keys, listed in a note of copy.md §10.1:
	...["empty", "viewAll", "allCategories", "filterLabel", "moreCategories", "categoriesLabel", "readMore", "by", "previousPage", "nextPage", "pageLabel"].map((k) => `PUBLICATIONS.${k}`),
];

/** copy.md key → copy.ts key, where the structure differs. */
const MD_ALIASES: Record<string, string> = {
	"PROOF.reviews.item.meta": "PROOF.reviews.quotes.item.meta",
	"PROOF.reviews.item.name": "PROOF.reviews.quotes.item.name",
};

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

function runParity(copy: Copy, md: string): Failure[] {
	const failures: Failure[] = [];
	const leaves = flatten(copy, "", []);
	const c = copy as { CONTACT: { phoneDisplay: string; email: string; address: string }; CONTACT_LIMITS: Record<string, number> };
	const resolve = (s: string) =>
		s
			.replace(/\{\{phoneDisplay\}\}/g, c.CONTACT.phoneDisplay)
			.replace(/\{\{email\}\}/g, c.CONTACT.email)
			.replace(/\{\{address\}\}/g, c.CONTACT.address)
			.replace(/\{\{year\}\}/g, String(new Date().getFullYear()))
			.replace(/\{\{limit\.(\w+)\}\}/g, (_m, k: string) => c.CONTACT_LIMITS[k].toLocaleString("fr-FR").replace(/\s/g, NBSP));
	// Trailing ordinary spaces are lost in Markdown (`SITE.titleSuffix`, `FOOTER.credit.prefix`).
	const trim = (s: string) => s.replace(/^ +| +$/g, "");
	const show = (s: string) => JSON.stringify(s).replace(/\u00A0/g, "\\u00A0");
	const covered = new Set<string>();
	for (const b of parseMd(md)) {
		const key = MD_ALIASES[b.key] ?? b.key;
		const got = leaves.filter((l) => covers(key, l.path));
		if (got.length === 0) {
			failures.push({ rule: "md-parity", key: b.key, detail: `copy.md l.${b.line}: key missing in copy.ts` });
			continue;
		}
		for (const l of got) covered.add(l.path);
		if (got.length !== b.lines.length) {
			failures.push({ rule: "md-parity", key: b.key, detail: `copy.md l.${b.line}: ${b.lines.length} line(s) in copy.md, ${got.length} string(s) in copy.ts` });
			continue;
		}
		b.lines.forEach((mdLine, i) => {
			if (trim(resolve(mdLine)) !== trim(got[i].text))
				failures.push({ rule: "md-parity", key: got[i].path, detail: `copy.md l.${b.line}: differs\n    md: ${show(resolve(mdLine))}\n    ts: ${show(got[i].text)}` });
		});
	}
	for (const l of leaves)
		if (!covered.has(l.path) && !NOT_IN_MD.some((p) => covers(p, l.path)))
			failures.push({ rule: "md-parity", key: l.path, detail: "no quote block in copy.md (add one, or list it in NOT_IN_MD)" });
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
			band: "Vous hésitez ? Écrivez-moi, nous la regarderons ensemble.",
			quote: "« Exemple »",
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
		{ rule: "meta-length", copy: { T: { metaTitle: "x".repeat(61) } }, pages: page([], ["T"]) },
		{ rule: "meta-length", copy: { T: { metaDescription: "x".repeat(156) } }, pages: page([], ["T"]) },
		{ rule: "nbsp", copy: { T: { text: "Une question ?" } }, pages: page(["T"]) },
		{ rule: "nbsp", copy: { T: { text: "Appelez-moi:" } }, pages: page(["T"]) },
		{ rule: "nbsp", copy: { T: { text: "« Exemple »" } }, pages: page(["T"]) },
		{ rule: "nbsp", copy: { T: { text: "« Exemple »" } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { text: "Eva vous répond." } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { contactCta: "Nous contacter" } }, pages: page(["T"]) },
		{ rule: "third-person", copy: { T: { text: "Notre cabinet vous répond." } }, pages: page(["T"]) },
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
	const md = "`T.a`\n> Bonjour\n\n`T.b`\n> Autre texte\n";
	const parity = runParity({ CONTACT: { phoneDisplay: "", email: "", address: "" }, CONTACT_LIMITS: {}, T: { a: "Bonjour", b: "Autre", c: "Sans bloc" } }, md);
	for (const key of ["T.b", "T.c"]) if (!parity.some((f) => f.key === key)) errors.push(`rule md-parity did not fire on ${key}`);
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
const failures = [...runRules(copy, buildPages(copy)), ...runParity(copy, md)];
for (const f of failures) console.log(`${f.rule} ${f.key}: ${f.detail}`);
console.log(failures.length ? `\n${failures.length} failure(s)` : `copy.ts OK (${flatten(copy, "", []).length} strings checked)`);
process.exit(failures.length ? 1 : 0);
