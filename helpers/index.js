/* @flow */

// =============================================================================
// Imports
// =============================================================================
import _ from 'lodash';
import GetType from 'get-explicit-type';


// =============================================================================
// getUpdatedObjDeep
// =============================================================================
export function getUpdatedObjDeep<T: Array<any> | Object, V: any>(
    arrOrObj: T,
    cb: ( value: V, keyOrIndex: string | number, source: T, dest: T ) => V,
    config?: $Shape<{
        maxDepth: number,
        onMaxDepthReachCb: ( arrOrObj: T ) => V,
    }>,
    _runtime?: {
        currDepth: number,
    }
): T {
    const newArrOrObj: T =
        Array.isArray( arrOrObj )
            // $FlowOk
            ? []
            // $FlowOk
            : {};

    const {
        maxDepth,
        onMaxDepthReachCb = arrOrObj => arrOrObj,
    } = config || {};
    const { currDepth = 0 } = _runtime || {};

    if ( maxDepth && currDepth > maxDepth ) {
        return onMaxDepthReachCb( arrOrObj );
    }

    _.forEach( arrOrObj, ( value, keyOrIndex ) => {
        const type = GetType( value );

        if ( type === 'Object' || type === 'Array' ) {
            newArrOrObj[ keyOrIndex ] =
                getUpdatedObjDeep( value, cb, config, {
                    currDepth: currDepth + 1,
                });
        } else {
            newArrOrObj[ keyOrIndex ] = cb( value, keyOrIndex, arrOrObj, newArrOrObj );
        }
    });

    return newArrOrObj;
}
