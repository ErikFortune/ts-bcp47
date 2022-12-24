/*
 * Copyright (c) 2022 Erik Fortune
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import * as Iana from '../iana';

import { Result, allSucceed, fail, succeed } from '@fgv/ts-utils';

import { ExtensionSubtag } from './subtags/model';
import { LanguageTagParts } from './common';
import { Validate } from './subtags';

interface ParserStatus {
    readonly iana: Iana.LanguageSubtags.TagRegistry;
    readonly tag: string;
    readonly subtags: string[];
    readonly parts: LanguageTagParts;
    next?: string;
}

export class LanguageTagParser {
    // istanbul ignore next
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    public static parse(tag: string, iana: Iana.LanguageSubtags.TagRegistry): Result<LanguageTagParts> {
        const status: ParserStatus = {
            tag,
            iana,
            subtags: tag.split('-'),
            parts: {},
        };
        status.next = status.subtags.shift();

        return allSucceed(
            [
                this._parseGrandfatheredTag(status),
                this._parsePrimaryLanguage(status),
                this._parseExtlang(status),
                this._parseScript(status),
                this._parseRegion(status),
                this._parseVariants(status),
                this._parseExtensions(status),
                this._parsePrivateSubtags(status),
                this._parseTagEnd(status),
            ],
            status
        ).onSuccess(() => {
            return succeed(status.parts);
        });
    }

    protected static _parseGrandfatheredTag(status: ParserStatus): Result<LanguageTagParts> {
        if (status.next === 'i' || status.next === 'I') {
            const grandfathered = status.iana.grandfathered.tryGet(status.tag);
            if (grandfathered) {
                status.parts.grandfathered = grandfathered.tag;
                // we consumed the whole thing
                status.subtags.splice(0, status.subtags.length);
                status.next = undefined;
            } else {
                return fail(`${status.tag}: unrecognized grandfathered tag`);
            }
        }
        return succeed(status.parts);
    }

    protected static _parsePrimaryLanguage(status: ParserStatus): Result<LanguageTagParts> {
        // primary language subtag is required unless the entire tag is grandfathered or consists
        // of only private tags
        if (status.iana.languages.isWellFormed(status.next)) {
            status.parts.primaryLanguage = status.next;
            status.next = status.subtags.shift();
            return succeed(status.parts);
        } else if (status.parts.grandfathered !== undefined) {
            return succeed(status.parts);
        } else if (Validate.privateUsePrefix.isWellFormed(status.next)) {
            // just return with no primary language and the private tag
            // parser will be invoked by the parent flow.
            return succeed(status.parts);
        }
        return fail(`${status.tag}: no primary language subtag`);
    }

    protected static _parseExtlang(status: ParserStatus): Result<LanguageTagParts> {
        // optional extlangs subtags
        while (status.iana.extlangs.isWellFormed(status.next)) {
            if (status.parts.extlangs === undefined) {
                status.parts.extlangs = [status.next];
            } else if (status.parts.extlangs.length < 3) {
                status.parts.extlangs.push(status.next);
            } else {
                return fail(`${status.next}: too many extlang subtags`);
            }
            status.next = status.subtags.shift();
        }
        return succeed(status.parts);
    }

    protected static _parseScript(status: ParserStatus): Result<LanguageTagParts> {
        // optional script subtag
        if (status.iana.scripts.isWellFormed(status.next)) {
            status.parts.script = status.next;
            status.next = status.subtags.shift();
        }
        return succeed(status.parts);
    }

    protected static _parseRegion(status: ParserStatus): Result<LanguageTagParts> {
        // optional region subtag
        if (status.iana.regions.isWellFormed(status.next)) {
            status.parts.region = status.next;
            status.next = status.subtags.shift();
        }
        return succeed(status.parts);
    }

    protected static _parseVariants(status: ParserStatus): Result<LanguageTagParts> {
        // optional variant subtags
        while (status.iana.variants.isWellFormed(status.next)) {
            if (status.parts.variants === undefined) {
                status.parts.variants = [status.next];
            } else {
                status.parts.variants.push(status.next);
            }
            status.next = status.subtags.shift();
        }
        return succeed(status.parts);
    }

    protected static _parseExtensions(status: ParserStatus): Result<LanguageTagParts> {
        // optional extension subtags
        while (status.next !== undefined && Validate.extensionSingleton.isWellFormed(status.next)) {
            const singleton = status.next;
            const values: ExtensionSubtag[] = [];
            status.next = status.subtags.shift();

            while (Validate.extensionSubtag.isWellFormed(status.next)) {
                values.push(status.next);
                status.next = status.subtags.shift();
            }
            if (
                status.next !== undefined &&
                !Validate.extensionSingleton.isWellFormed(status.next) &&
                !Validate.extensionSingleton.isWellFormed(status.next)
            ) {
                return fail(`${status.next}: malformed extension subtag`);
            } else if (values.length < 1) {
                return fail(`${status.tag}: extension '${singleton}' must have at least one subtag.`);
            }

            const value = values.join('-') as ExtensionSubtag;
            if (status.parts.extensions === undefined) {
                status.parts.extensions = [{ singleton, value }];
            } else {
                status.parts.extensions.push({ singleton, value });
            }
        }
        return succeed(status.parts);
    }

    protected static _parsePrivateSubtags(status: ParserStatus): Result<LanguageTagParts> {
        // optional private use subtags
        while (status.next != undefined && Validate.privateUsePrefix.isWellFormed(status.next)) {
            const values: string[] = [];
            status.next = status.subtags.shift();

            while (
                status.next &&
                !Validate.privateUsePrefix.isWellFormed(status.next) &&
                Iana.LanguageSubtags.Validate.extendedLanguageRange.isWellFormed(status.next)
            ) {
                values.push(status.next);
                status.next = status.subtags.shift();
            }

            if (status.next !== undefined && !Validate.privateUsePrefix.isWellFormed(status.next)) {
                return fail(`${status.next}: malformed private-use subtag`);
            } else if (values.length < 1) {
                return fail(`${status.tag}: private-use tag must have at least one subtag.`);
            }

            const value = values.join('-') as Iana.LanguageSubtags.ExtendedLanguageRange;
            if (status.parts.private === undefined) {
                status.parts.private = [value];
            } else {
                status.parts.private.push(value);
            }
        }
        return succeed(status.parts);
    }

    protected static _parseTagEnd(status: ParserStatus): Result<LanguageTagParts> {
        if (status.next !== undefined) {
            return fail(`${status.next}: unexpected subtag`);
        }
        return succeed(status.parts);
    }
}
