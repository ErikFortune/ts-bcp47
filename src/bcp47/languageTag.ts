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

import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, captureResult, succeed } from '@fgv/ts-utils';
import { TagNormalization, compareNormalization, mostNormalized } from './normalization/common';
import { TagValidity, compareValidity, mostValid } from './validation/common';

import { LanguageTagParser } from './languageTagParser';
import { NormalizeTag } from './normalization';
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
    public readonly validity: TagValidity;
    public readonly normalization: TagNormalization;

    protected readonly _iana: Iana.LanguageRegistries;

    protected constructor(parts: LanguageTagParts, validity: TagValidity, normalization: TagNormalization, iana: Iana.LanguageRegistries) {
        this.parts = Object.freeze({ ...parts });
        this.normalization = normalization;
        this.validity = validity;
        this.tag = languageTagPartsToString(parts);
        this._iana = iana;
    }

    public get isWellFormed(): boolean {
        return compareValidity(this.validity, 'well-formed') >= 0;
    }

    public get isValid(): boolean {
        return compareValidity(this.validity, 'valid') >= 0;
    }

    public get isStrictlyValid(): boolean {
        return compareValidity(this.validity, 'strictly-valid') >= 0;
    }

    public get isCanonical(): boolean {
        return compareNormalization(this.normalization, 'canonical') >= 0;
    }

    public get isPreferred(): boolean {
        return compareNormalization(this.normalization, 'preferred') >= 0;
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

    protected static _createTransformed(
        parts: LanguageTagParts,
        fromValidity: TagValidity,
        fromNormalization: TagNormalization,
        partialOptions?: LanguageTagInitOptions
    ): Result<LanguageTag> {
        const options = this._getOptions(partialOptions);
        return ValidateTag.checkParts(parts, options.validity, fromValidity)
            .onSuccess(() => {
                return NormalizeTag.processParts(parts, options.normalization, fromNormalization);
            })
            .onSuccess((normalized) => {
                const validity = mostValid(fromValidity, options.validity);
                const normalization = mostNormalized(fromNormalization, options.normalization);
                return captureResult(() => new LanguageTag(normalized, validity, normalization, options.iana));
            });
    }

    protected static _getOptions(options?: LanguageTagInitOptions): Required<LanguageTagInitOptions> {
        return {
            iana: options?.iana ?? Iana.DefaultRegistries.languageRegistries,
            validity: options?.validity ?? 'well-formed',
            normalization: options?.normalization ?? 'none',
        };
    }

    public toValid(): Result<LanguageTag> {
        if (this.isValid) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'valid',
            normalization: this.normalization,
        };
        return LanguageTag._createTransformed(this.parts, this.validity, this.normalization, options);
    }

    public toStrictlyValid(): Result<LanguageTag> {
        if (this.isStrictlyValid) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'strictly-valid',
            normalization: this.normalization,
        };
        return LanguageTag._createTransformed(this.parts, this.validity, this.normalization, options);
    }

    public toCanonical(): Result<LanguageTag> {
        if (this.isCanonical) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: this.validity,
            normalization: 'canonical',
        };
        return LanguageTag._createTransformed(this.parts, this.validity, this.normalization, options);
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
        return LanguageTag._createTransformed(this.parts, this.validity, this.normalization, options);
    }

    public toString(): string {
        return this.tag;
    }
}
