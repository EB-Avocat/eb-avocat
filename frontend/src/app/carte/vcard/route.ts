import { buildVCard } from "@/lib/vcard";

export function GET() {
	return new Response(buildVCard(), {
		headers: {
			"Content-Type": "text/vcard; charset=utf-8",
			"Content-Disposition": 'attachment; filename="eva-biezunski.vcf"',
		},
	});
}
