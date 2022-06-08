export type DomainRecord = {
    id: string,
    name: string,
    value: string,
    type: string,
    ttl: number,
    enabled: 0 | 1
}

export type DomainInfo = {
    id: string,
    name: string,
    ttl: number
}

export type DomainStatus = {
    code: string,
    message: string,
    createAt: string
}

export type DomainInfoExt = {
    subDomains: number,
    recordTotal: number,
    recordsNum: number
}

export type ObjectLiteral<T=any> = {[key: string]: T};