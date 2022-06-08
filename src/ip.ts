import * as os from 'os';

export default class IP {

    static getPublicIpv6() {
        const inters = os.networkInterfaces();
        const addrs: os.NetworkInterfaceInfo[] = [];
        for (let key of Object.keys(inters)) {
            addrs.push(...inters[key]);
        }
        const addr = addrs.find(a => a.family === 'IPv6' && a.internal === false && !a.address.startsWith('fe80'));
        return addr ? addr.address : null;
    }
}