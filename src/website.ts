
export type Website = {
    key: string,
    ruleId: number,
    url: string //should be of form www.youtube.com no protocol
};

export type WebsiteWithBlocking = Website & {blockingStatus: BlockingStatus};

type BlockingStatus = ({ blocked: true} | { blocked:false, allowedUntil: number});
