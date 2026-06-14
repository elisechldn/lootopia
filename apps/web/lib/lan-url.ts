/**
 * Replace localhost/127.0.0.1 with NEXT_PUBLIC_LAN_IP so the URL is reachable
 * from another device on the same network (e.g. scanning a QR code).
 *
 * Only relevant for local dev (`npm run dev` served on localhost), where
 * NEXT_PUBLIC_LAN_IP comes from apps/web/.env. Under Docker the app is reached
 * directly via the LAN IP through the TLS proxy, so the hostname is already an
 * IP and this is a no-op — NEXT_PUBLIC_LAN_IP is intentionally not baked there.
 */
export function toLanUrl(href: string): string {
    const url = new URL(href);
    const lanHost = process.env.NEXT_PUBLIC_LAN_IP;
    if (lanHost && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
        url.hostname = lanHost;
    }
    return url.toString();
}
