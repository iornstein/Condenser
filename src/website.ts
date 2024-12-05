
export type Website = {
    key: string,
    ruleId: number,
    url: string
};

export type WebsiteWithBlocking = Website & {blockingStatus: BlockingStatus};

type BlockingStatus = ({ blocked: true} | { blocked:false, allowedUntil: number});
