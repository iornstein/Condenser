
export type Website = {
    key: string,
    ruleId: number,
    url: string //should be of form www.youtube.com no protocol
};

export type WebsiteWithBlocking = Website & {blockingStatus: BlockingStatus};

export const YouTube: WebsiteWithBlocking = {
    key: "YouTube", ruleId: 1, url: "www.youtube.com", blockingStatus: {blocked: true}
};

type BlockingStatus = ({ blocked: true} | { blocked:false, allowedUntil: number});
