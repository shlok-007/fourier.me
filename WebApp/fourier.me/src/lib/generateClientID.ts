export default function generateClientId() {
    const navigatorInfo = window.navigator.userAgent;
    const screenInfo = `${window.screen.height}${window.screen.width}${window.screen.colorDepth}`;
    const uniqueNumber = new Date().getTime();

    const clientId = `${navigatorInfo}${screenInfo}${uniqueNumber}`;

    // Create a hash of the client ID
    let hash = 0, i, chr;
    for (i = 0; i < clientId.length; i++) {
        chr   = clientId.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return Math.abs(hash);
}