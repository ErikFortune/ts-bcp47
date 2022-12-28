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

import { Result, fail, succeed } from '@fgv/ts-utils';
import { TagNormalization, mostNormalized } from '../normalization/common';
import { TagValidity, mostValid } from '../validation/common';

import { CanonicalNormalizer } from './canonicalNormalizer';
import { LanguageTagParts } from '../common';
import { PreferredTagNormalizer } from './preferredTagNormalizer';
import { StrictTagValidator } from './strictTagValidator';
import { TagTransform } from './tagTransform';
import { TagValidator } from './tagValidator';
import { ValidCanonicalNormalizer } from './validCanonicalNormalizer';
import { WellFormedTagValidator } from './wellFormedValidator';

let wellFormedTransforms: Record<TagNormalization, TagTransform[]> | undefined = undefined;
let validTransforms: Record<TagNormalization, TagTransform[]> | undefined = undefined;
let strictlyValidTransforms: Record<TagNormalization, TagTransform[]> | undefined = undefined;
let transforms: Record<TagValidity, Record<TagNormalization, TagTransform[]>> | undefined = undefined;

export function chooseTransforms(validity: TagValidity, normalization: TagNormalization): TagTransform[] {
    if (!transforms) {
        wellFormedTransforms = {
            unknown: [new WellFormedTagValidator()],
            none: [new WellFormedTagValidator()],
            canonical: [new CanonicalNormalizer()],
            preferred: [new PreferredTagNormalizer()],
        };

        validTransforms = {
            unknown: [new TagValidator()],
            none: [new TagValidator()],
            canonical: [new ValidCanonicalNormalizer()],
            preferred: [new PreferredTagNormalizer()],
        };

        strictlyValidTransforms = {
            unknown: [new StrictTagValidator()],
            none: [new StrictTagValidator()],
            canonical: [new StrictTagValidator(), new CanonicalNormalizer()],
            preferred: [new StrictTagValidator(), new PreferredTagNormalizer()],
        };

        transforms = {
            /* eslint-disable @typescript-eslint/naming-convention */
            unknown: wellFormedTransforms,
            'well-formed': wellFormedTransforms,
            'strictly-valid': strictlyValidTransforms,
            valid: validTransforms,
            /* eslint-enable @typescript-eslint/naming-convention */
        };
    }
    return transforms![validity][normalization];
}

export function applyTransforms(
    parts: LanguageTagParts,
    validity: TagValidity,
    normalization: TagNormalization,
    transforms: TagTransform[]
): Result<{ parts: LanguageTagParts; status: { validity: TagValidity; normalization: TagNormalization } }> {
    let currentParts = parts;
    let currentStatus = { validity, normalization };

    for (const transform of transforms) {
        const result = transform.processParts(currentParts);
        if (result.isFailure()) {
            return fail(result.message);
        }
        currentParts = result.value;
        currentStatus = {
            validity: mostValid(transform.validity, validity),
            normalization: mostNormalized(transform.normalization, normalization),
        };
    }
    return succeed({ parts: currentParts, status: currentStatus });
}
