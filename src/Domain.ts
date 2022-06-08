import { getLogger } from "./logger";
import { DomainInfo, DomainInfoExt, DomainRecord, DomainStatus } from "./types";

const logger = getLogger('Domain');
export default class Domain {
    public status: DomainStatus = null;
    domainInfo: DomainInfo = null;
    domainInfoExt: DomainInfoExt = null;
    records: DomainRecord[] = null;
    offset = 0;

    hasNext(): boolean {
        return this.domainInfoExt.recordTotal === this.domainInfoExt.recordsNum;
    }

    nextOffset() {
        return this.records.length + this.offset;
    }

    getRecordByNameAndType(name: string, type: string) {
        return this.records.find(r => r.name === name && r.type === type);
    }

    static buildFromJson(jsonStr: string | object, offset: number) {
        try {
            const d = new Domain();
            d.offset = offset;
            const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
            const {status, domain, info, records} = obj;
            d.status = {
                code: status ? status.code : -100,
                message: status ? status.message : 'invalid response',
                createAt: status ? status.create_at : ''
            };
            d.domainInfo = {
                id: domain ? domain.id : '',
                name: domain ? domain.name : '',
                ttl: domain ? parseInt(domain.ttl, 10) : 0
            };
            d.domainInfoExt = {
                subDomains: info ? parseInt(info.sub_domains, 10) : 0,
                recordTotal: info ? parseInt(info.record_total, 10) : 0,
                recordsNum: info ? parseInt(info.records_num, 10) : 0
            }
            d.records = [];
            if (records && records.length) {
                for (let r of records) {
                    d.records.push({
                        id: r.id,
                        name: r.name,
                        value: r.value,
                        type: r.type,
                        ttl: parseInt(r.ttl, 10),
                        enabled: parseInt(r.enabled, 10) as any
                    })
                }
            }
            return d;
        } catch (e) {
            logger.error(e);
            logger.error(`build Domain failed from str: ${jsonStr}`);
            return null;
        }
    }
}