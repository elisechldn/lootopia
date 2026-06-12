/**
 * Replace localhost/127.0.0.1 with NEXT_PUBLIC_LAN_IP so the URL is reachable
 * from another device on the same network (e.g. scanning a QR code).
 */
export function toLanUrl(href: string): string {
    const url = new URL(href);
    const lanHost = process.env.NEXT_PUBLIC_LAN_IP;
    if (lanHost && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
        url.hostname = lanHost;
    }
    return url.toString();
}
