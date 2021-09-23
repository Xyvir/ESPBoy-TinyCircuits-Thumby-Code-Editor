/**
 * Minifies and unminifies configs by replacing frequent keys
 * and values with one letter substitutes. Config options must
 * retain array position/index, add new options at the end.
 * @internal
*/

export namespace ConfigMinifier {

    export type YY = 'id' | 'title';
    export const enum XX {
        id = 'id'
    }
    const keys: readonly string[] = [
        'settings',
        'hasHeaders',
        'constrainDragToContainer',
        'selectionEnabled',
        'dimensions',
        'borderWidth',
        'minItemHeight',
        'minItemWidth',
        'headerHeight',
        'dragProxyWidth',
        'dragProxyHeight',
        'labels',
        'close',
        'maximise',
        'minimise',
        'popout',
        'content',
        'componentType',
        'componentState',
        'id',
        'width',
        'type',
        'height',
        'isClosable',
        'title',
        'popoutWholeStack',
        'openPopouts',
        'parentId',
        'activeItemIndex',
        'reorderEnabled',
        'borderGrabWidth',




        //Maximum 36 entries, do not cross this line!
    ];

    const values: readonly (boolean | string)[] = [
        true,
        false,
        'row',
        'column',
        'stack',
        'component',
        'close',
        'maximise',
        'minimise',
        'open in new window'
    ];

    export function checkInitialise(): void {
        if (keys.length > 36) {
            throw new Error('Too many keys in config minifier map');
        }
    }

    export function translateObject(from: Record<string, unknown>, minify: boolean): Record<string, unknown> {
        const to: Record<string, unknown> = {};
        for (const key in from) {
            if (from.hasOwnProperty(key)) { // In case something has extended Object prototypes
                let translatedKey: string;
                if (minify) {
                    translatedKey = minifyKey(key);
                } else {
                    translatedKey = unminifyKey(key);
                }

                const fromValue = from[key];
                to[translatedKey] = translateValue(fromValue, minify);
            }
        }

        return to;
    }

    function translateArray(from: unknown[], minify: boolean) {
        const length = from.length;
        const to = new Array<unknown>(length);
        for (let i = 0; i < length; i++) {
            // In original code, array indices were numbers and not translated
            const fromValue = from[i];
            to[i] = translateValue(fromValue, minify);
        }
        return to;
    }

    function translateValue(from: unknown, minify: boolean) {
        if (typeof from === 'object') {
            if (from === null) {
                return null;
            } else {
                if (Array.isArray(from)) {
                    return translateArray(from, minify);
                } else {
                    return translateObject(from as Record<string, unknown>, minify);
                }
            }
        } else {
            if (minify) {
                return minifyValue(from);
            } else {
                return unminifyValue(from);
            }
        }
    }

    function minifyKey(value: string) {
        /**
         * If a value actually is a single character, prefix it
         * with ___ to avoid mistaking it for a minification code
         */
        if (typeof value === 'string' && value.length === 1) {
            return '___' + value;
        }
    
        const index = indexOfKey(value);
    
        /**
         * value not found in the dictionary, return it unmodified
         */
        if (index === -1) {
            return value;
    
            /**
             * value found in dictionary, return its base36 counterpart
             */
        } else {
            return index.toString(36);
        }
    }

    function unminifyKey(key: string) {
        /**
         * value is a single character. Assume that it's a translation
         * and return the original value from the dictionary
         */
        if (key.length === 1) {
            return keys[parseInt(key, 36)];
        }
    
        /**
         * value originally was a single character and was prefixed with ___
         * to avoid mistaking it for a translation. Remove the prefix
         * and return the original character
         */
        if (key.substr(0, 3) === '___') {
            return key[3];
        }
        /**
         * value was not minified
         */
        return key;
    }

    function minifyValue(value: unknown) {
        /**
         * If a value actually is a single character, prefix it
         * with ___ to avoid mistaking it for a minification code
         */
        if (typeof value === 'string' && value.length === 1) {
            return '___' + value;
        }
    
        const index = indexOfValue(value);
    
        /**
         * value not found in the dictionary, return it unmodified
         */
        if (index === -1) {
            return value;
    
            /**
             * value found in dictionary, return its base36 counterpart
             */
        } else {
            return index.toString(36);
        }
    }

    function unminifyValue(value: unknown) {
        /**
         * value is a single character. Assume that it's a translation
         * and return the original value from the dictionary
         */
        if (typeof value === 'string' && value.length === 1) {
            return values[parseInt(value, 36)];
        }

        /**
         * value originally was a single character and was prefixed with ___
         * to avoid mistaking it for a translation. Remove the prefix
         * and return the original character
         */
        if (typeof value === 'string' && value.substr(0, 3) === '___') {
            return value[3];
        }
        /**
         * value was not minified
         */
        return value;
    }

    function indexOfKey(key: string) {
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === key) {
                return i;
            }
        }
        return -1;
    }

    function indexOfValue(value: unknown) {
        for (let i = 0; i < values.length; i++) {
            if (values[i] === value) {
                return i;
            }
        }
        return -1;
    }
}
