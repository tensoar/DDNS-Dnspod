import { program } from "commander";
import * as fs from "fs";
import * as path from "path";

import * as yaml from "yaml";
import IP from "./ip";
import { DomainRecord } from "./types";

const devConfigPath = path.join(__dirname, '..', 'config.yaml');
const prodConfigPath = '~/.config/ddns/config.yaml';

program.option('-c, --config <config>', 'config file path', fs.existsSync(prodConfigPath) ? prodConfigPath: devConfigPath);
program.parse();
const configPath: string = program.opts().config;
if (!fs.existsSync(configPath)) {
    // tslint:disable-next-line: no-console
    console.error(`cant't find config file: ${configPath}, can be specified by parameter -c or --config ...`);
    process.exit(0);
} else {
    // tslint:disable-next-line: no-console
    console.log(`use config file: ${configPath}`);
}

export default class Config {
    application: {interval: number} = null;
    auth: {token: string, id: number} = null;
    log: {level: string} = null;
    domains: Array<{
        domain: string,
        records: DomainRecord[]
    }> = null;
    private static singleInst: Config = null;

    static getSingleInstance() {
        if (this.singleInst === null) {
            this.singleInst = this.getConfig();
        }
        return this.singleInst;
    }

    static getConfig() {
        const config = new Config();
        const configStr = fs.readFileSync(configPath, 'utf-8');
        const obj = yaml.parse(configStr);
        const ipv6 = IP.getPublicIpv6();
        config.application = obj.application;
        config.auth = obj.auth;
        config.domains = obj.domains;
        config.log = obj.log;
        config.domains.forEach(d => {
            d.records.forEach(r => {
                if (r.value.replace(/\s+/g, '').toLocaleLowerCase() === 'localipv6') {
                    if (!ipv6) {
                        throw new Error('detect ipv6 failed ...');
                    }
                    r.value = ipv6;
                }
            })
        })
        return config;
    }
}