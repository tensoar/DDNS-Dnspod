import { getLogger } from "./logger";
import Config from "./Config";
import { DomainRecord } from "./types";
import DNSPod from "./dnspod";

const logger = getLogger('main');

async function postDomainInfo(dominRecord: {
    domain: string,
    records: DomainRecord[]
}) {
    const d = await DNSPod.getDomainRecord(dominRecord.domain, 0);
    if (!d.records) {
        return;
    }
    for (let localRecord of dominRecord.records) {
        const rec = d.records.find(r => r.name === localRecord.name && r.type === localRecord.type);
        if (rec) {
            if (rec.value !== localRecord.value || rec.enabled !== localRecord.enabled || rec.ttl !== localRecord.ttl) {
                logger.info(`record modified, name = ${rec.name}, type = ${rec.type}, will update ...`);
                await DNSPod.updateComainRecord(localRecord, dominRecord.domain, rec.id);
            } else {
                logger.info(`record not modified, nothing to do, name = ${rec.name}, type = ${rec.type} ...`);
            }
        } else {
            logger.info(`record not exists, name = ${localRecord.name}, type = ${localRecord.type}, will add ...`);
            await DNSPod.addDomainRecord(localRecord, dominRecord.domain);
        }
    }
}

async function bootstrap() {
    const config = Config.getConfig();
    for (let domain of config.domains) {
        await postDomainInfo(domain);
    }
}

const intervalMin = Config.getSingleInstance().application.interval;
const interval = intervalMin * 60 * 1000;
setInterval(bootstrap, interval);
logger.info(`scheduled with interval ${intervalMin} Minutes (${interval} ms) ...`);