
export type Website = {
    key: string,
    url: string
};

export type WebsiteWithBlocking = Website & {blockingStatus: BlockingStatus};

type BlockingStatus = ({ blocked: true} | { blocked:false, allowedUntil: number});
