/* @flow */

// =============================================================================
// Imports
// =============================================================================
import { Logger, StdoutTransport, FileTransport } from '../common';


// =============================================================================
// Start
// =============================================================================
export function startTest( outputDirPath: string ) {
    const logger = new Logger({
        hostname: '10',
        stdout: new StdoutTransport({
            printType: 'simple-json-cli',
        }),
    });

    logger.info(
        'Compact JSON object:',
        {"query":{"bool":{"must":[{"term":{"join":"video"}},{"range":{"video_published_at":{"format":"yyyy-MM-dd||yyyy","gte":"2018-05-02","lt":"2018-06-27"}}},{"has_parent":{"parent_type":"channel","query":{"ids":{"type":"_doc","values":["UCdx4f95Cy4a-PlMrJEqlHDw","UCRyR18PmBT1WFEHUmttlEpQ","UCooSab5osPBK3F_dBHLw8ug","UCxSXK-MJkaGsNhCv0YuccTg"]}}}},{"bool":{"must":[{"multi_match":{"query":"megabonus","fields":["title","description","linked_domain_parts"],"operator":"and"}}]}}]}},"size":0,"aggs":{"by_channel":{"terms":{"field":"id_channel","size":200000},"aggs":{"graph":{"date_histogram":{"field":"video_published_at","extended_bounds":{"min":"2018-05-02","max":"2018-06-27"},"interval":"7d","format":"yyyy-MM-dd||yyyy","offset":"6d"}}}}}}
    );
}

export default startTest;
