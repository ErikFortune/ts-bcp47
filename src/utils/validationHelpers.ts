/*
 * Copyright (c) 2021 Erik Fortune
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

import { Converter, Converters, Result, Validation, fail, succeed } from '@fgv/ts-utils';
import { TypeGuardWithContext } from '@fgv/ts-utils/validation';

/**
 * @internal
 */
export type Normalizer<T extends string, TC = unknown> = (val: T, context?: TC) => Result<T>;

/**
 * @internal
 */
export interface ValidationHelpersConstructorParams<T extends string, TC = unknown> {
    description: string;
    isWellFormed: Validation.TypeGuardWithContext<T, TC>;
    isCanonical: Validation.TypeGuardWithContext<T, TC>;
    toCanonical?: Normalizer<T, TC>;
}

/**
 * @internal
 */
export class ValidationHelpers<T extends string, TC = unknown> {
    public readonly description: string;
    public readonly converter: Converter<T, TC>;
    public readonly isWellFormed: TypeGuardWithContext<T, TC>;
    public readonly isCanonical: TypeGuardWithContext<T, TC>;

    protected readonly _toCanonical?: Normalizer<T, TC>;

    public constructor(init: ValidationHelpersConstructorParams<T, TC>) {
        this.description = init.description;
        this.isWellFormed = init.isWellFormed;
        this.isCanonical = init.isCanonical;
        this._toCanonical = init.toCanonical;
        this.converter = Converters.isA(this.description, this.isWellFormed);
    }

    public toCanonical(from: unknown, context?: TC): Result<T> {
        if (this.isWellFormed(from, context)) {
            if (this._toCanonical) {
                return this._toCanonical(from, context);
            }
            if (this.isCanonical(from, context)) {
                return succeed(from);
            }
            return fail(`cannot convert "${from}" to canonical ${this.description}`);
        }
        return fail(`invalid ${this.description} ("${JSON.stringify(from)}")`);
    }
}

/**
 * @internal
 */
export interface RegExpValidationHelperConstructorParams<T extends string, TC = unknown> {
    description: string;
    wellFormed: RegExp;
    canonical: RegExp;
    toCanonical?: Normalizer<T, TC>;
}

/**
 * @internal
 */
export class RegExpValidationHelpers<T extends string, TC = unknown> extends ValidationHelpers<T, TC> {
    public readonly wellFormed: RegExp;
    public readonly canonical: RegExp;

    public constructor(params: RegExpValidationHelperConstructorParams<T, TC>) {
        super({
            description: params.description,
            toCanonical: params.toCanonical,
            isWellFormed: (from: unknown): from is T => {
                return typeof from === 'string' && this.wellFormed.test(from);
            },
            isCanonical: (from: unknown): from is T => {
                return typeof from === 'string' && this.canonical.test(from);
            },
        });
        this.wellFormed = params.wellFormed;
        this.canonical = params.canonical;
    }
}
