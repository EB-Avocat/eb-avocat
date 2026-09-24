import { redirect } from "next/navigation";

export default function BackofficeHome() {
	redirect(`/${process.env.BACKOFFICE_PATH}/articles`);
}
