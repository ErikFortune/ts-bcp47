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

import { LanguageTagParser, applyTransforms, chooseTransforms } from './transforms';
import { LanguageTagParts, languageTagPartsToString } from './common';
import { Result, captureResult, succeed } from '@fgv/ts-utils';
import { TagNormalization, TagStatus, TagValidity, compareNormalization, compareValidity } from './status';

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
    public readonly status: TagStatus;

    protected readonly _iana: Iana.LanguageRegistries;

    protected constructor(parts: LanguageTagParts, status: TagStatus, iana: Iana.LanguageRegistries) {
        this.parts = Object.freeze({ ...parts });
        this.status = Object.freeze({ ...status });
        this.tag = languageTagPartsToString(parts);
        this._iana = iana;
    }

    public get isWellFormed(): boolean {
        return compareValidity(this.status.validity, 'well-formed') >= 0;
    }

    public get isValid(): boolean {
        return compareValidity(this.status.validity, 'valid') >= 0;
    }

    public get isStrictlyValid(): boolean {
        return compareValidity(this.status.validity, 'strictly-valid') >= 0;
    }

    public get isCanonical(): boolean {
        return compareNormalization(this.status.normalization, 'canonical') >= 0;
    }

    public get isPreferred(): boolean {
        return compareNormalization(this.status.normalization, 'preferred') >= 0;
    }

    public static createFromTag(tag: string, partialOptions?: LanguageTagInitOptions): Result<LanguageTag> {
        const options = this._getOptions(partialOptions);
        const fromStatus: TagStatus = { validity: 'unknown', normalization: 'unknown' };

        return LanguageTagParser.parse(tag, options.iana).onSuccess((parts) => {
            return this._createTransformed(parts, fromStatus, options);
        });
    }

    public static createFromParts(parts: LanguageTagParts, options?: LanguageTagInitOptions): Result<LanguageTag> {
        const fromStatus: TagStatus = { validity: 'unknown', normalization: 'unknown' };
        return this._createTransformed(parts, fromStatus, options);
    }

    protected static _createTransformed(
        parts: LanguageTagParts,
        fromStatus: TagStatus,
        partialOptions?: LanguageTagInitOptions
    ): Result<LanguageTag> {
        const options = this._getOptions(partialOptions);
        const transforms = chooseTransforms(options.validity, options.normalization);
        return applyTransforms(parts, fromStatus, transforms).onSuccess((transformed) => {
            return captureResult(() => new LanguageTag(transformed.parts, transformed.status, options.iana));
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
            normalization: this.status.normalization,
        };
        return LanguageTag._createTransformed(this.parts, this.status, options);
    }

    public toStrictlyValid(): Result<LanguageTag> {
        if (this.isStrictlyValid) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: 'strictly-valid',
            normalization: this.status.normalization,
        };
        return LanguageTag._createTransformed(this.parts, this.status, options);
    }

    public toCanonical(): Result<LanguageTag> {
        if (this.isCanonical) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: this.status.validity,
            normalization: 'canonical',
        };
        return LanguageTag._createTransformed(this.parts, this.status, options);
    }

    public toPreferred(): Result<LanguageTag> {
        if (this.isPreferred) {
            return succeed(this);
        }
        const options: LanguageTagInitOptions = {
            iana: this._iana,
            validity: this.status.validity,
            normalization: 'preferred',
        };
        return LanguageTag._createTransformed(this.parts, this.status, options);
    }
}
