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

import { Result, Success, allSucceed, fail, succeed } from '@fgv/ts-utils';

import { ExtensionSubtag } from './subtags/model';
import { LanguageTagParts } from './common';
import { Validate } from './subtags';

/**
 * @internal
 */
interface ParserState {
    readonly iana: Iana.LanguageRegistries;
    readonly tag: string;
    readonly subtags: string[];
    readonly parts: LanguageTagParts;
    next?: string;
}

/**
 * @public
 */
export class LanguageTagParser {
    // istanbul ignore next
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * Parses a string representation of a BCP-47 ({@link https://www.rfc-editor.org/rfc/rfc5646.html | RFC 5646})
     * language tag, to produce a {@link Bcp47.LanguageTagParts | LanguageTagParts} which
     * breaks out each of the subtags.
     * @param tag - The `string` language tag to be parsed.
     * @param iana - Optional {@link Iana.LanguageRegistries | IANA language registries}
     * to be used.
     * @returns `Success` with the resulting {@link Bcp47.LanguageTagParts | language tag parts}
     * or `Failure` with details if an error occurs.
     * @public
     */
    public static parse(tag: string, iana?: Iana.LanguageRegistries): Result<LanguageTagParts> {
        // istanbul ignore next
        iana = iana ?? Iana.DefaultRegistries.languageRegistries;
        const status: ParserState = {
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

    /**
     * Determines if the entire tag matches a registered grandfathered tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with the updated {@link Bcp47.LanguageTagParts | language tag parts}
     * if a grandfathered tag is found, or `Success` with the supplied parts if no tag is found.
     * @
     * @internal
     */
    protected static _parseGrandfatheredTag(state: ParserState): Success<LanguageTagParts> {
        const grandfathered = state.iana.subtags.grandfathered.tryGet(state.tag);
        if (grandfathered) {
            state.parts.grandfathered = state.tag as Iana.LanguageSubtags.GrandfatheredTag;
            // we consumed the whole thing
            state.subtags.splice(0, state.subtags.length);
            state.next = undefined;
        }
        return succeed(state.parts);
    }

    /**
     * Parses the primary language subtag of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the primary language subtag, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parsePrimaryLanguage(state: ParserState): Result<LanguageTagParts> {
        // primary language subtag is required unless the entire tag is grandfathered or consists
        // of only private tags
        if (state.iana.subtags.languages.isWellFormed(state.next)) {
            state.parts.primaryLanguage = state.next;
            state.next = state.subtags.shift();
            return succeed(state.parts);
        } else if (state.parts.grandfathered !== undefined) {
            return succeed(state.parts);
        } else if (Validate.privateUsePrefix.isWellFormed(state.next)) {
            // just return with no primary language and the private tag
            // parser will be invoked by the parent flow.
            return succeed(state.parts);
        }
        return fail(`${state.tag}: no primary language subtag`);
    }

    /**
     * Parses the extlang subtag(s) of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include extlang subtags if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parseExtlang(state: ParserState): Result<LanguageTagParts> {
        // optional extlangs subtags
        while (state.iana.subtags.extlangs.isWellFormed(state.next)) {
            if (state.parts.extlangs === undefined) {
                state.parts.extlangs = [state.next];
            } else if (state.parts.extlangs.length < 3) {
                state.parts.extlangs.push(state.next);
            } else {
                return fail(`${state.next}: too many extlang subtags`);
            }
            state.next = state.subtags.shift();
        }
        return succeed(state.parts);
    }

    /**
     * Parses the script subtag of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the script subtag if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parseScript(state: ParserState): Result<LanguageTagParts> {
        // optional script subtag
        if (state.iana.subtags.scripts.isWellFormed(state.next)) {
            state.parts.script = state.next;
            state.next = state.subtags.shift();
        }
        return succeed(state.parts);
    }

    /**
     * Parses the region subtag of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the region subtag if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parseRegion(state: ParserState): Result<LanguageTagParts> {
        // optional region subtag
        if (state.iana.subtags.regions.isWellFormed(state.next)) {
            state.parts.region = state.next;
            state.next = state.subtags.shift();
        }
        return succeed(state.parts);
    }

    /**
     * Parses the variant subtag(s) of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the variant subtags if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parseVariants(state: ParserState): Result<LanguageTagParts> {
        // optional variant subtags
        while (state.iana.subtags.variants.isWellFormed(state.next)) {
            if (state.parts.variants === undefined) {
                state.parts.variants = [state.next];
            } else {
                state.parts.variants.push(state.next);
            }
            state.next = state.subtags.shift();
        }
        return succeed(state.parts);
    }

    /**
     * Parses the extension subtag(s) of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the extension subtags if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parseExtensions(state: ParserState): Result<LanguageTagParts> {
        // optional extension subtags
        while (state.next !== undefined && Validate.extensionSingleton.isWellFormed(state.next)) {
            const singleton = state.next;
            const values: ExtensionSubtag[] = [];
            state.next = state.subtags.shift();

            while (Validate.extensionSubtag.isWellFormed(state.next)) {
                values.push(state.next);
                state.next = state.subtags.shift();
            }
            if (
                state.next !== undefined &&
                !Validate.extensionSingleton.isWellFormed(state.next) &&
                !Validate.extensionSingleton.isWellFormed(state.next)
            ) {
                return fail(`${state.next}: malformed extension subtag`);
            } else if (values.length < 1) {
                return fail(`${state.tag}: extension '${singleton}' must have at least one subtag.`);
            }

            const value = values.join('-') as ExtensionSubtag;
            if (state.parts.extensions === undefined) {
                state.parts.extensions = [{ singleton, value }];
            } else {
                state.parts.extensions.push({ singleton, value });
            }
        }
        return succeed(state.parts);
    }

    /**
     * Parses the private use subtags of a supplied language tag.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` with supplied {@link Bcp47.LanguageTagParts | language tag parts}
     * updated to include the private-use subtags if present, or `Failure` with details if an error
     * occurs.
     * @internal
     */
    protected static _parsePrivateSubtags(state: ParserState): Result<LanguageTagParts> {
        // optional private use subtags
        while (state.next != undefined && Validate.privateUsePrefix.isWellFormed(state.next)) {
            const values: string[] = [];
            state.next = state.subtags.shift();

            while (
                state.next &&
                !Validate.privateUsePrefix.isWellFormed(state.next) &&
                Iana.LanguageSubtags.Validate.extendedLanguageRange.isWellFormed(state.next)
            ) {
                values.push(state.next);
                state.next = state.subtags.shift();
            }

            if (state.next !== undefined && !Validate.privateUsePrefix.isWellFormed(state.next)) {
                return fail(`${state.next}: malformed private-use subtag`);
            } else if (values.length < 1) {
                return fail(`${state.tag}: private-use tag must have at least one subtag.`);
            }

            const value = values.join('-') as Iana.LanguageSubtags.ExtendedLanguageRange;
            if (state.parts.privateUse === undefined) {
                state.parts.privateUse = [value];
            } else {
                state.parts.privateUse.push(value);
            }
        }
        return succeed(state.parts);
    }

    /**
     * Verifies {@link Bcp47.ParserState | parser state} at the end of a parse operation.
     * @param state - The {@link Bcp47.ParserState | current state} of the
     * parse operation.
     * @returns `Success` if the tag was fully consumed, or `Failure` with details
     * if unexpected subtags remain to be parsed.
     * @internal
     */
    protected static _parseTagEnd(state: ParserState): Result<LanguageTagParts> {
        if (state.next !== undefined) {
            return fail(`${state.next}: unexpected subtag`);
        }
        return succeed(state.parts);
    }
}
