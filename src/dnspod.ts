import axios from "axios";
import Config from "./Config";
import Domain from "./Domain";
import { getLogger } from "./logger";
import { DomainRecord, ObjectLiteral } from "./types";

const singleConfig = Config.getSingleInstance();
const baseUrl = 'https://dnsapi.cn/';
const logger = getLogger('DNSPod');

axios.defaults.baseURL = baseUrl;

export default class DNSPod {
    private static publicParams = "" +
        "login_token=" + singleConfig.auth.id + ',' + singleConfig.auth.token +
        "&format=json&lang=cn&error_on_empty=no";

    private static stringifyData(data: ObjectLiteral) {
        let str = "";
        for(let key of Object.keys(data)) {
            str += `&${key}=${data[key]}`;
        }
        return this.publicParams + str;
    }

    private static async requestPost(apiPath: string, data: ObjectLiteral) {
        const res = await axios.post(apiPath, this.stringifyData(data)).catch(e => {
            logger.error(e);
            logger.error(`request ${apiPath} failed, base url = ${baseUrl}`);
            return null;
        });
        if (!res) {
            return res;
        }
        const json = res.data;
        return json;
    }

    static async getDomainRecord(domain: string, offset: number) {
        const json = await this.requestPost('Record.List', {offset, domain, length: 3000});
        const d = Domain.buildFromJson(json, offset);
        return d;
    }

    static getResCode(json: ObjectLiteral) {
        if (!json.status) {
            return -200;
        }
        if (json.status.code) {
            return parseInt(json.status.code, 10);
        } else {
            return -300;
        }
    }

    static async addDomainRecord(record: DomainRecord, domain: string) {
        const data = {
            domain,
            record_type: record.type,
            record_line: '默认',
            value: record.value,
            mx: 1,
            ttl: record.ttl,
            status: record.enabled ? 'enable': 'disable',
            sub_domain: record.name
        };
        await this.requestPost('Record.Create', data).then(res => {
            const code = this.getResCode(res);
            if (code === 1) {
                logger.info(`add record success, domain id = ${domain}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
            } else {
                logger.warn(`add record failed, code = ${code}, domain = ${domain}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
            }
        }).catch(e => {
            logger.error(e);
            logger.warn(`add record failed, domain id = ${domain}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
        });
    }

    static async updateComainRecord(record: DomainRecord, domain: string, recorId: string) {
        const data = {
            domain,
            record_id: recorId,
            record_type: record.type,
            record_line: '默认',
            value: record.value,

            mx: 1,
            ttl: record.ttl,
            status: record.enabled ? 'enable': 'disable',
            sub_domain: record.name
        }
        await this.requestPost('Record.Modify', data).then(res => {
            const code = this.getResCode(res);
            if (code === 1) {
                logger.info(`update record success, domain id = ${domain}, record id = ${recorId}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
            } else {
                logger.warn(`update record failed, code = ${code}, domain = ${domain}, record id = ${recorId}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
            }
        }).catch(e => {
            logger.error(e);
            logger.warn(`update record failed, domain id = ${domain}, record id = ${recorId}, name = ${record.name}, type = ${record.type}, value = ${record.value}`);
        });
    }
}