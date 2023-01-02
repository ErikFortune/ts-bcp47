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

import { LanguageTagParts, UndeterminedLanguage, languageTagPartsToString } from './common';
import { Result, captureResult, succeed } from '@fgv/ts-utils';
import { TagNormalization, mostNormalized } from './normalization/common';
import { TagValidity, mostValid } from './validation/common';

import { LanguageTagParser } from './languageTagParser';
import { NormalizeTag } from './normalization';
import { ScriptSubtag } from '../iana/language-subtags';
import { ValidateTag } from './validation';

/**
 * @public
 */
export interface LanguageTagInitOptions {
    validity?: TagValidity;
    normalization?: TagNormalization;
    iana?: Iana.LanguageRegistries;
}

/**
 * @public
 */
export class LanguageTag {
    public readonly parts: Readonly<LanguageTagParts>;
    public readonly tag: string;

    /**
     * @internal
     */
    protected readonly _iana: Iana.LanguageRegistries;

    /**
     * @internal
     */
    protected _validity: TagValidity;

    /**
     * @internal
     */
    protected _normalization: TagNormalization;

    /**
     * @internal
     */
    protected _isValid: undefined | boolean;

    /**
     * @internal
     */
    protected _isStrictlyValid: undefined | boolean;

    /**
     * @internal
     */
    protected _isCanonical: undefined | boolean;

    /**
     * @internal
     */
    protected _isPreferred: undefined | boolean;

    /**
     * @internal
     */
    protected _suppressedScript: undefined | ScriptSubtag | false;

    /**
     * Constructs a {@link Bcp47.LanguageTag | LanguageTag }.
     * @param parts - A {@link Bcp47.LanguageTagParts | LanguageTagParts } from
     * which the tag is constructed.
     * @param validity - Known {@link Bcp47.TagValidity | validation level} of the
     * supplied parts.
     * @param normalization - Known {@link Bcp47.TagNormalization | normalization level}
     * of the supplied parts.
     * @param iana - The {@link Iana.LanguageRegistries} used to validate and normalize
     * this tag.
     * @internal
     */
    protected constructor(parts: LanguageTagParts, validity: TagValidity, normalization: TagNormalization, iana: Iana.LanguageRegistries) {
        this.parts = Object.freeze({ ...parts });
        this._normalization = normalization;
        this._validity = validity;
        this.tag = languageTagPartsToString(parts);
        this._iana = iana;

        if (validity === 'strictly-valid') {
            this._isStrictlyValid = true;
            this._isValid = true;
        } else if (validity === 'valid') {
            this._isValid = true;
        }

        if (normalization === 'preferred') {
            this._isPreferred = true;
            this._isCanonical = true;
        } else if (normalization === 'canonical') {
            this._isCanonical = true;
        }
    }

    public get effectiveScript(): ScriptSubtag | undefined {
        return this.parts.script ?? this.getSuppressedScript();
    }

    public get isUndetermined(): boolean {
        // istanbul ignore next
        return this.parts.primaryLanguage?.toLowerCase() === UndeterminedLanguage;
    }

    public get isValid(): boolean {
        if (this._isValid === undefined) {
            this._isValid = ValidateTag.isValid(this.parts);
            if (this._isValid) {
                this._validity = 'valid';
            }
        }
        return this._isValid === true;
    }

    public get isStrictlyValid(): boolean {
        if (this._isStrictlyValid === undefined) {
            this._isStrictlyValid = ValidateTag.isStrictlyValid(this.parts);
            if (this._isStrictlyValid) {
                this._validity = 'strictly-valid';
            }
        }
        return this._isStrictlyValid === true;
    }

    public get isCanonical(): boolean {
        if (this._isCanonical === undefined) {
            this._isCanonical = ValidateTag.isCanonical(this.parts);
            if (this._isCanonical) {
                this._normalization = 'canonical';
            }
        }
        return this._isCanonical === true;
    }

    public get isPreferred(): boolean {
        if (this._isPreferred === undefined) {
            this._isPreferred = ValidateTag.isInPreferredForm(this.parts);
            if (this._isPreferred) {
                this._normalization = 'preferred';
            }
        }
        return this._isPreferred === true;
    }

    public static createFromTag(tag: string, partialOptions?: LanguageTagInitOptions): Result<LanguageTag> {
        const options = this._getOptions(partialOptions);

        return LanguageTagParser.parse(tag, options.iana).onSuccess((parts) => {
            return this._createTransformed(parts, 'unknown', 'unknown', options);
        });
    }

    public static createFromParts(parts: LanguageTagParts, options?: LanguageTagInitOptions): Result<LanguageTag> {
        return this._createTransformed(parts, 'unknown', 'unknown', options);
    }

    public static create(from: string | LanguageTagParts, options?: LanguageTagInitOptions): Result<LanguageTag> {
        if (typeof from === 'string') {
            return this.createFromTag(from, options);
        } else {
            return this.createFromParts(from, options);
        }
    }

    /**
     * Constructs a new {@link Bcp47.LanguageTag | language tag} by applying appropriate transformations
     * to as supplied {@link Bcp47.LanguageTagParts | LanguageTagParts}.
     * @param parts - The {@link Bcp47.LanguageTagParts | LanguageTagParts} which represent the tag.
     * @param fromValidity - The {@link Bcp47.TagValidity | validation level} of the supplied `parts`.
     * @param fromNormalization - The {@link Bcp47.TagNormalization | normalization level} fo the
     * supplied `parts`.
     * @param partialOptions - Any {@link Bcp47.LanguageTagInitOptions | initialization options}.
     * @returns `Success` with the corresponding {@link Bcp47.LanguageTag | language tag} or `Failure`
     * with details if an error occurs.
     * @internal
     */
    protected static _createTransformed(
        parts: LanguageTagParts,
        fromValidity: TagValidity,
        fromNormalization: TagNormalization,
        partialOptions?: LanguageTagInitOptions
    ): Result<LanguageTag> {
        const options = this._getOptions(partialOptions);
        return ValidateTag.validateParts(parts, options.validity, fromValidity)
            .onSuccess(() => {
                return NormalizeTag.normalizeParts(parts, options.normalization, fromNormalization);
            })
            .onSuccess((normalized) => {
                const validity = mostValid(fromValidity, options.validity);
                const normalization = mostNormalized(fromNormalization, options.normalization);
                return captureResult(() => new LanguageTag(normalized, validity, normalization, options.iana));
            });
    }

    /**
     * Gets a fully-specified {@link Bcp47.LanguageTagInitOptions} from partial or undefined
     * options, substituting defaults as appropriate.
     * @param options - The {@link Bcp47.LanguageTagInitOptions} to be expanded, or `undefined`
     * for default options.
     * @returns Fully-specified {@link Bcp47.LanguageTagInitOptions | init options}.
     * @internal
     */
    protected static _getOptions(options?: LanguageTagInitOptions): Required<LanguageTagInitOptions> {
        return {
            iana: options?.iana ?? Iana.DefaultRegistries.languageRegistries,
            validity: options?.validity ?? 'well-formed',
            normalization: options?.normalization ?? 'none',
        };
    }

    public getSuppressedScript(): ScriptSubtag | undefined {
        if (this._suppressedScript === undefined) {
            this._suppressedScript = false;
            if (this.parts.primaryLanguage) {
                const language = this._iana.subtags.languages.tryGet(this.parts.primaryLanguage);
                if (language?.suppressScript !== undefined) {
                    this._suppressedScript = language.suppressScript;
                }
            }
        }
        return this._suppressedScript ? this._suppressedScript : undefined;
    }

    public toValid(): Result<LanguageTag> {
        if (this.isValid) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'valid',
            normalization: this._normalization,
        };
        return LanguageTag._createTransformed(this.parts, this._validity, this._normalization, options);
    }

    public toStrictlyValid(): Result<LanguageTag> {
        if (this.isStrictlyValid) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'strictly-valid',
            normalization: this._normalization,
        };
        return LanguageTag._createTransformed(this.parts, this._validity, this._normalization, options);
    }

    public toCanonical(): Result<LanguageTag> {
        if (this.isCanonical) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: this._validity,
            normalization: 'canonical',
        };
        return LanguageTag._createTransformed(this.parts, this._validity, this._normalization, options);
    }

    public toPreferred(): Result<LanguageTag> {
        if (this.isPreferred) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'valid', // preferred requires validity
            normalization: 'preferred',
        };
        return LanguageTag._createTransformed(this.parts, this._validity, this._normalization, options);
    }

    public toString(): string {
        return this.tag;
    }
}
